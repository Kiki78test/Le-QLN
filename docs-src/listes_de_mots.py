# Listes de mots : d'où viennent les cartes, ce qui a été corrigé, ce qui reste à décider -> docs/listes-de-mots/listes-de-mots.pdf
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from charte import document, T, B, L
h = "<p class='intro'>Point d'entrée du dossier « Listes de mots » : d'où viennent les cartes de chaque langue, ce qui a déjà été corrigé, les tableurs à relire et les questions encore ouvertes. Chaque tableur du dossier a une colonne pour vos décisions : renvoyez-le rempli et j'applique.</p>"

h += "<h2>1. Ce qu'il y a dans le jeu aujourd'hui</h2>" + T([
    ["Français", "3 228 cartes · 8 156 mots", "Votre tableau d'origine, contrôlé avec Lexique 3.83 (fréquence des mots) puis corrigé après l'audit externe."],
    ["Anglais", "911 cartes · 2 188 mots", "Construit à partir des fréquences wordfreq (mots courants, formes de base seulement)."],
    ["Espagnol / allemand / italien", "417 / 422 / 226 cartes", "Séries de langue (pour le plaisir, sans classement) : wordfreq + lemmatiseur, formes de base, mots grossiers écartés."],
    ["Thèmes", "16 thèmes FR · 12 EN", "Animaux, cuisine, voyages… : mots de départ croisés avec les dictionnaires (744 mots FR, 293 EN)."],
    ["Définitions", "8 041 / 8 156 mots", "Trouvées au Wiktionnaire (licence CC BY-SA) : affichées au dos des cartes et sur les pages publiques. 115 mots sans définition."]],
    ["Liste", "Taille", "Origine"], [22, 22, 56])

h += "<h2>2. Ce qui a déjà été corrigé</h2>" + L([
    "<b>Audit externe du dictionnaire français</b> (points 1 et 2 appliqués) : sigles, noms propres, mots familiers et fautes de frappe du tableau d'origine retirés des réponses ; cartes devenues trop pauvres retirées (3 231 → 3 228).",
    "<b>Mots acceptés</b> : noms communs, adjectifs, verbes à l'infinitif, participes ; pas de verbes conjugués ni de noms propres. Les accents ne comptent pas (PÂTE = TAPE).",
    "<b>Anglais élargi</b> (option D1 retenue) : 911 cartes au lieu de 534 ; l'option D2 (pluriels et formes conjuguées) a été refusée.",
    "<b>Contestation</b> : un mot juste refusé peut être contesté ; vérifié au Wiktionnaire, il est ajouté pour tous. La page d'administration liste ces mots et permet d'en retirer un."])

h += "<h2>3. Les tableurs de ce dossier</h2>" + T([
    ["le-qln-anagrammes.xlsx", "Toutes les cartes françaises et leurs anagrammes, une feuille par couleur.", "Référence (rien à faire)."],
    ["le-qln-mots-douteux.xlsx", "290 mots du tableau d'origine absents de Lexique, avec un avis (à retirer, à vérifier, correct).", "Colonne « décision » à remplir. Règle actuelle : on les garde."],
    ["le-qln-anagrammes-ecartees.xlsx + cartes-ecartees.pdf", "27 cartes sans aucun mot courant que l'appli ne tirerait plus (elles restent dans la boîte) et 46 cartes limites.", "Valider les 27, trancher les 46."],
    ["le-qln-anglais.xlsx", "Les 911 cartes anglaises, 377 nouvelles marquées.", "Mots ou cartes à retirer."],
    ["le-qln-langues.xlsx", "Cartes espagnoles, allemandes et italiennes.", "Mots ou cartes à retirer."],
    ["le-qln-themes.xlsx", "Mots de départ de chaque thème, FR et EN.", "Mots à retirer ou à ajouter."]],
    ["Fichier", "Contenu", "À faire"], [30, 44, 26])

h += "<h2>4. Questions ouvertes et idées</h2>" + L([
    "<b>Cartes écartées</b> : l'appli ne tirerait plus les 27 cartes sans mot courant (trop frustrantes sur écran) ; à valider, comme les 46 cartes limites.",
    "<b>Mots douteux</b> : garder par défaut (décision prise), sauf ceux que vous marquez « à retirer ».",
    "<b>Italien</b> : la liste est plus courte (226 cartes) ; elle peut grossir en abaissant un peu le seuil de fréquence si vous le souhaitez.",
    "<b>Définitions manquantes</b> (115 mots) : soit on les écrit, soit on accepte qu'elles manquent (le mot reste jouable).",
    "<b>Pages publiques « Anagrammes de… »</b> : elles reprennent ces listes et les définitions ; toute correction ici les met à jour à la publication suivante.",
    "<b>Tapis final</b> : les cases multi-choix n'ont pas d'effet sur les listes (on pioche dans la couleur choisie)."])
h += B("Comment me renvoyer vos choix", "Remplissez les colonnes jaunes des tableurs (x pour retirer une carte, mots à retirer séparés par des virgules) et envoyez-moi le fichier : je régénère le dictionnaire, l'appli, les pages publiques et ce document.")

document("listes-de-mots.pdf", "Listes de mots", "D'où viennent les cartes, ce qui est corrigé, ce qui reste à décider.", h,
         description="Synthèse du dossier : dictionnaires français, anglais, espagnol, allemand, italien et thèmes (origine, tailles), corrections faites, tableurs à relire et questions ouvertes (cartes écartées, mots douteux, définitions).")
