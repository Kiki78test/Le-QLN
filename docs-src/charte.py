# Charte commune de la documentation : même en-tête (logo du jeu, titre, sous-titre), mêmes polices et couleurs,
# même pied de page (nom du jeu · titre · date · page) pour tous les PDF de docs/.
# Le nom du jeu vient de marque.json : régénérer les documents après un changement de nom (python3 docs-src/tout.py).
# Usage dans un script de document :
#     from charte import document, T, L, B, NOM
#     document("fichier.pdf", "Titre", "Sous-titre", corps_html, description="…pour l'onglet Documentation")
import base64, datetime, html as _html, json, pathlib, re, zoneinfo
import sys as _sys; _sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import dossiers
ICI = pathlib.Path(__file__).resolve().parent
RACINE = ICI.parent
MARQUE = json.loads((RACINE / "marque.json").read_text(encoding="utf-8"))
NOM = MARQUE["nom"]
MAINTENANT = datetime.datetime.now(zoneinfo.ZoneInfo("Europe/Paris"))
MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
DATE_LONGUE = f"{MAINTENANT.day} {MOIS[MAINTENANT.month-1]} {MAINTENANT.year}"
DATE_ISO = MAINTENANT.strftime("%Y-%m-%d")

def _police(f): return base64.b64encode((RACINE / "app" / "fonts" / f).read_bytes()).decode()
_FT, _FT8, _FB, _FB6, _FB7 = (_police(f) for f in ["barlow-condensed-latin-700-normal.woff2", "barlow-condensed-latin-800-italic.woff2",
                                                    "barlow-latin-400-normal.woff2", "barlow-latin-600-normal.woff2", "barlow-latin-700-normal.woff2"])
CSS = f"""
@font-face{{font-family:Titre;src:url(data:font/woff2;base64,{_FT})}}
@font-face{{font-family:Logo;src:url(data:font/woff2;base64,{_FT8})}}
@font-face{{font-family:Texte;src:url(data:font/woff2;base64,{_FB})}}
@font-face{{font-family:Texte;font-weight:600;src:url(data:font/woff2;base64,{_FB6})}}
@font-face{{font-family:Texte;font-weight:700;src:url(data:font/woff2;base64,{_FB7})}}
@page{{size:A4}}
*{{box-sizing:border-box}}
body{{font:9.5pt/1.48 Texte,sans-serif;color:#1c2333;margin:0}}
/* ----- en-tête signature ----- */
.entete{{position:relative;overflow:hidden;border-radius:14px;padding:16px 22px 17px;color:#fff;
  background:linear-gradient(118deg,transparent 30%,rgba(110,165,255,.30) 44%,rgba(190,215,255,.10) 49%,transparent 60%),
             radial-gradient(70% 120% at 100% 0%,rgba(255,196,70,.22),transparent 60%),
             linear-gradient(135deg,#081739,#122f73 55%,#0b1d49);
  box-shadow:inset 0 0 0 1.5px rgba(255,214,90,.75), inset 0 0 0 4px rgba(255,255,255,.05)}}
.entete .haut{{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}}
.logo{{display:inline-block;position:relative;padding:3px 20px 4px;border-radius:50%;background:radial-gradient(closest-side,#0a0f1e 78%,#05070f);
  font:800 italic 17pt/1 Logo,Titre,sans-serif;letter-spacing:.02em;color:#fff;text-transform:uppercase;transform:rotate(-4deg);
  box-shadow:0 0 0 1.6px #f2c230, 0 0 12px rgba(255,200,70,.55)}}
.rubrique{{font:700 8.2pt Texte;letter-spacing:.22em;text-transform:uppercase;color:#ffd866}}
.entete h1{{margin:0;font:700 24pt/1.05 Titre,sans-serif;letter-spacing:.01em;
  background:linear-gradient(180deg,#fff6cf,#ffd24a 55%,#e0a11a);-webkit-background-clip:text;background-clip:text;color:transparent}}
.entete .sous{{margin:5px 0 0;font:600 10pt/1.35 Texte;color:#cfdbf7}}
/* ----- contenu ----- */
h2{{font:700 15pt/1.15 Titre,sans-serif;color:#0f2a6b;margin:17px 0 6px;padding-bottom:3px;break-after:avoid;
  border-bottom:2.5px solid;border-image:linear-gradient(90deg,#f2c230,#f2c230 70px,#e3e8f4 70px) 1}}
h3{{font:700 11.5pt/1.2 Titre,sans-serif;color:#0f2a6b;margin:10px 0 3px;break-after:avoid}}
p{{margin:4px 0}} .petit{{font-size:8.5pt;color:#5b6478}} .intro{{font-size:10pt;color:#2b3550}}
ul,ol{{margin:3px 0;padding-left:17px}} li{{margin:2px 0}} ul{{list-style:none;padding-left:14px}} ul>li{{position:relative}}
ul>li::before{{content:"";position:absolute;left:-12px;top:.52em;width:6px;height:6px;border-radius:2px;background:#f2c230;transform:rotate(45deg)}}
code{{font:8.4pt ui-monospace,Consolas,monospace;background:#eef1f8;border-radius:4px;padding:0 3px}}
table{{border-collapse:collapse;width:100%;font-size:8.7pt;margin:5px 0 7px}} tr{{break-inside:avoid}}
td,th{{padding:4px 7px;border-bottom:1px solid #e3e7f1;vertical-align:top;text-align:left}}
th{{background:#0f2a6b;color:#fff;font:700 9.4pt Titre,sans-serif;letter-spacing:.03em;border-bottom:2px solid #f2c230}}
tr:nth-child(odd) td{{background:#f8f9fd}}
.box{{border:1px solid #d6dcea;border-radius:10px;padding:8px 12px;margin:7px 0;break-inside:avoid;background:#fbfcff}}
.box h3{{margin-top:0}} .hl{{border-color:#f2c230;background:#fffaea}} .warn{{border-color:#e0563f;background:#fdeeea}}
.keep{{break-inside:avoid}} .pb{{break-before:page}} .ok{{color:#1d7a3a;font-weight:700}} .att{{color:#b36b00;font-weight:700}} .non{{color:#8a8f9c}}
.num{{padding-left:17px;text-indent:-17px}}
a{{color:#1d4bb3}}
"""

def nom_du_jeu(texte):
    """Remplace l'ancien nom écrit en dur par le nom courant (sans toucher aux adresses, dépôts et identifiants techniques)."""
    return re.sub(r"(?<![/\w.-])Le-QLN(?![\w/-]|\.onrender)", NOM, texte) if NOM != "Le-QLN" else texte

def L(items): return "<ul>" + "".join(f"<li>{i}</li>" for i in items) + "</ul>"
def T(rows, head=None, largeurs=None):
    cols = "".join(f'<col style="width:{w}%">' for w in largeurs) if largeurs else ""
    h = ("<tr>" + "".join(f"<th>{x}</th>" for x in head) + "</tr>") if head else ""
    return f"<table>{('<colgroup>' + cols + '</colgroup>') if cols else ''}{h}" + "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows) + "</table>"
def B(titre, texte="", items=None, alerte=None, classe=""):
    return (f'<div class="box {classe}">' + (f"<h3>{titre}</h3>" if titre else "") + (f"<p>{texte}</p>" if texte else "") + (L(items) if items else "")
            + (f'<p class="petit" style="color:#b23a24">⚠ {alerte}</p>' if alerte else "") + "</div>")

def page_html(titre, sous_titre, corps, rubrique="Documentation"):
    return (f'<!doctype html><meta charset="utf-8"><title>{_html.escape(titre)}</title><style>{CSS}</style>'
            f'<div class="entete"><div class="haut"><span class="logo">{_html.escape(NOM)}</span><span class="rubrique">{rubrique}</span></div>'
            f'<h1>{titre}</h1>' + (f'<p class="sous">{sous_titre}</p>' if sous_titre else "") + f'</div>{corps}')

def document(fichier, titre, sous_titre, corps, description=None, titre_index=None, rubrique="Documentation", date_iso=None, indexer=True, page_seule=None):
    """Écrit docs/<fichier> avec l'en-tête et le pied de page communs, et met à jour docs/index.json."""
    titre, sous_titre, corps = nom_du_jeu(titre), nom_du_jeu(sous_titre or ""), nom_du_jeu(corps)
    src = ICI / "_rendu" / (pathlib.Path(fichier).stem + ".html"); src.parent.mkdir(exist_ok=True)
    src.write_text(page_html(titre, sous_titre, corps, rubrique), encoding="utf-8")
    pied = (f'<div style="width:100%;margin:0 13mm;padding-top:3px;border-top:1.2px solid #f2c230;font:7.5pt Arial,sans-serif;color:#5b6478;display:flex;justify-content:space-between">'
            f'<span><b style="color:#0f2a6b">{_html.escape(NOM)}</b> · {_html.escape(re.sub("<[^>]+>", "", titre))}</span><span>{DATE_LONGUE}</span>'
            f'<span>page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>')
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.goto(src.as_uri()); pg.wait_for_timeout(350)
        pg.pdf(path=str(dossiers.chemin(fichier)), format="A4", print_background=True, display_header_footer=True,
               header_template="<span></span>", footer_template=pied, margin={"top": "13mm", "bottom": "16mm", "left": "13mm", "right": "13mm"})
        b.close()
    if indexer and description:
        dossiers.indexer(fichier, nom_du_jeu(titre_index or titre), nom_du_jeu(description), date_iso or DATE_ISO)
    print("docs/" + dossiers.relatif(fichier))

def habiller_existant(source_html, fichier_pdf, titre, sous_titre):
    """Documents mis en page à la main (HTML avec leur propre style) : on remplace leur couverture par l'en-tête commun
    et on ajoute le pied de page commun, sans toucher au reste."""
    s = (ICI / source_html).read_text(encoding="utf-8")
    entete_css = CSS[:CSS.index("/* ----- contenu ----- */")].replace("body{", "body.x-inutile{").replace(".logo{", ".ch-logo{")
    # les polices d'origine (dossier node_modules absent) : mêmes familles, fournies par les polices du jeu
    entete_css += (f'@font-face{{font-family:"Barlow";src:url(data:font/woff2;base64,{_FB})}}@font-face{{font-family:"Barlow";font-weight:600;src:url(data:font/woff2;base64,{_FB6})}}'
                   f'@font-face{{font-family:"Barlow";font-weight:700;src:url(data:font/woff2;base64,{_FB7})}}'
                   f'@font-face{{font-family:"Barlow Condensed";src:url(data:font/woff2;base64,{_FT})}}@font-face{{font-family:"Bebas Neue";src:url(data:font/woff2;base64,{_FT})}}')
    tete = (f'<div class="entete" style="margin-bottom:14px"><div class="haut"><span class="ch-logo">{_html.escape(NOM)}</span><span class="rubrique">Documentation</span></div>'
            f'<h1 style="border:0;padding:0">{nom_du_jeu(titre)}</h1><p class="sous">{nom_du_jeu(sous_titre)}</p></div>')
    a = s.index('<div class="couv">'); b = s.index('<p class="chapo">')
    s = s[:a] + tete + s[b:]
    s = s.replace("</head>", f"<style>{entete_css} @page{{size:A4;margin:0}} .entete h1{{color:transparent}} .ch-logo{{border-radius:50%!important;display:inline-block!important;font-family:Logo,Titre,sans-serif!important}}</style></head>", 1) if "</head>" in s else f"<style>{entete_css}</style>" + s
    s = nom_du_jeu(s)
    src = ICI / "_rendu" / (pathlib.Path(fichier_pdf).stem + ".html"); src.parent.mkdir(exist_ok=True); src.write_text(s, encoding="utf-8")
    pied = (f'<div style="width:100%;margin:0 13mm;padding-top:3px;border-top:1.2px solid #f2c230;font:7.5pt Arial,sans-serif;color:#5b6478;display:flex;justify-content:space-between">'
            f'<span><b style="color:#0f2a6b">{_html.escape(NOM)}</b> · {_html.escape(titre)}</span><span>8 novembre 2026</span>'
            f'<span>page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>')
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.goto(src.as_uri()); pg.wait_for_timeout(400)
        pg.pdf(path=str(dossiers.chemin(fichier_pdf)), format="A4", print_background=True, display_header_footer=True,
               header_template="<span></span>", footer_template=pied, margin={"top": "13mm", "bottom": "16mm", "left": "13mm", "right": "13mm"})
        b.close()
    print("docs/" + dossiers.relatif(fichier_pdf))
