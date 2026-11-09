/* Le-QLN — API comptes, progression et classements (Node + PostgreSQL)
   Activée si la variable DATABASE_URL est définie (sinon le serveur reste un simple relais multijoueur).
   Variables d'environnement :
     DATABASE_URL     chaîne de connexion PostgreSQL (Render : « Internal Database URL »)
     SECRET           clé secrète pour signer les jetons de session (longue chaîne aléatoire)
     GOOGLE_CLIENT_ID (facultatif) identifiant OAuth « Web » pour la connexion Google
     ORIGINES         origines autorisées, séparées par des virgules (ex. https://kiki78test.github.io)
   Toutes les routes sont sous /api ; réponses JSON. */
"use strict";
const crypto = require("crypto");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const SECRET = process.env.SECRET || crypto.randomBytes(32).toString("hex");
if(!process.env.SECRET) console.warn("[api] SECRET non défini : les sessions seront perdues au redémarrage.");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const SSL = /render\.com|amazonaws|neon\.tech|supabase/.test(process.env.DATABASE_URL || "") ? {rejectUnauthorized:false} : false;
const pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: SSL, max: 5});

/* ---------- Schéma (créé / complété au démarrage) ---------- */
const SCHEMA = `
create table if not exists qln_joueurs(
  id uuid primary key default gen_random_uuid(),
  email text unique,
  mdp text,
  google_sub text unique,
  pseudo text not null,
  couleur int not null default 0,
  pays text,
  cree_le timestamptz not null default now(),
  vu_le timestamptz not null default now()
);
create table if not exists qln_progression(
  joueur uuid primary key references qln_joueurs(id) on delete cascade,
  donnees jsonb not null default '{}'::jsonb,
  maj_le timestamptz not null default now()
);
create table if not exists qln_scores(
  id bigserial primary key,
  joueur uuid not null references qln_joueurs(id) on delete cascade,
  langue text not null,
  mode text not null,
  jour date,
  score int not null,
  detail jsonb,
  cree_le timestamptz not null default now()
);
create unique index if not exists qln_scores_jour_unique on qln_scores(joueur, langue, mode, jour) where jour is not null;
create index if not exists qln_scores_classement on qln_scores(langue, mode, jour, score desc);
create table if not exists qln_mots(
  id bigserial primary key,
  langue text not null,
  mot text not null,
  nature text,
  joueur uuid references qln_joueurs(id) on delete set null,
  cree_le timestamptz not null default now(),
  unique(langue, mot)
);
`;
async function initialiser(){
  // la base peut démarrer après le service (Render) : on réessaie jusqu'à ce qu'elle réponde
  for(let essai = 1; ; essai++){
    try{ await pool.query("create extension if not exists pgcrypto"); await pool.query(SCHEMA); console.log("[api] base prête"); return; }
    catch(e){ console.error(`[api] base injoignable (essai ${essai}) : ${e.message}`); await new Promise(r => setTimeout(r, Math.min(30000, 2000*essai))); }
  }
}

/* ---------- Jetons de session : charge utile signée HMAC (sans dépendance) ---------- */
const b64 = s => Buffer.from(s).toString("base64url");
function signer(id){ const corps = b64(JSON.stringify({id, exp: Date.now() + 90*864e5})); return corps + "." + crypto.createHmac("sha256", SECRET).update(corps).digest("base64url"); }
function verifier(jeton){
  if(!jeton || !jeton.includes(".")) return null;
  const [corps, sig] = jeton.split(".");
  const attendu = crypto.createHmac("sha256", SECRET).update(corps).digest("base64url");
  if(sig.length !== attendu.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(attendu))) return null;
  try{ const d = JSON.parse(Buffer.from(corps, "base64url").toString()); return d.exp > Date.now() ? d.id : null; }catch(e){ return null; }
}

/* ---------- Limitation de débit (mémoire) ---------- */
const compteurs = new Map();
function limite(cle, max, fenetreMs){
  const t = Date.now(), e = compteurs.get(cle) || {n:0, t};
  if(t - e.t > fenetreMs){ e.n = 0; e.t = t; }
  e.n++; compteurs.set(cle, e);
  return e.n > max;
}
setInterval(() => { const t = Date.now(); for(const [k,e] of compteurs) if(t - e.t > 3600e3) compteurs.delete(k); }, 600e3).unref();

/* ---------- Validation ---------- */
const PAYS = /^[A-Z]{2}$/;
const nettoiePseudo = p => String(p || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 14);
const emailValide = e => /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(e);
const MODES = {jour:{max:20000}, defi:{max:20000}, braquage:{max:400}, festival:{max:20000}};
const LANGUES = new Set(["fr", "en"]);
const public_ = j => ({id:j.id, pseudo:j.pseudo, couleur:j.couleur, pays:j.pays, email:j.email || null, google:!!j.google_sub});

/* ---------- Fusion de progression (deux appareils) : on garde le meilleur de chaque côté ---------- */
function fusionner(a = {}, b = {}){
  const r = {...a, ...b};
  r.xp = Math.max(a.xp || 0, b.xp || 0);
  r.serieMax = Math.max(a.serieMax || 0, b.serieMax || 0);
  if((a.dernierJour || 0) > (b.dernierJour || 0)){ r.dernierJour = a.dernierJour; r.serie = a.serie; } else { r.dernierJour = b.dernierJour; r.serie = b.serie; }
  r.succes = {...(a.succes || {}), ...(b.succes || {})};
  if(a.tuto === "fait" || b.tuto === "fait") r.tuto = "fait";
  const sa = a.st || {}, sb = b.st || {}, st = {};
  for(const k of new Set([...Object.keys(sa), ...Object.keys(sb)])){
    const x = sa[k], y = sb[k];
    if(typeof x === "number" || typeof y === "number") st[k] = Math.max(x || 0, y || 0);
    else if(k === "cartes"){ st.cartes = {}; for(const n of ["v","b","r","n"]){ const p = (x||{})[n] || [0,0], q = (y||{})[n] || [0,0]; st.cartes[n] = p[0] >= q[0] ? p : q; } }
    else if(k === "temps"){ st.temps = {...(x||{})}; for(const [n,v] of Object.entries(y||{})) st.temps[n] = st.temps[n] ? Math.min(st.temps[n], v) : v; }
    else st[k] = y ?? x;
  }
  r.st = st;
  return r;
}

/* ---------- Mots contestés : vérification côté serveur (mêmes règles que l'appli, analyse.js) ---------- */
let AnalyseMot = null;
for(const chemin of ["../analyse.js", "../app/analyse.js"]){ try{ AnalyseMot = require(chemin); break; }catch(e){} }
const WIKI = {fr:"https://fr.wiktionary.org/w/api.php", en:"https://en.wiktionary.org/w/api.php"};
const ACCENTS = {e:["é","è","ê"], a:["à","â"], i:["î","ï"], o:["ô"], u:["û","ù"], c:["ç"]};
const sansAccent = x => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
async function wiki(langue, params){
  const r = await fetch(WIKI[langue] + "?" + new URLSearchParams({format:"json", formatversion:"2", ...params}), {headers:{"User-Agent":"Le-QLN/1.0 (jeu d'anagrammes)"}});
  if(!r.ok) throw new Error("Wiktionnaire HTTP " + r.status);
  return r.json();
}
async function pages(langue, titres){
  const j = await wiki(langue, {action:"query", prop:"revisions", rvprop:"content", rvslots:"main", redirects:"1", titles:titres.slice(0, 50).join("|")});
  const out = {};
  for(const pg of (j.query && j.query.pages) || []) if(!pg.missing && pg.revisions) out[pg.title] = pg.revisions[0].slots.main.content;
  return out;
}
async function verifierMot(mot, langue){
  const m = mot.toLowerCase();
  const essais = [m];
  if(langue === "fr"){
    const pos = [...m].map((ch, i) => ACCENTS[ch] ? i : -1).filter(i => i >= 0);
    for(const i of pos) for(const a of ACCENTS[m[i]]) essais.push(m.slice(0,i) + a + m.slice(i+1));
    for(const i of pos) for(const k of pos) if(k > i) for(const a of ACCENTS[m[i]].slice(0,2)) for(const b of ACCENTS[m[k]].slice(0,2)) essais.push(m.slice(0,i) + a + m.slice(i+1,k) + b + m.slice(k+1));
  }
  const trouves = await pages(langue, [...new Set(essais)]);
  for(const t of essais) if(trouves[t]){ const v = AnalyseMot.analyserWikitexte(trouves[t], langue); if(v.ok) return {...v, titre:t}; return {...v, titre:t}; }
  return {ok:false, raison:"introuvable"};
}

/* ---------- Routeur ---------- */
async function lireCorps(req){
  return new Promise((ok, ko) => {
    let n = 0, morceaux = [];
    req.on("data", c => { n += c.length; if(n > 64e3){ ko(Object.assign(new Error("trop gros"), {code:413})); req.destroy(); } else morceaux.push(c); });
    req.on("end", () => { if(!morceaux.length) return ok({}); try{ ok(JSON.parse(Buffer.concat(morceaux).toString())); }catch(e){ ko(Object.assign(new Error("JSON invalide"), {code:400})); } });
    req.on("error", ko);
  });
}
const erreur = (code, message) => Object.assign(new Error(message), {code});

const ROUTES = {
  async "POST /api/inscription"({corps, ip}){
    if(limite("insc:"+ip, 10, 3600e3)) throw erreur(429, "Trop de tentatives, réessayez plus tard.");
    const email = String(corps.email || "").trim().toLowerCase(), mdp = String(corps.mdp || ""), pseudo = nettoiePseudo(corps.pseudo);
    if(!emailValide(email)) throw erreur(400, "Adresse e-mail invalide.");
    if(mdp.length < 8) throw erreur(400, "Le mot de passe doit faire au moins 8 caractères.");
    if(pseudo.length < 2) throw erreur(400, "Le pseudo doit faire au moins 2 caractères.");
    const pays = PAYS.test(corps.pays || "") ? corps.pays : null, couleur = Math.max(0, Math.min(5, +corps.couleur || 0));
    const h = await bcrypt.hash(mdp, 10);
    try{
      const {rows:[j]} = await pool.query("insert into qln_joueurs(email, mdp, pseudo, couleur, pays) values($1,$2,$3,$4,$5) returning *", [email, h, pseudo, couleur, pays]);
      return {jeton:signer(j.id), joueur:public_(j)};
    }catch(e){ if(e.code === "23505") throw erreur(409, "Un compte existe déjà avec cette adresse."); throw e; }
  },
  async "POST /api/connexion"({corps, ip}){
    if(limite("cnx:"+ip, 20, 900e3)) throw erreur(429, "Trop de tentatives, réessayez dans quelques minutes.");
    const email = String(corps.email || "").trim().toLowerCase();
    const {rows:[j]} = await pool.query("select * from qln_joueurs where email=$1", [email]);
    if(!j || !j.mdp || !(await bcrypt.compare(String(corps.mdp || ""), j.mdp))) throw erreur(401, "E-mail ou mot de passe incorrect.");
    await pool.query("update qln_joueurs set vu_le=now() where id=$1", [j.id]);
    return {jeton:signer(j.id), joueur:public_(j)};
  },
  async "POST /api/google"({corps, ip}){
    if(!GOOGLE_CLIENT_ID) throw erreur(501, "Connexion Google non configurée.");
    if(limite("ggl:"+ip, 30, 900e3)) throw erreur(429, "Trop de tentatives.");
    const r = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(String(corps.credential || "")));
    const g = await r.json().catch(() => ({}));
    if(!r.ok || g.aud !== GOOGLE_CLIENT_ID || !g.sub || !["accounts.google.com","https://accounts.google.com"].includes(g.iss)) throw erreur(401, "Connexion Google refusée.");
    const email = g.email_verified === "true" || g.email_verified === true ? String(g.email).toLowerCase() : null;
    let {rows:[j]} = await pool.query("select * from qln_joueurs where google_sub=$1 or ($2::text is not null and email=$2) order by google_sub nulls last limit 1", [g.sub, email]);
    if(j && !j.google_sub) ({rows:[j]} = await pool.query("update qln_joueurs set google_sub=$1 where id=$2 returning *", [g.sub, j.id]));
    if(!j) ({rows:[j]} = await pool.query("insert into qln_joueurs(email, google_sub, pseudo, pays) values($1,$2,$3,$4) returning *",
      [email, g.sub, nettoiePseudo(corps.pseudo || g.given_name || "Joueur"), PAYS.test(corps.pays || "") ? corps.pays : null]));
    return {jeton:signer(j.id), joueur:public_(j)};
  },
  async "GET /api/moi"({moi}){ return {joueur:public_(moi)}; },
  async "PATCH /api/moi"({moi, corps}){
    const pseudo = corps.pseudo != null ? nettoiePseudo(corps.pseudo) : moi.pseudo;
    if(pseudo.length < 2) throw erreur(400, "Le pseudo doit faire au moins 2 caractères.");
    const couleur = corps.couleur != null ? Math.max(0, Math.min(5, +corps.couleur || 0)) : moi.couleur;
    const pays = corps.pays === null ? null : (PAYS.test(corps.pays || "") ? corps.pays : moi.pays);
    const {rows:[j]} = await pool.query("update qln_joueurs set pseudo=$1, couleur=$2, pays=$3 where id=$4 returning *", [pseudo, couleur, pays, moi.id]);
    return {joueur:public_(j)};
  },
  async "DELETE /api/moi"({moi}){ await pool.query("delete from qln_joueurs where id=$1", [moi.id]); return {supprime:true}; },
  async "GET /api/progression"({moi, query}){
    const langue = LANGUES.has(query.langue) ? query.langue : "fr";
    const {rows:[p]} = await pool.query("select donnees, maj_le from qln_progression where joueur=$1", [moi.id]);
    return {progres:(p && p.donnees[langue]) || null, records:(p && p.donnees["records_"+langue]) || null, maj:p ? p.maj_le : null};
  },
  async "PUT /api/progression"({moi, corps, query}){
    const langue = LANGUES.has(query.langue) ? query.langue : "fr";
    if(limite("prog:"+moi.id, 120, 3600e3)) throw erreur(429, "Trop de synchronisations.");
    const {rows:[p]} = await pool.query("select donnees from qln_progression where joueur=$1", [moi.id]);
    const d = (p && p.donnees) || {};
    d[langue] = fusionner(d[langue], corps.progres || {});
    if(corps.records && typeof corps.records === "object"){
      const a = d["records_"+langue] || {}, b = corps.records, r = {...a, ...b};
      for(const k of Object.keys(r)) if(typeof a[k] === "number" && typeof b[k] === "number") r[k] = Math.max(a[k], b[k]);
      d["records_"+langue] = r;
    }
    await pool.query("insert into qln_progression(joueur, donnees, maj_le) values($1,$2,now()) on conflict (joueur) do update set donnees=$2, maj_le=now()", [moi.id, d]);
    return {progres:d[langue], records:d["records_"+langue] || null};
  },
  async "POST /api/scores"({moi, corps}){
    if(limite("score:"+moi.id, 60, 3600e3)) throw erreur(429, "Trop de scores envoyés.");
    const mode = String(corps.mode || ""), langue = LANGUES.has(corps.langue) ? corps.langue : "fr", m = MODES[mode];
    if(!m) throw erreur(400, "Mode inconnu.");
    const score = Math.round(+corps.score);
    if(!Number.isFinite(score) || score < 0 || score > m.max) throw erreur(400, "Score invalide.");
    let jour = null;
    if(mode === "jour"){
      jour = /^\d{4}-\d{2}-\d{2}$/.test(corps.jour || "") ? corps.jour : null;
      const ecart = jour ? Math.abs(Date.parse(jour + "T12:00:00Z") - Date.now()) : Infinity;
      if(ecart > 36*3600e3) throw erreur(400, "Ce défi du jour n'est plus ouvert.");
    }
    const detail = corps.detail && typeof corps.detail === "object" ? JSON.parse(JSON.stringify(corps.detail).slice(0, 2000) || "{}") : null;
    // défi du jour : seul le premier essai compte (comme dans l'appli)
    const {rows} = await pool.query(
      "insert into qln_scores(joueur, langue, mode, jour, score, detail) values($1,$2,$3,$4,$5,$6) on conflict (joueur, langue, mode, jour) where jour is not null do nothing returning id",
      [moi.id, langue, mode, jour, score, detail]).catch(e => { if(e.code === "22P02") throw erreur(400, "Données invalides."); throw e; });
    return {enregistre: rows.length > 0};
  },
  async "GET /api/classement"({query, moi}){
    const mode = MODES[query.mode] ? query.mode : "jour", langue = LANGUES.has(query.langue) ? query.langue : "fr";
    const limiteN = Math.max(5, Math.min(100, +query.limite || 50));
    const pays = PAYS.test(query.pays || "") ? query.pays : null;
    const jour = mode === "jour" ? (/^\d{4}-\d{2}-\d{2}$/.test(query.jour || "") ? query.jour : new Date().toISOString().slice(0,10)) : null;
    // meilleur score de chaque joueur (défi du jour : du jour demandé ; autres modes : de tous les temps, ou de la semaine)
    const periode = query.periode === "semaine" && mode !== "jour" ? "and s.cree_le > now() - interval '7 days'" : "";
    const sql = `
      with meilleurs as (
        select distinct on (s.joueur) s.joueur, s.score, s.cree_le
        from qln_scores s join qln_joueurs j on j.id = s.joueur
        where s.langue=$1 and s.mode=$2 and ($3::date is null or s.jour=$3) and ($4::text is null or j.pays=$4) ${periode}
        order by s.joueur, s.score desc, s.cree_le asc
      ), rangs as (
        select m.*, rank() over (order by m.score desc, m.cree_le asc) as rang, count(*) over () as total from meilleurs m
      )
      select r.rang, r.total, r.score, j.id, j.pseudo, j.couleur, j.pays from rangs r join qln_joueurs j on j.id = r.joueur
      where r.rang <= $5 or j.id = $6 order by r.rang`;
    const {rows} = await pool.query(sql, [langue, mode, jour, pays, limiteN, moi ? moi.id : null]);
    const ligne = r => ({rang:+r.rang, score:r.score, pseudo:r.pseudo, couleur:r.couleur, pays:r.pays, moi:!!moi && r.id === moi.id});
    return {mode, langue, jour, pays, total: rows.length ? +rows[0].total : 0, lignes: rows.filter(r => +r.rang <= limiteN).map(ligne), moi: rows.filter(r => moi && r.id === moi.id).map(ligne)[0] || null};
  },
  async "POST /api/mots"({corps, ip, moi}){
    if(!AnalyseMot) throw erreur(501, "Analyse indisponible.");
    if(limite("mot:"+ip, 30, 3600e3)) throw erreur(429, "Trop de contestations, réessayez plus tard.");
    const langue = LANGUES.has(corps.langue) ? corps.langue : "fr";
    const mot = String(corps.mot || "").trim().toLowerCase();
    if(!/^[a-zà-ÿœæ]{4,16}$/i.test(mot)) throw erreur(400, "Mot invalide.");
    const v = await verifierMot(mot, langue).catch(() => { throw erreur(503, "Wiktionnaire injoignable pour le moment."); });
    if(!v.ok) return {accepte:false, raison:v.raison};
    await pool.query("insert into qln_mots(langue, mot, nature, joueur) values($1,$2,$3,$4) on conflict (langue, mot) do nothing", [langue, v.titre, v.nature, moi ? moi.id : null]);
    return {accepte:true, mot:v.titre, nature:v.nature};
  },
  async "GET /api/mots"({query}){
    const langue = LANGUES.has(query.langue) ? query.langue : "fr";
    const {rows} = await pool.query("select mot from qln_mots where langue=$1 order by id", [langue]);
    return {mots: rows};
  },
  async "GET /api/sante-api"(){ await pool.query("select 1"); return {ok:true}; },
};

/* Point d'entrée appelé par le serveur HTTP ; renvoie false si la route n'est pas pour l'API */
async function traiter(req, res, origines){
  const url = new URL(req.url, "http://x");
  if(!url.pathname.startsWith("/api/")) return false;
  const origine = req.headers.origin;
  if(origine && (!origines.length || origines.includes(origine))){ res.setHeader("Access-Control-Allow-Origin", origine); res.setHeader("Vary", "Origin"); }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Max-Age", "86400");
  if(req.method === "OPTIONS"){ res.writeHead(204); res.end(); return true; }
  const envoyer = (code, obj) => { res.writeHead(code, {"Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store"}); res.end(JSON.stringify(obj)); };
  const route = ROUTES[req.method + " " + url.pathname];
  if(!route){ envoyer(404, {erreur:"Route inconnue."}); return true; }
  try{
    const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
    const corps = ["POST","PUT","PATCH"].includes(req.method) ? await lireCorps(req) : {};
    const query = Object.fromEntries(url.searchParams);
    const id = verifier(String(req.headers.authorization || "").replace(/^Bearer /, ""));
    let moi = null;
    if(id){ ({rows:[moi]} = await pool.query("select * from qln_joueurs where id=$1", [id])); }
    const publiques = ["POST /api/inscription", "POST /api/connexion", "POST /api/google", "GET /api/classement", "GET /api/sante-api", "POST /api/mots", "GET /api/mots"];
    if(!moi && !publiques.includes(req.method + " " + url.pathname)) throw erreur(401, "Connexion requise.");
    envoyer(200, await route({corps, query, moi, ip}));
  }catch(e){
    const code = e.code && Number.isInteger(e.code) ? e.code : 500;
    if(code === 500) console.error("[api]", e);
    envoyer(code, {erreur: code === 500 ? "Erreur du serveur." : e.message});
  }
  return true;
}

module.exports = { initialiser, traiter, fusionner, _pool: pool };
