# Source du document (charte commune : docs-src/charte.py). Régénérer : python3 docs-src/version_apple.py
import os
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "stylepdf.py")).read())
def puces(l): return [Paragraph("• "+x,P) for x in l]
def nums(l,d=1): return [Paragraph("<b>%d.</b> %s"%(i+d,x),P) for i,x in enumerate(l)]
st=[Paragraph("Le-QLN — version Apple (iPhone, iPad) et publicité",T),Spacer(1,2),Paragraph("Ce qui est prêt, ce qu'il vous reste à faire, publicité sur iOS · 10 novembre 2026",S),Spacer(1,8),
Paragraph("La version iOS est fabriquée automatiquement sur un Mac de GitHub : <b>vous n'avez pas besoin de Mac</b>. Sans compte Apple, chaque modification produit une appli testée dans un simulateur d'iPhone (avec une capture d'écran). Dès que le compte Apple Developer existe, la même fabrication signe l'appli et l'envoie sur TestFlight pour l'installer sur votre iPhone.",P)]
st.append(Paragraph("1. Ce qui est prêt",H))
st.append(tbl([["Élément","Détail"],
["Fabrication","Action GitHub « Appli iOS » (Mac macOS 15, gratuite pour un dépôt public) : à chaque modification du dossier mobile/ ou des icônes, ou à la demande."],
["Jeu embarqué","Contrairement à Android (qui ouvre le site), le jeu est <b>dans</b> l'appli : Apple refuse souvent une appli qui n'est qu'une fenêtre sur un site (règle 4.2), et le jeu marche hors ligne dès l'installation. Comptes, classements et multijoueur passent par le serveur (l'origine de l'appli est autorisée)."],
["Réglages","Nom affiché, portrait, barre d'état claire, icône 1024 × 1024, écran de démarrage bleu nuit, numéro de version automatique, déclaration « pas de chiffrement spécial », français et anglais."],
["Connexion","E-mail et mot de passe seulement (pas de Google dans l'appli) : la règle Apple 4.8 n'impose donc pas « Se connecter avec Apple »."],
["Liens","Les invitations multijoueur partagées depuis l'iPhone renvoient vers le site du jeu."],
["Mises à jour","Le jeu étant embarqué, une nouvelle version passe par TestFlight / l'App Store (relecture Apple, souvent moins de 48 h). Les mots, scores et salons, eux, viennent du serveur en direct."]],[32*mm,142*mm]))
st.append(Paragraph("2. Ce qu'il vous reste à faire",H))
st+=nums(["<b>Compte Apple Developer</b> (developer.apple.com/programs) : 99 € par an. Avec un Apple ID protégé par la double authentification. En particulier : nom affiché sur l'App Store = votre nom ; en entreprise : numéro D-U-N-S (gratuit, quelques jours) et nom de l'entreprise affiché.",
"<b>App Store Connect</b> → Mes apps → « + » : nom, langue principale français, identifiant de paquet <b>fr.leqln.app</b> (le même que l'appli Android), SKU libre.",
"<b>Clé API</b> : App Store Connect → Utilisateurs et accès → Intégrations → Clés App Store Connect → « + », rôle App Manager. Notez l'<i>Issuer ID</i>, le <i>Key ID</i>, téléchargez le fichier .p8 (une seule fois possible). Relevez aussi votre <i>Team ID</i> (developer.apple.com → Membership).",
"<b>Secrets GitHub</b> (dépôt → Settings → Secrets and variables → Actions) : APPLE_TEAM_ID, ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8 (contenu complet du fichier .p8). Ne me les envoyez pas dans la conversation : saisissez-les directement dans GitHub.",
"Relancer « Appli iOS » (Actions → Run workflow) : l'appli arrive dans TestFlight ; installez l'appli TestFlight sur l'iPhone pour la tester.",
"<b>Fiche App Store</b> : captures (iPhone 6,9\" obligatoire), description FR/EN, catégorie Jeux → Mots, classification d'âge, adresse de la politique de confidentialité (confidentialite.html du site), « Étiquettes de confidentialité » cohérentes avec cette politique. Je prépare les textes et les captures quand vous y êtes."])
st.append(Paragraph("3. La publicité sur iPhone",H))
st+=puces(["<b>Même régie qu'Android : Google AdMob.</b> Dans votre compte AdMob, ajoutez une 2e appli « iOS » (après sa création dans App Store Connect) et créez ses blocs d'annonces (interstitiel, récompense, bandeau). Les règles d'affichage du jeu restent identiques.",
"<b>Suivi publicitaire (ATT)</b> : sur iPhone, une annonce personnalisée exige l'accord du joueur via la fenêtre Apple « Autoriser l'app à suivre votre activité ? ». Elle s'affiche après le bandeau de consentement RGPD (le même formulaire AdMob « Confidentialité et messages » gère les deux). Sans accord : annonces non personnalisées, revenu en général 30 à 50 % plus bas.",
"<b>À ajouter dans l'appli</b> (je le fais quand AdMob iOS est créé) : module AdMob pour Capacitor, identifiant d'appli AdMob iOS, phrase d'explication du suivi, liste des réseaux publicitaires (SKAdNetwork) et manifeste de confidentialité.",
"<b>Achat « Sans pub »</b> : sur iPhone, il doit obligatoirement passer par l'achat intégré Apple (commission 15 % pour un petit développeur, programme Small Business). Pas de paiement externe dans l'appli.",
"<b>Fichier app-ads.txt</b> : comme pour Android, AdMob le vérifie à la racine du site déclaré comme « site du développeur » sur la fiche App Store. Il faut donc un domaine à vous (ou la racine kiki78test.github.io)."])
st.append(Paragraph("4. Coûts et délais",H))
st.append(tbl([["Poste","Coût","Délai"],
["Apple Developer Program","99 € / an","quelques heures à 2 jours (identité)"],
["Mac de fabrication","0 € (GitHub, dépôt public)","—"],
["Relecture Apple d'une version","0 €","souvent < 48 h"],
["D-U-N-S (si entreprise)","0 €","jusqu'à 2 semaines"]],[70*mm,50*mm,54*mm]))
st.append(Paragraph("<b>Ordre conseillé</b> : terminer d'abord Android (Play Console, AdMob), puis ouvrir le compte Apple quand le nom est choisi : le nom et l'identifiant de l'appli sont plus pénibles à changer après la première publication.",P))
SimpleDocTemplate("version-apple.pdf",pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=15*mm,bottomMargin=15*mm,title="Le-QLN — version Apple",author="Claude").build(st)
