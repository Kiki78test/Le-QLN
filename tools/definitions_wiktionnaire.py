"""Cherche une définition française sur le Wiktionnaire pour chaque mot de docs-src/mots-a-definir.json
([[mot du dictionnaire, graphie accentuée supposée], …]) -> docs-src/definitions.json {mot: {page, definition}|null}.
Lancé par l'action GitHub « Définitions (Wiktionnaire) » (le Wiktionnaire n'est pas joignable depuis l'atelier de Claude)."""
import json, pathlib, re, time, unicodedata, urllib.parse, urllib.request
R = pathlib.Path(__file__).resolve().parent.parent
API = "https://fr.wiktionary.org/w/api.php?"
UA = {"User-Agent": "Le-QLN/1.0 (jeu d'anagrammes ; https://github.com/Kiki78test/Le-QLN)"}
N = lambda w: "".join(c for c in unicodedata.normalize("NFD", w) if unicodedata.category(c) != "Mn").lower().replace("œ", "oe")
def api(**p):
    p.update(format="json", formatversion="2")
    with urllib.request.urlopen(urllib.request.Request(API + urllib.parse.urlencode(p), headers=UA), timeout=30) as r: return json.load(r)
def texte(page):
    try: return api(action="parse", page=page, prop="wikitext", redirects=1)["parse"]["wikitext"]
    except Exception: return None
def definition(wt):
    # section française seulement, première ligne de définition (« # … »), modèles et liens simplifiés
    m = re.search(r"==\s*\{\{langue\|fr\}\}\s*==(.*?)(?:\n==\s*\{\{langue\||\Z)", wt, re.S)
    if not m: return None
    for l in m.group(1).split("\n"):
        if re.match(r"^#(?![*:#])", l):
            t = l[1:]
            t = re.sub(r"\{\{(?:lien|l|w)\|([^|}]+)[^}]*\}\}", r"\1", t)
            t = re.sub(r"\{\{([^|}]+)(?:\|[^}]*)?\}\}", lambda x: f"({x.group(1)})" if len(x.group(1)) < 25 else "", t)
            t = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]", r"\1", t); t = re.sub(r"'{2,}", "", t); t = re.sub(r"<[^>]+>", "", t)
            t = re.sub(r"\s+", " ", t).strip()
            if len(t) > 3: return t[:300]
    return "(forme fléchie ou définition non trouvée dans la section française)"
mots = json.loads((R / "docs-src" / "mots-a-definir.json").read_text(encoding="utf-8"))
res = {}
for brut, acc in mots:
    trouve = None
    for cand in dict.fromkeys([acc, brut.lower()]):
        wt = texte(cand)
        if wt and "{{langue|fr}}" in wt: trouve = (cand, wt); break
    if not trouve:   # graphie inconnue (accents perdus) : recherche par titre, insensible aux accents
        try:
            for h in api(action="query", list="search", srsearch=brut, srwhat="title", srlimit=10, srnamespace=0)["query"]["search"]:
                if N(h["title"]) == N(brut):
                    wt = texte(h["title"])
                    if wt and "{{langue|fr}}" in wt: trouve = (h["title"], wt); break
        except Exception: pass
    res[brut] = {"page": trouve[0], "definition": definition(trouve[1])} if trouve else None
    print(brut, "->", res[brut]["page"] if trouve else "—"); time.sleep(.2)
(R / "docs-src" / "definitions.json").write_text(json.dumps(res, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(sum(1 for v in res.values() if v), "/", len(res), "mots trouvés")
