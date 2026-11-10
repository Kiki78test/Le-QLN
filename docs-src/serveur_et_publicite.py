# Source du document (charte commune : docs-src/charte.py). Régénérer : python3 docs-src/serveur_et_publicite.py
import os
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "stylepdf.py")).read())
def puces(l): return [Paragraph("• "+x,P) for x in l]
def nums(l,d=1): return [Paragraph("<b>%d.</b> %s"%(i+d,x),P) for i,x in enumerate(l)]
def build(nom,titre,st):
    SimpleDocTemplate(nom,pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=15*mm,bottomMargin=15*mm,title=titre,author="Claude").build(st)

# ---------------- PUBLICITÉ RÉELLE ----------------
st=[Paragraph("Le-QLN — mettre en place la publicité réelle",T),Spacer(1,2),Paragraph("Régies, procédure pas à pas, consentement, thèmes autorisés · 10 novembre 2026",S),Spacer(1,8),
Paragraph("Complément du document « Monétisation publicitaire » (emplacements et rendement). Ici : comment passer de la simulation actuelle à de vraies annonces payées. Les règles d'affichage du jeu (jamais pendant un sablier, pas de vidéo à la 1re partie, etc.) restent celles de pub.js : seule la source des annonces change.",P)]
st.append(Paragraph("1. Le choix de fond : web ou appli Android",H))
st.append(tbl([["","Site web (comme aujourd'hui)","Appli Android (Google Play)"],
["Régie","Google AdSense — programme H5 Games Ads (Ad Placement API)","Google AdMob (+ médiation)"],
["Formats","interstitiel entre deux parties, vidéo récompense, bandeaux","tous, dont le grand format de fin de partie"],
["Revenu","2 à 3 fois moins","chiffres du document Monétisation"],
["Condition","un domaine à vous : AdSense refuse une adresse github.io","compte Google Play Console (25 $ une fois)"],
["Achat « Sans pub »","difficile","natif (Google Play Billing)"]],[30*mm,72*mm,72*mm]))
st.append(Paragraph("<b>Recommandation, dans l'ordre</b> : 1) appli Android + AdMob (la vraie source de revenus ; le code du jeu est emballé tel quel avec Capacitor) ; 2) site web + AdSense H5 sur un domaine à vous, en vitrine et complément ; 3) iPhone plus tard (99 $/an et un Mac).",P))

st.append(Paragraph("2. Procédure AdMob (Android)",H))
st+=nums(["<b>Comptes</b> : AdMob (avec votre compte Google) et Google Play Console (25 $).",
"<b>Fiscalité et paiement</b> dans AdMob : adresse, IBAN, statut. Paiement mensuel dès 70 € cumulés. Les revenus se déclarent (en micro-entreprise : au titre de vos revenus d'activité).",
"<b>Appli Android</b> (préparée par Claude) : Capacitor + module AdMob. Vous créez dans AdMob un <i>bloc d'annonces</i> par emplacement (interstitiel, récompense, bandeau d'accueil, grand format de fin) et transmettez les identifiants. Livrables : fichier .aab pour Play Console et fichier <b>app-ads.txt</b> à placer à la racine de votre site (obligatoire pour être bien payé).",
"<b>Consentement RGPD</b> (obligatoire dans l'UE) : Google impose une plateforme de consentement certifiée TCF 2.2. La plus simple est gratuite et intégrée : AdMob → Confidentialité et messages → RGPD. Vous configurez le message, Claude branche le SDK UMP au démarrage. Sans consentement : annonces non personnalisées, 30 à 50 % moins payées.",
"<b>Fiche Play Store</b> : questionnaire de classification d'âge, case « Contient des annonces », formulaire Sécurité des données, <b>politique de confidentialité en ligne</b> (rédigée par Claude), public cible.",
"<b>Tests</b> avec les annonces de test Google, puis test fermé : pour un nouveau compte développeur personnel, Google exige 12 testeurs pendant 14 jours avant la production.",
"<b>Après 2 à 4 semaines</b> : médiation (AppLovin, Unity Ads, Meta, Liftoff…) mise en concurrence sur chaque emplacement : +15 à 30 % en général."])

st.append(Paragraph("3. Procédure AdSense H5 Games Ads (site web)",H))
st+=nums(["Acheter un domaine (Cloudflare, prix coûtant ≈ 10-12 €/an) et y pointer le site GitHub Pages.",
"Créer le compte AdSense, ajouter le site, attendre la validation (quelques jours à quelques semaines ; il faut du contenu, des mentions légales et une politique de confidentialité).",
"Demander l'accès H5 Games Ads (Ad Placement API) dans AdSense.",
"Publier <b>ads.txt</b> à la racine et activer le message de consentement RGPD d'AdSense (Confidentialité et messages).",
"Claude remplace la simulation de pub.js par les appels <i>adBreak()</i> / <i>adConfig()</i> : type « next » (entre deux parties), « reward » (vidéo récompense), plus des blocs AdSense pour les bandeaux."])

st.append(Paragraph("4. Les régies possibles",H))
st.append(tbl([["Régie","Rôle","Quand"],
["AdMob","base indispensable, meilleure demande en France","dès le départ"],
["AppLovin, Unity Ads, Meta Audience Network, Liftoff","fortes en jeux, surtout vidéo récompense ; branchées à travers AdMob (médiation)","après 2-4 semaines de données"],
["AppLovin MAX ou Unity LevelPlay comme chef d'orchestre","un peu plus rentables à grande échelle, plus complexes","au-delà de ~10 000 joueurs/jour"],
["AdSense H5 Games Ads","version web","quand le domaine existe"],
["Petites régies inconnues à « eCPM garanti »","à éviter : pubs de mauvaise qualité, paiements incertains","jamais"]],[60*mm,74*mm,40*mm]))

st.append(Paragraph("5. Les thèmes : quelles annonces autoriser",H))
st.append(Paragraph("Dans AdMob comme dans AdSense : <i>Blocage → Contrôles du contenu</i>. Trois niveaux :",P))
st+=puces(["<b>Classification maximale des annonces</b> : « T » (adolescents) pour un jeu 12+. « MA » (adultes) paie un peu plus mais n'est pas adapté.",
"<b>Catégories sensibles à bloquer</b> : jeux d'argent et paris (essentiel : le jeu manipule des euros, il ne doit pas évoquer les paris), alcool, rencontres, politique, religion, contenu sexuellement suggestif, perte de poids, cryptomonnaies et trading.",
"<b>À garder ouvertes</b> (bien payées) : autres jeux, culture, éducation, commerce, voyage, alimentation.",
"<b>Annonceurs précis</b> : blocage d'une marque ou d'une appli concurrente au cas par cas, depuis les rapports (Centre d'examen des annonces)."])
st.append(Paragraph("Bloquer ces catégories coûte 5 à 10 % de revenu mais protège l'image du jeu.",S))

st.append(Paragraph("6. Points d'attention",H))
st+=puces(["<b>Mineurs</b> : déclarer un public 13+ sur le Play Store évite le programme « Familles » (annonces certifiées seulement, revenus plus bas). Viser explicitement les enfants change toutes les règles.",
"<b>Ne jamais cliquer sur ses propres annonces</b> ni le demander aux proches : Google ferme le compte sans appel. Pendant le développement, uniquement les annonces de test.",
"<b>Mentions légales et politique de confidentialité</b> publiées sur le site (adresse de l'éditeur : même question que pour Airmony).",
"<b>Achat « Sans pub »</b> : à faire en même temps que l'appli Android (Google Play Billing, commission 15 %)."])

st.append(Paragraph("7. Calendrier type",H))
st.append(tbl([["Étape","Qui","Durée"],
["Choix du nom, achat du domaine","vous","1 jour"],
["Comptes AdMob + Play Console, fiscalité","vous","1 h + vérification d'identité (1-3 jours)"],
["Projet Android, consentement, annonces de test, politique de confidentialité","Claude","1-2 sessions"],
["Test fermé (12 testeurs, 14 jours)","vous + testeurs","2 semaines"],
["Publication, blocage des catégories, suivi","vous","—"],
["Médiation, AdSense web","Claude + vous","après 2-4 semaines"]],[100*mm,34*mm,40*mm]))
st.append(Paragraph("Sources",H2))
for s in ["AdSense H5 Games Ads — google.com/adsense/start/h5-games-ads","Ad Placement API — developers.google.com/ad-placement/apis","Règles des jeux H5 — support.google.com/adsense/answer/9959170","Exigences CMP certifiée (EEE/RU) — support.google.com/admob/answer/9760862","Consentement RGPD (UMP) — developers.google.com/admob/android/privacy/gdpr"]:
    st.append(Paragraph(s,S))
build("publicite-reelle.pdf","Le-QLN — publicité réelle",st)

# ---------------- MISE EN LIGNE ----------------
st=[Paragraph("Le-QLN — mise en ligne du serveur",T),Spacer(1,2),Paragraph("Multijoueur, comptes, classements : Render, Cloudflare, Resend · 10 novembre 2026",S),Spacer(1,8),
Paragraph("Le code est prêt (dossier <b>server/</b> du dépôt) : relais multijoueur WebSocket, API comptes / progression / scores / classements / mots contestés, tables PostgreSQL créées automatiquement (préfixe qln_). Il reste à l'héberger et à brancher l'appli dessus.",P)]
st.append(Paragraph("1. Qui fait quoi",H))
st.append(tbl([["Service","Rôle pour Le-QLN","Quand","Coût"],
["Render — Web Service","héberge server/ (multijoueur + API)","<b>aujourd'hui</b>","Free pour tester ; Starter 7 $/mois en public"],
["Render — PostgreSQL dédiée","comptes, scores, classements","<b>aujourd'hui</b> (créée par le Blueprint)","≈ 6 $/mois"],
["GitHub Actions","tests, vérifications, appli Android","déjà en place","gratuit (dépôt public)"],
["Google Cloud (OAuth)","bouton « Se connecter avec Google »","aujourd'hui, facultatif","gratuit"],
["Cloudflare","nom de domaine + DNS (site, api., e-mails)","dès que le nom est choisi","≈ 10-12 €/an"],
["Resend","e-mails « mot de passe oublié »","après le domaine","gratuit (3 000 e-mails/mois)"],
["GitHub Pages","héberge l'appli (déjà en place)","—","gratuit"]],[36*mm,58*mm,44*mm,36*mm]))

st.append(Paragraph("2. Aujourd'hui : Render en un clic (≈ 5 minutes)",H))
st.append(Paragraph("Tout le service est décrit dans le fichier <b>render.yaml</b> du dépôt (« Blueprint ») : serveur, base de données dédiée, variables. Rien à recopier.",P))
st+=nums(["Render → <b>New → Blueprint</b> → choisir le dépôt <b>Kiki78test/Le-QLN</b>.",
"Render affiche ce qu'il va créer : le service <b>le-qln</b> (Frankfurt, gratuit pour les essais) et la base <b>le-qln-db</b> (PostgreSQL dédiée, ≈ 6 $/mois). Cliquer <b>Apply</b>.",
"Attendre « Live » (3-5 min), puis ouvrir <b>https://le-qln.onrender.com/sante</b> : la réponse doit contenir <b>\"api\":true</b>.",
"<b>Envoyer cette adresse à Claude</b> : il renseigne config.js et pousse. Les comptes, classements et salons en ligne s'activent."])
st.append(Paragraph("Pourquoi une base dédiée plutôt que celle d'Airmony : une restauration, une panne ou une saturation de l'une ne touche pas l'autre ; sauvegardes et coûts séparés ; le jeu peut être cédé ou déplacé seul. Coût : ≈ 6 $/mois.",S))
st.append(Paragraph("Ensuite, tout est automatique",H2))
st.append(tbl([["Quand","Ce qui se passe tout seul"],
["Chaque envoi sur GitHub","<b>Tests</b> : serveur (comptes, scores, classements, salons) sur une base de test, puis l'appli dans Chromium (FR/EN, téléphone/ordinateur, carte jouée, plateau, création de compte)."],
["Tests réussis + server/ modifié","<b>Render redéploie</b> le serveur (jamais si un test échoue)."],
["Site mis en ligne (GitHub Pages)","<b>Version en ligne</b> : l'appli publiée est retestée."],
["Toutes les 6 heures","Le site, le serveur et la base répondent."],
["Chaque lundi","Contrôle de sécurité des dépendances du serveur."],
["mobile/ modifié","<b>Appli Android</b> de test fabriquée et publiée (Releases → « Appli Android (test) »)."],
["Un échec","Croix rouge dans l'onglet Actions et <b>e-mail de GitHub</b>."]],[52*mm,122*mm]))
st.append(Paragraph("Appli Android de test : l'APK ouvre le site en ligne ; chaque mise à jour du jeu arrive donc sans réinstaller. Elle ne se réinstalle que si l'enveloppe change (rare). La connexion Google y est masquée (Google la refuse dans une appli de ce type) : e-mail + mot de passe.",S))
st.append(Paragraph("C. Connexion Google (facultatif)",H2))
st+=nums(["console.cloud.google.com → nouveau projet « Le-QLN » → <i>API et services → Écran de consentement OAuth</i> : externe, nom de l'appli, votre e-mail.",
"<i>Identifiants → Créer → ID client OAuth → Application Web</i>. Origines JavaScript autorisées : <b>https://kiki78test.github.io</b>.",
"Copier l'ID client (…apps.googleusercontent.com) dans la variable GOOGLE_CLIENT_ID de Render et l'envoyer à Claude (config.js)."])
st.append(Paragraph("D. Vérifications à faire ensemble",H2))
st+=puces(["Créer un compte sur téléphone, se connecter sur PC : la progression suit.","Finir un défi du jour : le score apparaît dans Classements (monde et pays).","Ouvrir un salon sur un appareil : il est visible et rejoignable depuis l'autre.","Contester un mot valide : il est revérifié par le serveur et ajouté pour tous."])

st.append(Paragraph("3. Ensuite : Cloudflare (quand le nom est choisi)",H))
st+=nums(["Cloudflare → <i>Domain Registration → Register</i> : acheter le domaine (prix coûtant).",
"DNS : <b>CNAME www → kiki78test.github.io</b> et les 4 enregistrements A de GitHub Pages pour la racine, en mode <b>DNS only</b> (nuage gris) pour laisser GitHub délivrer le certificat. Dans GitHub → Settings → Pages → Custom domain : le domaine, puis « Enforce HTTPS ».",
"DNS : <b>CNAME api → le-qln.onrender.com</b> (DNS only), puis Render → Settings → Custom Domains → api.votre-domaine.",
"Claude met à jour config.js (QLN_API_URL = https://api.votre-domaine), ORIGINES (render.yaml), le manifeste et l'ID Google (nouvelle origine).",
"Le domaine débloque aussi AdSense (version web) et Resend."])
st.append(Paragraph("4. Ensuite : Resend (mot de passe oublié)",H))
st+=nums(["Créer le compte resend.com (gratuit) → <i>Domains → Add</i> : votre domaine. Resend affiche 3-4 enregistrements DNS (SPF, DKIM, MX de retour) : les ajouter dans Cloudflare (ou bouton « Auto configure » Cloudflare). Vérification en quelques minutes.",
"<i>API Keys → Create</i> (droit « Sending access ») → variable <b>RESEND_API_KEY</b> sur Render, plus <b>MAIL_FROM</b> = « Le-QLN &lt;noreply@votre-domaine&gt; ».",
"Claude code la route « mot de passe oublié » (lien valable 30 min, à usage unique) et l'écran correspondant. Avant le domaine, Resend ne peut écrire qu'à votre propre adresse : suffisant pour tester."])
st.append(Paragraph("5. Budget mensuel",H))
st.append(tbl([["Poste","Test (aujourd'hui)","Public"],
["Render Web Service","0 € (Free)","≈ 6,5 € (Starter 7 $)"],
["PostgreSQL dédiée","≈ 5,5 € (6 $)","≈ 5,5 € (6 $)"],
["Domaine Cloudflare","—","≈ 1 €/mois (≈ 10-12 €/an)"],
["Resend, Google OAuth, GitHub Pages","0 €","0 €"],
["Total","≈ 5,5 €/mois","≈ 13 €/mois"]],[70*mm,52*mm,52*mm]))
st.append(Paragraph("Limites connues : les scores sont calculés par l'appli (recalcul serveur du défi du jour prévu) ; comptes des moins de 15 ans à faire valider juridiquement ; le multijoueur synchronisé sur le plateau (partie complète à plusieurs) reste à développer après la mise en ligne — aujourd'hui les salons servent à se retrouver et lancer la partie.",S))
build("mise-en-ligne-serveur.pdf","Le-QLN — mise en ligne du serveur",st)
