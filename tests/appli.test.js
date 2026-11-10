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
    await p.evaluate(() => ecranAccueil()); await p.click("#ab-menu", {force:true}); await p.waitForSelector("#tiroir", {state:"visible"});
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
  await p.evaluate(async () => { const s = Compte.session(); await fetch(window.QLN_API_URL + "/api/scores", {method:"POST", headers:{"Content-Type":"application/json", Authorization:"Bearer " + s.jeton}, body:JSON.stringify({mode:"jour", langue:"fr", score:4321, jour:new Date().toISOString().slice(0,10)})}); });
  await p.evaluate(() => Compte.ecranClassements());
  await p.waitForFunction(() => document.querySelector("#app").textContent.includes("Testeur"), null, {timeout:8000});
  // nettoyage
  await p.evaluate(async () => { const s = Compte.session(); await fetch(window.QLN_API_URL + "/api/moi", {method:"DELETE", headers:{Authorization:"Bearer " + s.jeton}}); });
  sansErreur(erreurs); await ctx.close();
});
