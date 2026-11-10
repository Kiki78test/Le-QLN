"""Assemble le site publié sur GitHub Pages dans _site/ : le jeu (app/) + la documentation (docs/, affichée par le menu
« Documentation » du jeu). L'adresse ne change pas : https://kiki78test.github.io/Le-QLN/ (publication par
.github/workflows/pages.yml). Aussi utilisé par les tests : python3 tools/site.py puis servir _site/."""
import pathlib, shutil
RACINE = pathlib.Path(__file__).resolve().parent.parent
SITE = RACINE / "_site"
shutil.rmtree(SITE, ignore_errors=True)
shutil.copytree(RACINE / "app", SITE, ignore=shutil.ignore_patterns("__pycache__", ".DS_Store"))
shutil.copytree(RACINE / "docs", SITE / "docs")
(SITE / ".nojekyll").write_text("")
n = sum(1 for p in SITE.rglob("*") if p.is_file())
print(f"_site/ : {n} fichiers (jeu + documentation)")
