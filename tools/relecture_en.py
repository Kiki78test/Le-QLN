"""Tableur de relecture du dictionnaire anglais -> docs/le-qln-anglais.xlsx (une ligne par carte, les nouvelles marquées).
Usage : python3 tools/relecture_en.py [ancien en.json pour marquer les nouvelles cartes]
Les mots à retirer se reportent ensuite dans EXTRA_BLOCK (tools/build_dict_en.py), puis on régénère."""
import datetime, json, pathlib, sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
R = pathlib.Path(__file__).resolve().parent.parent
d = json.loads((R / "app" / "en" / "data" / "en.json").read_text(encoding="utf-8"))
anciennes = set()
if len(sys.argv) > 1:
    for k, l in json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")).items(): anciennes |= {"".join(sorted(g[0])) for g in l}
NIV = {"v": "Vert (4-5 lettres)", "b": "Bleu (6-7)", "r": "Rouge (8-9)", "n": "Noir (10 et +)"}
wb = Workbook(); l = wb.active; l.title = "Lisez-moi"
for t in ["Dictionnaire anglais : une ligne par carte (mot de la carte + autres anagrammes acceptées).",
          "Colonne « Nouvelle » : x = carte ajoutée le 10/11/2026 (option D1 : formes de base, mots un peu moins courants acceptés).",
          "Pour retirer un mot : écrivez-le dans « Mots à retirer » ; pour retirer toute la carte : x dans « Retirer la carte ».",
          "Renvoyez le fichier : les mots seront exclus et le dictionnaire régénéré.", "Exemple — Mots à retirer : « seton »."]:
    l.append([t])
l.column_dimensions["A"].width = 110; l["A1"].font = Font(name="Arial", bold=True)
ws = wb.create_sheet("Cartes")
ws.append(["Niveau", "Mot de la carte", "Autres anagrammes", "Nouvelle", "Mots à retirer", "Retirer la carte"])
for c in ws[1]: c.font = Font(name="Arial", bold=True, color="FFFFFF"); c.fill = PatternFill("solid", fgColor="0F2A6B")
n = 0
for k in "vbrn":
    for g in d[k]:
        nv = "".join(sorted(g[0])) not in anciennes if anciennes else False; n += nv
        ws.append([NIV[k], g[0], ", ".join(g[1:]), "x" if nv else "", "", ""])
for col, w in zip("ABCDEF", [18, 22, 50, 10, 24, 16]): ws.column_dimensions[col].width = w
for row in ws.iter_rows(min_row=2):
    for c in row: c.font = Font(name="Arial"); c.alignment = Alignment(vertical="top", wrap_text=True)
    for c in row[4:]: c.fill = PatternFill("solid", fgColor="FFF6D6")
ws.freeze_panes = "A2"; ws.auto_filter.ref = ws.dimensions
wb.save(R / "docs" / "le-qln-anglais.xlsx")
idx = R / "docs" / "index.json"; docs = json.loads(idx.read_text(encoding="utf-8"))
e = {"titre": "Dictionnaire anglais (relecture)", "fichier": "le-qln-anglais.xlsx", "date": datetime.date.today().isoformat(),
     "description": f"Les {sum(len(v) for v in d.values())} cartes anglaises ({n} nouvelles marquées) : indiquer les mots à retirer ou mettre x pour retirer une carte."}
docs = [x for x in docs if x["fichier"] != e["fichier"]]; docs.insert(0, e)
idx.write_text(json.dumps(docs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("docs/le-qln-anglais.xlsx :", n, "nouvelles cartes")
