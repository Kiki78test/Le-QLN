/* Tests de l'appli Le-QLN dans un vrai navigateur (Chromium), français et anglais, téléphone et ordinateur.
   Le site doit être servi en local : QLN_SITE (défaut http://localhost:8765, racine du dépôt).
   Si QLN_TEST_URL est défini (serveur lancé), les comptes et classements sont aussi testés de bout en bout. */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const SITE = (process.env.QLN_SITE || "http://localhost:8765").replace(/\/$/, "");
const SERVEUR = process.env.QLN_TEST_URL || "";
const RACINE = path.join(__dirname, "..");
const VUES = {telephone:{width:400, height:860, isMobile:true, hasTouch:true}, ordinateur:{width:1280, height:820}};
let navigateur;
test.before(async () => { navigateur = await chromium.launch(); });
test.after(async () => { await navigateur.close(); });

async function ouvrir(lang, vue, {api = ""} = {}){
  const ctx = await navigateur.newContext({viewport:{width:VUES[vue].width, height:VUES[vue].height}, isMobile:!!VUES[vue].isMobile, hasTouch:!!VUES[vue].hasTouch, serviceWorkers:"block"});
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  const erreurs = [];
  p.on("pageerror", e => erreurs.push(e.message));
  p.on("console", m => { if(m.type() === "error" && !/Failed to load resource|net::ERR|favicon|googlesyndication|accounts\.google/i.test(m.text())) erreurs.push("console: " + m.text()); });
  await p.addInitScript(() => { try{ localStorage.setItem("qln:progres", JSON.stringify({tuto:"fait"})); localStorage.setItem("qln:pub", "false"); }catch(e){} });
  // config.js est toujours remplacé : serveur de test si fourni, sinon mode local (les tests ne touchent jamais au vrai serveur)
  await p.route(/\/config\.js(\?|$)/, r => r.fulfill({contentType:"application/javascript", body:`window.QLN_API_URL=${JSON.stringify(api)};window.QLN_WS_URL=${JSON.stringify(api ? api.replace(/^http/, "ws") + "/ws" : "")};window.QLN_GOOGLE_CLIENT_ID="";`}));
  await p.goto(`${SITE}/${lang === "en" ? "en/" : ""}index.html`);
  await p.waitForSelector("#b-defi");
  await p.waitForFunction(() => typeof DICO !== "undefined" && DICO && DICO.v && DICO.v.length > 0, null, {timeout:15000});
  return {p, ctx, erreurs};
}
const sansErreur = erreurs => assert.deepEqual(erreurs, [], "erreurs JavaScript : " + erreurs.join(" | "));

for(const lang of ["fr", "en"]) for(const vue of Object.keys(VUES)){
  test(`${lang} · ${vue} : accueil, carte jouée, plateau, multijoueur`, async () => {
    const {p, ctx, erreurs} = await ouvrir(lang, vue);
    // accueil sans défilement horizontal
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "pas de défilement horizontal");
    // une carte en entraînement : on trouve une anagramme au clavier
    const mot = await p.evaluate(() => {
      const g = DICO.v.find(x => x.length >= 2 && norm(x[1]).length === norm(x[0]).length);
      window.QLN_CARTE_FORCEE = {niv:"v", origine:g[0], mots:g, cle:"test"};
      demarrerPartie("entrainement", "v", {}); return norm(g[1]);
    });
    await p.waitForTimeout(600);
    await p.keyboard.type(mot.toUpperCase(), {delay:30}); await p.keyboard.press("Enter");
    await p.waitForFunction(() => P && P.m && P.m.trouves.length === 1, null, {timeout:4000});
    // plateau contre l'IA (page rechargée : l'entraînement enchaîne sinon une nouvelle carte)
    await p.reload(); await p.waitForSelector("#b-defi");
    await p.evaluate(() => { document.querySelector("#b-ia").click(); }); await p.click("#b-go", {force:true});
    await p.waitForSelector("#tapis", {state:"attached"}); await p.waitForSelector("#joueurs", {state:"attached"});
    // écran multijoueur
    await p.evaluate(() => { ecranAccueil(); document.querySelector("#b-multi").click(); }); await p.waitForTimeout(400);
    assert.ok(await p.evaluate(() => document.querySelector("#app").textContent.length > 20));
    // menu (tiroir)
    await p.evaluate(() => ecranAccueil()); await p.waitForTimeout(300);
    // ouverture du menu (réessayée : sur le site publié, un clic peut tomber pendant une transition)
    for(let i = 0; i < 4 && await p.evaluate(() => document.querySelector("#tiroir").hidden); i++){ await p.evaluate(() => document.querySelector("#ab-menu").click()); await p.waitForTimeout(400); }
    await p.waitForSelector("#tiroir", {state:"visible"});
    sansErreur(erreurs); await ctx.close();
  });
}

test("documentation : chaque document listé existe", async () => {
  for(const dossier of ["docs", "en/docs"]){
    const f = path.join(RACINE, dossier, "index.json"); if(!fs.existsSync(f)) continue;
    for(const d of JSON.parse(fs.readFileSync(f, "utf8"))) assert.ok(fs.existsSync(path.join(RACINE, dossier, d.fichier)), `${dossier}/${d.fichier} manquant`);
  }
});

test("service worker : chaque fichier mis en cache existe", async () => {
  for(const sw of ["sw.js", "en/sw.js"]){
    const f = path.join(RACINE, sw); if(!fs.existsSync(f)) continue;
    const src = fs.readFileSync(f, "utf8"), liste = (src.match(/\[[^\]]*"\.\/[^\]]*\]/) || ["[]"])[0];
    for(const m of liste.matchAll(/"\.\/([^"]*)"/g)) if(m[1]) assert.ok(fs.existsSync(path.join(path.dirname(f), m[1])), `${sw} : ${m[1]} manquant`);
  }
});

test("comptes et classements de bout en bout (avec serveur)", {skip: !SERVEUR && "pas de serveur (QLN_TEST_URL)"}, async () => {
  const {p, ctx, erreurs} = await ouvrir("fr", "telephone", {api:SERVEUR});
  const email = `e2e-${Date.now().toString(36)}@test.fr`;
  await p.evaluate(() => Compte.ecranCompte("inscription"));
  await p.fill("#ct-pseudo", "Testeur"); await p.fill("#ct-email", email); await p.fill("#ct-mdp", "motdepasse-e2e");
  await p.click("#ct-ok");
  await p.waitForFunction(() => Compte.connecte(), null, {timeout:8000});
  // un score du défi du jour, puis le classement l'affiche
  // un vrai défi du jour : le client joint les mots trouvés, le serveur refait le tirage et valide
  await p.evaluate(async () => {
    demarrerPartie("jour", null, {}); await new Promise(r => setTimeout(r, 400));
    P.historique = P.cartes.slice(0, 3).map(c => ({niv:c.niv, origine:c.origine, trouves:solutionsDe(c).map(w => w.toUpperCase())}));
    document.dispatchEvent(new CustomEvent("qln:fin-partie", {detail:{mode:"jour", total:150}}));
    await new Promise(r => setTimeout(r, 1200));
  });
  await p.evaluate(() => Compte.ecranClassements());
  await p.waitForFunction(() => document.querySelector("#app").textContent.includes("Testeur"), null, {timeout:8000});
  // nettoyage
  await p.evaluate(async () => { const s = Compte.session(); await fetch(window.QLN_API_URL + "/api/moi", {method:"DELETE", headers:{Authorization:"Bearer " + s.jeton}}); });
  sansErreur(erreurs); await ctx.close();
});

/* Partie rapide : le 1er joueur ouvre un salon automatique, le 2e le trouve et rejoint ; la partie démarre toute seule. */
async function rapide(lang, api){
  const pre = lang === "en" ? "-en" : "";
  const un = await ouvrir(lang, "telephone", {api});
  // le 2e joueur : même navigateur (mode local, BroadcastChannel) ou autre contexte (mode serveur)
  let deux;
  if(api) deux = await ouvrir(lang, "telephone", {api});
  else { const p2 = await un.ctx.newPage(); p2.setDefaultTimeout(8000); const er = []; p2.on("pageerror", e => er.push(e.message)); deux = {p:p2, ctx:null, erreurs:er}; }
  await un.p.evaluate(`localStorage.setItem("qln${pre}:compte", JSON.stringify({id:"t-Ana", pseudo:"Ana", couleur:0, cree:1}))`);
  if(api) await deux.p.evaluate(`localStorage.setItem("qln${pre}:compte", JSON.stringify({id:"t-Bob", pseudo:"Bob", couleur:1, cree:1}))`);
  else { await deux.p.route(/\/config\.js(\?|$)/, r => r.fulfill({contentType:"application/javascript", body:'window.QLN_API_URL="";window.QLN_WS_URL="";window.QLN_GOOGLE_CLIENT_ID="";'})); await deux.p.addInitScript(() => { try{ localStorage.setItem("qln:progres", JSON.stringify({tuto:"fait"})); localStorage.setItem("qln:pub", "false"); localStorage.setItem("qln-en:progres", JSON.stringify({tuto:"fait"})); localStorage.setItem("qln-en:pub", "false"); }catch(e){} }); await deux.p.goto(`${SITE}/${lang === "en" ? "en/" : ""}index.html`); await deux.p.waitForSelector("#b-defi"); }
  for(const j of [un, deux]) await j.p.evaluate(() => { window.QLN_RAPIDE_DELAI = 2; });
  if(!api) await deux.p.evaluate(`localStorage.setItem("qln${pre}:compte", JSON.stringify({id:"t-Ana", pseudo:"Bob", couleur:1, cree:1}))`);
  // 1er joueur : aucun salon en attente → il en ouvre un
  await un.p.evaluate(() => { document.querySelector("#b-multi").click(); });
  await un.p.waitForSelector("#m-rapide"); await un.p.click("#m-rapide", {force:true});
  await un.p.waitForFunction(() => Multi.etat() && Multi.etat().code, null, {timeout:12000});
  const code = await un.p.evaluate(() => Multi.etat().code);
  assert.equal(await un.p.evaluate(() => Multi.etat().auto), true, "salon automatique");
  // 2e joueur : voit le salon dans la liste (avec ses places libres) puis lance « Partie rapide »
  await deux.p.evaluate(() => { document.querySelector("#b-multi").click(); });
  await deux.p.waitForSelector(`#m-ouverts [data-code="${code}"]`, {timeout:12000});
  assert.match(await deux.p.textContent("#m-ouverts"), /1\/6/);
  await deux.p.click("#m-rapide", {force:true});
  // la partie démarre toute seule, chez les deux
  await un.p.waitForFunction(() => Multi.etat() && Multi.etat().phase === "jeu", null, {timeout:15000});
  await deux.p.waitForFunction(() => Multi.etat() && Multi.etat().phase === "jeu", null, {timeout:15000});
  assert.equal(await un.p.evaluate(() => Multi.etat().joueurs.length), 2);
  sansErreur(un.erreurs); sansErreur(deux.erreurs);
  await un.ctx.close(); if(deux.ctx) await deux.ctx.close();
}
for(const lang of ["fr", "en"]) test(`${lang} · multijoueur : partie rapide à deux (local)`, async () => { await rapide(lang, ""); });
test("multijoueur : partie rapide à deux (serveur)", {skip: !SERVEUR && "pas de serveur (QLN_TEST_URL)"}, async () => { await rapide("fr", SERVEUR); });

for(const lang of ["fr", "en"]) test(`${lang} : confidentialité et mentions légales (écrans + pages web)`, async () => {
  const {p, ctx, erreurs} = await ouvrir(lang, "telephone");
  await p.evaluate(() => document.querySelector("#b-conf").click());
  await p.waitForFunction(() => document.querySelector(".legal h2"), null, {timeout:4000});
  assert.ok((await p.textContent(".legal")).length > 1500, "politique complète");
  await p.evaluate(() => document.querySelector("#lg-autre").click());
  await p.waitForFunction(() => /Hébergement|Hosting/.test(document.querySelector(".legal").textContent), null, {timeout:4000});
  sansErreur(erreurs); await ctx.close();
  for(const f of lang === "fr" ? ["confidentialite.html", "mentions-legales.html"] : ["en/privacy.html", "en/legal-notice.html"]) assert.ok(fs.readFileSync(path.join(RACINE, f), "utf8").includes("<h2>"), f);
});
