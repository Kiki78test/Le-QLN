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
  quitter:"Quitter le salon", quitterQ:"Quitter le salon ?", quitterHoteQ:"Vous êtes l'hôte : un autre joueur prendra la main.", oui:"Quitter", non:"Rester",
  salonFerme:"L'hôte a fermé le salon.", introuvable:"Aucun salon avec ce code. Vérifiez le code, et que l'hôte a bien le salon ouvert.",
  plein:"Ce salon est complet (6 joueurs).", enCours:"La partie de ce salon a déjà commencé.", couleurPrise:"Un joueur a déjà ce pion : la couleur a été ajustée.",
  rejoint:n=>`${n} a rejoint le salon.`, parti:n=>`${n} a quitté le salon.`, connexion:"Connexion au salon…",
  depart:"La partie va commencer !", etape:"Prochaine étape", etapeTexte:"Le salon fonctionne : profils, codes, présence, « prêt » et lancement sont synchronisés entre les joueurs. La partie elle-même sur le plateau (dés, cartes et sabliers partagés) est l'étape suivante, avec le serveur.",
  retourAccueil:"Retour à l'accueil", retourSalon:"Retour au salon",
  modeLocal:"Mode test local : les joueurs doivent être dans le même navigateur (plusieurs onglets). Le serveur en ligne arrivera ensuite.",
  modeLigne:"Connecté au serveur Le-QLN.",
  chat:["👋","😄","🔥","😮","⏳","👏"], chatAide:"Réactions rapides",
  reglesSalon:"Mêmes règles que « Contre l'IA » : plateau complet, enchères, prison.",
  ouverts:"Salons ouverts", aucunSalon:"Aucun salon ouvert pour l'instant : créez le vôtre !", salonDe:n=>`Salon de ${n}`, rejoindreBtn:"Rejoindre",
  coupe:"Connexion au serveur perdue.", serveurAttente:"Connexion au serveur… (le premier réveil peut prendre 30 s)",
  rapide:"Partie rapide", rapideDesc:"Rejoignez un salon au hasard, le plus vite possible.", rapideRecherche:"Recherche d'un salon…",
  rapideCree:"Aucun salon en attente : le vôtre est ouvert. La partie démarre dès que d'autres joueurs arrivent.", rapideEchec:"Impossible de trouver un salon pour l'instant, réessayez.",
  enAttente:"Salons en attente", placesLibres:n=>`${n} place${n>1?"s":""} libre${n>1?"s":""}`, enLigneN:n=>`${n} joueur${n>1?"s":""} en ligne`,
  decompte:s=>`La partie démarre dans ${s} s`, autoAide:"Partie rapide : la partie démarre toute seule dès que 2 joueurs sont là.", lancerMaintenant:"Lancer maintenant",
  nouvelHote:n=>`${n} est maintenant l'hôte du salon.`, vousHote:"Vous êtes maintenant l'hôte du salon.", reconnexion:"Connexion perdue : reconnexion… (l'IA joue pour vous en attendant)",
  reprendre:"Reprendre la partie en cours", reprendreDesc:c=>`Salon ${c} : l'IA a joué pour vous pendant votre absence.`, langue:"Langue", toutes:"Toutes", nomsLangues:{fr:"Français", en:"English"},
  version:"Ce salon joue dans une autre langue ou avec une autre version du jeu. Mettez l'appli à jour, ou créez votre salon.", avecCode:"Avec un code", objectif:"Objectif : finir le plus riche. Arriver 1er ne rapporte que +100 €.", horsLigne:"Hors connexion : le multijoueur revient dès que le réseau est de retour. Les autres modes restent jouables.",
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
.m-carte > div > .pion-svg{width:28px; height:38px; flex:none; filter:drop-shadow(0 3px 3px rgba(0,0,0,.6))}
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
.m-salon{grid-template-columns:40px 1fr auto} .m-salon .bouton-plat{font-size:15px; padding:6px 10px; color:#ffe68f}
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
.m-pions{display:flex; align-items:flex-end; min-width:40px} .m-pions .pion-svg{width:20px; height:28px; margin-right:-8px; filter:drop-shadow(0 2px 2px rgba(0,0,0,.6))}
.m-salon .nom small{display:block; background:none; padding:0; color:var(--brume); font:600 13px var(--f-ui); letter-spacing:.03em; text-transform:none}
.m-salon .nom small.rap{display:inline-block; background:linear-gradient(#ffe066,#e0a800); color:#1b1a05; padding:2px 8px; border-radius:999px; font:800 11px var(--f-ui); letter-spacing:.08em; text-transform:uppercase}
.m-salon{grid-template-columns:auto 1fr auto; gap:10px}
.m-objectif{display:flex; align-items:center; justify-content:center; gap:8px; padding:8px 12px; border-radius:12px; text-align:center; font:700 14.5px var(--f-ui); color:#3a2a00; background:linear-gradient(180deg,#fff3c0,#ffd95e); box-shadow:inset 0 0 0 1.5px rgba(160,110,0,.35)} .m-objectif i{font-style:normal; font-size:17px}
.m-choix .m-rapide{width:100%; margin:2px 0; grid-column:1/-1; min-height:0; padding:16px 44px 16px 16px; gap:14px}
.m-rapide .ico{flex:none} .m-rapide[disabled]{opacity:.75}
.m-langues{display:flex; gap:6px; flex-wrap:wrap}
.m-langues button{border:0; border-radius:999px; padding:6px 12px; font:700 14px var(--f-ui); color:var(--brume); background:rgba(255,255,255,.07); box-shadow:inset 0 0 0 1px rgba(255,255,255,.12); cursor:pointer}
.m-langues button[aria-pressed="true"]{color:#1b1400; background:var(--or-grad); box-shadow:0 0 12px rgba(255,207,58,.4)}
.m-en-ligne{font:600 13px var(--f-ui); color:var(--brume-2); display:flex; align-items:center; gap:7px} .m-en-ligne i{width:8px; height:8px; border-radius:50%; background:#9be15d; box-shadow:0 0 8px #9be15d}
@media (min-width:700px){ .m-grille{display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:start} }
`;
document.head.appendChild(css);

/* ---------- Utilitaires ---------- */
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // sans I et O (confusion avec 1 et 0)
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2));
const codeAleatoire = () => Array.from({length:5}, () => ALPHA[Math.floor(Math.random()*ALPHA.length)]).join("");
const normCode = s => (s||"").toUpperCase().replace(/[^A-Z]/g,"").slice(0,5);
const pions = () => typeof PIONS !== "undefined" ? PIONS : [{nom:"Jaune",c:"#ffd60a"},{nom:"Rose",c:"#ff4fa3"},{nom:"Cyan",c:"#35e0ff"},{nom:"Blanc",c:"#f2f2f2"},{nom:"Lilas",c:"#c59bff"},{nom:"Orange",c:"#ff8a1f"}];
const vibre = ms => { try{ if(navigator.vibrate && store.get("vibrations", true)) navigator.vibrate(Array.isArray(ms) ? ms.map((x, i) => i % 2 ? x : Math.max(4, Math.round(x*.4))) : Math.max(4, Math.round(ms*.4))); }catch(e){} };   // vibrations douces
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
      <div class="m-couleurs" id="m-couleurs">${pions().map((p,i)=>`<button aria-pressed="${i===couleur}" data-i="${i}" aria-label="${esc(p.nom)}">${jetonSVG(p.c)}</button>`).join("")}</div>
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
  return `<button class="m-profil-chip" id="b-profil" aria-label="${TXT.profil}">${jetonSVG(pions()[c.couleur % pions().length].c)}<span>${esc(c.pseudo)}</span></button>`;
}
const avecProfil = suite => { if(Compte.get()) suite(); else ecranProfil(ok => ok ? suite() : ecranMulti()); };

/* =========================================================================
   Réseau : canal d'un salon + annuaire des salons ouverts
   Deux implémentations, même interface :
     local  → BroadcastChannel (onglets du même navigateur, sans serveur)
     ligne  → WebSocket vers le serveur relais (server/index.js), activé par window.QLN_WS_URL
   ========================================================================= */
const enLigne = () => !!window.QLN_WS_URL;

/* --- Socket partagée (mode ligne) --- */
const Socket = {
  ws:null, file:[], abonnes:new Set(), etat:"ferme", tentatives:0,
  ouvrir(){
    if(this.ws && this.ws.readyState <= 1) return;
    this.etat = "connexion"; const ws = this.ws = new WebSocket(window.QLN_WS_URL);
    ws.onopen = () => { if(ws !== this.ws) return; this.etat = "ouvert"; this.tentatives = 0; this.file.forEach(m => ws.send(JSON.stringify(m))); this.file = []; this.abonnes.forEach(f => f({t:"__ouvert"})); };
    ws.onmessage = e => { if(ws !== this.ws) return; let m; try{ m = JSON.parse(e.data); }catch(x){ return; } this.abonnes.forEach(f => f(m)); };
    ws.onclose = () => { if(ws !== this.ws) return; this.etat = "ferme"; this.abonnes.forEach(f => f({t:"__coupe"})); if(this.abonnes.size && this.tentatives < 5){ this.tentatives++; setTimeout(() => this.ouvrir(), 1500*this.tentatives); } };
    ws.onerror = () => {};
  },
  envoyer(m){ if(this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(m)); else { this.file.push(m); this.ouvrir(); } },
  // la socket reste ouverte entre les écrans (annuaire → salon) ; le serveur coupe les clients muets
  ecouter(f){ this.abonnes.add(f); this.ouvrir(); return () => { this.abonnes.delete(f); }; },
};

/* --- Canal d'un salon --- */
class CanalLocal {
  constructor(code){ this.type = "local"; this.bc = new BroadcastChannel("qln-salon-"+code); this.bc.onmessage = e => this.recevoir && this.recevoir(e.data); }
  envoyer(m){ try{ this.bc.postMessage(m); }catch(e){} }
  fermer(){ try{ this.bc.close(); }catch(e){} }
}
class CanalWS {
  constructor(code, hote, id){ this.type = "ligne"; this.code = code;
    this.off = Socket.ecouter(m => { if(m.t === "__ouvert"){ Socket.envoyer({t:"entrer", code, hote, de:id}); this.recevoir && this.recevoir({t:"__ouvert"}); return; } if(m.t === "__coupe"){ this.recevoir && this.recevoir({t:"__coupe"}); return; } if(m.code === code && this.recevoir) this.recevoir(m); });
    if(Socket.etat === "ouvert") Socket.envoyer({t:"entrer", code, hote, de:id}); }
  envoyer(m){ Socket.envoyer(m); }
  fermer(){ Socket.envoyer({t:"sortir", code:this.code}); this.off(); }
}
const ouvrirCanal = (code, hote, id) => enLigne() ? new CanalWS(code, hote, id) : new CanalLocal(code);
const canalDispo = () => enLigne() || "BroadcastChannel" in window;

/* --- Annuaire : liste des salons ouverts, visible de tous --- */
const Annuaire = {
  bc:null, off:null, carte:new Map(), fn:null, timer:null,
  ecouter(fn){
    this.arreter(); this.fn = fn; this.carte.clear();
    if(enLigne()){
      this.off = Socket.ecouter(m => { if(m.t === "__ouvert") Socket.envoyer({t:"annuaire"}); else if(m.t === "salons") fn(m.liste || [], "ligne", m.en_ligne); else if(m.t === "__coupe") fn(null, "coupe"); });
      if(Socket.etat === "ouvert") Socket.envoyer({t:"annuaire"});
    } else {
      this.bc = new BroadcastChannel("qln-annuaire");
      this.bc.onmessage = e => { const m = e.data; if(!m) return; if(m.t === "publier") this.carte.set(m.resume.code, {...m.resume, vu:Date.now()}); if(m.t === "depublier") this.carte.delete(m.code); this.pousser(); };
      this.bc.postMessage({t:"demande"});
      this.timer = setInterval(() => { const t = Date.now(); let chg = false; for(const [c,r] of this.carte) if(t - r.vu > 7000){ this.carte.delete(c); chg = true; } if(chg) this.pousser(); }, 2000);
      this.pousser();
    }
  },
  pousser(){ if(this.fn) this.fn([...this.carte.values()].filter(r => r.phase === "attente"), "local"); },
  arreter(){ if(this.off){ if(Socket.etat === "ouvert") Socket.envoyer({t:"annuaire-stop"}); this.off(); this.off = null; } if(this.bc){ this.bc.close(); this.bc = null; } clearInterval(this.timer); this.fn = null; },
  // côté hôte
  publier(resume){ if(enLigne()) Socket.envoyer({t:"publier", resume}); else { try{ this.canalPub().postMessage({t:"publier", resume}); }catch(e){} } },
  depublier(code){ if(!enLigne()){ try{ this.canalPub().postMessage({t:"depublier", code}); }catch(e){} } },
  canalPub(){ if(!this.pub){ this.pub = new BroadcastChannel("qln-annuaire"); this.pub.onmessage = e => { if(e.data && e.data.t === "demande" && S && estHote()) publierSalon(); }; } return this.pub; },
};
function resumeSalon(){ const h = S.joueurs.find(j => j.hote) || S.moi; return {code:S.code, lang:LANGUE_JEU, hote:h.pseudo, couleur:h.couleur, nb:S.joueurs.length, max:MAX, phase:S.phase, auto:!!S.auto, joueurs:S.joueurs.slice(0, MAX).map(j => ({pseudo:j.pseudo, couleur:j.couleur})), t:Date.now()}; }
function publierSalon(){ if(S && estHote()) Annuaire.publier(resumeSalon()); }

/* =========================================================================
   Salon (hôte-autoritaire)
   ========================================================================= */
let S = null; // {code, hote, moi, joueurs:[{id,pseudo,couleur,pret,vu,hote}], canal, timers, phase}
const moi = () => S && S.joueurs.find(j => j.id === S.moi.id);
const estHote = () => S && S.hote;
const envoyer = m => S && S.canal.envoyer({...m, de:S.moi.id, code:S.code});
const fermerSalon = () => { if(!S) return; if(typeof PlateauIA !== "undefined" && PlateauIA.enCours()) PlateauIA.arreter(); clearInterval(S.timers.tick); clearInterval(S.timers.auto); clearInterval(S.timers.aff); if(estHote()) Annuaire.depublier(S.code); S.canal.fermer(); S = null; };

// Identité dans le salon = compte + onglet (permet de tester à plusieurs onglets dans un même navigateur)
const onglet = () => { try{ let o = sessionStorage.getItem("qln-onglet"); if(!o){ o = Math.random().toString(36).slice(2,8); sessionStorage.setItem("qln-onglet", o); } return o; }catch(e){ return "x"; } };
// langue et version du dictionnaire : la partie est rejouée à l'identique sur chaque appareil, il faut les mêmes cartes partout
const LANGUE_JEU = document.documentElement.lang === "en" ? "en" : "fr";
const DRAP = new Proxy({fr:"🇫🇷", en:"🇬🇧"}, {get:(o, k) => typeof Series !== "undefined" && Series.drapeau ? Series.drapeau(k) : o[k]});   // (pastille si l'appareil n'affiche pas les drapeaux)
const signatureDico = () => { try{ return Object.keys(DICO).map(k => DICO[k].length).join("."); }catch(e){ return ""; } };
function joueurDepuisCompte(){ const c = Compte.get(); return {id:c.id+":"+onglet(), pseudo:c.pseudo, couleur:c.couleur, pret:false, vu:Date.now(), lang:LANGUE_JEU, dico:signatureDico()}; }
function couleurLibre(souhait){
  const prises = new Set(S.joueurs.map(j => j.couleur));
  if(!prises.has(souhait)) return souhait;
  for(let i=0;i<pions().length;i++) if(!prises.has(i)) return i;
  return souhait;
}
const delaiAuto = n => n >= MAX ? 3 : (window.QLN_RAPIDE_DELAI || 10);
function resteAuto(){ return S && S.auto && S.depart ? Math.max(0, Math.ceil((S.depart - Date.now())/1000)) : null; }
function diffuserEtat(){ if(!estHote()) return; envoyer({t:"etat", joueurs:S.joueurs.map(({id,pseudo,couleur,pret,hote})=>({id,pseudo,couleur,pret,hote})), phase:S.phase, auto:!!S.auto, reste:resteAuto(),
  ...(S.phase === "jeu" ? {graine:S.graine, partie:S.partie} : {})}); }

function creerSalon(opt = {}){
  Annuaire.arreter();
  const j = {...joueurDepuisCompte(), hote:true, pret:!!opt.auto};
  S = {code:codeAleatoire(), hote:true, moi:j, joueurs:[j], canal:null, timers:{}, phase:"attente", rendu:null, auto:!!opt.auto, depart:null, nbAvant:1};
  S.canal = ouvrirCanal(S.code, true, j.id); S.canal.recevoir = recevoir;
  S.timers.tick = setInterval(tick, 2500);
  if(S.auto) S.timers.auto = setInterval(autoTick, 1000);
  publierSalon();
  ecranSalon();
  if(S.auto) toast(TXT.rapideCree, 4500);
}
/* partie rapide : l'hôte lance tout seul, quelques secondes après l'arrivée du 2e joueur (3 s si le salon est plein) */
function autoTick(){
  if(!S || !estHote() || !S.auto || S.phase !== "attente") return;
  const n = S.joueurs.length;
  if(n < 2){ if(S.depart){ S.depart = null; diffuserEtat(); } S.nbAvant = n; majMsg(); return; }
  if(!S.depart || n !== S.nbAvant){ S.depart = Date.now() + delaiAuto(n)*1000; S.nbAvant = n; diffuserEtat(); }
  if(Date.now() >= S.depart){ S.joueurs.forEach(j => j.pret = true); lancer(); return; }
  majMsg();
}
function rejoindreSalon(code, opt = {}){
  Annuaire.arreter();
  const j = joueurDepuisCompte();
  if(opt.reprise) j.id = opt.reprise;   // retour dans une partie en cours : même identité qu'avant
  S = {code, hote:false, moi:j, joueurs:[], canal:null, timers:{}, phase:"connexion", rendu:null, dernierEtat:0, essais:0, rapide:!!opt.rapide, auto:false, reste:null, resteT:0};
  S.timers.aff = setInterval(() => { if(S && S.auto) majMsg(); }, 1000);
  S.canal = ouvrirCanal(code, false, j.id); S.canal.recevoir = recevoir;
  if(S.canal.type === "local" || Socket.etat === "ouvert") envoyer({t:"bonjour", joueur:j});
  S.timers.tick = setInterval(tick, 1200);
  ecranSalon();
}

let rapideEssais = 0;
function echecRejoindre(msg, ms = 5000){   // renvoie vrai si on retente une partie rapide au lieu d'afficher l'échec
  const rap = S && S.rapide; fermerSalon();
  if(rap && rapideEssais++ < 3){ partieRapide(true); return true; }
  ecranMulti(); toast(msg, ms); return false;
}
function tick(){
  if(!S) return;
  const t = Date.now();
  if(estHote()){
    // présence : un joueur silencieux depuis 8 s est retiré
    const avant = S.joueurs.length;
    S.joueurs = S.joueurs.filter(j => j.hote || t - j.vu < 8000);
    if(S.joueurs.length !== avant) rafraichir();
    diffuserEtat(); publierSalon();
  } else {
    envoyer({t:"ping"});
    if(S.phase === "connexion"){ if(++S.essais === 3) envoyer({t:"bonjour", joueur:S.moi}); if(S.essais >= 6){ echecRejoindre(TXT.introuvable); return; } }
    else if(t - S.dernierEtat > 8000){ fermerSalon(); ecranMulti(); toast(TXT.salonFerme); }
  }
}

function recevoir(m){
  if(m && m.t === "__coupe" && S){
    if(S.canal.type !== "ligne") return;
    if(S.phase === "jeu" && typeof PlateauIA !== "undefined" && PlateauIA.enCours()){ toast(TXT.reconnexion, 5000); return; }   // la partie continue : on se reconnecte
    fermerSalon(); ecranMulti(); toast(TXT.coupe, 5000); return; }
  if(m && m.t === "__ouvert" && S){
    if(!estHote()) envoyer({t:"bonjour", joueur:S.moi});
    if(S.phase === "jeu") envoyer({t:"resync"});   // décisions manquées pendant la coupure
    return; }
  if(!S || !m || m.code !== S.code || m.de === S.moi.id) return;
  let j = S.joueurs.find(x => x.id === m.de);
  // pendant la partie, un joueur retiré pour silence (appli en arrière-plan…) qui se manifeste reprend sa place
  if(!j && estHote() && S.phase === "jeu" && S.partie && (m.t === "ping" || m.t === "act")){
    const p = S.partie.find(x => x.id === m.de);
    if(p){ j = {...p, pret:true, vu:Date.now(), hote:false}; S.joueurs.push(j); diffuserEtat(); }
  }
  if(m.de === "serveur"){
    if(m.t === "hote-change"){ changerHote(m.nouveau, m.ancien); return; }
    if(m.t === "ferme"){ fermerSalon(); ecranMulti(); toast(TXT.salonFerme); }
    else if(m.t === "refus" && m.pour === S.moi.id){ echecRejoindre(TXT[m.raison] || TXT.introuvable); }
    return;
  }
  if(m.t === "hote-change"){ changerHote(m.nouveau, m.ancien); return; }
  if(m.t === "etat" && estHote() && m.de !== S.moi.id) changerHote(m.de, null);   // (j'étais coupé : un autre joueur est devenu l'hôte)
  if(estHote()){
    switch(m.t){
      case "resync": if(S.phase === "jeu" && typeof PlateauIA !== "undefined") envoyer({t:"journal", pour:m.de, decs:PlateauIA.journalMulti()}); break;
      case "bonjour": {
        if(j){ j.vu = Date.now(); diffuserEtat(); if(S.phase === "jeu" && typeof PlateauIA !== "undefined") envoyer({t:"reprise", pour:m.de, graine:S.graine, partie:S.partie, decs:PlateauIA.journalMulti()}); break; }
        if(S.phase === "jeu" && S.partie && S.partie.some(x => x.id === m.de)){   // un joueur de la partie revient (appli relancée)
          const p = S.partie.find(x => x.id === m.de);
          S.joueurs.push({...p, pret:true, vu:Date.now(), hote:false}); diffuserEtat();
          envoyer({t:"reprise", pour:m.de, graine:S.graine, partie:S.partie, decs:typeof PlateauIA !== "undefined" ? PlateauIA.journalMulti() : []}); break; }
        if(S.phase !== "attente"){ envoyer({t:"refus", pour:m.de, raison:"enCours"}); break; }
        if(S.joueurs.length >= MAX){ envoyer({t:"refus", pour:m.de, raison:"plein"}); break; }
        if((m.joueur.lang || "fr") !== LANGUE_JEU || (m.joueur.dico && m.joueur.dico !== signatureDico())){ envoyer({t:"refus", pour:m.de, raison:"version"}); break; }
        const couleur = couleurLibre(m.joueur.couleur);
        S.joueurs.push({...m.joueur, couleur, pret:!!S.auto, vu:Date.now(), hote:false});
        if(couleur !== m.joueur.couleur) envoyer({t:"info", pour:m.de, texte:"couleurPrise"});
        toast(TXT.rejoint(m.joueur.pseudo), 2200); Son.ok(); vibre(15);
        rafraichir(); diffuserEtat(); publierSalon(); break; }
      case "ping": if(j){ j.vu = Date.now(); } break;
      case "pret": if(j){ j.pret = !!m.pret; j.vu = Date.now(); rafraichir(); diffuserEtat(); Son.tap(); } break;
      case "quitter": if(j){ S.joueurs = S.joueurs.filter(x => x !== j); toast(TXT.parti(j.pseudo), 2200); rafraichir(); diffuserEtat(); publierSalon(); } break;
      case "chat": if(j){ j.vu = Date.now(); bulle(j.id, m.emoji); envoyer({t:"chat", emoji:m.emoji, auteur:j.id}); } break;
      case "act": if(j){ j.vu = Date.now(); if(S.phase === "jeu" && typeof PlateauIA !== "undefined") PlateauIA.recevoirMulti(m); } break;   // décision d'un joueur sur le plateau
    }
  } else {
    switch(m.t){
      case "etat": {
        const premier = S.phase === "connexion";
        S.dernierEtat = Date.now(); S.phase = m.phase; S.auto = !!m.auto; S.reste = m.reste; S.resteT = Date.now();
        S.joueurs = m.joueurs.map(x => ({...x, vu:Date.now()}));
        const me = moi(); if(me) S.moi.couleur = me.couleur;
        if(premier){ Son.ok(); vibre(15); }
        if(m.phase === "jeu" && m.graine && S.graine == null){ S.graine = m.graine; S.partie = m.partie; }
        if(m.phase === "jeu" && !S.rendu?.jeu) ecranDepart(); else rafraichir();
        break; }
      case "refus": if(m.pour === S.moi.id) echecRejoindre(TXT[m.raison] || TXT.introuvable); break;
      case "info": if(m.pour === S.moi.id) toast(TXT[m.texte] || m.texte, 3500); break;
      case "chat": bulle(m.auteur, m.emoji); break;
      case "demarrer": S.phase = "jeu"; S.graine = m.graine; S.partie = m.partie; ecranDepart(); break;
      case "dec":   // décision validée par l'hôte (gardée de côté si le plateau n'est pas encore lancé chez moi)
        if(typeof PlateauIA !== "undefined" && PlateauIA.enCours()) PlateauIA.recevoirMulti(m);
        else if(S.phase === "jeu"){ (S.decsAttente = S.decsAttente || []).push([m.cle, m.val]); }
        break;
      case "journal": if(m.pour === S.moi.id && typeof PlateauIA !== "undefined") PlateauIA.appliquerJournal(m.decs); break;
      case "reprise": if(m.pour === S.moi.id){
        S.phase = "jeu"; S.graine = m.graine; S.partie = m.partie; S.dernierEtat = Date.now();
        if(typeof PlateauIA !== "undefined" && PlateauIA.enCours()) PlateauIA.appliquerJournal(m.decs);
        else { S.decsReprise = m.decs; if(S.partieLancee !== S.graine) ecranDepart(); } }
        break;
      case "ferme": fermerSalon(); ecranMulti(); toast(TXT.salonFerme); break;
    }
  }
}

/* l'hôte est parti : le joueur désigné (par le serveur, ou par l'ancien hôte en mode local) prend la main */
function changerHote(nouveau, ancien){
  if(!S || !nouveau) return;
  if(ancien) S.joueurs = S.joueurs.filter(j => j.id !== ancien);
  S.joueurs.forEach(j => j.hote = j.id === nouveau);
  const devient = nouveau === S.moi.id && !S.hote;
  S.hote = nouveau === S.moi.id; S.moi.hote = S.hote; S.dernierEtat = Date.now();
  if(devient){
    clearInterval(S.timers.tick); S.timers.tick = setInterval(tick, 2500);
    if(S.auto && S.phase === "attente"){ clearInterval(S.timers.auto); S.timers.auto = setInterval(autoTick, 1000); }
    if(!S.joueurs.some(j => j.id === S.moi.id)) S.joueurs.unshift({...S.moi, hote:true, vu:Date.now()});
    toast(TXT.vousHote, 3500); diffuserEtat(); publierSalon();
  } else { const n = S.joueurs.find(j => j.id === nouveau); if(n) toast(TXT.nouvelHote(n.pseudo), 3500); }
  if(typeof PlateauIA !== "undefined" && PlateauIA.enCours()) PlateauIA.changerHote(nouveau);
  rafraichir();
}
/* départ de l'hôte : en mode local il désigne lui-même son successeur (en ligne, c'est le serveur) */
function passerLaMain(){
  if(!S || !estHote() || S.canal.type !== "local") return;
  const suivant = (S.partie || S.joueurs).map(j => j.id).find(id => id !== S.moi.id && S.joueurs.some(j => j.id === id));
  if(suivant) envoyer({t:"hote-change", ancien:S.moi.id, nouveau:suivant});
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
  $("#q-oui", v).onclick = () => { v.remove(); if(estHote()) passerLaMain(); else envoyer({t:"quitter"}); fermerSalon(); ecranMulti(); };
}
function lancer(){
  if(!estHote()) return;
  const n = S.joueurs.length;
  if(S.auto) S.joueurs.forEach(j => j.pret = true);
  if(n < 2 || !S.joueurs.every(j => j.pret)){ toast(TXT.lancerAide(n)); return; }
  S.phase = "jeu"; S.graine = Math.floor(Math.random()*1e9);
  S.partie = S.joueurs.map(({id, pseudo, couleur, hote}) => ({id, pseudo, couleur, hote:!!hote}));
  envoyer({t:"demarrer", graine:S.graine, partie:S.partie}); diffuserEtat(); publierSalon();
  Son.fin(); vibre([30,40,30]);
  ecranDepart();
}

/* =========================================================================
   Partie rapide : rejoindre au hasard (de préférence le salon le plus rempli), sinon en ouvrir un
   ========================================================================= */
function chercherSalons(ms){
  return new Promise(res => {
    let fini = false, t;
    const clore = l => { if(fini) return; fini = true; clearTimeout(t); Annuaire.arreter(); res(l || []); };
    Annuaire.ecouter((liste, mode) => { if(liste === null) return; if(mode === "ligne" || liste.length) clore(liste); });
    t = setTimeout(() => clore(Annuaire.carte.size ? [...Annuaire.carte.values()].filter(r => r.phase === "attente") : []), ms);
  });
}
function choisirSalon(liste){
  const dispo = liste.filter(r => r.phase === "attente" && r.nb < r.max && (!r.lang || r.lang === LANGUE_JEU));
  if(!dispo.length) return null;
  const maxNb = Math.max(...dispo.map(r => r.nb));
  const top = dispo.filter(r => r.nb === maxNb);
  return top[Math.floor(Math.random()*top.length)];
}
async function partieRapide(relance){
  if(!relance) rapideEssais = 0;
  const bt = document.getElementById("m-rapide"); if(bt){ bt.disabled = true; const n = bt.querySelector(".nom"); if(n) n.textContent = TXT.rapideRecherche; }
  const liste = await chercherSalons(enLigne() ? 3500 : 1200);
  const r = choisirSalon(liste);
  if(r) rejoindreSalon(r.code, {rapide:true}); else creerSalon({auto:true});
}
function majMsg(){
  const el = document.getElementById("m-msg"); if(!el || !S || !S.auto) return;
  const n = S.joueurs.length; let reste = null;
  if(estHote()) reste = resteAuto(); else if(S.reste != null) reste = Math.max(0, S.reste - Math.floor((Date.now() - S.resteT)/1000));
  const pt = `<i class="pt ${S.canal && S.canal.type==="local"?"local":""}"></i>`;
  el.innerHTML = S.phase === "connexion" ? `<i class="pt local"></i>${TXT.connexion}` : (reste != null && n >= 2 ? `${pt}${TXT.decompte(reste)}` : `${pt}${TXT.autoAide}`);
}

/* =========================================================================
   Écrans
   ========================================================================= */
function arreterVitrue(){} // compatibilité

function ecranMulti(){
  if(typeof arreterVitrine === "function") arreterVitrine();
  fermerSalon();
  const c = Compte.get();
  app.innerHTML = `
  <section class="ecran">
    <div class="entete-ecran"><button class="icone-btn" id="b-retour" aria-label="Retour">${ICO.retour}</button><h1>${TXT.multi}</h1><span></span></div>
    <p class="sous-titre">${TXT.sousTitre}</p>
    <div class="m-carte" style="grid-template-columns:1fr auto; align-items:center">
      <div style="display:flex; align-items:center; gap:12px; min-width:0">${c ? jetonSVG(pions()[c.couleur % pions().length].c, "") : ""}<div style="min-width:0"><span class="lbl">${TXT.profil}</span><div style="font:700 20px var(--f-ui); color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${c ? esc(c.pseudo) : "—"}</div></div></div>
      <button class="bouton-plat" id="m-profil">${c ? TXT.modifier : TXT.creerProfil}</button>
    </div>
    <div id="m-reprise"></div>
    <div class="m-choix">
      <button class="mode large piece c-jaune m-rapide" id="m-rapide"><span class="chev" aria-hidden="true"></span><span class="ico">${ICO.eclair || ICO.groupe}</span><span><span class="nom">${TXT.rapide}</span><span class="desc">${TXT.rapideDesc}</span></span></button>
      <button class="mode piece c-multi" id="m-creer"><span class="ico">${ICO.groupe}</span><span><span class="nom">${TXT.creerSalon}</span><span class="desc">${TXT.creerSalonDesc}</span></span></button>
      <button class="mode piece c-bleu" id="m-rejoindre"><span class="ico">${ICO.cible || ICO.groupe}</span><span><span class="nom">${TXT.rejoindre}</span><span class="desc">${TXT.rejoindreDesc}</span></span></button>
    </div>
    <div class="m-carte">
      <span class="lbl">${TXT.enAttente} <span id="m-nb-ouverts"></span><span class="m-en-ligne" id="m-en-ligne" hidden></span></span>
      <div class="m-langues" role="group" aria-label="${TXT.langue}">${["fr", "en", "toutes"].map(l => `<button data-lg="${l}" aria-pressed="${l === LANGUE_JEU}">${l === "toutes" ? TXT.toutes : DRAP[l] + " " + TXT.nomsLangues[l]}</button>`).join("")}</div>
      <div class="m-liste" id="m-ouverts"><div class="m-vide"><i></i>${enLigne() ? TXT.serveurAttente : TXT.aucunSalon}</div></div>
    </div>
    <div class="m-carte" id="m-zone-code" hidden>
      <label class="lbl" for="m-code">${TXT.code}</label>
      <div class="m-saisie"><input class="champ" id="m-code" maxlength="5" placeholder="ABCDE" autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="latin"><button class="bouton piece c-jaune" id="m-go" style="width:auto; padding:0 18px">OK</button></div>
    </div>
    <div class="m-note">${ICO.livre ? ICO.livre.replace('<svg','<svg width="22" height="22"') : ""}<span>${TXT.reglesSalon}</span></div>
    <div class="m-etat"><i class="pt ${window.QLN_WS_URL ? "" : "local"}"></i>${window.QLN_WS_URL ? TXT.modeLigne : TXT.modeLocal}</div>
  </section>`;
  $("#b-retour").onclick = () => { Annuaire.arreter(); ecranAccueil(); };
  $("#m-profil").onclick = () => ecranProfil(() => ecranMulti());
  if(enLigne() && navigator.onLine === false){   // avion, métro : on le dit tout de suite, plutôt que d'attendre un délai de connexion
    ["#m-rapide","#m-creer","#m-rejoindre"].forEach(s => { const b = $(s); if(b) b.disabled = true; });
    $("#m-ouverts").innerHTML = `<div class="m-vide"><i></i>${TXT.horsLigne}</div>`;
    addEventListener("online", () => { if($("#m-rapide")) ecranMulti(); }, {once:true});
    return;
  }
  $("#m-rapide").onclick = () => avecProfil(() => partieRapide());
  $("#m-creer").onclick = () => avecProfil(() => creerSalon());
  $("#m-rejoindre").onclick = () => { const z = $("#m-zone-code"); z.hidden = !z.hidden; if(!z.hidden){ $("#m-code").focus(); z.scrollIntoView({behavior:"smooth", block:"center"}); } };
  const go = () => { const code = normCode($("#m-code").value); if(code.length < 5){ toast(TXT.codeCourt); return; } avecProfil(() => rejoindreSalon(code)); };
  $("#m-go").onclick = go;
  $("#m-code").addEventListener("input", e => { e.target.value = normCode(e.target.value); if(e.target.value.length === 5) Son.tap(); });
  $("#m-code").addEventListener("keydown", e => { if(e.key === "Enter") go(); });
  const code = new URLSearchParams(location.search).get("salon");
  if(code && normCode(code).length === 5){ history.replaceState(null, "", location.pathname); $("#m-zone-code").hidden = false; $("#m-code").value = normCode(code); }
  // partie en cours quittée (appli fermée, coupure) : on propose d'y revenir
  const pm = store.get("partieMulti", null);
  if(pm && pm.code && Date.now() - pm.t < 3*3600e3 && !!pm.ligne === enLigne()){
    $("#m-reprise").innerHTML = `<button class="mode large piece c-vert" id="m-reprendre"><span class="ico">${ICO.groupe}</span><span><span class="nom">${TXT.reprendre}</span><span class="desc">${TXT.reprendreDesc(pm.code)}</span></span></button>`;
    $("#m-reprendre").onclick = () => avecProfil(() => rejoindreSalon(pm.code, {reprise:pm.id}));
  }
  let filtre = LANGUE_JEU, derniere = null;
  $$(".m-langues button").forEach(b => b.onclick = () => { filtre = b.dataset.lg; $$(".m-langues button").forEach(x => x.setAttribute("aria-pressed", x === b)); if(derniere) afficher(...derniere); });
  const afficher = (liste, mode, enLigneN) => {
    const el = $("#m-ouverts"); if(!el){ Annuaire.arreter(); return; }
    if(liste === null){ el.innerHTML = `<div class="m-vide"><i></i>${TXT.coupe}</div>`; return; }
    const ne = $("#m-en-ligne"); if(ne){ if(enLigneN > 0){ ne.hidden = false; ne.innerHTML = `<i></i>${TXT.enLigneN(enLigneN)}`; } else ne.hidden = true; }
    liste = liste.filter(r => r.nb < r.max && (!r.phase || r.phase === "attente") && (filtre === "toutes" || (r.lang || "fr") === filtre)).sort((a,b) => (b.nb - a.nb) || ((b.t||0) - (a.t||0)));
    $("#m-nb-ouverts").textContent = liste.length ? liste.length : "";
    el.innerHTML = liste.length ? liste.map((r,i) => {
        const js = (r.joueurs && r.joueurs.length ? r.joueurs : [{couleur:r.couleur||0}]);
        const pions_ = js.map(j => jetonSVG(pions()[(j.couleur||0) % pions().length].c)).join("");
        return `<div class="m-joueur m-salon" data-code="${r.code}" style="animation-delay:${i*40}ms"><span class="m-pions">${pions_}</span>
        <span class="nom">${DRAP[r.lang || "fr"]} ${esc(TXT.salonDe(r.hote))}<small>${r.nb}/${r.max} · ${TXT.placesLibres(r.max - r.nb)}${r.auto ? ` <small class="rap">${TXT.rapide}</small>` : ""}</small></span>
        <button class="bouton-plat" data-code="${r.code}">${TXT.rejoindreBtn} ›</button></div>`; }).join("") : `<div class="m-vide"><i></i>${TXT.aucunSalon}</div>`;
    $$("#m-ouverts button").forEach(b => b.onclick = () => {
      const r = liste.find(x => x.code === b.dataset.code);
      // salon d'une autre langue : on ouvre l'appli dans cette langue, code déjà saisi
      if(r && (r.lang || "fr") !== LANGUE_JEU){ try{ localStorage.setItem("qln-lang", r.lang); }catch(e){} location.href = (LANGUE_JEU === "en" ? "../" : "en/") + "?salon=" + r.code; return; }
      avecProfil(() => rejoindreSalon(b.dataset.code)); });
  };
  Annuaire.ecouter((liste, mode, enLigneN) => { if(liste !== null) derniere = [liste, mode, enLigneN]; afficher(liste, mode, enLigneN); });
}

// lien d'invitation : adresse du site, même depuis l'appli iOS où le jeu est servi par l'appli elle-même
function lienSalon(code){
  const web = /^https?:$/.test(location.protocol) && location.hostname !== "localhost";
  const base = web || !window.QLN_SITE_URL ? location.origin + location.pathname : window.QLN_SITE_URL + (/\/en\//.test(location.pathname) ? "en/" : "");
  return base + "?salon=" + code;
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
    <div class="m-objectif"><i aria-hidden="true">🏆</i>${TXT.objectif}</div>
    <div class="m-etat" id="m-msg"></div>
    <div class="duo" id="m-actions"></div>
  </section>`;
  S.rendu = {salon:true};
  $("#b-quitter").onclick = quitterSalon;
  $("#m-copier").onclick = async () => { try{ await navigator.clipboard.writeText(S.code); toast(TXT.copie, 1500); Son.tap(); }catch(e){ toast(S.code); } };
  const bp = $("#m-partager"); if(bp) bp.onclick = () => navigator.share({title:"Le-QLN", text:TXT.partageTexte(S.code), url:lienSalon(S.code)}).catch(()=>{});
  $$(".m-chat button").forEach(b => b.onclick = () => envoyerEmoji(b.dataset.e));
  rafraichir();
}

function rafraichir(){
  if(!S || !S.rendu?.salon || !$("#m-liste")) return;
  const me = moi();
  $("#m-nb").textContent = `${S.joueurs.length}/${MAX}`;
  $("#m-liste").innerHTML = S.joueurs.map((j,i) => `<div class="m-joueur ${j.pret?"pret":""}" data-id="${j.id}" style="animation-delay:${i*50}ms">${jetonSVG(pions()[j.couleur % pions().length].c)}
      <span class="nom">${esc(j.pseudo)}${j.hote?`<small>${TXT.hote}</small>`:""}${j.id===S.moi.id?`<small class="vous">${TXT.vous}</small>`:""}</span>
      <span class="etat"><i></i>${j.pret ? TXT.pret : TXT.pasPret}</span></div>`).join("")
    + (S.joueurs.length < MAX ? `<div class="m-vide"><i></i>${TXT.attente}</div>` : "");
  const n = S.joueurs.length, tousPrets = n >= 2 && S.joueurs.every(j => j.pret);
  if(S.auto){ majMsg(); }
  else $("#m-msg").innerHTML = S.phase === "connexion" ? `<i class="pt local"></i>${TXT.connexion}` : (estHote() ? (tousPrets ? "" : `<i class="pt ${S.canal.type==="local"?"local":""}"></i>${TXT.lancerAide(n)}`) : `<i class="pt ${S.canal.type==="local"?"local":""}"></i>${TXT.attenteHote}`);
  $("#m-actions").innerHTML = S.auto
    ? (estHote() ? `<button class="bouton piece c-jaune" id="m-lancer" ${n >= 2 ? "" : "disabled"}>${TXT.lancerMaintenant}</button>` : "")
    : `<button class="bouton piece ${me && me.pret ? "c-noir" : "c-vert"}" id="m-pret" ${S.phase==="connexion"?"disabled":""}>${me && me.pret ? TXT.plusPret : TXT.jeSuisPret}</button>`
      + (estHote() ? `<button class="bouton piece c-jaune" id="m-lancer" ${tousPrets ? "" : "disabled"}>${TXT.lancer}</button>` : "");
  const bpr = $("#m-pret"); if(bpr) bpr.onclick = basculerPret;
  const bl = $("#m-lancer"); if(bl) bl.onclick = lancer;
}

const oublierPartie = () => { try{ store.set("partieMulti", null); }catch(e){} };
function ecranDepart(){
  if(!S || S.graine == null || !S.partie) return;
  if(S.partieLancee === S.graine) return;          // (une seule fois par partie, même si l'état est rediffusé)
  S.partieLancee = S.graine; S.rendu = {jeu:true};
  const hoteId = (S.partie.find(j => j.hote) || S.partie[0]).id;
  app.innerHTML = `
  <section class="ecran">
    <div class="entete-ecran"><span></span><h1>${TXT.salon} ${S.code}</h1><span></span></div>
    <div class="m-carte m-depart">
      <div class="gros">${TXT.depart}</div>
      <div class="m-sieges">${S.partie.map(j => `<span>${jetonSVG(pions()[j.couleur % pions().length].c)}${esc(j.pseudo)}</span>`).join("")}</div>
      <p class="m-objectif">${TXT.objectif}</p>
    </div>
  </section>`;
  if(typeof confettis === "function") setTimeout(() => confettis(120), 300);
  const graine = S.graine;
  try{ store.set("partieMulti", {code:S.code, id:S.moi.id, graine, t:Date.now(), ligne:S.canal.type === "ligne"}); }catch(e){}
  setTimeout(() => {
    if(!S || S.partieLancee !== graine) return;
    PlateauIA.demarrerMulti({graine, joueurs:S.partie, moi:S.moi.id, hote:estHote(), hoteId,
      envoyer, present:id => !!S && S.joueurs.some(j => j.id === id),
      quitter:() => { if(!S) return; oublierPartie(); if(estHote()) passerLaMain(); else envoyer({t:"quitter"}); fermerSalon(); },
      decs:[...(S.decsReprise || []), ...(S.decsAttente || [])], resync:() => envoyer({t:"resync"}),
      retour:() => { if(!S) return ecranMulti(); S.phase = "attente"; S.joueurs.forEach(j => j.pret = false); S.rendu = null; if(estHote()){ diffuserEtat(); publierSalon(); } ecranSalon(); }});
  }, 1800 * (window.QLN_TEST_VITE || 1));
}

// Lien direct ?salon=CODE → ouvre l'écran multijoueur avec le code pré-rempli
function lienDirect(){ const code = new URLSearchParams(location.search).get("salon"); if(code && normCode(code).length === 5){ ecranMulti(); return true; } return false; }

addEventListener("pagehide", () => { if(S){ if(estHote()) passerLaMain(); else if(S.phase !== "jeu") envoyer({t:"quitter"}); } });   // (en partie : on peut revenir ; l'IA joue en attendant)
addEventListener("online", () => { if(Socket.abonnes.size){ Socket.tentatives = 0; Socket.ouvrir(); } });

return { ecran:ecranMulti, profil:ecranProfil, compte:() => Compte.get(), chipProfil, lienDirect, dispo:canalDispo, TXT, stop:fermerSalon, etat:() => S };
})();
