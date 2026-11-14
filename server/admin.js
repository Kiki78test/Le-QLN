/* Le-QLN — remontée des erreurs de l'appli et page d'administration (app/admin.html).
   - POST /api/log : chaque erreur JavaScript rencontrée par un joueur (une fois par session et par message) est
     enregistrée, regroupée par empreinte (même message, même fichier, même ligne, même version) avec un compteur.
   - /api/admin/… : réservé aux comptes dont l'adresse figure dans ADMIN_EMAILS (variable Render, adresses séparées
     par des virgules). Statistiques, erreurs, joueurs, mots ajoutés après contestation, test des rappels. */
"use strict";
const crypto = require("crypto");

const ADMINS = () => (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
const estAdmin = j => !!(j && j.email && ADMINS().includes(String(j.email).toLowerCase()));
const DEMARRE = Date.now();

const SCHEMA = `
create table if not exists qln_erreurs(
  id bigserial primary key,
  empreinte text unique not null,
  message text not null,
  source text, ligne int, pile text, version text, ecran text, langue text, natif boolean, agent text,
  nombre int not null default 1,
  premiere timestamptz not null default now(),
  derniere timestamptz not null default now()
);
create index if not exists qln_erreurs_derniere on qln_erreurs(derniere desc);
`;

module.exports = function({pool, erreur, limite, etatRelais, rappels}){
  const t = (v, n) => String(v == null ? "" : v).replace(/[\u0000-\u0008\u000b-\u001f]/g, "").slice(0, n);
  const exigerAdmin = moi => { if(!estAdmin(moi)) throw erreur(403, "Accès réservé à l'administrateur."); };
  const routes = {
    async "POST /api/log"({corps, ip}){
      if(limite("log:" + ip, 40, 3600e3)) return {ok:false};
      const message = t(corps.message, 400).trim(); if(!message) return {ok:false};
      const source = t(corps.source, 200), ligne = Number.isInteger(+corps.ligne) ? +corps.ligne : null, version = t(corps.version, 30);
      const empreinte = crypto.createHash("sha1").update([message, source.replace(/\?.*$/, ""), ligne, version].join("|")).digest("hex");
      await pool.query(`insert into qln_erreurs(empreinte, message, source, ligne, pile, version, ecran, langue, natif, agent)
        values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        on conflict (empreinte) do update set nombre = qln_erreurs.nombre + 1, derniere = now(), pile = coalesce(excluded.pile, qln_erreurs.pile)`,
        [empreinte, message, source, ligne, t(corps.pile, 2000) || null, version, t(corps.ecran, 40), t(corps.langue, 2), !!corps.natif, t(corps.agent, 200)]);
      // on garde les 1 000 erreurs les plus récentes
      if(Math.random() < .05) await pool.query("delete from qln_erreurs where id in (select id from qln_erreurs order by derniere desc offset 1000)");
      return {ok:true};
    },
    async "GET /api/admin/resume"({moi}){
      exigerAdmin(moi);
      const q = async (sql, p = []) => (await pool.query(sql, p)).rows[0];
      const [joueurs, scores, mots, erreurs, parrains, base] = await Promise.all([
        q(`select count(*)::int total,
             count(*) filter (where cree_le > now() - interval '1 day')::int nouveaux_24h,
             count(*) filter (where cree_le > now() - interval '7 days')::int nouveaux_7j,
             count(*) filter (where vu_le > now() - interval '1 day')::int actifs_24h,
             count(*) filter (where vu_le > now() - interval '7 days')::int actifs_7j,
             count(*) filter (where vu_le > now() - interval '30 days')::int actifs_30j,
             count(*) filter (where google_sub is not null)::int google
           from qln_joueurs`),
        q(`select count(*) filter (where cree_le > now() - interval '1 day')::int scores_24h,
             count(*) filter (where cree_le > now() - interval '7 days')::int scores_7j,
             count(*) filter (where mode='jour' and jour = current_date)::int jour_aujourdhui,
             count(*) filter (where mode='defi' and cree_le > now() - interval '7 days')::int defi_7j,
             count(*) filter (where mode='braquage' and cree_le > now() - interval '7 days')::int braquage_7j,
             count(*) filter (where mode='festival' and cree_le > now() - interval '7 days')::int festival_7j
           from qln_scores`),
        q("select count(*)::int total, count(*) filter (where cree_le > now() - interval '7 days')::int recents from qln_mots"),
        q("select count(*)::int distinctes, coalesce(sum(nombre),0)::int total, count(*) filter (where derniere > now() - interval '1 day')::int recentes from qln_erreurs"),
        q("select count(*)::int filleuls, count(distinct parrain)::int parrains from qln_joueurs where parrain is not null"),
        q("select pg_database_size(current_database())::bigint taille"),
      ]);
      const pays = (await pool.query("select coalesce(pays,'—') pays, count(*)::int n from qln_joueurs group by 1 order by 2 desc limit 8")).rows;
      let visites = null;
      try{ visites = (await pool.query(`select count(distinct visiteur) filter (where jour = current_date)::int aujourdhui, count(distinct visiteur)::int semaine,
          coalesce(round(avg(extract(epoch from derniere - premiere)))::int, 0) duree from qln_visites v
          where jour > current_date - 7 and (actif or derniere > premiere + interval '20 seconds') and not exists (select 1 from qln_visites_exclus x where x.visiteur = v.visiteur)`)).rows[0]; }catch(e){}
      return {joueurs, scores, mots, erreurs, parrainage:parrains, pays, visites, rappels: rappels ? await rappels.resume() : null,
        serveur:{depuis:DEMARRE, memoire:Math.round(process.memoryUsage().rss/1048576), node:process.version, base:+base.taille, ...(etatRelais ? etatRelais() : {})}};
    },
    async "GET /api/admin/activite"({moi}){
      exigerAdmin(moi);
      const {rows} = await pool.query(`
        with jours as (select generate_series(current_date - 29, current_date, interval '1 day')::date j)
        select to_char(j.j, 'YYYY-MM-DD') jour,
          (select count(*)::int from qln_joueurs where cree_le::date = j.j) inscriptions,
          (select count(*)::int from qln_joueurs where vu_le::date = j.j) vus,
          (select count(*)::int from qln_scores where cree_le::date = j.j) scores
        from jours j order by j.j`);
      return {jours: rows};
    },
    async "GET /api/admin/erreurs"({moi, query}){
      exigerAdmin(moi);
      const n = Math.max(10, Math.min(500, +query.limite || 100));
      const {rows} = await pool.query("select id, message, source, ligne, pile, version, ecran, langue, natif, agent, nombre, premiere, derniere from qln_erreurs order by derniere desc limit $1", [n]);
      return {erreurs: rows};
    },
    async "DELETE /api/admin/erreurs"({moi, query}){
      exigerAdmin(moi);
      if(query.id) await pool.query("delete from qln_erreurs where id=$1", [+query.id || 0]);
      else await pool.query("delete from qln_erreurs");
      return {ok:true};
    },
    async "GET /api/admin/joueurs"({moi, query}){
      exigerAdmin(moi);
      const r = String(query.q || "").trim().slice(0, 60);
      const {rows} = await pool.query(`
        select j.id, j.pseudo, j.email, j.pays, j.cree_le, j.vu_le, (j.google_sub is not null) google, pa.pseudo parrain,
          greatest(coalesce((p.donnees->'fr'->>'xp')::int, 0), coalesce((p.donnees->'en'->>'xp')::int, 0)) xp,
          (select count(*)::int from qln_scores s where s.joueur = j.id) scores
        from qln_joueurs j left join qln_progression p on p.joueur = j.id left join qln_joueurs pa on pa.id = j.parrain
        where $1 = '' or j.pseudo ilike '%'||$1||'%' or j.email ilike '%'||$1||'%'
        order by j.vu_le desc limit 100`, [r]);
      return {joueurs: rows};
    },
    async "GET /api/admin/mots"({moi}){
      exigerAdmin(moi);
      const {rows} = await pool.query("select m.id, m.langue, m.mot, m.nature, m.cree_le, j.pseudo from qln_mots m left join qln_joueurs j on j.id = m.joueur order by m.id desc limit 300");
      return {mots: rows};
    },
    async "DELETE /api/admin/mots"({moi, query}){
      exigerAdmin(moi);
      await pool.query("delete from qln_mots where id=$1", [+query.id || 0]);
      return {ok:true};
    },
    async "POST /api/admin/rappel-test"({moi}){
      exigerAdmin(moi);
      if(!rappels) throw erreur(501, "Rappels indisponibles.");
      return rappels.tester(moi.id);
    },
  };
  return {routes, publiques:["POST /api/log"], schema:SCHEMA, estAdmin};
};
