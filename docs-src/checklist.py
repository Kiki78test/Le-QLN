# Check-list Le-QLN : échéances, actions en attente (vous / Claude), décisions à prendre, fait.
# Usage : python3 docs-src/checklist.py  -> docs/check-list.pdf (date du jour, entrée docs/index.json mise à jour)
# À mettre à jour à chaque étape importante.
import base64, datetime, json, pathlib, zoneinfo
ICI = pathlib.Path(__file__).resolve().parent; RACINE = ICI.parent
NOM = json.loads((RACINE / "marque.json").read_text(encoding="utf-8"))["nom"]
now = datetime.datetime.now(zoneinfo.ZoneInfo("Europe/Paris"))
MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]
D = f"{now.day} {MOIS[now.month-1]} {now.year}"
ft = base64.b64encode((RACINE / "fonts" / "barlow-condensed-latin-700-normal.woff2").read_bytes()).decode()
fb = base64.b64encode((RACINE / "fonts" / "barlow-latin-400-normal.woff2").read_bytes()).decode()
fg = base64.b64encode((RACINE / "fonts" / "barlow-latin-700-normal.woff2").read_bytes()).decode()
css = """@font-face{font-family:T;src:url(data:font/woff2;base64,%s)}@font-face{font-family:B;src:url(data:font/woff2;base64,%s)}
@font-face{font-family:B;font-weight:700;src:url(data:font/woff2;base64,%s)}
@page{size:A4;margin:12mm}*{box-sizing:border-box}body{font:9.4pt/1.45 B,sans-serif;color:#1d2433;margin:0}
h1{font:700 23pt T;margin:0}h2{font:700 14pt T;color:#0f2a6b;margin:14px 0 5px;border-bottom:2px solid #f2c230;padding-bottom:2px;break-after:avoid}
.top{background:linear-gradient(135deg,#0b1a3a,#16357a);color:#fff;border-radius:12px;padding:15px 20px}.top p{margin:5px 0 0;color:#c8d4f0}.or{color:#ffd60a}
ul{list-style:none;margin:0;padding:0}li{display:flex;gap:8px;padding:4px 2px;border-bottom:1px solid #eceff6;break-inside:avoid}
.b{flex:none;width:18px;height:18px;border-radius:50%%;display:grid;place-items:center;font-size:10pt;font-weight:700;color:#fff}
.ok{background:#2e9e5b}.todo{background:#9aa3b5}.vous{background:#e09a1a}.urg{background:#d9412b}.dec{background:#5b6cd6}
.rappel{border:2px solid #d9412b;background:#fdeeea;border-radius:10px;padding:9px 13px;margin:10px 0}
.rappel b{color:#b0301c}.n{font-size:8.4pt;color:#5b6478}
""" % (ft, fb, fg)
SYM = {"ok": "✔", "todo": "○", "vous": "◷", "urg": "!", "dec": "?"}
def sec(titre, items): return f"<h2>{titre}</h2><ul>" + "".join(f"<li><span class='b {c}'>{SYM[c]}</span><span>{t}</span></li>" for c, t in items) + "</ul>"

h = "<meta charset=utf-8><style>" + css + "</style>"
h += f"<div class='top'><h1>{NOM} · <span class='or'>Check-list</span></h1><p>Échéances, ce qui vous attend, ce que Claude fera ensuite, décisions à prendre. Mise à jour : {D}.</p></div>"
h += ("<div class='rappel'><b>⚠ RAPPEL — avant le 10 décembre 2026 : passer la base Render en « Basic 256 Mo ».</b><br>"
      "L'offre Free de la base <code>le-qln-db</code> expire 30 jours après sa création (puis 14 jours de grâce avant suppression des données : comptes, progression, scores). "
      "Render → projet Le-QLN → <b>le-qln-db</b> → <b>Upgrade</b> (ou Settings → Instance type) → <b>Basic-256mb</b> (≈ 6 $/mois, sauvegardes quotidiennes). "
      "Aucune autre manipulation : l'adresse de la base ne change pas, le serveur continue sans coupure. Une notification de rappel vous sera aussi envoyée début décembre.</div>")
h += "<p class='n'>Légende : <b style='color:#d9412b'>!</b> échéance · <b style='color:#e09a1a'>◷</b> à faire par vous · <b style='color:#5b6cd6'>?</b> décision à prendre · <b style='color:#9aa3b5'>○</b> à faire par Claude · <b style='color:#2e9e5b'>✔</b> fait</p>"
h += sec("Échéances", [
    ("urg", "<b>Base Render → Basic 256 Mo avant le 10/12/2026</b> (voir l'encadré ci-dessus)."),
    ("urg", "<b>Serveur Render → Starter (7 $/mois)</b> à l'ouverture au public : l'offre Free s'endort après 15 min (premier réveil ≈ 30 s)."),
])
h += sec("En cours chez vous", [
    ("vous", "<b>Google Play Console</b> : validation d'identité en attente (statut « non professionnel » pour l'instant) ; puis confirmer l'accès à un appareil Android et le numéro de téléphone."),
    ("vous", "<b>AdMob</b> : compte créé, validation d'identité en attente. Ensuite : ajouter l'appli Android (puis iOS), créer les blocs d'annonces, envoyer les identifiants à Claude."),
    ("vous", "<b>Cloudflare</b> : prêt à créer ; acheter le domaine quand le nom est choisi."),
    ("vous", "<b>Apple Developer</b> (99 €/an) : quand le nom est choisi ; puis clé API App Store Connect et 4 secrets GitHub (voir « Version Apple »)."),
    ("vous", "<b>marque.json</b> : renseigner éditeur, adresse, e-mail de contact avant la publication (mentions légales)."),
    ("vous", "<b>Entreprise</b> : micro-entreprise conseillée pour Airmony et Le-QLN ensemble, juste avant d'activer de vraies publicités."),
])
h += sec("Décisions à prendre", [
    ("dec", "<b>Nom définitif</b> : présélection Qlinn, Anagold, Wordheist, Lexipot (voir « Choisir le nom du jeu »)."),
    ("vous", "<b>Relire les thèmes</b> : tableur « Thèmes des séries » (mettre un x pour retirer un mot, proposer des ajouts)."),
    ("dec", "<b>Règles</b> : propositions en attente (document « Propositions de règles »), vidéos récompense touchant aux règles."),
    ("dec", "<b>Mots douteux</b> : tableur à relire (gardés par défaut)."),
    ("dec", "<b>Organisation du dépôt</b> : garder le jeu à la racine, ou le ranger dans <code>app/</code> (publication par une action GitHub, même adresse)."),
])
h += sec("Prochaines étapes de Claude", [
    ("todo", "Brancher <b>AdMob</b> (Android puis iOS) dès les identifiants reçus : consentement RGPD, ATT sur iPhone, app-ads.txt, repli hors ligne sur des créations locales."),
    ("todo", "<b>Multijoueur synchronisé sur le plateau</b> (dés, cartes et sabliers partagés) — quand vous le demandez."),
    ("todo", "<b>Mot de passe oublié</b> (Resend) après l'achat du domaine."),
    ("todo", "<b>Fiche Play Store / App Store</b> : textes FR/EN, captures, formulaire Sécurité des données."),
    ("todo", "Clé de signature de publication Android (Google Play) et fabrication de l'appli publiée."),
    ("todo", "Changer le nom partout dès qu'il est choisi (action « Changer le nom »)."),
])
h += sec("Fait", [
    ("ok", "<b>10/11</b> — « le plus riche gagne » rendu évident (rappel, bandeau, bonus d'arrivée, podium détaillé) ; design rapproché des maquettes (dé 3D doré, cadre lumineux)."),
    ("ok", "<b>10/11</b> — séries du Défi : 16 thèmes FR / 9 EN, série dans l'autre langue, design par thème, déblocage par niveau, sans classement ; vibrations plus douces, lueur de validation."),
    ("ok", "<b>10/11</b> — version Apple préparée (fabrication sur Mac GitHub, simulateur OK ; TestFlight dès le compte Apple) ; note « Services externes »."),
    ("ok", "<b>10/11</b> — jeu complet hors ligne (scores en attente, pubs en cache, démarrage rapide sur réseau lent, multi signalé)."),
    ("ok", "<b>10/11</b> — accueil multi (salons en attente) + Partie rapide ; anti-triche des classements ; confidentialité et mentions légales ; aide au choix du nom."),
    ("ok", "<b>10/11</b> — serveur en ligne sur Render (base dédiée), tests et vérifications automatiques, appli Android de test, nom changeable en un seul endroit."),
    ("ok", "<b>8–9/11</b> — version anglaise, multijoueur (salons), comptes et classements, progression, partage, design, contestation des mots."),
])
out = ICI / "checklist.html"; out.write_text(h, encoding="utf-8")
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.goto(out.as_uri()); pg.wait_for_timeout(300)
    pg.pdf(path=str(RACINE / "docs" / "check-list.pdf"), format="A4", print_background=True); b.close()
idx = RACINE / "docs" / "index.json"; docs = json.loads(idx.read_text(encoding="utf-8"))
docs = [x for x in docs if x["fichier"] != "check-list.pdf"]
docs.insert(0, {"titre": "Check-list", "fichier": "check-list.pdf", "date": now.strftime("%Y-%m-%d"),
                "description": "Échéances (base Render en Basic avant le 10/12), démarches en cours de votre côté, décisions à prendre, prochaines étapes et ce qui est fait."})
idx.write_text(json.dumps(docs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("docs/check-list.pdf généré")
