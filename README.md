# Le-QLN — le jeu d'anagrammes

Adaptation en appli web installable du jeu de plateau **Le-QLN** (2 à 6 joueurs, dès 12 ans).

## Modes
- **Le Défi** : 10 cartes du vert au noir, 3 vies, cases spéciales du tapis (Bonus, Malus, Passe, Prison).
- **Défi du jour** : mêmes cartes pour tous, score à partager.
- **Entraînement** : choix de la couleur, sablier optionnel.
- **Contre l'IA** : le tapis complet de 2 à 6 joueurs (1 à 5 IA, 3 niveaux), enchères, prison, cases CD, gains cachés.
- À venir : multijoueur.

## Niveaux
| Couleur | Lettres | Gain | Sablier |
|---|---|---|---|
| Vert | 4–5 | 20 € | 30 s |
| Bleu | 6–7 | 50 € | 1 min |
| Rouge | 8–9 | 100 € | 2 min |
| Noir | 10 et + | 200 € | 3 min |

## Fichiers
- `index.html` : socle commun et mode solo (HTML, CSS, JS)
- `plateau.js` : mode contre l'IA (plateau, moteur de partie, IA)
- `manifest.webmanifest`, `sw.js`, `icons/` : installation et jeu hors connexion
- `data/fr.json` : dictionnaire d'anagrammes français
- `docs/` : documentation (PDF + `index.json`, affichée dans le menu Documentation)
- `docs-src/` + `tools/pdf.js` : sources HTML des PDF ; générer avec `node tools/pdf.js docs-src/x.html docs/x.pdf` (polices : `npm i @fontsource/bebas-neue @fontsource/barlow-condensed @fontsource/barlow` dans `fonts/`)
- `tools/build_dict.py` : régénère `data/fr.json` à partir de Lexique 3.83 et du tableau de cartes de l'auteur

Dictionnaire construit à partir de [Lexique 3.83](http://www.lexique.org) (New, Pallier et al., licence CC BY-SA 4.0).
