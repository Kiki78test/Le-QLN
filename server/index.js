/* Le-QLN — serveur relais multijoueur (Node + ws)
   - Annuaire des salons ouverts (publié par l'hôte, visible par tous)
   - Relais des messages d'un salon à ses membres (l'hôte reste autoritaire)
   Aucune donnée persistée : tout est en mémoire. Si l'hôte part, le premier joueur restant devient l'hôte
   (message « hote-change ») ; le salon ne disparaît que lorsqu'il est vide. */
"use strict";
const http = require("http");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 8080;
const ORIGINES = (process.env.ORIGINES || "").split(",").map(s => s.trim()).filter(Boolean); // vide = toutes

// API comptes / classements (si une base PostgreSQL est configurée)
const api = process.env.DATABASE_URL ? require("./api") : null;
if(api) api.initialiser().catch(e => console.error("[api] initialisation impossible :", e.message));

const Filtre = require("../app/filtre.js");   // pseudos grossiers masqués dans l'annuaire des salons
const salons = new Map();   // code -> {resume, hote:ws, membres:Set<ws>, vu}
const annuaire = new Set(); // sockets abonnées à la liste

const server = http.createServer(async (req, res) => {
  if(api && await api.traiter(req, res, ORIGINES)) return;
  res.setHeader("Access-Control-Allow-Origin", "*");
  if(req.url === "/sante"){ res.writeHead(200, {"Content-Type":"application/json"}); return res.end(JSON.stringify({ok:true, salons:salons.size, clients:wss.clients.size, api:!!api})); }
  res.writeHead(200, {"Content-Type":"text/plain; charset=utf-8"}); res.end("Le-QLN relais multijoueur\n");
});
const wss = new WebSocketServer({ server, path:"/ws", verifyClient: ({origin}) => !ORIGINES.length || !origin || ORIGINES.includes(origin) });

const envoyer = (ws, m) => { if(ws.readyState === 1) ws.send(JSON.stringify(m)); };
const liste = () => [...salons.values()].filter(s => s.resume && s.resume.phase === "attente").map(s => s.resume);
const enLigneN = () => [...wss.clients].filter(w => w.readyState === 1).length;
const diffuserAnnuaire = () => { const m = {t:"salons", liste:liste(), en_ligne:enLigneN()}; for(const ws of annuaire) envoyer(ws, m); };
let _dA = null; const diffuserBientot = () => { if(_dA) return; _dA = setTimeout(() => { _dA = null; diffuserAnnuaire(); }, 800); };
// résumé public d'un salon : on ne garde que des champs simples et bornés (le client est hors de confiance)
const nettoyerResume = (r, code) => {
  const t = (v, n) => String(v == null ? "" : v).slice(0, n);
  return {code, hote:Filtre.masquer(t(r.hote, 24)), lang:t(r.lang, 2), couleur:Number(r.couleur)|0, nb:Math.min(6, Number(r.nb)|0), max:Math.min(6, Number(r.max)|0 || 6), phase:t(r.phase, 10), auto:!!r.auto, duree:r.duree === "longue" ? "longue" : "courte",
    joueurs:(Array.isArray(r.joueurs) ? r.joueurs : []).slice(0, 6).map(j => ({pseudo:Filtre.masquer(t(j && j.pseudo, 24)), couleur:Number(j && j.couleur)|0})), t:Date.now()};
};

function quitterSalon(ws){
  const code = ws.salon; if(!code) return;
  const s = salons.get(code); ws.salon = null;
  if(!s) return;
  s.membres.delete(ws);
  if(s.hote === ws){ // l'hôte part : le premier joueur restant prend la main ; salon vide = salon fermé
    const suivant = [...s.membres].find(m => m.readyState === 1 && m.id);
    if(!suivant){ salons.delete(code); diffuserAnnuaire(); return; }
    s.hote = suivant;
    for(const m of s.membres) envoyer(m, {t:"hote-change", code, de:"serveur", ancien:ws.id || null, nouveau:suivant.id});
    diffuserAnnuaire();
  } else {
    // prévenir l'hôte (il retirera le joueur de son état)
    envoyer(s.hote, {t:"quitter", code, de:ws.id});
  }
}

wss.on("connection", ws => {
  ws.vivant = true; ws.on("pong", () => ws.vivant = true); diffuserBientot();
  ws.on("message", data => {
    let m; try{ m = JSON.parse(data); }catch(e){ return; }
    if(!m || typeof m.t !== "string") return;
    if(m.de) ws.id = String(m.de).slice(0,80);
    switch(m.t){
      case "annuaire": annuaire.add(ws); envoyer(ws, {t:"salons", liste:liste(), en_ligne:enLigneN()}); return;
      case "annuaire-stop": annuaire.delete(ws); return;
      case "entrer": { // rejoint (ou crée) le canal d'un salon
        const code = String(m.code||"").toUpperCase().slice(0,5); if(code.length !== 5) return;
        if(ws.salon && ws.salon !== code) quitterSalon(ws);
        let s = salons.get(code);
        if(!s){ if(!m.hote) return envoyer(ws, {t:"refus", code, pour:ws.id, raison:"introuvable", de:"serveur"}); s = {resume:null, hote:ws, membres:new Set(), vu:Date.now()}; salons.set(code, s); }
        s.membres.add(ws); ws.salon = code; return; }
      case "publier": { const s = salons.get(ws.salon); if(s && s.hote === ws){ s.resume = nettoyerResume(m.resume || {}, ws.salon); s.vu = Date.now(); diffuserAnnuaire(); } return; }
      case "sortir": quitterSalon(ws); return;
      default: { // relais aux autres membres du salon
        const s = salons.get(m.code || ws.salon); if(!s || !s.membres.has(ws)) return;
        s.vu = Date.now();
        const txt = JSON.stringify(m);
        for(const w of s.membres) if(w !== ws && w.readyState === 1) w.send(txt);
      }
    }
  });
  ws.on("close", () => { annuaire.delete(ws); quitterSalon(ws); diffuserBientot(); });
});

// nettoyage : clients muets et salons abandonnés
setInterval(() => {
  for(const ws of wss.clients){ if(!ws.vivant){ ws.terminate(); continue; } ws.vivant = false; ws.ping(); }   // (un « return » ici sautait les autres joueurs et le nettoyage des salons)
  const t = Date.now();
  for(const [code, s] of salons) if(t - s.vu > 2*3600e3){ for(const m of s.membres) envoyer(m, {t:"ferme", code, de:"serveur"}); salons.delete(code); }
}, 30000);

// état du relais pour la page d'administration
if(api) api.brancherRelais(() => ({salons:salons.size, clients:wss.clients.size}));

server.listen(PORT, () => console.log("Le-QLN relais sur le port", PORT));
