# Le-QLN — serveur (multijoueur + comptes + classements)

Un seul service Node :
- **Relais multijoueur** (WebSocket `/ws`) : annuaire des salons ouverts et relais des messages d'un salon.
- **API** (`/api/…`, activée si `DATABASE_URL` est définie) : comptes (e-mail + mot de passe, Google en option), progression synchronisée entre appareils, scores et classements (monde / pays, défi du jour, Défi, Braquage).

Les tables sont créées automatiquement au démarrage (préfixe `qln_`), y compris dans une base déjà utilisée par une autre appli.

## Déployer sur Render (≈ 10 min)

1. **Base de données** : utilisez votre PostgreSQL Render existante (les tables `qln_*` ne touchent à rien d'autre) ou créez-en une.
   Copiez son **Internal Database URL**.
2. **Service web** : Render → *New → Web Service* → dépôt `Kiki78test/Le-QLN`.
   - Root Directory : `server`
   - Build Command : `npm install` · Start Command : `npm start`
   - Instance : Starter (pas de mise en veille) ou Free pour tester
   - Health Check Path : `/sante`
3. **Variables d'environnement** du service :

   | Variable | Valeur |
   |---|---|
   | `DATABASE_URL` | l'Internal Database URL de l'étape 1 |
   | `SECRET` | une longue chaîne aléatoire (bouton *Generate* de Render) |
   | `ORIGINES` | `https://kiki78test.github.io` |
   | `GOOGLE_CLIENT_ID` | (facultatif) identifiant OAuth « Application Web » de Google Cloud |

4. Une fois en ligne, vérifiez `https://<votre-service>.onrender.com/sante` → `{"ok":true, … "api":true}`.
5. Dans l'appli, ouvrez **`config.js`** (racine du dépôt) et renseignez :
   ```js
   window.QLN_API_URL = "https://<votre-service>.onrender.com";
   ```
   (le WebSocket du multijoueur en est déduit automatiquement). Poussez : comptes, classements et multijoueur en ligne s'activent.

### Connexion Google (facultatif)
Google Cloud Console → *API et services → Identifiants → Créer un ID client OAuth → Application Web*,
origine JavaScript autorisée : `https://kiki78test.github.io`. Mettez l'identifiant dans `GOOGLE_CLIENT_ID` (Render)
**et** dans `window.QLN_GOOGLE_CLIENT_ID` (`config.js`).

## API

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/api/inscription` | `{email, mdp, pseudo, pays?, couleur?}` → `{jeton, joueur}` |
| POST | `/api/connexion` | `{email, mdp}` → `{jeton, joueur}` |
| POST | `/api/google` | `{credential}` (jeton Google) → `{jeton, joueur}` |
| GET / PATCH / DELETE | `/api/moi` | profil (pseudo, pion, pays) ; DELETE efface le compte et ses scores |
| GET / PUT | `/api/progression?langue=fr` | progression (fusion : meilleur des deux appareils) |
| POST | `/api/scores` | `{mode: jour|defi|braquage, langue, score, jour?}` — au défi du jour, seul le 1er essai compte |
| GET | `/api/classement?mode=jour&langue=fr&pays=FR&periode=semaine` | top 50 + rang du joueur connecté |

Authentification : en-tête `Authorization: Bearer <jeton>` (jeton signé HMAC, valable 90 jours).
Protections : mots de passe hachés (bcrypt), limitation du nombre de tentatives par IP, CORS limité à `ORIGINES`,
scores bornés et défi du jour accepté seulement pour la date en cours (± 36 h).

## Limites connues
- Les scores sont calculés par l'appli : un joueur très motivé pourrait en envoyer de faux. Parade prévue : recalcul côté serveur du défi du jour (cartes identiques pour tous) à partir des mots trouvés.
- Pas encore de « mot de passe oublié » (nécessite un service d'e-mail, par ex. Resend).
- Comptes de mineurs : l'appli demande l'accord d'un parent sous 15 ans ; à faire valider juridiquement (RGPD).
