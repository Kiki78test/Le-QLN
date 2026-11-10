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

## Organisation du dépôt
Le jeu web est à la **racine** : GitHub Pages publie la racine telle quelle (`https://kiki78test.github.io/Le-QLN/`).

| Dossier / fichier | Contenu |
|---|---|
| racine : `index.html`, `*.js`, `sw.js`, `manifest.webmanifest`, `config.js`, `marque.json` | le jeu (socle + solo, plateau, multijoueur, comptes, progression, pubs, pages juridiques) |
| `data/` | dictionnaire français (`fr.json`) |
| `en/` | version anglaise **générée** (`python3 tools/build_en.py`) — ne pas modifier à la main |
| `icons/`, `fonts/`, `pubs/` | icônes, polices, spots publicitaires de démonstration (`pubs-src/` : leurs sources) |
| `server/` | serveur Node (Render) : relais multijoueur, API comptes/classements, anti-triche (`jour.js`) |
| `mobile/` | applis Android et iOS (Capacitor) ; réglages natifs dans `mobile/native/` |
| `docs/` | documentation (PDF, tableurs, `index.json` affiché dans le menu Documentation) |
| `docs-src/` | sources des documents (ex. `services.py` → `docs/services-externes.pdf`, `checklist.py` → `docs/check-list.pdf`) |
| `tools/` | outils : version anglaise, dictionnaires, pages juridiques, changement de nom |
| `tests/` | tests automatiques (serveur + appli dans Chromium) |
| `.github/workflows/` | automatismes : tests, version en ligne, sécurité, appli Android, appli iOS, changer le nom |
| `render.yaml` | Blueprint Render (serveur + base) |

Détails techniques (services, variables, base, API) : `docs/services-externes.pdf`.

Dictionnaire construit à partir de [Lexique 3.83](http://www.lexique.org) (New, Pallier et al., licence CC BY-SA 4.0).
