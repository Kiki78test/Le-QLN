"""Corrections du dictionnaire français validées par l'auteur (audit externe du 10/11/2026), appliquées à
app/data/fr.json et au tableur docs/le-qln-anagrammes.xlsx. Relançable sans risque (idempotent).
Les sources d'origine (tableau de l'auteur + Lexique) ne sont pas dans le dépôt : on corrige donc le résultat."""
import json, pathlib, unicodedata
from openpyxl import load_workbook
R = pathlib.Path(__file__).resolve().parent.parent
N = lambda w: "".join(c for c in unicodedata.normalize("NFD", str(w)) if unicodedata.category(c) != "Mn").upper().replace("Œ", "OE")
# 1. sigles, noms propres, mots familiers ou étrangers acceptés à tort comme réponses (aucune carte perdue)
RETIRER = ["sfio", "baes", "peta", "réac", "nerac", "petro", "petros", "esport", "loiret", "perso"]
# 2. fautes de frappe du tableau d'origine : le mot mal orthographié est retiré ; la carte reste si 2 mots au moins demeurent
FAUTES = {"carossier": "carrossier", "serpiere": "serpillière", "crolates": "crotales", "entonoir": "entonnoir"}
cible = {N(w) for w in RETIRER + list(FAUTES)}
p = R / "app" / "data" / "fr.json"; d = json.loads(p.read_text(encoding="utf-8"))
journal = []
for k in d:
    nouv = []
    for g in d[k]:
        g2 = [w for w in g if N(w) not in cible]
        if len(g2) != len(g): journal.append((k, g, g2))
        if len(g2) >= 2: nouv.append(g2)
    d[k] = nouv
p.write_text(json.dumps(d, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
for k, g, g2 in journal: print(f"[{k}] {', '.join(g)}  ->  {', '.join(g2) if len(g2) >= 2 else 'CARTE RETIRÉE'}")
print({k: len(v) for k, v in d.items()}, "cartes :", sum(len(v) for v in d.values()))
# tableur : on retire les mêmes mots des cellules ; une ligne qui n'a plus qu'un mot est supprimée
x = R / "docs" / "le-qln-anagrammes.xlsx"; wb = load_workbook(x)
for ws in wb.worksheets[1:]:
    supp = []
    for row in ws.iter_rows(min_row=2):
        vals = [c.value for c in row]
        touche = False
        for c in row:
            if isinstance(c.value, str) and any(N(t.strip()) in cible for t in c.value.split(",")):
                reste = [t.strip() for t in c.value.split(",") if N(t.strip()) not in cible]
                c.value = ", ".join(reste) if reste else None; touche = True
        if touche:
            mots = [t for c in row if isinstance(c.value, str) for t in c.value.split(",") if t.strip().isalpha()]
            if len(mots) < 2: supp.append(row[0].row)
    for r in reversed(supp): ws.delete_rows(r)
wb.save(x); print("docs/le-qln-anagrammes.xlsx mis à jour")
