/* Tests du serveur Le-QLN (API + relais multijoueur). Le serveur doit tourner : QLN_TEST_URL (défaut http://localhost:8790). */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const WebSocket = require("ws");
const BASE = (process.env.QLN_TEST_URL || "http://localhost:8790").replace(/\/$/, "");
const uniq = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
async function api(chemin, {methode = "GET", corps, jeton} = {}){
  const r = await fetch(BASE + chemin, {method:methode, headers:{"Content-Type":"application/json", ...(jeton ? {Authorization:"Bearer " + jeton} : {})}, body:corps ? JSON.stringify(corps) : undefined});
  return {status:r.status, d:await r.json().catch(() => ({}))};
}
const jourUTC = () => new Date().toISOString().slice(0, 10);
let A, B;

test("santé du service", async () => {
  const {status, d} = await api("/sante");
  assert.equal(status, 200); assert.equal(d.ok, true); assert.equal(d.api, true, "l'API doit être active (DATABASE_URL)");
  assert.equal((await api("/api/sante-api")).d.ok, true);
});

test("inscription, doublon, validations", async () => {
  const r = await api("/api/inscription", {methode:"POST", corps:{email:`a-${uniq}@test.fr`, mdp:"motdepasse1", pseudo:"Alice", pays:"FR", couleur:2}});
  assert.equal(r.status, 200, JSON.stringify(r.d)); assert.ok(r.d.jeton); assert.equal(r.d.joueur.pseudo, "Alice");
  A = r.d;
  assert.equal((await api("/api/inscription", {methode:"POST", corps:{email:`a-${uniq}@test.fr`, mdp:"motdepasse1", pseudo:"Alice2"}})).status, 409);
  assert.equal((await api("/api/inscription", {methode:"POST", corps:{email:"pas-un-email", mdp:"motdepasse1", pseudo:"Zz"}})).status, 400);
  assert.equal((await api("/api/inscription", {methode:"POST", corps:{email:`c-${uniq}@test.fr`, mdp:"court", pseudo:"Zz"}})).status, 400);
  B = (await api("/api/inscription", {methode:"POST", corps:{email:`b-${uniq}@test.fr`, mdp:"motdepasse2", pseudo:"Bruno", pays:"BE"}})).d;
  assert.ok(B.jeton);
});

test("connexion et profil", async () => {
  assert.equal((await api("/api/connexion", {methode:"POST", corps:{email:`a-${uniq}@test.fr`, mdp:"mauvais-mdp"}})).status, 401);
  const r = await api("/api/connexion", {methode:"POST", corps:{email:`A-${uniq}@test.fr`, mdp:"motdepasse1"}});
  assert.equal(r.status, 200); assert.ok(r.d.jeton);
  assert.equal((await api("/api/moi")).status, 401, "sans jeton : refusé");
  assert.equal((await api("/api/moi", {jeton:"faux.jeton"})).status, 401);
  const p = await api("/api/moi", {methode:"PATCH", jeton:A.jeton, corps:{pseudo:"Alicia", pays:"CH"}});
  assert.equal(p.d.joueur.pseudo, "Alicia"); assert.equal(p.d.joueur.pays, "CH");
});

test("progression : fusion entre deux appareils", async () => {
  await api("/api/progression?langue=fr", {methode:"PUT", jeton:A.jeton, corps:{progres:{xp:100, serieMax:3}, records:{defi:500}}});
  const r = await api("/api/progression?langue=fr", {methode:"PUT", jeton:A.jeton, corps:{progres:{xp:40, serieMax:5}, records:{defi:300, braquage:12}}});
  assert.equal(r.status, 200);
  const g = await api("/api/progression?langue=fr", {jeton:A.jeton});
  assert.equal(g.d.records.defi, 500, "le meilleur record est gardé"); assert.equal(g.d.records.braquage, 12);
  assert.ok(g.d.progres.xp >= 100, "l'XP ne recule pas");
  assert.equal((await api("/api/progression?langue=en", {jeton:A.jeton})).d.progres, null, "les langues sont séparées");
});

const JOUR = require("../server/jour.js");
/** Une partie « parfaite » du défi du jour : toutes les solutions de chaque carte. Renvoie {historique, max} */
function partieDuJour(jour, langue = "fr", nbCartes = 10){
  const J = JOUR.jourDe(langue, +jour.replace(/-/g, ""));
  const historique = J.cartes.slice(0, nbCartes).map(c => ({niv:c.niv, origine:c.origine, trouves:c.mots.filter(w => JOUR.norm(w) !== JOUR.norm(c.origine))}));
  return {J, historique};
}
test("scores et classements", async () => {
  const j = jourUTC(), {historique} = partieDuJour(j);
  const un = (jeton, score, detail = {historique}, extra = {}) => api("/api/scores", {methode:"POST", jeton, corps:{mode:"jour", langue:"fr", score, jour:j, detail, ...extra}});
  assert.equal((await un(A.jeton, 800)).d.enregistre, true);
  assert.equal((await un(A.jeton, 900)).d.enregistre, false, "défi du jour : seul le 1er essai compte");
  assert.equal((await un(B.jeton, 1200)).d.enregistre, true);
  assert.equal((await un(A.jeton, 10, {historique}, {jour:"2020-01-01"})).status, 400, "ancien défi refusé");
  assert.equal((await api("/api/scores", {methode:"POST", jeton:A.jeton, corps:{mode:"triche", score:10}})).status, 400);
  assert.equal((await api("/api/scores", {methode:"POST", jeton:A.jeton, corps:{mode:"defi", score:-5}})).status, 400);
  assert.equal((await api("/api/scores", {methode:"POST", corps:{mode:"defi", score:5}})).status, 401, "score sans compte refusé");
  const c = await api("/api/classement?mode=jour&langue=fr&jour=" + j, {jeton:A.jeton});
  assert.equal(c.status, 200);
  const iB = c.d.lignes.findIndex(l => l.pseudo === "Bruno"), iA = c.d.lignes.findIndex(l => l.pseudo === "Alicia");
  assert.ok(iB >= 0 && iA > iB, "Bruno (1200) devant Alicia (800)");
  assert.equal(c.d.moi.pseudo, "Alicia"); assert.equal(c.d.moi.moi, true);
  const be = await api("/api/classement?mode=jour&langue=fr&pays=BE&jour=" + j);
  assert.ok(be.d.lignes.every(l => l.pays === "BE"), "filtre par pays");
});

test("anti-triche : le défi du jour est vérifié par le serveur", async () => {
  const j = jourUTC(), {J, historique} = partieDuJour(j);
  const C = (await api("/api/inscription", {methode:"POST", corps:{email:`cheat-${uniq}@test.fr`, mdp:"motdepasse-triche", pseudo:"Tricheur"}})).d;
  assert.ok(C.jeton, "compte de test");
  const essai = (score, detail) => api("/api/scores", {methode:"POST", jeton:C.jeton, corps:{mode:"jour", langue:"fr", score, jour:j, detail}});
  // sans les mots : refusé (ancien client ou client modifié)
  assert.equal((await essai(500)).status, 400, "score sans mots refusé");
  assert.equal((await essai(500, {historique:[]})).status, 400);
  // score démesuré pour les mots annoncés
  assert.equal((await essai(19999, {historique})).status, 400, "score au-dessus du maximum possible");
  // cartes qui ne sont pas celles du jour
  const autre = JOUR.jourDe("fr", +j.replace(/-/g, "") + 1).cartes.map(c => ({niv:c.niv, origine:c.origine, trouves:[]}));
  assert.equal((await essai(100, {historique:autre})).status, 400, "cartes d'un autre jour");
  // mot qui n'est pas une solution, doublon, mot de la carte lui-même
  const faux = JSON.parse(JSON.stringify(historique)); faux[0].trouves = ["zzzzzz"];
  assert.equal((await essai(100, {historique:faux})).status, 400, "mot invalide");
  const dbl = JSON.parse(JSON.stringify(historique)); dbl[0].trouves = [dbl[0].trouves[0], dbl[0].trouves[0]];
  assert.equal((await essai(100, {historique:dbl})).status, 400, "doublon");
  const ori = JSON.parse(JSON.stringify(historique)); ori[0].trouves = [ori[0].origine];
  assert.equal((await essai(100, {historique:ori})).status, 400, "le mot de la carte ne compte pas");
  // aucune carte réussie : le score doit rester minime
  const rien = historique.map(h => ({...h, trouves:[]}));
  assert.equal((await essai(300, {historique:rien})).status, 400, "des euros sans aucun mot");
  // une partie réelle (quelques mots) est acceptée, et le score maximal d'une partie parfaite aussi
  const reel = historique.map((h, i) => ({...h, trouves:i < 3 ? h.trouves.slice(0, 1) : []}));
  assert.equal((await essai(60, {historique:reel})).d.enregistre, true, "partie légitime acceptée");
  const D = await api("/api/moi", {methode:"DELETE", jeton:C.jeton}); assert.ok(D.status < 300);
  // un score parfait théorique est accepté (borne maximale)
  const P = (await api("/api/inscription", {methode:"POST", corps:{email:`parfait-${uniq}@test.fr`, mdp:"motdepasse-parfait", pseudo:"Parfait"}})).d;
  const maxi = JOUR.verifierJour("fr", j, {historique}, 0) === null ? 0 : 0; void maxi;
  let borne = 0; while(JOUR.verifierJour("fr", j, {historique}, borne + 100) === null) borne += 100;   // plus grand multiple de 100 accepté
  assert.ok(borne > 800 && borne < 20000, "borne cohérente : " + borne);
  assert.equal((await api("/api/scores", {methode:"POST", jeton:P.jeton, corps:{mode:"jour", langue:"fr", score:borne, jour:j, detail:{historique}}})).d.enregistre, true);
  await api("/api/moi", {methode:"DELETE", jeton:P.jeton});
  // défi (cartes libres) : mots vérifiés, score borné
  const g = J.cartes[0], solo = [{niv:g.niv, origine:g.origine, trouves:g.mots.filter(w => JOUR.norm(w) !== JOUR.norm(g.origine)).slice(0, 1)}];
  const dfi = (score, detail) => api("/api/scores", {methode:"POST", jeton:A.jeton, corps:{mode:"defi", langue:"fr", score, detail}});
  assert.equal((await dfi(50, {historique:solo})).d.enregistre, true, "défi légitime");
  assert.equal((await dfi(9000, {historique:solo})).status, 400, "défi : score impossible");
  assert.equal((await dfi(50)).status, 400, "défi sans mots refusé");
  assert.equal((await dfi(50, {historique:[{niv:"v", origine:"zzzzz", trouves:[]}]})).status, 400, "défi : carte inconnue");
});

test("mots contestés : validation de l'entrée", async () => {
  assert.equal((await api("/api/mots", {methode:"POST", corps:{mot:"x1", langue:"fr"}})).status, 400);
  const g = await api("/api/mots?langue=fr");
  assert.equal(g.status, 200); assert.ok(Array.isArray(g.d.mots));
});

test("relais multijoueur : annuaire et salon", async () => {
  const wsUrl = BASE.replace(/^http/, "ws") + "/ws";
  const ouvrir = () => new Promise((ok, ko) => { const w = new WebSocket(wsUrl); w.msgs = []; w.on("message", m => w.msgs.push(JSON.parse(m))); w.on("open", () => ok(w)); w.on("error", ko); });
  const attendre = async (w, f, ms = 3000) => { const t0 = Date.now(); while(Date.now() - t0 < ms){ const m = w.msgs.find(f); if(m) return m; await new Promise(r => setTimeout(r, 30)); } throw new Error("message attendu non reçu"); };
  const code = "T" + uniq.slice(-4).toUpperCase().replace(/[^A-Z0-9]/g, "X");
  const hote = await ouvrir(), invite = await ouvrir(), badaud = await ouvrir();
  badaud.send(JSON.stringify({t:"annuaire", de:"badaud"}));
  await attendre(badaud, m => m.t === "salons");
  hote.send(JSON.stringify({t:"entrer", code, hote:true, de:"hote"}));
  hote.send(JSON.stringify({t:"publier", resume:{nom:"Salon test", places:4, phase:"attente"}, de:"hote"}));
  const annonce = await attendre(badaud, m => m.t === "salons" && m.liste.some(s => s.code === code));
  assert.ok(annonce, "le salon apparaît dans l'annuaire");
  invite.send(JSON.stringify({t:"entrer", code, de:"invite"}));
  await new Promise(r => setTimeout(r, 100));
  invite.send(JSON.stringify({t:"bonjour", code, de:"invite", pseudo:"Bruno"}));
  assert.equal((await attendre(hote, m => m.t === "bonjour")).pseudo, "Bruno", "message relayé à l'hôte");
  const perdu = await ouvrir(); perdu.send(JSON.stringify({t:"entrer", code:"ZZZZZ", de:"perdu"}));
  assert.equal((await attendre(perdu, m => m.t === "refus")).raison, "introuvable");
  hote.close();
  await attendre(invite, m => m.t === "ferme");
  for(const w of [invite, badaud, perdu]) w.close();
});

test("nettoyage : suppression des comptes de test", async () => {
  for(const x of [A, B]) assert.equal((await api("/api/moi", {methode:"DELETE", jeton:x.jeton})).d.supprime, true);
  assert.equal((await api("/api/moi", {jeton:A.jeton})).status, 401);
});
