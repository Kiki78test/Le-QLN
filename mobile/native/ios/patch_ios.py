# Version Apple (iOS) de Le-QLN — appelé par la fabrication GitHub (macOS), en deux temps :
#   python3 patch_ios.py preparer   avant « npx cap add ios » : embarque le jeu dans l'appli (www/) et retire l'adresse du site
#   python3 patch_ios.py reglages   après « npx cap add ios » : nom, portrait, icône, écran de démarrage, numéro de version
# Pourquoi embarquer le jeu (au lieu d'ouvrir le site comme sur Android) : Apple refuse souvent une appli qui n'est
# qu'une fenêtre sur un site (règle 4.2), et le jeu marche ainsi hors ligne dès l'installation.
# Les comptes, classements et le multijoueur passent toujours par le serveur (origine capacitor://localhost autorisée).
import json, os, plistlib, re, shutil, sys
ICI = os.path.dirname(os.path.abspath(__file__))
MOBILE = os.path.normpath(os.path.join(ICI, "..", ".."))
RACINE = os.path.normpath(os.path.join(MOBILE, ".."))
MARQUE = json.load(open(os.path.join(RACINE, "marque.json"), encoding="utf-8"))
BLEU = (11, 26, 58)

def preparer():
    www = os.path.join(MOBILE, "www")
    shutil.rmtree(www, ignore_errors=True); os.makedirs(www)
    # tous les scripts et pages de la racine (un nouveau module .js est ainsi embarqué automatiquement)
    fichiers = sorted(f for f in os.listdir(RACINE) if f.endswith((".js", ".html")) and f != "sw.js") + ["manifest.webmanifest", "marque.json"]
    for f in fichiers: shutil.copy(os.path.join(RACINE, f), os.path.join(www, f))
    for d in ["data", "fonts", "icons", "pubs", "docs", "en"]:
        shutil.copytree(os.path.join(RACINE, d), os.path.join(www, d))
    cfg_p = os.path.join(MOBILE, "capacitor.config.json"); cfg = json.load(open(cfg_p, encoding="utf-8"))
    cfg.pop("server", None)                                   # le jeu est servi depuis l'appli (capacitor://localhost)
    json.dump(cfg, open(cfg_p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("iOS : jeu embarqué dans www/ (%d fichiers racine + dossiers)" % len(fichiers))

def reglages():
    app = os.path.join(MOBILE, "ios", "App", "App")
    pl_p = os.path.join(app, "Info.plist"); pl = plistlib.load(open(pl_p, "rb"))
    pl["CFBundleDisplayName"] = MARQUE["nom"]
    pl["UISupportedInterfaceOrientations"] = ["UIInterfaceOrientationPortrait"]
    pl["UISupportedInterfaceOrientations~ipad"] = ["UIInterfaceOrientationPortrait", "UIInterfaceOrientationPortraitUpsideDown"]
    pl["UIRequiresFullScreen"] = True
    pl["UIStatusBarStyle"] = "UIStatusBarStyleLightContent"
    pl["UIViewControllerBasedStatusBarAppearance"] = False
    pl["ITSAppUsesNonExemptEncryption"] = False             # HTTPS standard uniquement : pas de déclaration d'export
    pl["CFBundleDevelopmentRegion"] = "fr"
    pl["CFBundleLocalizations"] = ["fr", "en"]
    n = os.environ.get("GITHUB_RUN_NUMBER")
    if n: pl["CFBundleVersion"] = n; pl["CFBundleShortVersionString"] = "0.1.%s" % n
    plistlib.dump(pl, open(pl_p, "wb"))
    # numéros de version aussi dans le projet Xcode (MARKETING_VERSION / CURRENT_PROJECT_VERSION)
    pbx = os.path.join(MOBILE, "ios", "App", "App.xcodeproj", "project.pbxproj")
    if os.path.exists(pbx):
        t = open(pbx, encoding="utf-8").read()
        if n:
            t = re.sub(r"CURRENT_PROJECT_VERSION = [^;]+;", "CURRENT_PROJECT_VERSION = %s;" % n, t)
            t = re.sub(r"MARKETING_VERSION = [^;]+;", "MARKETING_VERSION = 0.1.%s;" % n, t)
        # iPhone uniquement pour la première version (sur iPad, l'appli s'ouvre en mode iPhone agrandi) :
        # pas de captures iPad exigées par l'App Store ; une mise en page iPad dédiée pourra venir ensuite
        t = re.sub(r'TARGETED_DEVICE_FAMILY = "?[0-9,]+"?;', "TARGETED_DEVICE_FAMILY = 1;", t)
        open(pbx, "w", encoding="utf-8").write(t)
    try:
        from PIL import Image
    except ImportError:
        print("Pillow absent : icône et démarrage par défaut"); return
    # icône : une seule image 1024 × 1024 sans transparence (Xcode 14+ en déduit toutes les tailles)
    ico_dir = os.path.join(app, "Assets.xcassets", "AppIcon.appiconset")
    if os.path.isdir(ico_dir):
        for f in os.listdir(ico_dir):
            if f.endswith(".png"): os.remove(os.path.join(ico_dir, f))
        Image.open(os.path.join(RACINE, "icons", "icon-1024.png")).convert("RGB").save(os.path.join(ico_dir, "AppIcon-1024.png"))
        json.dump({"images": [{"filename": "AppIcon-1024.png", "idiom": "universal", "platform": "ios", "size": "1024x1024"}],
                   "info": {"author": "xcode", "version": 1}}, open(os.path.join(ico_dir, "Contents.json"), "w"), indent=2)
    # écran de démarrage : fond bleu nuit et logo au centre
    spl = os.path.join(app, "Assets.xcassets", "Splash.imageset")
    if os.path.isdir(spl):
        logo = Image.open(os.path.join(RACINE, "icons", "icon-512.png")).convert("RGB").resize((420, 420), Image.LANCZOS)
        fond = Image.new("RGB", (2732, 2732), BLEU); fond.paste(logo, ((2732 - 420) // 2, (2732 - 420) // 2))
        for f in os.listdir(spl):
            if f.endswith(".png"): fond.save(os.path.join(spl, f))
    print("iOS : réglages Le-QLN appliqués")

if __name__ == "__main__":
    {"preparer": preparer, "reglages": reglages}[sys.argv[1]]()
