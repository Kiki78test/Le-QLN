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
  for(const x of LANGUES) liste.push({cle:"langue-" + x.lang, nom:TXT.nomLangue[x.lang], emoji:DRAPEAU[x.lang].emoji, desc:TXT.descLangue(x.lang), requis:x.requis, groupe:TXT.langues});
  t.forEach((th, i) => liste.push({cle:"theme-" + th.cle, nom:th.nom, emoji:th.emoji, desc:TXT.descTheme(LONGUEUR, th.mots.length + " " + (LG === "en" ? "words in the theme" : "mots dans le thème")), requis:nivTheme(i), groupe:TXT.themes, th}));
  liste.forEach(x => x.ouvert = nv >= x.requis);
  return liste;
}
const choisie = () => store.get("serie", "classique");

/* ---------- menu de l'écran Solo ---------- */
async function menu(zone, majBouton){
  const liste = await catalogue();
  let cle = choisie(); if(!liste.some(x => x.cle === cle && x.ouvert)) cle = "classique";
  const opt = x => `<option value="${x.cle}" ${x.cle === cle ? "selected" : ""} ${x.ouvert ? "" : "disabled"}>${x.emoji} ${esc(x.nom)}${x.ouvert ? "" : " 🔒 " + TXT.verrou(x.requis)}</option>`;
  const groupes = [...new Set(liste.map(x => x.groupe))];
  zone.innerHTML = `<label class="serie-sel"><span>${TXT.serie}</span><select id="s-serie">${groupes.map(g => g ? `<optgroup label="${esc(g)}">${liste.filter(x => x.groupe === g).map(opt).join("")}</optgroup>` : liste.filter(x => !x.groupe).map(opt).join("")).join("")}</select></label>
    <p class="serie-note" id="serie-note"></p>`;
  const maj = () => {
    const x = liste.find(y => y.cle === $("#s-serie", zone).value) || liste[0];
    store.set("serie", x.cle);
    $("#serie-note", zone).textContent = x.cle === "classique" ? "" : x.desc + " · " + TXT.pasClasse;
    majBouton(x);
  };
  $("#s-serie", zone).onchange = maj; maj();
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
    const deco = {type:"langue", lang, emoji:DRAPEAU[lang].emoji, nom:TXT.nomLangue[lang], bandes:DRAPEAU[lang].bandes};
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
.serie-sel{width:100%; display:flex; align-items:center; gap:10px; justify-content:center; font:700 15px var(--f-ui); color:var(--brume); letter-spacing:.06em; text-transform:uppercase; margin:2px 0 0}
.serie-sel select{flex:1; max-width:340px; height:46px; border-radius:14px; padding:0 14px; font:700 17px var(--f-ui); letter-spacing:.02em; text-transform:none; color:#fff;
  background:#0d2259 url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='9'><path d='M1 1l6 6 6-6' fill='none' stroke='%23ffd60a' stroke-width='2.4' stroke-linecap='round'/></svg>") no-repeat right 14px center;
  border:1.5px solid rgba(255,214,10,.45); appearance:none; -webkit-appearance:none; cursor:pointer}
.serie-sel select:focus-visible{outline:2px solid var(--or); outline-offset:2px}
.serie-sel option,.serie-sel optgroup{background:#0d2259; color:#fff}
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

return {menu, config, habiller, choisie, catalogue, TXT};
})();
