# Vérifier, réserver et protéger le nom du jeu -> docs/aide-choix-du-nom.pdf
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from charte import document, T, B, L
h = "<p class='intro'>Piste favorite : <b>AnagramX</b>. Ce document donne la méthode pour vérifier le nom en 30 minutes, puis le réserver (domaine, pseudos, stores) et le protéger (marque). <b>Important</b> : je n'ai pas accès aux registres de marques, aux registrars de domaines ni aux consoles des stores ; la disponibilité réelle est à confirmer par vous.</p>"
h += "<h2>1. Ce que montre une première recherche (12/11)</h2>" + T([
    ["Recherche web « AnagramX »", "Aucune appli ni jeu de ce nom trouvé. Des noms proches existent (Anagrammy, Anagram Rush, Anagramaster) : pas identiques, mais à garder en tête pour le référencement."],
    ["Atouts", "Se comprend en français et en anglais ; dit le jeu (anagramme) ; le X apporte un côté « défi » et se prête à une icône forte."],
    ["Points d'attention", "« Anagram » est un mot courant : la marque se protège surtout par l'ensemble « AnagramX » (et le logo). Le X peut se prononcer « ix » ou « cross » : à tester à l'oral."]], ["", ""], [30, 70])
h += "<h2>2. Vérifier le nom en 30 minutes (dans cet ordre)</h2>" + L([
    "<b>Recherche web exacte</b> (entre guillemets) avec « app », « game », « jeu » : un jeu ou une société du numérique porte-t-il déjà ce nom ?",
    "<b>Google Play et App Store</b> : tapez le nom dans les deux stores. Un nom identique dans la catégorie Jeux est éliminatoire ; un nom à une lettre près est un risque sérieux.",
    "<b>Noms de domaine</b> (Gandi, OVH ou Cloudflare Registrar) : <code>anagramx.com</code> en priorité, puis <code>.fr</code> et <code>.app</code>. À défaut du .com : une variante propre sans tiret (<code>playanagramx.com</code>, <code>anagramx.game</code>).",
    "<b>Marques</b> (gratuit, 10 min) : TMview (tmdn.org/tmview : UE, France et de nombreux pays), base de l'INPI, Global Brand Database de l'OMPI, USPTO pour les États-Unis. Chercher le nom exact <b>et</b> les variantes proches (Anagram-X, Anagramix…) aux <b>classes 9</b> (applications), <b>28</b> (jeux) et <b>41</b> (divertissement en ligne).",
    "<b>Pseudos des réseaux sociaux</b> : libre sur Instagram, TikTok, YouTube, X, Facebook ? Une variante avec « app » ou « game » (<code>@anagramxgame</code>) est acceptable si le nom seul est pris.",
    "<b>Test oral</b> : dire le nom une fois à 10 personnes et leur demander de l'écrire ; 7 bonnes réponses sur 10, c'est bon signe."])
h += B("Règle simple", "Le nom est éliminé s'il existe déjà comme jeu ou appli, ou comme marque aux classes 9, 28 ou 41 sur un marché visé. Les doublons dans des secteurs sans rapport gênent peu juridiquement mais brouillent le référencement.")
h += "<h2>3. Réserver tout de suite (quelques euros)</h2>" + L([
    "<b>Domaines</b> : le .com et le .fr (environ 10 à 15 € par an chacun). C'est ce qui se perd le plus vite.",
    "<b>Pseudos</b> : créer les comptes Instagram, TikTok, YouTube, X et Facebook au nom du jeu, même vides.",
    "<b>Google Play</b> : le nom de l'appli (30 caractères au plus) n'est pas réservé tant qu'elle n'est pas publiée ; format conseillé « AnagramX – Word Cash Game » pour que le sous-titre porte la recherche. L'identifiant technique (com.…) est figé à la première publication : le choisir à ce moment-là, avec le nom définitif.",
    "<b>App Store</b> : le nom est réservé dès la création de la fiche dans App Store Connect (à faire dès le compte Apple ouvert)."])
h += "<h2>4. Protéger le nom</h2>" + L([
    "<b>Dépôt de marque à l'INPI</b> (en ligne) : de l'ordre de 190 € pour une classe, plus un supplément par classe ajoutée (classes 9, 28 et 41 : environ 270 € au total, tarifs à vérifier sur inpi.fr). Protection en France ; extension à l'Union européenne (EUIPO, quelques centaines d'euros) si le jeu décolle.",
    "Le dépôt est un acte d'éditeur : le faire au nom de la structure qui publiera le jeu, une fois son statut fixé.",
    "Si l'enjeu devient important, faire relire la recherche d'antériorité par un conseil en propriété industrielle : je ne peux pas garantir qu'un nom soit libre.",
    "Penser aussi au <b>dépôt e-Soleau</b> du jeu (noté dans la check-list) pour dater votre création."])
h += "<h2>5. Ce qui se passe quand vous confirmez</h2>" + L([
    "Vous me donnez le nom : je lance l'action « Changer le nom ». Titres, logo, icônes, manifestes, applis Android et iOS, pages légales, pages publiques (anagrammes, présentation), version anglaise et documents se régénèrent. La progression des joueurs n'est pas touchée.",
    "Je prépare les fiches des stores (titre, sous-titre, descriptions FR et EN) et les captures au nouveau nom.",
    "Au changement d'adresse du site (domaine), refaire la déclaration dans Google Search Console."])
document("aide-choix-du-nom.pdf", "Choisir le nom du jeu", "Vérifier, réserver (domaine, pseudos, stores) et protéger le nom — piste AnagramX.", h,
         description="Piste AnagramX : vérification en 30 minutes (stores, domaines, marques INPI/EUIPO/OMPI, pseudos sociaux, test oral), réservation du domaine, des pseudos et du nom sur les stores, dépôt de marque.")
