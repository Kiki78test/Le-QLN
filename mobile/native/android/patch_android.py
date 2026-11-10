# Applique les réglages Le-QLN au projet Android généré par « npx cap add android » (appelé par la fabrication GitHub)
import os, re, shutil, sys
here = os.path.dirname(os.path.abspath(__file__))
app = os.path.join(sys.argv[1] if len(sys.argv) > 1 else 'android', 'app')
java = os.path.join(app, 'src', 'main', 'java', 'fr', 'leqln', 'app')
os.makedirs(java, exist_ok=True)
shutil.copy(os.path.join(here, 'MainActivity.java'), os.path.join(java, 'MainActivity.java'))
# icônes et écran de démarrage Le-QLN (remplacent ceux de Capacitor)
res = os.path.join(here, 'res')
for root, dirs, files in os.walk(res):
    for f in files:
        rel = os.path.relpath(os.path.join(root, f), res); dst = os.path.join(app, 'src', 'main', 'res', rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True); shutil.copy(os.path.join(root, f), dst)
man = os.path.join(app, 'src', 'main', 'AndroidManifest.xml'); s = open(man).read()
perms = ['INTERNET', 'VIBRATE', 'WAKE_LOCK', 'ACCESS_NETWORK_STATE']
add = ''.join('    <uses-permission android:name="android.permission.%s" />\n' % p for p in perms if 'android.permission.%s"' % p not in s)
s = s.replace('</manifest>', add + '</manifest>')
# le jeu se joue en portrait (comme la PWA)
s = re.sub(r'(<activity\b)(?![^>]*screenOrientation)', r'\1 android:screenOrientation="portrait"', s, count=1)
open(man, 'w').write(s)
# Android 12+ : écran de démarrage bleu nuit
sty = os.path.join(app, 'src', 'main', 'res', 'values', 'styles.xml')
if os.path.exists(sty):
    st = open(sty).read()
    def fix(m):
        body = m.group(2)
        for k, v in [('windowSplashScreenBackground', '#0B1A3A'), ('android:windowBackground', '#0B1A3A'), ('android:background', '#0B1A3A')]:
            body = re.sub(r'\s*<item name="%s">[^<]*</item>' % re.escape(k), '', body)
            body += '\n        <item name="%s">%s</item>' % (k, v)
        return m.group(1) + body + '\n    ' + m.group(3)
    st = re.sub(r'(<style name="AppTheme\.NoActionBarLaunch"[^>]*>)([\s\S]*?)\s*(</style>)', fix, st, count=1)
    open(sty, 'w').write(st)
# clé de test fixe : chaque nouvelle version s'installe par-dessus la précédente (jamais pour Google Play)
gr = os.path.join(app, 'build.gradle'); g = open(gr).read()
ks = os.path.join(here, 'qln-test.jks').replace('\\', '/')
if 'qln-test.jks' not in g:
    g = re.sub(r'android\s*\{', "android {\n    signingConfigs {\n        debug {\n            storeFile file('%s')\n            storePassword 'qln-test'\n            keyAlias 'qln'\n            keyPassword 'qln-test'\n        }\n    }" % ks, g, count=1)
# version publiée (Google Play) : clé d'envoi lue dans l'environnement (jamais écrite dans le dépôt en clair)
jks, mdp = os.environ.get('QLN_UPLOAD_JKS'), os.environ.get('QLN_UPLOAD_PASS')
if jks and mdp and 'signingConfigs.publication' not in g:
    g = g.replace("    signingConfigs {", "    signingConfigs {\n        publication {\n            storeFile file('%s')\n            storePassword System.getenv('QLN_UPLOAD_PASS')\n            keyAlias 'upload'\n            keyPassword System.getenv('QLN_UPLOAD_PASS')\n        }" % jks.replace('\\', '/'), 1)
    g = re.sub(r'(buildTypes\s*\{\s*release\s*\{)', r"\1\n            signingConfig signingConfigs.publication", g, count=1)
# numéro de version = numéro de la fabrication GitHub (chaque APK est plus récent que le précédent)
n = os.environ.get('GITHUB_RUN_NUMBER')
if n: g = re.sub(r'versionCode\s+\d+', 'versionCode %s' % n, g); g = re.sub(r'versionName\s+"[^"]*"', 'versionName "%s"' % (os.environ.get('QLN_VERSION_NAME') or '0.1.%s' % n), g)
open(gr, 'w').write(g)
print('Android : réglages Le-QLN appliqués')
