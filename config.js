/* Le-QLN — configuration (à adapter après le déploiement du serveur, voir server/README.md) */
// Adresse du serveur Le-QLN (Render). Vide = mode local : multijoueur entre onglets, pas de comptes ni de classements.
window.QLN_API_URL = "https://le-qln.onrender.com";                                   // ex. "https://le-qln.onrender.com"
// WebSocket du multijoueur : par défaut, le même serveur que l'API.
window.QLN_WS_URL = window.QLN_API_URL ? window.QLN_API_URL.replace(/^http/, "ws") + "/ws" : "";
// Connexion Google (facultatif) : identifiant client OAuth « Application Web ».
window.QLN_GOOGLE_CLIENT_ID = "";

// Appli Android (enveloppe Capacitor, dossier mobile/) : reconnue par son agent utilisateur.
window.QLN_NATIVE = /LeQLNApp\//.test(navigator.userAgent);
if(window.QLN_NATIVE){
  window.QLN_GOOGLE_CLIENT_ID = "";   // Google refuse sa connexion dans une vue web intégrée : e-mail + mot de passe seulement
  // premier lancement sur un téléphone qui n'est pas en français : version anglaise
  try{
    if(!localStorage.getItem("qln:langue-native")){
      localStorage.setItem("qln:langue-native", "1");
      if(!/^fr/i.test(navigator.language || "") && !/\/en\//.test(location.pathname)) location.replace(location.pathname.replace(/[^/]*$/, "") + "en/" + location.search);
    }
  }catch(e){}
}
