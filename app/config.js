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
// Tant que "actif" vaut false, l'appli garde la publicité de démonstration. Valeurs ci-dessous = annonces de TEST de Google.
// Pour passer en réel : remplacer les identifiants par ceux du compte AdMob, "test": false, "actif": true.
window.QLN_ADMOB = {
  "actif": false,
  "test": true,
  "android": {"appli": "ca-app-pub-3940256099942544~3347511713", "interstitiel": "ca-app-pub-3940256099942544/1033173712", "recompense": "ca-app-pub-3940256099942544/5224354917"},
  "ios": {"appli": "ca-app-pub-3940256099942544~1458002511", "interstitiel": "ca-app-pub-3940256099942544/4411468910", "recompense": "ca-app-pub-3940256099942544/1712485313"}
};
