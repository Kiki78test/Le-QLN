/* Le-QLN — mesure d'audience interne et anonyme (lue dans admin.html → Visites, Tunnel).
   Un identifiant de visiteur tiré au hasard est gardé sur l'appareil (pas de cookie) ; le serveur n'en garde qu'une empreinte.
   Envoie : le chargement de la page, les étapes du jeu (window.QLN_EVT("partie:defi")…), un signe de présence toutes les
   30 s quand la page est visible, la première interaction et le départ (durée de visite).
   Rien n'est envoyé : sans serveur, en local, pour un administrateur, ou si l'appareil a été retiré des statistiques. */
(function(){
  "use strict";
  const ok = /^(https?|capacitor):$/.test(location.protocol) && !/^(localhost|127\.)/.test(location.hostname) || window.QLN_AUDIENCE_TEST;
  let vid = null;
  try{
    if(localStorage.getItem("qln-sans-stats") === "1") return;
    vid = localStorage.getItem("qln-vid");
    if(!/^[a-z0-9]{16,40}$/.test(vid || "")){ vid = Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(16).padStart(2, "0")).join(""); localStorage.setItem("qln-vid", vid); }
  }catch(e){ return; }
  if(!ok || !vid) { window.QLN_EVT = () => {}; return; }
  const api = () => String(window.QLN_API_URL || "").replace(/\/$/, "");
  const session = () => { for(const k of ["qln:session", "qln-en:session"]){ try{ const s = JSON.parse(localStorage.getItem(k) || "null"); if(s && s.jeton) return s; }catch(e){} } return null; };
  const file = [];
  function envoyer(corps){
    const a = api();
    if(!a){ if(document.readyState !== "complete" && file.length < 30) file.push(corps); return; }
    const s = session();
    if(s && s.joueur && s.joueur.admin){ try{ localStorage.setItem("qln-sans-stats", "1"); }catch(e){} }   // l'appareil de l'administrateur n'est plus compté
    try{
      fetch(a + "/api/journal", {method:"POST", keepalive:true, headers:{"Content-Type":"application/json", ...(s ? {Authorization:"Bearer " + s.jeton} : {})},
        body:JSON.stringify({v:vid, ...corps})}).catch(() => {});
    }catch(e){}
  }
  const vues = new Set();
  window.QLN_EVT = nom => { if(!nom || vues.has(nom)) return; vues.add(nom); envoyer({e:"etape", n:String(nom).slice(0, 40)}); };
  // chargement de la page
  envoyer({e:"page", n:document.documentElement.lang === "en" ? "en" : "site", r:document.referrer || "", l:(navigator.languages && navigator.languages[0]) || navigator.language || "", natif:!!window.QLN_NATIVE});
  addEventListener("load", () => { while(file.length) envoyer(file.shift()); });
  // durée de visite : présence toutes les 30 s (page visible), première interaction, départ
  setInterval(() => { if(document.visibilityState === "visible") envoyer({e:"ping"}); }, 30000);
  const premier = () => { envoyer({e:"act"}); removeEventListener("pointerdown", premier); removeEventListener("keydown", premier); };
  addEventListener("pointerdown", premier); addEventListener("keydown", premier);
  addEventListener("pagehide", () => envoyer({e:"bye"}));
  // étapes déjà signalées par le jeu
  document.addEventListener("qln:fin-partie", e => { const m = e.detail && e.detail.mode; if(m) window.QLN_EVT("fin:" + String(m).replace(/[^a-z0-9-]/gi, "").toLowerCase()); });
  addEventListener("appinstalled", () => window.QLN_EVT("installation"));
})();
