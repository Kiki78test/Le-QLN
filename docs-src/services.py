# Note du développeur : services externes de Le-QLN (Render, GitHub, Google, Apple, Resend, Cloudflare…),
# base de données, variables, secrets, API, automatismes.
# Usage : python3 docs-src/services.py   -> docs/services-externes.pdf (date du jour, entrée docs/index.json mise à jour)
# À METTRE À JOUR à chaque changement de service, de variable, de table ou d'abonnement.
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from charte import document, NOM, DATE_LONGUE as D
def L(items): return "<ul>" + "".join("<li>%s</li>" % i for i in items) + "</ul>"
def T(rows, head): return "<table><tr>" + "".join("<th>%s</th>" % x for x in head) + "</tr>" + "".join("<tr>" + "".join("<td>%s</td>" % c for c in r) + "</tr>" for r in rows) + "</table>"
def B(titre, texte, items=None, warn=None, cls=""):
    return '<div class="box %s"><h3>%s</h3>%s%s%s</div>' % (cls, titre, ("<p style='margin:0 0 3px'>%s</p>" % texte) if texte else "", L(items) if items else "", ("<p class='petit' style='color:#b23a24;margin:4px 0 0'>⚠ %s</p>" % warn) if warn else "")
OK, ATT, NON = "<span class='ok'>en place</span>", "<span class='att'>en attente</span>", "<span class='non'>pas encore</span>"

h = ""
h += "<h2>Vue d'ensemble</h2>" + T([
    ["<b>GitHub</b>", "Code (dépôt public <code>Kiki78test/Le-QLN</code>), site du jeu (GitHub Pages), tests et fabrications automatiques (Actions)", "github.com", "gratuit", OK],
    ["<b>Render</b>", "Serveur Node (multijoueur, comptes, classements, mots contestés, anti-triche) + base PostgreSQL, région Francfort", "dashboard.render.com", "web Free ; base Free → Basic 256 Mo ≈ 6 $/mois", OK],
    ["<b>Wiktionnaire</b>", "Définitions des mots (depuis l'appli) et vérification des mots contestés (depuis le serveur)", "fr/en.wiktionary.org", "gratuit, sans clé", OK],
    ["<b>Google Play Console</b>", "Publication Android", "play.google.com/console", "25 $ une fois", ATT + " (identité)"],
    ["<b>Google AdMob</b>", "Publicité des applis Android et iOS", "admob.google.com", "commission Google", ATT + " (identité)"],
    ["<b>Google Cloud</b>", "Identifiant OAuth « Se connecter avec Google » (site web uniquement)", "console.cloud.google.com", "gratuit", NON],
    ["<b>Apple Developer</b>", "Publication iPhone / iPad (TestFlight, App Store)", "developer.apple.com", "99 € / an", NON],
    ["<b>Cloudflare</b>", "Nom de domaine, DNS, plus tard proxy ; racine du site pour <code>app-ads.txt</code>", "dash.cloudflare.com", "domaine ≈ 10 €/an", NON + " (nom à choisir)"],
    ["<b>Resend</b>", "E-mails du compte (mot de passe oublié) — nécessite le domaine", "resend.com", "gratuit jusqu'à 3 000/mois", NON],
    ["<b>Lexique 3.83</b>", "Source du dictionnaire français (fichier, pas un service en ligne)", "lexique.org", "CC BY-SA 4.0", OK]],
    ["Service", "Rôle", "Où", "Coût", "État"])
h += B("Règles d'or", "", [
    "Double authentification sur GitHub, Render, Google, Apple, Cloudflare, Resend.",
    "Une clé secrète ne se colle que dans <b>Render → Environment</b> ou <b>GitHub → Settings → Secrets</b>, jamais dans une conversation, un e-mail ou le code.",
    "Clé exposée par erreur : la révoquer dans le service, en créer une nouvelle, la remplacer (Render redémarre tout seul).",
    "<b>Ne jamais changer <code>SECRET</code></b> sur Render : tous les joueurs seraient déconnectés.",
    "Une seule instance Render : salons multijoueur et compteurs anti-abus vivent en mémoire du serveur.",
    "Ne jamais renommer les clés de stockage <code>qln:</code> / <code>qln-en:</code> de l'appli, même en changeant le nom du jeu : les joueurs perdraient leur progression."], cls="hl")

h += "<h2>1. GitHub — code, site et automatismes</h2>"
h += B("Dépôt et site", "Dépôt <b>Kiki78test/Le-QLN</b> (public), branche <code>main</code>. GitHub Pages publie la racine du dépôt : <code>https://kiki78test.github.io/Le-QLN/</code> (anglais : <code>/en/</code>).", [
    "Séries à thème : listes dans <code>tools/themes_listes.py</code>, construites par <code>python3 tools/build_themes.py</code> en <code>data/themes-fr.json</code> et <code>en/data/themes-en.json</code> (+ tableur de relecture dans docs/).",
    "Fichiers du jeu à la racine : <code>index.html</code>, <code>plateau.js</code>, <code>multi.js</code>, <code>series.js</code>, <code>barre.js</code>, <code>compte.js</code>, <code>progres.js</code>, <code>pub.js</code>, <code>infos.js</code>, <code>legal.js</code>, <code>analyse.js</code>, <code>config.js</code>, <code>sw.js</code> ; dictionnaires <code>data/fr.json</code> et <code>en/data/en.json</code>.",
    "Version anglaise <b>générée</b> : <code>python3 tools/build_en.py</code> (tables FR→EN dans <code>tools/en_*.py</code>). Ne pas modifier <code>en/*.js</code> à la main.",
    "Pages juridiques <b>générées</b> : <code>python3 tools/build_legal.py</code> depuis <code>tools/legal_texte.py</code> et <code>marque.json</code>.",
    "Service worker : à chaque version, incrémenter <code>VERSION</code> dans <code>sw.js</code> et la paire correspondante dans <code>tools/build_en.py</code>."])
h += "<h3>Actions (onglet Actions)</h3>" + T([
    ["Tests", "chaque envoi", "Tests serveur (PostgreSQL 16 de test) + appli dans Chromium : FR/EN, téléphone/ordinateur, partie rapide, hors ligne, comptes, anti-triche, pages juridiques"],
    ["Version en ligne", "après chaque publication du site + toutes les 6 h", "Mêmes tests sur le site publié et le vrai serveur (<code>/sante</code>, <code>/api/sante-api</code>)"],
    ["Sécurité", "chaque semaine", "Audit des dépendances (<code>npm audit</code>)"],
    ["Appli Android", "modification de <code>mobile/</code> ou des icônes", "APK de test signé avec la clé de test (<code>mobile/native/android/qln-test.jks</code>), publié dans Releases → « appli-android »"],
    ["Appli iOS", "idem", "Mac macOS 15 : compilation simulateur + capture ; avec les secrets Apple : archive signée → TestFlight"],
    ["Changer le nom", "à la demande", "Renomme le jeu partout (<code>tools/changer_nom.py</code>), régénère EN, pages juridiques, icônes, appli Android"]],
    ["Action", "Quand", "Ce qu'elle fait"])
h += "<h3>Secrets GitHub (Settings → Secrets and variables → Actions)</h3>" + T([
    ["APPLE_TEAM_ID", "Identifiant d'équipe Apple (10 caractères)", NON],
    ["ASC_KEY_ID / ASC_ISSUER_ID", "Clé API App Store Connect (rôle App Manager)", NON],
    ["ASC_KEY_P8", "Contenu du fichier <code>AuthKey_….p8</code>", NON],
    ["(à venir) clé de publication Android", "Clé de signature Google Play (keystore + mots de passe) pour l'appli publiée", NON]],
    ["Secret", "Contenu", "État"])

h += "<h2 class='pb'>2. Render — serveur et base de données</h2>"
h += B("Ce qui tourne", "Créé par le <b>Blueprint</b> <code>render.yaml</code> (projet Le-QLN, séparé d'Airmony).", [
    "<b>Web service <code>le-qln</code></b> : Node, région Francfort, <code>cd server &amp;&amp; npm install --omit=dev</code> puis <code>cd server &amp;&amp; npm start</code>. Adresse : <code>https://le-qln.onrender.com</code>. Santé : <code>/sante</code>.",
    "<b>Redéploiement automatique</b> à chaque envoi touchant <code>server/</code>, <code>analyse.js</code> ou les dictionnaires (<code>data/</code>, <code>en/data/</code>), <b>seulement si les tests GitHub passent</b> (<code>autoDeployTrigger: checksPass</code>).",
    "<b>Offre Free</b> : s'endort après 15 min sans visite (premier réveil ≈ 30 s). Passer en <b>Starter (7 $/mois)</b> à l'ouverture au public.",
    "<b>Base <code>le-qln-db</code></b> (PostgreSQL, Francfort, base <code>qln</code>, utilisateur <code>qln</code>) : accessible seulement depuis Render. Offre Free actuelle : <b>expire 30 jours après sa création</b> (+14 jours de grâce), 1 Go, sans sauvegarde → passer en <b>Basic 256 Mo</b> (≈ 6 $/mois, sauvegardes quotidiennes) <b>avant le 10 décembre 2026</b>."],
    warn="Ne jamais supprimer la base ni changer sa région : comptes, progression et scores seraient perdus.")
h += "<h3>Variables d'environnement (Render → le-qln → Environment)</h3>" + T([
    ["DATABASE_URL", "Adresse interne de la base (branchée par le Blueprint). SSL activé automatiquement sauf base locale.", OK],
    ["SECRET", "Signe les jetons de session (90 jours). Générée une fois par Render. <b>Ne jamais la changer.</b>", OK],
    ["ORIGINES", "<code>https://kiki78test.github.io,capacitor://localhost</code> : site + appli iOS. Ajouter le futur domaine (ex. <code>https://nomdujeu.com</code>).", OK],
    ["PORT", "Fourni par Render (8080 par défaut en local).", OK],
    ["GOOGLE_CLIENT_ID", "Facultatif : connexion Google sur le site (même valeur dans <code>config.js</code>).", NON],
    ["RESEND_API_KEY / MAIL_FROM", "Prévues pour « mot de passe oublié » (fonction à coder après l'achat du domaine).", NON]],
    ["Variable", "Rôle", "État"])

h += "<h2>3. Base de données (PostgreSQL)</h2><p class='petit'>Tables créées ou complétées automatiquement au démarrage du serveur (<code>server/api.js</code>, bloc SCHEMA). Suppression d'un compte = suppression en cascade de sa progression et de ses scores.</p>" + T([
    ["qln_joueurs", "id (uuid), email (unique), mdp (empreinte bcrypt), google_sub, pseudo, couleur, pays, cree_le, vu_le", "Comptes"],
    ["qln_progression", "joueur → qln_joueurs, donnees (jsonb : progression FR/EN, records), maj_le", "Progression synchronisée (fusion : le meilleur des deux appareils)"],
    ["qln_scores", "id, joueur, langue, mode (jour / defi / braquage), jour (date), score, detail (jsonb : cartes et mots trouvés), cree_le ; unique (joueur, langue, mode, jour)", "Classements ; défi du jour : seul le 1er essai compte"],
    ["qln_mots", "id, langue, mot, nature, joueur, cree_le ; unique (langue, mot)", "Mots ajoutés après contestation (vérifiés sur le Wiktionnaire), partagés avec tous et acceptés par l'anti-triche"]],
    ["Table", "Colonnes", "Usage"])

h += "<h2>4. API du serveur (<code>/api/…</code>, JSON)</h2>" + T([
    ["POST /api/inscription", "e-mail, mot de passe (8+), pseudo, pays, couleur", "10 / h / IP"],
    ["POST /api/connexion", "e-mail, mot de passe", "20 / 15 min / IP"],
    ["POST /api/google", "jeton Google (si GOOGLE_CLIENT_ID)", "30 / 15 min / IP"],
    ["GET · PATCH · DELETE /api/moi", "profil ; DELETE efface le compte et ses données", "—"],
    ["GET · PUT /api/progression", "progression d'une langue + records", "120 / h / joueur"],
    ["POST /api/scores", "mode, langue, score, jour, detail.historique (vérifié par <code>server/jour.js</code>)", "60 / h / joueur"],
    ["GET /api/classement", "mode, langue, jour, pays, période, limite", "public"],
    ["POST · GET /api/mots", "mot contesté (vérifié sur le Wiktionnaire) / liste des mots ajoutés", "30 / h / IP"],
    ["GET /api/sante-api", "diagnostic de la base (code d'erreur seulement)", "public"]],
    ["Route", "Données", "Limite anti-abus"])
h += B("Multijoueur (WebSocket <code>wss://le-qln.onrender.com/ws</code>)", "Relais : le serveur ne joue pas, il transmet. L'hôte de chaque salon détient l'état et le diffuse.", [
    "Messages au serveur : <code>annuaire</code> / <code>annuaire-stop</code> (liste des salons en attente + nombre de joueurs en ligne), <code>entrer</code> (rejoindre ou créer un canal), <code>publier</code> (résumé public du salon, nettoyé et borné par le serveur), <code>sortir</code> ; tout autre message est relayé aux membres du salon.",
    "Nettoyage toutes les 30 s : connexions muettes coupées, salons inactifs depuis 2 h fermés. Origines acceptées : variable ORIGINES.",
    "Partie rapide : choisie côté appli (salon le plus rempli, sinon salon automatique qui démarre seul)."])
h += B("Anti-triche (<code>server/jour.js</code>)", "Le serveur lit les mêmes dictionnaires que l'appli et refait le tirage du défi du jour (graine = date).", [
    "Refus si : cartes différentes de celles du jour, mot qui n'est pas une anagramme de sa carte, doublon, score au-dessus du maximum possible avec ces mots.",
    "Défi libre : mots vérifiés, maximum plus large. Braquage : score borné. Les chronos ne sont pas rejoués."])

h += "<h2 class='pb'>5. Appli : configuration et stockage</h2>"
h += "<h3>config.js (racine du site)</h3>" + T([
    ["QLN_API_URL", "<code>https://le-qln.onrender.com</code> — vide = mode local (multijoueur entre onglets, sans comptes)"],
    ["QLN_WS_URL", "déduit de QLN_API_URL (<code>wss://…/ws</code>)"],
    ["QLN_GOOGLE_CLIENT_ID", "vide pour l'instant ; toujours vide dans les applis mobiles"],
    ["QLN_SITE_URL", "adresse publique du jeu (liens d'invitation depuis l'appli iOS)"],
    ["QLN_NATIVE", "vrai dans les applis Android/iOS (agent utilisateur <code>LeQLNApp/</code>)"]],
    ["Variable", "Rôle"])
h += "<h3>marque.json</h3>" + T([
    ["nom, sigle", "nom du jeu et sigle du logo/icône — changer avec l'action « Changer le nom »"],
    ["editeur, adresse, contact_email", "coordonnées légales (vides = « [à compléter] » dans les mentions légales et la politique)"]],
    ["Champ", "Rôle"])
h += "<h3>Stockage sur l'appareil (localStorage, préfixe <code>qln:</code> en français, <code>qln-en:</code> en anglais)</h3>" + T([
    ["session, compte", "jeton de connexion et profil (pseudo, pion)"],
    ["progres, records, victoiresIA, fantome, semaine, festival, braquage", "progression, records, ombre du duel, essai de la semaine, médailles"],
    ["scoresEnAttente", "scores obtenus hors ligne, envoyés au retour du réseau"],
    ["motsAjoutes", "mots acceptés après contestation"],
    ["serie, serieVus, seriesVues", "série choisie, cartes déjà vues par thème, nombre de séries débloquées (annonce des nouvelles)"],
    ["pub, pubStats, son, vibrations, reglesDefi, chronoEntr, cfgIA", "réglages (pub, son, vibrations, règles, IA)"]],
    ["Clés", "Contenu"])
h += B("Hors ligne", "Service worker (<code>sw.js</code>) : tout le jeu est en cache après la première visite, vidéos de pub comprises. Réseau d'abord pour le code et les documents, mais 3 s au plus quand une copie existe.")

h += "<h2>6. Applis mobiles (dossier <code>mobile/</code>, Capacitor 8)</h2>" + T([
    ["Identifiant", "<code>fr.leqln.app</code> (Android et iOS) — figé à la 1re publication"],
    ["Android", "enveloppe qui ouvre le site (<code>server.url</code> dans <code>capacitor.config.json</code>) : chaque mise à jour du jeu arrive sans réinstaller ; réglages dans <code>native/android/patch_android.py</code>"],
    ["iOS", "jeu embarqué dans l'appli (exigence Apple) ; réglages dans <code>native/ios/patch_ios.py</code> ; origine <code>capacitor://localhost</code> autorisée par le serveur"],
    ["Connexion", "e-mail + mot de passe uniquement (pas de Google dans les applis)"],
    ["Publicité", "AdMob à brancher quand les comptes sont validés : identifiants d'appli et de blocs, consentement RGPD (et ATT sur iPhone), fichier app-ads.txt à la racine d'un domaine"]],
    ["", ""])

h += "<h2>7. Tests en local</h2>" + L([
    "Serveur : <code>cd server &amp;&amp; DATABASE_URL=postgresql://…?sslmode=disable PORT=8790 node index.js</code> puis <code>cd tests &amp;&amp; QLN_TEST_URL=http://localhost:8790 node --test serveur.test.js</code>.",
    "Appli : servir la racine (<code>python3 -m http.server 8765</code>) puis <code>QLN_SITE=http://localhost:8765 node --test --test-concurrency=1 appli.test.js</code> (ajouter <code>QLN_TEST_URL</code> pour les tests avec serveur).",
    "Les tests remplacent toujours <code>config.js</code> : ils ne touchent jamais au vrai serveur."])

h += "<h2>8. Coûts et échéances</h2>" + T([
    ["Render base Basic 256 Mo", "≈ 6 $/mois", "<b>avant le 10/12/2026</b> (fin de l'offre Free)"],
    ["Render web Starter", "7 $/mois", "à l'ouverture au public"],
    ["Google Play Console", "25 $ une fois", "payé — identité en cours"],
    ["Apple Developer", "99 €/an", "quand le nom est choisi"],
    ["Domaine (Cloudflare)", "≈ 10 €/an", "quand le nom est choisi"],
    ["Resend", "0 € (3 000 e-mails/mois)", "après le domaine"]],
    ["Poste", "Coût", "Quand"])

document("services-externes.pdf", "Services externes — note du développeur",
         "Chaque service, son rôle, où le régler, les variables et secrets, la base de données, l'API et les automatismes.", h,
         titre_index="Services externes (développeur)",
         description="Note technique : services (GitHub, Render, Google, Apple, Resend, Cloudflare, Wiktionnaire), variables d'environnement et secrets, tables de la base, API et multijoueur, anti-triche, stockage de l'appli, applis mobiles, tests, coûts et échéances.")
