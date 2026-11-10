/* Le changement de nom (tools/changer_nom.py) : sur une copie du dépôt, avec un faux nom, tout doit suivre et rester valide. */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs"), os = require("os"), path = require("path"), { execFileSync } = require("child_process");
const RACINE = path.join(__dirname, "..");

test("changer_nom : nom, logo, manifeste, version anglaise, appli Android", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "qln-nom-"));
  fs.cpSync(RACINE, tmp, {recursive: true, filter: s => !/node_modules|[\\/]\.git([\\/]|$)|__pycache__/.test(s)});
  const sortie = execFileSync("python3", ["tools/changer_nom.py", "Zorbo", "--sigle", "ZRB"], {cwd: tmp, encoding: "utf-8"});
  assert.match(sortie, /Le-QLN → Zorbo/);
  const lire = f => fs.readFileSync(path.join(tmp, f), "utf-8");
  assert.match(lire("index.html"), /<title>Zorbo<\/title>/); assert.match(lire("en/index.html"), /<title>Zorbo<\/title>/);
  assert.match(lire("index.html"), /<b>ZORBO<\/b>/);
  assert.equal(JSON.parse(lire("manifest.webmanifest")).short_name, "Zorbo");
  assert.match(JSON.parse(lire("en/manifest.webmanifest")).name, /^Zorbo — the anagram game/);
  assert.equal(JSON.parse(lire("mobile/capacitor.config.json")).appName, "Zorbo");
  assert.equal(JSON.parse(lire("marque.json")).nom, "Zorbo");
  // les identifiants techniques ne bougent pas (adresse du site, clés de stockage des joueurs)
  assert.match(lire("progres.js"), /github\.io\/Le-QLN\//); assert.match(lire("mobile/capacitor.config.json"), /github\.io\/Le-QLN\//);
  assert.ok(fs.existsSync(path.join(tmp, "icons/icon-512.png")));
  // aucun nom affiché ne reste dans les fichiers du jeu (hors commentaires d'en-tête et adresses)
  for(const f of ["index.html", "en/index.html", "multi.js", "en/multi.js", "plateau.js", "en/plateau.js", "progres.js", "en/progres.js", "compte.js", "en/compte.js"]){
    const reste = lire(f).split("\n").filter(l => /Le-QLN|LE-QLN/.test(l) && !/github\.io\/Le-QLN|^\s*\/?\*|^\s*\/\//.test(l));
    assert.deepEqual(reste, [], f + " contient encore l'ancien nom : " + reste.join(" | ").slice(0, 200));
  }
  for(const f of ["index.html", "multi.js", "plateau.js", "progres.js", "compte.js", "infos.js", "pub.js", "en/multi.js", "en/plateau.js", "en/progres.js", "en/compte.js", "en/infos.js", "en/pub.js", "server/index.js"].filter(f => f.endsWith(".js")))
    execFileSync("node", ["--check", path.join(tmp, f)]);
  fs.rmSync(tmp, {recursive: true, force: true});
});
