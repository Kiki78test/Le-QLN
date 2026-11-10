"""Cartes que l'appli ne tirerait plus : aucun de leurs mots n'est courant. Un mot est « courant » si sa fréquence
Lexique 3.83 (films + livres) atteint 0,3 occurrence par million (le seuil déjà utilisé pour construire le dictionnaire)
OU si sa fréquence wordfreq (textes récents : web, sous-titres, Wikipédia…) atteint 2,0 sur l'échelle Zipf. Elles restent dans le dictionnaire et dans la boîte. Proposition, rien n'est appliqué.
Usage : python3 tools/cartes_ecartees.py <Lexique383.tsv>  ->  docs/le-qln-anagrammes-ecartees.xlsx"""
import csv, datetime, json, pathlib, sys, unicodedata
from openpyxl import load_workbook
from openpyxl.styles import Font, PatternFill, Alignment
csv.field_size_limit(10**9)
R = pathlib.Path(__file__).resolve().parent.parent
N = lambda w: "".join(c for c in unicodedata.normalize("NFD", str(w)) if unicodedata.category(c) != "Mn").upper().replace("Œ", "OE")
SEUIL, LIMITE = 0.3, 0.5   # Lexique : 0.3 = seuil « mot courant » déjà utilisé pour construire le dictionnaire
ZIPF, ZIPF_LIMITE = 2.0, 2.5  # wordfreq : 2,0 ≈ mot connu (rattrape « climatiser », « ralentisseur »… peu présents dans Lexique)
from wordfreq import zipf_frequency
fq, ortho = {}, {}
with open(sys.argv[1], encoding="utf-8") as f:
    for row in csv.DictReader(f, delimiter="\t"):
        n = N(row["ortho"]); v = float(row["freqfilms2"] or 0) + float(row["freqlivres"] or 0)
        if v >= fq.get(n, -1): ortho[n] = row["ortho"]
        fq[n] = max(fq.get(n, 0), v)
from wordfreq import top_n_list
ACC = {}
for x in top_n_list("fr", 400000):   # graphies accentuées connues de wordfreq (les cartes du tableau d'origine n'ont pas d'accents)
    ACC.setdefault(N(x), x)
def zipf(w):
    return max(zipf_frequency(w, "fr"), zipf_frequency(ortho.get(N(w), w), "fr"), zipf_frequency(ACC.get(N(w), w), "fr"))
d = json.loads((R / "app" / "data" / "fr.json").read_text(encoding="utf-8"))
wbd = load_workbook(R / "docs" / "le-qln-mots-douteux.xlsx", read_only=True)
douteux = {N(c) for ws in wbd.worksheets for r in ws.iter_rows(values_only=True) for c in r if isinstance(c, str) and c.isalpha()}
COUL = {"v": "Vert", "b": "Bleu", "r": "Rouge", "n": "Noir"}
ecart, limite = [], []
for k in "vbrn":
    for g in d[k]:
        m = max(fq.get(N(w), 0) for w in g); z = max(zipf(w) for w in g)
        ligne = [COUL[k], g[0], ", ".join(g[1:]), round(m, 2), round(z, 2), "oui" if any(N(w) in douteux for w in g) else "", ""]
        if m < SEUIL and z < ZIPF: ecart.append(ligne)
        elif m < LIMITE and z < ZIPF_LIMITE: limite.append(ligne)
wb = load_workbook(R / "docs" / "le-qln-anagrammes.xlsx")
def feuille(titre, lignes, pos, note):
    ws = wb.create_sheet(titre, pos)
    ws.append([note]); ws["A1"].font = Font(name="Arial", bold=True); ws.append([])
    ws.append(["Couleur", "Mot de la carte", "Autres anagrammes", "Lexique : mot le plus courant (occ./million)", "wordfreq : mot le plus courant (Zipf)", "Dans « mots douteux »", "Votre décision (garder / écarter)"])
    for c in ws[3]: c.font = Font(name="Arial", bold=True, color="FFFFFF"); c.fill = PatternFill("solid", fgColor="0F2A6B")
    for l in lignes: ws.append(l)
    for col, w in zip("ABCDEFG", [10, 20, 44, 16, 16, 13, 22]): ws.column_dimensions[col].width = w
    for row in ws.iter_rows(min_row=4):
        for c in row: c.font = Font(name="Arial"); c.alignment = Alignment(vertical="top", wrap_text=True)
        row[6].fill = PatternFill("solid", fgColor="FFF6D6")
    ws.freeze_panes = "A4"
feuille("Écartées (appli)", ecart, 0, f"{len(ecart)} cartes que l'appli ne tirerait plus : aucun mot n'est courant (Lexique < {SEUIL} par million et wordfreq < {ZIPF} Zipf). Elles restent dans la boîte et dans ce fichier.")
feuille("Limite (à décider)", limite, 1, f"{len(limite)} cartes limites (mot le plus courant peu fréquent : Lexique < {LIMITE} par million et wordfreq < {ZIPF_LIMITE} Zipf) : gardées par défaut, à votre appréciation.")
for ws in wb.worksheets: ws.sheet_view.tabSelected = False
wb.active = 0; wb.worksheets[0].sheet_view.tabSelected = True
out = R / "docs" / "le-qln-anagrammes-ecartees.xlsx"; wb.save(out)
idx = R / "docs" / "index.json"; docs = json.loads(idx.read_text(encoding="utf-8"))
e = {"titre": "Cartes écartées de l'appli (proposition)", "fichier": out.name, "date": datetime.date.today().isoformat(),
     "description": f"Dictionnaire français complet, avec en tête les {len(ecart)} cartes sans aucun mot courant que l'appli ne tirerait plus, et {len(limite)} cartes limites à décider."}
docs = [x for x in docs if x["fichier"] != e["fichier"]]; docs.insert(0, e)
idx.write_text(json.dumps(docs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(len(ecart), "écartées ;", len(limite), "limites ->", out.name)
for l in ecart: print("  ", l[0], l[1], "/", l[2], l[3])
