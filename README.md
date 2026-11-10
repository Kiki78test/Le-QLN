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
Le jeu web est dans **`app/`**. Il est publié sur GitHub Pages par l'action « Publication du site » (`.github/workflows/pages.yml`), à la même adresse : `https://kiki78test.github.io/Le-QLN/` (la documentation `docs/` y est ajoutée par `tools/site.py`).

| Dossier / fichier | Contenu |
|---|---|
| `app/` : `index.html`, `*.js`, `sw.js`, `manifest.webmanifest`, `config.js`, pages juridiques | le jeu (socle + solo, plateau, multijoueur, comptes, progression, séries, pubs) |
| `marque.json` | nom du jeu, sigle de l'icône, coordonnées de l'éditeur (source unique) |
| `app/data/` | dictionnaires : français (`fr.json`), thèmes, autres langues des séries (`langues/`) |
| `app/en/` | version anglaise **générée** (`python3 tools/build_en.py`) — ne pas modifier à la main |
| `app/icons/`, `app/fonts/`, `app/pubs/` | icônes, polices, spots publicitaires de démonstration (`pubs-src/` : leurs sources) |
| `server/` | serveur Node (Render) : relais multijoueur, API comptes/classements, anti-triche (`jour.js`) |
| `mobile/` | applis Android et iOS (Capacitor) ; réglages natifs dans `mobile/native/` |
| `docs/` | documentation (PDF, tableurs, `index.json` affiché dans le menu Documentation) |
| `docs-src/` | sources des documents : un script par PDF, tous habillés par la charte commune `charte.py` (en-tête au logo du jeu, polices, pied de page) ; `python3 docs-src/tout.py` régénère tout |
| `tools/` | outils : version anglaise, dictionnaires, pages juridiques, changement de nom |
| `store/` | fiches Google Play / App Store : textes FR/EN, captures, bannière, icône, questionnaires (générés : `node tools/store_captures.js` puis `python3 tools/build_store.py`) |
| `tests/` | tests automatiques (serveur + appli dans Chromium) |
| `.github/workflows/` | automatismes : publication du site, tests, version en ligne, sécurité, appli Android, appli iOS, changer le nom |
| `render.yaml` | Blueprint Render (serveur + base) |

Détails techniques (services, variables, base, API) : `docs/services-externes.pdf`.

Dictionnaire construit à partir de [Lexique 3.83](http://www.lexique.org) (New, Pallier et al., licence CC BY-SA 4.0).
