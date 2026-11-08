"""Construit le dictionnaire d'anagrammes de Le-QLN à partir de Lexique 3.83.

Règles du jeu appliquées :
- mots acceptés : noms communs, adjectifs, verbes à l'infinitif,
  participes passés (toutes formes) et présents ; pas de conjugaisons ;
- 4 lettres minimum ; accents ignorés pour l'anagramme.
Niveaux : vert 4-5, bleu 6-7, rouge 8-9, noir 10+.
Sortie : app/data/fr.json  ->  {"v":[[mots...],...], "b":..., "r":..., "n":...}
Chaque groupe : liste de mots (graphie accentuée), triés par fréquence décroissante.
Un groupe est jouable si au moins 2 mots distincts (sans accents) existent
et qu'au moins 2 d'entre eux sont assez courants.
"""
import csv, json, sys, unicodedata, re
from collections import defaultdict

import openpyxl

LEX, XLSX, OUT = sys.argv[1], sys.argv[2], sys.argv[3]

def norm(w):
    w = unicodedata.normalize("NFD", w)
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return w.upper().replace("Œ", "OE").replace("Æ", "AE")

def level(n):
    return "v" if n <= 5 else "b" if n <= 7 else "r" if n <= 9 else "n"

# Mots écartés pour un public 12+ (ni proposés ni affichés)
BLOCK = set(norm(w) for w in """salope salopes pute putes putain putains bite bites
couille couilles con cons conne connes connard connards enculé enculer enculés
nichon nichons cul culs foutre baiser baisé baisée baisés baisées branler branlé
pédé pédés gouine gouines bougnoule bougnoules nègre nègres négro youpin
prostitué prostituée prostitués prostituées pénis vagin vagins clitoris sodomie
sodomiser orgasme orgasmes merde merdes chier chié pisser pissé pine pines
zob zobs bordel bordels catin catins""".split())

words = {}  # norm -> (display, freq)
with open(LEX, encoding="utf-8") as f:
    r = csv.DictReader(f, delimiter="\t")
    for row in r:
        w, cg, inf = row["ortho"], row["cgram"], row["infover"] or ""
        if not re.fullmatch(r"[a-zàâäçéèêëîïôöùûüÿœæ]+", w):
            continue
        if len(norm(w)) < 4:
            continue
        ok = cg in ("NOM", "ADJ") or (
            cg == "VER" and ("inf" in inf or "par:" in inf))
        if not ok:
            continue
        n = norm(w)
        if n in BLOCK:
            continue
        fr = float(row["freqfilms2"] or 0) + float(row["freqlivres"] or 0)
        if n not in words or fr > words[n][1]:
            # garder la graphie la plus fréquente (pâté vs pâte : même clé)
            prev = words.get(n, (w, 0))[1]
            words[n] = (w, max(fr, prev))
        else:
            words[n] = (words[n][0], words[n][1] + 0)

groups = defaultdict(list)
for n, (w, fr) in words.items():
    groups["".join(sorted(n))].append((w, fr))

COMMON = 0.3  # occurrences / million (films + livres)
out = {"v": [], "b": [], "r": [], "n": []}
for key, lst in groups.items():
    if len(lst) < 2:
        continue
    lst.sort(key=lambda x: -x[1])
    common = [w for w, fr in lst if fr >= COMMON]
    if len(common) < 2:
        continue
    out[level(len(key))].append([w for w, _ in lst])

# Cartes de l'auteur (Jeu_Qln.xlsx) : vérification contre le lexique
wb = openpyxl.load_workbook(XLSX, data_only=True)
author, issues = [], []
for ws in wb.worksheets:
    if not ws.title.isdigit():
        continue
    for row in ws.iter_rows(min_row=2, values_only=True):
        cells = [str(c).strip() for c in row if c and str(c).strip()]
        cells = [c for c in cells if re.fullmatch(r"[A-Za-zÀ-ÿœŒ]+", c)]
        if len(cells) < 2:
            continue
        a = norm(cells[0])
        good = [c for c in cells if sorted(norm(c)) == sorted(a)]
        bad = [c for c in cells if sorted(norm(c)) != sorted(a)]
        unknown = [c for c in good if norm(c) not in words]
        if bad:
            issues.append(f"{cells[0]} : lettres différentes -> {', '.join(bad)}")
        if unknown:
            issues.append(f"{cells[0]} : hors lexique (accepté quand même) -> {', '.join(unknown)}")
        author.append([c.lower() for c in good])

# Les cartes de l'auteur passent en tête de chaque niveau (marquées)
known = {lv: {"".join(sorted(norm(g[0]))) for g in out[lv]} for lv in out}
extra = 0
for g in author:
    if len(set(norm(x) for x in g)) < 2:
        continue
    key = "".join(sorted(norm(g[0])))
    lv = level(len(key))
    if key in known[lv]:
        # fusionner les mots de l'auteur dans le groupe existant
        for grp in out[lv]:
            if "".join(sorted(norm(grp[0]))) == key:
                have = {norm(x) for x in grp}
                grp.extend(x for x in g if norm(x) not in have)
                break
    else:
        out[lv].append(g)
        known[lv].add(key)
        extra += 1

for lv in out:
    out[lv].sort(key=lambda g: g[0])

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, separators=(",", ":"))

print("Groupes par niveau :", {k: len(v) for k, v in out.items()})
print("Cartes auteur :", len(author), "dont ajoutées hors lexique :", extra)
print("Remarques sur le tableau :", len(issues))
for i in issues:
    print("  -", i)
