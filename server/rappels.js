/* Le-QLN — rappels par notification (navigateur et appli installée sur l'écran d'accueil : Web Push).
   - Les clés VAPID (identité du serveur auprès des services de notification) sont créées au premier démarrage et
     gardées dans la base (table qln_config) : aucune clé à fabriquer ni à recopier.
   - Chaque abonnement garde ses choix : rappel du défi du jour (chaque jour) et du défi de la semaine (le lundi),
     l'heure choisie et le décalage horaire de l'appareil. Toutes les 5 minutes, le serveur envoie ceux qui sont dus.
   - Le service gratuit de Render s'endort : le réveil horaire de GitHub (« Surveillance du serveur ») et UptimeRobot
     le gardent assez éveillé pour que les rappels partent dans l'heure. Les applis Android/iOS programment leurs
     rappels sur le téléphone (notifications locales), sans passer par ce serveur. */
"use strict";
let webpush = null; try{ webpush = require("web-push"); }catch(e){ console.warn("[rappels] module web-push absent : rappels désactivés."); }

const SCHEMA = `
create table if not exists qln_config(cle text primary key, valeur jsonb not null);
create table if not exists qln_push(
  id bigserial primary key,
  endpoint text unique not null,
  cles jsonb not null,
  langue text not null default 'fr',
  joueur uuid references qln_joueurs(id) on delete set null,
  jour boolean not null default true,
  semaine boolean not null default true,
  heure int not null default 18,
  decalage int not null default 0,
  dernier_jour date,
  derniere_semaine date,
  echecs int not null default 0,
  cree_le timestamptz not null default now(),
  maj_le timestamptz not null default now()
);
`;
const TEXTES = {
  fr:{jourT:"Les cartes du jour sont prêtes 🃏", jour:"Défi du jour et Duel de l'ombre vous attendent. Gardez votre série !",
      semT:"Nouveau défi de la semaine 🏆", sem:"Un nouveau défi commence : un seul essai classé. Bonne chance !",
      testT:"Rappels activés ✓", test:"Vous recevrez ici les rappels de Le-QLN."},
  en:{jourT:"Today's cards are ready 🃏", jour:"Daily challenge and Shadow duel are waiting. Keep your streak!",
      semT:"New weekly challenge 🏆", sem:"A new challenge begins: one ranked attempt. Good luck!",
      testT:"Reminders on ✓", test:"Le-QLN reminders will show up here."},
};
const SITE = "https://kiki78test.github.io/Le-QLN/";

module.exports = function({pool, erreur, limite}){
  let pret = false, cle = null;
  async function demarrer(){
    if(!webpush) return;
    let {rows:[c]} = await pool.query("select valeur from qln_config where cle='vapid'");
    if(!c){
      const v = webpush.generateVAPIDKeys();
      await pool.query("insert into qln_config(cle, valeur) values('vapid', $1) on conflict (cle) do nothing", [v]);
      ({rows:[c]} = await pool.query("select valeur from qln_config where cle='vapid'"));
    }
    webpush.setVapidDetails(SITE, c.valeur.publicKey, c.valeur.privateKey);
    cle = c.valeur.publicKey; pret = true;
    setTimeout(tour, 15e3).unref();
    setInterval(tour, 5*60e3).unref();
  }
  async function envoyer(ab, titre, texte, tag){
    const lien = SITE + (ab.langue === "en" ? "en/" : "");
    try{
      await webpush.sendNotification({endpoint:ab.endpoint, keys:ab.cles}, JSON.stringify({titre, texte, tag, url:lien}), {TTL:6*3600, urgency:"normal"});
      if(ab.echecs) await pool.query("update qln_push set echecs=0 where id=$1", [ab.id]);
      return true;
    }catch(e){
      // abonnement expiré ou retiré par l'utilisateur : on l'oublie
      if(e.statusCode === 404 || e.statusCode === 410 || ab.echecs >= 5) await pool.query("delete from qln_push where id=$1", [ab.id]);
      else await pool.query("update qln_push set echecs=echecs+1 where id=$1", [ab.id]);
      return false;
    }
  }
  // jour local (AAAA-MM-JJ), heure et jour de la semaine (1 = lundi) d'un abonné
  const local = (ab, t = Date.now()) => { const d = new Date(t - ab.decalage*60e3); return {date:d.toISOString().slice(0,10), h:d.getUTCHours(), js:(d.getUTCDay() + 6) % 7 + 1}; };
  let enCours = false;
  async function tour(){
    if(!pret || enCours) return; enCours = true;
    try{
      const {rows} = await pool.query("select * from qln_push where jour or semaine");
      for(const ab of rows){
        const l = local(ab), T = TEXTES[ab.langue] || TEXTES.fr;
        if(l.h < ab.heure || l.h >= 22) continue;                                   // jamais avant l'heure choisie, ni tard le soir
        const semaineDue = ab.semaine && l.js === 1 && String(ab.derniere_semaine || "").slice(0,10) !== l.date;
        const jourDu = ab.jour && String(ab.dernier_jour || "").slice(0,10) !== l.date;
        if(!semaineDue && !jourDu) continue;
        // le lundi, un seul message (défi de la semaine) compte aussi pour le rappel du jour
        const ok = semaineDue ? await envoyer(ab, T.semT, T.sem, "qln-semaine") : await envoyer(ab, T.jourT, T.jour, "qln-jour");
        if(ok) await pool.query("update qln_push set dernier_jour=$2::date, derniere_semaine=case when $3 then $2::date else derniere_semaine end where id=$1", [ab.id, l.date, semaineDue]);
      }
    }catch(e){ console.error("[rappels]", e.message); }
    finally{ enCours = false; }
  }
  const routes = {
    async "GET /api/rappels/cle"(){ if(!pret) throw erreur(503, "Rappels indisponibles."); return {cle}; },
    async "POST /api/rappels/abonner"({corps, ip, moi}){
      if(!pret) throw erreur(503, "Rappels indisponibles.");
      if(limite("push:" + ip, 30, 3600e3)) throw erreur(429, "Trop de demandes.");
      const a = corps.abonnement || {};
      const endpoint = String(a.endpoint || "");
      if(!/^https:\/\/[^\s]{10,800}$/.test(endpoint) || !a.keys || typeof a.keys.p256dh !== "string" || typeof a.keys.auth !== "string") throw erreur(400, "Abonnement invalide.");
      const cles = {p256dh:a.keys.p256dh.slice(0, 200), auth:a.keys.auth.slice(0, 100)};
      const langue = corps.langue === "en" ? "en" : "fr";
      const heure = Math.max(7, Math.min(21, Math.round(+corps.heure) || 18)), decalage = Math.max(-900, Math.min(900, Math.round(+corps.decalage) || 0));
      const jour = corps.jour !== false, semaine = corps.semaine !== false;
      const {rows:[r]} = await pool.query(`insert into qln_push(endpoint, cles, langue, joueur, jour, semaine, heure, decalage) values($1,$2,$3,$4,$5,$6,$7,$8)
        on conflict (endpoint) do update set cles=$2, langue=$3, joueur=coalesce($4, qln_push.joueur), jour=$5, semaine=$6, heure=$7, decalage=$8, maj_le=now(), echecs=0
        returning (xmax = 0) nouveau, id`, [endpoint, cles, langue, moi ? moi.id : null, jour, semaine, heure, decalage]);
      // premier abonnement : petit message de confirmation (montre que tout fonctionne)
      if(r.nouveau && corps.confirmer !== false){ const T = TEXTES[langue]; envoyer({id:r.id, endpoint, cles, langue, echecs:0}, T.testT, T.test, "qln-test"); }
      return {ok:true};
    },
    async "POST /api/rappels/desabonner"({corps}){
      await pool.query("delete from qln_push where endpoint=$1", [String(corps.endpoint || "")]);
      return {ok:true};
    },
  };
  return {
    routes, publiques:["GET /api/rappels/cle", "POST /api/rappels/abonner", "POST /api/rappels/desabonner"], schema:SCHEMA, demarrer, tour,
    async resume(){
      const {rows:[r]} = await pool.query("select count(*)::int abonnes, count(*) filter (where jour)::int jour, count(*) filter (where semaine)::int semaine, count(*) filter (where langue='en')::int anglais from qln_push");
      return {...r, actif:pret};
    },
    async tester(joueur){
      const {rows} = await pool.query("select * from qln_push where joueur=$1", [joueur]);
      let n = 0; for(const ab of rows){ const T = TEXTES[ab.langue] || TEXTES.fr; if(await envoyer(ab, T.testT, T.test, "qln-test")) n++; }
      return {envoyes:n, abonnements:rows.length};
    },
  };
};
