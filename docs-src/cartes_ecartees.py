# Cartes françaises que l'appli ne tirerait plus (proposition) -> docs/cartes-ecartees.pdf
# Source : docs/le-qln-anagrammes-ecartees.xlsx (python3 tools/cartes_ecartees.py <Lexique383.tsv>)
import sys, pathlib, html
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from charte import document, T, B, RACINE
import dossiers
from openpyxl import load_workbook
wb = load_workbook(dossiers.chemin("le-qln-anagrammes-ecartees.xlsx"), read_only=True)
def lignes(nom):
    rows = list(wb[nom].iter_rows(values_only=True))
    return rows[0][0], [r for r in rows[3:] if r and r[0]]
import json
DEF = json.loads((RACINE / "docs-src" / "definitions.json").read_text(encoding="utf-8"))
def tableau(rs):
    return T([[r[0], f"<b>{html.escape(str(r[1]).upper())}</b>", html.escape(str(r[2] or "")), str(r[3]).replace(".", ","), str(r[4]).replace(".", ","), r[5] or "", r[6]] for r in rs],
             ["Couleur", "Mot de la carte", "Autres anagrammes", "Lexique (occ./M)", "wordfreq (Zipf)", "Mots douteux", "Mots définis"], [8, 19, 33, 11, 11, 9, 9])
def bilan(rs):
    mots = [w for r in rs for w in [r[1]] + [x.strip() for x in str(r[2] or "").split(",") if x.strip()]]
    sans = [w for w in mots if not DEF.get(w)]
    return len(mots), len(mots) - len(sans), sum(1 for r in rs if int(r[6].split("/")[0]) >= 2), sum(1 for r in rs if r[6].startswith("0/")), sans
n1, e = lignes("Écartées (appli)"); n2, l = lignes("Limite (à décider)")
h = ('<p class="intro">Certaines cartes ne contiennent aucun mot qu\'un joueur moyen connaît : celui qui les tire est sûr de perdre. '
     'Proposition : <b>les garder dans le dictionnaire et dans la boîte, mais ne plus les faire tirer dans l\'appli</b>. Rien n\'est encore appliqué.</p>')
h += B("Comment un mot est jugé « courant »", items=[
    "Fréquence Lexique 3.83 (films + livres) d'au moins 0,3 occurrence par million — le seuil déjà utilisé pour construire le dictionnaire ;",
    "<b>ou</b> fréquence wordfreq (textes récents : web, sous-titres, Wikipédia) d'au moins 2,0 sur l'échelle Zipf, qui rattrape des mots connus mais rares dans Lexique (climatiser, ralentisseur, urgentiste…).",
    "Une carte est écartée si <b>aucun</b> de ses mots n'est courant ; elle reste si au moins un mot l'est (ONDINISMES / DIMENSIONS reste : il suffit de trouver DIMENSIONS)."], classe="hl")
me, oke, c2e, c0e, sanse = bilan(e); ml, okl, c2l, c0l, sansl = bilan(l)
h += B("Définitions trouvées (Wiktionnaire, celui qu'utilise le bouton « Définition » du jeu)", items=[
    f"<b>Cartes écartées</b> : {oke} mots définis sur {me} ; {c2e} cartes sur {len(e)} ont au moins 2 mots définis ; {c0e} n'en ont aucun.",
    f"<b>Cartes limites</b> : {okl} mots définis sur {ml} ; {c2l} cartes sur {len(l)} ont au moins 2 mots définis ; {c0l} n'en ont aucun.",
    f"<b>{len(sanse) + len(sansl)} mots sans définition</b> : voir la section « Mots sans définition » en fin de document.",
    "Colonne « Mots définis » : nombre de mots de la carte ayant une définition. Les définitions complètes sont dans le tableur."])
h += f"<h2>Cartes écartées de l'appli ({len(e)})</h2>" + tableau(e)
h += f'<h2 class="pb">Cartes limites, gardées par défaut ({len(l)})</h2><p class="petit">Mot le plus connu peu fréquent : à votre appréciation.</p>' + tableau(l)
# section : tous les mots sans définition, avec leur carte
def sans_def(rs, statut):
    out = []
    for r in rs:
        mots = [r[1]] + [x.strip() for x in str(r[2] or "").split(",") if x.strip()]
        for w in mots:
            if not DEF.get(w):
                autres = [m for m in mots if m != w]
                definis = [m for m in autres if DEF.get(m)]
                out.append([html.escape(w), r[0], f"{html.escape(str(r[1]).upper())} / {html.escape(', '.join(autres) if w == r[1] else ', '.join(m for m in mots if m != w))}",
                            statut, ", ".join(html.escape(m) for m in definis) or "<span class='att'>aucun</span>"])
    return out
lignes_sd = sans_def(e, "écartée") + sans_def(l, "limite")
h += (f'<h2 class="pb">Mots sans définition ({len(lignes_sd)})</h2>'
      '<p>Mots introuvables sur le Wiktionnaire (le dictionnaire en ligne qu\'ouvre le bouton « Définition » du jeu). '
      'Certains sont des pluriels ou des féminins dont seule la forme de base a une page ; d\'autres n\'existent dans aucun dictionnaire usuel. '
      'Dernière colonne : les autres mots de la même carte qui, eux, ont une définition.</p>'
      + T(lignes_sd, ["Mot", "Couleur", "Carte", "Statut", "Mots définis de la carte"], [16, 9, 41, 10, 24]))
# annexe : tout le dictionnaire
FR = json.loads((RACINE / "app" / "data" / "fr.json").read_text(encoding="utf-8"))
COUL = {"v": "Vert", "b": "Bleu", "r": "Rouge", "n": "Noir"}
tous = [(k, w, g) for k in "vbrn" for g in FR[k] for w in g]
connus = [x for x in tous if x[1] in DEF]
sd = [x for x in connus if not DEF.get(x[1])]
if connus:
    par = {k: (sum(1 for x in connus if x[0] == k), sum(1 for x in sd if x[0] == k)) for k in "vbrn"}
    cartes_0 = [(k, g) for k in "vbrn" for g in FR[k] if all(w in DEF and not DEF[w] for w in g)]
    h += (f'<h2 class="pb">Tout le dictionnaire : mots sans définition ({len(sd)} sur {len(connus)})</h2>'
          + T([[COUL[k], str(par[k][0]), str(par[k][0] - par[k][1]), str(par[k][1]), f"{100 * (par[k][0] - par[k][1]) // max(1, par[k][0])} %"] for k in "vbrn"]
              + [["<b>Total</b>", str(len(connus)), str(len(connus) - len(sd)), str(len(sd)), f"<b>{100 * (len(connus) - len(sd)) // max(1, len(connus))} %</b>"]],
              ["Couleur", "Mots", "Avec définition", "Sans définition", "Couverture"], [20, 18, 22, 22, 18])
          + f'<p>{len(cartes_0)} carte(s) n\'ont aucun mot défini. Pour les autres, le bouton « Définition » du jeu trouve au moins un mot de la carte.</p>'
          + T([[html.escape(w), COUL[k], html.escape(" / ".join(g)), ", ".join(html.escape(m) for m in g if DEF.get(m)) or "<span class='att'>aucun</span>"] for k, w, g in sd],
              ["Mot sans définition", "Couleur", "Carte (tous ses mots)", "Mots définis de la carte"], [20, 9, 45, 26]))
h += B("Pour décider", "Dans le tableur « Cartes écartées de l'appli », dernière colonne de chaque onglet : « garder » ou « écarter ». Ou bien : « applique tel quel » (les cartes écartées ci-dessus ne sont plus tirées dans l'appli, les cartes limites restent).")
document("cartes-ecartees.pdf", "Cartes écartées de l'appli", f"Proposition : {len(e)} cartes sans aucun mot courant, {len(l)} cartes limites ; mots sans définition dans tout le dictionnaire.", h,
         description=f"Liste des {len(e)} cartes françaises sans aucun mot courant que l'appli ne tirerait plus (elles restent dans la boîte), et des {len(l)} cartes limites ; définitions trouvées au Wiktionnaire et liste de tous les mots du dictionnaire sans définition.")
