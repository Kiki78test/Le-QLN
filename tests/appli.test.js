/* Tests de l'appli Le-QLN dans un vrai navigateur (Chromium), français et anglais, téléphone et ordinateur.
   Le site doit être servi en local : QLN_SITE (défaut http://localhost:8765) — le site assemblé par python3 tools/site.py (dossier _site/).
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
    await p.evaluate(() => { document.querySelector("#b-ia").click(); }); await p.evaluate(() => document.querySelector("#b-go").click());
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
    const f = path.join(RACINE, "app", sw); if(!fs.existsSync(f)) continue;
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
/* Plateau multijoueur : une partie complète à deux, chaque appareil rejoue la même partie ; un « pilote » répond au hasard
   à la place de chaque joueur (dé, case, carte, enchères, offres, prison, garant). Les deux podiums doivent être identiques. */
async function partieMulti(lang, api, {depart = false} = {}){
  const pre = lang === "en" ? "-en" : "";
  const un = await ouvrir(lang, "telephone", {api});
  let deux;
  if(api) deux = await ouvrir(lang, "telephone", {api});
  else { const p2 = await un.ctx.newPage(); p2.setDefaultTimeout(8000); const er = []; p2.on("pageerror", e => er.push(e.message)); deux = {p:p2, ctx:null, erreurs:er}; await p2.addInitScript(() => { try{ for(const k of ["qln:", "qln-en:"]){ localStorage.setItem(k + "progres", JSON.stringify({tuto:"fait"})); localStorage.setItem(k + "pub", "false"); } }catch(e){} }); await p2.route(/\/config\.js(\?|$)/, r => r.fulfill({contentType:"application/javascript", body:'window.QLN_API_URL="";window.QLN_WS_URL="";window.QLN_GOOGLE_CLIENT_ID="";'})); await p2.goto(`${SITE}/${lang === "en" ? "en/" : ""}index.html`); await p2.waitForSelector("#b-defi"); await p2.waitForFunction(() => typeof DICO !== "undefined" && DICO && DICO.v && DICO.v.length > 0, null, {timeout:15000}); }
  await un.p.evaluate(`localStorage.setItem("qln${pre}:compte", JSON.stringify({id:"t-Ana", pseudo:"Ana", couleur:0, cree:1}))`);
  for(const j of [un, deux]) await j.p.evaluate(() => {
    window.QLN_RAPIDE_DELAI = 2; window.QLN_TEST_VITE = .04;
    window.QLN_TEST_PILOTE = (type, ctx) => {
      const r = Math.random();
      if(type === "de") return true;
      if(type === "case") return Math.floor(r * ctx.opts.length);
      if(type === "carte"){ const s = solutionsDe(ctx.c); return r < .5 ? {proposition:norm(s[0])} : r < .6 ? {proposition:"ZZZZ"} : {proposition:null}; }
      if(type === "ench") return r < .4 ? null : {mot:solutionsDe(ctx.c)[0], montant:Math.max(5, Math.floor(ctx.maxi/10)*5)};
      if(type === "offre") return r < .8 ? 0 : -1;
      if(type === "prison") return ["payer", "aide", "attendre"][Math.floor(r*3)];
      if(type === "garant") return r < .5;
      return null;
    };
  });
  await un.p.evaluate(() => { document.querySelector("#b-multi").click(); });
  await un.p.waitForSelector("#m-rapide"); await un.p.click("#m-rapide", {force:true});
  await un.p.waitForFunction(() => Multi.etat() && Multi.etat().code, null, {timeout:12000});
  await deux.p.evaluate(`localStorage.setItem("qln${pre}:compte", JSON.stringify({id:"${api ? "t-Bob" : "t-Ana"}", pseudo:"Bob", couleur:1, cree:1}))`);
  await deux.p.evaluate(() => { document.querySelector("#b-multi").click(); });
  await deux.p.waitForSelector("#m-rapide"); await deux.p.waitForTimeout(800); await deux.p.click("#m-rapide", {force:true});
  // le plateau s'affiche chez les deux, puis la partie se joue jusqu'au podium
  const podium = p => p.evaluate(() => [...document.querySelectorAll(".podium-l")].map(l => [l.querySelector("span:nth-of-type(2)").firstChild.textContent.trim(), l.querySelector("b").textContent, l.querySelector(".podium-detail") ? l.querySelector(".podium-detail").textContent : ""]));
  for(const j of [un, deux]) await j.p.waitForSelector("#tapis", {state:"attached", timeout:20000});
  if(depart === "joueur" || depart === true){
    // le 2e joueur ferme l'appli en cours de partie : l'hôte termine seul, l'IA joue à la place de l'absent
    await deux.p.waitForTimeout(1500); await deux.p.close({runBeforeUnload:true});
    await un.p.waitForSelector("#b-salon", {timeout:240000});
    const fin = await un.p.evaluate(() => [...document.querySelectorAll(".podium-l")].length);
    assert.equal(fin, 2, "podium complet malgré le départ"); sansErreur(un.erreurs); await un.ctx.close(); return;
  }
  if(depart === "hote"){
    // l'hôte ferme l'appli : le 2e joueur devient l'hôte et termine la partie
    await un.p.waitForTimeout(1500); await un.p.close({runBeforeUnload:true});
    await deux.p.waitForFunction(() => Multi.etat() && Multi.etat().hote, null, {timeout:20000});
    await deux.p.waitForSelector("#b-salon", {timeout:240000});
    assert.equal(await deux.p.evaluate(() => [...document.querySelectorAll(".podium-l")].length), 2, "podium complet après le changement d'hôte");
    sansErreur(deux.erreurs); if(deux.ctx) await deux.ctx.close(); else await un.ctx.close(); return;
  }
  if(depart === "reprise"){
    // le 2e joueur ferme l'appli puis revient : l'IA a joué pour lui, il rattrape la partie et finit avec le même podium que l'hôte
    await deux.p.waitForTimeout(1500);
    const moi = await deux.p.evaluate(() => ({code:Multi.etat().code, id:Multi.etat().moi.id}));
    const ctx2 = deux.ctx || un.ctx; await deux.p.close({runBeforeUnload:true});
    await un.p.waitForTimeout(2500);
    const p3 = await ctx2.newPage(); p3.setDefaultTimeout(10000); const er3 = []; p3.on("pageerror", e => er3.push(e.message));
    await p3.route(/\/config\.js(\?|$)/, r => r.fulfill({contentType:"application/javascript", body:`window.QLN_API_URL=${JSON.stringify(api)};window.QLN_WS_URL=${JSON.stringify(api ? api.replace(/^http/, "ws") + "/ws" : "")};window.QLN_GOOGLE_CLIENT_ID="";`}));
    await p3.goto(`${SITE}/${lang === "en" ? "en/" : ""}index.html`); await p3.waitForSelector("#b-defi"); await p3.waitForFunction(() => typeof DICO !== "undefined" && DICO && DICO.v && DICO.v.length > 0, null, {timeout:15000});
    await p3.evaluate(m => { store.set("partieMulti", {code:m.code, id:m.id, t:Date.now(), ligne:!!window.QLN_WS_URL}); window.QLN_TEST_VITE = .04; window.QLN_TEST_PILOTE = (type, ctx) => type === "de" ? true : type === "case" ? Math.floor(Math.random()*ctx.opts.length) : type === "carte" ? (Math.random() < .5 ? {proposition:norm(solutionsDe(ctx.c)[0])} : {proposition:null}) : type === "prison" ? "payer" : type === "offre" ? 0 : null; }, moi);
    await p3.evaluate(() => document.querySelector("#b-multi").click());
    await p3.waitForSelector("#m-reprendre"); await p3.evaluate(() => document.querySelector("#m-reprendre").click());
    await p3.waitForSelector("#tapis", {state:"attached", timeout:20000});
    for(const p of [un.p, p3]) await p.waitForSelector("#b-salon", {timeout:240000});
    const a = await podium(un.p), b = await podium(p3);
    assert.deepEqual(a, b, "même podium après la reprise"); sansErreur(un.erreurs); sansErreur(er3);
    await un.ctx.close(); if(deux.ctx) await deux.ctx.close(); return;
  }
  for(const j of [un, deux]) await j.p.waitForSelector("#b-salon", {timeout:240000});
  const a = await podium(un.p), b = await podium(deux.p);
  assert.equal(a.length, 2); assert.deepEqual(a, b, "même partie, même résultat chez les deux joueurs");
  assert.deepEqual(a.map(x => x[0]).sort(), ["Ana", "Bob"]);
  sansErreur(un.erreurs); sansErreur(deux.erreurs);
  await un.ctx.close(); if(deux.ctx) await deux.ctx.close();
  return a;
}
for(const lang of ["fr", "en"]) test(`${lang} · multijoueur : partie complète synchronisée sur le plateau (local)`, {timeout:300000}, async () => { await partieMulti(lang, ""); });
test("multijoueur : un joueur quitte en cours de partie, l'hôte termine (local)", {timeout:300000}, async () => { await partieMulti("fr", "", {depart:"joueur"}); });
test("multijoueur : l'hôte quitte, un autre joueur devient l'hôte (local)", {timeout:300000}, async () => { await partieMulti("fr", "", {depart:"hote"}); });
test("multijoueur : un joueur revient après le relais de l'IA (local)", {timeout:300000}, async () => { await partieMulti("fr", "", {depart:"reprise"}); });
test("multijoueur : l'hôte quitte, un autre joueur devient l'hôte (serveur)", {timeout:300000, skip: !SERVEUR && "pas de serveur (QLN_TEST_URL)"}, async () => { await partieMulti("fr", SERVEUR, {depart:"hote"}); });
test("multijoueur : un joueur revient après une coupure (serveur)", {timeout:300000, skip: !SERVEUR && "pas de serveur (QLN_TEST_URL)"}, async () => { await partieMulti("fr", SERVEUR, {depart:"reprise"}); });
test("multijoueur : partie complète synchronisée sur le plateau (serveur)", {timeout:300000, skip: !SERVEUR && "pas de serveur (QLN_TEST_URL)"}, async () => { await partieMulti("fr", SERVEUR); });

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
  for(const f of lang === "fr" ? ["confidentialite.html", "mentions-legales.html"] : ["en/privacy.html", "en/legal-notice.html"]) assert.ok(fs.readFileSync(path.join(RACINE, "app", f), "utf8").includes("<h2>"), f);
});

/* Hors ligne (avion) : après une première visite, l'appli démarre et se joue sans réseau ; le multijoueur le dit clairement. */
test("hors ligne : démarrage, partie, pubs et multijoueur", async () => {
  const ctx = await navigateur.newContext({viewport:{width:400, height:860}, isMobile:true, hasTouch:true});
  await ctx.route(/\/config\.js(\?|$)/, r => r.fulfill({contentType:"application/javascript", body:'window.QLN_API_URL="https://exemple.invalid";window.QLN_WS_URL="wss://exemple.invalid/ws";window.QLN_GOOGLE_CLIENT_ID="";'}));
  await ctx.addInitScript(() => { try{ localStorage.setItem("qln:progres", JSON.stringify({tuto:"fait"})); }catch(e){} });
  const p = await ctx.newPage(); p.setDefaultTimeout(10000);
  const erreurs = []; p.on("pageerror", e => erreurs.push(e.message));
  await p.goto(`${SITE}/index.html`); await p.waitForSelector("#b-defi");
  await p.evaluate(async () => { await navigator.serviceWorker.ready; });
  await p.reload(); await p.waitForFunction(() => !!navigator.serviceWorker.controller);
  await p.waitForTimeout(1500);   // le cache se remplit
  await ctx.setOffline(true);
  const t0 = Date.now();
  await p.reload(); await p.waitForSelector("#b-defi"); await p.waitForFunction(() => DICO && DICO.v && DICO.v.length > 0);
  assert.ok(Date.now() - t0 < 9000, "démarrage hors ligne rapide");
  // une carte jouée hors ligne
  const mot = await p.evaluate(() => { const g = DICO.v.find(x => x.length >= 2 && norm(x[1]).length === norm(x[0]).length); window.QLN_CARTE_FORCEE = {niv:"v", origine:g[0], mots:g, cle:"t"}; demarrerPartie("entrainement", "v", {}); return norm(g[1]); });
  await p.waitForTimeout(600); await p.keyboard.type(mot, {delay:20}); await p.keyboard.press("Enter");
  await p.waitForFunction(() => P && P.m && P.m.trouves.length === 1, null, {timeout:4000});
  // les vidéos de pub sont en cache
  assert.ok(await p.evaluate(async () => !!(await caches.match("pubs/spot1.mp4"))), "spot vidéo disponible hors ligne");
  // multijoueur : message clair, boutons désactivés
  await p.evaluate(() => { ecranAccueil(); document.querySelector("#b-multi").click(); });
  await p.waitForSelector("#m-rapide[disabled]");
  assert.match(await p.textContent("#m-ouverts"), /Hors connexion/);
  assert.deepEqual(erreurs, []);
  await ctx.close();
});

test("hors ligne : un score du défi du jour attend le réseau puis part (avec serveur)", {skip: !SERVEUR && "pas de serveur (QLN_TEST_URL)"}, async () => {
  const {p, ctx, erreurs} = await ouvrir("fr", "telephone", {api:SERVEUR});
  const email = `avion-${Date.now().toString(36)}@test.fr`;
  await p.evaluate(() => Compte.ecranCompte("inscription"));
  await p.fill("#ct-pseudo", "Voyageur"); await p.fill("#ct-email", email); await p.fill("#ct-mdp", "motdepasse-avion");
  await p.click("#ct-ok"); await p.waitForFunction(() => Compte.connecte(), null, {timeout:8000});
  await ctx.setOffline(true);
  await p.evaluate(async () => {
    demarrerPartie("jour", null, {}); await new Promise(r => setTimeout(r, 300));
    P.historique = P.cartes.slice(0, 2).map(c => ({niv:c.niv, origine:c.origine, trouves:solutionsDe(c).slice(0, 1).map(w => w.toUpperCase())}));
    document.dispatchEvent(new CustomEvent("qln:fin-partie", {detail:{mode:"jour", total:40}}));
    await new Promise(r => setTimeout(r, 800));
  });
  assert.equal(await p.evaluate(() => store.get("scoresEnAttente", []).length), 1, "score gardé sur l'appareil");
  await ctx.setOffline(false);
  await p.waitForFunction(() => store.get("scoresEnAttente", []).length === 0, null, {timeout:10000});
  await p.evaluate(() => Compte.ecranClassements());
  await p.waitForFunction(() => document.querySelector("#app").textContent.includes("Voyageur"), null, {timeout:8000});
  await p.evaluate(async () => { const s = Compte.session(); await fetch(window.QLN_API_URL + "/api/moi", {method:"DELETE", headers:{Authorization:"Bearer " + s.jeton}}); });
  assert.deepEqual(erreurs.filter(e => !/Failed to fetch|NetworkError|ERR_INTERNET/i.test(e)), []); await ctx.close();
});

/* Séries du Défi : thème et autre langue (débloqués par niveau), cartes habillées, pas de classement. */
for(const lang of ["fr", "en"]) test(`${lang} : séries à thème et par langue`, async () => {
  const {p, ctx, erreurs} = await ouvrir(lang, "telephone");
  // niveau 1 : la langue est verrouillée, 2 thèmes ouverts
  await p.evaluate(() => ecranSolo()); await p.waitForSelector("#s-serie");
  const ouverts1 = await p.evaluate(() => [...document.querySelectorAll("#s-serie option:not([disabled])")].length);
  assert.equal(ouverts1, 3, "Classique + 2 thèmes au niveau 1");
  // haut niveau : tout est ouvert
  await p.evaluate(() => Progres.remplacer({...Progres.donnees(), xp:999999}));
  await p.evaluate(() => ecranSolo()); await p.waitForSelector("#s-serie");
  assert.equal(await p.evaluate(() => document.querySelectorAll("#s-serie option[disabled]").length), 0, "tout est débloqué à haut niveau");
  for(const k of ["theme-animaux", "langue-" + (lang === "en" ? "fr" : "en"), "langue-es", "langue-de", "langue-it"]){
    await p.evaluate(() => ecranSolo()); await p.waitForSelector("#s-serie");
    await p.selectOption("#s-serie", k);
    await p.evaluate(() => document.querySelector("#s-defi").click());
    await p.waitForSelector(".carte.carte-serie .serie-badge", {timeout:8000});
    const etat = await p.evaluate(() => ({mode:P.mode, n:P.parcours.length, toutes:P.cartes.every(c => c.deco && c.mots.length >= 2)}));
    assert.equal(etat.mode, "serie"); assert.ok(etat.toutes, "cartes de la série habillées");
    // on trouve une anagramme de la 1re carte
    const mot = await p.evaluate(() => norm(solutionsDe(P.carte)[0]));
    await p.waitForTimeout(500); await p.keyboard.type(mot, {delay:20});
    await p.waitForFunction(() => P && P.m && P.m.trouves.length === 1, null, {timeout:4000}).catch(async e => { throw new Error(k + " : " + JSON.stringify(await p.evaluate(() => [P && P.m && P.m.trouves, document.querySelector("#message")?.textContent, P && P.carte.origine, document.querySelector(".voile")?.textContent?.slice(0,120)]))); });
    await p.evaluate(() => ecranAccueil());
  }
  sansErreur(erreurs); await ctx.close();
});

test("plateau : rappel « le plus riche gagne » et podium détaillé", async () => {
  const {p, ctx, erreurs} = await ouvrir("fr", "telephone");
  await p.evaluate(() => document.querySelector("#b-ia").click()); await p.evaluate(() => document.querySelector("#b-go").click());
  await p.waitForSelector("#b-parti");
  assert.match(await p.textContent(".regle-or"), /Le plus riche gagne/);
  await p.evaluate(() => document.querySelector("#b-parti").click()); await p.waitForTimeout(300);
  assert.match(await p.evaluate(() => document.querySelector("#tapis").textContent), /BONUS\s*D'ARRIVÉE/);
  await p.evaluate(() => { const G = PlateauIA._etat(); G.joueurs.forEach((j, i) => { j.detail = {cartes:100 + i*10, encheres:-20, cases:40, arrivee:[100,75,50,-25][i]}; j.argent = Object.values(j.detail).reduce((a, b) => a + b, 0); j.arrive = i + 1; }); PlateauIA._fin(); });
  await p.waitForSelector(".podium-detail");
  const txt = await p.textContent(".podium-l.premier .podium-detail");
  assert.match(txt, /Cartes/); assert.match(txt, /Arrivée/);
  sansErreur(erreurs); await ctx.close();
});

test("ordinateur : barre du bas (règles, classement de la partie, paramètres, aide) sans quitter la partie", async () => {
  const {p, ctx, erreurs} = await ouvrir("fr", "ordinateur");
  assert.ok(await p.isVisible("#barre-bas"), "barre visible sur ordinateur");
  await p.evaluate(() => document.querySelector("#b-ia").click()); await p.evaluate(() => document.querySelector("#b-go").click());
  await p.waitForSelector("#b-parti"); await p.evaluate(() => document.querySelector("#b-parti").click()); await p.waitForTimeout(300);
  for(const [b, attendu] of [["regles", /Le principe/], ["classement", /Partie en cours/], ["parametres", /Vibrations/], ["aide", /mêmes lettres/]]){
    await p.evaluate(b => document.querySelector(`#barre-bas [data-b="${b}"]`).click(), b);
    await p.waitForSelector(".bb-voile");
    assert.match(await p.textContent(".bb-voile"), attendu, b);
    await p.keyboard.press("Escape"); await p.waitForSelector(".bb-voile", {state:"detached"});
  }
  assert.ok(await p.evaluate(() => !!PlateauIA._etat()), "la partie continue");
  sansErreur(erreurs); await ctx.close();
  const tel = await ouvrir("fr", "telephone");
  assert.equal(await tel.p.isVisible("#barre-bas"), false, "pas de barre sur téléphone"); await tel.ctx.close();
});
