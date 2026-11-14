# Questionnaires des stores — Le-QLN

Réponses à reporter dans la Play Console (Contenu de l'appli) et App Store Connect (Confidentialité de l'app).
Cohérentes avec la politique de confidentialité. Généré par `tools/build_store.py` — ne pas modifier ici.

## Informations générales

| Rubrique | Google Play | App Store |
|---|---|---|
| Catégorie | Jeux › Mots (secondaire : Plateau si proposé) | Principale : Jeux ; sous-catégories : Mots, Plateau |
| Tags (Play) | Anagrammes, Mots, Plateau, Solo, Multijoueur, Hors ligne | — |
| Prix | Gratuit | Gratuit |
| Achats intégrés | Aucun pour l'instant (« Sans pub » payant : plus tard) | Aucun |
| Contient des annonces | Oui dès l'activation d'AdMob ; « Non » tant que la version publiée n'en affiche pas | Déclaré dans « Confidentialité de l'app » (données publicitaires) |
| Public cible | 13 ans et plus (évite les obligations « Familles » pour les annonces) | Âge : 4+ (questionnaire : aucun contenu sensible) |
| Classification | Questionnaire IARC : jeu ; violence, peur, sexualité, langage : non ; jeux d'argent : non (monnaie virtuelle sans valeur, pas de mise réelle) ; interactions entre utilisateurs : oui (pseudos et réactions en multijoueur, pas de discussion libre) → PEGI 3 attendu | Aucun contenu sensible ; « jeux d'argent simulés » : non ; contenu généré par les utilisateurs : pseudos uniquement → 4+ |
| Coordonnées | E-mail de contact obligatoire (marque.json → contact_email), site facultatif | URL d'assistance obligatoire : page de mentions légales ou site du jeu |
| Politique de confidentialité | https://kiki78test.github.io/AnagramX/confidentialite.html (EN : https://kiki78test.github.io/AnagramX/en/privacy.html) | même adresse |
| Suppression du compte | Dans l'appli : Mon compte › Supprimer mon compte. Lien web demandé : https://kiki78test.github.io/AnagramX/confidentialite.html#droits (explique la suppression dans l'appli ou par e-mail) | Suppression dans l'appli : oui (obligatoire chez Apple) |
| Accès aux fonctions | Aucune fonction ne demande de connexion pour l'examen (compte facultatif) : rien à fournir | Notes pour l'examen : « Compte facultatif ; le multijoueur se teste avec deux appareils ou la partie rapide » |

## Google Play — Sécurité des données

- **Votre appli collecte-t-elle ou partage-t-elle des données ?** Oui
- **Les données sont-elles chiffrées lors du transfert ?** Oui (HTTPS / WSS partout)
- **Les utilisateurs peuvent-ils demander la suppression de leurs données ?** Oui (dans l'appli, ou par e-mail ; lien web ci-dessus)
- **Engagement « Familles » / examen indépendant** Non

### Dès maintenant

| Type de données | Collecté | Partagé | Facultatif ? | Finalités |
|---|---|---|---|---|
| Infos personnelles › Adresse e-mail | Oui | Non | Facultatif (compte) | Gestion du compte |
| Infos personnelles › ID utilisateur | Oui | Non | Facultatif (compte ; identifiant Google si connexion Google) | Gestion du compte, fonctionnalité de l'appli |
| Infos personnelles › Nom (pseudo choisi) | Oui | Non | Facultatif (compte) | Fonctionnalité de l'appli (classements, multijoueur) |
| Infos personnelles › Autres infos (pays déclaré, couleur du pion) | Oui | Non | Facultatif | Fonctionnalité de l'appli, personnalisation |
| Activité dans l'appli › Autres actions (scores, mots trouvés, progression) | Oui | Non | Facultatif (compte) | Fonctionnalité de l'appli, prévention des fraudes (anti-triche) |
| Activité dans l'appli › Autre contenu généré par l'utilisateur (mot contesté, sans identité) | Oui | Non | Facultatif | Fonctionnalité de l'appli (amélioration du dictionnaire) |

### À ajouter le jour où AdMob est activé

| Type de données | Collecté | Partagé | Facultatif ? | Finalités |
|---|---|---|---|---|
| Identifiants de l'appareil ou autres › ID publicitaire | Oui | Oui (Google AdMob) | Obligatoire (pub) | Publicité ou marketing, statistiques, prévention des fraudes |
| Position › Position approximative (déduite de l'adresse IP par AdMob) | Oui | Oui (Google AdMob) | Obligatoire (pub) | Publicité ou marketing, prévention des fraudes |
| Infos et performances de l'appli › Diagnostics (SDK AdMob) | Oui | Oui (Google AdMob) | Obligatoire (pub) | Publicité, statistiques |
| Activité dans l'appli › Interactions avec l'appli (SDK AdMob) | Oui | Oui (Google AdMob) | Obligatoire (pub) | Publicité ou marketing, statistiques |

Non déclarés (traitement éphémère ou absent) : réactions et pseudos relayés en multijoueur (en mémoire seulement), messages, photos, contacts, agenda, position précise, données financières, santé, fichiers.

## App Store — Confidentialité de l'app

### Dès maintenant

| Donnée | Liée à l'identité | Suivi (tracking) | Finalités |
|---|---|---|---|
| Coordonnées › Adresse e-mail | Oui | Non | Fonctionnalités de l'app |
| Identifiants › Identifiant utilisateur | Oui | Non | Fonctionnalités de l'app |
| Contenu utilisateur › Contenu de jeu (scores, mots trouvés, progression) | Oui | Non | Fonctionnalités de l'app |
| Contenu utilisateur › Autre contenu utilisateur (pseudo, pays déclaré) | Oui | Non | Fonctionnalités de l'app |

### À ajouter le jour où AdMob est activé (avec la fenêtre ATT)

| Donnée | Liée à l'identité | Suivi (tracking) | Finalités |
|---|---|---|---|
| Identifiants › Identifiant de l'appareil (IDFA, seulement si l'utilisateur accepte l'ATT) | Non | Oui | Publicité tierce |
| Données d'utilisation › Données publicitaires | Non | Oui | Publicité tierce, analyses |
| Localisation › Localisation approximative (AdMob) | Non | Non | Publicité tierce |
| Diagnostics › Autres données de diagnostic (AdMob) | Non | Non | Analyses |

