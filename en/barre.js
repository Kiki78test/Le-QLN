/* =========================================================================
   Le-QLN — barre du bas (ordinateur) : Règles, Classement, Paramètres, Aide.
   Tout s'ouvre dans un volet par-dessus l'écran : on ne quitte jamais une partie en cours.
   Textes FR et EN dans ce fichier (pas de table de traduction). Dépend du socle de index.html.
   ========================================================================= */
const BarreBas = (() => {
const EN = document.documentElement.lang === "en";
const T = EN ? {
  regles:"Rules", classement:"Ranking", parametres:"Settings", aide:"Help", fermer:"Close",
  son:"Sound", sonD:"Game sounds and music cues", vib:"Vibrations", vibD:"Short vibrations on phones", oui:"On", non:"Off",
  partie:"Current game", cache:"hidden", arrive:n => `finished ${n}${["st","nd","rd"][n-1] || "th"}`, enJeu:"playing", hors:"out",
  noteCache:"Opponents' winnings stay hidden until the end of the game.", riche:"The richest player wins, not the first to finish.",
  astuces:["Find another word that uses exactly the same letters before the timer runs out.",
           "Type the letters, Enter to validate, Backspace to erase, Space to shuffle.",
           "On the board, the richest player wins: finishing first only pays a bonus.",
           "A refused word you believe is right can be disputed: it is checked and added to the game if valid.",
           "The « i » buttons explain each mode; tap a found word to see its definition."],
  tuto:"Play the guided game", voirRegles:"Read the full rules",
} : {
  regles:"Règles", classement:"Classement", parametres:"Paramètres", aide:"Aide", fermer:"Fermer",
  son:"Son", sonD:"Sons et signaux du jeu", vib:"Vibrations", vibD:"Courtes vibrations sur téléphone", oui:"Activé", non:"Coupé",
  partie:"Partie en cours", cache:"caché", arrive:n => `arrivé ${n}${n === 1 ? "er" : "e"}`, enJeu:"en jeu", hors:"hors jeu",
  noteCache:"Les gains des adversaires restent cachés jusqu'à la fin de la partie.", riche:"Le plus riche gagne, pas le premier arrivé.",
  astuces:["Trouvez un autre mot qui utilise exactement les mêmes lettres avant la fin du sablier.",
           "Tapez les lettres, Entrée pour valider, Retour arrière pour effacer, Espace pour mélanger.",
           "Sur le plateau, le plus riche gagne : arriver premier ne rapporte qu'un bonus.",
           "Un mot refusé que vous pensez juste peut être contesté : il est vérifié puis ajouté au jeu s'il est valable.",
           "Les boutons « i » expliquent chaque mode ; touchez un mot trouvé pour voir sa définition."],
  tuto:"Jouer la partie guidée", voirRegles:"Lire toutes les règles",
};
const I = {
  regles:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h7M8 11h7"/></svg>',
  classement:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>',
  parametres:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/></svg>',
  aide:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.1 1-1.1 1.9M12 17h.01"/></svg>',
};
const css = document.createElement("style");
css.textContent = `
#barre-bas{display:none}
@media (min-width:1000px) and (min-height:560px){
  #barre-bas{display:flex; position:fixed; left:0; right:0; bottom:0; z-index:30; height:46px; align-items:center; justify-content:space-between; padding:0 26px;
    background:linear-gradient(180deg, rgba(10,24,62,.72), rgba(5,13,36,.94)); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
    box-shadow:inset 0 1px 0 rgba(255,214,90,.45), 0 -8px 24px rgba(0,0,0,.35)}
  #barre-bas div{display:flex; align-items:center}
  #barre-bas button{display:inline-flex; align-items:center; gap:9px; height:46px; padding:0 18px; border:0; background:none; cursor:pointer; color:#dbe5ff; font:700 16px var(--f-ui); letter-spacing:.03em}
  #barre-bas button + button{box-shadow:inset 1px 0 0 rgba(255,255,255,.12)}
  #barre-bas button:hover,#barre-bas button:focus-visible{color:#ffd966; outline:none}
  #barre-bas svg{width:21px; height:21px}
  :root{--bb-h:46px} .app::after{content:""; flex:none; height:46px}   /* réserve la place de la barre en bas de chaque écran */
}
.bb-voile{position:fixed; inset:0; z-index:95; display:grid; place-items:start center; overflow:auto; padding:70px 16px 70px; background:rgba(2,6,20,.72); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); animation:apparaitFondu .2s}
.bb-volet{position:relative; width:min(100%, 620px); display:grid; gap:12px}
.bb-tete{display:flex; align-items:center; justify-content:space-between; gap:12px}
.bb-tete h2{margin:0; font:400 34px/1 var(--f-titre); letter-spacing:.04em; background:var(--or-grad-2); -webkit-background-clip:text; background-clip:text; color:transparent}
.bb-ligne{display:grid; grid-template-columns:auto 1fr auto; gap:12px; align-items:center; padding:12px 14px; border-radius:14px; color:#e6edff; background:linear-gradient(180deg, rgba(20,44,104,.92), rgba(8,20,52,.94)); box-shadow:inset 0 0 0 1.5px rgba(255,214,90,.45)}
.bb-ligne b{font:700 18px var(--f-ui)} .bb-ligne small{display:block; color:var(--brume); font:600 14px var(--f-ui)}
.bb-ligne .rang{font:400 28px/1 var(--f-titre); color:var(--or); min-width:22px; text-align:center}
.bb-ligne .somme{font:400 26px/1 var(--f-titre); color:var(--or)}
.bb-note{margin:0; text-align:center; font:600 14.5px var(--f-ui); color:var(--brume-2)}
.bb-or{margin:0; padding:9px 12px; border-radius:12px; text-align:center; font:700 16px var(--f-ui); color:#3a2a00; background:linear-gradient(180deg,#fff3c0,#ffd95e)}
.bb-astuces{margin:0; padding:14px 16px 14px 34px; display:grid; gap:9px; border-radius:14px; color:#e6edff; font:500 16px/1.4 var(--f-texte, var(--f-ui)); background:linear-gradient(180deg, rgba(20,44,104,.92), rgba(8,20,52,.94)); box-shadow:inset 0 0 0 1.5px rgba(255,214,90,.45)}
`;
document.head.appendChild(css);

let voile = null;
function fermer(){ if(voile){ voile.remove(); voile = null; } }
function volet(titre, corps){
  fermer();
  voile = document.createElement("div"); voile.className = "bb-voile"; voile.setAttribute("role", "dialog"); voile.setAttribute("aria-label", titre);
  voile.innerHTML = `<div class="bb-volet"><div class="bb-tete"><h2>${esc(titre)}</h2><button class="icone-btn" id="bb-fermer" aria-label="${T.fermer}">${ICO.croix}</button></div>${corps}</div>`;
  document.body.appendChild(voile);
  voile.addEventListener("click", e => { if(e.target === voile) fermer(); });
  $("#bb-fermer", voile).onclick = fermer;
  return voile;
}
document.addEventListener("keydown", e => { if(e.key === "Escape" && voile) fermer(); });

const partie = () => { try{ return typeof PlateauIA !== "undefined" ? PlateauIA._etat() : null; }catch(e){ return null; } };
const enJeu = () => !!partie() || (typeof P !== "undefined" && !!P);

function regles(){
  const v = volet(T.regles, typeof reglesHTML === "function" ? reglesHTML() : "");
  const d = $("#de-regle", v); if(d && typeof afficherDe === "function") afficherDe(d, 5);
}
function classement(){
  const G = partie();
  if(!G){ fermer(); if(typeof Compte !== "undefined") Compte.ecranClassements(); return; }
  const js = [...G.joueurs].sort((a, b) => (a.horsJeu - b.horsJeu) || (G.caches ? 0 : b.argent - a.argent));
  volet(T.partie, `<p class="bb-or">${T.riche}</p>` + js.map((j, i) => {
    const cache = G.caches && j.ia;
    return `<div class="bb-ligne"><span class="rang">${G.caches ? "·" : i + 1}</span><span><b>${esc(j.nom)}</b><small>${j.horsJeu ? T.hors : j.arrive ? T.arrive(j.arrive) : T.enJeu} · ${j.reussies}/${j.cartes}</small></span><span class="somme">${cache ? "•••" : euros(j.argent)}</span></div>`;
  }).join("") + (G.caches ? `<p class="bb-note">${T.noteCache}</p>` : ""));
}
function parametres(){
  const ligne = (id, titre, desc, actif) => `<div class="bb-ligne"><span></span><span><b>${titre}</b><small>${desc}</small></span><button class="bouton-plat" id="${id}" aria-pressed="${actif}">${actif ? T.oui : T.non}</button></div>`;
  const v = volet(T.parametres, ligne("bb-son", T.son, T.sonD, Son.actif) + ligne("bb-vib", T.vib, T.vibD, store.get("vibrations", true)));
  $("#bb-son", v).onclick = () => { Son.actif = !Son.actif; store.set("son", Son.actif); const b = $("#b-son"); if(b) b.innerHTML = Son.actif ? ICO.son : ICO.muet; parametres(); };
  $("#bb-vib", v).onclick = () => { store.set("vibrations", !store.get("vibrations", true)); parametres(); };
}
function aide(){
  const libre = !enJeu();
  const v = volet(T.aide, `<ul class="bb-astuces">${T.astuces.map(a => `<li>${a}</li>`).join("")}</ul>
    <div class="duo">${libre && typeof Progres !== "undefined" ? `<button class="bouton piece c-vert" id="bb-tuto">${T.tuto}</button>` : ""}<button class="bouton piece c-noir" id="bb-regles">${T.voirRegles}</button></div>`);
  const t = $("#bb-tuto", v); if(t) t.onclick = () => { fermer(); Progres.lancerTuto(); };
  $("#bb-regles", v).onclick = regles;
}
const barre = document.createElement("nav"); barre.id = "barre-bas"; barre.setAttribute("aria-label", EN ? "Shortcuts" : "Raccourcis");
barre.innerHTML = `<div><button data-b="regles">${I.regles}${T.regles}</button><button data-b="classement">${I.classement}${T.classement}</button></div>
  <div><button data-b="parametres">${I.parametres}${T.parametres}</button><button data-b="aide">${I.aide}${T.aide}</button></div>`;
document.body.appendChild(barre);
const ACT = {regles, classement, parametres, aide};
barre.querySelectorAll("button").forEach(b => b.onclick = () => ACT[b.dataset.b]());
return {regles, classement, parametres, aide, fermer};
})();
