/* Le-QLN — mesure d'audience interne et anonyme (reprise d'Airmony), lue dans la page d'administration.
   - Chaque navigateur tire au hasard un identifiant de visiteur (gardé sur l'appareil, sans cookie) ; le serveur ne garde
     que son empreinte (12 caractères). Pas d'adresse IP, pas de compte, pas de données personnelles.
   - Une ligne par visiteur et par jour : pays (en-tête Cloudflare, sinon région de la langue du navigateur), appareil,
     langue, site d'origine, appli ou navigateur, heures de début et de fin (durée de visite : signe de présence toutes
     les 30 s), pages chargées et étapes franchies (partie lancée, partie finie, compte créé, partie guidée…).
   - Le détail des étapes est gardé 30 jours, les lignes 13 mois. Les administrateurs ne sont pas comptés.
   - Les robots (aucun signe de présence ni interaction, ou outil automatique) sont repérés et retirés des chiffres. */
"use strict";
const crypto = require("crypto");

const SCHEMA = `
create table if not exists qln_visites(
  jour date not null,
  visiteur text not null,
  pays text, appareil text, langue text, source text, natif boolean not null default false, connecte boolean not null default false,
  premiere timestamptz not null default now(), derniere timestamptz not null default now(),
  actif boolean not null default false, pages int not null default 0, etapes jsonb not null default '[]',
  suspect text,
  primary key (jour, visiteur)
);
create index if not exists qln_visites_visiteur on qln_visites(visiteur);
create table if not exists qln_visites_exclus(visiteur text primary key, cree_le timestamptz not null default now());
`;
// étapes reconnues (le reste est ignoré) : nom simple ou nom:détail court
const ETAPE = /^[a-z]{2,16}(:[a-z0-9-]{1,20}){0,2}$/;
const ROBOT_UA = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|uptime|python|curl|wget|go-http|java\/|okhttp|scrapy|axios|node-fetch/i;
// tunnel : du premier passage jusqu'au joueur qui revient
const TUNNEL = [
  ["visite", "Visiteurs"],
  ["partie", "Ont lancé une partie"],
  ["fin", "Ont fini une partie"],
  ["fin:jour", "Ont fini le défi du jour"],
  ["compte:inscription", "Ont créé un compte"],
  ["retour", "Sont revenus un autre jour"],
];

module.exports = function({pool, erreur, limite}){
  const empreinte = v => crypto.createHash("sha256").update("qln:" + v).digest("hex").slice(0, 12);
  const appareil = ua => /ipad|tablet/i.test(ua) ? "tablette" : /mobi|iphone|android/i.test(ua) ? "mobile" : "ordinateur";
  function pays(req, langue){
    const cf = String(req.headers["cf-ipcountry"] || "").toUpperCase();
    if(/^[A-Z]{2}$/.test(cf) && !["XX", "T1"].includes(cf)) return cf;
    const m = /^[a-z]{2,3}-([a-z]{2})\b/i.exec(langue || String(req.headers["accept-language"] || "").split(",")[0].trim());
    return m ? m[1].toUpperCase() : "";
  }
  function source(r){
    try{ const u = new URL(String(r || "")); if(!/^https?:$/.test(u.protocol)) return "";
      const h = u.hostname.replace(/^www\./, "").toLowerCase().slice(0, 60);
      return /(^|\.)github\.io$|onrender\.com$|^localhost$/.test(h) ? "" : h; }catch(e){ return ""; }
  }
  function suspect(req, ua){
    const why = [];
    if(!req.headers["accept-language"]) why.push("sans-langue");
    const cv = /Chrome\/(\d+)/.exec(ua); if(cv && +cv[1] < 110) why.push("ancien");
    return why.join(",");
  }
  const jourUTC = () => new Date().toISOString().slice(0, 10);

  const routes = {
    /* signal envoyé par l'appli : e = page (chargement), etape, ping (présence), act (interaction), bye (départ) */
    async "POST /api/journal"({corps, req, ip, moi}){
      const ua = String(req.headers["user-agent"] || "");
      if(!ua || ROBOT_UA.test(ua)) return {ok:true};
      if(limite("journal:" + ip, 400, 3600e3)) return {ok:true};
      const v = String(corps.v || "");
      if(!/^[a-z0-9]{16,40}$/.test(v)) return {ok:true};
      const h = empreinte(v), jour = jourUTC(), e = String(corps.e || "");
      if(moi && Admin && Admin.estAdmin(moi)){ await pool.query("insert into qln_visites_exclus(visiteur) values($1) on conflict do nothing", [h]); return {ok:true, admin:true}; }
      if(["ping", "act", "bye"].includes(e)){
        await pool.query("update qln_visites set derniere=now(), actif = actif or $3 where jour=$1 and visiteur=$2", [jour, h, e === "act"]);
        return {ok:true};
      }
      const langue = String(corps.l || "").slice(0, 10);
      const etape = e === "etape" && ETAPE.test(String(corps.n || "")) ? String(corps.n) : null;
      if(e !== "page" && !etape) return {ok:true};
      const point = JSON.stringify([[Date.now(), etape || ("page:" + String(corps.n || "site").replace(/[^a-z]/g, "").slice(0, 12))]]);
      await pool.query(`insert into qln_visites(jour, visiteur, pays, appareil, langue, source, natif, connecte, pages, etapes, suspect)
        values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11)
        on conflict (jour, visiteur) do update set derniere=now(), connecte = qln_visites.connecte or $8, pages = qln_visites.pages + $9,
          source = coalesce(nullif(qln_visites.source, ''), $6),
          etapes = case when jsonb_array_length(qln_visites.etapes) < 200 then qln_visites.etapes || $10::jsonb else qln_visites.etapes end`,
        [jour, h, pays(req, langue), appareil(ua), langue, source(corps.r), !!corps.natif, !!moi, etape ? 0 : 1, point, suspect(req, ua)]);
      if(Math.random() < .01){   // ménage : détail des étapes au-delà de 30 jours, lignes au-delà de 13 mois
        pool.query("update qln_visites set etapes='[]' where jour < current_date - 30 and etapes <> '[]'").catch(() => {});
        pool.query("delete from qln_visites where jour < current_date - 395").catch(() => {});
      }
      return {ok:true};
    },
    async "POST /api/admin/exclure"({moi, corps}){
      exiger(moi);
      const v = String(corps.v || ""); if(!/^[a-z0-9]{16,40}$/.test(v)) throw erreur(400, "Identifiant invalide.");
      await pool.query("insert into qln_visites_exclus(visiteur) values($1) on conflict do nothing", [empreinte(v)]);
      return {ok:true};
    },
    /* chiffres de fréquentation : périodes, jour par jour, pays, appareils, sources, langues, durée de visite */
    async "GET /api/admin/visites"({moi}){
      exiger(moi);
      const H = `not exists (select 1 from qln_visites_exclus x where x.visiteur = v.visiteur) and (v.actif or v.derniere > v.premiere + interval '20 seconds')`;
      const periode = async n => (await pool.query(`select count(distinct visiteur)::int visiteurs, coalesce(sum(pages),0)::int pages,
          coalesce(round(avg(extract(epoch from derniere - premiere)))::int, 0) duree,
          coalesce(round(percentile_cont(.5) within group (order by extract(epoch from derniere - premiere)))::int, 0) mediane
        from qln_visites v where jour > current_date - $1::int and ${H}`, [n])).rows[0];
      const [jour, semaine, mois, an] = await Promise.all([1, 7, 30, 365].map(periode));
      const jours = (await pool.query(`with j as (select generate_series(current_date - 59, current_date, interval '1 day')::date d)
        select to_char(j.d, 'YYYY-MM-DD') jour,
          (select count(*)::int from qln_visites v where v.jour = j.d and ${H}) visiteurs,
          (select coalesce(sum(pages),0)::int from qln_visites v where v.jour = j.d and ${H}) pages,
          (select count(*)::int from qln_visites v where v.jour = j.d and ${H} and not exists (select 1 from qln_visites w where w.visiteur = v.visiteur and w.jour < v.jour)) nouveaux
        from j order by j.d`)).rows;
      const repartition = async col => (await pool.query(`select coalesce(nullif(${col}, ''), '?') cle, count(distinct visiteur)::int n from qln_visites v
        where jour > current_date - 30 and ${H} group by 1 order by 2 desc limit 40`)).rows;
      const [paysR, appareils, sources, langues] = await Promise.all(["pays", "appareil", "source", "split_part(langue, '-', 1)"].map(repartition));
      const natif = (await pool.query(`select count(distinct visiteur) filter (where natif)::int appli, count(distinct visiteur) filter (where not natif)::int web,
        count(distinct visiteur) filter (where connecte)::int connectes from qln_visites v where jour > current_date - 30 and ${H}`)).rows[0];
      const robots = (await pool.query(`select count(*)::int n from qln_visites v where jour > current_date - 30 and not (v.actif or v.derniere > v.premiere + interval '20 seconds')`)).rows[0].n;
      const exclus = (await pool.query("select count(*)::int n from qln_visites_exclus")).rows[0].n;
      return {jour, semaine, mois, an, jours, pays:paysR, appareils, sources, langues, natif, robots, exclus};
    },
    /* journal d'un jour : une ligne par visiteur (sans adresse IP), heures, durée, pages et étapes */
    async "GET /api/admin/journal"({moi, query}){
      exiger(moi);
      const jour = /^\d{4}-\d{2}-\d{2}$/.test(String(query.jour || "")) ? query.jour : jourUTC();
      const {rows} = await pool.query(`select visiteur, pays, appareil, langue, source, natif, connecte, premiere, derniere, actif, pages, etapes, suspect,
          (select count(*)::int from qln_visites w where w.visiteur = v.visiteur and w.jour < v.jour) jours_avant
        from qln_visites v where jour = $1 and not exists (select 1 from qln_visites_exclus x where x.visiteur = v.visiteur)
        order by derniere desc limit 1000`, [jour]);
      const lignes = rows.map(r => ({...r, duree:Math.max(0, Math.round((new Date(r.derniere) - new Date(r.premiere))/1000)),
        robot:!r.actif && new Date(r.derniere) - new Date(r.premiere) < 20000 && !r.connecte}));
      return {jour, visiteurs:lignes.length, humains:lignes.filter(x => !x.robot).length, lignes};
    },
    /* tunnel : combien de visiteurs franchissent chaque étape sur la période ; partie guidée ; retours */
    async "GET /api/admin/tunnel"({moi, query}){
      exiger(moi);
      const n = Math.max(1, Math.min(90, +query.jours || 30));
      const {rows} = await pool.query(`select visiteur, min(jour) premier, count(distinct jour)::int jours, jsonb_agg(etapes) etapes
        from qln_visites v where jour > current_date - $1::int and not exists (select 1 from qln_visites_exclus x where x.visiteur = v.visiteur)
          and (v.actif or v.derniere > v.premiere + interval '20 seconds')
        group by visiteur`, [n]);
      const compte = Object.fromEntries(TUNNEL.map(([k]) => [k, 0]));
      const tuto = {debut:0, fin:0, arrets:{}}, modes = {}, autres = {};
      for(const r of rows){
        const noms = new Set(); for(const l of r.etapes || []) for(const p of l || []) if(Array.isArray(p) && typeof p[1] === "string") noms.add(p[1]);
        compte.visite++;
        if([...noms].some(x => x.startsWith("partie:"))) compte.partie++;
        if([...noms].some(x => x.startsWith("fin:"))) compte.fin++;
        if(noms.has("fin:jour")) compte["fin:jour"]++;
        if(noms.has("compte:inscription")) compte["compte:inscription"]++;
        if(r.jours >= 2) compte.retour++;
        for(const x of noms){
          if(x.startsWith("partie:")) modes[x.slice(7)] = (modes[x.slice(7)] || 0) + 1;
          else if(x === "tuto:debut") tuto.debut++;
          else if(x === "tuto:fin") tuto.fin++;
          else if(x.startsWith("tuto:stop")){ const k = x.slice(9) || "?"; tuto.arrets[k] = (tuto.arrets[k] || 0) + 1; }
          else if(!x.startsWith("page:") && !x.startsWith("fin:")) autres[x] = (autres[x] || 0) + 1;
        }
      }
      const r = await pool.query(`select count(*)::int nouveaux, count(*) filter (where revenu)::int revenus from (
          select visiteur, min(jour) premier, count(distinct jour) > 1 revenu from qln_visites v
          where not exists (select 1 from qln_visites_exclus x where x.visiteur = v.visiteur) group by visiteur) t where premier > current_date - $1::int`, [n]);
      return {jours:n, etapes:TUNNEL.map(([k, l]) => ({cle:k, libelle:l, n:compte[k]})), modes, tuto, autres, retours:r.rows[0]};
    },
  };
  let Admin = null;
  const exiger = m => { if(!Admin || !Admin.estAdmin(m)) throw erreur(403, "Accès réservé à l'administrateur."); };
  return {routes, publiques:["POST /api/journal"], schema:SCHEMA, brancherAdmin:a => { Admin = a; }};
};
