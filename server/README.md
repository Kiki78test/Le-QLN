# Le-QLN — serveur (multijoueur + comptes + classements)

Un seul service Node :
- **Relais multijoueur** (WebSocket `/ws`) : annuaire des salons ouverts et relais des messages d'un salon.
- **API** (`/api/…`, activée si `DATABASE_URL` est définie) : comptes (e-mail + mot de passe, Google en option), progression synchronisée entre appareils, scores et classements (monde / pays, défi du jour, Défi, Braquage).

Les tables sont créées automatiquement au démarrage (préfixe `qln_`), y compris dans une base déjà utilisée par une autre appli.

## Déployer sur Render (une seule fois, ≈ 5 min)

Le fichier **`render.yaml`** à la racine du dépôt décrit tout le service (Blueprint).

1. Render → **New → Blueprint** → dépôt `Kiki78test/Le-QLN` → Render lit `render.yaml`.
2. Il ne demande qu'une valeur : **`DATABASE_URL`** = l'**External Database URL** de votre PostgreSQL Render
   (celle d'Airmony convient : les tables `qln_*` ne touchent à rien d'autre). `SECRET` est générée automatiquement.
3. **Apply**. Une fois « Live », vérifiez `https://le-qln.onrender.com/sante` → `{"ok":true, … "api":true}`.
4. Dans `config.js` (racine du dépôt) : `window.QLN_API_URL = "https://le-qln.onrender.com";` puis poussez.

Ensuite tout est automatique :
- chaque envoi sur GitHub lance les **tests** (onglet Actions → « Tests ») ;
- Render ne **redéploie** le serveur que si `server/` (ou `analyse.js`) a changé **et** que les tests sont passés ;
- après chaque mise en ligne du site, l'appli publiée est testée, et toutes les 6 h le site et le serveur sont vérifiés (« Version en ligne ») ;
- en cas d'échec, GitHub vous envoie un e-mail.

Instance : `free` pour les essais (s'endort après 15 min sans visite), à passer en `starter` (7 $/mois) dans `render.yaml` à l'ouverture au public.

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
