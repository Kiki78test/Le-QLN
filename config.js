/* Le-QLN — configuration (à adapter après le déploiement du serveur, voir server/README.md) */
// Adresse du serveur Le-QLN (Render). Vide = mode local : multijoueur entre onglets, pas de comptes ni de classements.
window.QLN_API_URL = "";                                   // ex. "https://le-qln.onrender.com"
// WebSocket du multijoueur : par défaut, le même serveur que l'API.
window.QLN_WS_URL = window.QLN_API_URL ? window.QLN_API_URL.replace(/^http/, "ws") + "/ws" : "";
// Connexion Google (facultatif) : identifiant client OAuth « Application Web ».
window.QLN_GOOGLE_CLIENT_ID = "";
