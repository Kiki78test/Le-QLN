/* =========================================================================
   Le-QLN — Séries du Défi : Classique, par langue (cartes dans l'autre langue), à thème.
   Choix par un menu déroulant sur l'écran Solo ; débloquées par niveau ; pas de classement (mode "serie").
   Données : data/themes-<langue>.json (tools/build_themes.py) ; dictionnaires des autres langues chargés à la demande
   (français / anglais : ceux du jeu ; espagnol, allemand, italien : data/langues/, tools/build_dict_langues.py).
   Dépend du socle de index.html (DICO, NIVEAUX, PARCOURS_DEFI, VIES, REGLES_DEFAUT, norm, cleTri, store, esc, $).
   ========================================================================= */
const Series = (() => {
const LG = document.documentElement.lang === "en" ? "en" : "fr";
const TXT = LG === "en" ? {
  serie:"Series", classique:"Classic", classiqueD:"10 cards from every colour", langues:"Languages", themes:"Themes",
  verrou:n => `level ${n}`, nomLangue:{fr:"Français", en:"English", es:"Español", de:"Deutsch", it:"Italiano"},
  descTheme:(n, t) => `${n} cards per game · ${t}`, descLangue:l => `10 cards in ${{fr:"French", es:"Spanish", de:"German", it:"Italian"}[l]}`, pasClasse:"Series are not ranked: just for fun and XP.",
  chargement:"Loading the series…", echec:"This series could not be loaded. Check your connection and try again.",
  niveau:n => `Unlocked at level ${n}`, debloque:n => `New series unlocked: ${n}!`,
} : {
  serie:"Série", classique:"Classique", classiqueD:"10 cartes de toutes les couleurs", langues:"Langues", themes:"Thèmes",
  verrou:n => `niveau ${n}`, nomLangue:{fr:"Français", en:"English", es:"Español", de:"Deutsch", it:"Italiano"},
  descTheme:(n, t) => `${n} cartes par partie · ${t}`, descLangue:l => `10 cartes en ${{en:"anglais", es:"espagnol", de:"allemand", it:"italien"}[l]}`, pasClasse:"Les séries ne sont pas classées : pour le plaisir et l'XP.",
  chargement:"Chargement de la série…", echec:"Impossible de charger cette série. Vérifiez la connexion et réessayez.",
  niveau:n => `Débloquée au niveau ${n}`, debloque:n => `Nouvelle série débloquée : ${n} !`,
};
const AUTRE = LG === "en" ? "fr" : "en";
const BASE = LG === "en" ? "../" : "";
// séries de langue : dictionnaire et niveau requis (l'autre langue du jeu d'abord, puis espagnol, allemand, italien)
const LANGUES = [{lang:AUTRE, chemin: LG === "en" ? "../data/fr.json" : "en/data/en.json", requis:3},
                 {lang:"es", chemin:BASE + "data/langues/es.json", requis:5},
                 {lang:"de", chemin:BASE + "data/langues/de.json", requis:6},
                 {lang:"it", chemin:BASE + "data/langues/it.json", requis:7}];
const DRAPEAU = {fr:{emoji:"🇫🇷", bandes:["#0055a4", "#ffffff", "#ef4135"]}, en:{emoji:"🇬🇧", bandes:["#012169", "#ffffff", "#c8102e"]},
                 es:{emoji:"🇪🇸", bandes:["#aa151b", "#f1bf00", "#aa151b"]}, de:{emoji:"🇩🇪", bandes:["#000000", "#dd0000", "#ffce00"]},
                 it:{emoji:"🇮🇹", bandes:["#009246", "#ffffff", "#ce2b37"]}};
// drapeaux : Windows n'affiche pas les émojis de drapeaux (il écrit « FR », « GB »…) → pastille aux couleurs du pays
const DRAPEAUX_OK = (() => { try{
  const c = document.createElement("canvas"); c.width = c.height = 20; const x = c.getContext("2d", {willReadFrequently:true});
  x.textBaseline = "top"; x.font = "16px sans-serif"; x.fillText("\u{1F1EB}\u{1F1F7}", 0, 0);
  const d = x.getImageData(0, 0, 20, 20).data; for(let i = 0; i < d.length; i += 4) if(d[i+3] > 50 && Math.max(d[i], d[i+1], d[i+2]) - Math.min(d[i], d[i+1], d[i+2]) > 60) return true;
  return false; }catch(e){ return true; } })();
const CODES = {fr:"FR", en:"EN", es:"ES", de:"DE", it:"IT"};
function drapeau(lang){
  const d = DRAPEAU[lang]; if(!d) return "";
  if(DRAPEAUX_OK) return d.emoji;
  const b = d.bandes;
  return `<span class="drap" style="background:linear-gradient(90deg,${b[0]} 0 33.3%,${b[1]} 33.3% 66.6%,${b[2]} 66.6%)">${CODES[lang] || lang.toUpperCase()}</span>`;
}
const LONGUEUR = 8;                      // cartes par série à thème
const nivTheme = i => i < 2 ? 1 : i;     // 2 thèmes dès le niveau 1, puis un de plus à chaque niveau

let THEMES = null; const DICOS = {};
const niveauJoueur = () => { try{ return typeof Progres !== "undefined" ? Progres.niveau().n : 1; }catch(e){ return 1; } };

async function chargerThemes(){
  if(THEMES) return THEMES;
  try{ const r = await fetch(`data/themes-${LG}.json`); THEMES = (await r.json()).themes || []; }catch(e){ THEMES = []; }
  return THEMES;
}
async function chargerLangue(lang){
  if(DICOS[lang]) return DICOS[lang];
  const brut = await (await fetch(LANGUES.find(x => x.lang === lang).chemin)).json(), D = {};
  for(const k of Object.keys(NIVEAUX)) D[k] = (brut[k] || []).map(g => { const vus = new Set(), m = []; for(const w of g){ const n = norm(w); if(!vus.has(n)){ vus.add(n); m.push(w); } } return m; }).filter(g => g.length >= 2);
  return DICOS[lang] = D;
}
/* liste du menu : {cle, nom, emoji, desc, requis, ouvert} */
async function catalogue(){
  const t = await chargerThemes(), nv = niveauJoueur();
  const liste = [{cle:"classique", nom:TXT.classique, emoji:"🎴", desc:TXT.classiqueD, requis:1, groupe:""}];
  for(const x of LANGUES) liste.push({cle:"langue-" + x.lang, nom:TXT.nomLangue[x.lang], emoji:drapeau(x.lang), desc:TXT.descLangue(x.lang), requis:x.requis, groupe:TXT.langues});
  t.forEach((th, i) => liste.push({cle:"theme-" + th.cle, nom:th.nom, emoji:th.emoji, desc:TXT.descTheme(LONGUEUR, th.mots.length + " " + (LG === "en" ? "words in the theme" : "mots dans le thème")), requis:nivTheme(i), groupe:TXT.themes, th}));
  liste.forEach(x => x.ouvert = nv >= x.requis);
  return liste;
}
const choisie = () => store.get("serie", "classique");

/* ---------- choix de la série (écran Solo) : bandeau de tuiles à faire défiler ---------- */
function fondTuile(x){
  if(x.cle === "classique") return "linear-gradient(160deg,#8fca42,#1e6a29)";
  if(x.cle.startsWith("langue-")){ const b = DRAPEAU[x.cle.slice(7)].bandes; return `linear-gradient(90deg,${b[0]} 0 33.3%,${b[1]} 33.3% 66.6%,${b[2]} 66.6%)`; }
  return `linear-gradient(160deg,${x.th.c1},${x.th.c2})`;
}
async function menu(zone, majBouton){
  const liste = await catalogue();
  let cle = choisie(); if(!liste.some(x => x.cle === cle && x.ouvert)) cle = "classique";
  const groupes = [...new Set(liste.map(x => x.groupe))];
  const tuile = x => `<button class="serie-tuile ${x.ouvert ? "" : "verrou"}" data-serie="${x.cle}" role="radio" aria-checked="${x.cle === cle}" ${x.ouvert ? "" : "aria-disabled=\"true\""} style="--fond:${fondTuile(x)}" aria-label="${esc(x.nom)}${x.ouvert ? "" : " — " + TXT.verrou(x.requis)}">
      <i class="st-fond" aria-hidden="true"></i><span class="st-emoji" aria-hidden="true">${x.emoji}</span><span class="st-nom">${esc(x.nom)}</span>${x.ouvert ? "" : `<span class="st-verrou">🔒 ${TXT.verrou(x.requis)}</span>`}</button>`;
  zone.innerHTML = `<div class="serie-choix"><span class="serie-lbl">${TXT.serie}</span>
    <div class="serie-bande" role="radiogroup" aria-label="${TXT.serie}">${groupes.map(g => (g ? `<span class="serie-groupe">${esc(g)}</span>` : "") + liste.filter(x => x.groupe === g).map(tuile).join("")).join("")}</div></div>
    <p class="serie-note" id="serie-note"></p>`;
  const bande = $(".serie-bande", zone);
  const maj = () => {
    const x = liste.find(y => y.cle === cle) || liste[0];
    store.set("serie", x.cle);
    $$(".serie-tuile", zone).forEach(b => b.setAttribute("aria-checked", b.dataset.serie === x.cle));
    $("#serie-note", zone).textContent = x.cle === "classique" ? "" : x.desc + " · " + TXT.pasClasse;
    majBouton(x);
  };
  $$(".serie-tuile", zone).forEach(b => b.onclick = () => {
    const x = liste.find(y => y.cle === b.dataset.serie);
    if(!x.ouvert){ if(typeof toast === "function") toast(TXT.niveau(x.requis), 2200); return; }
    cle = x.cle; maj(); if(typeof Son !== "undefined") Son.tap();
    b.scrollIntoView({behavior:"smooth", inline:"center", block:"nearest"});
  });
  // molette verticale = défilement horizontal (ordinateur)
  bande.addEventListener("wheel", e => { if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){ bande.scrollLeft += e.deltaY; e.preventDefault(); } }, {passive:false});
  maj();
  const sel = $(`.serie-tuile[data-serie="${cle}"]`, zone); if(sel) bande.scrollLeft = Math.max(0, sel.offsetLeft - bande.clientWidth/2 + sel.offsetWidth/2);
  // nouvelle série débloquée depuis la dernière visite
  const vu = store.get("seriesVues", 0), ouvertes = liste.filter(x => x.ouvert).length;
  if(vu && ouvertes > vu){ const n = liste.filter(x => x.ouvert).slice(vu).map(x => x.nom).join(", "); if(typeof toast === "function") toast(TXT.debloque(n), 3500); }
  store.set("seriesVues", ouvertes);
}

/* ---------- configuration d'une partie ---------- */
const melanger = a => { const b = [...a]; for(let i = b.length - 1; i > 0; i--){ const j = Math.floor(Math.random()*(i+1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const ORDRE = {v:0, b:1, r:2, n:3};
async function config(cle){
  if(!cle || cle === "classique") return null;
  const regles = {...REGLES_DEFAUT, choix3:false, legendaire:false};
  if(cle.startsWith("langue-")){
    const lang = cle.slice(7); if(!LANGUES.some(x => x.lang === lang)) return null;
    const D = await chargerLangue(lang);
    const deco = {type:"langue", lang, emoji:drapeau(lang), nom:TXT.nomLangue[lang], bandes:DRAPEAU[lang].bandes};
    return {cartes:[...PARCOURS_DEFI], vies:VIES, regles, serieCle:cle, langueCartes:lang, deco,
      tirer(niv, rnd, deja){
        const liste = D[niv];
        for(let e = 0; e < 60; e++){
          const g = liste[Math.floor(Math.random()*liste.length)], k = cleTri(g[0]);
          if(deja.has(k)) continue; deja.add(k);
          return {niv, origine:g[Math.random() < .6 ? 0 : 1], mots:g, cle:k, deco};
        }
        deja.clear(); return this.tirer(niv, rnd, deja);
      }};
  }
  const t = (await chargerThemes()).find(x => "theme-" + x.cle === cle); if(!t) return null;
  // groupes d'anagrammes du dictionnaire, par clé triée
  const index = {}; for(const k of Object.keys(NIVEAUX)) for(const g of DICO[k]) index[cleTri(g[0])] = {niv:k, g};
  const deco = {type:"theme", cle:t.cle, emoji:t.emoji, nom:t.nom, c1:t.c1, c2:t.c2, motif:t.motif};
  let pool = t.mots.map(([niv, mot]) => { const e = index[cleTri(mot)]; return e ? {niv:e.niv, origine:e.g.find(w => norm(w) === norm(mot)) || mot, mots:e.g, cle:cleTri(mot), deco} : null; }).filter(Boolean);
  // éviter de revoir les mêmes cartes d'une série à l'autre
  const vus = new Set(store.get("serieVus", {})[t.cle] || []);
  const neufs = melanger(pool.filter(c => !vus.has(c.cle))), vieux = melanger(pool.filter(c => vus.has(c.cle)));
  const uniques = []; const cles = new Set();
  for(const c of [...neufs, ...vieux]){ if(!cles.has(c.cle)){ cles.add(c.cle); uniques.push(c); } if(uniques.length >= LONGUEUR) break; }
  const tirage = uniques.sort((a, b) => ORDRE[a.niv] - ORDRE[b.niv]);
  const memo = store.get("serieVus", {}); memo[t.cle] = [...(memo[t.cle] || []), ...tirage.map(c => c.cle)].slice(-Math.max(LONGUEUR, pool.length - LONGUEUR)); store.set("serieVus", memo);
  let i = 0;
  return {cartes:tirage.map(c => c.niv), vies:VIES, regles, serieCle:cle, deco,
    tirer(niv){ const c = tirage[i++] || tirage[tirage.length - 1]; return c; }};
}

/* ---------- habillage de la carte et de l'écran ---------- */
const MOTIF = e => `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><text x='8' y='26' font-size='18' opacity='.16'>${e}</text><text x='40' y='58' font-size='18' opacity='.16'>${e}</text></svg>`)}")`;
function habiller(c){
  const d = c && c.deco; if(!d) return;
  const carte = document.querySelector(".table-carte .carte"), ecran = document.querySelector(".ecran");
  if(!carte) return;
  carte.classList.add("carte-serie", "serie-" + d.type);
  if(d.type === "theme"){
    carte.style.setProperty("--s1", d.c1); carte.style.setProperty("--s2", d.c2); carte.style.setProperty("--motif", MOTIF(d.emoji));
    if(ecran){ ecran.classList.add("ecran-serie"); ecran.style.setProperty("--s1", d.c1); }
  } else {
    carte.style.setProperty("--b1", d.bandes[0]); carte.style.setProperty("--b2", d.bandes[1]); carte.style.setProperty("--b3", d.bandes[2]);
    if(ecran){ ecran.classList.add("ecran-serie"); ecran.style.setProperty("--s1", d.bandes[0]); }
  }
  const badge = document.createElement("span"); badge.className = "serie-badge"; badge.innerHTML = `<i aria-hidden="true">${d.emoji}</i>${esc(d.nom)}`;
  const corps = carte.querySelector(".carte-corps"); (corps || carte).prepend(badge);
}

const css = document.createElement("style");
css.textContent = `
.serie-zone{grid-column:1/-1; display:grid; gap:4px; justify-items:center}
.serie-choix{width:100%; display:grid; gap:6px}
.serie-lbl{font:700 13px var(--f-ui); color:var(--brume); letter-spacing:.14em; text-transform:uppercase; text-align:center}
.serie-bande{display:flex; gap:8px; overflow-x:auto; overflow-y:hidden; padding:6px 4px 8px; scroll-snap-type:x proximity; scrollbar-width:none; -webkit-overflow-scrolling:touch;
  -webkit-mask:linear-gradient(90deg, transparent, #000 18px, #000 calc(100% - 18px), transparent); mask:linear-gradient(90deg, transparent, #000 18px, #000 calc(100% - 18px), transparent)}
.serie-bande::-webkit-scrollbar{display:none}
.serie-groupe{flex:none; align-self:center; writing-mode:vertical-rl; transform:rotate(180deg); font:700 11px var(--f-ui); letter-spacing:.16em; text-transform:uppercase; color:var(--or); opacity:.85; padding:0 2px}
.serie-tuile{flex:none; position:relative; width:92px; height:92px; border:0; border-radius:14px; padding:6px 6px 7px; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; gap:3px;
  color:#fff; cursor:pointer; scroll-snap-align:center; overflow:hidden; background:#0d2259;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.18), 0 4px 10px rgba(0,0,0,.35); transition:transform .15s, box-shadow .15s}
.serie-tuile .st-fond{position:absolute; inset:0; background:var(--fond); opacity:.9}
.serie-tuile .st-fond::after{content:""; position:absolute; inset:0; background:linear-gradient(180deg, rgba(255,255,255,.18), transparent 40%, rgba(0,0,0,.45))}
.serie-tuile .st-emoji{position:relative; font-size:26px; line-height:1; filter:drop-shadow(0 2px 3px rgba(0,0,0,.45)); margin-bottom:auto; margin-top:4px}
.serie-tuile .st-nom{position:relative; font:800 14px/1.05 var(--f-ui); letter-spacing:.02em; text-align:center; text-shadow:0 1px 3px rgba(0,0,0,.8);
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden}
.serie-tuile .st-verrou{position:absolute; inset:auto 0 0 0; padding:3px 0; font:700 11px var(--f-ui); background:rgba(0,0,0,.62); color:#fff; letter-spacing:.02em}
.serie-tuile.verrou{padding-bottom:24px}
.drap{display:inline-grid; place-items:center; min-width:30px; height:21px; padding:0 3px; border-radius:5px; font:800 11px/1 var(--f-ui); color:#fff; letter-spacing:.04em;
  text-shadow:0 0 3px #000, 0 0 2px #000; box-shadow:inset 0 0 0 1px rgba(255,255,255,.35), 0 1px 3px rgba(0,0,0,.5); vertical-align:middle}
.serie-tuile .st-emoji .drap{min-width:40px; height:28px; font-size:13px}
.serie-tuile.verrou{cursor:default} .serie-tuile.verrou .st-fond{filter:grayscale(.85) brightness(.55)} .serie-tuile.verrou .st-emoji{opacity:.55}
.serie-tuile[aria-checked="true"]{transform:translateY(-2px); box-shadow:0 0 0 2.5px #ffd84a, 0 0 18px rgba(255,207,58,.55), 0 6px 14px rgba(0,0,0,.4)}
.serie-tuile:focus-visible{outline:2px solid var(--or); outline-offset:3px}
@media (hover:hover){ .serie-tuile:not(.verrou):not([aria-checked="true"]):hover{transform:translateY(-2px)} }
.serie-note{margin:0; min-height:0; text-align:center; font:600 13.5px var(--f-ui); color:var(--brume-2)}
.serie-note:empty{display:none}
.carte.carte-serie{position:relative}
.carte.serie-theme{outline:3px solid var(--s1); outline-offset:2px}
.carte.serie-theme .carte-corps{background-image:var(--motif), linear-gradient(180deg, color-mix(in srgb, var(--s1) 14%, transparent), transparent 70%); background-size:64px 64px, 100% 100%}
.carte.serie-langue{outline:3px solid var(--b1); outline-offset:2px}
.carte.serie-langue::before{content:""; position:absolute; left:0; right:0; top:0; height:7px; z-index:2; border-radius:inherit; border-bottom-left-radius:0; border-bottom-right-radius:0;
  background:linear-gradient(90deg, var(--b1) 0 33.3%, var(--b2) 33.3% 66.6%, var(--b3) 66.6%)}
.serie-badge{align-self:center; margin:-4px auto 2px; display:inline-flex; align-items:center; gap:6px; white-space:nowrap;
  padding:3px 12px 3px 8px; border-radius:999px; font:800 12.5px var(--f-ui); letter-spacing:.06em; text-transform:uppercase; color:#fff;
  background:linear-gradient(180deg, var(--s1, #16357a), var(--s2, #0b1a3a)); box-shadow:0 3px 8px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.3)}
.serie-langue .serie-badge{background:linear-gradient(90deg, var(--b1), var(--b3))}
.serie-badge i{font-style:normal; font-size:15px}
.ecran.ecran-serie{background:radial-gradient(120% 60% at 50% 0%, color-mix(in srgb, var(--s1) 22%, transparent), transparent 70%)}
`;
document.head.appendChild(css);

return {menu, config, habiller, choisie, catalogue, TXT, drapeau};
})();
