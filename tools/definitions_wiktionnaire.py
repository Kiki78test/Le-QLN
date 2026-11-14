"""Cherche une définition française sur le Wiktionnaire pour chaque mot de docs-src/mots-a-definir.json
([[mot du dictionnaire, graphie accentuée supposée], …]) -> docs-src/definitions.json {mot: {page, definition}|null}.
Par lots de 25 pages (contenu), puis recherche insensible aux accents pour les mots non trouvés (cartes du tableau
d'origine écrites sans accents). Lancé par l'action GitHub « Définitions (Wiktionnaire) » (site injoignable depuis l'atelier de Claude)."""
import json, pathlib, re, time, unicodedata, urllib.parse, urllib.request
R = pathlib.Path(__file__).resolve().parent.parent
API = "https://fr.wiktionary.org/w/api.php"
UA = {"User-Agent": "Le-QLN/1.0 (jeu d'anagrammes ; https://github.com/Kiki78test/AnagramX)", "Content-Type": "application/x-www-form-urlencoded"}
N = lambda w: "".join(c for c in unicodedata.normalize("NFD", w) if unicodedata.category(c) != "Mn").lower().replace("œ", "oe")
def api(**p):
    p.update(format="json", formatversion="2", maxlag="5")
    for essai in range(5):
        try:
            req = urllib.request.Request(API, data=urllib.parse.urlencode(p).encode(), headers=UA)
            with urllib.request.urlopen(req, timeout=60) as r: j = json.load(r)
            if "error" in j and j["error"].get("code") == "maxlag": time.sleep(5); continue
            return j
        except Exception: time.sleep(3 * (essai + 1))
    return {}
def definition(wt):
    m = re.search(r"==\s*\{\{langue\|fr\}\}\s*==(.*?)(?:\n==\s*\{\{langue\||\Z)", wt, re.S)
    if not m: return None
    for l in m.group(1).split("\n"):
        if re.match(r"^#(?![*:#])", l):
            t = l[1:]
            t = re.sub(r"\{\{(?:lien|l|w)\|([^|}]+)[^}]*\}\}", r"\1", t)
            t = re.sub(r"\{\{([^|}]+)(?:\|[^}]*)?\}\}", lambda x: f"({x.group(1)})" if len(x.group(1)) < 25 else "", t)
            t = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]", r"\1", t); t = re.sub(r"'{2,}", "", t); t = re.sub(r"<[^>]+>", "", t)
            t = re.sub(r"\s+", " ", t).strip()
            if len(t) > 3: return t[:240]
    return "(définition non lisible automatiquement)"
def contenus(titres):
    j = api(action="query", prop="revisions", rvprop="content", rvslots="main", titles="|".join(titres), redirects=1)
    q = j.get("query", {}); red = {x["from"]: x["to"] for x in q.get("redirects", []) + q.get("normalized", [])}
    pages = {p["title"]: p["revisions"][0]["slots"]["main"]["content"] for p in q.get("pages", []) if p.get("revisions")}
    return {t: (red.get(t, t), pages.get(red.get(t, red.get(red.get(t, t), t)))) for t in titres}
mots = json.loads((R / "docs-src" / "mots-a-definir.json").read_text(encoding="utf-8"))
res, manquants = {}, []
for i in range(0, len(mots), 25):
    lot = mots[i:i+25]; c = contenus(list(dict.fromkeys(a for _, a in lot)))
    for brut, acc in lot:
        page, wt = c.get(acc, (acc, None))
        if wt and "{{langue|fr}}" in wt: res[brut] = {"page": page, "definition": definition(wt)}
        else: manquants.append((brut, acc))
    if i % 500 == 0: print(i, "/", len(mots), flush=True)
for brut, acc in manquants:   # graphie sans accents, ou forme absente : recherche par titre insensible aux accents
    trouve = None
    cands = [brut.lower()] if brut.lower() != acc else []
    for h in api(action="query", list="search", srsearch=brut, srwhat="title", srlimit=10, srnamespace=0).get("query", {}).get("search", []):
        if N(h["title"]) == N(brut) and h["title"] not in cands: cands.append(h["title"])
    if cands:
        for t, (page, wt) in contenus(cands).items():
            if wt and "{{langue|fr}}" in wt: trouve = {"page": page, "definition": definition(wt)}; break
    res[brut] = trouve; time.sleep(.1)
(R / "docs-src" / "definitions.json").write_text(json.dumps(res, ensure_ascii=False, indent=0) + "\n", encoding="utf-8")
print(sum(1 for v in res.values() if v), "/", len(res), "mots trouvés")
