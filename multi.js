/* =========================================================================
   Le-QLN — Multijoueur : profil joueur, salons (création / code / rejoindre)
   Dépend du socle défini dans index.html (store, panneau, Son, toast, ICO…)
   et de PIONS (plateau.js).

   Réseau : une couche « canal » interchangeable.
     - CanalLocal  : BroadcastChannel → plusieurs onglets du même navigateur
                     (suffit pour construire et tester l'interface sans serveur).
     - CanalWS     : WebSocket vers un serveur relais (à brancher plus tard :
                     window.QLN_WS_URL = "wss://…"). Même protocole de messages.
   Le salon est « hôte-autoritaire » : l'hôte détient l'état et le diffuse.
   ========================================================================= */
"use strict";
const Multi = (() => {

/* ---------- Textes (une seule table : la version EN remplace ce bloc) ---------- */
const TXT = {
  multi:"Multijoueur", sousTitre:"De 2 à 6 joueurs, chacun sur son téléphone.",
  profil:"Mon profil", creerProfil:"Créer mon profil", modifier:"Modifier",
  pseudo:"Pseudo", pseudoAide:"2 à 14 caractères, visible par les autres joueurs.", pion:"Mon pion",
  enregistrer:"Enregistrer", profilOk:"Profil enregistré.", pseudoCourt:"Le pseudo doit faire au moins 2 caractères.",
  compteLocal:"Pour l'instant, le profil est enregistré sur cet appareil. La connexion à un compte en ligne (classements, amis) viendra avec le serveur.",
  creerSalon:"Créer un salon", creerSalonDesc:"Vous recevez un code à partager.",
  rejoindre:"Rejoindre un salon", rejoindreDesc:"Entrez le code reçu d'un ami.", code:"Code du salon", codeCourt:"Le code fait 5 lettres.",
  salon:"Salon", codeAide:"Partagez ce code : vos amis le saisissent dans « Rejoindre un salon ».",
  copier:"Copier", copie:"Code copié !", partager:"Partager", partageTexte:c=>`Rejoins ma partie Le-QLN avec le code ${c}`,
  joueurs:"Joueurs", hote:"hôte", vous:"vous", pret:"Prêt", pasPret:"Pas encore prêt", jeSuisPret:"Je suis prêt", plusPret:"Plus prêt",
  attente:"En attente de joueurs…", attenteHote:"L'hôte lance la partie dès que tout le monde est prêt.",
  lancer:"Lancer la partie", lancerAide:n=>n<2 ? "Il faut au moins 2 joueurs." : "Tous les joueurs doivent être prêts.",
  quitter:"Quitter le salon", quitterQ:"Quitter le salon ?", quitterHoteQ:"Vous êtes l'hôte : le salon sera fermé pour tout le monde.", oui:"Quitter", non:"Rester",
  salonFerme:"L'hôte a fermé le salon.", introuvable:"Aucun salon avec ce code. Vérifiez le code, et que l'hôte a bien le salon ouvert.",
  plein:"Ce salon est complet (6 joueurs).", enCours:"La partie de ce salon a déjà commencé.", couleurPrise:"Un joueur a déjà ce pion : la couleur a été ajustée.",
  rejoint:n=>`${n} a rejoint le salon.`, parti:n=>`${n} a quitté le salon.`, connexion:"Connexion au salon…",
  depart:"La partie va commencer !", etape:"Prochaine étape", etapeTexte:"Le salon fonctionne : profils, codes, présence, « prêt » et lancement sont synchronisés entre les joueurs. La partie elle-même sur le plateau (dés, cartes et sabliers partagés) est l'étape suivante, avec le serveur.",
  retourAccueil:"Retour à l'accueil", retourSalon:"Retour au salon",
  modeLocal:"Mode test local : les joueurs doivent être dans le même navigateur (plusieurs onglets). Le serveur en ligne arrivera ensuite.",
  modeLigne:"Connecté au serveur Le-QLN.",
  chat:["👋","😄","🔥","😮","⏳","👏"], chatAide:"Réactions rapides",
  reglesSalon:"Mêmes règles que « Contre l'IA » : plateau complet, enchères, prison.",
};

/* ---------- Styles ---------- */
const css = document.createElement("style");
css.textContent = `
.m-profil-chip{display:inline-flex; align-items:center; gap:8px; height:44px; padding:0 14px 0 8px; border-radius:22px; background:rgba(0,0,0,.35); box-shadow:inset 0 0 0 1px rgba(255,255,255,.08); color:#fff; font:700 15px var(--f-ui); max-width:46vw}
.m-profil-chip .pion-svg{width:20px; height:28px; flex:none; filter:drop-shadow(0 2px 2px rgba(0,0,0,.5))}
.m-profil-chip span{overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
.m-profil-chip.vide{border:1.5px dashed rgba(255,255,255,.3); background:rgba(0,0,0,.2); color:var(--brume)}
.mode.c-multi{--a:#ffb347; --b:#d9741a; --o:#7a3d08}
.m-carte{background:rgba(3,10,30,.5); border-radius:18px; padding:16px; display:grid; gap:12px; box-shadow:inset 0 0 0 1px rgba(255,255,255,.07), 0 10px 30px rgba(0,0,0,.35)}
.m-carte h2{margin:0; font-family:var(--f-titre); font-weight:400; font-size:26px; letter-spacing:.04em; color:#fff}
.m-carte .lbl{font:700 13px var(--f-ui); letter-spacing:.1em; text-transform:uppercase; color:var(--brume)}
.m-aide{font:500 14px/1.35 var(--f-ui); color:var(--brume-2)}
.m-note{display:flex; gap:10px; align-items:flex-start; font:500 13.5px/1.35 var(--f-ui); color:var(--brume-2); background:rgba(255,255,255,.05); border-radius:12px; padding:10px 12px}
.m-note b{color:#ffe68f}
.m-choix{display:grid; grid-template-columns:1fr 1fr; gap:14px}
.m-choix .mode{min-height:150px}
.m-couleurs{display:flex; gap:8px; flex-wrap:wrap}
.m-couleurs button{width:54px; height:54px; border-radius:14px; background:rgba(255,255,255,.07); display:grid; place-items:center; box-shadow:inset 0 0 0 1px rgba(255,255,255,.08); transition:transform .15s}
.m-couleurs button .pion-svg{width:26px; height:36px; filter:drop-shadow(0 3px 3px rgba(0,0,0,.6))}
.m-couleurs button[aria-pressed="true"]{background:var(--jaune-a); box-shadow:0 0 0 3px #fff, 0 6px 16px rgba(0,0,0,.4); transform:translateY(-2px)}
.m-couleurs button[disabled]{opacity:.3}
.m-code{display:flex; justify-content:center; gap:8px; margin:4px 0}
.m-code b{width:52px; height:66px; display:grid; place-items:center; font:400 42px var(--f-titre); color:#1b1a05; background:linear-gradient(#fff6c8,#ffd84a 55%,#e4b01a); border-radius:12px; box-shadow:inset 0 2px 0 #fff, 0 3px 0 #9a7210, 0 8px 14px rgba(0,0,0,.45); letter-spacing:.02em}
.m-code-actions{display:flex; gap:10px; justify-content:center}
.m-saisie{display:flex; gap:10px}
.m-saisie .champ{text-transform:uppercase; letter-spacing:.35em; text-align:center; font-family:var(--f-titre); font-size:28px; padding:8px 12px}
.m-liste{display:grid; gap:8px}
.m-joueur{display:grid; grid-template-columns:40px 1fr auto; align-items:center; gap:12px; padding:10px 12px; border-radius:14px; background:rgba(255,255,255,.06); box-shadow:inset 0 0 0 1px rgba(255,255,255,.06); animation:entreeLigne .4s backwards}
.m-joueur .pion-svg{width:26px; height:36px; filter:drop-shadow(0 3px 3px rgba(0,0,0,.6))}
.m-joueur .nom{font:700 18px var(--f-ui); color:#fff; display:flex; align-items:center; gap:8px; flex-wrap:wrap}
.m-joueur .nom small{font:700 11px var(--f-ui); letter-spacing:.1em; text-transform:uppercase; color:#1b1a05; background:var(--or); padding:2px 7px; border-radius:999px}
.m-joueur .nom small.vous{background:rgba(255,255,255,.2); color:#fff}
.m-joueur .etat{font:700 13px var(--f-ui); letter-spacing:.06em; text-transform:uppercase; color:var(--brume); display:flex; align-items:center; gap:6px}
.m-joueur .etat i{width:10px; height:10px; border-radius:50%; background:#6b7ca3; box-shadow:0 0 0 2px rgba(0,0,0,.3)}
.m-joueur.pret .etat{color:#9be15d} .m-joueur.pret .etat i{background:#9be15d; box-shadow:0 0 10px #9be15d}
.m-joueur.absent{opacity:.45}
.m-joueur .bulle{position:absolute; right:12px; top:-18px; font-size:26px; animation:bulle 2.2s forwards}
.m-joueur{position:relative}
@keyframes bulle{0%{opacity:0; transform:translateY(8px) scale(.6)} 15%{opacity:1; transform:translateY(0) scale(1.1)} 80%{opacity:1} 100%{opacity:0; transform:translateY(-14px)}}
.m-vide{display:grid; grid-template-columns:40px 1fr; align-items:center; gap:12px; padding:10px 12px; border-radius:14px; border:1.5px dashed rgba(255,255,255,.15); color:var(--brume-2); font:600 15px var(--f-ui)}
.m-vide i{width:26px; height:26px; border-radius:50%; border:2px dashed rgba(255,255,255,.25); justify-self:center}
.m-chat{display:flex; gap:8px; justify-content:center}
.m-chat button{width:46px; height:46px; border-radius:50%; background:rgba(255,255,255,.08); font-size:22px; box-shadow:inset 0 0 0 1px rgba(255,255,255,.1); transition:transform .1s}
.m-chat button:active{transform:scale(.9)}
.m-etat{display:flex; align-items:center; gap:10px; justify-content:center; text-align:left; padding:0 6px; font:600 14px var(--f-ui); color:var(--brume-2)}
.m-etat .pt{flex:none; width:9px; height:9px; border-radius:50%; background:#9be15d; box-shadow:0 0 8px #9be15d; animation:lueur 1.6s infinite}
.m-etat .pt.local{background:#ffb347; box-shadow:0 0 8px #ffb347}
.m-depart{text-align:center; display:grid; gap:14px; justify-items:center}
.m-depart .gros{font-family:var(--f-titre); font-size:44px; color:#ffe68f; text-shadow:0 4px 16px rgba(0,0,0,.6)}
.m-sieges{display:flex; gap:10px; flex-wrap:wrap; justify-content:center}
.m-sieges span{display:grid; justify-items:center; gap:4px; font:700 13px var(--f-ui); color:#fff}
.m-sieges .pion-svg{width:34px; height:48px; filter:drop-shadow(0 4px 4px rgba(0,0,0,.6))}
@media (min-width:700px){ .m-grille{display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:start} }
`;
document.head.appendChild(css);

/* ---------- Utilitaires ---------- */
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // sans I et O (confusion avec 1 et 0)
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2));
const codeAleatoire = () => Array.from({length:5}, () => ALPHA[Math.floor(Math.random()*ALPHA.length)]).join("");
const normCode = s => (s||"").toUpperCase().replace(/[^A-Z]/g,"").slice(0,5);
const pions = () => typeof PIONS !== "undefined" ? PIONS : [{nom:"Jaune",c:"#ffd60a"},{nom:"Rose",c:"#ff4fa3"},{nom:"Cyan",c:"#35e0ff"},{nom:"Blanc",c:"#f2f2f2"},{nom:"Lilas",c:"#c59bff"},{nom:"Orange",c:"#ff8a1f"}];
const vibre = ms => { try{ if(navigator.vibrate) navigator.vibrate(ms); }catch(e){} };
const MAX = 6;

/* =========================================================================
   Profil (compte local, synchronisable plus tard)
   ========================================================================= */
const Compte = {
  get(){ return store.get("compte", null); },
  set(c){ store.set("compte", c); },
  nouveau(pseudo, couleur){ return {id:uid(), pseudo, couleur, cree:Date.now()}; },
};

function ecranProfil(apres){
  arreterVitrine();
  const c = Compte.get() || {pseudo:"", couleur:0};
  let couleur = c.couleur;
  app.innerHTML = `
  <section class="ecran">
    <div class="entete-ecran"><button class="icone-btn" id="b-retour" aria-label="Retour">${ICO.retour}</button><h1>${TXT.profil}</h1><span></span></div>
    <div class="m-carte">
      <label class="lbl" for="m-pseudo">${TXT.pseudo}</label>
      <input class="champ" id="m-pseudo" maxlength="14" minlength="2" value="${esc(c.pseudo)}" placeholder="${esc(TXT.pseudo)}" autocomplete="nickname" autocapitalize="words">
      <div class="m-aide">${TXT.pseudoAide}</div>
    </div>
    <div class="m-carte">
      <span class="lbl">${TXT.pion}</span>
      <div class="m-couleurs" id="m-couleurs">${pions().map((p,i)=>`<button aria-pressed="${i===couleur}" data-i="${i}" aria-label="${esc(p.nom)}">${pionSVG(p.c)}</button>`).join("")}</div>
    </div>
    <div class="m-note">${ICO.groupe.replace('<svg','<svg width="22" height="22"')}<span>${TXT.compteLocal}</span></div>
    <button class="bouton piece c-jaune" id="m-ok">${TXT.enregistrer}</button>
  </section>`;
  $("#b-retour").onclick = () => (apres ? apres(false) : ecranAccueil());
  $$("#m-couleurs button").forEach(b => b.onclick = () => { couleur = +b.dataset.i; $$("#m-couleurs button").forEach(x => x.setAttribute("aria-pressed", x===b)); Son.tap(); });
  const valider = () => {
    const pseudo = $("#m-pseudo").value.trim();
    if(pseudo.length < 2){ toast(TXT.pseudoCourt); $("#m-pseudo").focus(); return; }
    const nouveau = Compte.get() ? {...Compte.get(), pseudo, couleur} : Compte.nouveau(pseudo, couleur);
    Compte.set(nouveau); Son.ok(); vibre(20); toast(TXT.profilOk, 1800);
    apres ? apres(true) : ecranAccueil();
  };
  $("#m-ok").onclick = valider;
  $("#m-pseudo").addEventListener("keydown", e => { if(e.key === "Enter") valider(); });
  if(!c.pseudo) setTimeout(() => { const i = $("#m-pseudo"); if(i) i.focus(); }, 350);
}

/* Petit badge de profil pour l'accueil */
function chipProfil(){
  const c = Compte.get();
  if(!c) return `<button class="m-profil-chip vide" id="b-profil">${ICO.groupe.replace('<svg','<svg width="18" height="18"')}<span>${TXT.creerProfil}</span></button>`;
  return `<button class="m-profil-chip" id="b-profil" aria-label="${TXT.profil}">${pionSVG(pions()[c.couleur % pions().length].c)}<span>${esc(c.pseudo)}</span></button>`;
}
const avecProfil = suite => { if(Compte.get()) suite(); else ecranProfil(ok => ok ? suite() : ecranMulti()); };

/* =========================================================================
   Canaux réseau
   ========================================================================= */
class CanalLocal {
  constructor(code){ this.bc = new BroadcastChannel("qln-salon-"+code); this.bc.onmessage = e => this.recevoir && this.recevoir(e.data); this.type = "local"; }
  envoyer(m){ try{ this.bc.postMessage(m); }catch(e){} }
  fermer(){ try{ this.bc.close(); }catch(e){} }
}
class CanalWS {
  /* Protocole relais minimal : le serveur rediffuse tout message JSON reçu sur /salon/<code> aux autres connectés.
     À brancher avec un petit serveur WebSocket ; l'interface est identique à CanalLocal. */
  constructor(code, url){ this.type = "ligne"; this.ws = new WebSocket(url.replace(/\/$/,"")+"/salon/"+code); this.file = [];
    this.ws.onopen = () => { this.file.forEach(m => this.ws.send(JSON.stringify(m))); this.file = []; };
    this.ws.onmessage = e => { try{ this.recevoir && this.recevoir(JSON.parse(e.data)); }catch(x){} };
    this.ws.onclose = () => { this.recevoir && this.recevoir({t:"__coupe"}); }; }
  envoyer(m){ if(this.ws.readyState === 1) this.ws.send(JSON.stringify(m)); else this.file.push(m); }
  fermer(){ try{ this.ws.close(); }catch(e){} }
}
const ouvrirCanal = code => window.QLN_WS_URL ? new CanalWS(code, window.QLN_WS_URL) : new CanalLocal(code);
const canalDispo = () => !!window.QLN_WS_URL || "BroadcastChannel" in window;

/* =========================================================================
   Salon (hôte-autoritaire)
   ========================================================================= */
let S = null; // {code, hote, moi, joueurs:[{id,pseudo,couleur,pret,vu,hote}], canal, timers, phase}
const moi = () => S && S.joueurs.find(j => j.id === S.moi.id);
const estHote = () => S && S.hote;
const envoyer = m => S && S.canal.envoyer({...m, de:S.moi.id, code:S.code});
const fermerSalon = () => { if(!S) return; clearInterval(S.timers.tick); S.canal.fermer(); S = null; };

// Identité dans le salon = compte + onglet (permet de tester à plusieurs onglets dans un même navigateur)
const onglet = () => { try{ let o = sessionStorage.getItem("qln-onglet"); if(!o){ o = Math.random().toString(36).slice(2,8); sessionStorage.setItem("qln-onglet", o); } return o; }catch(e){ return "x"; } };
function joueurDepuisCompte(){ const c = Compte.get(); return {id:c.id+":"+onglet(), pseudo:c.pseudo, couleur:c.couleur, pret:false, vu:Date.now()}; }
function couleurLibre(souhait){
  const prises = new Set(S.joueurs.map(j => j.couleur));
  if(!prises.has(souhait)) return souhait;
  for(let i=0;i<pions().length;i++) if(!prises.has(i)) return i;
  return souhait;
}
function diffuserEtat(){ if(!estHote()) return; envoyer({t:"etat", joueurs:S.joueurs.map(({id,pseudo,couleur,pret,hote})=>({id,pseudo,couleur,pret,hote})), phase:S.phase}); }

function creerSalon(){
  const j = {...joueurDepuisCompte(), hote:true};
  S = {code:codeAleatoire(), hote:true, moi:j, joueurs:[j], canal:null, timers:{}, phase:"attente", rendu:null};
  S.canal = ouvrirCanal(S.code); S.canal.recevoir = recevoir;
  S.timers.tick = setInterval(tick, 2500);
  ecranSalon();
}
function rejoindreSalon(code){
  const j = joueurDepuisCompte();
  S = {code, hote:false, moi:j, joueurs:[], canal:null, timers:{}, phase:"connexion", rendu:null, dernierEtat:0, essais:0};
  S.canal = ouvrirCanal(code); S.canal.recevoir = recevoir;
  envoyer({t:"bonjour", joueur:j});
  S.timers.tick = setInterval(tick, 1200);
  ecranSalon();
}

function tick(){
  if(!S) return;
  const t = Date.now();
  if(estHote()){
    // présence : un joueur silencieux depuis 8 s est retiré
    const avant = S.joueurs.length;
    S.joueurs = S.joueurs.filter(j => j.hote || t - j.vu < 8000);
    if(S.joueurs.length !== avant) rafraichir();
    diffuserEtat();
  } else {
    envoyer({t:"ping"});
    if(S.phase === "connexion"){ if(++S.essais === 3) envoyer({t:"bonjour", joueur:S.moi}); if(S.essais >= 6){ fermerSalon(); ecranMulti(); toast(TXT.introuvable, 5000); } }
    else if(t - S.dernierEtat > 8000){ fermerSalon(); ecranMulti(); toast(TXT.salonFerme); }
  }
}

function recevoir(m){
  if(!S || !m || m.code !== S.code || m.de === S.moi.id) { if(m && m.t === "__coupe" && S){ fermerSalon(); ecranMulti(); toast(TXT.salonFerme); } return; }
  const j = S.joueurs.find(x => x.id === m.de);
  if(estHote()){
    switch(m.t){
      case "bonjour": {
        if(j){ j.vu = Date.now(); diffuserEtat(); break; }
        if(S.phase !== "attente"){ envoyer({t:"refus", pour:m.de, raison:"enCours"}); break; }
        if(S.joueurs.length >= MAX){ envoyer({t:"refus", pour:m.de, raison:"plein"}); break; }
        const couleur = couleurLibre(m.joueur.couleur);
        S.joueurs.push({...m.joueur, couleur, pret:false, vu:Date.now(), hote:false});
        if(couleur !== m.joueur.couleur) envoyer({t:"info", pour:m.de, texte:"couleurPrise"});
        toast(TXT.rejoint(m.joueur.pseudo), 2200); Son.ok(); vibre(15);
        rafraichir(); diffuserEtat(); break; }
      case "ping": if(j){ j.vu = Date.now(); } break;
      case "pret": if(j){ j.pret = !!m.pret; j.vu = Date.now(); rafraichir(); diffuserEtat(); Son.tap(); } break;
      case "quitter": if(j){ S.joueurs = S.joueurs.filter(x => x !== j); toast(TXT.parti(j.pseudo), 2200); rafraichir(); diffuserEtat(); } break;
      case "chat": if(j){ j.vu = Date.now(); bulle(j.id, m.emoji); envoyer({t:"chat", emoji:m.emoji, auteur:j.id}); } break;
    }
  } else {
    switch(m.t){
      case "etat": {
        const premier = S.phase === "connexion";
        S.dernierEtat = Date.now(); S.phase = m.phase;
        S.joueurs = m.joueurs.map(x => ({...x, vu:Date.now()}));
        const me = moi(); if(me) S.moi.couleur = me.couleur;
        if(premier){ Son.ok(); vibre(15); }
        if(m.phase === "jeu" && !S.rendu?.jeu) ecranDepart(); else rafraichir();
        break; }
      case "refus": if(m.pour === S.moi.id){ fermerSalon(); ecranMulti(); toast(TXT[m.raison] || TXT.introuvable, 5000); } break;
      case "info": if(m.pour === S.moi.id) toast(TXT[m.texte] || m.texte, 3500); break;
      case "chat": bulle(m.auteur, m.emoji); break;
      case "demarrer": S.phase = "jeu"; S.graine = m.graine; ecranDepart(); break;
      case "ferme": fermerSalon(); ecranMulti(); toast(TXT.salonFerme); break;
    }
  }
}

function bulle(id, emoji){
  const el = $(`.m-joueur[data-id="${id}"]`); if(!el) return;
  $$(".bulle", el).forEach(b => b.remove());
  const b = document.createElement("span"); b.className = "bulle"; b.textContent = emoji; el.appendChild(b); Son.tap();
}

/* ---------- Actions joueur ---------- */
function basculerPret(){
  const me = moi(); if(!me) return;
  me.pret = !me.pret; Son.tap(); vibre(10);
  if(estHote()){ rafraichir(); diffuserEtat(); } else { envoyer({t:"pret", pret:me.pret}); rafraichir(); }
}
function envoyerEmoji(e){ if(!S) return; if(estHote()){ bulle(S.moi.id, e); envoyer({t:"chat", emoji:e, auteur:S.moi.id}); } else envoyer({t:"chat", emoji:e}); }
function quitterSalon(){
  const v = panneau({classe:"c-orange", titre:TXT.quitterQ, corps:`<p class="texte-centre">${estHote() ? TXT.quitterHoteQ : ""}</p>
    <div class="duo"><button class="bouton piece c-noir" id="q-non">${TXT.non}</button><button class="bouton piece c-rouge" id="q-oui">${TXT.oui}</button></div>`});
  $("#q-non", v).onclick = () => v.remove();
  $("#q-oui", v).onclick = () => { v.remove(); if(estHote()) envoyer({t:"ferme"}); else envoyer({t:"quitter"}); fermerSalon(); ecranMulti(); };
}
function lancer(){
  if(!estHote()) return;
  const n = S.joueurs.length;
  if(n < 2 || !S.joueurs.every(j => j.pret)){ toast(TXT.lancerAide(n)); return; }
  S.phase = "jeu"; S.graine = Math.floor(Math.random()*1e9);
  envoyer({t:"demarrer", graine:S.graine}); diffuserEtat();
  Son.fin(); vibre([30,40,30]);
  ecranDepart();
}

/* =========================================================================
   Écrans
   ========================================================================= */
function ecranMulti(){
  arreterVitrue();
}
function arreterVitrue(){} // (remplacé ci-dessous : garde la compatibilité si arreterVitrine n'existe pas)

function ecranMulti(){
  if(typeof arreterVitrine === "function") arreterVitrine();
  fermerSalon();
  const c = Compte.get();
  app.innerHTML = `
  <section class="ecran">
    <div class="entete-ecran"><button class="icone-btn" id="b-retour" aria-label="Retour">${ICO.retour}</button><h1>${TXT.multi}</h1><span></span></div>
    <p class="sous-titre">${TXT.sousTitre}</p>
    <div class="m-carte" style="grid-template-columns:1fr auto; align-items:center">
      <div style="display:flex; align-items:center; gap:12px; min-width:0">${c ? pionSVG(pions()[c.couleur % pions().length].c, "") : ""}<div style="min-width:0"><span class="lbl">${TXT.profil}</span><div style="font:700 20px var(--f-ui); color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${c ? esc(c.pseudo) : "—"}</div></div></div>
      <button class="bouton-plat" id="m-profil">${c ? TXT.modifier : TXT.creerProfil}</button>
    </div>
    <div class="m-choix">
      <button class="mode piece c-multi" id="m-creer"><span class="ico">${ICO.groupe}</span><span><span class="nom">${TXT.creerSalon}</span><span class="desc">${TXT.creerSalonDesc}</span></span></button>
      <button class="mode piece c-bleu" id="m-rejoindre"><span class="ico">${ICO.cible || ICO.groupe}</span><span><span class="nom">${TXT.rejoindre}</span><span class="desc">${TXT.rejoindreDesc}</span></span></button>
    </div>
    <div class="m-carte" id="m-zone-code" hidden>
      <label class="lbl" for="m-code">${TXT.code}</label>
      <div class="m-saisie"><input class="champ" id="m-code" maxlength="5" placeholder="ABCDE" autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="latin"><button class="bouton piece c-jaune" id="m-go" style="width:auto; padding:0 18px">OK</button></div>
    </div>
    <div class="m-note">${ICO.livre ? ICO.livre.replace('<svg','<svg width="22" height="22"') : ""}<span>${TXT.reglesSalon}</span></div>
    <div class="m-etat"><i class="pt ${window.QLN_WS_URL ? "" : "local"}"></i>${window.QLN_WS_URL ? TXT.modeLigne : TXT.modeLocal}</div>
  </section>`;
  $("#b-retour").onclick = ecranAccueil;
  $("#m-profil").onclick = () => ecranProfil(() => ecranMulti());
  $("#m-creer").onclick = () => avecProfil(creerSalon);
  $("#m-rejoindre").onclick = () => { const z = $("#m-zone-code"); z.hidden = !z.hidden; if(!z.hidden){ $("#m-code").focus(); z.scrollIntoView({behavior:"smooth", block:"center"}); } };
  const go = () => { const code = normCode($("#m-code").value); if(code.length < 5){ toast(TXT.codeCourt); return; } avecProfil(() => rejoindreSalon(code)); };
  $("#m-go").onclick = go;
  $("#m-code").addEventListener("input", e => { e.target.value = normCode(e.target.value); if(e.target.value.length === 5) Son.tap(); });
  $("#m-code").addEventListener("keydown", e => { if(e.key === "Enter") go(); });
  const code = new URLSearchParams(location.search).get("salon");
  if(code && normCode(code).length === 5){ history.replaceState(null, "", location.pathname); $("#m-zone-code").hidden = false; $("#m-code").value = normCode(code); }
}

function ecranSalon(){
  app.innerHTML = `
  <section class="ecran">
    <div class="entete-ecran"><button class="icone-btn" id="b-quitter" aria-label="${TXT.quitter}">${ICO.croix}</button><h1>${TXT.salon}</h1><span></span></div>
    <div class="m-grille">
      <div class="m-carte">
        <span class="lbl">${TXT.code}</span>
        <div class="m-code" aria-label="${TXT.code} ${S.code}">${S.code.split("").map(l => `<b>${l}</b>`).join("")}</div>
        <div class="m-aide texte-centre">${TXT.codeAide}</div>
        <div class="m-code-actions"><button class="bouton-plat" id="m-copier">${TXT.copier}</button>${navigator.share ? `<button class="bouton-plat" id="m-partager">${TXT.partager}</button>` : ""}</div>
      </div>
      <div class="m-carte">
        <span class="lbl">${TXT.joueurs} <span id="m-nb"></span></span>
        <div class="m-liste" id="m-liste"></div>
        <div class="m-chat" aria-label="${TXT.chatAide}">${TXT.chat.map(e => `<button data-e="${e}">${e}</button>`).join("")}</div>
      </div>
    </div>
    <div class="m-etat" id="m-msg"></div>
    <div class="duo" id="m-actions"></div>
  </section>`;
  S.rendu = {salon:true};
  $("#b-quitter").onclick = quitterSalon;
  $("#m-copier").onclick = async () => { try{ await navigator.clipboard.writeText(S.code); toast(TXT.copie, 1500); Son.tap(); }catch(e){ toast(S.code); } };
  const bp = $("#m-partager"); if(bp) bp.onclick = () => navigator.share({title:"Le-QLN", text:TXT.partageTexte(S.code), url:location.origin+location.pathname+"?salon="+S.code}).catch(()=>{});
  $$(".m-chat button").forEach(b => b.onclick = () => envoyerEmoji(b.dataset.e));
  rafraichir();
}

function rafraichir(){
  if(!S || !S.rendu?.salon || !$("#m-liste")) return;
  const me = moi();
  $("#m-nb").textContent = `${S.joueurs.length}/${MAX}`;
  $("#m-liste").innerHTML = S.joueurs.map((j,i) => `<div class="m-joueur ${j.pret?"pret":""}" data-id="${j.id}" style="animation-delay:${i*50}ms">${pionSVG(pions()[j.couleur % pions().length].c)}
      <span class="nom">${esc(j.pseudo)}${j.hote?`<small>${TXT.hote}</small>`:""}${j.id===S.moi.id?`<small class="vous">${TXT.vous}</small>`:""}</span>
      <span class="etat"><i></i>${j.pret ? TXT.pret : TXT.pasPret}</span></div>`).join("")
    + (S.joueurs.length < MAX ? `<div class="m-vide"><i></i>${TXT.attente}</div>` : "");
  const n = S.joueurs.length, tousPrets = n >= 2 && S.joueurs.every(j => j.pret);
  $("#m-msg").innerHTML = S.phase === "connexion" ? `<i class="pt local"></i>${TXT.connexion}` : (estHote() ? (tousPrets ? "" : `<i class="pt ${S.canal.type==="local"?"local":""}"></i>${TXT.lancerAide(n)}`) : `<i class="pt ${S.canal.type==="local"?"local":""}"></i>${TXT.attenteHote}`);
  $("#m-actions").innerHTML = `<button class="bouton piece ${me && me.pret ? "c-noir" : "c-vert"}" id="m-pret" ${S.phase==="connexion"?"disabled":""}>${me && me.pret ? TXT.plusPret : TXT.jeSuisPret}</button>`
    + (estHote() ? `<button class="bouton piece c-jaune" id="m-lancer" ${tousPrets ? "" : "disabled"}>${TXT.lancer}</button>` : "");
  $("#m-pret").onclick = basculerPret;
  const bl = $("#m-lancer"); if(bl) bl.onclick = lancer;
}

function ecranDepart(){
  if(!S) return;
  S.rendu = {jeu:true};
  app.innerHTML = `
  <section class="ecran">
    <div class="entete-ecran"><span></span><h1>${TXT.salon} ${S.code}</h1><span></span></div>
    <div class="m-carte m-depart">
      <div class="gros">${TXT.depart}</div>
      <div class="m-sieges">${S.joueurs.map(j => `<span>${pionSVG(pions()[j.couleur % pions().length].c)}${esc(j.pseudo)}</span>`).join("")}</div>
    </div>
    <div class="m-carte">
      <span class="lbl">${TXT.etape}</span>
      <div class="m-aide">${TXT.etapeTexte}</div>
    </div>
    <div class="duo"><button class="bouton piece c-noir" id="m-retour">${TXT.retourSalon}</button><button class="bouton piece c-jaune" id="m-accueil">${TXT.retourAccueil}</button></div>
  </section>`;
  if(typeof confettis === "function") setTimeout(() => confettis(120), 300);
  $("#m-retour").onclick = () => { S.phase = "attente"; S.joueurs.forEach(j => j.pret = false); if(estHote()) diffuserEtat(); ecranSalon(); };
  $("#m-accueil").onclick = () => { if(estHote()) envoyer({t:"ferme"}); else envoyer({t:"quitter"}); fermerSalon(); ecranAccueil(); };
}

// Lien direct ?salon=CODE → ouvre l'écran multijoueur avec le code pré-rempli
function lienDirect(){ const code = new URLSearchParams(location.search).get("salon"); if(code && normCode(code).length === 5){ ecranMulti(); return true; } return false; }

addEventListener("pagehide", () => { if(S){ if(estHote()) envoyer({t:"ferme"}); else envoyer({t:"quitter"}); } });

return { ecran:ecranMulti, profil:ecranProfil, compte:() => Compte.get(), chipProfil, lienDirect, dispo:canalDispo, TXT, stop:fermerSalon };
})();
