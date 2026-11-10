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
    ("vous", "<b>AdMob</b> : compte créé, validation d'identité en attente. Ensuite : ajouter l'appli Android (puis iOS), créer les blocs d'annonces, envoyer les identifiants à Claude."),
    ("vous", "<b>Cloudflare</b> : prêt à créer ; acheter le domaine quand le nom est choisi."),
    ("vous", "<b>Apple Developer</b> (99 €/an) : quand le nom est choisi ; puis clé API App Store Connect et 4 secrets GitHub (voir « Version Apple »)."),
    ("vous", "<b>Fiches des stores</b> : à copier dans la Play Console et App Store Connect le moment venu (document « Fiches des stores »)."),
    ("vous", "<b>marque.json</b> : renseigner éditeur, adresse, e-mail de contact avant la publication (mentions légales)."),
    ("vous", "<b>Entreprise</b> : micro-entreprise conseillée pour Airmony et Le-QLN ensemble, juste avant d'activer de vraies publicités."),
])
h += sec("Décisions à prendre", [
    ("dec", "<b>Nom définitif</b> : présélection Qlinn, Anagold, Wordheist, Lexipot (voir « Choisir le nom du jeu »)."),
    ("vous", "<b>Relire les séries de langue</b> : tableur « Séries en espagnol, allemand, italien » (mots à retirer)."),
    ("vous", "<b>Relire les thèmes</b> : tableur « Thèmes des séries » (mettre un x pour retirer un mot, proposer des ajouts)."),
    ("dec", "<b>Sons</b> : ajout éventuel de nouveaux sons (ambiance, dé, enchères, victoire…)."),
    ("vous", "<b>Vérifier la liste des cartes écartées de l'appli</b> (document « Cartes écartées de l'appli ») : 27 cartes sans mot courant à ne plus tirer, 46 cartes limites ; noter « garder » ou « écarter », ou « applique tel quel »."),
    ("vous", "<b>Relire le dictionnaire anglais</b> : tableur « Dictionnaire anglais (relecture) », 377 nouvelles cartes marquées."),
    ("dec", "<b>Mots douteux</b> : tableur à relire (gardés par défaut)."),
])
h += sec("Règles à décider (document « Propositions de règles »)", [
    ("dec", "<b>R1 (prioritaire) — La série remplace « rejouer »</b> : après une réussite, piocher jusqu'à 3 cartes sur la même case, ou s'arrêter ; un échec termine le tour."),
    ("dec", "<b>R2 — Durée au choix</b> : partie rapide (dé 1-6) ou longue (dé 1-1-2-2-3-3)."),
    ("dec", "<b>R3 — Cases CD multicolores</b> : le joueur choisit la couleur de sa carte."),
    ("dec", "<b>R4 — Argent négatif</b> : permis (dette envers la banque) ; pas d'enchère ni de caution sans les fonds."),
    ("dec", "<b>R5 — Mauvaise réponse</b> : les autres peuvent quand même enchérir."),
    ("dec", "<b>R6 — Case Passe</b> : on passe son prochain tour."),
    ("dec", "<b>R7 — Enchère acceptée</b> : on encaisse, mais on ne rejoue pas."),
    ("dec", "<b>R8 — Garant de prison</b> : il touche tous les gains positifs des 2 tours ; les malus restent au joueur libéré."),
    ("dec", "<b>R9 — Égalité</b> : départage par l'ordre d'arrivée."),
    ("dec", "<b>R10 — Dernier en lice</b> : 3 tours pour arriver (au lieu de 5 minutes)."),
    ("dec", "<b>R11 — Maître du Jeu</b> : dans l'appli, c'est le jeu ; pas de bonus de 50 €."),
    ("dec", "Vidéos récompense touchant aux règles."),
])
h += sec("Prochaines étapes de Claude", [
    ("todo", "Brancher <b>AdMob</b> (Android puis iOS) dès les identifiants reçus : consentement RGPD, ATT sur iPhone, app-ads.txt, repli hors ligne sur des créations locales."),
    ("todo", "<b>Mot de passe oublié</b> (Resend) après l'achat du domaine."),
    ("todo", "Retirer de l'appli publiée la barre de démonstration « Pub / No Pub » (en branchant AdMob)."),
    ("todo", "Clé de signature de publication Android (Google Play) et fabrication de l'appli publiée."),
    ("todo", "Changer le nom partout dès qu'il est choisi (action « Changer le nom »)."),
])
h += sec("Fait", [
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
