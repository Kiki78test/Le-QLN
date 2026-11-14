"""Textes des fiches Play Store / App Store (FR + EN) et réponses aux questionnaires (sécurité des données,
confidentialité Apple, classification). Source unique : tools/build_store.py génère store/ et docs/fiches-des-stores.pdf.
Le nom du jeu vient de marque.json : ne rien écrire en dur ici (utiliser {nom}).
Limites : titre Play 30 car., description courte Play 80, description longue 4000 ; App Store : nom 30,
sous-titre 30, texte promotionnel 170, mots-clés 100 (séparés par des virgules, sans espace), description 4000."""

SITE = "https://kiki78test.github.io/AnagramX/"
LIMITES = {"titre": 30, "courte": 80, "longue": 4000, "sous_titre": 30, "promo": 170, "mots_cles": 100, "nouveautes": 500}

# légendes des captures (même ordre que les scènes de tools/store_captures.js)
LEGENDES = {
    "fr": [
        ("accueil", "Le jeu d'anagrammes", "où l'on joue pour l'or"),
        ("partie", "Trouvez les anagrammes", "avant la fin du sablier"),
        ("plateau", "Un vrai jeu de plateau", "enchères, coffres et prison"),
        ("jour", "Un défi chaque jour", "les mêmes cartes pour tous"),
        ("series", "Des séries à thème", "et des mots d'autres langues"),
        ("podium", "Le plus riche gagne", "pas le plus rapide"),
        ("multi", "Jouez entre amis", "de 2 à 6, avec un simple code"),
        ("progression", "Montez de niveau", "succès, séries et records"),
    ],
    "en": [
        ("accueil", "The anagram game", "where you play for gold"),
        ("partie", "Find the anagrams", "before the timer runs out"),
        ("plateau", "A real board game", "auctions, chests and jail"),
        ("jour", "A new challenge daily", "the same cards for everyone"),
        ("series", "Themed series", "and words from other languages"),
        ("podium", "The richest player wins", "not the fastest one"),
        ("multi", "Play with friends", "2 to 6 players, one simple code"),
        ("progression", "Level up", "achievements, streaks and records"),
    ],
}


def fiche(lang, nom):
    if lang == "fr":
        return {
            "titre": f"{nom} : anagrammes",
            "sous_titre": "Anagrammes, plateau et défis",
            "courte": "Trouvez les anagrammes, remportez l'or : défi du jour, plateau et multijoueur.",
            "promo": "Nouveau : les séries à thème du Défi et la partie rapide en multijoueur. Un défi chaque jour, les mêmes cartes pour tous.",
            "mots_cles": "anagramme,mots,lettres,jeu de mots,vocabulaire,plateau,défi,quiz,mot mêlé,scrabble,cerveau",
            "nouveautes": "Séries à thème dans le Défi, partie rapide en multijoueur, jeu complet hors ligne, règles illustrées.",
            "longue": f"""{nom}, c'est le jeu d'anagrammes où chaque mot trouvé rapporte de l'or.

Une carte, un mot, un sablier : retrouvez les anagrammes cachées (ROULE → LOUER, OURLE…) avant la fin du temps. Plus la carte est difficile, plus elle rapporte. Et à la fin, ce n'est pas le plus rapide qui gagne : c'est le plus riche.

★ PLUSIEURS FAÇONS DE JOUER
• Mode solo : Défi, Festival, Braquage et Duel de l'ombre.
• Défi du jour : les mêmes cartes pour tout le monde, un nouveau défi chaque jour, une série de jours à entretenir.
• Séries à thème : animaux, cuisine, sport, voyages, sciences… et des séries de mots d'autres langues, débloquées en progressant.
• Contre l'IA : un vrai plateau avec dés, enchères, coffres, cases bonus et prison.
• Multijoueur : de 2 à 6 joueurs, salons privés avec un code ou partie rapide.
• Entraînement : choisissez votre couleur de carte, sans pression.

★ QUATRE COULEURS DE CARTES
Vert, bleu, rouge, noir : de 4 à 10 lettres, de 20 € à 200 € par carte. Indices, mélange et passe à utiliser au bon moment.

★ STRATÉGIE
Sur le plateau, finir le premier ne suffit pas : enchérissez au bon moment, gérez votre argent, visez les cases qui rapportent. Le bonus d'arrivée compte, mais c'est le total qui décide.

★ PROGRESSION
Niveaux, succès, records, statistiques détaillées et série de jours. Avec un compte (facultatif), votre progression vous suit sur tous vos appareils et vous apparaissez dans les classements.

★ PENSÉ POUR TOUS
• Jouable hors ligne (sauf multijoueur).
• Français et anglais.
• Un mot vous semble oublié ? Contestez-le depuis le jeu.
• Définitions des mots à portée de main.

Les euros du jeu sont une monnaie virtuelle, sans aucune valeur réelle.

Bon jeu !""",
        }
    return {
        "titre": f"{nom}: anagrams",
        "sous_titre": "Anagrams, board & challenges",
        "courte": "Find the anagrams, win the gold: daily challenge, board game and multiplayer.",
        "promo": "New: themed series in Challenge mode and quick match in multiplayer. A new challenge every day, the same cards for everyone.",
        "mots_cles": "anagram,words,letters,word game,vocabulary,board game,daily,puzzle,brain,spelling,scramble",
        "nouveautes": "Themed series in Challenge mode, multiplayer quick match, full offline play, illustrated rules.",
        "longue": f"""{nom} is the anagram game where every word you find earns gold.

One card, one word, one timer: find the hidden anagrams (LISTEN → SILENT, ENLIST…) before time runs out. The harder the card, the bigger the prize. And in the end, it's not the fastest player who wins: it's the richest.

★ MANY WAYS TO PLAY
• Solo mode: Challenge, Festival, Heist and Shadow duel.
• Daily challenge: the same cards for everyone, a new challenge every day, a streak to keep alive.
• Themed series: animals, food, sport, travel, science… plus series of words from other languages, unlocked as you progress.
• Versus AI: a real board with dice, auctions, chests, bonus squares and jail.
• Multiplayer: 2 to 6 players, private rooms with a code or quick match.
• Practice: pick your card colour, no pressure.

★ FOUR CARD COLOURS
Green, blue, red, black: 4 to 10 letters, €20 to €200 per card. Hints, shuffle and skip to use at the right moment.

★ STRATEGY
On the board, finishing first isn't enough: bid at the right time, manage your money, aim for the squares that pay. The arrival bonus counts, but the total decides.

★ PROGRESSION
Levels, achievements, records, detailed statistics and a daily streak. With an (optional) account, your progress follows you on all your devices and you appear on the leaderboards.

★ MADE FOR EVERYONE
• Playable offline (except multiplayer).
• English and French.
• Think a word is missing? Dispute it from the game.
• Word definitions at your fingertips.

The game's euros are a virtual currency with no real-world value.

Have fun!""",
    }


# ------------------------------------------------------------------ réponses aux questionnaires (FR, pour vous guider dans les consoles)
INFOS = [  # (rubrique, Play Console, App Store Connect)
    ("Catégorie", "Jeux › Mots (secondaire : Plateau si proposé)", "Principale : Jeux ; sous-catégories : Mots, Plateau"),
    ("Tags (Play)", "Anagrammes, Mots, Plateau, Solo, Multijoueur, Hors ligne", "—"),
    ("Prix", "Gratuit", "Gratuit"),
    ("Achats intégrés", "Aucun pour l'instant (« Sans pub » payant : plus tard)", "Aucun"),
    ("Contient des annonces", "Oui dès l'activation d'AdMob ; « Non » tant que la version publiée n'en affiche pas", "Déclaré dans « Confidentialité de l'app » (données publicitaires)"),
    ("Public cible", "13 ans et plus (évite les obligations « Familles » pour les annonces)", "Âge : 4+ (questionnaire : aucun contenu sensible)"),
    ("Classification", "Questionnaire IARC : jeu ; violence, peur, sexualité, langage : non ; jeux d'argent : non (monnaie virtuelle sans valeur, pas de mise réelle) ; interactions entre utilisateurs : oui (pseudos et réactions en multijoueur, pas de discussion libre) → PEGI 3 attendu", "Aucun contenu sensible ; « jeux d'argent simulés » : non ; contenu généré par les utilisateurs : pseudos uniquement → 4+"),
    ("Coordonnées", "E-mail de contact obligatoire (marque.json → contact_email), site facultatif", "URL d'assistance obligatoire : page de mentions légales ou site du jeu"),
    ("Politique de confidentialité", SITE + "confidentialite.html (EN : " + SITE + "en/privacy.html)", "même adresse"),
    ("Suppression du compte", "Dans l'appli : Mon compte › Supprimer mon compte. Lien web demandé : " + SITE + "confidentialite.html#droits (explique la suppression dans l'appli ou par e-mail)", "Suppression dans l'appli : oui (obligatoire chez Apple)"),
    ("Accès aux fonctions", "Aucune fonction ne demande de connexion pour l'examen (compte facultatif) : rien à fournir", "Notes pour l'examen : « Compte facultatif ; le multijoueur se teste avec deux appareils ou la partie rapide »"),
]

# Google Play › Contenu de l'appli › Sécurité des données
SECURITE_GENERAL = [
    ("Votre appli collecte-t-elle ou partage-t-elle des données ?", "Oui"),
    ("Les données sont-elles chiffrées lors du transfert ?", "Oui (HTTPS / WSS partout)"),
    ("Les utilisateurs peuvent-ils demander la suppression de leurs données ?", "Oui (dans l'appli, ou par e-mail ; lien web ci-dessus)"),
    ("Engagement « Familles » / examen indépendant", "Non"),
]
# (type Play, collecté, partagé, facultatif ?, finalités, phase)  phase : maintenant / pub (à ajouter quand AdMob est activé)
SECURITE_DONNEES = [
    ("Infos personnelles › Adresse e-mail", "Oui", "Non", "Facultatif (compte)", "Gestion du compte", "maintenant"),
    ("Infos personnelles › ID utilisateur", "Oui", "Non", "Facultatif (compte ; identifiant Google si connexion Google)", "Gestion du compte, fonctionnalité de l'appli", "maintenant"),
    ("Infos personnelles › Nom (pseudo choisi)", "Oui", "Non", "Facultatif (compte)", "Fonctionnalité de l'appli (classements, multijoueur)", "maintenant"),
    ("Infos personnelles › Autres infos (pays déclaré, couleur du pion)", "Oui", "Non", "Facultatif", "Fonctionnalité de l'appli, personnalisation", "maintenant"),
    ("Activité dans l'appli › Autres actions (scores, mots trouvés, progression)", "Oui", "Non", "Facultatif (compte)", "Fonctionnalité de l'appli, prévention des fraudes (anti-triche)", "maintenant"),
    ("Activité dans l'appli › Autre contenu généré par l'utilisateur (mot contesté, sans identité)", "Oui", "Non", "Facultatif", "Fonctionnalité de l'appli (amélioration du dictionnaire)", "maintenant"),
    ("Identifiants de l'appareil ou autres › ID publicitaire", "Oui", "Oui (Google AdMob)", "Obligatoire (pub)", "Publicité ou marketing, statistiques, prévention des fraudes", "pub"),
    ("Position › Position approximative (déduite de l'adresse IP par AdMob)", "Oui", "Oui (Google AdMob)", "Obligatoire (pub)", "Publicité ou marketing, prévention des fraudes", "pub"),
    ("Infos et performances de l'appli › Diagnostics (SDK AdMob)", "Oui", "Oui (Google AdMob)", "Obligatoire (pub)", "Publicité, statistiques", "pub"),
    ("Activité dans l'appli › Interactions avec l'appli (SDK AdMob)", "Oui", "Oui (Google AdMob)", "Obligatoire (pub)", "Publicité ou marketing, statistiques", "pub"),
]
NON_COLLECTE = ("Non déclarés (traitement éphémère ou absent) : réactions et pseudos relayés en multijoueur (en mémoire seulement), "
                "messages, photos, contacts, agenda, position précise, données financières, santé, fichiers.")

# Apple › App Store Connect › Confidentialité de l'app
APPLE_DONNEES = [  # (catégorie Apple, liée à l'identité, suivi, finalités, phase)
    ("Coordonnées › Adresse e-mail", "Oui", "Non", "Fonctionnalités de l'app", "maintenant"),
    ("Identifiants › Identifiant utilisateur", "Oui", "Non", "Fonctionnalités de l'app", "maintenant"),
    ("Contenu utilisateur › Contenu de jeu (scores, mots trouvés, progression)", "Oui", "Non", "Fonctionnalités de l'app", "maintenant"),
    ("Contenu utilisateur › Autre contenu utilisateur (pseudo, pays déclaré)", "Oui", "Non", "Fonctionnalités de l'app", "maintenant"),
    ("Identifiants › Identifiant de l'appareil (IDFA, seulement si l'utilisateur accepte l'ATT)", "Non", "Oui", "Publicité tierce", "pub"),
    ("Données d'utilisation › Données publicitaires", "Non", "Oui", "Publicité tierce, analyses", "pub"),
    ("Localisation › Localisation approximative (AdMob)", "Non", "Non", "Publicité tierce", "pub"),
    ("Diagnostics › Autres données de diagnostic (AdMob)", "Non", "Non", "Analyses", "pub"),
]
