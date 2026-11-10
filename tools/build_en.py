#!/usr/bin/env python3
"""Builds the English version (app/en/) from the French sources (app/*.js, index.html) with FR->EN pair tables.
Usage: python3 tools/build_en.py   (from /home/claude/qln). Prints pairs not found + leftover French-looking text."""
import re, sys, importlib, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = ROOT/"app" if (ROOT/"app"/"index.html").exists() else ROOT   # le jeu est dans app/
EN = APP/"en"
import json as _json
NOM = _json.loads((ROOT/"marque.json").read_text(encoding="utf-8"))["nom"] if (ROOT/"marque.json").exists() else "Le-QLN"
sys.path.insert(0, str(ROOT/"tools"))
FILES = {"index.html":"en_index", "plateau.js":"en_plateau", "pub.js":"en_pub", "infos.js":"en_infos", "multi.js":"en_multi", "progres.js":"en_progres", "compte.js":"en_compte", "series.js":"en_series", "barre.js":"en_barre"}
STOP = set("le la les des du de un une vous votre vos pour avec sur dans pas qui que est sont ou et au aux ce cette ces mot mots carte cartes partie jouer joueur joueurs tour sans mais plus ne à il elle sa ses leur par se lettres lettre temps gain gains".split())
missing = 0
for fn, mod in FILES.items():
    src = (APP/fn).read_text(encoding="utf-8")
    try: pairs = importlib.import_module(mod).P
    except ModuleNotFoundError: pairs = []
    for fr, en in sorted(pairs, key=lambda p: -len(p[0])):
        if fr not in src: print(f"[{fn}] NOT FOUND: {fr[:90]!r}"); missing += 1; continue
        src = src.replace(fr, en)
    # post: euro amounts "40 €" -> "€40"
    src = re.sub(r'(\$\{[^{}]+\}|\b\d[\d,]*) ?€(?!\w)', lambda m: "€"+m.group(1), src)
    src = src.replace('qln:"+k','qln-en:"+k')
    src = src.replace('data/en.json','data/en.json')
    src = src.replace('href="manifest.webmanifest"','href="manifest.webmanifest"').replace('href="icons/','href="../icons/').replace('url(fonts/','url(../fonts/').replace('"pubs/spot','"../pubs/spot').replace('fetch("docs/index.json"','fetch("../docs/index.json"').replace('<script src="config.js">','<script src="../config.js">').replace('<script src="analyse.js">','<script src="../analyse.js">').replace('"docs/${encodeURI','"../docs/${encodeURI')
    (EN/fn).write_text(src, encoding="utf-8")
    # leftover scan: only inside string literals / template text / HTML text
    segs = re.findall(r'"((?:[^"\\\n]|\\.)*)"|\'((?:[^\'\\\n]|\\.)*)\'|`((?:[^`\\]|\\.)*)`|>([^<>{}`\n]{3,})<', src)
    seen = set()
    for g in segs:
        t = next((x for x in g if x), ""); 
        if not t: continue
        t = re.sub(r"\$\{[^{}]*\}", " ", t)
        words = re.findall(r"[A-Za-zÀ-ÿ]+", t.lower())
        if re.search(r"[éèêàùçôîïâû]", t) or any(w in STOP for w in words):
            t1 = t.strip()[:140]
            if t1 not in seen and not re.match(r"^[\w\s.#:\[\]=\-,>*()\"'~]*$", t1) or (t1 not in seen and any(w in STOP for w in words)):
                seen.add(t1); print(f"[{fn}] {t1}")
# service worker + manifest
sw = (APP/"sw.js").read_text(encoding="utf-8").replace("qln-v44","qln-en-v36").replace("data/fr.json","data/en.json").replace('"pubs/spot1.jpg", "pubs/spot2.jpg", "pubs/spot3.jpg", "pubs/spot1.mp4", "pubs/spot2.mp4", "pubs/spot3.mp4", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"','"../pubs/spot1.jpg", "../pubs/spot2.jpg", "../pubs/spot3.jpg", "../pubs/spot1.mp4", "../pubs/spot2.mp4", "../pubs/spot3.mp4", "../icons/icon-192.png", "../icons/icon-512.png", "../icons/apple-touch-icon.png"')
sw = sw.replace('"en/data/en.json"','"../data/fr.json"').replace('data/themes-fr.json','data/themes-en.json').replace('"config.js", ','"../config.js", ').replace('"legal.js", ','"../legal.js", ').replace('"analyse.js", ','"../analyse.js", ').replace('"fonts/','"../fonts/').replace('"data/langues/','"../data/langues/')
sw = sw.replace(NOM+" — service worker : jeu jouable hors connexion après la première visite.",NOM+" (EN) — service worker: playable offline after the first visit.")
(EN/"sw.js").write_text(sw, encoding="utf-8")
import json
m = json.loads((APP/"manifest.webmanifest").read_text(encoding="utf-8"))
m.update({"name":NOM+" — the anagram game","description":"Find the anagram before the timer runs out.","lang":"en","start_url":"./","scope":"./"})
for ic in m["icons"]: ic["src"] = "../" + ic["src"]
(EN/"manifest.webmanifest").write_text(json.dumps(m, ensure_ascii=False, indent=2), encoding="utf-8")
print("missing pairs:", missing)
