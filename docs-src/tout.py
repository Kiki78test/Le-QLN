# Régénère tous les documents de docs/ avec la charte commune (à lancer après un changement de nom, par exemple).
import pathlib, subprocess, sys
ICI = pathlib.Path(__file__).resolve().parent
for f in ["fonctionnalites.py", "regles.py", "services.py", "checklist.py", "serveur_et_publicite.py", "version_apple.py", "choix_du_nom.py", "idees_de_noms.py", "monetisation.py", "anciens.py"]:
    subprocess.run([sys.executable, str(ICI / f)], check=True)
subprocess.run([sys.executable, str(ICI.parent / "tools" / "build_legal.py")], check=True)
