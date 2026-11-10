# Source du document (charte commune : docs-src/charte.py). Régénérer : python3 docs-src/choix_du_nom.py
import os
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "stylepdf.py")).read())
def puces(l): return [Paragraph("• "+x,P) for x in l]
def nums(l,d=1): return [Paragraph("<b>%d.</b> %s"%(i+d,x),P) for i,x in enumerate(l)]
st=[Paragraph("Choisir le nom du jeu — aide à la décision",T),Spacer(1,2),Paragraph("Présélection, premières vérifications, méthode pas à pas · 10 novembre 2026",S),Spacer(1,8),
Paragraph("Ce document complète « Idées de noms » (17 pistes). Il réduit la liste à 4 noms, résume ce que j'ai pu vérifier depuis mon poste (recherches web uniquement) et vous donne la méthode pour trancher sans perdre de temps. <b>Important</b> : je n'ai pas accès aux registres de marques, aux registrars de noms de domaine ni aux stores ; la disponibilité réelle reste à confirmer par vous avec les liens de la partie 3.",P)]
st.append(Paragraph("1. La présélection",H))
st.append(tbl([["Nom","Atouts","Réserves","Ce que ma recherche web a montré"],
["<b>Anagold</b><br/>(Word Cash Game)","Dit tout : anagramme + or. Icône évidente (pièce). Facile à prononcer en FR et EN.","« Gold » est très utilisé (jeux, mines, finance) : risque de confusion.","Aucune appli du même nom trouvée. Mais une appli iOS « Anagrams Gold » existe, et « Anagold » est le nom d'une société minière turque (secteur sans rapport, mais bruit dans les résultats)."],
["<b>Qlinn</b><br/>(Anagram Cash Game)","Garde l'ADN de Le-QLN. Court, original, très « marque ». Libre de sens : se défend bien.","Ne dit rien du jeu seul (le sous-titre doit le faire). Proche de « Quinn » à l'oral : risque de marques sonores voisines.","Aucun jeu ou appli « Qlinn » trouvé. De nombreuses marques « Quinn » existent aux États-Unis (à examiner en classes 9 et 28)."],
["<b>Lexipot</b><br/>(Word Jackpot)","Lexique + pot : mots et cagnotte. Ludique, sonne bien en FR et EN.","« Pot » peut évoquer autre chose (plante, cannabis). Moins prestigieux.","Rien trouvé sous ce nom exact (que des objets « Lexi pot »). Une famille de noms en « Lexi… » est très occupée côté jeux de mots."],
["<b>Wordheist</b><br/>(Anagram Cash Showdown)","Le « casse de mots » : cohérent avec le Braquage et la banque. Ton fun, bon pour le multijoueur.","Anglais pur : moins « français ». « Word… » très encombré côté jeux de mots.","Rien trouvé sous ce nom exact."]],[27*mm,48*mm,48*mm,51*mm]))
st.append(Spacer(1,5))
st.append(Paragraph("<b>Mon classement actuel</b> : 1) <b>Qlinn</b> si vous voulez une marque forte et défendable, avec un bon sous-titre de store ; 2) <b>Anagold</b> si vous préférez la clarté immédiate, à condition que les vérifications soient propres ; 3) Wordheist ; 4) Lexipot. Les noms purement descriptifs sont plus faciles à comprendre mais plus difficiles à protéger : c'est le compromis à trancher.",P))
st.append(Paragraph("2. Ce qui change selon le choix (et ce qui ne change pas)",H))
st+=puces(["<b>Rien à refaire côté technique</b> : le nom se change en un seul endroit (action GitHub « Changer le nom », ou marque.json). Titres, logo, manifestes, appli Android, pages légales et version anglaise se régénèrent. Ce qui ne change jamais : la progression des joueurs déjà enregistrée.",
"<b>L'identifiant technique de l'appli Android</b> (com.…) est figé à la première publication sur le Play Store : à choisir juste avant la première mise en ligne, quand le nom est décidé.",
"<b>Le logo</b> : l'écriture « LE - QLN » est prévue pour un nom court ; au-delà de 10 caractères il faut revoir le rendu (l'outil le signale).",
"<b>En attendant</b> : continuez avec Le-QLN ; rien n'est perdu ni bloqué. Décidez avant : l'ouverture du compte développeur Google Play (le nom y apparaît), l'achat d'un nom de domaine, et le dépôt de marque."])
st.append(Paragraph("3. Vérifier un nom en 30 minutes (dans cet ordre, un nom à la fois)",H))
st+=nums(["<b>Recherche web exacte</b> (entre guillemets) + mots « app », « game », « jeu » : y a-t-il déjà un jeu ou une société dans le numérique avec ce nom ?",
"<b>Google Play et App Store</b> : tapez le nom dans la recherche des deux stores. Un nom identique dans la catégorie Jeux est éliminatoire ; un nom très proche (une lettre de différence) est un risque sérieux.",
"<b>Noms de domaine</b> (sur un registrar, par exemple Gandi, OVH ou Cloudflare Registrar) : le .com en priorité, puis .fr et .app. Visez au moins le .com ou, à défaut, une variante propre sans tiret.",
"<b>Marques</b> (gratuit, 10 minutes) : TMview (tmdn.org/tmview, couvre l'UE, la France, de nombreux pays), base de l'INPI (marques France), base mondiale de l'OMPI (Global Brand Database), et USPTO pour les États-Unis. Cherchez le nom exact <b>et</b> les variantes proches, aux <b>classes 9</b> (logiciels, applications) <b>et 28</b> (jeux), et aussi 41 (divertissement en ligne).",
"<b>Réseaux sociaux</b> : le pseudo est-il libre sur Instagram, TikTok, YouTube, X ? Un pseudo identique avec « app » ou « game » est acceptable.",
"<b>Test oral</b> : dites le nom à 10 personnes une seule fois, demandez-leur de l'écrire ; si 7 sur 10 l'orthographient bien, c'est bon signe (Qlinn est le plus exposé à ce test)."])
st.append(Paragraph("<b>Règle simple</b> : un nom est éliminé s'il existe déjà comme jeu/appli, ou comme marque aux classes 9, 28 ou 41 sur un marché visé. Les doublons dans des secteurs sans rapport (mines, plantes) gênent peu juridiquement mais brouillent le référencement.",P))
st.append(Paragraph("4. Protéger le nom une fois choisi",H))
st+=puces(["<b>Réserver tout de suite</b> (quelques euros) : le nom de domaine .com et le .fr, et les pseudos sociaux. C'est ce qui s'achète en premier et ce qui se perd le plus vite.",
"<b>Déposer la marque</b> (INPI, en ligne) : de l'ordre de 190 € pour une classe, avec un supplément par classe ajoutée (classes 9, 28, 41 : prévoir environ 270 € au total, tarifs à vérifier sur inpi.fr). Protection en France seulement ; l'extension à l'Union européenne (EUIPO, plusieurs centaines d'euros) vient si le jeu décolle. Le dépôt est un acte d'éditeur : faites-le une fois le statut (particulier ou micro-entreprise) décidé.",
"<b>Avant de payer</b> : faites relire la recherche d'antériorité par un conseil en propriété industrielle si l'enjeu devient important. Je ne peux pas garantir qu'un nom soit libre.",
"<b>Nom du Play Store</b> : jusqu'à 30 caractères. Format conseillé : « Nom – Word Cash Game » pour que le sous-titre porte la recherche."])
st.append(Paragraph("5. Décision conseillée",H))
st+=nums(["Cette semaine : passez les 4 noms à l'étape 1 et 2 (recherche web, stores) : 15 minutes, élimine souvent 1 ou 2 noms.",
"Pour les survivants : domaines (étape 3) et marques (étape 4). Gardez-en 2.",
"Faites le test oral avec 10 personnes, puis choisissez. Dites-moi le nom : je lance l'action « Changer le nom », régénère les icônes et l'appli Android, et prépare la fiche Play Store (titre, sous-titre, description FR et EN).",
"Réservez aussitôt domaine et pseudos ; déposez la marque dès que votre statut est fixé."])
SimpleDocTemplate("aide-choix-du-nom.pdf",pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=15*mm,bottomMargin=15*mm,title="Choisir le nom du jeu",author="Claude").build(st)
