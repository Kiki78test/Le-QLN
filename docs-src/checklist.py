# Check-list Le-QLN : échéances, actions en attente (vous / Claude), décisions à prendre, fait.
# Usage : python3 docs-src/checklist.py  -> docs/check-list.pdf (date du jour, entrée docs/index.json mise à jour)
# À mettre à jour à chaque étape importante.
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from charte import document, NOM
CSS_LISTE = """<style>
ul.cl{list-style:none;margin:0;padding:0} ul.cl>li{display:flex;gap:8px;padding:4px 2px;border-bottom:1px solid #eceff6;break-inside:avoid;margin:0} ul.cl>li::before{display:none}
.b{flex:none;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;font-size:10pt;font-weight:700;color:#fff}
.b.ok{background:#2e9e5b}.b.todo{background:#9aa3b5}.b.vous{background:#e09a1a}.b.urg{background:#d9412b}.b.dec{background:#5b6cd6}
.rappel{border:2px solid #d9412b;background:#fdeeea;border-radius:10px;padding:9px 13px;margin:10px 0}.rappel b{color:#b0301c}
</style>"""
SYM = {"ok": "✔", "todo": "○", "vous": "◷", "urg": "!", "dec": "?"}
def sec(titre, items): return f"<h2>{titre}</h2><ul class='cl'>" + "".join(f"<li><span class='b {c}'>{SYM[c]}</span><span>{t}</span></li>" for c, t in items) + "</ul>"

h = CSS_LISTE
h += ("<div class='rappel'><b>⚠ RAPPEL — avant le 10 décembre 2026 : passer la base Render en « Basic 256 Mo ».</b><br>"
      "L'offre Free de la base <code>le-qln-db</code> expire 30 jours après sa création (puis 14 jours de grâce avant suppression des données : comptes, progression, scores). "
      "Render → projet Le-QLN → <b>le-qln-db</b> → <b>Upgrade</b> (ou Settings → Instance type) → <b>Basic-256mb</b> (≈ 6 $/mois, sauvegardes quotidiennes). "
      "Aucune autre manipulation : l'adresse de la base ne change pas, le serveur continue sans coupure. Une notification de rappel vous sera aussi envoyée début décembre.</div>")
h += "<p class='petit'>Légende : <b style='color:#d9412b'>!</b> échéance · <b style='color:#e09a1a'>◷</b> à faire par vous · <b style='color:#5b6cd6'>?</b> décision à prendre · <b style='color:#9aa3b5'>○</b> à faire par Claude · <b style='color:#2e9e5b'>✔</b> fait</p>"
h += sec("Échéances", [
    ("urg", "<b>Base Render → Basic 256 Mo avant le 10/12/2026</b> (voir l'encadré ci-dessus)."),
    ("urg", "<b>Serveur Render → Starter (7 $/mois)</b> à l'ouverture au public : l'offre Free s'endort après 15 min (premier réveil ≈ 30 s)."),
])
h += sec("En cours chez vous", [
    ("vous", "<b>Google Play Console</b> : validation d'identité en attente (statut « non professionnel » pour l'instant) ; puis confirmer l'accès à un appareil Android et le numéro de téléphone."),
    ("vous", "<b>Google Play — clé d'envoi</b> : créer le secret GitHub <code>ANDROID_KEYSTORE_PASSWORD</code> (20 caractères et plus, à garder précieusement), puis lancer l'action « Appli Android (Google Play) » ; prévoir 12 testeurs pendant 14 jours (document « Publier sur Google Play »)."),
    ("vous", "<b>AdMob</b> : appli Android et ses 2 blocs créés (14/11, identifiants en place, annonces de test). Reste : appli iOS et ses 2 blocs (m'envoyer les 3 identifiants) ; après la publication sur Google Play, relier l'appli à sa fiche dans AdMob ; fichier app-ads.txt sur le futur domaine."),
    ("vous", "<b>Page d'administration</b> : sur Render → le-qln → Environment, saisir <code>ADMIN_EMAILS</code> = l'adresse de votre compte de jeu (pas un secret). Puis, connecté dans le jeu : Mon compte → « Administration » (voir « Administration et surveillance »)."),
    ("vous", "<b>UptimeRobot</b> (gratuit) : créer le compte et une sonde HTTP(s) sur <code>https://le-qln.onrender.com/sante</code> toutes les 5 min, alerte par e-mail (pas à pas dans « Administration et surveillance »)."),
    ("vous", "<b>Google Search Console</b> : ajouter la propriété <code>https://kiki78test.github.io/Le-QLN/</code> (préfixe d'URL) et déclarer <code>sitemap.xml</code> (pas à pas dans « Administration et surveillance »)."),
    ("vous", "<b>Essayer les rappels</b> : Paramètres → Rappels sur votre téléphone (Android : Chrome ou l'appli ; iPhone : après « Sur l'écran d'accueil »), puis page admin → Rappels → « M'envoyer un rappel de test »."),
    ("vous", "<b>Cloudflare</b> : prêt à créer ; acheter le domaine quand le nom est choisi."),
    ("vous", "<b>Apple Developer</b> (99 €/an) : quand le nom est choisi ; puis clé API App Store Connect et 4 secrets GitHub (voir « Version Apple »)."),
    ("vous", "<b>Fiches des stores</b> : à copier dans la Play Console et App Store Connect le moment venu (document « Fiches des stores »)."),
    ("vous", "<b>marque.json</b> : renseigner éditeur, adresse, e-mail de contact avant la publication (mentions légales)."),
    ("vous", "<b>Entreprise</b> : micro-entreprise conseillée pour Airmony et Le-QLN ensemble, juste avant d'activer de vraies publicités."),
])
h += sec("Décisions à prendre", [
    ("dec", "<b>Nom définitif</b> : piste favorite <b>AnagramX</b> (12/11), à confirmer (vérifications et réservations : « Choisir le nom du jeu »). Avant de valider AnagramX : recherche de marque INPI / EUIPO (classes 9, 28, 41), disponibilité du domaine (.com / .fr) et des noms sur le Play Store et l'App Store. Ensuite : action « Changer le nom » (jeu, pages publiques, applis, documents)."),
    ("dec", "<b>Valider les réglages des nouveautés du 11/11</b> : bonus de parrainage (+200 XP de chaque côté, ami compté à 50 XP, 20 amis au plus) et seuils des 9 médailles bronze / argent / or (document « Fonctionnalités », §4)."),
    ("vous", "<b>Relire les séries de langue</b> : tableur « Séries en espagnol, allemand, italien » (mots à retirer)."),
    ("vous", "<b>Relire les thèmes</b> : tableur « Thèmes des séries » (mettre un x pour retirer un mot, proposer des ajouts)."),
    ("dec", "<b>Sons</b> : ajout éventuel de nouveaux sons (ambiance, dé, enchères, victoire…)."),
    ("vous", "<b>Vérifier la liste des cartes écartées de l'appli</b> (document « Cartes écartées de l'appli ») : 27 cartes sans mot courant à ne plus tirer (45 mots sur 61 ont une définition au Wiktionnaire), 46 cartes limites (102 mots sur 111) ; sur tout le dictionnaire, 115 mots sur 8 156 n'ont pas de définition (liste dans le même document) ; noter « garder » ou « écarter », ou « applique tel quel »."),
    ("vous", "<b>Relire le dictionnaire anglais</b> : tableur « Dictionnaire anglais (relecture) », 377 nouvelles cartes marquées."),
    ("dec", "<b>Mots douteux</b> : tableur à relire (gardés par défaut)."),
])
h += sec("Règles : décisions de l'auteur du jeu (14/11)", [
    ("ok", "<b>R1</b> série : 2 cartes par case au plus — appliquée (règles + appli)."),
    ("ok", "<b>R2</b> durée courte (dé 1 à 6) ou longue (dé 1 à 3), choisie par celui qui crée la partie — appliquée."),
    ("ok", "<b>R4 à R11</b> (argent négatif, enchères après réponse refusée, Passe, enchère acceptée, garant, égalité, dernier en lice 3 tours, maître du jeu) — appliquées et inscrites dans les règles."),
    ("vous", "<b>Tapis final avec cases multi-choix</b> : envoyer la photo / le plan (emplacement et couleurs possibles de chaque case) pour adapter le plateau de l'appli. Les cases CD restent comme aujourd'hui (R3 abandonnée)."),
])
h += sec("Idées notées (revue d'Airmony, à faire plus tard)", [
    ("dec", "<b>Test d'intrusion</b> : simulation de piratage des comptes et du serveur (inscription, connexion, jetons, API admin, WebSocket, injection), avec rapport comme celui d'Airmony."),
    ("dec", "<b>Kit de lancement</b> : plan sur 4 semaines, visuels Instagram et TikTok, messages types (sur le modèle d'Airmony)."),
    ("dec", "<b>Aide en questions-réponses</b> : base de réponses consultable dans l'Aide, avec une IA en option (sur le modèle de l'assistant d'Airmony)."),
    ("dec", "<b>Dépôt e-Soleau</b> du jeu de plateau et de l'appli (règles, visuels, code), sur le modèle du dossier Airmony (≈ 15 €)."),
    ("dec", "<b>Rappels par e-mail</b> (en plus des notifications) : nécessite Resend et le domaine."),
])
h += sec("Prochaines étapes de Claude", [
    ("todo", "À la publication sur Google Play : passer AdMob en annonces réelles (config.js : \"test\": false) ."),
    ("todo", "<b>Mot de passe oublié</b> (Resend) après l'achat du domaine."),
    ("todo", "Surveiller la page admin (onglet Erreurs) après chaque mise en ligne et corriger les erreurs remontées."),
    ("todo", "Changer le nom partout dès qu'il est choisi (action « Changer le nom »)."),
])
h += sec("Fait", [
    ("ok", "<b>14/11</b> — règles de l'auteur appliquées ; documentation rangée par dossiers (documents dépassés retirés, synthèse « Listes de mots ») ; mesure d'audience d'Airmony dans la page admin (visites, durée, carte, sources, journal, tunnel)."),
    ("ok", "<b>11/11</b> — repris d'Airmony : remontée des erreurs, page d'administration, surveillance horaire du serveur, contrôle automatique de la traduction anglaise, ≈ 10 400 pages « Anagrammes de… » + page de présentation + sitemap, parrainage (+200 XP), rappels par notification, 9 médailles bronze/argent/or, filtre des pseudos grossiers."),
    ("ok", "<b>10/11</b> — iPad : mise en page agrandie sur tablette, appli iOS pour iPhone et iPad, captures iPad 13 pouces."),
    ("ok", "<b>10/11</b> — AdMob prêt dans les applis (module, consentement RGPD, ATT iPhone, menu « Choix publicitaires », repli de démonstration, texte de confidentialité prêt) ; barre « Pub / No Pub » conservée."),
    ("ok", "<b>10/11</b> — fabrication de l'appli Android à publier (.aab signé, clé d'envoi créée et chiffrée automatiquement, version croissante) ; document « Publier sur Google Play »."),
    ("ok", "<b>10/11</b> — dictionnaire anglais agrandi (option D1) : 911 cartes au lieu de 534, 12 thèmes anglais au lieu de 9."),
    ("ok", "<b>10/11</b> — multijoueur : si l'hôte part, un autre joueur prend la main ; un joueur parti ou coupé est remplacé par l'IA (tout le monde est prévenu) et peut revenir (« Reprendre la partie en cours ») ; salons filtrables par langue (langue de l'appli par défaut)."),
    ("ok", "<b>10/11</b> — dépôt rangé : le jeu dans <code>app/</code>, publié par l'action « Publication du site » à la même adresse (réglage Pages « GitHub Actions » fait)."),
    ("ok", "<b>10/11</b> — <b>multijoueur synchronisé sur le plateau</b> : mêmes règles que contre l'IA, cartes vues en direct par les autres, enchères simultanées, prison et garant entre joueurs, remplacement automatique d'un joueur absent ; parties complètes testées à deux (local et serveur)."),
    ("ok", "<b>10/11</b> — séries du Défi en <b>espagnol, allemand, italien</b> (débloquées aux niveaux 5, 6, 7), drapeaux, définitions sur le Wiktionnaire de chaque langue, jouables hors ligne."),
    ("ok", "<b>10/11</b> — fiches des stores prêtes (dossier <code>store/</code> + PDF « Fiches des stores ») : textes FR/EN, 8 captures Play et iPhone, bannière, icône, réponses Sécurité des données / Confidentialité Apple ; appli iOS réservée à l'iPhone pour la 1re version ; suppression du compte sans l'appli décrite dans la politique."),
    ("ok", "<b>10/11</b> — documentation : signature visuelle commune, règles du jeu illustrées (appli + PDF), étapes déjà faites marquées « Fait » (Render, comptes, applis)."),
    ("ok", "<b>10/11</b> — « le plus riche gagne » rendu évident (rappel, bandeau, bonus d'arrivée, podium détaillé) ; design rapproché des maquettes (dé 3D doré, cadre lumineux)."),
    ("ok", "<b>10/11</b> — séries du Défi : 16 thèmes FR / 9 EN (12 depuis), série dans l'autre langue, design par thème, déblocage par niveau, sans classement ; vibrations plus douces, lueur de validation."),
    ("ok", "<b>10/11</b> — version Apple préparée (fabrication sur Mac GitHub, simulateur OK ; TestFlight dès le compte Apple) ; note « Services externes »."),
    ("ok", "<b>10/11</b> — jeu complet hors ligne (scores en attente, pubs en cache, démarrage rapide sur réseau lent, multi signalé)."),
    ("ok", "<b>10/11</b> — accueil multi (salons en attente) + Partie rapide ; anti-triche des classements ; confidentialité et mentions légales ; aide au choix du nom."),
    ("ok", "<b>10/11</b> — serveur en ligne sur Render (base dédiée), tests et vérifications automatiques, appli Android de test, nom changeable en un seul endroit."),
    ("ok", "<b>8–9/11</b> — version anglaise, multijoueur (salons), comptes et classements, progression, partage, design, contestation des mots."),
])
document("check-list.pdf", "Check-list", "Échéances, ce qui vous attend, ce que Claude fera ensuite, décisions à prendre.", h,
         description="Échéances (base Render en Basic avant le 10/12), démarches en cours de votre côté, décisions à prendre, prochaines étapes et ce qui est fait.")
