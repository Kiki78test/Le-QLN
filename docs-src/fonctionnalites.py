# Source du document (charte commune : docs-src/charte.py). Régénérer : python3 docs-src/fonctionnalites.py
import os
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "stylepdf.py")).read())
DATE = 'auto'   # document vivant : daté du jour à chaque régénération
def ul(items): return [Paragraph("• "+x, P) for x in items]
st=[]
st+=[Paragraph("Le-QLN — Fonctionnalités",T),Spacer(1,2),Paragraph("Présentation complète de l'application · mise à jour le 14 novembre 2026",S),Spacer(1,8),
 Paragraph("Le-QLN est l'adaptation en application du jeu de plateau d'anagrammes du même nom : sur chaque carte, trouver un autre mot formé exactement des mêmes lettres avant la fin du sablier. L'application fonctionne sur téléphone, tablette et ordinateur, s'installe comme une appli (PWA), marche hors ligne et existe en français et en anglais.",P)]

st.append(Paragraph("1. Les cartes",H))
st.append(tbl([["Couleur","Difficulté","Lettres","Gain","Sablier","Cartes FR / EN"],
 ["Vert","Facile","4 – 5","20 €","30 s","669 / 331"],["Bleu","Intermédiaire","6 – 7","50 €","1 min","1 488 / 166"],
 ["Rouge","Difficile","8 – 9","100 €","2 min","865 / 31"],["Noir","Expert","10 et +","200 €","3 min","209 / 6"]],[22*mm,30*mm,22*mm,20*mm,22*mm,58*mm]))
st+=ul(["<b>Face B</b> : après chaque carte, toutes les solutions s'affichent ; un toucher sur un mot ouvre sa définition (Wiktionnaire), préchargée dès l'apparition de la carte, retrouvée même sans les accents (EPISSURE → épissure), mémorisée 30 jours (hors ligne compris), avec le CNRTL en secours.",
 "<b>Bonus</b> : +25 % si la 1re anagramme est trouvée dans la première moitié du sablier ; +50 % du gain pour chaque anagramme supplémentaire.",
 "<b>Saisie</b> : lettres à toucher ou clavier physique ; boutons Effacer, Mélanger, Indice (1re lettre, gain ÷ 2), Passer, Valider (validation automatique quand le mot est complet).",
 "Dictionnaire français construit à partir de Lexique 3.83 (CC BY-SA 4.0) ; dictionnaire anglais construit et filtré séparément (mots courants, sans grossièretés)."])

st.append(Paragraph("Contester un mot refusé",H2))
st+=ul(["Si un mot formé avec les bonnes lettres n'est pas dans la liste, un bouton <b>« Contester »</b> apparaît à côté du message d'erreur ; le sablier se met en pause pendant la vérification.",
 "Le mot est analysé sur le Wiktionnaire selon les règles du jeu : <b>acceptés</b> — noms communs, adjectifs, verbes à l'infinitif, participes passés et présents (avec pluriels et féminins) ; <b>refusés</b> — verbes conjugués, noms propres, prénoms, sigles, abréviations, mots absents en français. Un mot à plusieurs sens est accepté si l'un d'eux est autorisé.",
 "<b>Accepté</b> : le mot est crédité comme un mot trouvé (mêmes gains), ajouté à la carte et mémorisé sur l'appareil. <b>Refusé</b> : la raison s'affiche avec un lien vers la page Wiktionnaire, puis le sablier repart.",
 "Avec le serveur en ligne, chaque mot accepté est revérifié par le serveur (mêmes règles) puis ajouté au dictionnaire de tous les joueurs.",
 "Limites : 3 contestations par carte ; pas de contestation en « Double ou rien » (un seul essai)."])

st.append(Paragraph("2. Les modes de jeu",H))
st.append(Paragraph("Défi du jour",H2)); st+=ul(["10 cartes identiques pour tous les joueurs du jour, 3 vies, séries et événements. Résultat partageable (voir §5)."])
st.append(Paragraph("Mode solo",H2))
st+=ul(["<b>Le Défi</b> : partie libre de 10 cartes (3 vertes, 3 bleues, 2 rouges, 2 noires), 3 vies, avec toutes les règles avancées activables (§3) ; record conservé.",
 "<b>Le Festival</b> : 5 manches à objectif (Montée des marches, Les sélections, Nuit blanche, Le jury, La Palme d'or), chacune avec médailles bronze / argent / or ; la manche suivante se débloque avec une médaille.",
 "<b>Le Braquage</b> : 6 mots de plus en plus longs (5 à 10 lettres) contre un seul chrono de 6 min ; +20 s par mot trouvé ; record au temps restant.",
 "<b>Duel de l'ombre</b> : les cartes du jour contre le « fantôme » de votre meilleure partie (sa banque s'affiche carte après carte).",
 "<b>Défi de la semaine</b> : une variante par semaine (Sablier éclair, Sans filet, Montée en puissance, Une seule vie) ; un seul essai classé, puis essais libres."])
st.append(Paragraph("Séries du Défi (menu « Série »)",H2))
st+=ul(["Sur l'écran Solo, sous « Le Défi », un bandeau de tuiles à faire défiler (couleurs du thème ou du drapeau, cadenas et niveau requis sur les séries verrouillées) : <b>Classique</b>, <b>langues</b> (cartes en anglais dans la version française, en français dans la version anglaise, et dans les deux versions : <b>espagnol, allemand, italien</b>) ou <b>thème</b>.",
 "<b>16 thèmes en français</b> (Animaux, Cuisine, Paysages et météo, Sports et loisirs, Métiers et personnes, Plantes et fleurs, Corps et santé, Maison et objets, Voyages et géographie, Musique et arts, Sciences, Vêtements et mode, Mer et marine, Émotions et caractère, Transports, Histoire et légendes) ; <b>12 en anglais</b>. Un thème n'est proposé que s'il compte au moins 16 cartes.",
 "Série à thème : 8 cartes dont le mot de départ appartient au thème, de la plus facile à la plus difficile ; toutes les anagrammes du dictionnaire restent acceptées. Les cartes déjà vues sont évitées d'une série à l'autre.",
 "<b>Design</b> : chaque thème a sa couleur (cadre de la carte, lueur de l'écran), un motif de fond avec son emblème et un badge ; une carte d'une autre langue porte les couleurs du drapeau et un badge drapeau. Définitions des mots étrangers : Wiktionnaire de cette langue (nouvel onglet).",
 "<b>Dictionnaires espagnol, allemand, italien</b> (≈ 450, 420 et 230 cartes) : construits à partir de sources libres (fréquences wordfreq, lemmatiseur simplemma) ; formes de base seulement, noms propres et mots anglais écartés, au moins 2 mots courants par carte ; tableur de relecture « Séries en espagnol, allemand, italien ». Disponibles hors ligne.",
 "<b>Déblocage par niveau</b> : 2 thèmes au niveau 1, puis un de plus à chaque niveau ; séries de langue : l'autre langue du jeu au niveau 3, espagnol au niveau 5, allemand au 6, italien au 7 ; annonce quand une série se débloque.",
 "<b>Pas de classement</b> : les séries rapportent de l'XP et comptent dans les statistiques, mais ne sont pas envoyées aux classements. Règles : celles du Défi, sans « choix de la carte » ni carte légendaire.",
 "Listes de mots relisibles dans le tableur « Thèmes » (Documentation) ; source : tools/themes_listes.py, construit par tools/build_themes.py."])
st.append(Paragraph("Entraînement",H2)); st+=ul(["Une couleur au choix, sablier facultatif, cartes à l'infini, sans pression."])
st.append(Paragraph("Contre l'IA (plateau complet)",H2))
st+=ul(["Le plateau du jeu de société : dé 3D, chemins à embranchements, cases de couleur, cases CD, Bonus (40 à 100 €), Malus (40 à 50 €), Prison (caution 50 € ou attente), Passe (on passe son prochain tour), Retour départ.",
 "<b>Durée de partie</b> : courte (dé 1 à 6, environ 20 min) ou longue (dé 1 à 3 : plus de cases et de cartes, environ 45 min), au choix dans la configuration ; en multijoueur, l'hôte choisit dans le salon et la durée s'affiche dans la liste des salons.",
 "<b>Série</b> : une carte réussie ne fait plus relancer le dé ; le joueur peut piocher une 2e carte de la même couleur sur la même case ou s'arrêter (2 cartes par case au plus) ; un échec termine le tour, les gains restent acquis. L'IA décide selon son niveau.",
 "1 à 5 adversaires pilotés par l'IA, niveau Débutant, Joueur ou Expert ; choix du pion ; gains adverses cachés jusqu'à l'arrivée (option) ; tours de l'IA accélérés (option).",
 "Enchères quand un joueur échoue sur sa carte, y compris après une réponse refusée ; une offre acceptée est encaissée mais le tour s'arrête. Ordre de départ au dé, bonus d'arrivée selon le rang (+100 € au 1er … −100 € au 6e), dernier en lice : 3 tours pour franchir l'arrivée. Solde négatif possible (dette envers la banque) ; garant de prison : tous les gains positifs des 2 tours ; égalité départagée par l'ordre d'arrivée. Règles validées par l'auteur du jeu le 14/11/2026.",
 "<b>Le plus riche gagne</b> (pas le premier arrivé), et le jeu le dit : rappel doré dans le panneau « Ordre de départ » et bandeau au début de la partie (« Arriver 1er = +100 € seulement »), colonne « Bonus d'arrivée » sur le plateau, rappel de l'objectif dans le salon multijoueur.",
 "<b>Podium final détaillé</b> : pour chaque joueur, le total et son origine — Cartes, Enchères, Cases (bonus, malus, caution), Arrivée — avec gains en vert et pertes en rouge ; journal de partie, pions qui sautent de case en case."])
st.append(Paragraph("Multijoueur",H2))
st+=ul(["Profil joueur (pseudo + pion), salons publics visibles par tous, code à 5 lettres et lien de partage, liste des joueurs, état « prêt », réactions rapides, lancement par l'hôte (2 à 6 joueurs).",
 "<b>Accueil multi</b> : liste des salons en attente (pions présents, places libres, mis en avant les plus remplis) et nombre de joueurs en ligne.",
 "<b>Partie rapide</b> : un bouton qui rejoint au hasard un salon en attente (le plus rempli), ou en ouvre un automatique ; la partie démarre toute seule quelques secondes après l'arrivée du 2e joueur (3 s si le salon est plein).",
 "<b>Partie sur le plateau, synchronisée</b> : mêmes règles que « Contre l'IA » (dé, choix de la case, cartes et sabliers, enchères, prison et garant, bonus d'arrivée, le plus riche gagne). Chacun joue sur son appareil ; quand un joueur joue sa carte, les autres la voient en direct, préparent une réponse et enchérissent s'il sèche. Les gains des autres restent cachés jusqu'au podium.",
 "<b>Comment c'est synchronisé</b> : chaque appareil fait tourner la même partie à partir d'un hasard commun ; chaque décision d'un joueur est numérotée, validée par l'hôte puis rediffusée à tous. Il faut la même langue et la même version du dictionnaire (sinon le salon refuse l'entrée, avec un message).",
 "<b>Joueur lent ou parti</b> : l'IA joue à sa place (dé lancé, case la plus proche de l'arrivée, carte séchée, pas d'enchère) après un délai (dé et case 45-60 s, carte : sablier + 25 s, enchère 50 s), ou au bout de 3 s s'il a quitté. Tous les joueurs sont prévenus (message, journal, mention « relais IA » sous son nom).",
 "<b>Retour dans la partie</b> : après une coupure réseau, l'appli se reconnecte seule et récupère les coups manqués ; après avoir fermé l'appli, « Reprendre la partie en cours » (écran Multijoueur) rejoue en accéléré les coups déjà joués, puis le joueur reprend la main.",
 "<b>Si l'hôte part</b>, le premier joueur restant devient l'hôte (choisi par le serveur) et la partie continue ; tout le monde est prévenu.",
 "<b>Salons par langue</b> : la liste se filtre par langue (Français, English, Toutes), la langue de l'appli étant affichée par défaut ; rejoindre un salon d'une autre langue ouvre l'appli dans cette langue avec le code déjà saisi. La partie rapide ne choisit que des salons de sa langue.",
 "Fin : podium détaillé chez chacun, « Retour au salon » pour rejouer ; une victoire rapporte 80 XP."])

st.append(Paragraph("3. Les règles avancées (Défi et Festival)",H))
st.append(tbl([["Règle","Effet"],
 ["Série et cagnotte","Les gains vont dans une cagnotte multipliée ×1,5 puis ×2 au fil des réussites ; on peut encaisser ou continuer ; un échec divise la cagnotte par deux."],
 ["Choix entre 3 cartes","Avant chaque carte, trois dos de carte à choisir."],
 ["Jokers","1 indice, 1 mélange, 1 passe ; un joker offert toutes les 3 réussites d'affilée."],
 ["Boutique","Entre deux cartes : indice 30 €, passe 60 €, +10 s 40 €, esquive 30 €."],
 ["Événements","Double ou rien (×2, un seul essai), Sablier éclair (temps ÷ 2, ×1,5), Mot masqué (×1,5), Carte miroir (×1,25), Prime de temps (+30 s), Vie gagnante."],
 ["Coffres","Après les cartes 3, 6 et 9 : choisir un coffre parmi trois (or, joker, vie… ou malus)."],
 ["Carte légendaire","Une carte noire proposée en cours de route, gains ×3."],
 ["Cases spéciales","Bonus, Malus, Passe et Prison entre deux cartes du Défi."]],[38*mm,136*mm]))

st.append(Paragraph("4. Progression du joueur",H))
st+=ul(["<b>Partie guidée</b> proposée au premier lancement : une carte facile sans sablier, 6 bulles explicatives ; rejouable depuis les statistiques.",
 "<b>Niveaux et XP</b> : XP à chaque carte (selon la couleur, les mots bonus, la rapidité), à chaque fin de partie, au défi du jour, aux médailles, braquages et victoires contre l'IA ; titres Apprenti → Lettré → Virtuose → Maître des mots → Légende.",
 "<b>Série de jours</b> 🔥 : au moins une carte par jour ; série actuelle et record.",
 "<b>12 succès</b> (premiers pas, première carte, carte noire, carte parfaite, éclair < 5 s, 1 000 € en une partie, sans faute, défi du jour, victoire contre l'IA, or au Festival, braquage, niveau 10) avec bannière de déblocage.",
 "<b>9 médailles à paliers</b> bronze, argent et or (27 marches) : Collectionneur (cartes gagnées 10/100/500), Assidu (série 3/7/30 jours), Vocabulaire (mots 50/500/2 000), Perfectionniste (cartes parfaites 5/50/200), Stratège (victoires IA 1/10/50), Nuit noire (cartes noires 1/10/50), Fidèle (jours joués 7/30/100), Fortune (gains cumulés 10 000/100 000/1 000 000 €), Ambassadeur (amis invités 1/3/10). Bannière à chaque marche franchie ; dans les statistiques, la prochaine marche et la progression. Les joueurs existants reçoivent sans annonce les médailles déjà méritées ; les médailles suivent le compte d'un appareil à l'autre.",
 "<b>Statistiques</b> : parties, cartes gagnées et taux de réussite, mots trouvés, cartes parfaites, meilleure partie, victoires IA, séries ; réussite et meilleur temps par couleur ; grille des succès ; remise à zéro.",
 "Sur l'accueil : carte de niveau (barre d'XP, série, succès, médailles) et records (Défi, Défi du jour, victoires IA)."])

st.append(Paragraph("5. Partage",H))
st+=ul(["Résultat du défi du jour en grille d'emojis façon Wordle (couleur des cartes gagnées, étoiles des mots bonus), score, étoiles, série et lien vers l'appli ; menu de partage natif sur téléphone, copie sur ordinateur.",
 "Aperçu soigné quand on envoie le lien de l'appli (titre, description, image)."])

st.append(Paragraph("Comptes en ligne et classements",H2))
st+=ul(["<b>Mon compte</b> : création par e-mail et mot de passe (Google en option), pseudo, pion et pays modifiables, déconnexion, suppression complète du compte.",
 "<b>Progression synchronisée</b> entre téléphone et ordinateur (le meilleur des deux appareils est conservé) ; scores envoyés automatiquement en fin de partie.",
 "<b>Classements</b> : défi du jour, Défi et Braquage ; monde ou mon pays ; record ou semaine ; podium avec médailles et rang du joueur.",
 "<b>Anti-triche</b> : les mots trouvés accompagnent chaque score ; pour le défi du jour, le serveur refait le tirage des cartes (identique pour tous) et refuse un score si une carte n'est pas celle du jour, si un mot n'est pas une vraie anagramme ou si le score dépasse le maximum possible. Les mots ajoutés après contestation sont acceptés.",
 "<b>Hors ligne</b> : un score obtenu sans réseau (avion, métro) attend sur l'appareil et part tout seul au retour du réseau ; un défi du jour reste classable pendant 36 h.",
 "<b>Parrainage</b> : dans Mon compte, « Invitez vos amis » donne un lien personnel (…?parrain=CODE) à copier ou partager. L'ami qui crée son compte avec ce lien (le code est aussi pré-rempli dans le formulaire) reçoit +200 XP ; le parrain reçoit +200 XP quand cet ami a vraiment joué (50 XP), jusqu'à 20 amis. Bonus jamais crédité deux fois, même avec plusieurs appareils.",
 "<b>Pseudos corrects</b> : un pseudo grossier (insultes, propos haineux ou sexuels, en français et en anglais, y compris déguisés : « s4l0pe », « p.u.t.e », « puuute », chiffres collés) est refusé à la création du compte, à la modification du profil et dans le profil multijoueur ; ceux qui existeraient déjà sont remplacés par « Joueur » dans les salons et les classements. Les prénoms et mots ordinaires qui contiennent ces lettres (Violette, Computer, Château, Constance…) restent acceptés.",
 "Sans serveur, ces écrans indiquent « Bientôt disponible » et tout reste enregistré sur l'appareil."])

st.append(Paragraph("6. Confort et appli",H))
st+=ul(["<b>Installable</b> (PWA) et <b>hors ligne</b> : après une première visite, tout le jeu (hors multijoueur) fonctionne sans réseau — dictionnaire, modes, progression, pubs. Un réseau lent (wifi d'avion) ne bloque jamais le démarrage : au-delà de 3 s, la copie de l'appareil est utilisée. En ligne, la dernière version est chargée automatiquement (numéro visible en bas du menu). Hors connexion, l'écran multijoueur l'indique clairement.",
 "<b>Applis mobiles</b> : Android (enveloppe autour du site, appli de test publiée automatiquement) et iPhone / iPad (jeu embarqué dans l'appli, fabriqué sur un Mac de GitHub, testé au simulateur ; TestFlight dès que le compte Apple existe). Voir « Version Apple ».",
 "<b>Confidentialité et mentions légales</b> : liens en bas de l'accueil et à la création de compte ; aussi en pages web publiques (adresse exigée par le Play Store), en français et en anglais.",
 "<b>Rappels</b> (Paramètres → Rappels) : « les cartes du jour sont prêtes » chaque jour et « nouveau défi de la semaine » le lundi, à l'heure choisie (8 h à 21 h, heure locale ; jamais après 22 h). Proposés une seule fois après le premier défi du jour. Navigateur et jeu installé sur l'écran d'accueil : notifications envoyées par le serveur ; applis Android et iOS : notifications programmées sur le téléphone. Sur iPhone, il faut d'abord ajouter le jeu à l'écran d'accueil.",
 "<b>Paramètres</b> : son, vibrations et rappels, depuis la barre du bas (ordinateur) ou le menu ☰ (téléphone).",
 "<b>Barre du bas (ordinateur)</b> : Règles, Classement, Paramètres (son, vibrations, rappels) et Aide s'ouvrent dans un volet, sans quitter la partie ; en cours de partie, « Classement » montre le classement de la partie.",
 "<b>Tablettes</b> (iPad, tablettes Android) : la mise en page du téléphone est agrandie à la taille de l'écran en portrait (fenêtre virtuelle de 500 à 680 px), sans rien perdre de la jouabilité au doigt.",
 "<b>Tout sur un écran (ordinateur)</b> : un écran un peu trop haut (réglages d'une partie, mode solo, multijoueur) est réduit automatiquement pour tenir sans défilement ; les écrans longs (règles, documentation, classements) défilent normalement.",
 "<b>Jetons des joueurs</b> : silhouette dans un anneau lumineux de leur couleur (panneaux, salons, podium) ; sur le plateau, jeton rond à l'initiale du joueur.",
 "<b>Barre du haut et menu ☰</b> : accueil, statistiques, compte, classements, partie guidée, règles, documentation, paramètres et rappels, son, installation ; en bas du menu, liens vers la présentation du jeu et toutes les anagrammes.",
 "<b>Français / anglais</b> : bouton FR / EN en haut, dictionnaire propre à chaque langue.",
 "<b>Bouton retour</b> du téléphone géré (ne ferme plus l'appli en pleine partie) ; <b>pause automatique</b> si l'appli passe en arrière-plan pendant un sablier ; <b>écran maintenu allumé</b> pendant une partie ; croix pour quitter même quand une carte est affichée.",
 "<b>Sons</b> (fanfare de victoire, tic-tac du sablier qui s'accélère, dé, pièces) avec bouton de coupure ; <b>vibrations</b> légères.",
 "<b>Design</b> : univers bleu nuit et or avec traînées lumineuses, contours fins, lettres vert émeraude, carte qui se retourne, plateau au cadre doré lumineux, dé blanc en 3D (trois faces visibles) lancé sur le plateau dans un tourbillon d'anneaux dorés, confettis, écran de récompense ; accueil et plateau tenant sur un seul écran (téléphone et ordinateur).",
 "<b>Accessibilité</b> : animations réduites si le téléphone le demande, libellés pour les lecteurs d'écran, grandes zones de toucher.",
 "<b>Aide</b> : règles du jeu illustrées (exemple d'anagramme en tuiles, cartes des quatre couleurs, piste, dé et bonus d'arrivée, touches du clavier), bulles d'information « i » sur chaque mode, définitions des mots."])

st.append(Paragraph("7. Publicité et monétisation (simulation)",H))
st+=ul(["Bascule <b>Pub / No Pub</b> en haut de l'écran avec compteur de revenu simulé.",
 "Jamais de publicité pendant un sablier ni sur l'écran de carte ; aucune vidéo à la 1re partie, puis au plus une toutes les 3 min, entre deux parties ou toutes les 5 cartes ; bandeaux sur les écrans calmes, grand format en fin de partie ; vidéo récompense facultative (+1 indice).",
 "<b>Hors ligne</b> : même rythme et mêmes emplacements, les créations étant en cache sur l'appareil ; les affichages hors ligne sont comptés à part. Avec une vraie régie : annonces préchargées tant que le réseau est là, puis repli sur des créations locales (autopromotion, « Sans pub ») — une régie ne rémunère pas un affichage hors ligne.",
 "Étude détaillée et décisions à prendre : document « Monétisation publicitaire »."])
st+=ul(["<b>Vraies publicités (applis)</b> : Google AdMob prêt dans les applis Android et iOS (interstitiel entre deux parties ou toutes les 5 cartes, vidéo récompense), consentement RGPD au premier lancement et menu « Choix publicitaires », demande de suivi Apple (ATT) sur iPhone, repli sur la démonstration hors ligne ou sans annonce. S'active en saisissant les identifiants AdMob dans config.js (QLN_ADMOB) ; d'ici là, démonstration."])

st.append(Paragraph("8. Documentation intégrée",H))
st+=ul(["Onglet Documentation (accueil) : PDF et tableurs datés — choix du nom, textes juridiques, mise en ligne du serveur, publicité réelle, idées de noms, monétisation publicitaire, propositions de règles, mots douteux, dictionnaire anglais, et ce document."])

st.append(Paragraph("9. Administration, suivi et visibilité",H))
st+=ul(["<b>Remontée des erreurs</b> : chaque erreur rencontrée par un joueur (navigateur ou appli) est envoyée au serveur, une fois par session et par message, regroupée avec un compteur (message, fichier, ligne, version, écran, langue, appareil — aucune donnée personnelle).",
 "<b>Page d'administration</b> (adresse du jeu + admin.html ; lien « Administration » dans Mon compte pour les administrateurs) : tableau de bord (comptes, actifs 24 h / 7 j / 30 j, défis du jour, scores, parrainages, abonnés aux rappels, mots ajoutés, erreurs), activité sur 30 jours, pays, état du serveur ; onglets Erreurs (détail, effacement), Joueurs (recherche), Mots ajoutés (retrait d'un mot contesté), Rappels (envoi d'un rappel de test). Accès réservé aux adresses de la variable ADMIN_EMAILS (Render).",
 "<b>Surveillance</b> : vérification du serveur et de la base toutes les heures par GitHub (e-mail en cas de panne), qui réveille aussi le serveur gratuit pour les rappels ; UptimeRobot en complément (toutes les 5 min). Voir « Administration et surveillance ».",
 "<b>Pages publiques pour Google</b> (site seulement, pas dans l'appli) : une page par mot du jeu, « Anagrammes de CHIEN » (environ 8 200 pages en français, 2 200 en anglais) avec les autres mots de la carte, sa couleur, les définitions du Wiktionnaire et un bouton « Jouer » ; index par lettre ; page de présentation du jeu (principe, couleurs, modes, progression, captures, questions fréquentes) en français et en anglais ; plan du site sitemap.xml à déclarer dans Google Search Console.",
 "<b>Contrôle de la traduction</b> : un test parcourt les écrans de la version anglaise et échoue si un texte français y est visible."])

st.append(Paragraph("10. Ce qui reste à faire",H))
st+=ul([ "Mot de passe oublié (service d'e-mail), amis ; chronos du défi du jour rejoués côté serveur (les mots et cartes sont déjà vérifiés).",
 "Renseigner l'éditeur, l'adresse et le contact légaux (marque.json) ; relecture des textes juridiques.",
 "Vraie régie publicitaire : AdMob et consentement prêts dans les applis ; reste à mettre les identifiants AdMob réels et l'achat « Sans pub ».",
 "Pistes notées (check-list) : test d'intrusion, kit de lancement réseaux sociaux, aide en questions-réponses avec IA, dépôt e-Soleau.",
 "Hébergement : base Render à passer en Basic avant le 10/12/2026, serveur en Starter à l'ouverture au public ; domaine (Cloudflare) quand le nom est choisi.",
 "Décisions en attente : vidéos récompense touchant aux règles, propositions de règles, mots douteux, nom définitif."])
st.append(Paragraph("Historique des versions",H))
st+=ul(["<b>14 nov. 2026</b> — règles du plateau validées par l'auteur du jeu : série de 2 cartes par case au lieu de « rejouer », partie courte ou longue (choisie par l'hôte en multijoueur), enchères possibles après une réponse refusée, Passe = un tour passé, enchère acceptée sans rejouer, dernier en lice 3 tours, égalité à l'ordre d'arrivée.",
 "<b>11 nov. 2026</b> — repris d'Airmony : remontée des erreurs et page d'administration, surveillance horaire du serveur, contrôle automatique de la traduction anglaise, pages publiques « Anagrammes de… » et page de présentation (référencement), parrainage (+200 XP de part et d'autre), rappels par notification (défi du jour, défi de la semaine), 9 médailles bronze / argent / or, filtre des pseudos grossiers ; entrée « Paramètres et rappels » dans le menu ☰.",
 "<b>10 nov. 2026 (nuit)</b> — écran Solo sur ordinateur en deux colonnes équilibrées (Partie libre / Campagnes) ; bande des séries : nombre de séries affiché, flèches ‹ › quand il en reste d'un côté, petit aller-retour de démonstration à la première visite.",
 "<b>10 nov. 2026 (nuit)</b> — choix de la série en tuiles (au lieu du menu déroulant) ; le contenu ne passe plus derrière le filet doré du bas.",
 "<b>10 nov. 2026 (nuit)</b> — tablettes (iPad…) : la mise en page du téléphone est agrandie à la taille de l'écran ; appli iOS pour iPhone et iPad, captures iPad 13 pouces pour l'App Store.",
 "<b>10 nov. 2026 (nuit)</b> — appli Android à publier (.aab signé, clé d'envoi chiffrée) ; vraies publicités AdMob prêtes dans les applis (consentement RGPD, ATT, menu « Choix publicitaires »).",
 "<b>10 nov. 2026 (soir)</b> — définitions vérifiées au Wiktionnaire pour tout le dictionnaire français : 98 % des 8 156 mots en ont une (115 sans, liste dans « Cartes écartées de l'appli ») ; action GitHub « Définitions (Wiktionnaire) ».",
 "<b>10 nov. 2026 (soir)</b> — dictionnaire français corrigé après audit externe : sigles, noms propres et mots familiers retirés des réponses (SFIO, BAES, PETA, RÉAC, NERAC, PETRO, PETROS, ESPORT, LOIRET, PERSO), fautes de frappe du tableau d'origine retirées (CAROSSIER, SERPIERE, CROLATES, ENTONOIR) ; 3 228 cartes (outil tools/corrections_fr.py).",
 "<b>10 nov. 2026 (soir)</b> — dictionnaire anglais agrandi : 911 cartes au lieu de 534 (formes de base seulement, mots un peu moins courants acceptés), 12 thèmes anglais au lieu de 9 ; tableur de relecture « Dictionnaire anglais ».",
 "<b>10 nov. 2026 (nuit)</b> — nouveau fond bleu roi (faisceaux de lumière, étincelles dorées, grandes lettres fantômes, filet doré en bas) sur l'interface et le plateau ; flèches des tuiles de l'accueil sur le bord droit ; infobulles placées pour ne jamais cacher les lettres.",
 "<b>10 nov. 2026 (nuit)</b> — dépôt rangé (jeu dans app/, même adresse) ; multijoueur synchronisé sur le plateau (mêmes règles que contre l'IA) ; fiches des stores (textes FR/EN, captures, questionnaires) ; séries en espagnol, allemand et italien.",
 "<b>10 nov. 2026 (soirée)</b> — barre du bas sur ordinateur, jetons des joueurs (anneau lumineux, initiale sur le plateau), chevrons sur les tuiles de l'accueil.",
 "<b>10 nov. 2026 (soirée)</b> — règles du jeu illustrées ; documentation à signature visuelle commune ; « le plus riche gagne » rendu évident sur le plateau.",
 "<b>10 nov. 2026 (fin de journée)</b> — design rapproché des maquettes : dé blanc 3D avec halo et anneaux dorés, cadre lumineux du plateau, libellés du plateau en caractères gras, traînées de lumière en fond.",
 "<b>10 nov. 2026 (fin de journée)</b> — séries du Défi (thèmes et autre langue, débloquées par niveau) ; vibrations plus douces ; lueur de validation ; vitrine de l'accueil qui « tremble » sur un faux mot ; barres de défilement masquées.",
 "<b>10 nov. 2026 (fin de journée)</b> — version Apple préparée (iPhone et iPad).",
 "<b>10 nov. 2026 (fin de journée)</b> — jeu complet hors ligne : scores en attente envoyés au retour du réseau, démarrage rapide sur réseau lent, vidéos de pub en cache, multijoueur signalé hors connexion.",
 "<b>10 nov. 2026 (soir)</b> — accueil multi avec salons en attente et Partie rapide ; anti-triche (le serveur refait le tirage du défi du jour et vérifie mots et score) ; politique de confidentialité et mentions légales (appli, pages web, PDF) ; aide au choix du nom.",
 "<b>10 nov. 2026</b> — serveur en ligne (Render, base dédiée), tests et mises à jour automatiques, appli Android de test ; nom changeable en un seul endroit.",
 "<b>10 nov. 2026</b> — contestation des mots refusés ; définitions plus rapides et retrouvées sans accents.",
 "<b>9 nov. 2026</b> — partie guidée, niveaux, succès, statistiques, partage du défi du jour ; comptes et classements (code prêt) ; nouveau design (barre du haut, menu, contours fins), dé 3D sur le plateau, accueil et plateau sur un seul écran.",
 "<b>8 nov. 2026</b> — version anglaise, multijoueur (salons publics), publicités repositionnées, sons et animations."])
doc=SimpleDocTemplate("fonctionnalites.pdf",pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=15*mm,bottomMargin=15*mm,title="Le-QLN — Fonctionnalités",author="Claude")
doc.build(st)
