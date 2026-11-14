/* Tests des fonctions ajoutées le 11/11/2026 : filtre des pseudos, médailles à paliers, paramètres et rappels,
   remontée des erreurs et page d'administration, parrainage, pages publiques (anagrammes, présentation, sitemap)
   et contrôle de la traduction anglaise (aucun texte français visible dans la version anglaise).
   Site servi en local : QLN_SITE (défaut http://localhost:8765). Avec QLN_TEST_URL (serveur lancé avec
   ADMIN_EMAILS=admin@qln.test), les parties serveur sont testées de bout en bout. */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { chromium } = require("playwright");
const Filtre = require(path.join(__dirname, "..", "app", "filtre.js"));
const SITE = (process.env.QLN_SITE || "http://localhost:8765").replace(/\/$/, "");
const API = process.env.QLN_TEST_URL || "";
const ADMIN = "admin@qln.test";
let nav;
test.before(async () => { nav = await chromium.launch(); });
test.after(async () => { await nav.close(); });

async function ouvrir(lang = "fr", {api = "", vue = "telephone", url = "", init = null} = {}){
  const ctx = await nav.newContext(vue === "telephone" ? {viewport:{width:400, height:860}, isMobile:true, hasTouch:true, serviceWorkers:"block"} : {viewport:{width:1280, height:820}, serviceWorkers:"block"});
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  const erreurs = []; p.on("pageerror", e => erreurs.push(e.message));
  await p.addInitScript(i => { try{ for(const k of ["qln:", "qln-en:"]){ localStorage.setItem(k + "progres", JSON.stringify(i || {tuto:"fait"})); localStorage.setItem(k + "pub", "false"); } }catch(e){} }, init);
  await ctx.route(/\/config\.js(\?|$)/, r => r.fulfill({contentType:"application/javascript", body:`window.QLN_API_URL=${JSON.stringify(api)};window.QLN_WS_URL="";window.QLN_GOOGLE_CLIENT_ID="";window.QLN_SITE_URL="${SITE}/";`}));
  await p.goto(url || `${SITE}/${lang === "en" ? "en/" : ""}index.html`);
  if(!url){ await p.waitForSelector("#b-defi"); await p.waitForFunction(() => typeof DICO !== "undefined" && DICO && DICO.v && DICO.v.length > 0, null, {timeout:15000}); }
  return {p, ctx, erreurs};
}
async function appel(chemin, {methode = "GET", corps, jeton} = {}){
  const r = await fetch(API + "/api" + chemin, {method:methode, headers:{"Content-Type":"application/json", ...(jeton ? {Authorization:"Bearer " + jeton} : {})}, body:corps ? JSON.stringify(corps) : undefined});
  return {statut:r.status, d:await r.json().catch(() => ({}))};
}
async function compte(email, pseudo, extra = {}){
  let r = await appel("/inscription", {methode:"POST", corps:{email, mdp:"motdepasse-test", pseudo, ...extra}});
  if(r.statut === 409) r = await appel("/connexion", {methode:"POST", corps:{email, mdp:"motdepasse-test"}});
  assert.equal(r.statut, 200, JSON.stringify(r.d));
  return r.d;
}

test("filtre : pseudos grossiers refusés, prénoms et mots ordinaires acceptés", () => {
  for(const m of ["Connard", "s4l0pe", "puuute", "p.u.t.e", "pute93", "FDP", "Enculé", "fuck_you", "Hitler88", "xXbitchXx", "ta gueule", "Violeur"]) assert.ok(Filtre.grossier(m), m);
  for(const m of ["Kiki", "Computer", "Violette", "Unique", "Technique", "Château", "Montenegro", "Isabelle", "Constance", "Pascal", "Assassin", "Nicolas", "Conrad"]) assert.ok(!Filtre.grossier(m), m);
  assert.equal(Filtre.masquer("s4l0pe", "Joueur"), "Joueur"); assert.equal(Filtre.masquer("Kiki"), "Kiki");
});

test("médailles à paliers : annonce du bronze, écran des statistiques", async () => {
  const st = {parties:3, cartes:{v:[9,9], b:[0,0], r:[0,0], n:[0,0]}, mots:9, parfaites:0, indices:0, temps:{}, gains:0, meilleure:0, victoiresIA:0, partiesIA:0, jours:1};
  const {p, ctx, erreurs} = await ouvrir("fr", {init:{tuto:"fait", st, paliers:{}}});
  assert.equal(await p.evaluate(() => Progres.donnees().paliers.collection || 0), 0);
  await p.evaluate(() => Progres.carte({niv:"v", reussi:true, nbTrouves:1, nbSol:2}));
  // (les annonces passent l'une après l'autre : « Première carte » puis la médaille)
  await p.waitForFunction(() => [...document.querySelectorAll(".pg-succes")].some(e => /Médaille de bronze/.test(e.textContent)), null, {timeout:10000});
  assert.equal(await p.evaluate(() => Progres.donnees().paliers.collection), 1);
  await p.evaluate(() => Progres.ecranStats());
  assert.equal(await p.locator(".pg-p").count(), 9);
  assert.equal(await p.getAttribute('.pg-p[data-palier="collection"]', "data-niveau"), "1");
  // joueur existant (progression sans médailles) : médailles méritées attribuées sans annonce
  const deux = await ouvrir("en", {init:{tuto:"fait", st:{...st, cartes:{v:[150,120], b:[0,0], r:[0,0], n:[0,0]}}}});
  assert.equal(await deux.p.evaluate(() => Progres.donnees().paliers.collection), 2);
  assert.equal(await deux.p.locator(".pg-succes").count(), 0);
  assert.deepEqual([...erreurs, ...deux.erreurs], []); await ctx.close(); await deux.ctx.close();
});

test("paramètres : menu ☰ → Paramètres et rappels (sans serveur : explication)", async () => {
  const {p, ctx, erreurs} = await ouvrir("fr");
  await p.evaluate(() => document.querySelector("#ab-menu").click());
  await p.click('#tiroir button[data-nav="parametres"]');
  await p.waitForSelector(".bb-voile");
  const t = await p.textContent(".bb-voile");
  assert.match(t, /Rappels/); assert.match(t, /pas disponibles/);
  assert.deepEqual(erreurs, []); await ctx.close();
});

test("pages publiques : anagrammes par mot, index, présentation, sitemap", async () => {
  const r = await fetch(SITE + "/anagrammes/chien.html"); assert.equal(r.status, 200);
  const h = await r.text(); assert.match(h, /Anagrammes de CHIEN/); assert.match(h, /NICHE/); assert.match(h, /Wiktionnaire/);
  for(const u of ["/anagrammes/", "/anagrammes/lettre-c.html", "/en/anagrams/", "/presentation.html", "/en/presentation.html", "/sitemap.xml", "/robots.txt", "/admin.html"])
    assert.equal((await fetch(SITE + u)).status, 200, u);
  const sm = await (await fetch(SITE + "/sitemap.xml")).text();
  assert.ok((sm.match(/<loc>/g) || []).length > 5000, "sitemap complet");
  const {p, ctx, erreurs} = await ouvrir("fr", {url:SITE + "/presentation.html"});
  const imgs = await p.evaluate(() => [...document.images].map(i => i.src)); assert.ok(imgs.length >= 8, "captures");
  for(const u of imgs) assert.equal((await fetch(u)).status, 200, u);
  assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "pas de défilement horizontal");
  assert.deepEqual(erreurs, []); await ctx.close();
});

test("traduction : aucun texte français visible dans la version anglaise", async () => {
  // mots très courants en français et absents de l'anglais ; noms propres et langues autorisés
  const FR = /\b(le|la|les|des|du|une|vous|votre|vos|pour|avec|dans|sur|cette|ces|est|sont|mais|plus|carte|cartes|partie|parties|joueur|joueurs|jouer|défi|règles|niveau|série|gagné|perdu|retour|fermer|suivant|aucun|aucune|déjà|être|très|ici|où|à|é|è|ê|ç)\b/i;
  const AUTORISE = /Français|Español|Deutsch|Italiano|Le-QLN|LE-QLN|Lexique|Wiktionary|€|Déjà vu/;
  const {p, ctx, erreurs} = await ouvrir(process.env.AUDIT_LANG || "en", {vue:"ordinateur"});
  const trouves = new Set();
  const relever = async ecran => {
    const txt = await p.evaluate(() => {
      const out = [];
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while(w.nextNode()){ const n = w.currentNode, el = n.parentElement; if(!el || el.closest("script,style,[hidden]") || !el.getClientRects().length) continue; const t = n.textContent.trim(); if(t.length > 1) out.push(t); }
      document.querySelectorAll("[aria-label],[title],[placeholder]").forEach(el => { for(const a of ["aria-label", "title", "placeholder"]) if(el.getAttribute(a)) out.push(el.getAttribute(a)); });
      return out;
    });
    for(const t of txt) if(FR.test(t.replace(AUTORISE, "")) && !/^[A-Z]{2,}$/.test(t)) trouves.add(ecran + " → " + t.slice(0, 80));
  };
  const ecrans = {
    accueil: "ecranAccueil()", solo: 'document.querySelector("#b-defi").click()', regles: "ecranRegles()", stats: "Progres.ecranStats()",
    multi: 'ecranAccueil(); document.querySelector("#b-multi").click()', compte: "Compte.ecranCompte()", classements: "Compte.ecranClassements()",
    parametres: "ecranAccueil(); BarreBas.parametres()", aide: "BarreBas.aide()", menu: 'BarreBas.fermer(); document.querySelector("#ab-menu").click()',
  };
  for(const [nom, js] of Object.entries(ecrans)){ await p.evaluate(js); await p.waitForTimeout(450); await relever(nom); }
  assert.deepEqual([...trouves], [], "textes français dans la version anglaise :\n" + [...trouves].join("\n"));
  assert.deepEqual(erreurs, []); await ctx.close();
});

test("serveur : erreurs remontées, page d'administration, parrainage, pseudo refusé", {skip: !API && "pas de serveur de test (QLN_TEST_URL)"}, async () => {
  // 1. remontée d'une erreur de l'appli
  const {p, ctx, erreurs} = await ouvrir("fr", {api:API});
  const marque = "erreur-de-test-" + Date.now();
  await p.evaluate(m => setTimeout(() => { throw new Error(m); }), marque);
  await p.waitForTimeout(1500);
  const admin = await compte(ADMIN, "AdminTest");
  assert.equal(admin.joueur.admin, true, "ADMIN_EMAILS doit contenir " + ADMIN);
  const {d} = await appel("/admin/erreurs", {jeton:admin.jeton});
  assert.ok(d.erreurs.some(x => x.message.includes(marque)), "erreur reçue par le serveur");
  // 2. page d'administration (même navigateur, session du jeu)
  await p.evaluate(s => localStorage.setItem("qln:session", JSON.stringify(s)), admin);
  await p.goto(SITE + "/admin.html"); await p.waitForSelector(".tuile");
  assert.match(await p.textContent("main"), /Comptes/);
  await p.click('[data-o="erreurs"]'); await p.waitForFunction(m => document.querySelector("main").textContent.includes(m), marque);
  // un joueur non administrateur est refusé
  const simple = await compte(`joueur${Date.now()}@qln.test`, "Simple" + (Date.now() % 1000));
  assert.equal((await appel("/admin/resume", {jeton:simple.jeton})).statut, 403);
  // 3. pseudo grossier refusé par le serveur
  assert.equal((await appel("/inscription", {methode:"POST", corps:{email:`x${Date.now()}@qln.test`, mdp:"motdepasse-test", pseudo:"s4l0pe"}})).statut, 400);
  // 4. parrainage : lien → inscription → bonus d'XP des deux côtés
  const {d:par} = await appel("/parrainage", {jeton:simple.jeton});
  assert.match(par.code, /^[A-Z0-9]{6}$/);
  const f = await ouvrir("fr", {api:API, url:`${SITE}/index.html?parrain=${par.code}`});
  await f.p.waitForSelector("#b-defi");
  assert.equal(await f.p.evaluate(() => store.get("parrain")), par.code);
  assert.ok(!/parrain=/.test(f.p.url()), "code retiré de l'adresse");
  await f.p.evaluate(() => Compte.ecranCompte("inscription"));
  await f.p.fill("#ct-pseudo", "Filleul" + (Date.now() % 1000)); await f.p.fill("#ct-email", `filleul${Date.now()}@qln.test`); await f.p.fill("#ct-mdp", "motdepasse-test");
  assert.equal(await f.p.inputValue("#ct-parrain"), par.code);
  await f.p.click("#ct-ok");
  await f.p.waitForFunction(() => Progres.donnees().parrainage && Progres.donnees().parrainage.filleul === true, null, {timeout:8000});
  assert.ok(await f.p.evaluate(() => Progres.donnees().xp >= 200));
  await f.p.waitForTimeout(1500);   // synchronisation de la progression du filleul
  const apres = await appel("/parrainage", {jeton:simple.jeton});
  assert.equal(apres.d.filleuls, 1, "le filleul a joué (XP ≥ 50) : il compte");
  // le parrain reçoit son bonus à la synchronisation suivante
  const s = await appel("/progression?langue=fr", {methode:"PUT", jeton:simple.jeton, corps:{progres:{xp:0}}});
  assert.equal(s.d.filleuls, 1);
  assert.deepEqual([...erreurs, ...f.erreurs].filter(x => !x.includes(marque)), []); await ctx.close(); await f.ctx.close();
});

test("règles du plateau (14/11) : durée courte/longue, série de 2 cartes, Passe, égalité", async () => {
  const {p, ctx, erreurs} = await ouvrir("fr", {vue:"ordinateur"});
  // écran de configuration : choix de la durée
  await p.evaluate(() => PlateauIA.config());
  await p.waitForSelector("#cfg-duree");
  assert.equal(await p.locator("#cfg-duree button").count(), 2);
  await p.click('#cfg-duree [data-k="longue"]');
  await p.evaluate(() => { window.QLN_TEST_VITE = .03; });
  await p.click("#b-go");
  await p.waitForFunction(() => PlateauIA._etat() && PlateauIA._etat().faces, null, {timeout:15000});
  assert.equal(await p.evaluate(() => PlateauIA._etat().faces), 3, "partie longue : dé 1 à 3");
  assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem("qln:cfgIA")).duree), "longue");
  await p.evaluate(() => PlateauIA.arreter());
  // règles écrites dans l'appli
  await p.evaluate(() => ecranRegles());
  const r = await p.textContent(".r-plateau");
  assert.match(r, /2e carte de la même couleur/); assert.match(r, /passez votre prochain tour/); assert.match(r, /3 tours pour franchir/);
  assert.deepEqual(erreurs, []); await ctx.close();
});

test("audience : visites, journal, tunnel dans la page d'administration", {skip: !API && "pas de serveur de test (QLN_TEST_URL)"}, async () => {
  // (navigateur de test présenté comme un vrai téléphone : « HeadlessChrome » est écarté comme robot)
  const ctx = await nav.newContext({viewport:{width:400, height:860}, isMobile:true, hasTouch:true, serviceWorkers:"block", locale:"fr-FR", userAgent:"Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36"});
  await ctx.route(/\/config\.js(\?|$)/, r => r.fulfill({contentType:"application/javascript", body:`window.QLN_API_URL=${JSON.stringify(API)};window.QLN_WS_URL="";window.QLN_GOOGLE_CLIENT_ID="";`}));
  await ctx.addInitScript(() => { window.QLN_AUDIENCE_TEST = true; try{ localStorage.setItem("qln:progres", JSON.stringify({tuto:"fait"})); localStorage.setItem("qln:pub", "false"); }catch(e){} });
  const p = await ctx.newPage(); const erreurs = []; p.on("pageerror", e => erreurs.push(e.message));
  await p.goto(SITE + "/index.html"); await p.waitForSelector("#b-defi");
  const vid = await p.evaluate(() => localStorage.getItem("qln-vid"));
  assert.match(vid, /^[a-z0-9]{16,40}$/, "identifiant de visiteur tiré au hasard");
  await p.mouse.click(10, 10);                                // première interaction (« act »)
  await p.evaluate(() => { window.QLN_EVT("partie:defi"); window.QLN_EVT("fin:defi"); });
  await p.waitForTimeout(1200);
  const admin = await compte(ADMIN, "AdminTest");
  const J = (await appel("/admin/journal", {jeton:admin.jeton})).d;
  const moi = J.lignes.find(l => (l.etapes || []).some(e => e[1] === "partie:defi"));
  assert.ok(moi, "visite présente dans le journal"); assert.equal(moi.appareil, "mobile"); assert.equal(moi.robot, false);
  const T = (await appel("/admin/tunnel?jours=7", {jeton:admin.jeton})).d;
  assert.ok(T.etapes.find(e => e.cle === "partie").n >= 1 && T.etapes.find(e => e.cle === "fin").n >= 1, "tunnel");
  const V = (await appel("/admin/visites", {jeton:admin.jeton})).d;
  assert.ok(V.jour.visiteurs >= 1 && V.jours.length === 60);
  // l'administrateur n'est pas compté ; page admin : onglets Visites, Journal, Tunnel
  await p.evaluate(s => localStorage.setItem("qln:session", JSON.stringify(s)), admin);
  await p.goto(SITE + "/admin.html"); await p.waitForSelector(".tuile");
  assert.match(await p.textContent("main"), /Visiteurs aujourd'hui/);
  for(const [o, txt] of [["visites", /Origine des visiteurs/], ["journal", /Journal des visites/], ["tunnel", /Ont lancé une partie/]]){
    await p.click(`[data-o="${o}"]`); await p.waitForFunction(t => new RegExp(t).test(document.querySelector("main").textContent), txt.source, {timeout:8000});
  }
  assert.deepEqual(erreurs, []); await ctx.close();
});
