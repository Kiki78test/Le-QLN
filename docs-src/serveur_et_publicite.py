# Source du document (charte commune : docs-src/charte.py). Régénérer : python3 docs-src/serveur_et_publicite.py
import os
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "stylepdf.py")).read())
def puces(l): return [Paragraph("• "+x,P) for x in l]
def nums(l,d=1): return [Paragraph("<b>%d.</b> %s"%(i+d,x),P) for i,x in enumerate(l)]
def build(nom,titre,st):
    SimpleDocTemplate(nom,pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=15*mm,bottomMargin=15*mm,title=titre,author="Claude").build(st)

# ---------------- MISE EN LIGNE ----------------
st=[Paragraph("Le-QLN — mise en ligne du serveur",T),Spacer(1,2),Paragraph("Multijoueur, comptes, classements : ce qui est fait (Render) et ce qui reste (Cloudflare, Resend)",S),Spacer(1,8),
Paragraph("Le code est prêt (dossier <b>server/</b> du dépôt) : relais multijoueur WebSocket, API comptes / progression / scores / classements / mots contestés, tables PostgreSQL créées automatiquement (préfixe qln_). <b>Le serveur est en ligne depuis le 10 novembre 2026</b> (https://le-qln.onrender.com) et l'appli y est branchée : comptes, classements, mots contestés et salons fonctionnent. Ce document garde la procédure pour mémoire et liste ce qui reste.",P)]
st.append(Paragraph("1. Qui fait quoi",H))
st.append(tbl([["Service","Rôle pour Le-QLN","État","Coût"],
["Render — Web Service","héberge server/ (multijoueur + API)","<span class='ok'>Fait</span> (10/11). Passer en Starter à l'ouverture au public","Free pour tester ; Starter 7 $/mois en public"],
["Render — PostgreSQL dédiée","comptes, scores, classements","<span class='ok'>Fait</span> (10/11), offre Free. <b>Passer en Basic 256 Mo avant le 10/12/2026</b>","0 € puis ≈ 6 $/mois"],
["GitHub Actions","tests, vérifications, applis Android et iOS","<span class='ok'>Fait</span>","gratuit (dépôt public)"],
["Google Cloud (OAuth)","bouton « Se connecter avec Google »","facultatif, <span class='non'>pas fait</span>","gratuit"],
["Cloudflare","nom de domaine + DNS (site, api., e-mails)","<span class='non'>À faire</span> dès que le nom est choisi","≈ 10-12 €/an"],
["Resend","e-mails « mot de passe oublié »","<span class='non'>À faire</span> après le domaine","gratuit (3 000 e-mails/mois)"],
["GitHub Pages","héberge l'appli","<span class='ok'>Fait</span>","gratuit"]],[36*mm,58*mm,44*mm,36*mm]))

st.append(Paragraph("2. Render : fait le 10 novembre (procédure pour mémoire)",H))
st.append(Paragraph("Tout le service est décrit dans le fichier <b>render.yaml</b> du dépôt (« Blueprint ») : serveur, base de données dédiée, variables. Rien à recopier.",P))
st+=nums(["Render → <b>New → Blueprint</b> → choisir le dépôt <b>Kiki78test/AnagramX</b>.",
"Render affiche ce qu'il va créer : le service <b>le-qln</b> (Frankfurt, gratuit pour les essais) et la base <b>le-qln-db</b> (PostgreSQL dédiée, ≈ 6 $/mois). Cliquer <b>Apply</b>.",
"Attendre « Live » (3-5 min), puis ouvrir <b>https://le-qln.onrender.com/sante</b> : la réponse doit contenir <b>\"api\":true</b>.",
"L'adresse est renseignée dans config.js : les comptes, classements et salons en ligne sont actifs."])
st.append(Paragraph("<b>Ces 4 étapes sont faites.</b> Il reste deux réglages payants à prévoir sur Render : la base en <b>Basic 256 Mo avant le 10 décembre 2026</b> (l'offre Free expire 30 jours après la création ; Render → le-qln-db → Upgrade), et le serveur en <b>Starter</b> à l'ouverture au public (l'offre Free s'endort après 15 minutes).",P))
st.append(Paragraph("Pourquoi une base dédiée plutôt que celle d'Airmony : une restauration, une panne ou une saturation de l'une ne touche pas l'autre ; sauvegardes et coûts séparés ; le jeu peut être cédé ou déplacé seul. Coût : ≈ 6 $/mois.",S))
st.append(Paragraph("Ensuite, tout est automatique",H2))
st.append(tbl([["Quand","Ce qui se passe tout seul"],
["Chaque envoi sur GitHub","<b>Tests</b> : serveur (comptes, scores, anti-triche, classements, salons) sur une base de test, puis l'appli dans Chromium (FR/EN, téléphone/ordinateur, carte jouée, plateau, partie rapide, séries, hors ligne, création de compte)."],
["Tests réussis + server/ modifié","<b>Render redéploie</b> le serveur (jamais si un test échoue)."],
["Site mis en ligne (GitHub Pages)","<b>Version en ligne</b> : l'appli publiée est retestée."],
["Toutes les 6 heures","Le site, le serveur et la base répondent."],
["Chaque lundi","Contrôle de sécurité des dépendances du serveur."],
["mobile/ modifié","<b>Appli Android</b> de test fabriquée et publiée (Releases → « Appli Android (test) ») ; <b>appli iOS</b> compilée et lancée dans un simulateur."],
["Un échec","Croix rouge dans l'onglet Actions et <b>e-mail de GitHub</b>."]],[52*mm,122*mm]))
st.append(Paragraph("Appli Android de test : l'APK ouvre le site en ligne ; chaque mise à jour du jeu arrive donc sans réinstaller. Elle ne se réinstalle que si l'enveloppe change (rare). La connexion Google y est masquée (Google la refuse dans une appli de ce type) : e-mail + mot de passe.",S))
st.append(Paragraph("Connexion Google (facultatif, pas encore fait)",H2))
st+=nums(["console.cloud.google.com → nouveau projet « Le-QLN » → <i>API et services → Écran de consentement OAuth</i> : externe, nom de l'appli, votre e-mail.",
"<i>Identifiants → Créer → ID client OAuth → Application Web</i>. Origines JavaScript autorisées : <b>https://kiki78test.github.io</b>.",
"Copier l'ID client (…apps.googleusercontent.com) dans la variable GOOGLE_CLIENT_ID de Render et l'envoyer à Claude (config.js)."])
st.append(Paragraph("Vérifications",H2))
st+=puces(["<span class='ok'>Fait</span> (par vous) — créer un compte, se connecter sur un autre appareil : la progression suit.","<span class='ok'>Fait</span> (tests automatiques à chaque envoi) — un score du défi du jour apparaît dans Classements ; un salon ouvert est visible et rejoignable ; partie rapide à deux.","À essayer une fois vous-même : contester un mot valide (il est revérifié par le serveur et ajouté pour tous)."])

st.append(Paragraph("3. À faire : Cloudflare (quand le nom est choisi)",H))
st+=nums(["Cloudflare → <i>Domain Registration → Register</i> : acheter le domaine (prix coûtant).",
"DNS : <b>CNAME www → kiki78test.github.io</b> et les 4 enregistrements A de GitHub Pages pour la racine, en mode <b>DNS only</b> (nuage gris) pour laisser GitHub délivrer le certificat. Dans GitHub → Settings → Pages → Custom domain : le domaine, puis « Enforce HTTPS ».",
"DNS : <b>CNAME api → le-qln.onrender.com</b> (DNS only), puis Render → Settings → Custom Domains → api.votre-domaine.",
"Claude met à jour config.js (QLN_API_URL = https://api.votre-domaine), ORIGINES (render.yaml), le manifeste et l'ID Google (nouvelle origine).",
"Le domaine débloque aussi AdSense (version web) et Resend."])
st.append(Paragraph("4. À faire : Resend (mot de passe oublié), après le domaine",H))
st+=nums(["Créer le compte resend.com (gratuit) → <i>Domains → Add</i> : votre domaine. Resend affiche 3-4 enregistrements DNS (SPF, DKIM, MX de retour) : les ajouter dans Cloudflare (ou bouton « Auto configure » Cloudflare). Vérification en quelques minutes.",
"<i>API Keys → Create</i> (droit « Sending access ») → variable <b>RESEND_API_KEY</b> sur Render, plus <b>MAIL_FROM</b> = « Le-QLN &lt;noreply@votre-domaine&gt; ».",
"Claude code la route « mot de passe oublié » (lien valable 30 min, à usage unique) et l'écran correspondant. Avant le domaine, Resend ne peut écrire qu'à votre propre adresse : suffisant pour tester."])
st.append(Paragraph("5. Budget mensuel",H))
st.append(tbl([["Poste","Test (aujourd'hui)","Public"],
["Render Web Service","0 € (Free)","≈ 6,5 € (Starter 7 $)"],
["PostgreSQL dédiée","0 € jusqu'au 10/12 (Free), puis ≈ 5,5 €","≈ 5,5 € (6 $)"],
["Domaine Cloudflare","—","≈ 1 €/mois (≈ 10-12 €/an)"],
["Resend, Google OAuth, GitHub Pages","0 €","0 €"],
["Total","0 € puis ≈ 5,5 €/mois","≈ 13 €/mois"]],[70*mm,52*mm,52*mm]))
st.append(Paragraph("Limites connues : les chronos ne sont pas rejoués par le serveur (les cartes et les mots du défi du jour, eux, sont vérifiés) ; le multijoueur synchronisé sur le plateau (partie complète à plusieurs) reste à développer — aujourd'hui les salons et la partie rapide servent à se retrouver et lancer la partie.",S))
build("mise-en-ligne-serveur.pdf","Le-QLN — mise en ligne du serveur",st)
