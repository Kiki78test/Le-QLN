/* =========================================================================
   Le-QLN — Comptes en ligne, synchronisation de la progression, classements.
   S'active quand config.js définit window.QLN_API_URL (adresse du serveur, ex. https://le-qln.onrender.com).
   Sans serveur : les écrans existent mais expliquent que la fonction arrive bientôt ; le jeu reste 100 % local.
   Dépend du socle (store, $, $$, esc, euros, toast, Son, app, ICO, panneau, aujourdhui, pionSVG…),
   de Progres (progres.js) et de Multi (multi.js) pour le profil local.
   ========================================================================= */
"use strict";
const Compte = (() => {

/* ---------- Textes (la version EN remplace ce bloc) ---------- */
const TXT = {
  langue:"fr",
  compte:"Mon compte", classements:"Classements", bientotT:"Bientôt disponible",
  bientot:"Les comptes en ligne et les classements mondiaux arrivent avec le serveur du jeu. En attendant, votre progression reste enregistrée sur cet appareil.",
  connexion:"Connexion", inscription:"Créer un compte", email:"Adresse e-mail", mdp:"Mot de passe", mdpAide:"8 caractères minimum.",
  pseudo:"Pseudo", pays:"Pays", paysAucun:"Ne pas indiquer", seConnecter:"Se connecter", creer:"Créer mon compte", google:"Continuer avec Google",
  ou:"ou", dejaCompte:"J'ai déjà un compte", pasCompte:"Pas encore de compte ?",
  avantages:["Votre progression sur tous vos appareils", "Votre nom dans les classements", "Les podiums par pays"],
  connecte:"Connecté", deconnexion:"Se déconnecter", supprimer:"Supprimer mon compte", enregistrer:"Enregistrer",
  supprimerQ:"Supprimer définitivement votre compte, votre progression en ligne et vos scores ? La progression gardée sur cet appareil n'est pas effacée.",
  annuler:"Annuler", supprimerOk:"Compte supprimé.", bienvenue:p=>`Bienvenue, ${p} !`, deconnecte:"Vous êtes déconnecté.",
  synchro:"Progression synchronisée", synchroKo:"Synchronisation impossible pour l'instant (hors ligne ?).", enregistre:"Modifications enregistrées.",
  horsLigne:"Serveur injoignable. Vérifiez votre connexion et réessayez.",
  jour:"Défi du jour", defi:"Le Défi", braquage:"Braquage", monde:"Monde", monPays:"Mon pays", semaine:"Cette semaine", toujours:"Record",
  rang:"Rang", joueur:"Joueur", score:"Score", vide:"Aucun score pour l'instant : soyez le premier !", votreRang:(r,t)=>`Votre rang : ${r} sur ${t}`,
  pasClasse:"Jouez pour apparaître dans ce classement.", connectezVous:"Connectez-vous pour apparaître dans les classements.",
  paysRequis:"Indiquez votre pays dans « Mon compte » pour voir ce classement.", chargement:"Chargement…",
  secondes:s=>`${s} s`, mineurs:"Moins de 15 ans ? Demandez l'accord d'un parent avant de créer un compte.",
  confidentialite:"Seuls votre pseudo, votre pion et votre pays apparaissent dans les classements. Votre e-mail n'est jamais affiché.",
};
const PAYS = [["FR","France"],["BE","Belgique"],["CH","Suisse"],["CA","Canada"],["LU","Luxembourg"],["MC","Monaco"],["MA","Maroc"],["DZ","Algérie"],["TN","Tunisie"],["SN","Sénégal"],["CI","Côte d'Ivoire"],["CM","Cameroun"],
  ["GB","Royaume-Uni"],["IE","Irlande"],["US","États-Unis"],["AU","Australie"],["NZ","Nouvelle-Zélande"],["DE","Allemagne"],["ES","Espagne"],["IT","Italie"],["PT","Portugal"],["NL","Pays-Bas"],["IN","Inde"],["ZA","Afrique du Sud"]];
const lesPions = () => typeof PIONS !== "undefined" ? PIONS : [{nom:"Jaune",c:"#ffd60a"},{nom:"Rose",c:"#ff4fa3"},{nom:"Cyan",c:"#35e0ff"},{nom:"Blanc",c:"#f2f2f2"},{nom:"Lilas",c:"#c59bff"},{nom:"Orange",c:"#ff8a1f"}];
const drapeau = c => c ? String.fromCodePoint(...[...c].map(x => 0x1F1E6 + x.charCodeAt(0) - 65)) : "";

/* ---------- Session et appels ---------- */
const actif = () => !!window.QLN_API_URL;
const base = () => String(window.QLN_API_URL || "").replace(/\/$/, "");
let session = store.get("session", null);   // {jeton, joueur}
/* icône du compte (barre du haut) : disque coloré avec l'initiale du pseudo quand on est connecté, silhouette sinon */
const ICONE_VIDE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>';
function majIcone(){
  const b = document.getElementById("ab-profil"); if(!b) return;
  const j = connecte() ? session.joueur : null;
  b.classList.toggle("connecte", !!j);
  if(j){
    const c = (lesPions()[j.couleur] || lesPions()[0]).c;
    b.innerHTML = `<span class="ab-initiale" style="--pion:${c}">${esc(([...(j.pseudo || "?")][0] || "?").toUpperCase())}</span><i class="ab-point" aria-hidden="true"></i>`;
    b.setAttribute("aria-label", TXT.compte + " · " + j.pseudo);
  } else { b.innerHTML = ICONE_VIDE; b.setAttribute("aria-label", TXT.compte); }
}
function fixerSession(d){ session = d; store.set("session", d); majIcone(); }
const connecte = () => !!(session && session.jeton);
async function api(chemin, {methode="GET", corps=null, auth=true}={}){
  const r = await fetch(base() + "/api" + chemin, {method:methode, headers:{"Content-Type":"application/json", ...(auth && connecte() ? {Authorization:"Bearer " + session.jeton} : {})}, body:corps ? JSON.stringify(corps) : undefined});
  const d = await r.json().catch(() => ({}));
  if(r.status === 401 && auth && connecte() && chemin !== "/connexion"){ fixerSession(null); }
  if(!r.ok) throw Object.assign(new Error(d.erreur || TXT.horsLigne), {status:r.status});
  return d;
}
function ouvrirSession(d){
  fixerSession({jeton:d.jeton, joueur:d.joueur});
  // le profil local (multijoueur, contre l'IA) suit le compte
  const loc = store.get("compte", null) || {};
  store.set("compte", {...loc, id: loc.id || d.joueur.id, pseudo:d.joueur.pseudo, couleur:d.joueur.couleur, cree: loc.cree || Date.now()});
}

/* ---------- Synchronisation de la progression ---------- */
let synchroEnCours = null;
async function synchroniser(muet = true){
  if(!actif() || !connecte() || typeof Progres === "undefined") return;
  if(synchroEnCours) return synchroEnCours;
  synchroEnCours = (async () => {
    try{
      const local = Progres.donnees(), records = store.get("records", {});
      const d = await api("/progression?langue=" + TXT.langue, {methode:"PUT", corps:{progres:local, records:{defi:records.defi || 0, jour:records.jour || 0}}});
      if(d.progres) Progres.remplacer(d.progres);
      if(d.records){ const r = store.get("records", {}); for(const k of ["defi","jour"]) if((d.records[k]||0) > (r[k]||0)) r[k] = d.records[k]; store.set("records", r); }
      if(!muet) toast(TXT.synchro, 1800);
    }catch(e){ if(!muet) toast(e.status ? e.message : TXT.synchroKo, 3000); }
    finally{ synchroEnCours = null; }
  })();
  return synchroEnCours;
}
const dateISO = () => { const k = String(aujourdhui()); return `${k.slice(0,4)}-${k.slice(4,6)}-${k.slice(6,8)}`; };
document.addEventListener("qln:fin-partie", async e => {
  if(!actif() || !connecte()) return;
  const {mode, total, braquageOk} = e.detail || {};
  const m = mode === "jour" ? "jour" : mode === "defi" ? "defi" : mode === "braquage" && braquageOk ? "braquage" : null;
  // les mots trouvés accompagnent le score : le serveur vérifie qu'ils sont réels et que le score est possible (anti-triche)
  let historique;
  try{ if((m === "jour" || m === "defi") && typeof P !== "undefined" && P && Array.isArray(P.historique)) historique = P.historique.filter(h => !h.special && h.origine).map(h => ({niv:h.niv, origine:h.origine, trouves:h.trouves || []})); }catch(x){}
  try{ if(m) await api("/scores", {methode:"POST", corps:{mode:m, langue:TXT.langue, score:total || 0, jour: m === "jour" ? dateISO() : undefined, detail:historique ? {historique} : undefined}}); }catch(x){}
  synchroniser(true);
});
addEventListener("online", () => synchroniser(true));

/* =========================================================================
   Écran « Mon compte »
   ========================================================================= */
function ecranCompte(onglet = "connexion"){
  if(typeof arreterVitrine === "function") arreterVitrine();
  if(!actif()){ ecranBientot(TXT.compte, () => typeof Multi !== "undefined" && Multi.profil()); return; }
  if(connecte()) return ecranConnecte();
  const local = store.get("compte", null) || {};
  const opt = PAYS.map(([c,n]) => `<option value="${c}">${drapeau(c)} ${esc(n)}</option>`).join("");
  app.innerHTML = `
  <section class="ecran">
    <div class="entete-ecran"><button class="icone-btn" id="b-retour" aria-label="Retour">${ICO.retour}</button><h1>${TXT.compte}</h1><span></span></div>
    <div class="ct-avantages">${TXT.avantages.map(a => `<span>✓ ${esc(a)}</span>`).join("")}</div>
    <div class="ct-onglets" role="tablist"><button role="tab" data-o="connexion" aria-selected="${onglet==="connexion"}">${TXT.connexion}</button><button role="tab" data-o="inscription" aria-selected="${onglet==="inscription"}">${TXT.inscription}</button></div>
    <form class="m-carte ct-form" id="ct-form" novalidate>
      ${onglet === "inscription" ? `
      <label class="lbl" for="ct-pseudo">${TXT.pseudo}</label><input class="champ" id="ct-pseudo" maxlength="14" autocomplete="nickname" value="${esc(local.pseudo || "")}" required>
      <label class="lbl" for="ct-pays">${TXT.pays}</label><select class="champ" id="ct-pays"><option value="">${TXT.paysAucun}</option>${opt}</select>` : ""}
      <label class="lbl" for="ct-email">${TXT.email}</label><input class="champ" id="ct-email" type="email" autocomplete="email" inputmode="email" required>
      <label class="lbl" for="ct-mdp">${TXT.mdp}</label><input class="champ" id="ct-mdp" type="password" autocomplete="${onglet === "inscription" ? "new-password" : "current-password"}" minlength="8" required>
      ${onglet === "inscription" ? `<div class="m-aide">${TXT.mdpAide}</div>` : ""}
      <p class="ct-erreur" id="ct-erreur" role="alert" hidden></p>
      <button class="bouton piece c-jaune" type="submit" id="ct-ok">${onglet === "inscription" ? TXT.creer : TXT.seConnecter}</button>
      ${window.QLN_GOOGLE_CLIENT_ID ? `<div class="ct-ou"><span>${TXT.ou}</span></div><div id="ct-google" class="ct-google"></div>` : ""}
    </form>
    <p class="m-aide texte-centre">${TXT.confidentialite}</p>
    ${onglet === "inscription" ? `<p class="m-aide texte-centre">${TXT.mineurs}</p>` : ""}
  </section>`;
  const sel = $("#ct-pays"); if(sel){ const lg = (navigator.language || "").split("-")[1]; if(lg && PAYS.some(([c]) => c === lg.toUpperCase())) sel.value = lg.toUpperCase(); }
  $("#b-retour").onclick = ecranAccueil;
  $$(".ct-onglets button").forEach(b => b.onclick = () => ecranCompte(b.dataset.o));
  $("#ct-form").onsubmit = async ev => {
    ev.preventDefault();
    const err = $("#ct-erreur"), bouton = $("#ct-ok"); err.hidden = true; bouton.disabled = true;
    try{
      const corps = {email:$("#ct-email").value.trim(), mdp:$("#ct-mdp").value};
      if(onglet === "inscription"){ corps.pseudo = $("#ct-pseudo").value.trim(); corps.pays = $("#ct-pays").value || null; corps.couleur = local.couleur || 0; }
      const d = await api(onglet === "inscription" ? "/inscription" : "/connexion", {methode:"POST", corps, auth:false});
      ouvrirSession(d); Son.ok(); toast(TXT.bienvenue(d.joueur.pseudo), 2200);
      await synchroniser(true);
      ecranConnecte();
    }catch(e){ err.textContent = e.status ? e.message : TXT.horsLigne; err.hidden = false; bouton.disabled = false; Son.ko && Son.ko(); }
  };
  if(window.QLN_GOOGLE_CLIENT_ID) brancherGoogle();
}
function brancherGoogle(){
  const monter = () => {
    if(!window.google || !google.accounts || !$("#ct-google")) return;
    google.accounts.id.initialize({client_id:window.QLN_GOOGLE_CLIENT_ID, callback: async r => {
      try{ const d = await api("/google", {methode:"POST", corps:{credential:r.credential, pays:$("#ct-pays")?.value || null}, auth:false}); ouvrirSession(d); Son.ok(); toast(TXT.bienvenue(d.joueur.pseudo), 2200); await synchroniser(true); ecranConnecte(); }
      catch(e){ const err = $("#ct-erreur"); if(err){ err.textContent = e.message; err.hidden = false; } }
    }});
    google.accounts.id.renderButton($("#ct-google"), {theme:"filled_black", size:"large", shape:"pill", text:"continue_with", width: Math.min(360, $("#ct-google").clientWidth || 320), locale:TXT.langue});
  };
  if(window.google && google.accounts) return monter();
  if(!document.getElementById("gsi")){ const s = document.createElement("script"); s.id = "gsi"; s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.onload = monter; document.head.appendChild(s); }
}
function ecranConnecte(){
  const j = session.joueur, cols = lesPions();
  let couleur = j.couleur || 0;
  const opt = PAYS.map(([c,n]) => `<option value="${c}" ${c === j.pays ? "selected" : ""}>${drapeau(c)} ${esc(n)}</option>`).join("");
  app.innerHTML = `
  <section class="ecran">
    <div class="entete-ecran"><button class="icone-btn" id="b-retour" aria-label="Retour">${ICO.retour}</button><h1>${TXT.compte}</h1><span></span></div>
    <div class="m-carte ct-tete">${cols.length ? pionSVG(cols[couleur % cols.length].c) : ""}<div><b>${esc(j.pseudo)} ${drapeau(j.pays)}</b><small>${TXT.connecte}${j.email ? " · " + esc(j.email) : ""}${j.google ? " · Google" : ""}</small></div></div>
    <form class="m-carte ct-form" id="ct-form">
      <label class="lbl" for="ct-pseudo">${TXT.pseudo}</label><input class="champ" id="ct-pseudo" maxlength="14" value="${esc(j.pseudo)}">
      <label class="lbl" for="ct-pays">${TXT.pays}</label><select class="champ" id="ct-pays"><option value="">${TXT.paysAucun}</option>${opt}</select>
      ${cols.length ? `<span class="lbl">Pion</span><div class="m-couleurs" id="ct-couleurs">${cols.map((p,i) => `<button type="button" data-i="${i}" aria-pressed="${i===couleur}" aria-label="${esc(p.nom)}">${pionSVG(p.c)}</button>`).join("")}</div>` : ""}
      <p class="ct-erreur" id="ct-erreur" role="alert" hidden></p>
      <button class="bouton piece c-jaune" type="submit">${TXT.enregistrer}</button>
    </form>
    <div class="duo"><button class="bouton piece c-noir" id="ct-classements">${TXT.classements}</button><button class="bouton piece c-noir" id="ct-sortir">${TXT.deconnexion}</button></div>
    <div class="pied"><button class="bouton-plat" id="ct-supprimer">${TXT.supprimer}</button></div>
  </section>`;
  $("#b-retour").onclick = ecranAccueil;
  $$("#ct-couleurs button").forEach(b => b.onclick = () => { couleur = +b.dataset.i; $$("#ct-couleurs button").forEach(x => x.setAttribute("aria-pressed", x === b)); Son.tap(); });
  $("#ct-form").onsubmit = async ev => {
    ev.preventDefault(); const err = $("#ct-erreur"); err.hidden = true;
    try{ const d = await api("/moi", {methode:"PATCH", corps:{pseudo:$("#ct-pseudo").value.trim(), pays:$("#ct-pays").value || null, couleur}}); ouvrirSession({jeton:session.jeton, joueur:d.joueur}); toast(TXT.enregistre, 1800); ecranConnecte(); }
    catch(e){ err.textContent = e.message; err.hidden = false; }
  };
  $("#ct-classements").onclick = () => ecranClassements();
  $("#ct-sortir").onclick = () => { fixerSession(null); toast(TXT.deconnecte, 1800); ecranAccueil(); };
  $("#ct-supprimer").onclick = () => {
    const v = panneau({classe:"c-rouge", titre:TXT.supprimer, corps:`<p class="texte-centre">${TXT.supprimerQ}</p><div class="duo"><button class="bouton piece c-noir" id="s-non">${TXT.annuler}</button><button class="bouton piece c-rouge" id="s-oui">${TXT.supprimer}</button></div>`});
    $("#s-non", v).onclick = () => v.remove();
    $("#s-oui", v).onclick = async () => { try{ await api("/moi", {methode:"DELETE"}); }catch(e){ toast(e.message); return; } v.remove(); fixerSession(null); toast(TXT.supprimerOk, 2000); ecranAccueil(); };
  };
  synchroniser(true);
}
function ecranBientot(titre, autre){
  app.innerHTML = `
  <section class="ecran">
    <div class="entete-ecran"><button class="icone-btn" id="b-retour" aria-label="Retour">${ICO.retour}</button><h1>${titre}</h1><span></span></div>
    <div class="m-carte ct-bientot"><span class="ct-sablier" aria-hidden="true">⏳</span><b>${TXT.bientotT}</b><p class="m-aide">${TXT.bientot}</p>
      <div class="ct-avantages">${TXT.avantages.map(a => `<span>✓ ${esc(a)}</span>`).join("")}</div></div>
    ${autre ? `<button class="bouton piece c-noir" id="ct-autre">${typeof Multi !== "undefined" ? "Mon profil" : ""}</button>` : ""}
  </section>`;
  $("#b-retour").onclick = ecranAccueil;
  const b = $("#ct-autre"); if(b) b.onclick = autre;
}

/* =========================================================================
   Écran « Classements »
   ========================================================================= */
const etat = {mode:"jour", portee:"monde", periode:"toujours"};
async function ecranClassements(){
  if(typeof arreterVitrine === "function") arreterVitrine();
  if(!actif()){ ecranBientot(TXT.classements); return; }
  const j = session && session.joueur;
  app.innerHTML = `
  <section class="ecran">
    <div class="entete-ecran"><button class="icone-btn" id="b-retour" aria-label="Retour">${ICO.retour}</button><h1>${TXT.classements}</h1><span></span></div>
    <div class="ct-onglets" role="tablist">${["jour","defi","braquage"].map(m => `<button role="tab" data-m="${m}" aria-selected="${etat.mode===m}">${TXT[m]}</button>`).join("")}</div>
    <div class="ct-filtres">
      <div class="ct-seg">${["monde","pays"].map(p => `<button data-p="${p}" aria-pressed="${etat.portee===p}">${p === "monde" ? "🌍 " + TXT.monde : (j && j.pays ? drapeau(j.pays) + " " : "") + TXT.monPays}</button>`).join("")}</div>
      ${etat.mode !== "jour" ? `<div class="ct-seg">${["toujours","semaine"].map(p => `<button data-per="${p}" aria-pressed="${etat.periode===p}">${TXT[p]}</button>`).join("")}</div>` : ""}
    </div>
    <div class="m-carte ct-liste" id="ct-liste"><div class="m-vide"><i></i>${TXT.chargement}</div></div>
    <p class="m-aide texte-centre" id="ct-moi"></p>
  </section>`;
  $("#b-retour").onclick = ecranAccueil;
  $$("[data-m]").forEach(b => b.onclick = () => { etat.mode = b.dataset.m; ecranClassements(); });
  $$("[data-p]").forEach(b => b.onclick = () => { etat.portee = b.dataset.p; ecranClassements(); });
  $$("[data-per]").forEach(b => b.onclick = () => { etat.periode = b.dataset.per; ecranClassements(); });
  const liste = $("#ct-liste"), moiEl = $("#ct-moi");
  if(etat.portee === "pays" && !(j && j.pays)){ liste.innerHTML = `<div class="m-vide"><i></i>${connecte() ? TXT.paysRequis : TXT.connectezVous}</div>`; return; }
  try{
    const q = new URLSearchParams({mode:etat.mode, langue:TXT.langue, limite:50});
    if(etat.mode === "jour") q.set("jour", dateISO());
    if(etat.portee === "pays") q.set("pays", j.pays);
    if(etat.mode !== "jour" && etat.periode === "semaine") q.set("periode", "semaine");
    const d = await api("/classement?" + q);
    if(!$("#ct-liste")) return;
    const cols = lesPions();
    const val = s => etat.mode === "braquage" ? TXT.secondes(s) : euros(s);
    const podium = ["🥇","🥈","🥉"];
    liste.innerHTML = d.lignes.length ? d.lignes.map((l,i) => `<div class="ct-ligne ${l.moi ? "moi" : ""} ${l.rang <= 3 ? "podium r" + l.rang : ""}" style="animation-delay:${Math.min(i,12)*35}ms">
        <span class="ct-rang">${l.rang <= 3 ? podium[l.rang-1] : l.rang}</span>${cols.length ? pionSVG(cols[(l.couleur||0) % cols.length].c) : "<span></span>"}
        <span class="ct-nom">${esc(l.pseudo)} <i>${drapeau(l.pays)}</i></span><b>${val(l.score)}</b></div>`).join("")
      : `<div class="m-vide"><i></i>${TXT.vide}</div>`;
    moiEl.textContent = !connecte() ? TXT.connectezVous : d.moi ? TXT.votreRang(d.moi.rang, d.total) : TXT.pasClasse;
  }catch(e){ if($("#ct-liste")) liste.innerHTML = `<div class="m-vide"><i></i>${esc(e.status ? e.message : TXT.horsLigne)}</div>`; }
}

/* ---------- Styles ---------- */
const css = document.createElement("style");
css.textContent = `
.ct-avantages{display:grid; gap:4px; font:600 14px var(--f-texte, var(--f-ui)); color:#d4ddf3}
.ct-avantages span{display:block}
.ct-onglets{display:flex; gap:6px; padding:4px; border-radius:14px; background:rgba(0,0,0,.3); box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
.ct-onglets button{flex:1; padding:10px 8px; border-radius:10px; font:800 15px var(--f-ui); letter-spacing:.06em; text-transform:uppercase; color:var(--brume)}
.ct-onglets button[aria-selected="true"]{background:linear-gradient(180deg,#fff2b0,#ffd84a 45%,#f2b318); color:#2a1800; box-shadow:0 2px 8px rgba(255,190,30,.35)}
.ct-form{display:grid; gap:8px} .ct-form .lbl{margin-top:4px}
.ct-form select.champ{appearance:auto; font-size:17px; padding:10px 12px}
.ct-erreur{margin:4px 0 0; padding:8px 12px; border-radius:10px; background:rgba(226,70,60,.18); color:#ffb4ad; font:600 14px var(--f-ui); box-shadow:inset 0 0 0 1px rgba(226,70,60,.4)}
.ct-ou{display:flex; align-items:center; gap:10px; color:var(--brume); font:700 13px var(--f-ui); text-transform:uppercase; letter-spacing:.1em} .ct-ou::before,.ct-ou::after{content:""; flex:1; height:1px; background:rgba(255,255,255,.15)}
.ct-google{display:flex; justify-content:center; min-height:44px}
.ct-tete{display:flex; align-items:center; gap:14px} .ct-tete .pion-svg{width:34px; height:46px; filter:drop-shadow(0 3px 4px rgba(0,0,0,.5))}
.ct-tete b{display:block; font:400 28px var(--f-titre); color:#fff} .ct-tete small{display:block; font:600 13px var(--f-ui); color:var(--brume)}
.ct-bientot{justify-items:center; text-align:center} .ct-sablier{font-size:42px} .ct-bientot b{font:400 28px var(--f-titre); color:#ffe68f}
.ct-filtres{display:flex; gap:8px; flex-wrap:wrap; justify-content:center}
.ct-seg{display:inline-flex; padding:3px; border-radius:999px; background:rgba(0,0,0,.3); box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
.ct-seg button{padding:7px 14px; border-radius:999px; font:700 14px var(--f-ui); color:var(--brume)}
.ct-seg button[aria-pressed="true"]{background:rgba(255,255,255,.14); color:#fff; box-shadow:inset 0 0 0 1px rgba(255,214,90,.4)}
.ct-liste{gap:6px; padding:10px}
.ct-ligne{display:grid; grid-template-columns:36px 26px 1fr auto; align-items:center; gap:10px; padding:8px 10px; border-radius:12px; background:rgba(255,255,255,.04); animation:entreeLigne .35s backwards}
.ct-ligne .pion-svg{width:20px; height:28px; filter:drop-shadow(0 2px 2px rgba(0,0,0,.5))}
.ct-rang{font:400 22px var(--f-titre); color:var(--brume); text-align:center}
.ct-nom{font:700 16px var(--f-ui); color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap} .ct-nom i{font-style:normal}
.ct-ligne b{font:400 22px var(--f-titre); color:#ffe68f; font-variant-numeric:tabular-nums}
.ct-ligne.podium{background:linear-gradient(90deg, rgba(255,214,90,.14), rgba(255,255,255,.03))} .ct-ligne.podium .ct-rang{font-size:24px}
.ct-ligne.moi{box-shadow:inset 0 0 0 1.5px #ffd84a; background:rgba(255,214,90,.12)}
`;
document.head.appendChild(css);

// au lancement : rafraîchir la session et la progression si l'on est connecté
if(actif() && connecte()) setTimeout(() => synchroniser(true), 1500);
majIcone(); document.addEventListener("DOMContentLoaded", majIcone);

return { actif, connecte, ecranCompte, ecranClassements, synchroniser, session:() => session, TXT };
})();
