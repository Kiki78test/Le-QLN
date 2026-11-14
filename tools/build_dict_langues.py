"""Dictionnaires d'anagrammes des séries « autres langues » (espagnol, allemand, italien) -> data/langues/<code>.json
Même format que data/fr.json : {"v":[[mots…],…], "b":…, "r":…, "n":…} ; premier mot de chaque groupe = mot le plus courant.
Sources libres : fréquences wordfreq (échelle Zipf) et lemmatiseur simplemma (formes de base seulement : pas de pluriels
ni de conjugaisons, comme pour le français et l'anglais). Les noms propres sont écartés (mot inconnu du lemmatiseur).
Règles communes : 4 lettres minimum ; vert 4-5, bleu 6-7, rouge 8-9, noir 10 et + ; une carte = au moins 2 mots courants.
Usage : pip install wordfreq simplemma ; python3 tools/build_dict_langues.py
Ces dictionnaires ne servent qu'aux séries de langue (cartes jouées pour le plaisir, sans classement)."""
import sys as _s, pathlib as _p; _s.path.insert(0, str(_p.Path(__file__).resolve().parent.parent / "docs-src")); import dossiers
import json, pathlib, unicodedata
from collections import defaultdict
from wordfreq import top_n_list, zipf_frequency
import simplemma

RACINE = pathlib.Path(__file__).resolve().parent.parent
SORTIE = RACINE / "app" / "data" / "langues"
LANGUES = ["es", "de", "it"]
ACCEPTE, COURANT = 2.5, 3.2      # Zipf : mot accepté / mot « courant » (cible d'une carte)
# mots grossiers ou choquants écartés (liste volontairement large)
BLOQUES = {
    "es": "pajero pajera paja pajas puta puto putas putos mierda coño cojón cojones polla pene vagina culo culos joder follar marica maricón zorra cabrón verga teta tetas pedo nazi violar violación sexo semen orgasmo".split(),
    "de": "arsch scheiße scheisse ficken fick hure nutte schwanz fotze titte titten penis vagina sperma wichser nazi nazis vergewaltigen sex orgasmus schlampe".split(),
    "it": "cazzo cazzi culo culi merda puttana troia figa fica scopare stronzo stronza pene vagina sperma tette tetta nazi stuprare stupro sesso orgasmo frocio coglione".split(),
}


# mots retirés après relecture du tableur docs/le-qln-langues.xlsx (colonne « retirer »)
EXCLUS = {"es": set(), "de": set(), "it": set()}


def sans_accent(w):
    return "".join(c for c in unicodedata.normalize("NFD", w) if unicodedata.category(c) != "Mn").upper()


def forme_de_base(w, lang):
    """Vrai si le mot est sa propre forme de base (en allemand, les noms ont une majuscule)."""
    for f in (w, w.capitalize()):
        l = simplemma.lemmatize(f, lang=lang)
        if l.lower() == w:
            return True
    return False


def affichage(w, lang):
    """Forme écrite : en allemand, majuscule aux noms (d'après le lemmatiseur)."""
    if lang == "de" and simplemma.lemmatize(w.capitalize(), lang=lang) == w.capitalize() and simplemma.lemmatize(w, lang=lang) != w:
        return w.capitalize()
    return w


def niveau(n): return "v" if n <= 5 else "b" if n <= 7 else "r" if n <= 9 else "n"


def construire(lang):
    mots = {}
    for w in top_n_list(lang, 120000):
        if not w.isalpha() or not w.islower() or len(w) < 4 or len(w) > 13 or "ß" in w: continue
        if w in BLOQUES[lang] or w in EXCLUS[lang] or any(b in w for b in BLOQUES[lang] if len(b) >= 5): continue
        z = zipf_frequency(w, lang)
        if z < ACCEPTE: continue
        if zipf_frequency(w, "en") > z + 0.3: continue    # mots anglais employés tels quels (break, credit, online…)
        if not simplemma.is_known(w, lang) and not simplemma.is_known(w.capitalize(), lang): continue   # noms propres, sigles
        cle = sans_accent(w)
        if not cle.isascii() or not cle.isalpha(): continue
        mots[w] = (z, forme_de_base(w, lang))
    groupes = defaultdict(list)
    for w, (z, b) in mots.items(): groupes["".join(sorted(sans_accent(w)))].append((w, z, b))
    out = {"v": [], "b": [], "r": [], "n": []}
    for cle, lst in groupes.items():
        # mots identiques sans accents (ex. « papa » / « papá ») : on garde le plus courant
        vus = {}
        for w, z, b in sorted(lst, key=lambda x: -x[1]): vus.setdefault(sans_accent(w), (w, z, b))
        lst = list(vus.values())
        if len(lst) < 2: continue
        if sum(1 for _, z, b in lst if b and z >= COURANT) < 2: continue
        lst.sort(key=lambda x: (not x[2], -x[1]))
        out[niveau(len(cle))].append([affichage(w, lang) for w, _, _ in lst])
    for k in out: out[k].sort(key=lambda g: g[0].lower())
    SORTIE.mkdir(parents=True, exist_ok=True)
    (SORTIE / f"{lang}.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(lang, {k: len(v) for k, v in out.items()})
    return out


NOMS = {"es": "Espagnol", "de": "Allemand", "it": "Italien"}
NIVEAUX = {"v": "Vert (4-5 lettres)", "b": "Bleu (6-7)", "r": "Rouge (8-9)", "n": "Noir (10 et +)"}


def tableur(tout):
    """docs/le-qln-langues.xlsx : une feuille par langue, un groupe d'anagrammes par ligne, colonne « retirer » à remplir."""
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment
    wb = Workbook(); wb.remove(wb.active)
    l = wb.create_sheet("Lisez-moi")
    for ligne in ["Séries « autres langues » : groupes d'anagrammes de chaque langue (1 ligne = 1 carte possible).",
                  "Pour retirer un mot : écrivez-le dans la colonne « Mots à retirer » (plusieurs : séparés par des virgules).",
                  "Pour retirer toute la carte : mettez x dans « Retirer la carte ».",
                  "Renvoyez le fichier : les mots seront exclus et les dictionnaires régénérés.",
                  "Exemple — Mots à retirer : « Alster » ; Retirer la carte : (vide)."]:
        l.append([ligne])
    l.column_dimensions["A"].width = 110; l["A1"].font = Font(name="Arial", bold=True)
    for lang, out in tout.items():
        ws = wb.create_sheet(NOMS[lang])
        ws.append(["Niveau", "Mot de la carte", "Autres anagrammes", "Mots à retirer", "Retirer la carte"])
        for c in ws[1]: c.font = Font(name="Arial", bold=True, color="FFFFFF"); c.fill = PatternFill("solid", fgColor="0F2A6B")
        for k in "vbrn":
            for g in out[k]: ws.append([NIVEAUX[k], g[0], ", ".join(g[1:]), "", ""])
        for col, w in zip("ABCDE", [18, 22, 60, 26, 16]): ws.column_dimensions[col].width = w
        for row in ws.iter_rows(min_row=2):
            for c in row: c.font = Font(name="Arial"); c.alignment = Alignment(vertical="top", wrap_text=True)
            for c in row[3:]: c.fill = PatternFill("solid", fgColor="FFF6D6")
        ws.freeze_panes = "A2"; ws.auto_filter.ref = ws.dimensions
    wb.save(dossiers.chemin("le-qln-langues.xlsx"))
    import datetime
    dossiers.indexer("le-qln-langues.xlsx", "Séries en espagnol, allemand, italien",
                     "Cartes des séries de langue (une ligne par carte) : indiquer les mots à retirer ou mettre x pour retirer une carte.", datetime.date.today().isoformat())
    print("docs/" + dossiers.relatif("le-qln-langues.xlsx"))


if __name__ == "__main__":
    tableur({l: construire(l) for l in LANGUES})
