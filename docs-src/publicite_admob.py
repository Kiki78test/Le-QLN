# Vraies publicités dans les applis (Google AdMob) -> docs/publicite-admob.pdf
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from charte import document, T, B, L
h = '<p class="intro">Tout est prêt dans les applis Android et iOS pour afficher de vraies publicités Google AdMob. Il ne manque que vos identifiants AdMob : tant qu\'ils ne sont pas saisis, l\'appli garde la publicité de démonstration (et la barre « Pub / No Pub » reste en place).</p>'
h += "<h2>1. Ce qui est prêt</h2>" + T([
    ["Module", "AdMob pour Capacitor (<code>@capacitor-community/admob</code>) dans les deux applis."],
    ["Emplacements", "Les mêmes que la démonstration : une vidéo plein écran entre deux parties (jamais à la première de la session, au plus une toutes les 3 min) ou toutes les 5 cartes, et la vidéo récompense à l'initiative du joueur. <b>Jamais pendant un sablier.</b> Pas de bandeau avec la vraie régie (plus discret)."],
    ["Repli", "Hors ligne, ou si aucune annonce n'est disponible, l'appli montre les créations de démonstration : le joueur obtient toujours sa récompense."],
    ["Consentement RGPD", "Formulaire officiel de Google (UMP) au premier lancement ; menu <b>« Choix publicitaires »</b> pour changer d'avis à tout moment."],
    ["iPhone", "Demande de suivi Apple (ATT) après le consentement, texte d'explication en français, réseau publicitaire Google déclaré (SKAdNetwork)."],
    ["Identifiants", "Source unique : <code>app/config.js</code> (<code>QLN_ADMOB</code>). Les scripts de fabrication y lisent l'identifiant d'appli (manifeste Android, Info.plist iOS). Valeurs actuelles : <b>annonces de test de Google</b>."],
    ["Confidentialité", "Texte « publicité réelle » déjà rédigé (FR/EN) : il remplace le texte actuel dès que <code>marque.json</code> contient <code>\"pub_reelle\": true</code>."],
    ["app-ads.txt", "Modèle prêt : <code>store/app-ads.txt</code>."]], ["Élément", "Détail"], [20, 80])
h += "<h2>2. Ce qu'il vous reste à faire (après la validation d'AdMob)</h2>" + L([
    "<b>AdMob → Applications</b> : ajouter l'appli Android (puis l'appli iOS quand elle existe dans App Store Connect). Noter l'<b>identifiant d'appli</b> (ca-app-pub-…~…).",
    "<b>Blocs d'annonces</b> pour chaque appli : un <b>Interstitiel</b> et un <b>Avec récompense</b>. Noter leurs identifiants (ca-app-pub-…/…).",
    "<b>Confidentialité et messages</b> → RGPD : créer le message de consentement (Europe) et le publier ; pour iOS, activer aussi le message « IDFA » (explication avant la fenêtre Apple).",
    "<b>M'envoyer les identifiants</b> (ils ne sont pas secrets) : identifiant d'appli et des 2 blocs, pour Android et iOS, plus votre identifiant d'éditeur (pub-…). Je les mets dans <code>config.js</code>, je passe <code>pub_reelle</code> à true (politique de confidentialité), puis je relance la fabrication des applis.",
    "<b>app-ads.txt</b> : il doit être à la racine du site déclaré dans les fiches des stores. Il faudra donc votre domaine (Cloudflare, après le choix du nom).",
    "<b>Fiches des stores</b> : cocher « Contient des annonces » et ajouter les lignes AdMob du questionnaire Sécurité des données (déjà rédigées dans « Fiches des stores »)."])
h += B("Et le site web ?", "Le site n'affiche que la démonstration : AdMob ne fonctionne que dans les applis. Une régie web (AdSense) serait une étape séparée, si vous le souhaitez.")
h += B("Bon à savoir", items=["Ne jamais cliquer sur vos propres annonces réelles (risque de suspension du compte AdMob) : pendant les essais, garder <code>\"test\": true</code>.",
    "Les revenus apparaissent dans AdMob sous 24 h ; paiement à partir de 70 € de gains."])
document("publicite-admob.pdf", "Vraies publicités (AdMob)", "Ce qui est prêt dans les applis, ce qu'il vous reste à faire.", h,
         description="Publicité réelle AdMob dans les applis Android et iOS : module, consentement RGPD, ATT sur iPhone, repli de démonstration, identifiants dans config.js, étapes dans AdMob, app-ads.txt.")
