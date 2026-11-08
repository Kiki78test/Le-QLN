/* =========================================================================
   Le-QLN — simulation publicitaire (version test)
   Bouton « Pub / No Pub » en haut de l'écran. Les spots sont des vidéos fictives de 6 s (dossier pubs/).
   Principes : jamais de vidéo pendant un sablier ; au plus une vidéo imposée toutes les 2 min 30 ;
   la vidéo « récompense » est toujours facultative ; en mode No Pub, rien ne s'affiche.
   Pour passer en réel : remplacer jouerSpot() et bandeau() par le kit d'une régie (AdSense, AdMob…).
   ========================================================================= */
"use strict";
const Pub = (() => {
const SPOTS = [
  {n:1, marque:"Zéphyr Café", accroche:"The first coffee of the day", fond:"linear-gradient(90deg,#3b1d0d,#7a4a2b)", c:"#ffcf3a"},
  {n:2, marque:"Voltaïa", accroche:"The scooter that goes further", fond:"linear-gradient(90deg,#0d3b2a,#1f8a4d)", c:"#9fe870"},
  {n:3, marque:"Pixelia", accroche:"The studio that makes you play", fond:"linear-gradient(90deg,#14083d,#3b2a8c)", c:"#ffe34d"},
];
const DELAI_MS = 150000, DUREE_S = 6;
let actif = store.get("pub", true), dernier = 0, cartesVues = 0, idx = Math.floor(Math.random()*SPOTS.length);
let stats = store.get("pubStats", {videos:0, bandeaux:0, recompenses:0});
const revenu = () => stats.videos*0.012 + stats.recompenses*0.02 + stats.bandeaux*0.0008;

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
  barre.innerHTML = `<span class="bp-info">${actif ? `<span class="long">Simulation · </span>${stats.videos+stats.recompenses} video${stats.videos+stats.recompenses!==1?"s":""} · <b>≈ €${revenu().toFixed(2)}</b>` : "Ad-free version"}</span>
    <div class="bp-droite"><div class="bp-sw bp-lang" role="group" aria-label="Language"><button data-l="fr" aria-pressed="${!EN}">FR</button><button data-l="en" aria-pressed="${EN}">EN</button></div>
    <div class="bp-sw" role="group" aria-label="Ad display"><button data-v="1" aria-pressed="${actif}">Ads</button><button data-v="0" aria-pressed="${!actif}">No Ads</button></div></div>`;
  $$("[data-l]", barre).forEach(b => b.onclick = () => { if((b.dataset.l === "en") !== EN) changerLangue(b.dataset.l); });
  $$("[data-v]", barre).forEach(b => b.onclick = () => {
    const v = b.dataset.v === "1"; if(v === actif) return;
    actif = v; store.set("pub", actif); majBarre();
    if(!actif){ $$(".pub-bandeau").forEach(x => x.remove()); toast("No Ads mode: no advertising."); }
    else toast("Ads mode: a spot before the game, a banner during timers, optional videos for bonuses.", 5000);
  });
}
majBarre();
function compter(k){ stats[k]++; store.set("pubStats", stats); majBarre(); }

/* ----- spot vidéo plein écran ----- */
function jouerSpot({passerApres = 3, recompense = false, titre = "Advertisement"} = {}){
  return new Promise(res => {
    const s = SPOTS[idx++ % SPOTS.length];
    const v = document.createElement("div"); v.className = "pub-voile"; v.setAttribute("role","dialog"); v.setAttribute("aria-label", titre);
    v.innerHTML = `<div class="pub-cadre">
      <div class="pub-haut"><span><span class="tag">Ad</span> ${esc(s.marque)}</span><button class="pub-passer" disabled>Skip in ${passerApres} s</button></div>
      <div class="pub-video"><video muted playsinline autoplay preload="auto" poster="../pubs/spot${s.n}.jpg"><source src="../pubs/spot${s.n}.mp4" type="video/mp4"><source src="../pubs/spot${s.n}.webm" type="video/webm"></video><div class="pub-barre"><i></i></div></div>
      <div class="pub-bas">${recompense ? "Watch to the end to receive your <b>reward</b>." : "Fictional demo spot · sound off"}</div></div>`;
    document.body.appendChild(v);
    const vid = $("video", v), bt = $(".pub-passer", v), barreP = $(".pub-barre i", v);
    try{ const p = vid.play(); if(p && p.catch) p.catch(()=>{}); }catch(e){}
    let t = 0, fini = false;
    const clore = ok => { if(fini) return; fini = true; clearInterval(it); v.remove(); res(ok); };
    const it = setInterval(() => {
      t += .25; barreP.style.width = Math.min(100, t/DUREE_S*100)+"%";
      if(t >= DUREE_S){ bt.disabled = false; bt.textContent = recompense ? "Claim ›" : "Continue ›"; bt.onclick = () => clore(true); if(!recompense) clore(true); }
      else if(t >= passerApres){ bt.disabled = false; bt.textContent = recompense ? "Close (no reward)" : "Skip ›"; bt.onclick = () => clore(!recompense); }
      else bt.textContent = `Passer dans ${Math.ceil(passerApres - t)} s`;
    }, 250);
  });
}

/* ----- points d'insertion ----- */
const libre = () => performance.now() - dernier > DELAI_MS || dernier === 0;
async function avantPartie(){
  if(!actif || !libre()) return;
  await jouerSpot({passerApres:3, titre:"Advertisement before the game"});
  dernier = performance.now(); compter("videos");
}
/* appelé entre deux cartes, sablier arrêté : une vidéo toutes les 4 cartes au plus */
async function entreCartes(){
  if(!actif) return;
  cartesVues++;
  if(cartesVues < 4 || !libre()) return;
  cartesVues = 0;
  await jouerSpot({passerApres:3, titre:"Advertisement"});
  dernier = performance.now(); compter("videos");
}
async function recompenseVideo(){
  if(!actif) return false;
  const ok = await jouerSpot({passerApres:3, recompense:true, titre:"Reward advertisement"});
  if(ok) compter("recompenses");
  return ok;
}
function actifOui(){ return actif; }

/* ----- bandeau discret, pendant les sabliers ----- */
function bandeau(){ return actif ? `<div class="pub-bandeau" role="complementary" aria-label="Advertisement"></div>` : ""; }
function animerBandeau(){
  const el = $(".pub-bandeau"); if(!el) return;
  let i = Math.floor(Math.random()*SPOTS.length);
  const montrer = () => {
    if(!document.body.contains(el) || !actif){ clearInterval(it); return; }
    const s = SPOTS[i++ % SPOTS.length];
    el.style.background = s.fond;
    el.innerHTML = `<span class="pb-tag">Ad</span><div class="pb-cre"><span class="pb-m" style="color:${s.c}">${esc(s.marque)}</span><span class="pb-a">${esc(s.accroche)}</span></div>`;
    compter("bandeaux");
  };
  const it = setInterval(montrer, 12000); montrer();
}
return { avantPartie, entreCartes, recompenseVideo, bandeau, animerBandeau, actif: actifOui };
})();
