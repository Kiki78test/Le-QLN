/* =========================================================================
   Le-QLN — demo tooltips on every mode and button
   Souris : survol (ou focus clavier). Écran tactile : appui long, ou petit « i » sur les grandes cartes.
   Les textes sont rassemblés dans INFOS : « Titre|Explication ». Un texte peut être une fonction (élément) → texte.
   ========================================================================= */
"use strict";
const Infos = (() => {
const T = (t, d) => t + "|" + d;
const INFOS = [
  // barre du haut
  ['.bp-sw [data-v="1"]', T("Ads", "Simulates the free version funded by advertising: a spot before the game, a discreet banner during timers, and optional videos in exchange for bonuses.")],
  ['.bp-sw [data-v="0"]', T("No Ads", "Simulates the ad-free version (paid or subscription): nothing is shown.")],
  // accueil
  ["#b-defi", T("Solo mode", "Choose your game: the free Challenge, the Festival (5 rounds with medals), the timed Heist, the duel against the shadow or the weekly challenge.")],
  ["#b-ia", T("Versus AI", "The full board game: die, CD squares, jail, auctions. 2 to 6 players: you and AI-controlled opponents, from beginner to expert.")],
  ["#b-jour", T("Daily challenge", "The same cards, events and chests for everyone today. Only one score counts per day: share it with your friends.")],
  ["#b-entr", T("Practice", "Pick a card colour and play with no pressure: no lives, optional timer, as many cards as you like.")],
  [".bientot", T("Multiplayer", "Coming next: games for 2 to 6 players, then online rankings and international podiums.")],
  [".stats .stat:nth-child(1)", T("Challenge record", "Your best score in the free game with all the solo rules on.")],
  [".stats .stat:nth-child(2)", T("Daily challenge", "Your score of the day. It only counts once a day.")],
  [".stats .stat:nth-child(3)", T("AI wins", "Number of games won against the AI on the board.")],
  [".bareme div:nth-child(1)", T("Easy (green)", "Words of 4 to 5 letters · €20 · 30 seconds.")],
  [".bareme div:nth-child(2)", T("Intermediate (blue)", "Words of 6 to 7 letters · €50 · 1 minute.")],
  [".bareme div:nth-child(3)", T("Hard (red)", "Words of 8 to 9 letters · €100 · 2 minutes.")],
  [".bareme div:nth-child(4)", T("Expert (black)", "Words of 10 letters and more · €200 · 3 minutes.")],
  ["#b-regles, #b-regles-h", T("How to play", "The idea, the colours and how each mode works.")],
  ["#b-docs", T("Documentation", "The project documents: rule proposals, anagram dictionary, list of doubtful words.")],
  ["#b-install", T("Install the app", "Adds Le-QLN to your home screen: the app opens full screen and then works offline.")],
  ["#b-son", T("Sound", "Turns the sound effects on or off.")],
  // écran solo
  ["#s-defi", T("The Challenge", "Free game: 10 cards from green to black, 3 lives. Streaks, event cards, chests, jokers and a legendary card, which you can switch on or off just below.")],
  [".reglages summary", T("Free game rules", "Switch each rule on or off. The Challenge record is only saved if all the rules are on.")],
  ["#s-fest", T("The Festival", "Five rounds, each with a target. Reaching the target earns a bronze medal and opens the next round. Silver: +25%. Gold: +50%, or silver with no joker.")],
  ["#s-braq", T("The Heist", "Six words of 5 to 10 letters to find with a single 6-minute clock. Each word earns 20 seconds. No passing. Score: time left.")],
  ["#s-duel", T("Shadow duel", "You play today's cards against a ghost opponent: your best game of the day, or a simulated shadow. Its score moves forward card by card.")],
  ["#s-sem", el => { const t = TWISTS[cleSemaine() % TWISTS.length]; return T("Weekly challenge: " + t.nom, t.resume + " Same cards for everyone all week. Only one attempt is ranked, the others are free."); }],
  [".manche", el => { const i = +el.dataset.i, F = FESTIVAL[i]; return el.disabled ? T("Round locked", "Win at least bronze in the previous round to open it.") : T(F.nom, F.resume + " Target: " + F.objectif + "."); }],
  // entraînement
  ["[data-niv]", el => { const N = NIVEAUX[el.dataset.niv]; return T(N.nom, N.lettres + " · €" + N.gain + " per card · " + (N.temps<60 ? N.temps+" seconds" : N.temps/60+" min") + " with the timer."); }],
  ["#opt-chrono", T("Timer", "Play against the board clock: 30 seconds to 3 minutes depending on colour. Off: think as long as you like.")],
  // jeu solo
  ["#b-quitter", T("Quit", "Abandons the current game (you will be asked to confirm).")],
  ["#b-effacer", T("Erase", "Removes the last letter placed. On the keyboard: Backspace.")],
  ["#b-melanger", T("Shuffle", "Rearranges the letters to see more clearly. With limited jokers: only one shuffle per game. On the keyboard: Space.")],
  ["#b-valider", T("Submit", "Sends your word. On the keyboard: Enter. The card also submits by itself once all the letters are placed.")],
  ["#b-indice", T("Hint", "Reveals the first letter of a solution. The card's winnings are halved.")],
  ["#b-passer", T("Skip", "Gives up the card: a life is lost, unless you have a pass (joker). Once the card is won, moves on to the next one.")],
  [".hud .banque", T("Bank", "Your money, safe. The final total is your score.")],
  [".chrono", T("Timer", "Time left on the card. Solving it in the first half of the time earns +25%.")],
  [".vies", T("Lives", "Each missed card costs a life. With no lives left, the game ends.")],
  [".piste", T("Course", "The cards of the game, from green to black. Green: solved, grey: missed.")],
  [".pastille-info.mult", T("Streak", "Multiplier for the next success: ×1, then ×1.5, then ×2 from the third win in a row.")],
  [".pastille-info.evt", T("Event", "This card has a special rule with a winnings multiplier, announced before the draw.")],
  [".pastille-info:not(.mult):not(.evt)", el => /^Pot/.test(el.textContent) ? T("Pot", "The winnings of the current streak, not yet safe. A failure loses half of them; cash in to secure them.") : T("Ghost opponent", "Its score after the last card played. Compare it with your bank.")],
  [".def-btn", T("Definition", "Shows the word's definition from Wiktionary.")],
  // panneaux solo
  ["#b-encaisser", T("Cash in", "Moves the pot safely into the bank. The streak restarts at ×1.")],
  ["#b-suivant", el => el.id==="b-suivant" && document.getElementById("b-encaisser") ? T("Keep the streak going", "Keeps the pot in play to aim for a higher multiplier. A failure will cost half of it.") : T("Next", "Moves on to the next step.")],
  ["#b-boutique", T("Shop", "Spend your bank: hint €30, pass €60, +10 seconds on the next card €40.")],
  ["#b-pubrec", T("Optional ad", "Watch a 6-second spot to earn a hint. At most twice per game. Never during a timer.")],
  ["#ev-oui", T("Take it on", "Play the card with its special rule and winnings multiplier.")],
  ["#ev-non", T("Dodge", "Pay €30 from your bank to play a normal card.")],
  ["#lg-oui", T("Go for it", "A card of 10 letters or more, 3 minutes, winnings ×3. A failure costs a life.")],
  ["#lg-non", T("Decline", "Play the planned card, with no extra risk.")],
  [".trois [data-k]", el => /chest/i.test(el.closest(".panneau")?.textContent || "") ? T("Chest", "Hidden content: bonus, joker, life… or a penalty. Only one chest to open.") : T("Hidden card", "Only the word length is visible: the longer it is, the harder it is.")],
  // plateau contre l'IA
  ["#cfg-nb", T("Opponents", "Number of AI-controlled players: 1 to 5.")],
  ["#cfg-niv", T("AI level", "Beginner, player or expert: changes the opponents' success rate, bids and caution.")],
  ["#cfg-caches", T("Hidden winnings", "Like on the board, you don't know the opponents' money until the end.")],
  ["#cfg-rapide", T("Faster turns", "Shortens the animations while the AI plays.")],
  ["#cfg-couleurs", T("Your pawn", "Choose your pawn's colour.")],
  ["#b-go", T("Start the game", "Starts the board with the chosen players.")],
  ["#b-parti", T("Let's go", "Starts the game in the order shown.")],
  ["#b-dock", el => /die/i.test(el.textContent) ? T("Roll the die", "The die decides how many squares you move. You then choose your square among the possible destinations, including at a CD junction.") : T("Continue", "Moves on to the next step of the turn.")],
  ["#p-ok", T("Submit", "Submits your anagram. Success: you collect the winnings and play again.")],
  ["#p-seche", T("I give up", "Gives up the card: the other players can bid to play it in your place.")],
  ["#p-eff", T("Erase", "Removes the last letter placed.")],
  ["#p-mel", T("Shuffle", "Rearranges the letters.")],
  ["#e-oui", T("Bid", "Offer an amount below the card's value to try the card. The best offer wins; if you succeed, you keep the difference.")],
  ["#e-non", T("Pass", "Do not bid on this card.")],
  ["#e-moins, #e-plus", T("Amount", "Adjusts your bid in steps of €5.")],
  ["#pr-payer", T("Bail", "Pay €50: you leave jail and play again next turn.")],
  ["#pr-aide", T("Guarantor", "Another player pays your bail and collects your winnings for your next 2 turns.")],
  ["#pr-att", T("Wait", "You sit out 2 turns.")],
  ["#g-oui", T("Pay the bail", "You pay €50 and collect this player's winnings for 2 turns.")],
  ["#g-non", T("Decline", "You don't pay: the player stays in jail.")],
  [".joueurs .joueur", el => T("Player", "Money, status (jail, finished…). The AIs' winnings stay hidden until the end if the option is on.")],
  [".journal summary", T("Log", "The history of the latest events in the game.")],
  ["#b-rejouer", T("Play again", "Starts another game in the same mode.")],
  ["#b-menu", T("Back", "Returns to the previous menu.")],
];
const css = document.createElement("style");
css.textContent = `
.infobulle{position:fixed; z-index:95; max-width:min(300px, calc(100vw - 24px)); background:#05112e; color:#fff; border-radius:12px; padding:9px 12px 10px; pointer-events:none;
  box-shadow:0 12px 30px rgba(0,0,0,.55), 0 0 0 1px rgba(255,207,58,.55); font-family:var(--f-ui); font-weight:600; font-size:15px; line-height:1.28; animation:infoIn .16s ease}
@keyframes infoIn{from{opacity:0; transform:translateY(4px)}}
.infobulle b{display:block; color:var(--or); font-family:var(--f-titre); font-weight:400; font-size:20px; letter-spacing:.04em; line-height:1.05; margin-bottom:3px}
.infobulle::before{content:""; position:absolute; left:var(--fx,50%); top:-6px; width:11px; height:11px; background:#05112e; transform:translateX(-50%) rotate(45deg); box-shadow:-1px -1px 0 rgba(255,207,58,.55)}
.infobulle.dessus::before{top:auto; bottom:-6px; box-shadow:1px 1px 0 rgba(255,207,58,.55)}
.infobulle.droite::before{top:var(--fy,50%); left:-6px; transform:translateY(-50%) rotate(45deg); box-shadow:-1px 1px 0 rgba(255,207,58,.55)}
.infobulle.gauche::before{top:var(--fy,50%); left:auto; right:-6px; transform:translateY(-50%) rotate(45deg); box-shadow:1px -1px 0 rgba(255,207,58,.55)}
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
  // positions possibles : dessous, dessus, à droite, à gauche ; on garde celle qui ne cache pas les lettres du jeu
  const cx = Math.min(innerWidth - w - 12, Math.max(12, r.left + r.width/2 - w/2)), cy = Math.min(innerHeight - h - 8, Math.max(8, r.top + r.height/2 - h/2));
  const choix = [{left:cx, top:r.bottom + 12, sens:""}, {left:cx, top:r.top - h - 12, sens:"dessus"},
                 {left:r.right + 12, top:cy, sens:"droite"}, {left:r.left - w - 12, top:cy, sens:"gauche"}];
  const proteges = [...document.querySelectorAll(".reserve, .reponse, .table-carte .mot, .panneau-jeu .mot, .vitrine")].map(x => x.getBoundingClientRect()).filter(x => x.width && x.height);
  const recouvre = (c, x) => Math.max(0, Math.min(c.left + w, x.right) - Math.max(c.left, x.left)) * Math.max(0, Math.min(c.top + h, x.bottom) - Math.max(c.top, x.top));
  const cout = c => {
    const hors = Math.max(0, 8 - c.left) + Math.max(0, c.left + w - innerWidth + 8) + Math.max(0, 8 - c.top) + Math.max(0, c.top + h - innerHeight + 8);
    return hors * 1e4 + proteges.reduce((t, x) => t + recouvre(c, x), 0) * 10 + (c.sens === "droite" || c.sens === "gauche" ? 1 : 0);
  };
  const best = choix.reduce((m, c) => cout(c) < cout(m) ? c : m, choix[0]);
  b.style.left = Math.min(innerWidth - w - 8, Math.max(8, best.left)) + "px"; b.style.top = Math.min(innerHeight - h - 8, Math.max(8, best.top)) + "px";
  b.style.setProperty("--fx", Math.min(w - 14, Math.max(14, r.left + r.width/2 - best.left)) + "px");
  b.style.setProperty("--fy", Math.min(h - 14, Math.max(14, r.top + r.height/2 - Math.max(8, best.top))) + "px");
  b.classList.toggle("dessus", best.sens === "dessus"); b.classList.toggle("droite", best.sens === "droite"); b.classList.toggle("gauche", best.sens === "gauche");
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
    const i = document.createElement("span"); i.className = "info-i"; i.textContent = "i"; i.setAttribute("role", "button"); i.setAttribute("aria-label", "What is this for?");
    el.appendChild(i);
  });
}
new MutationObserver(() => { if(!planifie){ planifie = true; requestAnimationFrame(badges); } }).observe(document.body, {childList:true, subtree:true});
return { cacher };
})();
