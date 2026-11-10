# Publier l'appli Android sur Google Play -> docs/publication-google-play.pdf
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from charte import document, T, B, L
h = '<p class="intro">Tout est prêt pour fabriquer l\'appli Android à publier : un fichier <b>.aab</b> signé, à déposer dans la Play Console. Il vous reste un secret à créer et quelques écrans à remplir chez Google.</p>'
h += "<h2>1. Ce qui est prêt</h2>" + T([
    ["Fabrication", "Action GitHub « Appli Android (Google Play) », à la demande. Elle produit <code>Le-QLN-1.0.N.aab</code> (artefact « Le-QLN-Google-Play », gardé 90 jours)."],
    ["Clé d'envoi", "Créée automatiquement au premier lancement, puis rangée <b>chiffrée</b> dans le dépôt avec votre mot de passe (AES-256). Sans le mot de passe, elle est inutilisable. Google garde la vraie clé de signature (« Signature d'application par Google Play ») : une clé d'envoi perdue peut être remplacée sur demande."],
    ["Versions", "Numéro automatique et croissant à chaque fabrication (1.0.1, 1.0.2…), comme l'exige Google Play."],
    ["Contenu", "L'appli ouvre le site du jeu : chaque mise à jour du jeu arrive sans nouvelle version sur le Play Store (seules les modifications de l'enveloppe Android en demandent une). Portrait, icônes, écran de démarrage, vibrations."],
    ["Fiche", "Textes FR/EN, 8 captures par langue, bannière 1024 × 500, icône 512 et réponses aux questionnaires : document « Fiches des stores » et dossier <code>store/</code>."]],
    ["Élément", "Détail"], [20, 80])
h += "<h2>2. À faire une seule fois</h2>" + L([
    "<b>Créer le secret</b> : GitHub → dépôt Le-QLN → Settings → Secrets and variables → Actions → <i>New repository secret</i>. Nom : <code>ANDROID_KEYSTORE_PASSWORD</code>. Valeur : un mot de passe d'au moins 20 caractères, généré par un gestionnaire de mots de passe. <b>Gardez-le précieusement</b> (gestionnaire de mots de passe) et ne l'envoyez à personne, pas même à Claude.",
    "<b>Lancer la fabrication</b> : Actions → « Appli Android (Google Play) » → Run workflow. Au premier lancement, la clé d'envoi est créée (un envoi « Clé d'envoi Google Play (chiffrée) » apparaît dans le dépôt). Le résumé de l'action affiche l'empreinte du certificat.",
    "<b>Télécharger le fichier</b> : en bas de la page de l'action, artefact « Le-QLN-Google-Play » (un .zip qui contient le .aab)."])
h += "<h2>3. Dans la Play Console</h2>" + L([
    "<b>Créer l'appli</b> (dès que votre compte est validé) : nom (le nom définitif, ou provisoire), langue par défaut français, « Jeu », « Gratuit ».",
    "<b>Tests → Tests internes</b> → Créer une version : déposer le .aab. Accepter la <b>Signature d'application par Google Play</b> (proposée par défaut). Ajouter vos adresses e-mail de testeurs, puis installer depuis le lien de test.",
    "<b>Compte personnel créé après novembre 2023</b> : Google impose un test fermé avec au moins 12 testeurs pendant 14 jours avant la production. Prévoir 12 personnes (famille, amis) avec un compte Google.",
    "<b>Fiche et questionnaires</b> : recopier les textes et images de <code>store/</code>, la classification (questionnaire IARC), la sécurité des données (réponses prêtes dans « Fiches des stores »), le public cible (13 ans et plus) et la politique de confidentialité (adresse du site).",
    "<b>Production</b> : quand les tests sont concluants, « Promouvoir la version » vers la production. Première relecture Google : de quelques heures à quelques jours."])
h += B("Pour chaque nouvelle version", "Relancer l'action « Appli Android (Google Play) », puis déposer le nouveau .aab dans la Play Console. Ce n'est nécessaire que si l'enveloppe Android change (icône, nom, publicité AdMob…) : le jeu lui-même se met à jour tout seul.", classe="hl")
h += B("Sécurité", "Le mot de passe n'existe que dans les secrets GitHub et chez vous. Le fichier de clé du dépôt est chiffré ; la clé déchiffrée n'existe que le temps de la fabrication, puis est effacée.")
document("publication-google-play.pdf", "Publier sur Google Play", "Appli Android signée (.aab), clé d'envoi, Play Console.", h,
         description="Fabrication de l'appli Android à publier (fichier .aab signé), création de la clé d'envoi (secret ANDROID_KEYSTORE_PASSWORD), étapes dans la Play Console (tests internes, 12 testeurs, fiche, production).")
