# Le-QLN — serveur relais multijoueur

Petit serveur Node (`ws`) : annuaire des salons ouverts + relais des messages entre les joueurs d'un salon.
Rien n'est stocké : un salon vit tant que son hôte est connecté.

## Déployer sur Render (recommandé pour commencer)
1. Render → **New → Web Service** → dépôt `Kiki78test/Le-QLN`.
2. Root Directory : `server` · Build : `npm install` · Start : `npm start` · plan Free.
   (ou **New → Blueprint** : le fichier `server/render.yaml` fait tout.)
3. Variable d'environnement `ORIGINES` = `https://kiki78test.github.io` (ajouter `http://localhost:8765` pour tester en local, séparés par des virgules). Vide = toutes les origines acceptées.
4. Une fois l'URL obtenue (ex. `https://le-qln-relais.onrender.com`), ouvrir `config.js` à la racine de l'appli et renseigner :
   `window.QLN_WS_URL = "wss://le-qln-relais.onrender.com/ws";`
5. Vérification : `https://le-qln-relais.onrender.com/sante` doit répondre `{"ok":true,…}`.

Note : sur le plan Free, Render endort le service après 15 min sans trafic ; la première connexion prend alors 20 à 40 s. Un plan Starter (7 $/mois) supprime cette latence.

## Cloudflare (alternative)
Les WebSockets avec état demandent un **Durable Object** (plan Workers payant, 5 $/mois). Le protocole est le même ; `index.js` est à adapter (handlers `fetch` + `webSocketMessage`). Je peux fournir cette version si vous préférez tout centraliser chez Cloudflare.

## Protocole (JSON)
- `{t:"annuaire"}` → reçoit `{t:"salons", liste:[…]}` à chaque changement · `{t:"annuaire-stop"}`
- `{t:"entrer", code, hote:true|false}` : rejoint le canal du salon (l'hôte le crée)
- `{t:"publier", resume:{…}}` (hôte) : met à jour la fiche visible dans l'annuaire
- `{t:"sortir"}` · tout autre message est relayé aux autres membres du salon
- Le serveur envoie `{t:"ferme"}` si l'hôte part, `{t:"quitter", de}` à l'hôte si un joueur part, `{t:"refus", raison:"introuvable"}` si le code n'existe pas.
