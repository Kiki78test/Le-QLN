#!/usr/bin/env python3
"""Change le nom affiché du jeu partout (titre, logo, menus, partage, manifeste, appli Android, version anglaise, icône).

  python3 tools/changer_nom.py "NouveauNom" [--sigle XYZ]

Ne touche PAS aux identifiants techniques (adresse GitHub Pages /AnagramX/, noms des services Render, clés « qln: » du
stockage local : changer ces dernières ferait perdre leur progression aux joueurs). Le nom courant est lu dans marque.json.
Après le changement : régénère la version anglaise (build_en.py) et l'icône (--sigle = 2-4 lettres affichées sur l'icône)."""
import json, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = ROOT / "app" if (ROOT / "app" / "index.html").exists() else ROOT
JEU = ["index.html", "multi.js", "infos.js", "progres.js", "compte.js", "pub.js", "plateau.js", "series.js", "barre.js", "manifest.webmanifest"]
PRE = "app/" if APP != ROOT else ""   # le jeu est dans app/
FICHIERS = [PRE + f for f in JEU] + [
            "README.md", "server/index.js", "server/README.md", "mobile/capacitor.config.json", "mobile/www/index.html",
            "tools/en_index.py", "tools/en_plateau.py", "tools/en_pub.py", "tools/en_infos.py"]
FICHIERS += [f"tools/{p.name}" for p in (ROOT / "tools").glob("en_*.py") if f"tools/{p.name}" not in FICHIERS]

def valider(nom):
    if not re.fullmatch(r"[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9 .\-]{0,22}[A-Za-zÀ-ÿ0-9.]", nom):
        sys.exit("Nom refusé : 2 à 24 caractères, lettres, chiffres, espaces, tirets ou points (pas d'apostrophe ni de guillemet).")

def remplacer(texte, ancien, nouveau):
    # « Le-QLN » affiché ; on laisse les adresses (/AnagramX/), les fichiers (Le-QLN-Android…) et les liens github.io/…
    maj_a, maj_n = ancien.upper(), nouveau.upper()
    gardes = r"(?!/|-Android|-tests|-mots|-anagram)"
    texte, n1 = re.subn(r"(?<!io/)" + re.escape(ancien) + gardes, lambda m: nouveau, texte)
    texte, n2 = re.subn(re.escape(maj_a) + gardes, lambda m: maj_n, texte) if maj_a != ancien else (texte, 0)
    return texte, n1 + n2

def icones(sigle):
    try: from PIL import Image, ImageDraw, ImageFont
    except ImportError: print("Icône non régénérée (Pillow absent)."); return
    import os
    police = next((p for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"] if os.path.exists(p)), None)
    if not police: print("Icône non régénérée (aucune police)."); return
    def dessiner(taille, marge):
        im = Image.new("RGB", (taille, taille)); px = im.load()
        for y in range(taille):
            for x in range(taille):
                d = ((x - taille / 2) ** 2 + (y - taille * .45) ** 2) ** .5 / (taille * .75); t = min(1, d)
                px[x, y] = (int(30 + (11 - 30) * t), int(70 + (26 - 70) * t), int(150 + (58 - 150) * t))
        dr = ImageDraw.Draw(im); zone = taille * (1 - 2 * marge)
        f = taille * .34
        while True:
            font = ImageFont.truetype(police, int(f)); l, h, r, b = dr.textbbox((0, 0), sigle, font=font)
            if r - l <= zone or f < 20: break
            f *= .94
        x = (taille - (r - l)) / 2 - l; y = taille * .40 - (b - h) / 2 - h; o = max(2, taille // 90)
        dr.text((x + o, y + o), sigle, font=font, fill=(0, 0, 0)); dr.text((x, y), sigle, font=font, fill=(255, 255, 255))
        bw = zone / 4; by = taille * .64; bh = taille * .17
        for i, (a, c) in enumerate([((46, 125, 50), (139, 195, 74)), ((30, 80, 160), (100, 160, 230)), ((150, 20, 30), (230, 50, 50)), ((15, 15, 15), (70, 70, 70))]):
            x0 = taille * marge + i * bw
            for k in range(int(bw)):
                t = k / bw; col = tuple(int(a[j] + (c[j] - a[j]) * t) for j in range(3)); dr.rectangle([x0 + k, by, x0 + k + 1, by + bh], fill=col)
        dr.rectangle([taille * marge - 2, by - 2, taille * (1 - marge) + 2, by + bh + 2], outline=(0, 0, 0), width=max(2, taille // 100))
        return im
    for nom, t, m in [("icon-192.png", 192, .09), ("icon-512.png", 512, .09), ("apple-touch-icon.png", 180, .09), ("maskable-192.png", 192, .2), ("maskable-512.png", 512, .2), ("icon-1024.png", 1024, .09)]:
        dessiner(t, m).save(APP / "icons" / nom)
    print("Icônes régénérées avec :", sigle)

def android():
    """Icônes de l'appli Android et écran de démarrage, refaits à partir des icônes du site."""
    try: from PIL import Image, ImageDraw
    except ImportError: return
    res = ROOT / "mobile" / "native" / "android" / "res"
    if not res.exists(): return
    BG = (11, 26, 58, 255)
    ico = Image.open(APP / "icons" / "icon-512.png").convert("RGBA"); mask = Image.open(APP / "icons" / "maskable-512.png").convert("RGBA")
    dens = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
    for d, f in dens.items():
        p = res / f"mipmap-{d}"; p.mkdir(parents=True, exist_ok=True); s = int(48 * f)
        im = mask.resize((s, s), Image.LANCZOS); im.save(p / "ic_launcher.png")
        m = Image.new("L", (s, s), 0); ImageDraw.Draw(m).ellipse((0, 0, s - 1, s - 1), fill=255)
        r = Image.new("RGBA", (s, s), (0, 0, 0, 0)); r.paste(im, (0, 0), m); r.save(p / "ic_launcher_round.png")
        fs = int(108 * f); fg = Image.new("RGBA", (fs, fs), BG); k = int(fs * .86); fg.paste(mask.resize((k, k), Image.LANCZOS), ((fs - k) // 2, (fs - k) // 2)); fg.save(p / "ic_launcher_foreground.png")
    def splash(w, h, chemin):
        chemin.parent.mkdir(parents=True, exist_ok=True); im = Image.new("RGBA", (w, h), BG); k = int(min(w, h) * .32); ic = ico.resize((k, k), Image.LANCZOS); im.paste(ic, ((w - k) // 2, (h - k) // 2), ic); im.convert("RGB").save(chemin)
    splash(1280, 1280, res / "drawable" / "splash.png")
    for d, f in dens.items():
        splash(int(320 * f), int(480 * f), res / f"drawable-port-{d}" / "splash.png"); splash(int(480 * f), int(320 * f), res / f"drawable-land-{d}" / "splash.png")
    print("Icônes Android régénérées")

def main():
    args = sys.argv[1:]
    if not args: sys.exit(__doc__)
    nouveau = args[0].strip(); sigle = None
    if "--sigle" in args: sigle = args[args.index("--sigle") + 1].strip().upper()
    valider(nouveau)
    mf = ROOT / "marque.json"; marque = json.loads(mf.read_text(encoding="utf-8")); ancien = marque["nom"]
    if nouveau == ancien and not sigle: print("Nom inchangé."); return
    total = 0
    for f in FICHIERS:
        p = ROOT / f
        if not p.exists(): continue
        t = p.read_text(encoding="utf-8"); t2, n = remplacer(t, ancien, nouveau)
        if n: p.write_text(t2, encoding="utf-8"); total += n; print(f"{f}: {n}")
    marque["nom"] = nouveau
    if sigle: marque["sigle"] = sigle
    mf.write_text(json.dumps(marque, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{total} remplacements : {ancien} → {nouveau}")
    if (ROOT / "tools" / "build_en.py").exists(): (subprocess.run([sys.executable, str(ROOT / "tools" / "build_legal.py")], check=True, stdout=subprocess.DEVNULL), subprocess.run([sys.executable, str(ROOT / "tools" / "build_en.py")], check=True, stdout=subprocess.DEVNULL))
    if sigle: icones(sigle); android()
    # documents PDF : même charte, nouveau nom (si Playwright est installé ; sinon : python3 docs-src/tout.py plus tard)
    try:
        import playwright  # noqa
        subprocess.run([sys.executable, str(ROOT / "docs-src" / "tout.py")], check=False, stdout=subprocess.DEVNULL)
    except ImportError: print("Documents PDF non régénérés (Playwright absent) : lancer python3 docs-src/tout.py")
    if len(nouveau) > 10: print("Attention : nom long (> 10 caractères) — vérifier le logo en haut de l'écran.")

if __name__ == "__main__": main()
