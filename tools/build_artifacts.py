import re, sys, shutil, pathlib
ROOT=pathlib.Path("/home/claude/qln"); APP=ROOT/"app"
fr_url, en_url = sys.argv[1], sys.argv[2]
def strip(h):
    for t in ['<!doctype html>','<!DOCTYPE html>']: h=h.replace(t,'')
    h=re.sub(r'<html[^>]*>','',h).replace('<head>','').replace('</head>','').replace('<body>','').replace('</body>','').replace('</html>','')
    h=re.sub(r'<meta charset[^>]*>\s*','',h); h=re.sub(r'<meta name="viewport"[^>]*>\s*','',h)
    return h
inj = '<script>window.QLN_URLS={fr:"%s",en:"%s"};</script>\n<script src="pub.js"></script>' % (fr_url, en_url)
fr = strip((APP/"index.html").read_text(encoding="utf-8")).replace('<script src="pub.js"></script>', inj)
(ROOT/"le-qln.html").write_text(fr, encoding="utf-8")
en = strip((APP/"en"/"index.html").read_text(encoding="utf-8")).replace('<script src="pub.js"></script>', inj)
en = en.replace('<script src="../config.js">','<script src="config.js">').replace('<script src="../analyse.js">','<script src="analyse.js">')
en = en.replace("<title>Le-QLN</title>","<title>Le-QLN English</title>").replace("../pubs/","pubs/").replace("../docs/","docs/").replace("../icons/","icons/").replace("url(../fonts/","url(fonts/")
(ROOT/"le-qln-en.html").write_text(en, encoding="utf-8")
d=ROOT/"art-en"; shutil.rmtree(d, ignore_errors=True); d.mkdir()
shutil.copy(APP/"config.js", d/"config.js"); shutil.copy(APP/"analyse.js", d/"analyse.js")
for f in ["plateau.js","pub.js","infos.js","multi.js","progres.js","compte.js"]:
    t=(APP/"en"/f).read_text(encoding="utf-8").replace("../pubs/","pubs/")
    (d/f).write_text(t, encoding="utf-8")
print("ok")
