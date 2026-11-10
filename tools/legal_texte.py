"""Source unique des textes juridiques (FR + EN) : politique de confidentialité et mentions légales.
Tout est généré à partir d'ici par tools/build_legal.py : pages dans l'appli (legal.js), pages web publiques
(confidentialite.html, mentions-legales.html, en/privacy.html, en/legal-notice.html) et PDF (docs/).
Le nom du jeu et les coordonnées de l'éditeur viennent de marque.json : ne rien écrire en dur ici.
Un bloc est un paragraphe (str) ou une liste à puces (list[str]).
Une section est (titre, blocs) ou (titre, ancre, blocs) : l'ancre donne un lien direct (ex. confidentialite.html#droits)."""

MAJ = "2026-11-10"          # à changer à chaque modification du fond
A_COMPLETER = {"fr": "[à compléter]", "en": "[to be completed]"}


def _v(M, cle, lang):
    return (M.get(cle) or "").strip() or A_COMPLETER[lang]


def contenu(lang, M):
    nom = M["nom"]
    ed, adr, mail = _v(M, "editeur", lang), _v(M, "adresse", lang), _v(M, "contact_email", lang)
    if lang == "fr":
        return {
            "confidentialite": {
                "titre": "Politique de confidentialité",
                "maj": "Dernière mise à jour : 10 novembre 2026",
                "intro": f"{nom} est un jeu d'anagrammes. Cette page explique, simplement, quelles données sont utilisées quand vous jouez, pourquoi, et comment exercer vos droits (RGPD).",
                "sections": [
                    ("Qui est responsable de vos données ?", [
                        f"{nom} est édité par {ed}. Pour toute question sur vos données : {mail}.",
                    ]),
                    ("Jouer sans compte", [
                        "Vous pouvez jouer sans créer de compte. Dans ce cas, votre progression, vos réglages, vos records et votre profil restent uniquement sur votre appareil (stockage local du navigateur ou de l'appli). Nous n'y avons pas accès et vous pouvez les effacer à tout moment en vidant les données du site ou de l'appli.",
                        "Seules exceptions : un mot que vous contestez (le mot et la langue, sans votre identité) est envoyé pour examen, et les parties multijoueur transitent par notre serveur (voir plus bas).",
                    ]),
                    ("Avec un compte : les données traitées", [[
                        "Adresse e-mail et mot de passe (le mot de passe n'est jamais conservé en clair : seule une empreinte chiffrée est stockée).",
                        "Pseudo, couleur du pion et pays (facultatif).",
                        "Progression synchronisée : niveau, points d'expérience, statistiques, succès, records.",
                        "Scores du défi du jour et des autres modes classés, avec les mots trouvés lors de la partie (pour vérifier que le score est régulier).",
                        "Si vous choisissez la connexion Google : l'identifiant et l'adresse e-mail que Google nous transmet. Nous ne recevons jamais votre mot de passe Google.",
                    ]]),
                    ("Parties multijoueur", [
                        "Votre pseudo, votre pion et vos réactions transitent par notre serveur pour être transmis aux autres joueurs du salon. Ils ne sont pas enregistrés : un salon n'existe qu'en mémoire et disparaît quand il se ferme. La liste des salons en attente est visible par les autres joueurs connectés (pseudo de l'hôte et pions présents).",
                    ]),
                    ("Données techniques", [
                        "Comme tout service en ligne, nos hébergeurs voient votre adresse IP et conservent des journaux techniques pour la sécurité et le bon fonctionnement. Le serveur limite le nombre de requêtes par adresse (compteurs en mémoire, effacés automatiquement) pour se protéger des abus. Le jeu ne dépose aucun cookie de suivi.",
                    ]),
                    ("Pourquoi, et sur quelle base légale ?", [[
                        "Fournir le jeu et le compte (synchronisation entre appareils, classements) : exécution du service que vous demandez.",
                        "Sécurité, prévention des abus et vérification des scores (anti-triche) : intérêt légitime.",
                        "Connexion Google et publicité personnalisée (si elle est activée) : votre consentement, que vous pouvez retirer à tout moment.",
                    ]]),
                    ("Classements publics", [
                        "Dans les classements, les autres joueurs voient votre pseudo, votre pion, votre pays (si renseigné) et votre score. Jamais votre e-mail. Choisissez un pseudo qui ne vous identifie pas.",
                    ]),
                    ("Publicité", [
                        "À la date de cette version, les publicités du jeu sont des simulations : aucune donnée n'est envoyée à une régie publicitaire. Si de vraies publicités sont activées (par exemple Google AdSense ou AdMob), le fournisseur pourra utiliser des identifiants publicitaires ou des cookies. Avant cela, un bandeau vous demandera votre consentement (refus possible, retrait à tout moment), et cette page sera mise à jour.",
                    ]),
                    ("Qui reçoit des données ?", [
                        "Nous ne vendons aucune donnée. Nous faisons appel à des prestataires techniques :",
                        ["Render (hébergement du serveur et de la base de données, centre de données de Francfort, Allemagne).",
                         "GitHub Pages (diffusion du site et de l'appli web).",
                         "Google (connexion Google facultative ; publicité si elle est activée).",
                         "Resend (envoi d'e-mails du compte, si cette fonction est activée).",
                         "Wiktionnaire / Wikimedia (définitions et vérification d'un mot contesté : le mot recherché est envoyé, pas votre identité ; votre adresse IP est visible de ce service)."],
                        "Certains de ces prestataires sont des sociétés américaines : les transferts éventuels hors de l'Union européenne sont encadrés par des clauses contractuelles types ou le cadre de protection des données UE–États-Unis.",
                    ]),
                    ("Combien de temps ?", [[
                        "Compte, progression et scores : jusqu'à la suppression de votre compte.",
                        "Mots contestés : tant qu'ils servent à améliorer le dictionnaire.",
                        "Journaux techniques : durée limitée fixée par l'hébergeur.",
                        "Données locales de l'appareil : tant que vous ne les effacez pas.",
                    ]]),
                    ("Vos droits", "droits", [
                        "Vous pouvez accéder à vos données, les corriger, les effacer, les récupérer, limiter leur usage, vous y opposer et retirer un consentement.",
                        "Dans l'appli : Mon compte permet de modifier votre profil et de supprimer votre compte. La suppression efface le compte, la progression en ligne et les scores.",
                        f"Supprimer votre compte sans l'appli : écrivez à {mail} depuis l'adresse e-mail du compte, en demandant sa suppression. Elle est faite sous 30 jours et confirmée par e-mail. Sont effacés : le compte (e-mail, pseudo, pays, pion), la progression en ligne et tous les scores. Rien n'est conservé, hormis les journaux techniques de l'hébergeur pendant leur durée limitée.",
                        f"Pour toute autre demande : {mail}. En cas de désaccord, vous pouvez saisir la CNIL (www.cnil.fr).",
                    ]),
                    ("Enfants", [
                        "Le jeu est tout public, mais la création d'un compte est réservée aux personnes d'au moins 15 ans (ou avec l'accord d'un parent ou représentant légal). Nous ne cherchons pas à collecter de données sur de plus jeunes enfants.",
                    ]),
                    ("Sécurité", [
                        "Connexions chiffrées (HTTPS), mots de passe chiffrés, limitation des tentatives de connexion, accès restreint à la base de données. Aucune mesure n'est infaillible : en cas de violation présentant un risque pour vous, nous vous en informerons.",
                    ]),
                    ("Modifications", [
                        "Cette page peut évoluer. La date de mise à jour figure en haut ; tout changement important sera signalé dans l'appli.",
                    ]),
                ],
            },
            "mentions": {
                "titre": "Mentions légales",
                "maj": "Dernière mise à jour : 10 novembre 2026",
                "intro": "",
                "sections": [
                    ("Éditeur", [[
                        f"Éditeur : {ed}",
                        f"Adresse : {adr}",
                        f"Contact : {mail}",
                        f"Directeur de la publication : {ed}",
                    ]]),
                    ("Hébergement", [[
                        "Serveur et base de données : Render Services, Inc., 525 Brannan Street, Suite 300, San Francisco, CA 94107, États-Unis (render.com). Centre de données : Francfort, Allemagne.",
                        "Site et appli web : GitHub, Inc. (GitHub Pages), 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis (github.com).",
                    ]]),
                    ("Monnaie du jeu", [
                        f"Les euros de {nom} sont une monnaie virtuelle, propre au jeu. Ils n'ont aucune valeur réelle, ne peuvent pas être échangés, retirés ni convertis, et leur gain ne procure aucun avantage financier.",
                    ]),
                    ("Propriété intellectuelle", [
                        f"Le nom {nom}, le logo, le design, le code et les textes du jeu sont protégés. Toute reproduction ou réutilisation sans autorisation est interdite.",
                        "Crédits :",
                        ["Dictionnaire français construit à partir de Lexique 3.83 (New, Pallier et al., www.lexique.org), licence CC BY-SA 4.0.",
                         "Définitions et vérifications de mots : Wiktionnaire (Wikimedia Foundation), licence CC BY-SA 4.0.",
                         "Dictionnaire anglais construit à partir de sources libres (liste Webster's 2nd, fréquences wordfreq, lemminflect).",
                         "Polices Barlow et Barlow Condensed, licence SIL Open Font License 1.1."],
                    ]),
                    ("Responsabilité", [
                        f"{nom} est fourni « en l'état ». Malgré le soin apporté au dictionnaire, une erreur ou un mot manquant est possible : vous pouvez contester un mot depuis le jeu. L'éditeur ne peut être tenu responsable d'une interruption du service ni de la perte de données stockées sur votre appareil.",
                        "Les liens vers des sites tiers (par exemple les dictionnaires en ligne) n'engagent pas l'éditeur sur leur contenu.",
                    ]),
                    ("Données personnelles", [
                        "Le traitement des données est décrit dans la politique de confidentialité.",
                    ]),
                    ("Droit applicable", [
                        "Le droit français s'applique, sous réserve des règles impératives de protection des consommateurs de votre pays de résidence.",
                    ]),
                ],
            },
            "libelles": {"confidentialite": "Confidentialité", "mentions": "Mentions légales", "retour": "Retour"},
        }
    # ---------------------------------------------------------------- English
    return {
        "confidentialite": {
            "titre": "Privacy policy",
            "maj": "Last updated: 10 November 2026",
            "intro": f"{nom} is an anagram game. This page explains, in plain words, what data is used when you play, why, and how to exercise your rights (GDPR).",
            "sections": [
                ("Who is responsible for your data?", [
                    f"{nom} is published by {ed}. For any question about your data: {mail}.",
                ]),
                ("Playing without an account", [
                    "You can play without creating an account. In that case your progress, settings, records and profile stay only on your device (browser or app local storage). We cannot access them and you can erase them at any time by clearing the site or app data.",
                    "The only exceptions: a word you dispute (the word and the language, without your identity) is sent for review, and multiplayer games go through our server (see below).",
                ]),
                ("With an account: the data we process", [[
                    "Email address and password (the password is never stored in clear text: only an encrypted hash is kept).",
                    "Nickname, pawn colour and country (optional).",
                    "Synced progress: level, experience points, statistics, achievements, records.",
                    "Scores for the daily challenge and other ranked modes, together with the words found during the game (to check the score is legitimate).",
                    "If you choose Google sign-in: the identifier and email address Google passes to us. We never receive your Google password.",
                ]]),
                ("Multiplayer games", [
                    "Your nickname, pawn and reactions go through our server so they can reach the other players in the room. They are not stored: a room only exists in memory and disappears when it closes. The list of waiting rooms is visible to other connected players (host nickname and pawns present).",
                ]),
                ("Technical data", [
                    "Like any online service, our hosting providers see your IP address and keep technical logs for security and reliability. The server limits the number of requests per address (in-memory counters, erased automatically) to protect itself from abuse. The game sets no tracking cookies.",
                ]),
                ("Why, and on what legal basis?", [[
                    "Providing the game and the account (syncing between devices, leaderboards): performance of the service you request.",
                    "Security, abuse prevention and score checking (anti-cheat): legitimate interest.",
                    "Google sign-in and personalised advertising (if enabled): your consent, which you can withdraw at any time.",
                ]]),
                ("Public leaderboards", [
                    "On leaderboards, other players can see your nickname, pawn, country (if provided) and score. Never your email. Pick a nickname that does not identify you.",
                ]),
                ("Advertising", [
                    "As of this version, the game's ads are simulations: no data is sent to any ad network. If real ads are enabled (for example Google AdSense or AdMob), the provider may use advertising identifiers or cookies. Before that, a banner will ask for your consent (you can refuse and withdraw at any time), and this page will be updated.",
                ]),
                ("Who receives data?", [
                    "We do not sell any data. We use technical providers:",
                    ["Render (server and database hosting, Frankfurt data centre, Germany).",
                     "GitHub Pages (delivery of the website and web app).",
                     "Google (optional Google sign-in; advertising if enabled).",
                     "Resend (account emails, if that feature is enabled).",
                     "Wiktionary / Wikimedia (definitions and checking of a disputed word: the searched word is sent, not your identity; your IP address is visible to that service)."],
                    "Some of these providers are US companies: any transfer outside the European Union is covered by standard contractual clauses or the EU–US data protection framework.",
                ]),
                ("How long?", [[
                    "Account, progress and scores: until you delete your account.",
                    "Disputed words: as long as they help improve the dictionary.",
                    "Technical logs: a limited period set by the hosting provider.",
                    "Local device data: until you erase it.",
                ]]),
                ("Your rights", "droits", [
                    "You can access, correct, erase and export your data, restrict its use, object to it and withdraw consent.",
                    "In the app: My account lets you edit your profile and delete your account. Deletion erases the account, the online progress and the scores.",
                    f"Deleting your account without the app: email {mail} from your account's email address and ask for deletion. It is done within 30 days and confirmed by email. Deleted: the account (email, nickname, country, pawn), the online progress and all scores. Nothing is kept, apart from the hosting provider's technical logs for their limited period.",
                    f"For any other request: {mail}. If you disagree with how we handle it, you can lodge a complaint with your data protection authority (in France, the CNIL: www.cnil.fr).",
                ]),
                ("Children", [
                    "The game is for everyone, but creating an account is reserved for people aged 15 or over (or with the consent of a parent or legal guardian). We do not knowingly collect data about younger children.",
                ]),
                ("Security", [
                    "Encrypted connections (HTTPS), encrypted passwords, limited login attempts, restricted database access. No measure is foolproof: if a breach puts you at risk, we will tell you.",
                ]),
                ("Changes", [
                    "This page may change. The update date is shown at the top; any important change will be announced in the app.",
                ]),
            ],
        },
        "mentions": {
            "titre": "Legal notice",
            "maj": "Last updated: 10 November 2026",
            "intro": "",
            "sections": [
                ("Publisher", [[
                    f"Publisher: {ed}",
                    f"Address: {adr}",
                    f"Contact: {mail}",
                    f"Publication director: {ed}",
                ]]),
                ("Hosting", [[
                    "Server and database: Render Services, Inc., 525 Brannan Street, Suite 300, San Francisco, CA 94107, USA (render.com). Data centre: Frankfurt, Germany.",
                    "Website and web app: GitHub, Inc. (GitHub Pages), 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA (github.com).",
                ]]),
                ("In-game currency", [
                    f"The euros in {nom} are a virtual currency belonging to the game. They have no real value, cannot be exchanged, withdrawn or converted, and winning them gives no financial benefit.",
                ]),
                ("Intellectual property", [
                    f"The {nom} name, logo, design, code and texts are protected. Any reproduction or reuse without permission is prohibited.",
                    "Credits:",
                    ["French dictionary built from Lexique 3.83 (New, Pallier et al., www.lexique.org), CC BY-SA 4.0 licence.",
                     "Definitions and word checks: Wiktionary (Wikimedia Foundation), CC BY-SA 4.0 licence.",
                     "English dictionary built from open sources (Webster's 2nd word list, wordfreq frequencies, lemminflect).",
                     "Barlow and Barlow Condensed fonts, SIL Open Font License 1.1."],
                ]),
                ("Liability", [
                    f"{nom} is provided \"as is\". Despite the care taken over the dictionary, an error or a missing word is possible: you can dispute a word from within the game. The publisher cannot be held liable for a service interruption or for loss of data stored on your device.",
                    "Links to third-party sites (for example online dictionaries) do not make the publisher responsible for their content.",
                ]),
                ("Personal data", [
                    "How data is processed is described in the privacy policy.",
                ]),
                ("Governing law", [
                    "French law applies, subject to the mandatory consumer protection rules of your country of residence.",
                ]),
            ],
        },
        "libelles": {"confidentialite": "Privacy", "mentions": "Legal notice", "retour": "Back"},
    }
