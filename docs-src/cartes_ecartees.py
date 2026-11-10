# Cartes françaises que l'appli ne tirerait plus (proposition) -> docs/cartes-ecartees.pdf
# Source : docs/le-qln-anagrammes-ecartees.xlsx (python3 tools/cartes_ecartees.py <Lexique383.tsv>)
import sys, pathlib, html
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from charte import document, T, B, RACINE
from openpyxl import load_workbook
wb = load_workbook(RACINE / "docs" / "le-qln-anagrammes-ecartees.xlsx", read_only=True)
def lignes(nom):
    rows = list(wb[nom].iter_rows(values_only=True))
    return rows[0][0], [r for r in rows[3:] if r and r[0]]
def tableau(rs):
    return T([[r[0], f"<b>{html.escape(str(r[1]).upper())}</b>", html.escape(str(r[2] or "")), str(r[3]).replace(".", ","), str(r[4]).replace(".", ","), r[5] or ""] for r in rs],
             ["Couleur", "Mot de la carte", "Autres anagrammes", "Lexique (occ./M)", "wordfreq (Zipf)", "Mots douteux"], [9, 20, 37, 12, 12, 10])
n1, e = lignes("Écartées (appli)"); n2, l = lignes("Limite (à décider)")
h = ('<p class="intro">Certaines cartes ne contiennent aucun mot qu\'un joueur moyen connaît : celui qui les tire est sûr de perdre. '
     'Proposition : <b>les garder dans le dictionnaire et dans la boîte, mais ne plus les faire tirer dans l\'appli</b>. Rien n\'est encore appliqué.</p>')
h += B("Comment un mot est jugé « courant »", items=[
    "Fréquence Lexique 3.83 (films + livres) d'au moins 0,3 occurrence par million — le seuil déjà utilisé pour construire le dictionnaire ;",
    "<b>ou</b> fréquence wordfreq (textes récents : web, sous-titres, Wikipédia) d'au moins 2,0 sur l'échelle Zipf, qui rattrape des mots connus mais rares dans Lexique (climatiser, ralentisseur, urgentiste…).",
    "Une carte est écartée si <b>aucun</b> de ses mots n'est courant ; elle reste si au moins un mot l'est (ONDINISMES / DIMENSIONS reste : il suffit de trouver DIMENSIONS)."], classe="hl")
h += f"<h2>Cartes écartées de l'appli ({len(e)})</h2>" + tableau(e)
h += f'<h2 class="pb">Cartes limites, gardées par défaut ({len(l)})</h2><p class="petit">Mot le plus connu peu fréquent : à votre appréciation.</p>' + tableau(l)
h += B("Pour décider", "Dans le tableur « Cartes écartées de l'appli », dernière colonne de chaque onglet : « garder » ou « écarter ». Ou bien : « applique tel quel » (les cartes écartées ci-dessus ne sont plus tirées dans l'appli, les cartes limites restent).")
document("cartes-ecartees.pdf", "Cartes écartées de l'appli", f"Proposition : {len(e)} cartes sans aucun mot courant, {len(l)} cartes limites.", h,
         description=f"Liste des {len(e)} cartes françaises sans aucun mot courant que l'appli ne tirerait plus (elles restent dans la boîte), et des {len(l)} cartes limites ; méthode et décision à prendre.")
