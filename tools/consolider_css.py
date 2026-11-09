"""Consolide la feuille de style d'index.html (couches DESIGN V1…V8) sans changer le rendu.

Opérations, toutes sûres vis-à-vis de la cascade :
  1. Déclaration morte : une propriété définie dans une règle est supprimée si une règle
     PLUS LOIN, au MÊME sélecteur et dans le MÊME contexte (@media…), redéfinit la même
     propriété avec une importance au moins égale. (Même spécificité, plus tard → gagne toujours.)
     On ne touche pas aux propriétés dont la valeur sert de repli (dvh/svh/env/-webkit-…).
  2. Fusion : deux règles au même sélecteur et même contexte sont fusionnées dans la PLUS TARDIVE
     seulement si aucune règle intermédiaire ne déclare une des propriétés déplacées
     (sinon l'ordre relatif changerait).
  3. Règles vides supprimées, commentaires de « couches » retirés, mise en forme homogène.
Usage : python3 consolider_css.py index.html   (réécrit le bloc <style> en place)
"""
import re, sys
import tinycss2

def decls_of(content):
    out = []
    for d in tinycss2.parse_declaration_list(content, skip_comments=True, skip_whitespace=True):
        if d.type != "declaration":
            continue
        val = tinycss2.serialize(d.value).strip()
        out.append([d.lower_name, val, d.important])
    return out

REPLI = re.compile(r"dvh|svh|lvh|env\(|-webkit-|-moz-|color-mix|:has|clamp\(|min\(|max\(")

def parse(css, ctx=""):
    """Aplatit la feuille : liste d'éléments {kind:'rule'|'raw', ctx, sel, decls, text}."""
    items = []
    for r in tinycss2.parse_stylesheet(css, skip_comments=True, skip_whitespace=True):
        if r.type == "qualified-rule":
            sel = " ".join(tinycss2.serialize(r.prelude).split())
            items.append({"kind": "rule", "ctx": ctx, "sel": sel, "decls": decls_of(r.content)})
        elif r.type == "at-rule" and r.lower_at_keyword in ("media", "supports") and r.content is not None:
            cond = "@" + r.lower_at_keyword + " " + " ".join(tinycss2.serialize(r.prelude).split())
            inner = parse(tinycss2.serialize(r.content), ctx + "\x00" + cond if ctx else cond)
            items.extend(inner)
        elif r.type == "at-rule":
            items.append({"kind": "raw", "ctx": ctx, "text": tinycss2.serialize([r]).strip()})
    return items

POS = {"inset","top","right","bottom","left"}
def famille(p):
    if p.startswith("--"): return p
    if p in POS or p.startswith("inset"): return "inset"
    return p.lstrip("-").split("-")[0] if not p.startswith("-") else p.split("-")[2] if p.count("-") >= 2 else p
def en_conflit(props, autres):
    f = {famille(p) for p in props}
    return any(o == "all" or famille(o) in f for o in autres)

def consolider(items):
    rules = [it for it in items if it["kind"] == "rule"]
    # 1. déclarations mortes
    morts = 0
    for i, a in enumerate(rules):
        for d in a["decls"]:
            if d is None: continue
            for b in rules[i+1:]:
                if b["ctx"] != a["ctx"] or b["sel"] != a["sel"]: continue
                if any(e and e[0] == d[0] and (e[2] or not d[2]) for e in b["decls"]):
                    if REPLI.search(d[1]) or d[0].startswith("-"): break
                    d_idx = a["decls"].index(d); a["decls"][d_idx] = None; morts += 1
                    break
        a["decls"] = [d for d in a["decls"] if d]
    # 2. fusions : vers la règle la plus tardive si les propriétés de la 1re ne croisent aucune règle
    #    intermédiaire, sinon vers la plus ancienne si ce sont les propriétés de la 2de qui ne croisent rien.
    fusions = 0
    def bloque(entre, props):
        return (any(it["kind"] == "rule" and it["decls"] and en_conflit(props, [d[0] for d in it["decls"]]) for it in entre)
                or any(it["kind"] == "raw" and not it["text"].lstrip().startswith(("@keyframes", "@-webkit-keyframes")) for it in entre))
    change = True
    while change:
        change = False
        idx = {id(it): k for k, it in enumerate(items)}
        for i, a in enumerate(rules):
            if not a["decls"]: continue
            for j in range(i+1, len(rules)):
                b = rules[j]
                if not b["decls"] or b["ctx"] != a["ctx"] or b["sel"] != a["sel"]: continue
                entre = items[idx[id(a)]+1: idx[id(b)]]
                bprops = {d[0] for d in b["decls"]}
                if not bloque(entre, {d[0] for d in a["decls"]}):
                    b["decls"] = [d for d in a["decls"] if d[0] not in bprops] + b["decls"]; a["decls"] = []
                elif not bloque(entre, bprops):
                    a["decls"] = [d for d in a["decls"] if d[0] not in bprops] + b["decls"]; b["decls"] = []
                else:
                    break
                fusions += 1; change = True
                break
    # 3. @keyframes redéfinies : seule la dernière définition d'un nom s'applique
    noms = {}
    for k, it in enumerate(items):
        if it["kind"] == "raw" and it["text"].startswith("@keyframes"):
            noms.setdefault((it["ctx"], it["text"].split("{")[0].split()[1]), []).append(k)
    doublons = {k for ks in noms.values() for k in ks[:-1]}
    items = [it for k, it in enumerate(items) if k not in doublons]
    vides = sum(1 for it in items if it["kind"] == "rule" and not it["decls"])
    items = [it for it in items if not (it["kind"] == "rule" and not it["decls"])]
    return items, morts, fusions, vides + len(doublons)

def emettre(items):
    out, ctx_ouvert = [], []
    def fermer_jusqua(n):
        while len(ctx_ouvert) > n:
            ctx_ouvert.pop(); out.append("  " * len(ctx_ouvert) + "}")
    for it in items:
        ctx = it["ctx"].split("\x00") if it["ctx"] else []
        k = 0
        while k < len(ctx) and k < len(ctx_ouvert) and ctx[k] == ctx_ouvert[k]: k += 1
        fermer_jusqua(k)
        for c in ctx[k:]:
            out.append("  " * len(ctx_ouvert) + c + "{"); ctx_ouvert.append(c)
        ind = "  " * len(ctx_ouvert)
        if it["kind"] == "raw":
            out.append(ind + it["text"])
        else:
            corps = "; ".join(f"{p}:{v}{' !important' if imp else ''}" for p, v, imp in it["decls"])
            out.append(f"{ind}{it['sel']}{{{corps}}}")
    fermer_jusqua(0)
    return "\n".join(out)

if __name__ == "__main__":
    f = sys.argv[1]
    html = open(f, encoding="utf-8").read()
    a = html.index("<style>") + len("<style>"); b = html.index("</style>", a)
    css = html[a:b]
    items = parse(css)
    n0 = sum(len(it["decls"]) for it in items if it["kind"] == "rule"); r0 = sum(1 for it in items if it["kind"] == "rule")
    items, morts, fusions, vides = consolider(items)
    n1 = sum(len(it["decls"]) for it in items if it["kind"] == "rule"); r1 = sum(1 for it in items if it["kind"] == "rule")
    nouveau = "\n/* Le-QLN — feuille de style consolidée (anciennes couches V1→V8 fusionnées ; rendu identique) */\n" + emettre(items) + "\n"
    open(f, "w", encoding="utf-8").write(html[:a] + nouveau + html[b:])
    print(f"règles {r0} → {r1} ; déclarations {n0} → {n1} ; mortes supprimées {morts} ; fusions {fusions} ; "
          f"taille CSS {len(css)} → {len(nouveau)} octets")
