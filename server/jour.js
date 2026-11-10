"use strict";
/* Anti-triche des classements.
   Le défi du jour est le même pour tout le monde : les cartes sortent d'un tirage déterministe (graine = date).
   Le serveur refait ce tirage avec le même dictionnaire que l'appli, puis vérifie que
     1. les cartes jouées sont bien celles du jour,
     2. chaque mot annoncé est une vraie anagramme de sa carte (sans doublon),
     3. le score annoncé ne dépasse pas le maximum possible avec ces mots (série ×2, événement, légendaire ×3, coffres).
   Les chronos ne sont pas rejoués : un joueur peut donc encore tricher « un peu » sur la rapidité, jamais sur les mots. */
const fs = require("fs"), path = require("path");

const RACINE = path.join(__dirname, "..");
const FICHIERS = {fr:path.join(RACINE, "data", "fr.json"), en:path.join(RACINE, "en", "data", "en.json")};
const NIVEAUX = {v:{gain:20}, b:{gain:50}, r:{gain:100}, n:{gain:200}};
const PARCOURS_DEFI = ["v","v","v","b","b","b","r","r","n","n"];
const EVENEMENTS = [2, 1.5, 1.5, 1.25, 1, 1];   // multiplicateurs, dans l'ordre de l'appli (double, éclair, masque, miroir, temps, vie)
const COFFRE_POS = [3, 6, 9], LEG_POS = 7;
const BONUS_RAPIDITE = 0.25, BONUS_EXTRA = 0.5, SERIE_MAX = 2;

const norm = w => String(w).normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/Œ/g, "OE").replace(/Æ/g, "AE");
const cleTri = w => norm(w).split("").sort().join("");
function aleaGraine(seed){ let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t>>>15, t|1); t ^= t + Math.imul(t ^ t>>>7, t|61); return ((t ^ t>>>14) >>> 0) / 4294967296; }; }

const dicos = {};
function dico(langue){
  if(dicos[langue]) return dicos[langue];
  const brut = JSON.parse(fs.readFileSync(FICHIERS[langue], "utf8")), D = {};
  for(const k of Object.keys(NIVEAUX)){
    D[k] = (brut[k] || []).map(g => { const vus = new Set(), mots = []; for(const w of g){ const n = norm(w); if(!vus.has(n)){ vus.add(n); mots.push(w); } } return mots; }).filter(g => g.length >= 2);
  }
  // index cleTri -> groupe, par niveau (pour le défi : cartes tirées au hasard)
  D.index = {}; for(const k of Object.keys(NIVEAUX)) D.index[k] = new Map(D[k].map(g => [cleTri(g[0]), g]));
  return dicos[langue] = D;
}
const disponible = langue => { try{ return !!dico(langue); }catch(e){ return false; } };

function tirerCarte(D, niv, rnd, deja){
  const liste = D[niv];
  for(let essai = 0; essai < 60; essai++){
    const g = liste[Math.floor(rnd()*liste.length)], k = cleTri(g[0]);
    if(deja.has(k)) continue;
    deja.add(k);
    const origine = g[rnd() < .6 ? 0 : 1];
    return {niv, origine, mots:g, cle:k};
  }
  deja.clear(); return tirerCarte(D, niv, rnd, deja);
}
function tirerCoffre(rnd){   // valeur maximale (en €) que ce coffre peut rapporter ; l'ordre des tirages est celui de l'appli
  const r = rnd(); rnd();
  return r < .30 ? 50 : r < .45 ? 100 : r >= .70 && r < .75 ? 50 : 0;
}
/** Les cartes du jour (mêmes tirages, dans le même ordre que l'appli). cle = AAAAMMJJ (nombre). */
function jourDe(langue, cle){
  const D = dico(langue), rnd = aleaGraine(cle*7 + 13), deja = new Set(), n = PARCOURS_DEFI.length;
  const cartes = PARCOURS_DEFI.map(niv => tirerCarte(D, niv, rnd, deja));
  const evts = {}; let prec = -9;
  for(let i = 1; i < n; i++){ const a = rnd(), b = Math.floor(rnd()*EVENEMENTS.length); if(i - prec > 1 && a < .2){ evts[i] = EVENEMENTS[b]; prec = i; } }
  const coffres = {}; for(const pos of COFFRE_POS) if(pos < n) coffres[pos] = Math.max(tirerCoffre(rnd), tirerCoffre(rnd), tirerCoffre(rnd));
  const legendaire = tirerCarte(D, "n", rnd, deja);
  return {cartes, evts, coffres, legendaire};
}

// extra : mots ajoutés au dictionnaire après contestation (validés par le serveur, table qln_mots), en forme norm()
const motsDe = (carte, trouves, extra) => {
  if(!Array.isArray(trouves) || trouves.length > 40) return null;
  const sol = new Set(carte.mots.map(norm)), ori = norm(carte.origine), cle = cleTri(carte.origine); sol.delete(ori);
  const vus = new Set();
  for(const w of trouves){
    if(typeof w !== "string") return null;
    const n = norm(w), ok = sol.has(n) || (extra && extra.has(n) && n !== ori && cleTri(n) === cle);
    if(!ok || vus.has(n)) return null; vus.add(n);
  }
  return vus.size;
};
/** Gain maximal d'une carte : 1er mot avec bonus de rapidité, mots bonus, tous les multiplicateurs possibles. */
const maxCarte = (niv, nb, mult) => nb ? Math.ceil((NIVEAUX[niv].gain*(1 + BONUS_RAPIDITE) + (nb-1)*Math.round(NIVEAUX[niv].gain*BONUS_EXTRA)) * mult) + nb : 0;

const historiqueValide = h => Array.isArray(h) && h.length >= 1 && h.length <= 12 && h.every(e => e && typeof e === "object" && typeof e.origine === "string" && e.origine.length <= 40 && e.niv in NIVEAUX);

/** Défi du jour : renvoie null si tout est cohérent, sinon le motif du refus. */
function verifierJour(langue, jour, detail, score, extra){
  if(!disponible(langue)) return null;                      // dictionnaire absent (ne doit pas arriver) : on ne bloque pas les joueurs
  const h = detail && detail.historique;
  if(!historiqueValide(h) || h.length > PARCOURS_DEFI.length) return "Partie incomplète : mettez l'appli à jour pour apparaître au classement.";
  const J = jourDe(langue, +jour.replace(/-/g, "")), D = dico(langue);
  let max = 0;
  for(let i = 0; i < h.length; i++){
    const e = h[i];
    const leg = i === LEG_POS && J.legendaire && norm(e.origine) === norm(J.legendaire.origine) && norm(e.origine) !== norm(J.cartes[i].origine);
    const carte = leg ? J.legendaire : J.cartes[i];
    if(norm(e.origine) !== norm(carte.origine)) return "Ces cartes ne sont pas celles du défi du jour.";
    const nb = motsDe(carte, e.trouves || [], extra); if(nb === null) return "Un mot annoncé n'est pas une solution de sa carte.";
    max += maxCarte(carte.niv, nb, SERIE_MAX * (leg ? 3 : (J.evts[i] || 1)));
  }
  for(const pos of COFFRE_POS) if(h.length > pos) max += J.coffres[pos] || 0;
  return score > max + 5 ? "Score supérieur au maximum possible avec ces mots." : null;
}
/** Défi (cartes libres) : mots valides pour leurs cartes, score borné (série ×2, événement ×2 ou légendaire ×3, coffres, cases bonus). */
function verifierDefi(langue, detail, score, extra){
  if(!disponible(langue)) return null;
  const h = detail && detail.historique, D = dico(langue);
  if(!historiqueValide(h)) return score === 0 ? null : "Partie incomplète : mettez l'appli à jour pour apparaître au classement.";
  let max = 0;
  for(const e of h){
    const groupe = D.index[e.niv].get(cleTri(e.origine));
    if(!groupe || !groupe.some(w => norm(w) === norm(e.origine))) return "Carte inconnue.";
    const carte = {origine:e.origine, mots:groupe};
    const nb = motsDe(carte, e.trouves || [], extra); if(nb === null) return "Un mot annoncé n'est pas une solution de sa carte.";
    max += maxCarte(e.niv, nb, SERIE_MAX * 3) + 100;     // +100 : case bonus ou coffre au passage
  }
  return score > max + 5 ? "Score supérieur au maximum possible avec ces mots." : null;
}
module.exports = {jourDe, verifierJour, verifierDefi, disponible, norm, cleTri};
