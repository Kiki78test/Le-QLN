"""Rangement de la documentation : docs/<dossier>/<fichier>, et onglet Documentation de l'appli groupé par dossier.
Utilisé par docs-src/charte.py (PDF) et par les outils qui écrivent des tableurs (tools/*.py).
Pour ranger un nouveau document : l'ajouter dans RANGEMENT (sinon il va dans « Divers »)."""
import json, pathlib
RACINE = pathlib.Path(__file__).resolve().parent.parent
DOCS = RACINE / "docs"

# ordre d'affichage des dossiers dans l'onglet Documentation
DOSSIERS = {
    "jeu": "Le jeu",
    "suivi": "Suivi du projet",
    "listes-de-mots": "Listes de mots",
    "publication": "Publication (stores, applis, textes légaux)",
    "publicite": "Publicité",
    "technique": "Technique et administration",
    "divers": "Divers",
}
RANGEMENT = {
    "regles-du-jeu.pdf": "jeu", "fonctionnalites.pdf": "jeu",
    "check-list.pdf": "suivi", "aide-choix-du-nom.pdf": "suivi",
    "listes-de-mots.pdf": "listes-de-mots", "le-qln-anagrammes.xlsx": "listes-de-mots", "cartes-ecartees.pdf": "listes-de-mots",
    "le-qln-anagrammes-ecartees.xlsx": "listes-de-mots", "le-qln-mots-douteux.xlsx": "listes-de-mots", "le-qln-anglais.xlsx": "listes-de-mots",
    "le-qln-langues.xlsx": "listes-de-mots", "le-qln-themes.xlsx": "listes-de-mots",
    "fiches-des-stores.pdf": "publication", "publication-google-play.pdf": "publication", "version-apple.pdf": "publication", "textes-juridiques.pdf": "publication",
    "publicite-admob.pdf": "publicite", "monetisation-publicitaire.pdf": "publicite",
    "services-externes.pdf": "technique", "administration-et-surveillance.pdf": "technique", "mise-en-ligne-serveur.pdf": "technique",
}

def dossier(nom):
    return RANGEMENT.get(pathlib.Path(nom).name, "divers")

def chemin(nom):
    """Chemin d'écriture d'un document (le dossier est créé au besoin)."""
    nom = pathlib.Path(nom).name
    d = DOCS / dossier(nom); d.mkdir(parents=True, exist_ok=True)
    return d / nom

def relatif(nom):
    nom = pathlib.Path(nom).name
    return f"{dossier(nom)}/{nom}"

def lire_index():
    return json.loads((DOCS / "index.json").read_text(encoding="utf-8"))

def entree_de(index, nom):
    nom = pathlib.Path(nom).name
    return next((x for x in index if pathlib.Path(x["fichier"]).name == nom), None)

def indexer(nom, titre, description, date_iso):
    """Ajoute ou met à jour l'entrée d'un document dans docs/index.json (avec son dossier)."""
    idx = DOCS / "index.json"; index = lire_index()
    e = {"titre": titre, "fichier": relatif(nom), "dossier": dossier(nom), "rubrique": DOSSIERS[dossier(nom)], "date": date_iso, "description": description}
    ancien = entree_de(index, nom)
    if ancien: index[index.index(ancien)] = e
    else: index.insert(0, e)
    ordre = list(DOSSIERS)
    index.sort(key=lambda x: ordre.index(x.get("dossier", "divers")) if x.get("dossier", "divers") in ordre else 99)
    idx.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
