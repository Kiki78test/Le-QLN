"""Lists words in the EN build strings that look French (present in the French dictionary, absent from English)."""
import re, json, sys
from wordfreq import zipf_frequency
fr = json.load(open("/home/claude/qln/app/data/fr.json"))
FRW = {w for k in fr for g in fr[k] for w in g}
FRW |= set("encaisser continuer boutique indice passe carte cartes vous votre pour avec banque cagnotte série serie manche manches joueur joueurs tour tours partie défi defi règles regles jeu sablier gagné gagnée perdue vies vie lettres lettre mot mots dé retour quitter choisir choisissez jouer jouez touchez".split())
for fn in ["index.html","plateau.js","pub.js","infos.js"]:
    src = open(f"/home/claude/qln/app/en/{fn}", encoding="utf-8").read()
    segs = re.findall(r'"((?:[^"\\\n]|\\.)*)"|\'((?:[^\'\\\n]|\\.)*)\'|`((?:[^`\\]|\\.)*)`|>([^<>{}`\n]{3,})<', src)
    seen = set()
    for g in segs:
        t = next((x for x in g if x), "")
        t = re.sub(r"\$\{[^{}]*\}", " ", t); t = re.sub(r"<[^>]*>", " ", t)
        for w in re.findall(r"[A-Za-zÀ-ÿ]{4,}", t):
            wl = w.lower()
            if (wl in FRW or re.search(r"[éèêàùçôîïâû]", wl)) and zipf_frequency(wl, "en") < 2.0 and wl not in seen:
                seen.add(wl); print(f"[{fn}] {wl}  <- {t.strip()[:80]}")
