/* =========================================================================
   Le-QLN — simulation publicitaire (version test)
   Bouton « Pub / No Pub » en haut de l'écran. Les spots sont des vidéos fictives de 6 s (dossier pubs/).
   Principes (révisés, voir docs/publicite/monetisation-publicitaire.pdf) :
   - jamais rien pendant un sablier ni sur l'écran de la carte : la concentration du joueur est sacrée ;
   - aucune vidéo imposée à la première partie de la session, puis au plus une toutes les 3 min, aux transitions
     (entre deux parties, ou entre deux cartes toutes les 5 cartes) ;
   - la vidéo « récompense » est toujours à l'initiative du joueur ;
   - les bandeaux ne vivent que sur les écrans calmes : accueil, fin de partie (grand format), plateau et salon ;
   - en mode No Pub, rien ne s'affiche.
   Vraies publicités (applis Android / iOS) : Google AdMob, branché ci-dessous (« Régie »). Il s'active seul dans
   l'appli quand config.js contient QLN_ADMOB avec actif:true ; sinon (site web, identifiants absents, hors ligne,
   annonce indisponible) la simulation ci-dessous prend le relais. Mêmes emplacements et mêmes règles dans les deux cas.
   ========================================================================= */
"use strict";
const Pub = (() => {
const SPOTS = [
  {n:1, marque:"Zéphyr Café", accroche:"Le premier café de la journée", fond:"linear-gradient(90deg,#3b1d0d,#7a4a2b)", c:"#ffcf3a"},
  {n:2, marque:"Voltaïa", accroche:"La trottinette qui va plus loin", fond:"linear-gradient(90deg,#0d3b2a,#1f8a4d)", c:"#9fe870"},
  {n:3, marque:"Pixelia", accroche:"Le studio qui fait jouer", fond:"linear-gradient(90deg,#14083d,#3b2a8c)", c:"#ffe34d"},
];
const DELAI_MS = 180000, DUREE_S = 6, CARTES_ENTRE = 5;
let actif = store.get("pub", true), dernier = 0, cartesVues = 0, parties = 0, idx = Math.floor(Math.random()*SPOTS.length);
let stats = store.get("pubStats", {videos:0, bandeaux:0, recompenses:0, grands:0});
// eCPM retenus pour la simulation (France, régie mobile, ordres de grandeur 2026) : interstitiel 6 $, récompense 9 $, bandeau 0,30 $, grand format 1,10 $ ; 1 $ ≈ 0,92 €
const revenu = () => (stats.videos*6 + stats.recompenses*9 + stats.bandeaux*.3 + (stats.grands||0)*1.1) / 1000 * .92;

const css = document.createElement("style");
css.textContent = `
:root{--bp-h:calc(34px + env(safe-area-inset-top, 0px))}
body{padding-top:var(--bp-h)}
#barre-pub{position:fixed; top:0; left:0; right:0; z-index:35; height:var(--bp-h); padding:env(safe-area-inset-top,0px) max(10px, env(safe-area-inset-right,0px)) 0 max(10px, env(safe-area-inset-left,0px));
  display:flex; align-items:center; justify-content:space-between; gap:8px; background:linear-gradient(rgba(2,8,24,.95),rgba(2,8,24,.82)); border-bottom:1px solid rgba(255,255,255,.08); backdrop-filter:blur(6px)}
#barre-pub .bp-info{font-family:var(--f-ui); font-weight:700; font-size:12.5px; letter-spacing:.06em; text-transform:uppercase; color:var(--brume); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0}
#barre-pub .bp-info b{color:var(--or)}
.bp-sw{display:flex; background:#000; border-radius:18px; padding:2px; flex:none; box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}
.bp-sw button{font-family:var(--f-ui); font-weight:800; font-size:13px; letter-spacing:.06em; text-transform:uppercase; padding:3px 13px 2px; border-radius:16px; color:var(--brume)}
.bp-sw button[aria-pressed="true"]{background:var(--or-grad); color:#1b1400; box-shadow:0 1px 0 rgba(255,255,255,.4) inset}
.bp-droite{display:flex; align-items:center; gap:8px; flex:none}
.bp-lang button{padding:3px 10px 2px}
.pub-voile{position:fixed; inset:0; z-index:80; background:radial-gradient(80% 70% at 50% 40%, rgba(10,25,70,.9), rgba(2,6,18,.97)); display:grid; place-items:center; padding:16px; animation:apparait .25s ease}
.pub-cadre{width:min(100%, 640px); display:grid; gap:10px}
.pub-haut{display:flex; justify-content:space-between; align-items:center; gap:10px; font-family:var(--f-ui); font-weight:700; letter-spacing:.06em; text-transform:uppercase; font-size:14px; color:var(--brume)}
.pub-haut .tag{background:#000; padding:3px 10px 2px; border-radius:12px; color:var(--or)}
.pub-passer{font-family:var(--f-ui); font-weight:800; font-size:15px; letter-spacing:.05em; text-transform:uppercase; padding:6px 16px 5px; border-radius:20px; background:rgba(255,255,255,.14); color:#fff}
.pub-passer[disabled]{opacity:.55; cursor:default}
.pub-video{position:relative; border-radius:16px; overflow:hidden; background:#000; box-shadow:0 20px 50px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.1)}
.pub-video video,.pub-video img{display:block; width:100%; aspect-ratio:16/9; object-fit:cover}
.pub-barre{height:5px; background:rgba(255,255,255,.18)} .pub-barre i{display:block; height:100%; width:0; background:var(--or); transition:width .25s linear}
.pub-bas{text-align:center; font-family:var(--f-ui); font-weight:600; font-size:14px; color:var(--brume-2)}
.pub-bas b{color:var(--or-2)}
.pub-bandeau{display:flex; align-items:center; gap:10px; border-radius:12px; padding:7px 12px; min-height:44px; box-shadow:inset 0 0 0 1px rgba(255,255,255,.12), 0 6px 14px rgba(0,0,0,.3); transition:background .4s}
.pub-bandeau .pb-tag{font-family:var(--f-ui); font-weight:800; font-size:11px; letter-spacing:.1em; text-transform:uppercase; background:rgba(0,0,0,.45); color:#fff; padding:2px 7px 1px; border-radius:8px; flex:none}
.pub-bandeau .pb-m{font-family:var(--f-titre); font-size:22px; letter-spacing:.04em; line-height:1; flex:none}
.pub-bandeau .pb-a{font-family:var(--f-ui); font-weight:600; font-size:15px; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0}
.pub-bandeau .pb-cre{display:flex; align-items:center; gap:10px; min-width:0; animation:apparait .5s}
.pub-bandeau.grand{display:grid; grid-template-columns:auto 1fr; grid-template-rows:auto auto; gap:6px 12px; padding:10px 12px; align-items:center}
.pub-bandeau.grand img{grid-row:1/3; width:112px; aspect-ratio:16/9; object-fit:cover; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,.4)}
.pub-bandeau.grand .pb-tag{justify-self:start}
.pub-bandeau.grand .pb-cre{flex-direction:column; align-items:flex-start; gap:2px}
.pub-bandeau.grand .pb-a{white-space:normal}
.recompense{display:flex; align-items:center; justify-content:center; gap:8px; font-family:var(--f-ui); font-weight:800; font-size:16px; letter-spacing:.04em; color:var(--sombre); background:rgba(0,0,0,.06); border:2px dashed rgba(0,0,0,.25); border-radius:14px; padding:9px 12px 8px; width:100%}
.recompense:hover{background:rgba(0,0,0,.12)}
.recompense[disabled]{opacity:.5}
@media (max-width:420px){ #barre-pub .bp-info .long{display:none} }
`;
document.head.appendChild(css);

/* ----- langue : FR (racine) / EN (dossier en/) ----- */
const EN = document.documentElement.lang === "en";
let langPref = null; try{ langPref = localStorage.getItem("qln-lang"); }catch(e){}
const URLS = window.QLN_URLS || null; // pages de démonstration (artefacts) : adresses des deux versions, ouvertes dans un nouvel onglet
if(!URLS){ if(langPref === "en" && !EN) location.replace("en/"); else if(langPref === "fr" && EN) location.replace("../"); }
function changerLangue(l){
  try{ localStorage.setItem("qln-lang", l); }catch(e){}
  if(URLS){ if(URLS[l]) window.open(URLS[l], "_blank", "noopener"); return; }
  location.href = l === "en" ? (EN ? "./" : "en/") : (EN ? "../" : "./");
}

/* ----- barre du haut ----- */
const barre = document.createElement("div"); barre.id = "barre-pub";
document.body.prepend(barre);
function majBarre(){
  barre.innerHTML = `<span class="bp-info">${actif ? `<span class="long">Simulation · </span>${stats.videos+stats.recompenses} vidéo${stats.videos+stats.recompenses>1?"s":""} · <b>≈ ${revenu().toFixed(2).replace(".",",")} €</b>` : "Version sans publicité"}</span>
    <div class="bp-droite"><div class="bp-sw bp-lang" role="group" aria-label="Langue"><button data-l="fr" aria-pressed="${!EN}">FR</button><button data-l="en" aria-pressed="${EN}">EN</button></div>
    <div class="bp-sw" role="group" aria-label="Affichage des publicités"><button data-v="1" aria-pressed="${actif}">Pub</button><button data-v="0" aria-pressed="${!actif}">No Pub</button></div></div>`;
  $$("[data-l]", barre).forEach(b => b.onclick = () => { if((b.dataset.l === "en") !== EN) changerLangue(b.dataset.l); });
  $$("[data-v]", barre).forEach(b => b.onclick = () => {
    const v = b.dataset.v === "1"; if(v === actif) return;
    actif = v; store.set("pub", actif); majBarre();
    if(!actif){ $$(".pub-bandeau").forEach(x => x.remove()); toast("Mode No Pub : aucune publicité."); }
    else toast("Mode Pub : un spot entre deux parties, un bandeau sur les écrans calmes, des vidéos facultatives contre des bonus. Jamais pendant un sablier.", 5000);
  });
}
majBarre();
/* Hors ligne (avion…) : même rythme et mêmes emplacements ; les créations sont en cache sur l'appareil.
   Avec une vraie régie : annonces préchargées tant que le réseau est là, puis repli sur des créations locales
   (autopromotion, « Sans pub »). Les affichages hors ligne sont comptés à part. */
function compter(k){ stats[k] = (stats[k]||0)+1; if(navigator.onLine === false) stats.horsLigne = (stats.horsLigne||0)+1; store.set("pubStats", stats); majBarre(); }

/* ----- Régie réelle : Google AdMob (module @capacitor-community/admob des applis) ----- */
const Regie = (() => {
  // lu au moment de l'usage : config.js est chargé après ce fichier
  const conf = () => {
    const C = window.Capacitor, cfg = window.QLN_ADMOB || {};
    const natif = !!(C && C.isNativePlatform && C.isNativePlatform());
    const plateforme = natif && C.getPlatform ? C.getPlatform() : "web";
    const P = natif && C.Plugins ? C.Plugins.AdMob : null, ids = cfg[plateforme] || {};
    return {cfg, plateforme, P, ids, pret:!!(cfg.actif && P && ids.interstitiel)};
  };
  let init = null;
  // au premier besoin : initialisation, consentement RGPD (formulaire Google « UMP »), puis demande de suivi Apple (ATT)
  function demarrer(){
    if(init) return init;
    const {cfg, P, plateforme} = conf();
    init = (async () => {
      await P.initialize({initializeForTesting:!!cfg.test, tagForUnderAgeOfConsent:false, maxAdContentRating:"Teen"});
      let info = await P.requestConsentInfo();
      if(info && info.isConsentFormAvailable && info.status === "REQUIRED") info = await P.showConsentForm();
      if(plateforme === "ios"){ try{ const t = await P.trackingAuthorizationStatus(); if(t && t.status === "notDetermined") await P.requestTrackingAuthorization(); }catch(e){} }
      return !info || info.canRequestAds !== false;
    })().catch(() => false);
    return init;
  }
  async function interstitiel(){
    const {cfg, P, ids, pret} = conf();
    if(!pret || navigator.onLine === false || !(await demarrer())) return false;
    try{ await P.prepareInterstitial({adId:ids.interstitiel, isTesting:!!cfg.test}); await P.showInterstitial(); return true; }catch(e){ return false; }
  }
  // renvoie true si la récompense est acquise, false si la vidéo est fermée avant la fin, null si aucune annonce (repli démonstration)
  async function recompense(){
    const {cfg, P, ids, pret} = conf();
    if(!pret || !ids.recompense || navigator.onLine === false || !(await demarrer())) return null;
    try{ await P.prepareRewardVideoAd({adId:ids.recompense, isTesting:!!cfg.test}); const r = await P.showRewardVideoAd(); return !!(r && (r.amount != null || r.type)); }catch(e){ return null; }
  }
  // menu « Choix publicitaires » (RGPD : changer d'avis à tout moment)
  async function choix(){ const {P, pret} = conf(); if(!pret) return; await demarrer(); try{ await P.showPrivacyOptionsForm(); }catch(e){ toast(EN ? "Ad choices are not available right now." : "Les choix publicitaires ne sont pas disponibles pour l'instant."); } }
  return {pret:() => conf().pret, plateforme:() => conf().plateforme, interstitiel, recompense, choix};
})();
// entrée du menu « Choix publicitaires » : seulement dans l'appli, avec la vraie régie (après le chargement de config.js)
addEventListener("DOMContentLoaded", () => {
  if(!Regie.pret()) return;
  const b = document.getElementById("ti-pubchoix");
  if(b){ b.hidden = false; b.onclick = () => { const f = document.getElementById("ti-fermer"); if(f) f.click(); Regie.choix(); }; }
});

/* ----- spot vidéo plein écran (simulation, ou repli quand la régie n'a pas d'annonce) ----- */
function jouerSpot({passerApres = 3, recompense = false, titre = "Publicité"} = {}){
  return new Promise(res => {
    const s = SPOTS[idx++ % SPOTS.length];
    const v = document.createElement("div"); v.className = "pub-voile"; v.setAttribute("role","dialog"); v.setAttribute("aria-label", titre);
    v.innerHTML = `<div class="pub-cadre">
      <div class="pub-haut"><span><span class="tag">Pub</span> ${esc(s.marque)}</span><button class="pub-passer" disabled>Passer dans ${passerApres} s</button></div>
      <div class="pub-video"><video muted playsinline autoplay preload="auto" poster="pubs/spot${s.n}.jpg"><source src="pubs/spot${s.n}.mp4" type="video/mp4"><source src="pubs/spot${s.n}.webm" type="video/webm"></video><div class="pub-barre"><i></i></div></div>
      <div class="pub-bas">${recompense ? "Regardez jusqu'au bout pour recevoir votre <b>récompense</b>." : "Spot fictif de démonstration · son coupé"}</div></div>`;
    document.body.appendChild(v);
    const vid = $("video", v), bt = $(".pub-passer", v), barreP = $(".pub-barre i", v);
    try{ const p = vid.play(); if(p && p.catch) p.catch(()=>{}); }catch(e){}
    let t = 0, fini = false;
    const clore = ok => { if(fini) return; fini = true; clearInterval(it); v.remove(); res(ok); };
    const it = setInterval(() => {
      t += .25; barreP.style.width = Math.min(100, t/DUREE_S*100)+"%";
      if(t >= DUREE_S){ bt.disabled = false; bt.textContent = recompense ? "Récupérer ›" : "Continuer ›"; bt.onclick = () => clore(true); if(!recompense) clore(true); }
      else if(t >= passerApres){ bt.disabled = false; bt.textContent = recompense ? "Fermer (sans récompense)" : "Passer ›"; bt.onclick = () => clore(!recompense); }
      else bt.textContent = `Passer dans ${Math.ceil(passerApres - t)} s`;
    }, 250);
  });
}

/* ----- points d'insertion ----- */
const libre = () => dernier === 0 || performance.now() - dernier > DELAI_MS;
/* entre deux parties : jamais à la première partie de la session (le joueur vient d'arriver) */
async function avantPartie(){
  parties++;
  if(!actif || parties === 1 || !libre()){ if(dernier === 0) dernier = performance.now(); return; }
  if(!(await Regie.interstitiel())) await jouerSpot({passerApres:3, titre:"Publicité avant la partie"});
  dernier = performance.now(); compter("videos");
}
/* appelé entre deux cartes, sablier arrêté : une vidéo toutes les 5 cartes au plus, et pas plus d'une toutes les 3 min */
async function entreCartes(){
  if(!actif) return;
  cartesVues++;
  if(cartesVues < CARTES_ENTRE || !libre()) return;
  cartesVues = 0;
  if(!(await Regie.interstitiel())) await jouerSpot({passerApres:3, titre:"Publicité"});
  dernier = performance.now(); compter("videos");
}
async function recompenseVideo(){
  if(!actif) return false;
  const reel = await Regie.recompense();
  const ok = reel === null ? await jouerSpot({passerApres:3, recompense:true, titre:"Publicité récompense"}) : reel;
  if(ok) compter("recompenses");
  return ok;
}
function actifOui(){ return actif; }

/* ----- bandeau discret, pendant les sabliers ----- */
/* bandeau : format "grand" (type 300×250) sur l'écran de fin, format discret ailleurs ; rotation toutes les 20 s */
// avec la vraie régie : pas de bandeau (interstitiels et vidéos récompense seulement, choix plus discret)
function bandeau(format = ""){ return actif && !Regie.pret() ? `<div class="pub-bandeau ${format === "grand" ? "grand" : ""}" role="complementary" aria-label="Publicité"></div>` : ""; }
function animerBandeau(){
  $$(".pub-bandeau").forEach(el => {
    if(el.dataset.anime) return; el.dataset.anime = "1";
    const grand = el.classList.contains("grand");
    let i = Math.floor(Math.random()*SPOTS.length);
    const montrer = () => {
      if(!document.body.contains(el) || !actif){ clearInterval(it); return; }
      const s = SPOTS[i++ % SPOTS.length];
      el.style.background = s.fond;
      el.innerHTML = grand
        ? `<span class="pb-tag">Pub</span><img src="pubs/spot${s.n}.jpg" alt="" loading="lazy"><div class="pb-cre"><span class="pb-m" style="color:${s.c}">${esc(s.marque)}</span><span class="pb-a">${esc(s.accroche)}</span></div>`
        : `<span class="pb-tag">Pub</span><div class="pb-cre"><span class="pb-m" style="color:${s.c}">${esc(s.marque)}</span><span class="pb-a">${esc(s.accroche)}</span></div>`;
      compter(grand ? "grands" : "bandeaux");
    };
    const it = setInterval(montrer, 20000); montrer();
  });
}
return { avantPartie, entreCartes, recompenseVideo, bandeau, animerBandeau, actif: actifOui, regie: () => ({pret:Regie.pret(), plateforme:Regie.plateforme()}) };
})();
