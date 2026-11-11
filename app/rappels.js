/* =========================================================================
   Le-QLN — rappels : « les cartes du jour sont prêtes » (chaque jour) et « nouveau défi de la semaine » (le lundi).
   - Navigateur et appli installée sur l'écran d'accueil : notifications Web Push envoyées par le serveur
     (server/rappels.js), à l'heure choisie, dans l'heure locale de l'appareil.
   - Applis Android et iOS (Capacitor) : notifications programmées sur le téléphone (@capacitor/local-notifications),
     sans passer par le serveur.
   Réglages dans Paramètres (menu ☰ ou barre du bas). Proposés une fois, après le premier défi du jour terminé.
   Textes FR et EN dans ce fichier. Dépend du socle (store, $, esc, toast, panneau, Son).
   ========================================================================= */
"use strict";
const Rappels = (() => {
const EN = document.documentElement.lang === "en";
const T = EN ? {
  titre:"Reminders", jour:"Daily challenge", jourD:h => `Every day at ${h}:00: today's cards are ready`, semaine:"Weekly challenge", semaineD:h => `On Mondays at ${h}:00: a new challenge begins`,
  heure:"Time", oui:"On", non:"Off", indispo:"Reminders aren't available in this browser. On iPhone/iPad, first add the game to your Home Screen (Share → Add to Home Screen).",
  refuse:"Notifications are blocked for this site. Allow them in your browser settings, then try again.", hors:"Reminders need the game server: try again later.",
  actives:"Reminders on.", coupes:"Reminders off.", proposerT:"Never miss the daily cards", proposer:"Get a reminder when the next daily cards are ready?", ok:"Remind me", plusTard:"No thanks",
  nJourT:"Today's cards are ready 🃏", nJour:"Daily challenge and Shadow duel are waiting. Keep your streak!", nSemT:"New weekly challenge 🏆", nSem:"A new challenge begins: one ranked attempt. Good luck!",
} : {
  titre:"Rappels", jour:"Défi du jour", jourD:h => `Chaque jour à ${h} h : les cartes du jour sont prêtes`, semaine:"Défi de la semaine", semaineD:h => `Le lundi à ${h} h : un nouveau défi commence`,
  heure:"Heure", oui:"Activé", non:"Coupé", indispo:"Les rappels ne sont pas disponibles sur ce navigateur. Sur iPhone/iPad, ajoutez d'abord le jeu à l'écran d'accueil (Partager → Sur l'écran d'accueil).",
  refuse:"Les notifications sont bloquées pour ce site. Autorisez-les dans les réglages du navigateur, puis réessayez.", hors:"Les rappels passent par le serveur du jeu : réessayez plus tard.",
  actives:"Rappels activés.", coupes:"Rappels coupés.", proposerT:"Ne manquez plus les cartes du jour", proposer:"Recevoir un rappel quand les prochaines cartes du jour sont prêtes ?", ok:"Me prévenir", plusTard:"Non merci",
  nJourT:"Les cartes du jour sont prêtes 🃏", nJour:"Défi du jour et Duel de l'ombre vous attendent. Gardez votre série !", nSemT:"Nouveau défi de la semaine 🏆", nSem:"Un nouveau défi commence : un seul essai classé. Bonne chance !",
};
const reglages = () => Object.assign({jour:false, semaine:false, heure:18}, store.get("rappels", {}));
const natif = () => { try{ return !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform() && Capacitor.Plugins && Capacitor.Plugins.LocalNotifications); }catch(e){ return false; } };
const api = () => String(window.QLN_API_URL || "").replace(/\/$/, "");
const webOk = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window && /^https:|^http:\/\/localhost/.test(location.href);
const disponible = () => natif() || (webOk() && !!api());
const b64 = s => { const p = "=".repeat((4 - s.length % 4) % 4), b = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from([...b].map(c => c.charCodeAt(0))); };

/* ---------- Appli Android / iOS : notifications locales ---------- */
async function programmerNatif(r){
  const LN = Capacitor.Plugins.LocalNotifications;
  await LN.cancel({notifications:[{id:101}, {id:102}]}).catch(() => {});
  if(!r.jour && !r.semaine) return true;
  const p = await LN.requestPermissions(); if(p.display !== "granted") throw new Error("refuse");
  const n = [];
  if(r.jour) n.push({id:101, title:T.nJourT, body:T.nJour, schedule:{on:{hour:r.heure, minute:0}, allowWhileIdle:true}});
  if(r.semaine) n.push({id:102, title:T.nSemT, body:T.nSem, schedule:{on:{weekday:2, hour:r.heure, minute:0}, allowWhileIdle:true}});   // 2 = lundi
  await LN.schedule({notifications:n});
  return true;
}
/* ---------- Navigateur : Web Push ---------- */
async function abonnementWeb(creer){
  const reg = await navigator.serviceWorker.ready;
  let ab = await reg.pushManager.getSubscription();
  if(!ab && creer){
    const {cle} = await (await fetch(api() + "/api/rappels/cle")).json();
    ab = await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:b64(cle)});
  }
  return ab;
}
async function programmerWeb(r, confirmer = true){
  if(!r.jour && !r.semaine){
    const ab = await abonnementWeb(false).catch(() => null);
    if(ab){ fetch(api() + "/api/rappels/desabonner", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({endpoint:ab.endpoint})}).catch(() => {}); ab.unsubscribe().catch(() => {}); }
    return true;
  }
  if(Notification.permission === "denied") throw new Error("refuse");
  if(Notification.permission !== "granted" && await Notification.requestPermission() !== "granted") throw new Error("refuse");
  const ab = await abonnementWeb(true);
  const s = (store.get("session", null) || {}).jeton;
  const rep = await fetch(api() + "/api/rappels/abonner", {method:"POST", headers:{"Content-Type":"application/json", ...(s ? {Authorization:"Bearer " + s} : {})},
    body:JSON.stringify({abonnement:ab.toJSON(), langue:EN ? "en" : "fr", jour:r.jour, semaine:r.semaine, heure:r.heure, decalage:new Date().getTimezoneOffset(), confirmer})});
  if(!rep.ok) throw new Error("hors");
  store.set("rappelsSync", Date.now());
  return true;
}
async function appliquer(r, {muet = false} = {}){
  try{
    if(natif()) await programmerNatif(r); else if(disponible()) await programmerWeb(r, !muet); else throw new Error("indispo");
    store.set("rappels", r);
    if(!muet) toast(r.jour || r.semaine ? T.actives : T.coupes, 1800);
    return true;
  }catch(e){
    if(!muet) toast(T[e.message] || T.hors, 4500);
    return false;
  }
}

/* ---------- Paramètres (volet de barre.js) ---------- */
function html(){
  const r = reglages(), ligne = (id, titre, desc, actif) => `<div class="bb-ligne"><span></span><span><b>${titre}</b><small>${desc}</small></span><button class="bouton-plat" id="${id}" aria-pressed="${actif}">${actif ? T.oui : T.non}</button></div>`;
  if(!disponible()) return `<h3 class="rp-titre">🔔 ${T.titre}</h3><p class="bb-note">${T.indispo}</p>`;
  return `<h3 class="rp-titre">🔔 ${T.titre}</h3>` + ligne("rp-jour", T.jour, T.jourD(r.heure), r.jour) + ligne("rp-semaine", T.semaine, T.semaineD(r.heure), r.semaine)
    + `<div class="bb-ligne"><span></span><span><b>${T.heure}</b></span><select class="champ rp-heure" id="rp-heure" aria-label="${T.heure}">${[8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(h => `<option value="${h}" ${h === r.heure ? "selected" : ""}>${EN ? h + ":00" : h + " h"}</option>`).join("")}</select></div>`;
}
function brancher(v, rouvrir){
  const r = reglages(), maj = async x => { const ok = await appliquer(x); if(ok || !x.jour && !x.semaine) rouvrir(); };
  const bj = $("#rp-jour", v), bs = $("#rp-semaine", v), bh = $("#rp-heure", v);
  if(bj) bj.onclick = () => { Son.tap(); maj({...r, jour:!r.jour}); };
  if(bs) bs.onclick = () => { Son.tap(); maj({...r, semaine:!r.semaine}); };
  if(bh) bh.onchange = () => { const x = {...r, heure:+bh.value}; if(x.jour || x.semaine) maj(x); else { store.set("rappels", x); rouvrir(); } };
}
/* proposé une seule fois, après le premier défi du jour terminé */
document.addEventListener("qln:fin-partie", e => {
  if(!e.detail || e.detail.mode !== "jour" || store.get("rappelsPropose", false) || !disponible()) return;
  const r = reglages(); if(r.jour || r.semaine) return;
  store.set("rappelsPropose", true);
  setTimeout(() => {
    if(typeof panneau !== "function" || document.querySelector(".voile")) return;
    const v = panneau({classe:"c-jaune", titre:T.proposerT, corps:`<p class="texte-centre" style="font-size:17px">🔔 ${T.proposer}</p>
      <div class="duo"><button class="bouton piece c-noir" id="rp-non">${T.plusTard}</button><button class="bouton piece c-vert" id="rp-oui">${T.ok}</button></div>`});
    $("#rp-non", v).onclick = () => v.remove();
    $("#rp-oui", v).onclick = async () => { v.remove(); await appliquer({...reglages(), jour:true, semaine:true}); };
  }, 6000);
});
/* une fois par jour : l'abonnement est rafraîchi (fuseau horaire, compte connecté, abonnement renouvelé par le navigateur) */
setTimeout(() => {
  const r = reglages();
  if((r.jour || r.semaine) && !natif() && disponible() && Notification.permission === "granted" && Date.now() - store.get("rappelsSync", 0) > 20*3600e3) appliquer(r, {muet:true});
}, 8000);

const css = document.createElement("style");
css.textContent = `.rp-titre{margin:10px 0 0; font:400 24px var(--f-titre); color:#ffe68f; letter-spacing:.03em} .rp-heure{width:auto; min-width:96px; padding:8px 10px; font-size:16px}`;
document.head.appendChild(css);
return {html, brancher, appliquer, reglages, disponible};
})();
