# Documents de travail du 8 novembre (mise en page propre à chacun) : en-tête et pied de page communs.
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from charte import habiller_existant
habiller_existant("propositions-regles.html", "propositions-regles.pdf", "Propositions de règles", "Adaptation numérique du jeu de plateau : constat chiffré et règles proposées · document de travail, à valider")
habiller_existant("solo-strategie-classement.html", "solo-strategie-classement.pdf", "Mode solo : stratégie, surprise et scénarios", "Dix propositions de règles pour le solo, et le classement en ligne international · document de travail, à valider")
