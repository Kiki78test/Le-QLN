# Passerelle : les documents écrits à l'origine pour ReportLab (Paragraph, tbl, Spacer…) sont rendus avec la charte commune
# (docs-src/charte.py : en-tête, polices, pied de page). Usage en tête d'un script : exec(open(chemin de stylepdf.py).read())
import os as _os, re as _re, sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)) if "__file__" in globals() else _os.path.join(_os.getcwd(), "docs-src"))
import charte as _charte
mm = 1.0; A4 = None; W = 174.0
class _Couleurs:
    def HexColor(self, h): return h
    def __getattr__(self, n): return n
colors = _Couleurs()
class ParagraphStyle:
    def __init__(self, name="p", parent=None, **kw):
        self.name = name; self.kw = dict(getattr(parent, "kw", {})); self.kw.update(kw)
T = ParagraphStyle("t", fontSize=22); H = ParagraphStyle("h", fontSize=13.5); H2 = ParagraphStyle("h2", fontSize=10.5, fontName="B")
P = ParagraphStyle("p", fontSize=9.3); S = ParagraphStyle("s", fontSize=8.2); C = ParagraphStyle("c", fontSize=8.4); CB = ParagraphStyle("cb", fontSize=8.4, fontName="B")
class Paragraph:
    def __init__(self, text, style=None): self.text = str(text); self.style = style or P
    def html(self):
        t = self.text.replace("<br/>", "<br>"); s = self.style; taille = s.kw.get("fontSize", 9.3); gras = s.kw.get("fontName") == "B"
        if taille >= 18: return ("titre", t)
        if taille >= 12: return ("html", f"<h2>{t}</h2>")
        if gras and taille >= 10: return ("html", f"<h3>{t}</h3>")
        if t.startswith("• "): return ("puce", t[2:])
        if _re.match(r"<b>\d+\.</b> ", t): return ("html", f'<p class="num">{t}</p>')
        if taille < 9: return ("petit", t)
        return ("html", f"<p>{t}</p>")
class Spacer:
    def __init__(self, *a): pass
class PageBreak: pass
class KeepTogether:
    def __init__(self, contenu): self.contenu = contenu if isinstance(contenu, (list, tuple)) else [contenu]
class TableStyle:
    def __init__(self, *a, **k): pass
class Table:
    def __init__(self, data, colWidths=None, repeatRows=0, **k): self.data = data; self.w = colWidths; self.head = bool(repeatRows)
    def setStyle(self, *a): pass
    def html(self):
        cel = lambda c: c.text.replace("<br/>", "<br>") if isinstance(c, Paragraph) else ("" if c is None else str(c))
        tot = sum(self.w) if self.w else 0
        cols = "".join(f'<col style="width:{w/tot*100:.1f}%">' for w in self.w) if tot else ""
        lignes = [[cel(c) for c in r] for r in self.data]
        out = f"<table><colgroup>{cols}</colgroup>"
        for i, r in enumerate(lignes):
            b = "th" if (self.head and i == 0) else "td"
            out += "<tr>" + "".join(f"<{b}>{c}</{b}>" for c in r) + "</tr>"
        return out + "</table>"
def tbl(rows, widths, head=True, zebra=True):
    t = Table(rows, colWidths=widths, repeatRows=1 if head else 0); return t
def _rendre(elements):
    out, puces, titre, sous = [], [], None, None
    def vider():
        if puces: out.append("<ul>" + "".join(f"<li>{x}</li>" for x in puces) + "</ul>"); puces.clear()
    for e in elements:
        if isinstance(e, Paragraph):
            k, v = e.html()
            if k == "puce": puces.append(v); continue
            vider()
            if k == "titre":
                if titre is None: titre = v
                else: out.append(f'<h2 class="pb" style="font-size:19pt">{v}</h2>')
            elif k == "petit":
                if titre is not None and sous is None and not out: sous = v
                else: out.append(f'<p class="petit">{v}</p>')
            else: out.append(v)
        elif isinstance(e, Table): vider(); out.append(e.html())
        elif isinstance(e, KeepTogether): vider(); t2, _, h2 = _rendre(e.contenu); out.append(f'<div class="keep">{h2}</div>')
        elif isinstance(e, PageBreak): vider(); out.append('<div class="pb"></div>')
        elif isinstance(e, (list, tuple)): vider(); out.append(_rendre(e)[2])
    vider()
    return titre, sous, "".join(out)
DATE = None      # None : garder la date déjà inscrite dans docs/index.json ; "auto" : date du jour (document vivant)
class SimpleDocTemplate:
    def __init__(self, chemin, title="", **k): self.chemin = chemin; self.title = title
    def build(self, st):
        import json as _json
        titre, sous, corps = _rendre(st)
        titre = _re.sub(r"^Le-QLN\s*[—–-]\s*", "", titre or self.title); titre = titre[:1].upper() + titre[1:]
        fichier = _os.path.basename(self.chemin)
        import dossiers as _dossiers
        e = _dossiers.entree_de(_dossiers.lire_index(), fichier) or {}
        date = None if globals().get("DATE") == "auto" else e.get("date")
        if sous and date is None: sous = _re.sub(r"\s*·\s*\d{1,2}(er)? [a-zéû]+ \d{4}\s*$", "", sous)   # la date figure déjà en pied de page
        _charte.document(fichier, titre, sous, corps, description=e.get("description") or titre, titre_index=e.get("titre"), date_iso=date)
