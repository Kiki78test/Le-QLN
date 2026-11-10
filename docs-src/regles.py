# Règles du jeu illustrées (PDF, charte commune). Les textes reprennent l'écran « Règles du jeu » de l'appli (index.html, ecranRegles) :
# en cas de changement de règle, mettre à jour les deux. Régénérer : python3 docs-src/regles.py
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from charte import document, NOM

CSS = """<style>
.r{break-inside:avoid;border-radius:14px;padding:4px 16px 12px;margin:10px 0;color:#e6edff;
  background:linear-gradient(180deg,#14306f,#0a1a44);box-shadow:inset 0 0 0 1.5px rgba(255,214,90,.7)}
.r h2{border:0;margin:10px 0 6px;padding:0;font-size:17pt;color:#ffd24a;display:flex;align-items:center;gap:10px}
.r p,.r li{color:#dbe5ff} .r b{color:#ffe27a} .r ul{padding-left:16px}
.med{flex:none;width:30px;height:30px;border-radius:50%;display:inline-grid;place-items:center;font:700 14pt Titre;color:#fff;box-shadow:inset 0 2px 0 rgba(255,255,255,.45),0 0 0 2px rgba(255,255,255,.15)}
.v{background:linear-gradient(160deg,#8fd24a,#2f8a2e)}.b{background:linear-gradient(160deg,#6db2ff,#1f5fc4)}.ro{background:linear-gradient(160deg,#ff6a66,#b3161f)}
.n{background:linear-gradient(160deg,#5a5d68,#15161b)}.o{background:linear-gradient(160deg,#ffc24a,#d9741a)}.vi{background:linear-gradient(160deg,#a67be6,#5a2fa8)}.em{background:linear-gradient(160deg,#3fd99b,#0f9f6e)}
.illu{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;margin:4px 0 8px;padding:12px;border-radius:12px;background:rgba(3,10,30,.4)}
.mot{display:inline-flex;gap:4px}.mot i{width:30px;height:33px;border-radius:7px;display:grid;place-items:center;font:700 19pt/1 Titre;font-style:normal;color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 3px 0 rgba(0,0,0,.35)}
.fl{font:700 20pt Titre;color:#ffd24a}
.coul{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:6px 0}
.coul div{border-radius:12px;padding:8px 10px 9px;color:#fff;font-weight:600;line-height:1.3;box-shadow:inset 0 2px 0 rgba(255,255,255,.35),inset 0 -4px 6px rgba(0,0,0,.25)}
.coul b{display:block;color:#fff;font:700 15pt/1.1 Titre;letter-spacing:.03em;text-transform:uppercase}
.piste{display:flex;gap:3px}.piste i{width:24px;height:24px;border-radius:4px;display:grid;place-items:center;font:700 11pt Texte;font-style:normal;color:#fff;box-shadow:inset 0 2px 0 rgba(255,255,255,.4)}
.de{width:46px;height:46px;border-radius:10px;background:linear-gradient(150deg,#fff,#ded6bf);display:grid;grid-template-columns:repeat(3,1fr);padding:7px;transform:rotate(-8deg);box-shadow:0 0 14px rgba(255,200,70,.7),0 4px 0 #b9b099}
.de i{width:8px;height:8px;border-radius:50%;background:#16171c;place-self:center}.de i.x{visibility:hidden}
.arr{display:grid;grid-template-columns:repeat(3,auto);gap:4px 10px;font:700 10.5pt Texte}.arr span{display:inline-flex;gap:5px;align-items:center}
.arr b{width:19px;height:19px;border-radius:4px;display:grid;place-items:center;background:linear-gradient(160deg,#ffe98a,#e0a800);color:#1b1400!important;font-size:9.5pt}
.plus{color:#9be15d}.moins{color:#ff8f7d}
.or{margin:8px 0 2px;padding:8px 12px;border-radius:10px;text-align:center;color:#3a2a00;background:linear-gradient(180deg,#fff3c0,#ffd95e);font-weight:600}
.or b{color:#3a2a00;font:700 13pt Titre;display:block}
.touche{display:inline-block;padding:0 8px 1px;border-radius:6px;color:#10204a!important;font-weight:700;background:linear-gradient(180deg,#fff,#d7deef);box-shadow:0 2px 0 #8d9bc0}
.deux{display:grid;grid-template-columns:1fr 1fr;gap:10px}.deux .r{margin:0}
.r ul>li::before{box-shadow:0 0 6px rgba(255,200,60,.7)}
</style>"""
tuiles = lambda m, c: '<span class="mot">' + "".join(f'<i class="{c}">{l}</i>' for l in m) + "</span>"
de5 = '<div class="de">' + "".join(f'<i class="{"" if k in (0,2,4,6,8) else "x"}"></i>' for k in range(9)) + "</div>"
piste = '<div class="piste">' + "".join(f'<i class="{c}">{t}</i>' for c, t in [("v",""),("b",""),("v","↔"),("ro",""),("vi","+"),("v",""),("o","−"),("b",""),("n","")]) + "</div>"
arr = '<div class="arr">' + "".join(f'<span class="{"plus" if v > 0 else "moins"}"><b>{i+1}</b>{"+" if v > 0 else "−"}{abs(v)} €</span>' for i, v in enumerate([100, 75, 50, -25, -50, -100])) + "</div>"
med = lambda c, t: f'<span class="med {c}">{t}</span>'

h = CSS
h += f"""<div class="r"><h2>{med("v","1")}Le principe</h2>
<div class="illu">{tuiles("PATE","v")}<span class="fl">→</span>{tuiles("TAPE","em")}</div>
<p>On vous montre un mot. Trouvez un autre mot français qui utilise exactement les mêmes lettres avant la fin du sablier. Les accents ne comptent pas : PÂTE donne TAPE.</p>
<p>Mots acceptés : noms communs, adjectifs, verbes à l'infinitif, participes passés et présents. Les verbes conjugués et les noms propres sont refusés. Un mot refusé que vous pensez juste peut être <b>contesté</b> : il est vérifié sur le Wiktionnaire et ajouté au jeu s'il est valable.</p></div>
<div class="r"><h2>{med("b","2")}Les couleurs</h2>
<div class="coul"><div class="v"><b>Vert</b>4–5 lettres<br>20 € · 30 secondes</div><div class="b"><b>Bleu</b>6–7 lettres<br>50 € · 1 minute</div><div class="ro"><b>Rouge</b>8–9 lettres<br>100 € · 2 minutes</div><div class="n"><b>Noir</b>10 lettres et plus<br>200 € · 3 minutes</div></div></div>
<div class="r"><h2>{med("ro","3")}Sur le plateau (contre l'IA, multijoueur)</h2>
<div class="illu">{piste}{de5}{arr}</div>
<p>Le tapis {NOM} complet, de 2 à 6 joueurs. Lancez le dé, avancez, et résolvez la carte de la couleur de la case. Réussite : vous encaissez et vous rejouez. Échec : les autres joueurs peuvent enchérir pour racheter la carte.</p>
<p>Cases CD : vous choisissez votre chemin. Bonus et Malus : la banque vous verse ou vous prend le montant. Passe : vous attendez le tour suivant. Retour départ : retour sur la ligne de départ. Prison : payez la caution, faites-vous libérer par un joueur (qui touchera vos gains des 2 tours suivants) ou attendez 2 tours.</p>
<p>L'arrivée demande un dé au moins égal au nombre de cases restantes et rapporte un bonus selon votre ordre d'arrivée (+100 € à −100 €). Les gains des adversaires restent cachés jusqu'à la fin.</p>
<div class="or"><b>Le plus riche gagne, pas le premier arrivé.</b>Arriver 1er ne rapporte que +100 € : gagnez des cartes, misez aux enchères. Le podium final détaille les gains : cartes, enchères, cases, arrivée.</div></div>
<div class="r"><h2>{med("v","4")}Le Défi</h2>
<p>Dix cartes de difficulté croissante et trois vies. Chaque carte non résolue coûte une vie.</p>
<ul><li><b>Rapidité</b> : +25 % si vous trouvez dans la première moitié du temps.</li>
<li><b>Chasse aux anagrammes</b> : une fois la carte gagnée, le sablier continue ; chaque anagramme supplémentaire rapporte +50 % du gain.</li>
<li><b>Indice</b> : révèle la première lettre d'une solution, mais divise le gain par deux.</li>
<li><b>Séries</b> (menu « Série ») : Classique, cartes dans une autre langue (anglais ou français, espagnol, allemand, italien), ou thème (Animaux, Cuisine, Voyages…) ; 8 cartes par série à thème, débloquées par niveau, sans classement.</li></ul></div>
<div class="r"><h2>{med("vi","5")}Règles du solo</h2>
<p>Chacune peut être coupée dans « Règles de la partie libre ».</p>
<ul><li><b>Série ou banque</b> : les gains vont dans une cagnotte avec un multiplicateur (×1, ×1,5, ×2). Encaissez pour les mettre à l'abri, ou continuez. Un échec fait perdre une vie et la moitié de la cagnotte.</li>
<li><b>Choisir sa carte</b> : trois cartes cachées, seule la longueur du mot est visible.</li>
<li><b>Jokers</b> : un indice, un mélange, une passe. Un joker de plus toutes les 3 réussites de suite. Boutique entre les cartes : indice 30 €, passe 60 €, +10 s 40 €.</li>
<li><b>Cartes événement</b> : une carte sur cinq (Double ou rien, Sablier éclair, Mot masqué, Carte miroir, Prime de temps, Vie gagnante). On peut esquiver pour 30 €.</li>
<li><b>Coffres mystère</b> après les cartes 3, 6 et 9. <b>Carte légendaire</b> après la carte 7 : 10 lettres et plus, gain ×3.</li></ul></div>
<div class="r"><h2>{med("o","6")}Campagnes</h2>
<ul><li><b>Le Festival</b> : cinq manches à objectif. Bronze à l'objectif, argent à +25 %, or à +50 % ou argent sans joker. Une manche s'ouvre quand la précédente a une médaille.</li>
<li><b>Le Braquage</b> : six mots de 5 à 10 lettres, un chrono commun de 6 minutes, +20 s par mot, pas de passe.</li>
<li><b>Duel de l'ombre</b> : les cartes du jour contre un fantôme (votre meilleure partie du jour, ou une ombre simulée).</li>
<li><b>Défi de la semaine</b> : un scénario imposé et les mêmes cartes pendant 7 jours. Le premier essai est classé.</li>
<li><b>Défi du jour</b> : les mêmes 10 cartes pour tous ; seul le premier essai compte au classement.</li></ul></div>
<div class="r"><h2>{med("n","7")}Au clavier</h2>
<p>Tapez les lettres, <span class="touche">Entrée</span> pour valider, <span class="touche">Retour arrière</span> pour effacer, <span class="touche">Espace</span> pour mélanger.</p></div>"""
document("regles-du-jeu.pdf", "Règles du jeu", "Le principe, les couleurs, le plateau, le Défi, le solo et les campagnes", h,
         description="Les règles illustrées : principe de l'anagramme, quatre couleurs de cartes, plateau (cases, enchères, bonus d'arrivée, « le plus riche gagne »), Défi et séries, règles du solo, campagnes, clavier.")
