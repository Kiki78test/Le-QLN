#!/usr/bin/env python3
"""Génère, depuis tools/legal_texte.py et marque.json :
  - legal.js                      écrans « Confidentialité » et « Mentions légales » dans l'appli (FR + EN dans le même fichier)
  - confidentialite.html, mentions-legales.html, en/privacy.html, en/legal-notice.html   pages web publiques (URL exigée par le Play Store)
  - docs/textes-juridiques.pdf    les deux textes + liste « à compléter avant publication » (si reportlab est installé)
Usage : python3 tools/build_legal.py   (appelé aussi par tools/changer_nom.py)"""
import json, html, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
import legal_texte as L

M = json.loads((ROOT / "marque.json").read_text(encoding="utf-8"))
D = {lang: L.contenu(lang, M) for lang in ("fr", "en")}
esc = html.escape

def blocs_html(blocs):
    out = []
    for b in blocs:
        if isinstance(b, list): out.append("<ul>" + "".join(f"<li>{esc(x)}</li>" for x in b) + "</ul>")
        else: out.append(f"<p>{esc(b)}</p>")
    return "".join(out)

# ------------------------------------------------------------------ legal.js (dans l'appli)
JS = r"""/* Le-QLN — pages « Confidentialité » et « Mentions légales » (fichier généré par tools/build_legal.py : ne pas modifier à la main).
   Dépend du socle de index.html : app, $, esc, ICO, ecranAccueil. */
const Legal = (() => {
const DATA = %s;
const LG = document.documentElement.lang === "en" ? "en" : "fr";
const css = document.createElement("style");
css.textContent = `.legal{display:grid; gap:12px; text-align:left; margin-bottom:24px}
.legal h2{margin:14px 0 2px; font:700 19px/1.2 var(--f-ui); color:#ffe27a}
.legal p,.legal li{margin:0; font:500 16px/1.5 var(--f-texte, var(--f-ui)); color:#dfe7fb}
.legal ul{margin:0; padding-left:20px; display:grid; gap:6px}
.legal .maj{font:600 13px var(--f-ui); color:var(--brume)}
.legal-liens{display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:10px}`;
document.head.appendChild(css);
const blocs = b => b.map(x => Array.isArray(x) ? "<ul>" + x.map(i => "<li>" + esc(i) + "</li>").join("") + "</ul>" : "<p>" + esc(x) + "</p>").join("");
function ecran(cle, retour){
  if(typeof arreterVitrine === "function") arreterVitrine();
  const d = DATA[LG], t = d[cle], autre = cle === "confidentialite" ? "mentions" : "confidentialite", L = d.libelles;
  retour = retour || ecranAccueil;
  app.innerHTML = `
  <section class="ecran">
    <div class="entete-ecran"><button class="icone-btn" id="b-retour" aria-label="${L.retour}">${ICO.retour}</button><h1>${esc(t.titre)}</h1><span></span></div>
    <div class="m-carte legal">
      <span class="maj">${esc(t.maj)}</span>
      ${t.intro ? "<p>" + esc(t.intro) + "</p>" : ""}
      ${t.sections.map(s => "<h2>" + esc(s[0]) + "</h2>" + blocs(s[1])).join("")}
    </div>
    <div class="legal-liens"><button class="bouton-plat" id="lg-autre">${esc(d[autre].titre)}</button></div>
  </section>`;
  $("#b-retour").onclick = retour;
  $("#lg-autre").onclick = () => ecran(autre, retour);
  window.scrollTo(0, 0);
}
/* lien direct ?legal=confidentialite | mentions */
function lienDirect(){
  const c = new URLSearchParams(location.search).get("legal");
  if(c === "confidentialite" || c === "mentions"){ history.replaceState(null, "", location.pathname); ecran(c); return true; }
  return false;
}
return {ecran, lienDirect, libelles: () => DATA[LG].libelles};
})();
""" % json.dumps({lang: {k: ({"titre": v["titre"], "maj": v["maj"], "intro": v["intro"], "sections": [[s[0], s[1]] for s in v["sections"]]} if k != "libelles" else v) for k, v in D[lang].items()} for lang in D}, ensure_ascii=False)
(ROOT / "legal.js").write_text(JS, encoding="utf-8")

# ------------------------------------------------------------------ pages web publiques
CSS = """body{margin:0; background:#071634; color:#dfe7fb; font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:760px; margin:0 auto; padding:28px 18px 60px}
h1{font-size:30px; color:#ffd60a; margin:.2em 0}
h2{font-size:19px; color:#ffe27a; margin:1.6em 0 .3em}
a{color:#8fc3ff} nav{display:flex; gap:16px; flex-wrap:wrap; font-size:15px; margin-bottom:10px}
.maj{color:#8fa0c8; font-size:14px} ul{padding-left:20px} li{margin:.35em 0}"""
def page(lang, cle, chemin_app, autre_fichier, lien_lang):
    t = D[lang][cle]; autre = "mentions" if cle == "confidentialite" else "confidentialite"
    L = D[lang]["libelles"]
    corps = (f"<p class='maj'>{esc(t['maj'])}</p>" + (f"<p>{esc(t['intro'])}</p>" if t["intro"] else "")
             + "".join(f"<h2>{esc(s[0])}</h2>{blocs_html(s[1])}" for s in t["sections"]))
    return f"""<!doctype html>
<html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(t['titre'])} — {esc(M['nom'])}</title><meta name="robots" content="index,follow"><style>{CSS}</style></head>
<body><main>
<nav><a href="{chemin_app}">← {esc(M['nom'])}</a><a href="{autre_fichier}">{esc(D[lang][autre]['titre'])}</a><a href="{lien_lang[0]}">{lien_lang[1]}</a></nav>
<h1>{esc(t['titre'])}</h1>
{corps}
</main></body></html>
"""
(ROOT / "confidentialite.html").write_text(page("fr", "confidentialite", "./", "mentions-legales.html", ("en/privacy.html", "English")), encoding="utf-8")
(ROOT / "mentions-legales.html").write_text(page("fr", "mentions", "./", "confidentialite.html", ("en/legal-notice.html", "English")), encoding="utf-8")
(ROOT / "en").mkdir(exist_ok=True)
(ROOT / "en" / "privacy.html").write_text(page("en", "confidentialite", "./", "legal-notice.html", ("../confidentialite.html", "Français")), encoding="utf-8")
(ROOT / "en" / "legal-notice.html").write_text(page("en", "mentions", "./", "privacy.html", ("../mentions-legales.html", "Français")), encoding="utf-8")

# ------------------------------------------------------------------ PDF (facultatif)
def pdf():
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.lib import colors
        from reportlab.lib.units import mm
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont
        from reportlab.pdfbase.pdfmetrics import registerFontFamily
    except ImportError:
        print("reportlab absent : PDF non régénéré"); return
    d = "/usr/share/fonts/truetype/dejavu/"
    if not (pathlib.Path(d) / "DejaVuSans.ttf").exists(): print("police DejaVu absente : PDF non régénéré"); return
    pdfmetrics.registerFont(TTFont("R", d + "DejaVuSans.ttf")); pdfmetrics.registerFont(TTFont("B", d + "DejaVuSans-Bold.ttf")); pdfmetrics.registerFont(TTFont("I", d + "DejaVuSans-Oblique.ttf"))
    registerFontFamily("R", normal="R", bold="B", italic="I", boldItalic="B")
    NAVY, GOLD, GREY = colors.HexColor("#0f1f4a"), colors.HexColor("#c9921a"), colors.HexColor("#555")
    T = ParagraphStyle("t", fontName="B", fontSize=22, leading=26, textColor=NAVY)
    H = ParagraphStyle("h", fontName="B", fontSize=13.5, leading=17, textColor=GOLD, spaceBefore=12, spaceAfter=5)
    P = ParagraphStyle("p", fontName="R", fontSize=9.3, leading=13.2, textColor=colors.HexColor("#222"), spaceAfter=3)
    S = ParagraphStyle("s", parent=P, fontSize=8.2, leading=11, textColor=GREY)
    nom = M["nom"]; fr = D["fr"]
    st = [Paragraph(f"{nom} — textes juridiques", T), Spacer(1, 2), Paragraph("Politique de confidentialité et mentions légales · version du 10 novembre 2026", S), Spacer(1, 8)]
    st.append(Paragraph("À faire avant la publication", H))
    for x in ["Renseigner dans <b>marque.json</b> : <b>editeur</b> (nom et prénom, ou raison sociale), <b>adresse</b> (postale) et <b>contact_email</b> (adresse dédiée, par exemple contact@votre-domaine). Puis lancer l'action GitHub « Changer le nom » ou <i>python3 tools/build_legal.py</i> : l'appli, les pages web et ce PDF se mettent à jour. Tant que ces champs sont vides, les textes affichent « [à compléter] ».",
              "<b>Adresse non publiée</b> : un éditeur non professionnel peut rester anonyme du public en donnant son identité à l'hébergeur (loi LCEN du 21 juin 2004, art. 6-III-2). Si vous choisissez cette voie, remplacez l'adresse par la mention correspondante et vérifiez avec l'hébergeur. Dès que le jeu rapporte de l'argent (publicité), l'activité devient en principe professionnelle : la déclaration d'activité et les coordonnées de l'éditeur deviennent alors nécessaires.",
              "<b>Adresses des hébergeurs</b> (Render, GitHub) : vérifiées au moment de la rédaction ; à recontrôler sur leurs sites avant publication.",
              "<b>Publicité réelle</b> : quand elle est activée (AdSense/AdMob), mettre à jour le paragraphe « Publicité », activer le bandeau de consentement, et remplir le formulaire « Sécurité des données » du Play Store de façon cohérente avec ce texte.",
              "<b>Adresse publique pour le Play Store</b> : après publication du site, la politique est accessible à confidentialite.html (et en/privacy.html en anglais), à la racine du site du jeu.",
              "<b>Relecture</b> : ces textes sont une base sérieuse mais n'ont pas été relus par un juriste ; une relecture professionnelle est recommandée avant de percevoir des revenus."]:
        st.append(Paragraph("• " + x, P))
    for cle in ("confidentialite", "mentions"):
        t = fr[cle]; st.append(PageBreak()); st.append(Paragraph(t["titre"], T)); st.append(Paragraph(t["maj"], S)); st.append(Spacer(1, 6))
        if t["intro"]: st.append(Paragraph(esc(t["intro"]), P))
        for i, (titre, bl) in enumerate(t["sections"], 1):
            st.append(Paragraph(f"{i}. {esc(titre)}", H))
            for b in bl:
                if isinstance(b, list): st += [Paragraph("• " + esc(x), P) for x in b]
                else: st.append(Paragraph(esc(b), P))
    out = ROOT / "docs" / "textes-juridiques.pdf"
    SimpleDocTemplate(str(out), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=15*mm, bottomMargin=15*mm, title=f"{nom} — textes juridiques", author="Claude").build(st)
    idx = ROOT / "docs" / "index.json"; docs = json.loads(idx.read_text(encoding="utf-8"))
    entree = {"titre": "Textes juridiques", "fichier": "textes-juridiques.pdf", "date": L.MAJ,
              "description": "Politique de confidentialité et mentions légales (texte complet) + liste de ce qu'il faut compléter avant la publication (éditeur, adresse, contact, publicité)."}
    docs = [x for x in docs if x["fichier"] != entree["fichier"]]; docs.insert(0, entree)
    idx.write_text(json.dumps(docs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
pdf()
print("legal.js, pages web et PDF générés.")
