#!/usr/bin/env python3
"""Séries à thème : croise les listes de tools/themes_listes.py avec les dictionnaires du jeu.
Écrit data/themes-fr.json et en/data/themes-en.json :
  {"themes":[{cle, nom, emoji, c1, c2, motif, mots:[[niveau, mot], ...]}], "min": N}
Un thème n'est gardé que s'il a assez de cartes pour plusieurs séries (MIN_CARTES).
Écrit aussi docs/le-qln-themes.xlsx (relecture : un onglet par langue)."""
import json, pathlib, sys, unicodedata
ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from themes_listes import THEMES, FR, EN
MIN_CARTES = 16          # une série = 8 cartes : au moins 2 séries sans répétition
def norm(w): return unicodedata.normalize("NFD", w).encode("ascii", "ignore").decode().upper().replace("Œ", "OE").replace("Æ", "AE")
def construire(lang, listes, dico_path, out_path):
    d = json.loads(dico_path.read_text(encoding="utf-8"))
    index = {}                     # mot normalisé -> (niveau, orthographe du dictionnaire)
    for niv, groupes in d.items():
        for g in groupes:
            if len(g) < 2: continue
            for w in g: index.setdefault(norm(w), (niv, w))
    sortie, bilan = [], []
    for cle, nfr, nen, emoji, c1, c2, motif in THEMES:
        vus, mots = set(), []
        for w in listes.get(cle, "").split():
            for v in (w, w + "s", w + "x"):
                k = norm(v)
                if k in index and k not in vus:
                    vus.add(k); mots.append(list(index[k])); break
        par = {n: sum(1 for m in mots if m[0] == n) for n in "vbrn"}
        bilan.append((cle, len(mots), par))
        if len(mots) >= MIN_CARTES:
            sortie.append({"cle": cle, "nom": nfr if lang == "fr" else nen, "emoji": emoji, "c1": c1, "c2": c2, "motif": motif, "mots": mots})
    out_path.write_text(json.dumps({"themes": sortie, "min": MIN_CARTES}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    return sortie, bilan
res = {}
APP = ROOT / "app" if (ROOT / "app" / "index.html").exists() else ROOT   # le jeu est dans app/
for lang, listes, dp, op in [("fr", FR, APP / "data" / "fr.json", APP / "data" / "themes-fr.json"),
                             ("en", EN, APP / "en" / "data" / "en.json", APP / "en" / "data" / "themes-en.json")]:
    s, b = construire(lang, listes, dp, op); res[lang] = s
    print(lang, len(s), "thèmes gardés")
    for cle, n, par in b: print(f"   {cle:10} {n:4}  v{par['v']} b{par['b']} r{par['r']} n{par['n']}" + ("" if n >= MIN_CARTES else "  (trop peu : non proposé)"))
try:
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill
    wb = Workbook(); wb.remove(wb.active)
    NIV = {"v": "vert (4-5)", "b": "bleu (6-7)", "r": "rouge (8-9)", "n": "noir (10+)"}
    for lang, s in res.items():
        ws = wb.create_sheet("Français" if lang == "fr" else "English")
        ws.append(["Thème", "Mot de départ", "Niveau", "À retirer ? (mettre x)"])
        for c in ws[1]: c.font = Font(name="Arial", bold=True); c.fill = PatternFill("solid", fgColor="FFE699")
        for t in s:
            for niv, mot in t["mots"]: ws.append([t["nom"], mot, NIV[niv], ""])
        for col, w in zip("ABCD", (26, 22, 14, 22)): ws.column_dimensions[col].width = w
        for row in ws.iter_rows(min_row=2):
            for c in row: c.font = Font(name="Arial")
        ws.freeze_panes = "A2"
    wb.save(ROOT / "docs" / "le-qln-themes.xlsx")
except ImportError: print("openpyxl absent : tableur non écrit")
