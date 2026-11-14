/* =========================================================================
   Le-QLN — Progression : partie guidée, niveaux (XP), série de jours, succès,
   statistiques personnelles et partage du défi du jour.
   Dépend du socle d'index.html (store, $, $$, esc, euros, panneau, toast, Son,
   confettis, NIVEAUX, DICO, VITRINE, norm, app, ICO, aujourdhui, P…).
   ========================================================================= */
"use strict";
const Progres = (() => {

/* ---------- Textes (la version EN remplace ce bloc) ---------- */
const TXT = {
  niveau:"Level", xp:"XP", jours:n=>`${n} day${n>1?"s":""}`, serie:"Streak", record:"best",
  titres:["Apprentice","Wordsmith","Virtuoso","Word Master","Legend"],
  statsSucces:"Stats and achievements", partagerJour:"Share my daily challenge",
  serieInfo:"Play at least one card a day to keep your streak.",
  bienvenueT:"Welcome!", bienvenue:"A one-minute guided game to discover how it works?", guidee:"Guided game", plusTard:"Later",
  t1:"Here is the card. The goal: make <b>another word</b> with exactly the same letters.",
  t2:"Tap the letters in order to spell your word.",
  t3:"Here: erase, shuffle the letters, ask for a <b>hint</b> (the first letter, winnings halved) or skip the card.",
  t4:"Your turn! The word is checked as soon as it is complete. Stuck? Tap the light bulb.",
  t5:"The <b>back of the card</b>: every solution. Tap a word to see its definition.",
  t6:"In a game, each colour has its timer: <b>green 30 s</b> → <b>black 3 min</b>, with bigger winnings. Finding fast earns a bonus. Your turn to play!",
  suivant:"Next", terminer:"Finish", passerTuto:"Skip", tutoFini:"Guided game complete. Good luck!",
  revoirTuto:"Replay the guided game",
  gainXp:x=>`+${x} XP`, niveauAtteint:n=>`Level ${n} reached!`, succesDebloque:"Achievement unlocked",
  ecranTitre:"My stats", parties:"Games played", cartesGagnees:"Cards won", taux:"success rate", mots:"Words found",
  parfaites:"Perfect cards", meilleurePartie:"Best game", victoiresIA:"Wins against the AI", serieActuelle:"Current streak", serieRecord:"Best streak",
  indices:"Hints used", parCouleur:"By colour", meilleurTemps:"best time", aucune:"not played yet", succes:"Achievements", sur:"of",
  vide:"Play a few cards: your stats will show up here.", reinit:"Reset", reinitQ:"Erase your progress and stats?", reinitOk:"Progress reset.", annuler:"Cancel", effacer:"Erase",
  partageTitre:"Le-QLN · Daily challenge", partageCopie:"Result copied: paste it anywhere.", serieTxt:n=>`🔥 ${n} day${n>1?"s":""}`,
  url:"https://kiki78test.github.io/Le-QLN/en/",
  S:{
    "premiers-pas":["First steps","Finish the guided game"],
    "premiere-carte":["First card","Win a card"],
    "cartes-10":["Off to a good start","Win 10 cards"],
    "cartes-100":["Collector","Win 100 cards"],
    "cartes-500":["Encyclopedia","Win 500 cards"],
    "noire":["Black card","Win a black card"],
    "parfaite":["Perfect card","Find every anagram of a card"],
    "eclair":["Lightning","Find an anagram in under 5 seconds"],
    "defi-1000":["A thousand","Win 1,000 in a single game"],
    "sans-faute":["Flawless","Finish a run without losing a life"],
    "jour-1":["See you tomorrow","Play a daily challenge"],
    "serie-3":["Regular","Play 3 days in a row"],
    "serie-7":["One week","Play 7 days in a row"],
    "serie-30":["Unstoppable","Play 30 days in a row"],
    "ia":["Beat the machine","Beat the AI on the board"],
    "festival-or":["Headliner","Gold medal at the Festival"],
    "braquage":["Safecracker","Pull off a heist"],
    "niveau-10":["Virtuoso","Reach level 10"],
  },
};

/* ---------- Médailles à paliers (bronze, argent, or) : textes FR/EN dans ce fichier ---------- */
const EN = document.documentElement.lang === "en";
const TM = EN ? {
  medailles:"Medals", metal:["Bronze", "Silver", "Gold"], medaille:m => `${m} medal`, prochain:(v, s) => `${v} / ${s}`, complet:"Complete",
  P:{collection:["Collector", "Cards won"], assiduite:["Regular", "Days in a row (best streak)"], vocabulaire:["Wordsmith", "Words found"],
     perfection:["Perfectionist", "Perfect cards"], stratege:["Strategist", "Wins against the AI"], noires:["Night owl", "Black cards won"],
     fidele:["Loyal", "Days played"], fortune:["Fortune", "Total winnings (€)"], ambassadeur:["Ambassador", "Friends invited who played"]},
} : {
  medailles:"Médailles", metal:["Bronze", "Argent", "Or"], medaille:m => `Médaille ${m === "Or" ? "d'or" : m === "Argent" ? "d'argent" : "de bronze"}`, prochain:(v, s) => `${v} / ${s}`, complet:"Complet",
  P:{collection:["Collectionneur", "Cartes gagnées"], assiduite:["Assidu", "Jours d'affilée (meilleure série)"], vocabulaire:["Vocabulaire", "Mots trouvés"],
     perfection:["Perfectionniste", "Cartes parfaites"], stratege:["Stratège", "Victoires contre l'IA"], noires:["Nuit noire", "Cartes noires gagnées"],
     fidele:["Fidèle", "Jours joués"], fortune:["Fortune", "Gains cumulés (€)"], ambassadeur:["Ambassadeur", "Amis invités qui ont joué"]},
};
const PALIERS = [
  {id:"collection", seuils:[10, 100, 500], val:d => Object.values(d.st.cartes).reduce((s, c) => s + c[1], 0)},
  {id:"assiduite", seuils:[3, 7, 30], val:d => d.serieMax || 0},
  {id:"vocabulaire", seuils:[50, 500, 2000], val:d => d.st.mots || 0},
  {id:"perfection", seuils:[5, 50, 200], val:d => d.st.parfaites || 0},
  {id:"stratege", seuils:[1, 10, 50], val:d => d.st.victoiresIA || 0},
  {id:"noires", seuils:[1, 10, 50], val:d => (d.st.cartes.n || [0,0])[1]},
  {id:"fidele", seuils:[7, 30, 100], val:d => d.st.jours || 0},
  {id:"fortune", seuils:[10000, 100000, 1000000], val:d => d.st.gains || 0},
  {id:"ambassadeur", seuils:[1, 3, 10], val:d => (d.parrainage && d.parrainage.credites) || 0},
];
// succès devenus des médailles : toujours enregistrés, mais plus affichés ni annoncés à part
const FUSION = new Set(["cartes-10", "cartes-100", "cartes-500", "serie-3", "serie-7", "serie-30"]);
const succesVisibles = () => Object.keys(TXT.S).filter(id => !FUSION.has(id));
const METAUX = [["#f3c79a", "#c8793a", "#7a4316"], ["#ffffff", "#c9d3e2", "#7d8aa3"], ["#fff3b0", "#ffcf3a", "#c98a12"]];

/* ---------- Données ---------- */
function niveauPalier(p, d){ const v = p.val(d); return p.seuils.filter(s => v >= s).length; }
const VIDE = () => ({xp:0, serie:0, serieMax:0, dernierJour:null, succes:{}, tuto:null, paliers:{}, parrainage:{credites:0, filleul:false},
  st:{parties:0, cartes:{v:[0,0], b:[0,0], r:[0,0], n:[0,0]}, mots:0, parfaites:0, indices:0, temps:{}, gains:0, meilleure:0, victoiresIA:0, partiesIA:0, jours:0}});
const _brut = store.get("progres", {});
let D = Object.assign(VIDE(), _brut);
D.st = Object.assign(VIDE().st, D.st || {});
if(!_brut.paliers){ D.paliers = {}; for(const p of PALIERS) D.paliers[p.id] = niveauPalier(p, D); }   // joueurs existants : médailles déjà méritées, sans annonce
const sauver = () => store.set("progres", D);
let xpPartie = 0;      // XP gagnée pendant la partie en cours (affichée à la fin)

/* ---------- Niveaux : niveau n → n+1 coûte 100 + 50·(n−1) XP ---------- */
const coutNiveau = n => 100 + 50*(n-1);
function niveauDe(xp){ let n = 1, reste = xp; while(reste >= coutNiveau(n)){ reste -= coutNiveau(n); n++; } return {n, dans:reste, besoin:coutNiveau(n)}; }
const titreDe = n => TXT.titres[Math.min(TXT.titres.length-1, Math.floor((n-1)/5))];

/* ---------- Dates / série ---------- */
const enDate = k => new Date(Math.floor(k/10000), Math.floor(k/100)%100 - 1, k%100);
const ecartJours = (a, b) => Math.round((enDate(b) - enDate(a)) / 864e5);
function serieCourante(){ if(!D.dernierJour) return 0; const e = ecartJours(D.dernierJour, aujourdhui()); return e <= 1 ? D.serie : 0; }
function marquerJour(){
  const j = aujourdhui();
  if(D.dernierJour === j) return;
  D.serie = (D.dernierJour && ecartJours(D.dernierJour, j) === 1) ? D.serie + 1 : 1;
  D.dernierJour = j; D.st.jours++;
  D.serieMax = Math.max(D.serieMax, D.serie);
  [3,7,30].forEach(n => { if(D.serie >= n) debloquer("serie-"+n); });
}

/* ---------- XP et succès ---------- */
const file = []; let affiche = false;
function debloquer(id){
  if(D.succes[id] || !TXT.S[id]) return;
  D.succes[id] = aujourdhui(); sauver();
  if(FUSION.has(id)) return;                   // annoncé par la médaille correspondante
  file.push(id); if(!affiche) suivantSucces();
}
/* médailles : nouvelle marche franchie → annonce (bronze, argent ou or) */
function verifierPaliers(){
  if(!D.paliers) D.paliers = {};
  for(const p of PALIERS){
    const n = niveauPalier(p, D), avant = D.paliers[p.id] || 0;
    if(n > avant){ D.paliers[p.id] = n; file.push({palier:p, n}); }
  }
  sauver(); if(file.length && !affiche) suivantSucces();
}
function suivantSucces(){
  const id = file.shift(); if(!id){ affiche = false; return; }
  affiche = true;
  const el = document.createElement("div"); el.className = "pg-succes"; el.setAttribute("role", "status");
  if(typeof id === "object"){
    const [nom] = TM.P[id.palier.id], m = TM.metal[id.n - 1];
    el.innerHTML = `<span class="pg-medaille">${medailleSVG(true, id.n)}</span><span><small>${esc(TM.medaille(m))}</small><b>${esc(nom)}</b><em>${esc(TM.P[id.palier.id][1])} : ${nombre(id.palier.seuils[id.n - 1])}</em></span>`;
  } else
  el.innerHTML = `<span class="pg-medaille">${medailleSVG(true)}</span><span><small>${TXT.succesDebloque}</small><b>${esc(TXT.S[id][0])}</b><em>${esc(TXT.S[id][1])}</em></span>`;
  document.body.appendChild(el); Son.piece(); try{ navigator.vibrate && store.get("vibrations", true) && navigator.vibrate([8,40,8]); }catch(e){}
  setTimeout(() => { el.classList.add("sort"); setTimeout(() => { el.remove(); suivantSucces(); }, 400); }, 3200);
}
function ajouterXp(x){
  const avant = niveauDe(D.xp).n;
  D.xp += Math.max(0, Math.round(x)); xpPartie += Math.max(0, Math.round(x));
  const apres = niveauDe(D.xp).n;
  if(apres >= 10) debloquer("niveau-10");
  return apres > avant;
}

/* ---------- Événements de jeu (appelés par index.html et plateau.js) ---------- */
function carte({niv, reussi, nbTrouves=0, nbSol=1, temps=null, chrono=false, indice=false}){
  if(!D.st.cartes[niv]) return;
  marquerJour();
  D.st.cartes[niv][0]++;
  if(indice) D.st.indices++;
  if(reussi){
    D.st.cartes[niv][1]++; D.st.mots += nbTrouves;
    const tot = Object.values(D.st.cartes).reduce((s,c) => s + c[1], 0);
    debloquer("premiere-carte"); if(tot >= 10) debloquer("cartes-10"); if(tot >= 100) debloquer("cartes-100"); if(tot >= 500) debloquer("cartes-500");
    if(niv === "n") debloquer("noire");
    if(nbSol >= 2 && nbTrouves >= nbSol){ D.st.parfaites++; debloquer("parfaite"); }
    if(chrono && temps != null){ if(temps < 5000) debloquer("eclair"); if(!D.st.temps[niv] || temps < D.st.temps[niv]) D.st.temps[niv] = Math.round(temps); }
    ajouterXp({v:10, b:15, r:20, n:30}[niv] + 5*Math.max(0, nbTrouves-1) + (chrono && temps != null && temps < 10000 ? 5 : 0));
  } else ajouterXp(2);
  sauver(); verifierPaliers();
}
/* fin de partie : mode, total, vies restantes, record, médaille… → bloc « +XP » affiché sur l'écran de fin */
function finPartie({mode, total=0, viesPerdues=null, medaille=-2, victoire=false, braquageOk=false}={}){
  const avant = niveauDe(D.xp - xpPartie);
  marquerJour();
  if(mode !== "entrainement"){ D.st.parties++; ajouterXp(20); }
  if(mode !== "ia" && mode !== "braquage" && mode !== "entrainement"){ D.st.gains += total; D.st.meilleure = Math.max(D.st.meilleure, total); if(total >= 1000) debloquer("defi-1000"); if(viesPerdues === 0) debloquer("sans-faute"); }
  if(mode === "jour"){ ajouterXp(30); debloquer("jour-1"); }
  if(mode === "festival" && medaille === 2) debloquer("festival-or");
  if(mode === "festival" && medaille >= 0) ajouterXp(15*(medaille+1));
  if(mode === "braquage" && braquageOk){ ajouterXp(60); debloquer("braquage"); }
  if(mode === "multi" && victoire) ajouterXp(80);
  if(mode === "ia"){ D.st.partiesIA++; if(victoire){ D.st.victoiresIA++; ajouterXp(80); debloquer("ia"); } }
  sauver(); verifierPaliers();
  try{ document.dispatchEvent(new CustomEvent("qln:fin-partie", {detail:{mode, total, viesPerdues, medaille, victoire, braquageOk}})); }catch(e){}
  const gagne = xpPartie; xpPartie = 0;
  if(gagne > 0) afficherGain(gagne, avant);
}
function afficherGain(gagne, avant){
  const ap = niveauDe(D.xp), monte = ap.n > avant.n;
  const ancre = $(".score-final") || $(".titre-ecran"); if(!ancre) return;
  const el = document.createElement("div"); el.className = "pg-gain";
  el.innerHTML = `<span class="pg-badge">${ap.n}</span><span class="pg-gain-txt"><b>${TXT.gainXp(gagne)}</b><small>${monte ? TXT.niveauAtteint(ap.n) : `${TXT.niveau} ${ap.n} · ${titreDe(ap.n)}`}</small><span class="pg-barre"><i style="width:${monte ? 0 : Math.round(100*avant.dans/avant.besoin)}%"></i></span></span>`;
  ancre.insertAdjacentElement("afterend", el);
  requestAnimationFrame(() => setTimeout(() => { const i = $(".pg-barre i", el); if(i) i.style.width = Math.round(100*ap.dans/ap.besoin)+"%"; }, 250));
  if(monte){ setTimeout(() => { Son.ok(); if(typeof confettis === "function") confettis(80, true); }, 700); }
}

/* ---------- Bloc de progression sur l'accueil ---------- */
function blocAccueil(){
  const nv = niveauDe(D.xp), s = serieCourante();
  const rec = store.get("records", {}), ligne = rec.jourLigne && rec.jourLigne[aujourdhui()];
  return `<button class="pg-carte" id="pg-ouvrir" aria-label="${TXT.statsSucces}">
      <span class="pg-badge grand">${nv.n}</span>
      <span class="pg-infos"><span class="pg-ligne1"><b>${TXT.niveau} ${nv.n}</b><span class="pg-titre">${esc(titreDe(nv.n))}</span>${s ? `<span class="pg-flamme" title="${TXT.serieInfo}">🔥 ${s}</span>` : ""}</span>
        <span class="pg-barre"><i style="width:${Math.round(100*nv.dans/nv.besoin)}%"></i></span>
        <span class="pg-ligne2"><span>${nv.dans} / ${nv.besoin} ${TXT.xp}</span><span>${succesVisibles().filter(id => D.succes[id]).length}/${succesVisibles().length} ${TXT.succes.toLowerCase()} · ${nbMedailles()}/${PALIERS.length*3} 🏅 ›</span></span></span>
    </button>
    ${ligne ? `<button class="bouton-plat pg-partager" id="pg-partager">${ICO.partager || "↗"} ${TXT.partagerJour}</button>` : ""}`;
}
function brancherAccueil(){
  const z = $("#progression"); if(!z) return;
  z.innerHTML = blocAccueil();
  $("#pg-ouvrir").onclick = ecranStats;
  const pp = $("#pg-partager"); if(pp) pp.onclick = () => { const rec = store.get("records", {}); partagerTexte(rec.jourLigne[aujourdhui()]); };
  if(!D.tuto && !$(".voile")) setTimeout(proposerTuto, 900);
}
function proposerTuto(){
  if(D.tuto || !$("#progression") || $(".voile")) return;
  D.tuto = "propose"; sauver();
  const v = panneau({classe:"c-jaune", titre:TXT.bienvenueT, corps:`<p class="texte-centre" style="font-size:17px">${TXT.bienvenue}</p>
    <div class="duo"><button class="bouton piece c-noir" id="tu-non">${TXT.plusTard}</button><button class="bouton piece c-vert" id="tu-oui">${TXT.guidee}</button></div>`});
  $("#tu-non", v).onclick = () => v.remove();
  $("#tu-oui", v).onclick = () => { v.remove(); lancerTuto(); };
}

/* =========================================================================
   Partie guidée
   ========================================================================= */
let coach = null;
function carteTuto(){
  for(const [a] of (typeof VITRINE !== "undefined" ? VITRINE : [])){
    for(const niv of ["v","b"]){
      const g = (DICO[niv] || []).find(gr => gr.some(w => norm(w) === norm(a)));
      if(g && g.length >= 2) return {niv, origine:g.find(w => norm(w) === norm(a)), mots:g, cle:"tuto"};
    }
  }
  return null;
}
function lancerTuto(){
  window.QLN_EVT && window.QLN_EVT("tuto:debut");
  const c = carteTuto(); if(!c){ nouvellePartie("entrainement", "v"); return; }
  if(typeof arreterVitrine === "function") arreterVitrine();
  window.QLN_CARTE_FORCEE = c;
  demarrerPartie("entrainement", "v", {});
  P.tuto = true;
  demarrerCoach();
}
const ETAPES = [
  {cible:".table-carte", txt:"t1", bouton:"suivant"},
  {cible:"#reserve", txt:"t2", attendre:() => P && P.compo && P.compo.mot && P.compo.mot.replace(/[^A-Z]/gi,"").length > 0},
  {cible:".commandes", txt:"t3", bouton:"suivant"},
  {cible:"#compo", txt:"t4", haut:true, attendre:() => {
    // dès la première anagramme trouvée, on montre la face B (en partie normale, on peut chercher les autres)
    if(P && P.m && P.m.trouves.length && !P.m.fini && !P.tutoFin){ P.tutoFin = true; setTimeout(() => { if(P && P.m && !P.m.fini) finManche("fini"); }, 900); }
    return !!$(".voile .panneau .solutions"); }},
  {cible:".voile .panneau .solutions", txt:"t5", bouton:"suivant", haut:true},
  {cible:null, txt:"t6", bouton:"terminer"},
];
function demarrerCoach(){
  arreterCoach();
  coach = {i:-1, el:document.createElement("div"), raf:0, poll:0};
  coach.el.className = "pg-coach";
  coach.el.innerHTML = `<div class="pg-spot"></div><div class="pg-bulle" role="dialog" aria-live="polite"><p></p><div class="pg-bulle-bas"><button class="bouton-plat pg-passer">${TXT.passerTuto}</button><span class="pg-pts"></span><button class="bouton piece c-jaune pg-suiv"></button></div></div>`;
  document.body.appendChild(coach.el);
  $(".pg-passer", coach.el).onclick = () => finTuto(false);
  etape(0);
  const boucle = () => { if(!coach) return; placer(); coach.raf = requestAnimationFrame(boucle); };
  coach.raf = requestAnimationFrame(boucle);
  coach.poll = setInterval(() => {
    if(!coach) return;
    const e = ETAPES[coach.i];
    if(!P || !P.tuto){ finTuto(false, true); return; }                  // partie quittée
    if(e && e.attendre && e.attendre()) etape(coach.i + 1);
  }, 200);
}
function etape(i){
  coach.i = i; const e = ETAPES[i];
  $(".pg-bulle p", coach.el).innerHTML = TXT[e.txt];
  $(".pg-pts", coach.el).innerHTML = ETAPES.map((_,k) => `<i class="${k===i?"on":""}"></i>`).join("");
  const b = $(".pg-suiv", coach.el);
  b.hidden = !e.bouton; b.textContent = e.bouton ? TXT[e.bouton] : "";
  b.onclick = () => e.bouton === "terminer" ? finTuto(true) : etape(i+1);
  coach.el.classList.toggle("sans-cible", !e.cible);
  coach.el.classList.remove("pop"); void coach.el.offsetWidth; coach.el.classList.add("pop");
  placer();
}
function placer(){
  if(!coach) return;
  const e = ETAPES[coach.i], spot = $(".pg-spot", coach.el), bulle = $(".pg-bulle", coach.el);
  const cible = e.cible && [...document.querySelectorAll(e.cible)].pop();
  if(!cible){ spot.style.cssText = "opacity:0"; bulle.style.cssText = ""; return; }
  const r = cible.getBoundingClientRect(), m = 8;
  spot.style.cssText = `opacity:1; left:${r.left-m}px; top:${r.top-m}px; width:${r.width+2*m}px; height:${r.height+2*m}px`;
  const bh = bulle.offsetHeight || 140, H = innerHeight;
  let top = (e.haut || r.bottom + bh + 24 > H) ? r.top - bh - 18 : r.bottom + 18;
  if(top < 50) top = Math.min(H - bh - 12, r.bottom + 18);
  bulle.style.cssText = `top:${Math.max(12, top)}px`;
}
function arreterCoach(){ if(!coach) return; cancelAnimationFrame(coach.raf); clearInterval(coach.poll); coach.el.remove(); coach = null; }
function finTuto(fini, quitte){
  window.QLN_EVT && window.QLN_EVT(fini ? "tuto:fin" : "tuto:stop" + ((coach ? coach.i : 0) + 1));   // audience : étape où la partie guidée s'arrête
  arreterCoach();
  D.tuto = fini ? "fait" : (D.tuto === "fait" ? "fait" : "vu"); sauver();
  if(fini){ debloquer("premiers-pas"); ajouterXp(25); xpPartie = 0; sauver(); toast(TXT.tutoFini, 2500); }
  if(quitte) return;
  $$(".voile").forEach(v => v.remove());
  if(P) P.tuto = false;
  ecranAccueil();
}

/* =========================================================================
   Écran statistiques et succès
   ========================================================================= */
function ecranStats(){
  if(typeof arreterVitrine === "function") arreterVitrine();
  const nv = niveauDe(D.xp), st = D.st, s = serieCourante();
  const cj = Object.values(st.cartes).reduce((a,c) => a + c[0], 0), cg = Object.values(st.cartes).reduce((a,c) => a + c[1], 0);
  const pct = (a,b) => b ? Math.round(100*a/b) : 0;
  const tps = ms => ms < 60000 ? (ms/1000).toFixed(1).replace(".", TXT.niveau === "Level" ? "." : ",")+" s" : Math.floor(ms/60000)+" min "+Math.round(ms%60000/1000)+" s";
  const tuile = (v, l) => `<div class="pg-tuile"><b>${v}</b><span>${l}</span></div>`;
  app.innerHTML = `
  <section class="ecran">
    <div class="entete-ecran"><button class="icone-btn" id="b-retour" aria-label="Back">${ICO.retour}</button><h1>${TXT.ecranTitre}</h1><span></span></div>
    <div class="pg-tete">
      <span class="pg-badge geant">${nv.n}</span>
      <div class="pg-tete-txt"><b>${TXT.niveau} ${nv.n} · ${esc(titreDe(nv.n))}</b>
        <span class="pg-barre"><i style="width:${Math.round(100*nv.dans/nv.besoin)}%"></i></span>
        <small>${nv.dans} / ${nv.besoin} ${TXT.xp} · ${D.xp} ${TXT.xp}</small></div>
    </div>
    ${cj ? `
    <div class="pg-grille">
      ${tuile(st.parties, TXT.parties)}
      ${tuile(`${cg}<small> · ${pct(cg,cj)} %</small>`, TXT.cartesGagnees)}
      ${tuile(st.mots, TXT.mots)}
      ${tuile(st.parfaites, TXT.parfaites)}
      ${tuile(euros(st.meilleure), TXT.meilleurePartie)}
      ${tuile(`${st.victoiresIA}<small> / ${st.partiesIA}</small>`, TXT.victoiresIA)}
      ${tuile(`🔥 ${s}`, TXT.serieActuelle)}
      ${tuile(TXT.jours(D.serieMax), TXT.serieRecord)}
    </div>
    <div class="pg-bloc"><span class="lbl">${TXT.parCouleur}</span>
      ${Object.values(NIVEAUX).map(n => { const [j,r] = st.cartes[n.cle] || [0,0]; return `<div class="pg-couleur">
        <span class="piece ${n.classe}">€${n.gain}</span>
        <span class="pg-c-milieu"><span class="pg-barre fine"><i class="${n.classe}" style="width:${pct(r,j)}%"></i></span><small>${j ? `${r} ${TXT.sur} ${j} · ${pct(r,j)} % ${TXT.taux}` : TXT.aucune}</small></span>
        <span class="pg-c-temps">${st.temps[n.cle] ? `${tps(st.temps[n.cle])}<small>${TXT.meilleurTemps}</small>` : ""}</span></div>`; }).join("")}
    </div>` : `<p class="sous-titre">${TXT.vide}</p>`}
    <div class="pg-bloc"><span class="lbl">${TM.medailles} · ${nbMedailles()}/${PALIERS.length*3}</span>
      <div class="pg-succes-grille">${PALIERS.map(p => { const n = D.paliers[p.id] || 0, v = p.val(D), cible = p.seuils[Math.min(n, 2)];
        return `<div class="pg-s pg-p ${n ? "ok" : ""}" data-palier="${p.id}" data-niveau="${n}"><span class="pg-medaille">${medailleSVG(n > 0, n || 1)}</span><span class="pg-p-txt"><b>${esc(TM.P[p.id][0])}${n ? ` <i class="pg-metal m${n}">${TM.metal[n-1]}</i>` : ""}</b><small>${esc(TM.P[p.id][1])}</small>
          <span class="pg-p-pas">${[0,1,2].map(k => `<i class="${k < n ? "m" + (k+1) : ""}" title="${TM.metal[k]} : ${nombre(p.seuils[k])}"></i>`).join("")}<em>${n >= 3 ? TM.complet : TM.prochain(nombre(Math.min(v, cible)), nombre(cible))}</em></span></span></div>`; }).join("")}</div>
    </div>
    <div class="pg-bloc"><span class="lbl">${TXT.succes} · ${succesVisibles().filter(id => D.succes[id]).length}/${succesVisibles().length}</span>
      <div class="pg-succes-grille">${Object.entries(TXT.S).filter(([id]) => !FUSION.has(id)).map(([id,[nom,desc]]) => `<div class="pg-s ${D.succes[id] ? "ok" : ""}"><span class="pg-medaille">${medailleSVG(!!D.succes[id])}</span><span><b>${esc(nom)}</b><small>${esc(desc)}</small></span></div>`).join("")}</div>
    </div>
    <div class="pied"><button class="bouton-plat" id="pg-tuto">${TXT.revoirTuto}</button><button class="bouton-plat" id="pg-raz">${TXT.reinit}</button></div>
  </section>`;
  $("#b-retour").onclick = ecranAccueil;
  $("#pg-tuto").onclick = lancerTuto;
  $("#pg-raz").onclick = () => {
    const v = panneau({classe:"c-rouge", titre:TXT.reinit, corps:`<p class="texte-centre">${TXT.reinitQ}</p><div class="duo"><button class="bouton piece c-noir" id="r-non">${TXT.annuler}</button><button class="bouton piece c-rouge" id="r-oui">${TXT.effacer}</button></div>`});
    $("#r-non", v).onclick = () => v.remove();
    $("#r-oui", v).onclick = () => { v.remove(); const t = D.tuto; D = VIDE(); D.tuto = t; sauver(); toast(TXT.reinitOk, 2000); ecranStats(); };
  };
}
let _idMed = 0;
// metal : 1 bronze, 2 argent, 3 or (or par défaut, pour les succès)
function medailleSVG(ok, metal = 3){
  const [c1, c2, c3] = METAUX[metal - 1], g = "pg-m" + (++_idMed), ruban = ["#2f6fd6", "#8a96b0", "#e2463c"][metal - 1];
  return `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M13 2h6l3 10-6 3zM27 2h-6l-3 10 6 3z" fill="${ok?ruban:"#4a5577"}"/><circle cx="20" cy="25" r="12" fill="${ok?`url(#${g})`:"#3a4466"}" stroke="${ok?c3:"#2a3150"}" stroke-width="2"/><path d="M20 18l2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7z" fill="${ok?"#fffaf0":"#56608a"}" opacity="${ok ? .9 : 1}"/><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".5" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient></defs></svg>`;
}
const nbMedailles = () => PALIERS.reduce((s, p) => s + (D.paliers[p.id] || 0), 0);
const nombre = n => Number(n).toLocaleString(EN ? "en-GB" : "fr-FR");

/* =========================================================================
   Partage du défi du jour (grille d'emojis façon Wordle)
   ========================================================================= */
function ligneJour(historique){
  const cartes = historique.filter(h => !h.special);
  const l1 = cartes.map(h => h.reussi ? {v:"🟩",b:"🟦",r:"🟥",n:"⬛"}[h.niv] : "⬜").join("");
  const l2 = cartes.map(h => h.reussi ? (h.trouves.length > 1 ? "⭐" : "✔️") : "✖️").join("");
  return {l1, l2};
}
function enregistrerJour(historique, total, nbEtoiles){
  const rec = store.get("records", {});
  rec.jourLigne = rec.jourLigne || {};
  const k = aujourdhui();
  if(!rec.jourLigne[k]){ const {l1, l2} = ligneJour(historique); rec.jourLigne[k] = {l1, l2, total, etoiles:nbEtoiles}; }
  // ne garder que 30 jours
  Object.keys(rec.jourLigne).sort().slice(0, -30).forEach(x => delete rec.jourLigne[x]);
  store.set("records", rec);
  return rec.jourLigne[k];
}
function partagerTexte(r){
  if(!r) return;
  const d = String(aujourdhui()), date = TXT.niveau === "Level" ? `${d.slice(4,6)}/${d.slice(6)}` : `${d.slice(6)}/${d.slice(4,6)}`;
  const s = serieCourante();
  const txt = `${TXT.partageTitre} ${date}\n${r.l1}\n${r.l2}\n${euros(r.total)} ${"★".repeat(r.etoiles||0)}${s > 1 ? "  "+TXT.serieTxt(s) : ""}\n${TXT.url}`;
  if(navigator.share && matchMedia("(pointer:coarse)").matches){ navigator.share({text:txt}).catch(() => {}); return; }
  try{ navigator.clipboard.writeText(txt).then(() => toast(TXT.partageCopie), () => toast(txt, 6000)); }catch(e){ toast(txt, 6000); }
}

/* ---------- Styles ---------- */
const css = document.createElement("style");
css.textContent = `
.pg-carte{display:grid; grid-template-columns:auto 1fr; gap:14px; align-items:center; text-align:left; width:100%; padding:12px 14px; border-radius:18px; color:#fff;
  background:linear-gradient(160deg, rgba(255,255,255,.1), rgba(255,255,255,.03) 45%, rgba(0,0,0,.18)); box-shadow:inset 0 1px 0 rgba(255,255,255,.18), inset 0 0 0 1px rgba(255,255,255,.08), 0 14px 34px rgba(0,0,0,.4); transition:transform .15s}
.pg-carte:active{transform:scale(.985)}
.pg-badge{display:grid; place-items:center; width:38px; height:38px; border-radius:50%; font:400 22px var(--f-titre); color:#2a1a00; background:radial-gradient(circle at 35% 30%, #fff6c8, #ffd84a 45%, #c98a12); box-shadow:inset 0 -3px 0 rgba(0,0,0,.2), 0 0 0 3px rgba(255,216,74,.25), 0 6px 14px rgba(0,0,0,.45)}
.pg-badge.grand{width:54px; height:54px; font-size:30px}
.pg-badge.geant{width:84px; height:84px; font-size:46px; flex:none}
.pg-infos{display:grid; gap:6px; min-width:0}
.pg-ligne1{display:flex; align-items:baseline; gap:8px; flex-wrap:wrap; font:700 18px var(--f-ui)}
.pg-titre{font:600 14px var(--f-ui); color:#ffe68f}
.pg-flamme{margin-left:auto; font:800 15px var(--f-ui); color:#ffb347; background:rgba(255,140,40,.15); padding:2px 9px; border-radius:999px; box-shadow:inset 0 0 0 1px rgba(255,160,60,.35)}
.pg-ligne2{display:flex; justify-content:space-between; gap:8px; font:600 12.5px var(--f-ui); color:var(--brume); letter-spacing:.02em}
.pg-barre{display:block; height:10px; border-radius:6px; background:rgba(0,0,0,.4); box-shadow:inset 0 1px 2px rgba(0,0,0,.5); overflow:hidden}
.pg-barre.fine{height:7px}
.pg-barre i{display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,#ffd84a,#fff3b0); box-shadow:0 0 10px rgba(255,216,74,.6); transition:width 1.1s cubic-bezier(.2,.8,.2,1)}
.pg-barre i.c-vert{background:linear-gradient(90deg,#3fae2a,#8be05d)} .pg-barre i.c-bleu{background:linear-gradient(90deg,#1c6fd6,#5fb3ff)} .pg-barre i.c-rouge{background:linear-gradient(90deg,#c8202c,#ff6b6b)} .pg-barre i.c-noir{background:linear-gradient(90deg,#555,#bbb)}
.pg-partager{justify-self:center; color:#ffe68f; display:inline-flex; align-items:center; gap:6px}
.pg-partager svg{width:18px; height:18px}
#progression{display:grid; gap:8px}
.pg-gain{display:flex; align-items:center; gap:12px; justify-content:center; margin:-4px auto 0; padding:8px 14px; border-radius:16px; background:rgba(0,0,0,.3); box-shadow:inset 0 0 0 1px rgba(255,216,74,.25); animation:apparait .5s .6s backwards; width:min(100%, 360px)}
.pg-gain-txt{display:grid; gap:4px; flex:1} .pg-gain-txt b{font:400 24px var(--f-titre); color:#ffe68f; line-height:1} .pg-gain-txt small{font:600 13px var(--f-ui); color:var(--brume-2)}
.pg-succes{position:fixed; left:50%; top:calc(var(--bp-h, 0px) + 12px); transform:translateX(-50%); z-index:120; display:flex; align-items:center; gap:12px; padding:10px 16px 10px 10px; border-radius:16px; width:min(92vw, 380px);
  background:linear-gradient(160deg,#1b2f6b,#0b1636); color:#fff; box-shadow:0 0 0 1.5px #ffd84a, 0 16px 40px rgba(0,0,0,.6); animation:pgEntre .45s cubic-bezier(.2,.9,.3,1.3)}
.pg-succes.sort{animation:pgSort .4s forwards}
.pg-succes small{display:block; font:800 11px var(--f-ui); letter-spacing:.12em; text-transform:uppercase; color:#ffd84a}
.pg-succes b{display:block; font:400 22px var(--f-titre); line-height:1.05} .pg-succes em{display:block; font:500 13px var(--f-ui); color:var(--brume-2); font-style:normal}
@keyframes pgEntre{from{opacity:0; transform:translate(-50%,-30px) scale(.9)}} @keyframes pgSort{to{opacity:0; transform:translate(-50%,-20px)}}
.pg-medaille{display:block; width:44px; height:44px; flex:none} .pg-medaille svg{width:100%; height:100%; filter:drop-shadow(0 3px 4px rgba(0,0,0,.5))}
.pg-tete{display:flex; align-items:center; gap:16px; padding:16px; border-radius:20px; background:linear-gradient(160deg, rgba(255,216,74,.14), rgba(255,255,255,.03) 50%, rgba(0,0,0,.2)); box-shadow:inset 0 0 0 1px rgba(255,216,74,.2), 0 14px 34px rgba(0,0,0,.4)}
.pg-tete-txt{display:grid; gap:8px; flex:1} .pg-tete-txt b{font:400 26px var(--f-titre); color:#fff} .pg-tete-txt small{font:600 13px var(--f-ui); color:var(--brume)}
.pg-grille{display:grid; grid-template-columns:repeat(2,1fr); gap:10px}
.pg-tuile{display:grid; gap:2px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,.06); box-shadow:inset 0 0 0 1px rgba(255,255,255,.07)}
.pg-tuile b{font:400 28px var(--f-titre); color:#fff; line-height:1.05} .pg-tuile b small{font:600 14px var(--f-ui); color:var(--brume)} .pg-tuile span{font:600 13px var(--f-ui); color:var(--brume)}
.pg-bloc{display:grid; gap:10px; padding:14px; border-radius:18px; background:rgba(3,10,30,.45); box-shadow:inset 0 0 0 1px rgba(255,255,255,.07)}
.pg-bloc .lbl{font:700 13px var(--f-ui); letter-spacing:.1em; text-transform:uppercase; color:var(--brume)}
.pg-couleur{display:grid; grid-template-columns:62px 1fr auto; gap:12px; align-items:center}
.pg-couleur > .piece{display:grid; place-items:center; height:38px; border-radius:10px; font:400 20px var(--f-titre)}
.pg-c-milieu{display:grid; gap:4px} .pg-c-milieu small{font:600 12.5px var(--f-ui); color:var(--brume-2)}
.pg-c-temps{text-align:right; font:700 16px var(--f-ui); color:#fff; display:grid} .pg-c-temps small{font:600 11px var(--f-ui); color:var(--brume)}
.pg-succes-grille{display:grid; grid-template-columns:1fr; gap:8px}
@media (min-width:560px){ .pg-succes-grille{grid-template-columns:1fr 1fr} .pg-grille{grid-template-columns:repeat(4,1fr)} }
.pg-s{display:flex; gap:10px; align-items:center; padding:8px 10px; border-radius:14px; background:rgba(255,255,255,.04); opacity:.55}
.pg-s.ok{opacity:1; background:linear-gradient(160deg, rgba(255,216,74,.14), rgba(255,255,255,.03)); box-shadow:inset 0 0 0 1px rgba(255,216,74,.25)}
.pg-s .pg-medaille{width:38px; height:38px}
.pg-p-txt{display:grid; gap:2px; min-width:0; flex:1}
.pg-metal{font:800 10.5px var(--f-ui); font-style:normal; letter-spacing:.08em; text-transform:uppercase; padding:1px 6px; border-radius:6px; margin-left:4px; vertical-align:2px}
.pg-metal.m1{background:#c8793a; color:#fff} .pg-metal.m2{background:#c9d3e2; color:#25324d} .pg-metal.m3{background:#ffcf3a; color:#3a2a00}
.pg-p-pas{display:flex; align-items:center; gap:4px; margin-top:3px} .pg-p-pas i{width:16px; height:6px; border-radius:3px; background:rgba(255,255,255,.14)}
.pg-p-pas i.m1{background:#c8793a} .pg-p-pas i.m2{background:#c9d3e2} .pg-p-pas i.m3{background:#ffcf3a}
.pg-p-pas em{font:700 12px var(--f-ui); font-style:normal; color:var(--brume); margin-left:6px}
.pg-s.pg-p{opacity:.8} .pg-s.pg-p.ok{opacity:1} .pg-s b{display:block; font:700 15px var(--f-ui); color:#fff} .pg-s small{display:block; font:500 12.5px var(--f-ui); color:var(--brume-2)}
/* partie guidée */
.pg-coach{position:fixed; inset:0; z-index:110; pointer-events:none}
.pg-spot{position:fixed; border-radius:18px; box-shadow:0 0 0 3px #ffd84a, 0 0 24px 4px rgba(255,216,74,.5), 0 0 0 9999px rgba(2,6,20,.62); transition:all .35s cubic-bezier(.2,.8,.2,1); pointer-events:none}
.pg-coach.sans-cible{background:rgba(2,6,20,.62)}
.pg-bulle{position:fixed; left:50%; transform:translateX(-50%); width:min(92vw, 400px); pointer-events:auto; background:linear-gradient(170deg,#fffdf4,#f3ead0); color:#1b1a10; border-radius:18px; padding:14px 16px 12px; box-shadow:0 0 0 2px #ffd84a, 0 18px 40px rgba(0,0,0,.55); transition:top .35s cubic-bezier(.2,.8,.2,1)}
.pg-coach.sans-cible .pg-bulle{top:50%!important; transform:translate(-50%,-50%)}
.pg-coach.pop .pg-bulle{animation:pgPop .35s cubic-bezier(.2,.9,.3,1.3)}
@keyframes pgPop{from{opacity:0; scale:.92}}
.pg-bulle p{margin:0 0 12px; font:500 17px/1.35 var(--f-ui)} .pg-bulle p b{color:#9a5a00}
.pg-bulle-bas{display:flex; align-items:center; gap:10px} .pg-bulle-bas .pg-passer{color:#6b6450; font-size:15px}
.pg-pts{flex:1; display:flex; justify-content:center; gap:5px} .pg-pts i{width:7px; height:7px; border-radius:50%; background:#d6cba6} .pg-pts i.on{background:#c9921a; width:18px; border-radius:4px}
.pg-bulle-bas .bouton{width:auto; min-height:44px; padding:0 20px; font-size:20px}
@media (prefers-reduced-motion:reduce){ .pg-spot,.pg-bulle{transition:none} .pg-succes,.pg-coach.pop .pg-bulle{animation:none} }
`;
document.head.appendChild(css);

/* parrainage : bonus d'XP (filleul à l'inscription, parrain quand un ami invité a joué) */
const XP_PARRAIN = 200;
function bonusParrainage({filleul = false, filleuls = null} = {}){
  D.parrainage = D.parrainage || {credites:0, filleul:false};
  let gain = 0;
  if(filleul && !D.parrainage.filleul){ D.parrainage.filleul = true; gain += XP_PARRAIN; }
  if(filleuls != null && filleuls > (D.parrainage.credites || 0)){ gain += XP_PARRAIN * (filleuls - (D.parrainage.credites || 0)); D.parrainage.credites = filleuls; }
  if(gain){ ajouterXp(gain); xpPartie = 0; sauver(); verifierPaliers(); }
  return gain;
}
return { donnees:() => D, bonusParrainage, XP_PARRAIN, verifierPaliers, PALIERS, remplacer:d => { D = Object.assign(VIDE(), d); D.st = Object.assign(VIDE().st, d.st || {}); if(!D.paliers || !Object.keys(D.paliers).length){ D.paliers = {}; for(const p of PALIERS) D.paliers[p.id] = niveauPalier(p, D); } sauver(); }, carte, finPartie, brancherAccueil, ecranStats, lancerTuto, enregistrerJour, partagerTexte, niveau:() => niveauDe(D.xp), TXT, enTuto:() => !!coach };
})();
