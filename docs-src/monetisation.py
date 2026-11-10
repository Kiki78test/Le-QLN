# Source du document (charte commune : docs-src/charte.py). Régénérer : python3 docs-src/monetisation.py
import os
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "stylepdf.py")).read())
st=[]
st+= [Paragraph("Le-QLN — monétisation publicitaire",T), Spacer(1,2), Paragraph("Emplacements, règles d'affichage et rendement estimé · 9 novembre 2026",S), Spacer(1,8)]
st.append(Paragraph("Ce document propose une organisation des publicités qui protège l'expérience de jeu (jamais rien pendant un sablier), tout en déplaçant les revenus vers les formats qui rapportent le plus (vidéo récompense, grand format en fin de partie). Les chiffres sont des ordres de grandeur issus de benchmarks publics 2024-2026 ; ils varient fortement selon la régie, le pays, la saison et la qualité du trafic. Seule une mise en production avec une vraie régie donnera les valeurs réelles.",P))

st.append(Paragraph("1. Ce qui est en place aujourd'hui (simulation)",H))
st.append(tbl([["Emplacement","Format","Fréquence","Problème"],
 ["Avant chaque partie","Interstitiel vidéo 6 s, passable à 3 s","≥ 2 min 30 entre deux","Bloque le joueur juste après qu'il a appuyé sur « Jouer » ; dès la première partie"],
 ["Entre deux cartes","Interstitiel","toutes les 4 cartes","Correct (sablier arrêté), mais un peu dense"],
 ["Pendant les sabliers","Bandeau rotatif 12 s","permanent sur l'écran de carte","Distrait au pire moment, pour le format qui rapporte le moins"],
 ["Panneau de résultat","Vidéo récompense → +1 indice","à la demande","Bon principe, mais un seul usage : peu de vues"]],[34*mm,46*mm,32*mm,62*mm]))

st.append(Paragraph("2. Les règles retenues",H))
for l in ["<b>Rien pendant le jeu actif.</b> Ni bandeau ni vidéo tant qu'un sablier tourne ou qu'une carte est affichée. La concentration est le cœur du jeu ; c'est aussi ce qui fait revenir le joueur.",
 "<b>Pas de vidéo imposée à la première partie de la session.</b> Le joueur vient d'ouvrir l'appli ; on le laisse jouer. Ensuite, au plus une vidéo toutes les 3 minutes, uniquement aux transitions (entre deux parties, ou toutes les 5 cartes).",
 "<b>La vidéo récompense est toujours volontaire</b> et clairement libellée. C'est le format le mieux payé et le mieux accepté : le joueur choisit d'échanger 15-30 s contre un avantage.",
 "<b>Les bandeaux vivent sur les écrans calmes</b> : accueil, salon multijoueur, plateau (hors carte). En fin de partie, un <b>grand format</b> (type 300×250) remplace le petit bandeau : il paie 3 à 5 fois plus et le joueur est en train de lire son résultat.",
 "<b>Une sortie payante</b> « Sans publicité » (achat unique) : 1 à 3 % des joueurs réguliers la prennent dans les jeux de mots ; c'est souvent le deuxième poste de revenu."]:
    st.append(Paragraph("• "+l,P))

st.append(Paragraph("3. Plan d'emplacements proposé",H))
st.append(tbl([["Moment","Format","Règle","Statut"],
 ["Accueil","Bandeau adaptatif ancré","rotation 20 s","Fait"],
 ["Salon multijoueur (attente)","Bandeau","rotation 20 s","À faire (mineur)"],
 ["Plateau contre l'IA (colonne latérale)","Bandeau","hors carte uniquement","Fait"],
 ["Entre deux parties","Interstitiel passable","jamais à la 1re partie ; ≥ 3 min","Fait"],
 ["Entre deux cartes (sablier arrêté)","Interstitiel passable","toutes les 5 cartes ; ≥ 3 min","Fait"],
 ["Fin de partie (résultat)","Grand format 300×250","après la lecture du score","Fait"],
 ["Panneau de résultat","Vidéo récompense → +1 indice","à la demande","Existant"],
 ["Dernière vie perdue","Vidéo récompense → seconde chance (1 fois par partie)","à la demande","Proposition de règle"],
 ["Fin de partie","Vidéo récompense → gains ×1,5 (hors records et classements)","à la demande","Proposition de règle"],
 ["Braquage","Vidéo récompense → +20 s au chrono (1 fois)","à la demande","Proposition de règle"],
 ["Contre l'IA : prison","Vidéo récompense → caution payée par la banque","à la demande","Proposition de règle"],
 ["Défi du jour","Vidéo récompense → un second essai (non classé)","à la demande","Proposition de règle"]],[44*mm,52*mm,44*mm,34*mm]))
st.append(Paragraph("Les cinq dernières lignes touchent aux règles du jeu : elles ne sont pas codées, j'attends votre accord. Le plus rentable et le plus courant est la <b>seconde chance</b> : 20 à 35 % des joueurs qui perdent leur dernière vie l'acceptent.",S))


st.append(Paragraph("4. Rendement : les repères (eCPM = revenu pour 1 000 affichages)",H))
st.append(tbl([["Format","France (tier 2)","États-Unis / tier 1","Affichages typiques par joueur et par jour"],
 ["Vidéo récompense","8 – 10 $","14 – 22 $","1 – 3"],
 ["Interstitiel vidéo","5 – 7 $","9 – 14 $","3 – 6"],
 ["Grand format 300×250","0,8 – 1,4 $","1,6 – 3 $","3 – 8"],
 ["Bandeau adaptatif ancré","0,22 – 0,35 $","0,4 – 0,8 $","15 – 40"],
 ["Ouverture d'appli (app open)","2,5 – 4 $","4 – 8 $","1 – 2"]],[40*mm,32*mm,36*mm,66*mm]))
st.append(Paragraph("Sources : benchmarks AdMob/Playwire/Appodeal/Tenjin compilés par Playio et RevenueLab (2025-2026). iOS paie en général 20 à 40 % de plus qu'Android en Europe. Le 4e trimestre (Black Friday, Noël) est 20 à 40 % au-dessus du 1er. Les puzzles/jeux de mots sont dans la fourchette haute des eCPM car leur audience est adulte et attentive. Sur le web (PWA sans store), les eCPM sont nettement plus bas : voir le point 6.",S))

st.append(Paragraph("5. Simulation pour 1 000 joueurs actifs par jour",H))
st.append(Paragraph("Hypothèse : 1 000 joueurs actifs chaque jour, ~12 min de jeu et 3 sessions par jour chacun, trafic Android/iOS mélangé, eCPM France au milieu des fourchettes (récompense 9 $, interstitiel 6 $, grand format 1,1 $, bandeau 0,28 $). 1 $ ≈ 0,92 €.",P))
rows=[["Scénario","Vues par joueur/jour","Revenu / joueur / jour","Par mois (1 000 joueurs)","Par mois (10 000)"],
 ["A. Dispositif actuel","3 interstitiels · 0,5 récompense · 20 bandeaux","≈ 0,028 $ (0,026 €)","≈ 780 €","≈ 7 800 €"],
 ["B. Plan proposé, sans nouvelle règle","2,5 interstitiels · 0,8 récompense · 3 grands formats · 8 bandeaux","≈ 0,028 $ (0,026 €)","≈ 770 €","≈ 7 700 €"],
 ["C. Plan proposé + seconde chance + gains ×1,5","2,5 interstitiels · 2 récompenses · 3 grands formats · 8 bandeaux","≈ 0,039 $ (0,035 €)","≈ 1 060 €","≈ 10 600 €"],
 ["D. Scénario C, audience 50 % US/UK/DE","idem","≈ 0,057 $ (0,053 €)","≈ 1 590 €","≈ 15 900 €"],
 ["E. Scénario C + achat « Sans pub » 2,99 € (1,5 % des 30 000 joueurs mensuels)","idem, moins les acheteurs","—","≈ 1 060 € + 1 350 € (avant commission du store, 15-30 %)","≈ 10 600 € + 13 500 €"]]
st.append(tbl(rows,[44*mm,52*mm,28*mm,26*mm,24*mm]))
st.append(Paragraph("Lecture : le plan B rapporte autant que l'actuel tout en retirant les publicités de l'écran de jeu — le grand format de fin de partie compense les bandeaux supprimés. Le vrai levier est la vidéo récompense (scénario C : +35 %), puis la part d'audience hors France (D) ; l'achat « Sans pub » (E) peut doubler le total. À l'inverse, un dispositif agressif (interstitiel à chaque partie, bandeau permanent) gagne 15-20 % à court terme mais fait baisser la rétention de 10-25 % dans les études de régies : perte nette au bout de quelques semaines.",P))
st.append(Paragraph("Les montants sont proportionnels à l'audience : 100 joueurs actifs par jour → divisez par 10. L'audience est la variable qui compte le plus, loin devant l'optimisation des emplacements.",S))

st.append(Paragraph("6. Où diffuser : une contrainte technique importante",H))
st.append(tbl([["Support","Régie possible","Formats","eCPM indicatif France","Remarque"],
 ["PWA sur GitHub Pages (actuel)","Google AdSense « H5 Games Ads » (Ad Placement API)","interstitiel, récompense ; bandeaux AdSense","récompense 3 – 6 $, interstitiel 1,5 – 3 $","Simple, mais 2 à 3 fois moins payé qu'en appli native ; pas de bandeau 300×250 garanti"],
 ["Appli Android (TWA / Capacitor) sur Google Play","AdMob (+ médiation AppLovin/Unity…)","tous","valeurs du point 4","Le meilleur rapport effort/revenu : le code web reste le même"],
 ["Appli iOS (Capacitor) sur l'App Store","AdMob","tous","+20 à 40 % vs Android","Compte développeur 99 $/an, Mac nécessaire pour publier"]],[36*mm,40*mm,30*mm,32*mm,36*mm]))
st.append(Paragraph("Recommandation : garder la PWA comme vitrine et version web, et publier une enveloppe Android (TWA : même site, icône Play Store) pour brancher AdMob. C'est aussi la condition pour les achats intégrés « Sans pub ».",P))

st.append(Paragraph("7. Ce qui a été modifié dans l'appli aujourd'hui",H))
for l in ["Plus aucun bandeau sur l'écran de carte ni pendant un sablier.","Bandeau sur l'accueil ; grand format sur les écrans de fin (Défi, Festival, Braquage) ; bandeau conservé dans la colonne du plateau contre l'IA.","Pas de vidéo imposée à la première partie de la session ; puis au plus une toutes les 3 min, entre deux parties ou toutes les 5 cartes.","Rotation des bandeaux ralentie (20 s au lieu de 12 s) : moins de clignotement, et les régies ne paient pas les rafraîchissements trop rapides.","La simulation (barre du haut, mode Pub/No Pub) compte désormais avec les eCPM France ci-dessus."]:
    st.append(Paragraph("• "+l,P))
st.append(Paragraph("8. Décisions attendues",H))
for l in ["Valider (ou non) les cinq vidéos récompense « règles » : seconde chance, gains ×1,5, +20 s au Braquage, caution en prison, second essai au Défi du jour.","Choisir la cible de diffusion : PWA seule (AdSense H5) ou enveloppe Android + AdMob.","Prix et existence de l'achat « Sans pub » (achat unique 2,99 € conseillé ; abonnement à éviter pour un jeu de mots)."]:
    st.append(Paragraph("• "+l,P))
doc=SimpleDocTemplate("monetisation-publicitaire.pdf",pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=15*mm,bottomMargin=15*mm,title="Le-QLN — monétisation publicitaire",author="Claude")
doc.build(st)
