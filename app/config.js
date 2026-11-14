/* Le-QLN — configuration (à adapter après le déploiement du serveur, voir server/README.md) */
// Adresse du serveur Le-QLN (Render). Vide = mode local : multijoueur entre onglets, pas de comptes ni de classements.
window.QLN_API_URL = "https://le-qln.onrender.com";                                   // ex. "https://le-qln.onrender.com"
// WebSocket du multijoueur : par défaut, le même serveur que l'API.
window.QLN_WS_URL = window.QLN_API_URL ? window.QLN_API_URL.replace(/^http/, "ws") + "/ws" : "";
// Connexion Google (facultatif) : identifiant client OAuth « Application Web ».
window.QLN_GOOGLE_CLIENT_ID = "";

// Adresse publique du jeu : liens partagés depuis l'appli iOS (où le jeu est embarqué, donc sans adresse web).
window.QLN_SITE_URL = "https://kiki78test.github.io/Le-QLN/";
// Applis Android et iOS (enveloppe Capacitor, dossier mobile/) : reconnues par leur agent utilisateur.
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

// Publicité réelle des applis (Google AdMob). Source unique : lue aussi par les scripts de fabrication des applis
// (identifiant d'appli dans le manifeste Android et dans l'Info.plist iOS). Les identifiants AdMob ne sont pas secrets.
// Tant que "actif" vaut false, l'appli garde la publicité de démonstration.
// 14/11/2026 : identifiants Android et iOS du compte AdMob en place, "test": true (annonces de test) jusqu'à la publication
// sur les stores. À la publication : "test": false.
window.QLN_ADMOB = {
  "actif": true,
  "test": true,
  "android": {"appli": "ca-app-pub-7431558919533251~1206564943", "interstitiel": "ca-app-pub-7431558919533251/6382870001", "recompense": "ca-app-pub-7431558919533251/7627843923"},
  "ios": {"appli": "ca-app-pub-7431558919533251~7422674849", "interstitiel": "ca-app-pub-7431558919533251/8749353904", "recompense": "ca-app-pub-7431558919533251/5173730110"}
};
