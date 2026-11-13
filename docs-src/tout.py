# Régénère tous les documents de docs/ avec la charte commune (à lancer après un changement de nom, par exemple).
import pathlib, subprocess, sys
ICI = pathlib.Path(__file__).resolve().parent
for f in ["fonctionnalites.py", "regles.py", "services.py", "checklist.py", "serveur_et_publicite.py", "version_apple.py", "monetisation.py", "anciens.py", "cartes_ecartees.py", "publication_android.py", "publicite_admob.py", "administration.py"]:
    subprocess.run([sys.executable, str(ICI / f)], check=True)
subprocess.run([sys.executable, str(ICI.parent / "tools" / "build_legal.py")], check=True)
# fiches des stores : seulement si les captures brutes existent (sinon : node tools/store_captures.js d'abord)
if (ICI.parent / "store" / "captures" / "brutes" / "fr").exists():
    subprocess.run([sys.executable, str(ICI.parent / "tools" / "build_store.py")], check=True)
