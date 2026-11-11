/* Le-QLN — remontée des erreurs : chaque erreur JavaScript rencontrée par un joueur est envoyée au serveur
   (une fois par session et par message, 10 au plus), puis listée dans la page d'administration (admin.html → Erreurs).
   Rien n'est envoyé sans serveur (config.js : QLN_API_URL vide), ni en local (fichier ouvert directement).
   Aucune donnée personnelle : message, fichier, ligne, version, écran affiché, langue, navigateur. */
(function(){
  "use strict";
  if(window.QLN_ERREURS || !/^(https?|capacitor):$/.test(location.protocol)) return; window.QLN_ERREURS = 1;
  const vus = {}, file = []; let envoyes = 0;
  const version = () => { try{ return caches.keys().then(k => k.filter(x => /^qln/.test(x)).sort().pop() || ""); }catch(e){ return Promise.resolve(""); } };
  const ecran = () => { try{ const e = document.querySelector(".ecran, .plateau-ecran"); return e ? [...e.classList].filter(c => c !== "ecran").join(".").slice(0, 40) : ""; }catch(e){ return ""; } };
  async function envoyer(e){
    const api = String(window.QLN_API_URL || "").replace(/\/$/, "");
    if(!api){ if(document.readyState !== "complete") file.push(e); return; }   // config.js pas encore chargé : on attend
    try{
      e.version = await version();
      fetch(api + "/api/log", {method:"POST", keepalive:true, headers:{"Content-Type":"application/json"}, body:JSON.stringify(e)}).catch(() => {});
    }catch(x){}
  }
  function signaler(message, source, ligne, pile){
    message = String(message || "").slice(0, 400);
    if(!message || /^Script error\.?$/i.test(message) || /ResizeObserver loop|Load failed|NetworkError|Failed to fetch|AbortError|play\(\) request|The play\(\)/i.test(message)) return;
    const k = message + "|" + ligne; if(vus[k] || envoyes >= 10) return; vus[k] = 1; envoyes++;
    envoyer({message, source:String(source || "").replace(location.origin, "").slice(0, 200), ligne:ligne || null, pile:String(pile || "").slice(0, 2000),
      ecran:ecran(), langue:document.documentElement.lang || "fr", natif:!!window.QLN_NATIVE, agent:navigator.userAgent.slice(0, 200)});
  }
  addEventListener("error", e => { if(e && e.message) signaler(e.message, e.filename, e.lineno, e.error && e.error.stack); });
  addEventListener("unhandledrejection", e => { const r = e && e.reason; signaler(r && r.message ? r.message : String(r), "", null, r && r.stack); });
  addEventListener("load", () => { while(file.length) envoyer(file.shift()); });
  window.QLN_SIGNALER = signaler;   // pour signaler une erreur attrapée volontairement
})();
