# Administration et surveillance du jeu -> docs/administration-et-surveillance.pdf
# (page admin, erreurs, UptimeRobot, Google Search Console, rappels, parrainage)
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from charte import document, T, B, L
h = '<p class="intro">Suivre le jeu une fois en ligne : la page d\'administration (statistiques, erreurs des joueurs, mots ajoutés), la surveillance du serveur, le référencement des pages publiques et les rappels par notification. Trois réglages à faire une seule fois de votre côté (environ 20 minutes en tout).</p>'

h += "<h2>1. Ouvrir la page d'administration (une seule fois, 3 min)</h2>" + L([
    "<b>Render</b> → projet Le-QLN → service <b>le-qln</b> → <b>Environment</b> → <b>ADMIN_EMAILS</b> (créée vide par le Blueprint ; sinon <i>Add Environment Variable</i>) → valeur : l'adresse e-mail de <b>votre compte de jeu</b>. Plusieurs adresses : séparées par des virgules. Ce n'est pas un secret.",
    "<b>Save Changes</b> : Render redémarre le serveur (environ 1 min).",
    "Dans le jeu, connectez-vous avec ce compte (<b>Mon compte</b>). En bas de l'écran du compte apparaît le lien <b>« Administration »</b>.",
    "Adresse directe : <code>https://kiki78test.github.io/Le-QLN/admin.html</code> (même navigateur que celui où vous êtes connecté au jeu)."])
h += "<h3>Ce que montre la page</h3>" + T([
    ["Tableau de bord", "Comptes (et nouveaux sur 24 h / 7 j), joueurs actifs sur 24 h / 7 j / 30 j, défis du jour joués aujourd'hui, scores sur 7 jours par mode, amis parrainés, abonnés aux rappels, mots ajoutés, erreurs ; activité jour par jour sur 30 jours ; pays ; état du serveur (salons, mémoire, taille de la base sur 256 Mo)."],
    ["Erreurs", "Les erreurs rencontrées par les joueurs, regroupées (même message au même endroit) avec leur nombre, la dernière fois, le fichier, la version et l'écran. Un clic montre le détail. Effacez une ligne une fois corrigée, ou tout effacer après une mise à jour. Une pastille rouge signale les erreurs des dernières 24 h."],
    ["Joueurs", "Les 100 derniers vus, recherche par pseudo ou e-mail : XP, nombre de scores, inscription, dernière visite, parrain."],
    ["Mots ajoutés", "Les mots acceptés après contestation (vérifiés sur le Wiktionnaire). « Retirer » rend un mot de nouveau refusé pour tous."],
    ["Rappels", "Nombre d'abonnés et bouton « M'envoyer un rappel de test »."]], ["Onglet", "Contenu"], [20, 80])
h += B("Confidentialité", "Les erreurs ne contiennent aucune donnée personnelle (message, fichier, ligne, version, écran, langue, navigateur). Seuls les comptes listés dans ADMIN_EMAILS ont accès à la page ; elle n'est pas référencée par les moteurs de recherche.")

h += "<h2>2. Surveillance du serveur</h2>"
h += "<p>Déjà en place, sans rien faire : l'action GitHub <b>« Surveillance du serveur »</b> vérifie toutes les heures que le serveur et la base répondent. En cas de panne : croix rouge dans l'onglet Actions et <b>e-mail de GitHub</b>. Elle réveille aussi le serveur gratuit de Render, ce qui permet aux rappels de partir.</p>"
h += "<h3>UptimeRobot (gratuit, 10 min) — alerte plus rapide, toutes les 5 minutes</h3>" + L([
    "Créer un compte sur <b>uptimerobot.com</b> (offre gratuite, 50 sondes), avec la double authentification.",
    "<b>+ New monitor</b> → type <b>HTTP(s)</b> → nom « Le-QLN serveur » → adresse <code>https://le-qln.onrender.com/sante</code> → intervalle <b>5 minutes</b>.",
    "<b>Alert contacts</b> : votre e-mail (et l'appli mobile UptimeRobot pour une notification sur le téléphone).",
    "Facultatif : une 2e sonde sur <code>https://le-qln.onrender.com/api/sante-api</code> (la base de données) et une 3e sur le site <code>https://kiki78test.github.io/Le-QLN/</code>.",
    "Facultatif : <b>Status page</b> publique, à partager avec les joueurs en cas de panne."])
h += B("Bon à savoir", items=[
    "Avec une sonde toutes les 5 minutes, le serveur gratuit ne s'endort plus. L'offre gratuite de Render compte 750 h par mois : assez pour un seul service allumé en permanence.",
    "À l'ouverture au public, passer quand même le serveur en <b>Starter</b> (7 $/mois) : plus de mémoire et pas de mise en veille."])

h += "<h2>3. Référencement Google (15 min)</h2>"
h += "<p>Le site contient maintenant une page par mot du jeu (« Anagrammes de CHIEN » : NICHE, CHINE, CHENI, avec définitions et bouton « Jouer »), environ 8 200 en français et 2 200 en anglais, un index par lettre et une page de présentation. Ce sont les recherches du type « anagramme de… » qui amèneront des joueurs.</p>" + L([
    "<b>search.google.com/search-console</b> → <b>Ajouter une propriété</b> → <b>Préfixe de l'URL</b> : <code>https://kiki78test.github.io/Le-QLN/</code>.",
    "Validation : méthode <b>Balise HTML</b> → envoyez-moi la balise <code>&lt;meta name=\"google-site-verification\" …&gt;</code> (pas un secret) : je l'ajoute aux pages, puis cliquez « Valider ».",
    "<b>Sitemaps</b> → ajouter <code>sitemap.xml</code> → Envoyer. Google découvre les pages en quelques jours ; les premières visites arrivent en général en 2 à 6 semaines.",
    "Au changement de nom ou de domaine : refaire ces étapes avec la nouvelle adresse (les pages sont régénérées automatiquement à chaque publication)."])
h += "<h3>Pages publiques</h3>" + T([
    ["…/anagrammes/", "Index des mots français par lettre ; une page par mot : <code>…/anagrammes/chien.html</code>"],
    ["…/en/anagrams/", "Même chose pour l'anglais : <code>…/en/anagrams/listen.html</code>"],
    ["…/presentation.html", "Présentation du jeu (principe, couleurs, modes, progression, captures, questions fréquentes) ; anglais : <code>…/en/presentation.html</code>"],
    ["…/sitemap.xml", "Liste de toutes les pages pour les moteurs de recherche"]], ["Adresse", "Contenu"], [28, 72])
h += "<p class='petit'>Ces pages sont fabriquées à chaque publication du site (<code>tools/pages_publiques.py</code>) à partir des dictionnaires et des définitions du Wiktionnaire (licence CC BY-SA 4.0, citée sur chaque page). Elles ne sont pas dans l'appli. Le menu ☰ du jeu y renvoie (en bas : « Présentation du jeu · Toutes les anagrammes »).</p>"

h += "<h2>4. Rappels par notification</h2>" + T([
    ["Quoi", "« Les cartes du jour sont prêtes » chaque jour, « Nouveau défi de la semaine » le lundi, à l'heure choisie par le joueur (8 h à 21 h, heure locale ; jamais après 22 h)."],
    ["Où le joueur les règle", "Paramètres → Rappels (menu ☰ sur téléphone, barre du bas sur ordinateur). Proposés une seule fois, après le premier défi du jour terminé."],
    ["Navigateur", "Chrome, Edge, Firefox (ordinateur et Android) ; sur iPhone/iPad, seulement après « Partager → Sur l'écran d'accueil » (iOS 16.4 et plus). Envoyés par le serveur : rien à configurer, ses clés sont créées toutes seules au premier démarrage."],
    ["Applis Android / iOS", "Notifications programmées sur le téléphone, sans serveur (autorisation demandée au premier réglage)."],
    ["Serveur gratuit", "Il s'endort : les rappels partent dans l'heure grâce aux réveils (GitHub, UptimeRobot). En Starter, à l'heure pile."]], ["", ""], [24, 76])

h += "<h2>5. Parrainage</h2>" + L([
    "Chaque joueur connecté a un lien personnel dans <b>Mon compte → Invitez vos amis</b> (copier ou partager).",
    "L'ami qui crée son compte avec ce lien reçoit <b>+200 XP</b> ; le parrain reçoit <b>+200 XP</b> quand cet ami a vraiment joué (50 XP), jusqu'à 20 amis. La médaille <b>Ambassadeur</b> (1 / 3 / 10 amis) suit.",
    "La page admin montre le nombre d'amis parrainés et, pour chaque joueur, son parrain."])
h += B("Pseudos", "Les pseudos grossiers (français et anglais, même déguisés) sont refusés à la création du compte, au changement de pseudo et dans le profil multijoueur ; un ancien pseudo grossier s'affiche « Joueur » dans les salons et les classements. Si un mot ordinaire est refusé à tort, dites-le-moi : la liste est dans <code>app/filtre.js</code>.")

document("administration-et-surveillance.pdf", "Administration et surveillance", "Page d'administration, erreurs des joueurs, surveillance du serveur, référencement, rappels et parrainage.", h,
         description="Suivre le jeu en ligne : ouvrir la page d'administration (ADMIN_EMAILS sur Render), erreurs remontées, UptimeRobot, Google Search Console et sitemap des pages « Anagrammes de… », rappels par notification, parrainage, filtre des pseudos.")
