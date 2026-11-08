/* =========================================================================
   Le-QLN — infobulles de démonstration sur chaque mode et chaque bouton
   Souris : survol (ou focus clavier). Écran tactile : appui long, ou petit « i » sur les grandes cartes.
   Les textes sont rassemblés dans INFOS : « Titre|Explication ». Un texte peut être une fonction (élément) → texte.
   ========================================================================= */
"use strict";
const Infos = (() => {
const T = (t, d) => t + "|" + d;
const INFOS = [
  // barre du haut
  ['.bp-sw [data-v="1"]', T("Pub", "Simule la version gratuite financée par la publicité : un spot avant la partie, un bandeau discret pendant les sabliers, et des vidéos facultatives contre des bonus.")],
  ['.bp-sw [data-v="0"]', T("No Pub", "Simule la version sans publicité (payante ou abonnement) : rien ne s'affiche.")],
  // accueil
  ["#b-defi", T("Mode solo", "Choisissez votre partie : le Défi libre, le Festival (5 manches à médailles), le Braquage chronométré, le duel contre l'ombre ou le défi de la semaine.")],
  ["#b-ia", T("Contre l'IA", "Le plateau complet du jeu de société : dé, cases CD, prison, enchères. De 2 à 6 joueurs : vous et des adversaires pilotés par l'IA, de débutant à expert.")],
  ["#b-jour", T("Défi du jour", "Les mêmes cartes, événements et coffres pour tout le monde aujourd'hui. Un seul score compte par jour : à partager avec vos amis.")],
  ["#b-entr", T("Entraînement", "Choisissez une couleur de carte et jouez sans pression : pas de vies, sablier facultatif, autant de cartes que vous voulez.")],
  [".bientot", T("Multijoueur", "Prévu ensuite : parties de 2 à 6 joueurs, puis classements en ligne et podiums internationaux.")],
  [".stats .stat:nth-child(1)", T("Record Défi", "Votre meilleur score en partie libre avec toutes les règles du solo actives.")],
  [".stats .stat:nth-child(2)", T("Défi du jour", "Votre score du jour. Il ne compte qu'une fois par jour.")],
  [".stats .stat:nth-child(3)", T("Victoires IA", "Nombre de parties gagnées contre l'IA sur le plateau.")],
  [".bareme div:nth-child(1)", T("Facile (vert)", "Mots de 4 à 5 lettres · 20 € · 30 secondes.")],
  [".bareme div:nth-child(2)", T("Intermédiaire (bleu)", "Mots de 6 à 7 lettres · 50 € · 1 minute.")],
  [".bareme div:nth-child(3)", T("Difficile (rouge)", "Mots de 8 à 9 lettres · 100 € · 2 minutes.")],
  [".bareme div:nth-child(4)", T("Expert (noir)", "Mots de 10 lettres et plus · 200 € · 3 minutes.")],
  ["#b-regles, #b-regles-h", T("Règles du jeu", "Le principe, les couleurs et le fonctionnement de chaque mode.")],
  ["#b-docs", T("Documentation", "Les documents du projet : propositions de règles, dictionnaire d'anagrammes, liste des mots douteux.")],
  ["#b-install", T("Installer l'appli", "Ajoute Le-QLN à l'écran d'accueil : l'appli se lance en plein écran et fonctionne ensuite hors connexion.")],
  ["#b-son", T("Son", "Active ou coupe les bruitages.")],
  // écran solo
  ["#s-defi", T("Le Défi", "Partie libre : 10 cartes du vert au noir, 3 vies. Séries, cartes événement, coffres, jokers et carte légendaire, que vous pouvez activer ou couper juste en dessous.")],
  [".reglages summary", T("Règles de la partie libre", "Activez ou coupez chaque règle. Le record du Défi n'est enregistré que si toutes les règles sont actives.")],
  ["#s-fest", T("Le Festival", "Cinq manches avec un objectif chacune. Atteindre l'objectif donne une médaille de bronze et ouvre la suite. Argent : +25 %. Or : +50 %, ou argent sans aucun joker.")],
  ["#s-braq", T("Le Braquage", "Six mots de 5 à 10 lettres à trouver avec un seul chrono de 6 minutes. Chaque mot rapporte 20 secondes. Pas de passe possible. Score : temps restant.")],
  ["#s-duel", T("Duel de l'ombre", "Vous jouez les cartes du jour contre un adversaire fantôme : votre meilleure partie du jour, ou une ombre simulée. Son score avance carte après carte.")],
  ["#s-sem", el => { const t = TWISTS[cleSemaine() % TWISTS.length]; return T("Défi de la semaine : " + t.nom, t.resume + " Mêmes cartes pour tous toute la semaine. Un seul essai est classé, les suivants sont libres."); }],
  [".manche", el => { const i = +el.dataset.i, F = FESTIVAL[i]; return el.disabled ? T("Manche verrouillée", "Obtenez au moins le bronze à la manche précédente pour l'ouvrir.") : T(F.nom, F.resume + " Objectif : " + F.objectif + "."); }],
  // entraînement
  ["[data-niv]", el => { const N = NIVEAUX[el.dataset.niv]; return T(N.nom, N.lettres + " · " + N.gain + " € par carte · " + (N.temps<60 ? N.temps+" secondes" : N.temps/60+" min") + " avec le sablier."); }],
  ["#opt-chrono", T("Sablier", "Jouer avec le temps du tapis : 30 secondes à 3 minutes selon la couleur. Désactivé : réfléchissez autant que vous voulez.")],
  // jeu solo
  ["#b-quitter", T("Quitter", "Abandonne la partie en cours (une confirmation est demandée).")],
  ["#b-effacer", T("Effacer", "Retire la dernière lettre posée. Au clavier : Retour arrière.")],
  ["#b-melanger", T("Mélanger", "Réorganise les lettres pour y voir plus clair. Avec les jokers limités : un seul mélange par partie. Au clavier : Espace.")],
  ["#b-valider", T("Valider", "Envoie votre mot. Au clavier : Entrée. La carte se valide aussi seule quand toutes les lettres sont posées.")],
  ["#b-indice", T("Indice", "Révèle la première lettre d'une solution. Le gain de la carte est divisé par deux.")],
  ["#b-passer", T("Passer", "Abandonne la carte : une vie est perdue, sauf si vous avez une passe (joker). Une fois la carte gagnée, passe à la suivante.")],
  [".hud .banque", T("Banque", "Votre argent à l'abri. Le total final est votre score.")],
  [".chrono", T("Sablier", "Temps restant pour la carte. Trouver dans la première moitié du temps rapporte +25 %.")],
  [".vies", T("Vies", "Chaque carte ratée coûte une vie. Sans vie, la partie s'arrête.")],
  [".piste", T("Parcours", "Les cartes de la partie, du vert au noir. Vert : réussi, gris : raté.")],
  [".pastille-info.mult", T("Série", "Multiplicateur de la prochaine réussite : ×1, puis ×1,5, puis ×2 à partir de la troisième réussite de suite.")],
  [".pastille-info.evt", T("Événement", "Cette carte a une règle spéciale avec un multiplicateur de gain, annoncée avant le tirage.")],
  [".pastille-info:not(.mult):not(.evt)", el => /^Cagnotte/.test(el.textContent) ? T("Cagnotte", "Les gains de la série en cours, pas encore à l'abri. Un échec en fait perdre la moitié ; encaissez pour les sécuriser.") : T("Adversaire fantôme", "Son score après la dernière carte jouée. Comparez-le à votre banque.")],
  [".def-btn", T("Définition", "Affiche la définition du mot dans le Wiktionnaire.")],
  // panneaux solo
  ["#b-encaisser", T("Encaisser", "Met la cagnotte à l'abri dans la banque. La série repart à ×1.")],
  ["#b-suivant", el => el.id==="b-suivant" && document.getElementById("b-encaisser") ? T("Continuer la série", "Garde la cagnotte en jeu pour viser un multiplicateur plus élevé. Un échec en coûtera la moitié.") : T("Suite", "Passe à l'étape suivante.")],
  ["#b-boutique", T("Boutique", "Dépensez votre banque : indice 30 €, passe 60 €, +10 secondes sur la carte suivante 40 €.")],
  ["#b-pubrec", T("Pub facultative", "Regardez un spot de 6 secondes pour gagner un indice. Deux fois par partie au plus. Jamais pendant un sablier.")],
  ["#ev-oui", T("Relever", "Jouez la carte avec sa règle spéciale et son multiplicateur de gain.")],
  ["#ev-non", T("Esquiver", "Payez 30 € de votre banque pour jouer une carte normale.")],
  ["#lg-oui", T("Tenter", "Une carte de 10 lettres ou plus, 3 minutes, gain ×3. Un échec coûte une vie.")],
  ["#lg-non", T("Refuser", "Jouez la carte prévue, sans risque supplémentaire.")],
  [".trois [data-k]", el => /Coffre/.test(el.closest(".panneau")?.textContent || "") ? T("Coffre", "Contenu caché : bonus, joker, vie… ou malus. Un seul coffre à ouvrir.") : T("Carte cachée", "Seule la longueur du mot est visible : plus il est long, plus c'est difficile.")],
  // plateau contre l'IA
  ["#cfg-nb", T("Adversaires", "Nombre de joueurs pilotés par l'IA : de 1 à 5.")],
  ["#cfg-niv", T("Niveau de l'IA", "Débutant, joueur ou expert : change la réussite des adversaires, leurs enchères et leur prudence.")],
  ["#cfg-caches", T("Gains cachés", "Comme sur le tapis, on ne connaît pas l'argent des adversaires avant la fin.")],
  ["#cfg-rapide", T("Tours accélérés", "Réduit les animations pendant que l'IA joue.")],
  ["#cfg-couleurs", T("Votre pion", "Choisissez la couleur de votre pion.")],
  ["#b-go", T("Lancer la partie", "Démarre le plateau avec les joueurs choisis.")],
  ["#b-parti", T("C'est parti", "Commence la partie dans l'ordre affiché.")],
  ["#b-dock", el => /dé/i.test(el.textContent) ? T("Lancer le dé", "Le dé décide du nombre de cases. Vous choisissez ensuite votre case parmi les destinations possibles, y compris à un carrefour CD.") : T("Continuer", "Passe à l'étape suivante du tour.")],
  ["#p-ok", T("Proposer", "Valide votre anagramme. Réussite : vous encaissez le gain et vous rejouez.")],
  ["#p-seche", T("Je sèche", "Abandonne la carte : les autres joueurs peuvent enchérir pour la jouer à votre place.")],
  ["#p-eff", T("Effacer", "Retire la dernière lettre posée.")],
  ["#p-mel", T("Mélanger", "Réorganise les lettres.")],
  ["#e-oui", T("Enchérir", "Proposez un montant inférieur au gain pour tenter la carte. La meilleure offre l'emporte ; si vous réussissez, vous gardez la différence.")],
  ["#e-non", T("Passer", "Ne pas enchérir sur cette carte.")],
  ["#e-moins, #e-plus", T("Montant", "Ajuste votre enchère par pas de 5 €.")],
  ["#pr-payer", T("Caution", "Payez 50 € : vous sortez de prison et rejouez au prochain tour.")],
  ["#pr-aide", T("Garant", "Un autre joueur paie votre caution et touchera vos gains pendant vos 2 tours suivants.")],
  ["#pr-att", T("Attendre", "Vous passez 2 tours sans jouer.")],
  ["#g-oui", T("Payer la caution", "Vous payez 50 € et touchez les gains de ce joueur pendant 2 tours.")],
  ["#g-non", T("Refuser", "Vous ne payez pas : le joueur reste en prison.")],
  [".joueurs .joueur", el => T("Joueur", "Argent, état (prison, arrivé…). Les gains des IA restent cachés jusqu'à la fin si l'option est active.")],
  [".journal summary", T("Journal", "L'historique des derniers événements de la partie.")],
  ["#b-rejouer", T("Rejouer", "Relance une partie du même mode.")],
  ["#b-menu", T("Retour", "Revient au menu précédent.")],
];
const css = document.createElement("style");
css.textContent = `
.infobulle{position:fixed; z-index:95; max-width:min(300px, calc(100vw - 24px)); background:#05112e; color:#fff; border-radius:12px; padding:9px 12px 10px; pointer-events:none;
  box-shadow:0 12px 30px rgba(0,0,0,.55), 0 0 0 1px rgba(255,207,58,.55); font-family:var(--f-ui); font-weight:600; font-size:15px; line-height:1.28; animation:infoIn .16s ease}
@keyframes infoIn{from{opacity:0; transform:translateY(4px)}}
.infobulle b{display:block; color:var(--or); font-family:var(--f-titre); font-weight:400; font-size:20px; letter-spacing:.04em; line-height:1.05; margin-bottom:3px}
.infobulle::before{content:""; position:absolute; left:var(--fx,50%); top:-6px; width:11px; height:11px; background:#05112e; transform:translateX(-50%) rotate(45deg); box-shadow:-1px -1px 0 rgba(255,207,58,.55)}
.infobulle.dessus::before{top:auto; bottom:-6px; box-shadow:1px 1px 0 rgba(255,207,58,.55)}
.info-i{position:absolute; top:8px; right:8px; z-index:3; width:24px; height:24px; border-radius:50%; display:grid; place-items:center; font:700 14px/1 Georgia,serif; font-style:italic; cursor:help;
  background:rgba(0,0,0,.4); color:#fff; box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.55); transition:transform .12s, background .12s}
.info-i:hover{background:var(--or); color:#1b1400; transform:scale(1.12)}
.mode .etiquette{right:40px}
.manche .info-i{top:50%; right:8px; transform:translateY(-50%)}
`;
document.head.appendChild(css);

let bulle = null, cible = null, minuteurAff = null, minuteurCache = null, supprimerClic = false;
const texteDe = el => {
  for(const [sel, t] of INFOS){ let ok = false; try{ ok = el.matches(sel); }catch(e){} if(ok) return typeof t === "function" ? t(el) : t; }
  return null;
};
function trouver(depart){
  for(let el = depart; el && el !== document.body; el = el.parentElement){
    if(el.nodeType !== 1) continue;
    const t = texteDe(el); if(t) return {el, t};
  }
  return null;
}
function cacher(){ clearTimeout(minuteurAff); clearTimeout(minuteurCache); if(bulle){ bulle.remove(); bulle = null; } cible = null; }
function montrer(el, t){
  cacher(); cible = el;
  const [titre, desc] = t.split("|");
  const b = document.createElement("div"); b.className = "infobulle"; b.setAttribute("role", "tooltip");
  b.innerHTML = `<b>${esc(titre)}</b>${esc(desc)}`;
  document.body.appendChild(b); bulle = b;
  const r = el.getBoundingClientRect(), w = b.offsetWidth, h = b.offsetHeight;
  const left = Math.min(innerWidth - w - 12, Math.max(12, r.left + r.width/2 - w/2));
  let top = r.bottom + 12, dessus = false;
  if(top + h > innerHeight - 12 && r.top - h - 12 > 8){ top = r.top - h - 12; dessus = true; }
  b.style.left = left + "px"; b.style.top = Math.max(8, top) + "px";
  b.style.setProperty("--fx", Math.min(w - 14, Math.max(14, r.left + r.width/2 - left)) + "px");
  b.classList.toggle("dessus", dessus);
  minuteurCache = setTimeout(cacher, 7000);
}
const souris = matchMedia("(hover: hover)");
document.addEventListener("mouseover", e => {
  if(!souris.matches) return;
  const f = trouver(e.target); if(!f){ if(!e.target.closest(".infobulle")) cacher(); return; }
  if(f.el === cible) return;
  clearTimeout(minuteurAff); minuteurAff = setTimeout(() => montrer(f.el, f.t), 380);
});
document.addEventListener("mouseout", e => { if(souris.matches && (!e.relatedTarget || !trouver(e.relatedTarget))) cacher(); });
document.addEventListener("focusin", e => { if(e.target.matches && e.target.matches(":focus-visible")){ const f = trouver(e.target); if(f) montrer(f.el, f.t); } });
document.addEventListener("focusout", cacher);
document.addEventListener("keydown", e => { if(e.key === "Escape") cacher(); });
document.addEventListener("scroll", cacher, true);
document.addEventListener("pointerdown", e => { if(e.pointerType === "mouse") cacher(); });
/* appui long (tactile) */
let lp = null, depart = null;
document.addEventListener("pointerdown", e => {
  if(e.pointerType === "mouse") return;
  if(e.target.closest(".info-i")) return;
  const f = trouver(e.target); if(!f) { cacher(); return; }
  depart = [e.clientX, e.clientY];
  clearTimeout(lp); lp = setTimeout(() => { supprimerClic = true; montrer(f.el, f.t); }, 520);
});
document.addEventListener("pointermove", e => { if(depart && Math.hypot(e.clientX-depart[0], e.clientY-depart[1]) > 10){ clearTimeout(lp); depart = null; } });
["pointerup","pointercancel"].forEach(n => document.addEventListener(n, () => { clearTimeout(lp); depart = null; }));
document.addEventListener("click", e => {
  const i = e.target.closest(".info-i");
  if(i){
    e.preventDefault(); e.stopPropagation();
    const hote = i.parentElement, f = trouver(hote);
    if(cible === hote) cacher(); else if(f) montrer(hote, f.t);
    return;
  }
  if(supprimerClic){ supprimerClic = false; e.preventDefault(); e.stopPropagation(); return; }
  if(bulle && !e.target.closest(".infobulle") && !souris.matches) cacher();
}, true);
document.addEventListener("contextmenu", e => { if(supprimerClic && trouver(e.target)) e.preventDefault(); });

/* petit « i » sur les grandes cartes (utile sur téléphone) */
const GRANDES = ".mode, .manche, .choix-niv > .piece, .reglages summary";
let planifie = false;
function badges(){
  planifie = false;
  $$(GRANDES).forEach(el => {
    if(el.querySelector(":scope > .info-i") || !texteDe(el)) return;
    if(el.matches("summary")) return;
    const i = document.createElement("span"); i.className = "info-i"; i.textContent = "i"; i.setAttribute("role", "button"); i.setAttribute("aria-label", "À quoi ça sert ?");
    el.appendChild(i);
  });
}
new MutationObserver(() => { if(!planifie){ planifie = true; requestAnimationFrame(badges); } }).observe(document.body, {childList:true, subtree:true});
return { cacher };
})();
