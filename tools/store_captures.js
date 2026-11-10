/* Captures d'écran des fiches Play Store / App Store, en français et en anglais.
   Le site doit être servi en local à la racine du dépôt (python3 -m http.server 8765).
   Usage : node tools/store_captures.js            -> store/captures/brutes/<lang>/<format>/NN-scene.png
   Les captures « habillées » (légende + fond) sont ensuite composées par tools/build_store.py. */
"use strict";
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const SITE = (process.env.QLN_SITE || "http://localhost:8765").replace(/\/$/, "");
const SORTIE = path.join(__dirname, "..", "store", "captures", "brutes");
// format -> fenêtre (CSS) ; la densité est choisie pour que l'image brute soit nette une fois composée
const FORMATS = {
  telephone: {width:390, height:844, dpr:3, mobile:true},     // Play (1080x1920) et iPhone 6,9" (1320x2868) ; appli iPhone uniquement : pas de captures iPad
};
const FILTRE = process.argv[2] || "";

async function ouvrir(nav, lang, f){
  const ctx = await nav.newContext({viewport:{width:f.width, height:f.height}, deviceScaleFactor:f.dpr, isMobile:f.mobile, hasTouch:true, serviceWorkers:"block", locale: lang === "en" ? "en-GB" : "fr-FR"});
  const p = await ctx.newPage(); p.setDefaultTimeout(10000);
  const pre = lang === "en" ? "qln-en:" : "qln:";
  await p.addInitScript(([pre, lang]) => {
    try{
      localStorage.setItem("qln-lang", lang);
      localStorage.setItem(pre + "pub", "false");
      localStorage.setItem(pre + "records", JSON.stringify({defi:1840, jour:{}}));
      localStorage.setItem(pre + "victoiresIA", "7");
      localStorage.setItem(pre + "compte", JSON.stringify({id:"vitrine", pseudo: lang === "en" ? "Alex" : "Camille", couleur:2, cree:1}));
    }catch(e){}
  }, [pre, lang]);
  // pas de vrai serveur pour les captures ; la barre de démonstration Pub / No Pub est masquée
  await p.route(/\/config\.js(\?|$)/, r => r.fulfill({contentType:"application/javascript", body:`window.QLN_API_URL="";window.QLN_WS_URL="";window.QLN_GOOGLE_CLIENT_ID="";`}));
  await p.goto(`${SITE}/${lang === "en" ? "en/" : ""}index.html`);
  await p.addStyleTag({content:"#barre-pub,.pg-succes,.m-etat{display:none!important} :root{--bp-h:0px!important} .toast{display:none!important}"});
  await p.waitForSelector("#b-defi");
  await p.waitForFunction(() => typeof DICO !== "undefined" && DICO && DICO.v && DICO.v.length > 0, null, {timeout:20000});
  await p.evaluate(() => Progres.remplacer({...Progres.donnees(), tuto:"fait", xp:6100, serie:5, serieMax:12,
    succes:Object.fromEntries(["premiers-pas", "premiere-carte", "cartes-10", "cartes-100", "noire", "parfaite", "eclair", "defi-1000", "jour-1", "serie-3", "serie-7", "ia", "niveau-10"].map(k => [k, 1])),
    dernierJour:aujourdhui(),
    st:{parties:86, cartes:{v:[160, 151], b:[140, 122], r:[90, 71], n:[24, 15]}, mots:1240, parfaites:31, indices:18, temps:{v:3200, b:5400, r:9100, n:21000}, gains:48200, meilleure:1840, victoiresIA:7, partiesIA:12, jours:19}}));
  return {p, ctx};
}
const pause = (p, ms) => p.waitForTimeout(ms);

// carte de démonstration et mots déjà trouvés, par langue
const CARTE = {fr:{niv:"r", mots:["ateliers", "réaliste", "réalités", "altières"], trouves:["réaliste", "altières"], tape:"réal"},
               en:{niv:"b", mots:["listen", "silent", "enlist", "tinsel"], trouves:["silent", "enlist"], tape:"tin"}};

const SCENES = [
  ["accueil", async p => { await p.evaluate(() => ecranAccueil()); await pause(p, 2600); }],
  ["partie", async (p, lang) => {
    const c = CARTE[lang];
    await p.evaluate(c => { window.QLN_CARTE_FORCEE = {niv:c.niv, origine:c.mots[0], mots:c.mots, cle:"vitrine"}; demarrerPartie("entrainement", c.niv, {}); }, c);
    await pause(p, 900);
    for(const m of c.trouves){ await p.keyboard.type(m.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase(), {delay:20}); await p.keyboard.press("Enter"); await pause(p, 900); }
    await p.keyboard.type(c.tape.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase(), {delay:20}); await pause(p, 700);
  }],
  ["plateau", async p => {
    await p.evaluate(() => ecranAccueil()); await pause(p, 300);
    await p.evaluate(() => document.querySelector("#b-ia").click()); await pause(p, 300);
    await p.evaluate(() => document.querySelector("#b-go").click());
    await p.waitForSelector("#b-parti"); await p.evaluate(() => document.querySelector("#b-parti").click()); await pause(p, 2200);
  }],
  ["jour", async p => { await p.evaluate(() => { ecranAccueil(); nouvellePartie("jour"); }); await pause(p, 1600); }],
  ["series", async p => {
    await p.evaluate(() => ecranSolo()); await pause(p, 500);
    await p.evaluate(() => { const s = document.querySelector("#s-serie"); const o = [...s.options].find(o => !o.disabled && /^theme-/.test(o.value)) || [...s.options].find(o => !o.disabled && o.index > 0); if(o){ s.value = o.value; s.dispatchEvent(new Event("change", {bubbles:true})); } });
    await pause(p, 400); await p.evaluate(() => document.querySelector("#s-defi").click()); await pause(p, 1800);
  }],
  ["podium", async p => {
    await p.evaluate(() => ecranAccueil()); await pause(p, 300);
    await p.evaluate(() => document.querySelector("#b-ia").click()); await pause(p, 300);
    await p.evaluate(() => document.querySelector("#b-go").click());
    await p.waitForSelector("#b-parti"); await p.evaluate(() => document.querySelector("#b-parti").click()); await pause(p, 600);
    await p.evaluate(() => { const G = PlateauIA._etat(); G.joueurs.forEach((j, i) => { j.detail = {cartes:[640, 520, 470, 380][i], encheres:[-120, -60, -150, -40][i], cases:[90, 40, 60, 20][i], arrivee:[50, 100, 75, -25][i]}; j.argent = Object.values(j.detail).reduce((a, b) => a + b, 0); j.arrive = [2, 1, 3, 4][i]; }); PlateauIA._fin(); });
    await pause(p, 3200); await p.evaluate(() => { document.querySelectorAll(".pg-succes").forEach(e => e.remove()); scrollTo(0, 0); document.querySelectorAll(".ecran, #app").forEach(e => e.scrollTop = 0); });
    await pause(p, 300);
  }],
  ["multi", async p => { await p.evaluate(() => { ecranAccueil(); document.querySelector("#b-multi").click(); }); await pause(p, 1200); }],
  ["progression", async p => { await p.evaluate(() => Progres.ecranStats()); await pause(p, 1200); }],
];

(async () => {
  const nav = await chromium.launch();
  for(const lang of ["fr", "en"]) for(const [nomF, f] of Object.entries(FORMATS)){
    const dossier = path.join(SORTIE, lang, nomF); fs.mkdirSync(dossier, {recursive:true});
    for(const [i, [nom, scene]] of SCENES.entries()){
      if(FILTRE && !nom.includes(FILTRE)) continue;
      const {p, ctx} = await ouvrir(nav, lang, f);
      try{ await scene(p, lang); await p.screenshot({path:path.join(dossier, `${String(i+1).padStart(2, "0")}-${nom}.png`)}); console.log(lang, nomF, nom); }
      catch(e){ console.error("ÉCHEC", lang, nomF, nom, e.message); }
      await ctx.close();
    }
  }
  await nav.close();
})();
