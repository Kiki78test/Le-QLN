"""Pages publiques pour les moteurs de recherche (ajoutées au site par tools/site.py, jamais à l'appli) :
  - une page par mot du jeu : « Anagrammes de CHIEN » (FR : anagrammes/<mot>.html, EN : en/anagrams/<word>.html),
    avec les autres mots formés des mêmes lettres, la couleur de la carte, la définition (Wiktionnaire, CC BY-SA)
    et un lien pour jouer ; un index par lettre ;
  - la page de présentation du jeu (presentation.html et en/presentation.html) avec des captures ;
  - sitemap.xml (à déclarer dans Google Search Console) et robots.txt.
Usage : python3 tools/pages_publiques.py <dossier du site>          (appelé par tools/site.py)
        python3 tools/pages_publiques.py --images                   (recrée les captures de la présentation, Pillow requis)"""
import json, pathlib, sys, unicodedata, html, re, datetime
RACINE = pathlib.Path(__file__).resolve().parent.parent
APP = RACINE / "app"
MARQUE = json.loads((RACINE / "marque.json").read_text(encoding="utf-8")) if (RACINE / "marque.json").exists() else {}
NOM = MARQUE.get("nom") or "Le-QLN"
cfg = (APP / "config.js").read_text(encoding="utf-8")
SITE = (re.search(r'QLN_SITE_URL = "([^"]+)"', cfg) or [None, "https://kiki78test.github.io/AnagramX/"])[1].rstrip("/") + "/"
IMG = APP / "presentation"   # captures redimensionnées (versionnées)
e = html.escape
NIV = {"fr": {"v": ("verte", "4 à 5 lettres", 20, 30), "b": ("bleue", "6 à 7 lettres", 50, 60), "r": ("rouge", "8 à 9 lettres", 100, 120), "n": ("noire", "10 lettres et plus", 200, 180)},
       "en": {"v": ("green", "4 to 5 letters", 20, 30), "b": ("blue", "6 to 7 letters", 50, 60), "r": ("red", "8 to 9 letters", 100, 120), "n": ("black", "10 letters or more", 200, 180)}}
COUL = {"v": "#3fae2a", "b": "#1c6fd6", "r": "#c8203c", "n": "#2b2f3a"}


def slug(m):
    s = unicodedata.normalize("NFD", m.lower()).replace("œ", "oe").replace("æ", "ae")
    return "".join(c for c in s if unicodedata.category(c) != "Mn" and c.isalpha() and c.isascii())


CSS = """@font-face{font-family:"Barlow Condensed";font-weight:800;font-display:swap;src:url(%(f)sbarlow-condensed-latin-800-normal.woff2) format("woff2")}
@font-face{font-family:"Barlow Condensed";font-weight:700;font-display:swap;src:url(%(f)sbarlow-condensed-latin-700-normal.woff2) format("woff2")}
@font-face{font-family:Barlow;font-weight:400;font-display:swap;src:url(%(f)sbarlow-latin-400-normal.woff2) format("woff2")}
@font-face{font-family:Barlow;font-weight:600;font-display:swap;src:url(%(f)sbarlow-latin-600-normal.woff2) format("woff2")}
@font-face{font-family:Barlow;font-weight:700;font-display:swap;src:url(%(f)sbarlow-latin-700-normal.woff2) format("woff2")}
:root{--or:#ffd84a;--brume:#b4c3e6;--texte:#eef3ff}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;color:var(--texte);font:400 17px/1.55 Barlow,system-ui,sans-serif;background:#0b1d49 radial-gradient(1100px 620px at 50%% -12%%,#2a5fd0,#0b1d49 62%%) fixed}
a{color:var(--or)}
header{display:flex;align-items:center;gap:16px;padding:12px max(16px,4vw);background:rgba(6,16,46,.88);border-bottom:1px solid rgba(255,216,74,.3);position:sticky;top:0;z-index:2;backdrop-filter:blur(8px)}
header .logo{font:800 26px "Barlow Condensed",sans-serif;letter-spacing:.05em;color:#fff;text-decoration:none}
header nav{margin-left:auto;display:flex;gap:16px;flex-wrap:wrap;font:600 15px Barlow,sans-serif} header nav a{color:var(--brume);text-decoration:none} header nav a:hover{color:var(--or)}
main{max-width:860px;margin:0 auto;padding:28px 16px 60px}
h1{font:800 clamp(34px,6vw,54px)/1.02 "Barlow Condensed",sans-serif;letter-spacing:.02em;margin:0 0 10px;background:linear-gradient(180deg,#fff7c9,#ffd84a 55%%,#e5a313);-webkit-background-clip:text;background-clip:text;color:transparent}
h2{font:800 28px/1.1 "Barlow Condensed",sans-serif;letter-spacing:.03em;color:var(--or);margin:34px 0 10px}
.chapo{font-size:19px;color:#dfe8ff}
.cartes{display:flex;flex-wrap:wrap;gap:12px;margin:18px 0}
.carte{display:block;min-width:150px;padding:14px 18px;border-radius:14px;background:#f8f2e4;color:#15171d;text-decoration:none;box-shadow:0 8px 20px rgba(0,0,0,.35),inset 0 0 0 4px var(--c)}
.carte b{display:block;font:800 30px/1 "Barlow Condensed",sans-serif;letter-spacing:.06em} .carte small{color:#5b6070;font-weight:600}
.carte.origine{background:var(--c);color:#fff} .carte.origine small{color:#ffffffcc}
.def{padding:12px 16px;border-radius:12px;background:rgba(3,10,30,.45);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);margin:10px 0}
.def b{color:#fff} .def small{display:block;color:var(--brume);font-size:13px;margin-top:4px}
.jouer{display:inline-block;margin:22px 0 6px;padding:14px 26px;border-radius:999px;background:linear-gradient(180deg,#fff2b0,#ffd84a 45%%,#f2b318);color:#2a1800;font:800 22px "Barlow Condensed",sans-serif;letter-spacing:.05em;text-decoration:none;box-shadow:0 8px 22px rgba(255,190,30,.35)}
.lettres{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0} .lettres a{display:grid;place-items:center;width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,.08);text-decoration:none;font:800 20px "Barlow Condensed",sans-serif;color:#fff}
.lettres a.on{background:var(--or);color:#2a1800}
.liste{columns:3 180px;gap:24px;padding:0;list-style:none} .liste li{break-inside:avoid;padding:2px 0} .liste a{text-decoration:none;color:#e7eeff} .liste a:hover{color:var(--or)} .liste i{color:var(--brume);font-style:normal;font-size:14px}
.note{color:var(--brume);font-size:14px}
footer{max-width:860px;margin:0 auto;padding:20px 16px 40px;color:var(--brume);font-size:14px;border-top:1px solid rgba(255,255,255,.1)} footer a{color:var(--brume)}
.galerie{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;margin:16px 0}
.galerie figure{margin:0} .galerie img{width:100%%;height:auto;border-radius:16px;box-shadow:0 10px 26px rgba(0,0,0,.45);display:block} .galerie figcaption{font:600 14px Barlow,sans-serif;color:var(--brume);margin-top:6px;text-align:center}
.modes{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.mode{padding:14px 16px;border-radius:14px;background:linear-gradient(160deg,rgba(255,255,255,.1),rgba(255,255,255,.03));box-shadow:inset 0 0 0 1px rgba(255,255,255,.1)} .mode b{display:block;font:800 22px "Barlow Condensed",sans-serif;color:#fff;letter-spacing:.03em} .mode span{color:#d4ddf3;font-size:15.5px}
.niveaux{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px} .niveaux div{padding:12px;border-radius:12px;background:var(--c);color:#fff} .niveaux b{display:block;font:800 22px "Barlow Condensed",sans-serif}
details{padding:10px 14px;border-radius:12px;background:rgba(3,10,30,.4);margin:8px 0} summary{cursor:pointer;font-weight:700}
@media (max-width:600px){ header nav{gap:10px;font-size:14px} .carte{min-width:0;flex:1 1 140px} }
"""

T = {
    "fr": {"dossier": "anagrammes", "titre": lambda m: f"Anagrammes de {m}", "accueil": "Le jeu", "toutes": "Toutes les anagrammes", "pres": "Présentation",
           "desc": lambda m, a: f"{m} : {len(a)} anagramme{'s' if len(a) > 1 else ''} ({', '.join(a)}). Définitions et jeu d'anagrammes gratuit {NOM}.",
           "chapo": lambda m, n, a: f"Avec les {n} lettres de <b>{m}</b>, on peut aussi écrire {('<b>' + '</b>, <b>'.join(a[:-1]) + '</b> et <b>' + a[-1] + '</b>') if len(a) > 1 else '<b>' + a[0] + '</b>'}.",
           "carte": lambda c, l: f"Dans {NOM}, ce mot est une <b>carte {c}</b> ({l}).",
           "regle": lambda g, t: f"Trouvez une anagramme avant la fin du sablier ({t} s) pour gagner {g} € ; chaque anagramme en plus rapporte encore.",
           "defs": "Définitions", "source": "Définition : Wiktionnaire (CC BY-SA 4.0)", "jouer": "Jouer gratuitement", "autres": "Les autres mots de la carte",
           "indexT": "Toutes les anagrammes du jeu", "indexD": f"Les mots du jeu {NOM} et leurs anagrammes, classés par lettre.",
           "indexChapo": lambda n: f"{n} mots du jeu et leurs anagrammes. Choisissez une lettre :", "lettreT": lambda l: f"Anagrammes en {l}",
           "pied": f"{NOM} — le jeu d'anagrammes qui rapporte. Dictionnaire construit à partir de Lexique 3.83 (CC BY-SA 4.0).", "mentions": "Mentions légales", "confid": "Confidentialité",
           "mentionsUrl": "mentions-legales.html", "confidUrl": "confidentialite.html", "lang": "fr"},
    "en": {"dossier": "anagrams", "titre": lambda m: f"Anagrams of {m}", "accueil": "The game", "toutes": "All anagrams", "pres": "About",
           "desc": lambda m, a: f"{m}: {len(a)} anagram{'s' if len(a) > 1 else ''} ({', '.join(a)}). Free anagram game {NOM}.",
           "chapo": lambda m, n, a: f"With the {n} letters of <b>{m}</b>, you can also spell {('<b>' + '</b>, <b>'.join(a[:-1]) + '</b> and <b>' + a[-1] + '</b>') if len(a) > 1 else '<b>' + a[0] + '</b>'}.",
           "carte": lambda c, l: f"In {NOM}, this word is a <b>{c} card</b> ({l}).",
           "regle": lambda g, t: f"Find an anagram before the timer runs out ({t} s) to win €{g}; every extra anagram pays again.",
           "defs": "Definitions", "source": "", "jouer": "Play for free", "autres": "The other words on the card",
           "indexT": "All the anagrams in the game", "indexD": f"The words of the {NOM} game and their anagrams, sorted by letter.",
           "indexChapo": lambda n: f"{n} words from the game and their anagrams. Pick a letter:", "lettreT": lambda l: f"Anagrams starting with {l}",
           "pied": f"{NOM} — the anagram game that pays.", "mentions": "Legal notice", "confid": "Privacy",
           "mentionsUrl": "legal-notice.html", "confidUrl": "privacy.html", "lang": "en"},
}


def page(lang, titre, desc, corps, prof, canon, extra_head=""):
    t = T[lang]; r = "../" * prof   # chemin vers la racine du jeu de cette langue
    racine_site = "../" * (prof + (1 if lang == "en" else 0))
    return f"""<!doctype html>
<html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(titre)} — {e(NOM)}</title><meta name="description" content="{e(desc)}"><link rel="canonical" href="{e(canon)}">
<meta property="og:title" content="{e(titre)}"><meta property="og:description" content="{e(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="{e(canon)}">
<meta property="og:image" content="{SITE}icons/icon-512.png"><link rel="icon" href="{racine_site}icons/icon-192.png"><meta name="theme-color" content="#0b1d49">
<link rel="stylesheet" href="{racine_site}anagrammes/style.css">{extra_head}</head>
<body><header><a class="logo" href="{r}./">{e(NOM.upper())}</a><nav><a href="{r}./">{t['accueil']}</a><a href="{r}presentation.html">{t['pres']}</a><a href="{r}{t['dossier']}/">{t['toutes']}</a></nav></header>
<main>{corps}</main>
<footer>{t['pied']} · <a href="{r}{t['mentionsUrl']}">{t['mentions']}</a> · <a href="{r}{t['confidUrl']}">{t['confid']}</a> · <a href="{racine_site}{'en/anagrams/' if lang == 'fr' else 'anagrammes/'}">{'English' if lang == 'fr' else 'Français'}</a></footer>
</body></html>"""


def anagrammes(sortie, lang):
    t = T[lang]
    dico = json.loads(((APP / "data" / "fr.json") if lang == "fr" else (APP / "en" / "data" / "en.json")).read_text(encoding="utf-8"))
    defs = json.loads((RACINE / "docs-src" / "definitions.json").read_text(encoding="utf-8")) if lang == "fr" and (RACINE / "docs-src" / "definitions.json").exists() else {}
    base = sortie / ("" if lang == "fr" else "en") / t["dossier"]
    base.mkdir(parents=True, exist_ok=True)
    url = SITE + ("" if lang == "fr" else "en/") + t["dossier"] + "/"
    mots = {}   # slug -> {"mots":[graphies], "groupe":[…], "niv":…}
    for niv in "vbrn":
        for g in dico.get(niv, []):
            for w in g:
                s = slug(w)
                if not s or len(s) < 3: continue
                m = mots.setdefault(s, {"mots": [], "groupe": g, "niv": niv})
                if w not in m["mots"]: m["mots"].append(w)
    urls = []
    for s, m in mots.items():
        grand = m["mots"][0].upper()
        autres = [w for w in m["groupe"] if slug(w) != s]
        if not autres: continue
        A = [w.upper() for w in autres]
        c, lettres, gain, temps = NIV[lang][m["niv"]]
        cartes = f'<span class="carte origine" style="--c:{COUL[m["niv"]]}"><b>{e(grand)}</b><small>{e(("carte " + c) if lang == "fr" else (c + " card"))}</small></span>' + "".join(
            f'<a class="carte" style="--c:{COUL[m["niv"]]}" href="{slug(w)}.html"><b>{e(w.upper())}</b><small>{len(slug(w))} {"lettres" if lang == "fr" else "letters"}</small></a>' for w in autres)
        dd = ""
        for w in [*m["mots"], *autres]:
            d = defs.get(w) or defs.get(w.lower())
            if d and d.get("definition"):
                lien = f'https://fr.wiktionary.org/wiki/{e(d.get("page") or w)}'
                txt = d["definition"].strip(); txt = txt if txt[-1:] in ".!?)»…" else txt + "…"
                dd += f'<div class="def"><b>{e(w.upper())}</b> — {e(txt)}<small>{t["source"]} · <a href="{lien}" rel="noopener">{e(d.get("page") or w)}</a></small></div>'
        corps = f"""<h1>{e(t['titre'](grand))}</h1>
<p class="chapo">{t['chapo'](e(grand), len(s), [e(x) for x in A])}</p>
<div class="cartes">{cartes}</div>
<p>{t['carte'](c, lettres)} {t['regle'](gain, temps)}</p>
<a class="jouer" href="../">{t['jouer']} ›</a>
{f'<h2>{t["defs"]}</h2>' + dd if dd else ''}
<p class="note"><a href="./">{t['toutes']}</a> · <a href="lettre-{s[0]}.html">{t['lettreT'](s[0].upper())}</a></p>"""
        (base / f"{s}.html").write_text(page(lang, t["titre"](grand), t["desc"](grand, A), corps, 1, url + f"{s}.html"), encoding="utf-8")
        urls.append(url + f"{s}.html")
    # index par lettre
    par_lettre = {}
    for s, m in mots.items():
        if any(slug(w) != s for w in m["groupe"]): par_lettre.setdefault(s[0], []).append((s, m))
    lettres = sorted(par_lettre)
    barre = lambda on: '<nav class="lettres">' + "".join(f'<a href="lettre-{l}.html" class="{"on" if l == on else ""}">{l.upper()}</a>' for l in lettres) + "</nav>"
    for l in lettres:
        items = sorted(par_lettre[l], key=lambda x: x[0])
        li = "".join(f'<li><a href="{s}.html">{e(m["mots"][0].upper())}</a> <i>{e(", ".join(w.upper() for w in m["groupe"] if slug(w) != s))}</i></li>' for s, m in items)
        corps = f'<h1>{e(t["lettreT"](l.upper()))}</h1>{barre(l)}<ul class="liste">{li}</ul><a class="jouer" href="../">{t["jouer"]} ›</a>'
        (base / f"lettre-{l}.html").write_text(page(lang, t["lettreT"](l.upper()), t["indexD"], corps, 1, url + f"lettre-{l}.html"), encoding="utf-8")
        urls.append(url + f"lettre-{l}.html")
    n = sum(len(v) for v in par_lettre.values())
    corps = f'<h1>{e(t["indexT"])}</h1><p class="chapo">{t["indexChapo"](f"{n:,}".replace(",", " " if lang == "fr" else ","))}</p>{barre("")}<a class="jouer" href="../">{t["jouer"]} ›</a>'
    (base / "index.html").write_text(page(lang, t["indexT"], t["indexD"], corps, 1, url), encoding="utf-8")
    urls.insert(0, url)
    return urls


PRES = {
    "fr": {"titre": f"{NOM} — le jeu d'anagrammes qui rapporte", "desc": f"{NOM} : trouvez un autre mot avec les mêmes lettres avant la fin du sablier. Gratuit, en solo, contre l'IA ou entre amis, sur téléphone et ordinateur.",
           "h1": "Le jeu d'anagrammes qui rapporte", "chapo": "Une carte, un mot, un sablier. Trouvez un <b>autre mot</b> avec exactement les mêmes lettres avant la fin du temps… et empochez le gain.",
           "jouer": "Jouer maintenant — c'est gratuit", "exemple": "Exemple : avec <b>CHIEN</b>, on peut écrire <b>NICHE</b> ou <b>CHINE</b>.",
           "niveauxT": "Quatre couleurs de cartes", "niveaux": [("Verte", "4–5 lettres · 30 s · 20 €"), ("Bleue", "6–7 lettres · 60 s · 50 €"), ("Rouge", "8–9 lettres · 2 min · 100 €"), ("Noire", "10 lettres et + · 3 min · 200 €")],
           "modesT": "Des façons de jouer pour tous les jours",
           "modes": [("Le Défi", "10 cartes, 3 vies, cagnotte à multiplicateur, jokers, cartes événement, coffres et carte légendaire."),
                     ("Défi du jour", "Les mêmes cartes pour tout le monde, un classement mondial et par pays, un résultat à partager."),
                     ("Duel de l'ombre", "Les cartes du jour contre votre fantôme ou une ombre simulée."),
                     ("Défi de la semaine", "Un scénario imposé pendant 7 jours, un seul essai classé."),
                     ("Le Festival", "Cinq manches à objectif : bronze, argent ou or."),
                     ("Le Braquage", "Six mots, un seul chrono, pas de passe."),
                     ("Contre l'IA", "Le plateau complet du jeu de société : dés, enchères, prison, le plus riche gagne."),
                     ("Multijoueur", "Créez un salon, partagez le code et jouez de 2 à 6, sur le même plateau."),
                     ("Séries", "Des thèmes (animaux, cuisine, voyage…) et des cartes en anglais, espagnol, allemand ou italien.")],
           "progT": "Une progression qui donne envie de revenir", "prog": "Niveaux et XP, série de jours 🔥, médailles bronze, argent et or, statistiques détaillées, partie guidée d'une minute pour débuter. Avec un compte, votre progression vous suit sur tous vos appareils.",
           "galerieT": "En images", "legendes": ["L'accueil", "Une carte en jeu", "Le plateau contre l'IA", "Le défi du jour", "Les séries", "Le podium", "Le multijoueur", "La progression"],
           "faqT": "Questions fréquentes",
           "faq": [("Le jeu est-il gratuit ?", "Oui : le jeu complet est gratuit, financé par la publicité."),
                   ("Faut-il installer quelque chose ?", "Non : le jeu s'ouvre dans le navigateur, sur téléphone, tablette ou ordinateur. Vous pouvez aussi l'ajouter à l'écran d'accueil, et il fonctionne hors connexion après la première visite. Les applis Android et iPhone arrivent."),
                   ("D'où viennent les mots ?", "Le dictionnaire est construit à partir de Lexique 3.83 (mots courants, formes de base). Un mot juste refusé peut être contesté : il est vérifié dans le Wiktionnaire et ajouté au jeu."),
                   ("Faut-il un compte ?", "Non pour jouer. Un compte gratuit sert aux classements, à garder sa progression sur plusieurs appareils et à inviter des amis.")],
           "anag": "Toutes les anagrammes du jeu", "dossier": "anagrammes"},
    "en": {"titre": f"{NOM} — the anagram game that pays", "desc": f"{NOM}: find another word with the same letters before the timer runs out. Free, solo, against the AI or with friends, on phone and computer.",
           "h1": "The anagram game that pays", "chapo": "One card, one word, one timer. Find <b>another word</b> using exactly the same letters before time runs out… and take the money.",
           "jouer": "Play now — it's free", "exemple": "Example: with <b>LISTEN</b>, you can spell <b>SILENT</b> or <b>TINSEL</b>.",
           "niveauxT": "Four card colours", "niveaux": [("Green", "4–5 letters · 30 s · €20"), ("Blue", "6–7 letters · 60 s · €50"), ("Red", "8–9 letters · 2 min · €100"), ("Black", "10+ letters · 3 min · €200")],
           "modesT": "Ways to play, every day",
           "modes": [("The Challenge", "10 cards, 3 lives, a multiplier pot, jokers, event cards, chests and a legendary card."),
                     ("Daily challenge", "The same cards for everyone, world and country rankings, a result to share."),
                     ("Shadow duel", "Today's cards against your ghost or a simulated shadow."),
                     ("Weekly challenge", "A set scenario for 7 days, one ranked attempt."),
                     ("The Festival", "Five rounds with a target: bronze, silver or gold."),
                     ("The Heist", "Six words, one clock, no passing."),
                     ("Against the AI", "The full board game: dice, auctions, jail, the richest player wins."),
                     ("Multiplayer", "Create a room, share the code and play 2 to 6 on the same board."),
                     ("Series", "Themes (animals, food, travel…) and cards in French, Spanish, German or Italian.")],
           "progT": "Progress that brings you back", "prog": "Levels and XP, daily streak 🔥, bronze, silver and gold medals, detailed stats, a one-minute guided game to start. With an account, your progress follows you on all your devices.",
           "galerieT": "Screenshots", "legendes": ["Home", "A card in play", "The board vs the AI", "Daily challenge", "Series", "Podium", "Multiplayer", "Progress"],
           "faqT": "FAQ",
           "faq": [("Is the game free?", "Yes: the full game is free, funded by ads."),
                   ("Do I need to install anything?", "No: the game runs in your browser, on phone, tablet or computer. You can add it to your Home Screen, and it works offline after the first visit. Android and iPhone apps are coming."),
                   ("Where do the words come from?", "From a dictionary of common English words (base forms). A correct word that gets refused can be challenged: it is checked on Wiktionary and added to the game."),
                   ("Do I need an account?", "Not to play. A free account gives you rankings, your progress on several devices and friend invitations.")],
           "anag": "All the anagrams in the game", "dossier": "anagrams"},
}


def presentation(sortie, lang):
    p = PRES[lang]; t = T[lang]
    imgs = sorted((IMG / lang).glob("*.jpg")) if (IMG / lang).exists() else []
    prefixe = "presentation/" if lang == "fr" else "../presentation/"
    galerie = "".join(f'<figure><img src="{prefixe}{lang}/{i.name}" alt="{e(p["legendes"][k] if k < len(p["legendes"]) else "")}" loading="lazy" width="390" height="844"><figcaption>{e(p["legendes"][k] if k < len(p["legendes"]) else "")}</figcaption></figure>' for k, i in enumerate(imgs))
    corps = f"""<h1>{e(p['h1'])}</h1><p class="chapo">{p['chapo']}</p><p>{p['exemple']}</p>
<a class="jouer" href="./">{e(p['jouer'])} ›</a>
<h2>{e(p['niveauxT'])}</h2><div class="niveaux">{''.join(f'<div style="--c:{c}"><b>{e(n)}</b>{e(d)}</div>' for (n, d), c in zip(p['niveaux'], COUL.values()))}</div>
<h2>{e(p['modesT'])}</h2><div class="modes">{''.join(f'<div class="mode"><b>{e(n)}</b><span>{e(d)}</span></div>' for n, d in p['modes'])}</div>
<h2>{e(p['progT'])}</h2><p>{e(p['prog'])}</p>
{f'<h2>{e(p["galerieT"])}</h2><div class="galerie">{galerie}</div>' if galerie else ''}
<h2>{e(p['faqT'])}</h2>{''.join(f'<details><summary>{e(q)}</summary><p>{e(r)}</p></details>' for q, r in p['faq'])}
<a class="jouer" href="./">{e(p['jouer'])} ›</a>
<p class="note"><a href="{p['dossier']}/">{e(p['anag'])}</a></p>"""
    ld = json.dumps({"@context": "https://schema.org", "@type": "VideoGame", "name": NOM, "url": SITE + ("en/" if lang == "en" else ""), "description": p["desc"], "genre": ["Word game", "Puzzle"],
                     "gamePlatform": ["Web browser", "Android", "iOS"], "applicationCategory": "Game", "inLanguage": lang, "offers": {"@type": "Offer", "price": "0", "priceCurrency": "EUR"}}, ensure_ascii=False)
    d = sortie / ("" if lang == "fr" else "en")
    d.mkdir(parents=True, exist_ok=True)
    (d / "presentation.html").write_text(page(lang, p["titre"], p["desc"], corps, 0, SITE + ("en/" if lang == "en" else "") + "presentation.html",
                                              f'<script type="application/ld+json">{ld}</script>'), encoding="utf-8")
    return [SITE + ("en/" if lang == "en" else "") + "presentation.html"]


def generer(sortie):
    sortie = pathlib.Path(sortie)
    (sortie / "anagrammes").mkdir(parents=True, exist_ok=True)
    (sortie / "anagrammes" / "style.css").write_text(CSS % {"f": "../fonts/"}, encoding="utf-8")
    urls = [SITE, SITE + "en/"]
    for lang in ("fr", "en"):
        urls += presentation(sortie, lang)
        urls += anagrammes(sortie, lang)
    if IMG.exists():
        import shutil
        shutil.copytree(IMG, sortie / "presentation", dirs_exist_ok=True)
    jour = datetime.date.today().isoformat()
    (sortie / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "".join(f"<url><loc>{e(u)}</loc><lastmod>{jour}</lastmod></url>\n" for u in urls) + "</urlset>\n", encoding="utf-8")
    (sortie / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {SITE}sitemap.xml\n", encoding="utf-8")
    return len(urls)


def images():
    """Captures de la présentation : store/captures/brutes/<lang>/telephone/*.png -> app/presentation/<lang>/*.jpg (390 px)"""
    from PIL import Image
    for lang in ("fr", "en"):
        src = RACINE / "store" / "captures" / "brutes" / lang / "telephone"
        d = IMG / lang; d.mkdir(parents=True, exist_ok=True)
        for f in sorted(src.glob("*.png")):
            im = Image.open(f).convert("RGB"); im = im.resize((390, round(im.height * 390 / im.width)), Image.LANCZOS)
            im.save(d / (f.stem + ".jpg"), quality=80, optimize=True, progressive=True)
        print(lang, len(list(d.glob("*.jpg"))), "captures")


if __name__ == "__main__":
    if sys.argv[1:] == ["--images"]: images()
    else: print(f"pages publiques : {generer(sys.argv[1] if len(sys.argv) > 1 else RACINE / '_site')} adresses (sitemap.xml)")
