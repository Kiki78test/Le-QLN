/* =========================================================================
   Le-QLN — full board: "Versus AI" and synchronised multiplayer (same rules)
   Dépend du socle défini dans index.html (NIVEAUX, Composeur, panneau, Son…)
   Multijoueur : chaque appareil fait tourner la même partie (hasard à graine commune). Toute décision d'un joueur
   (dé, case, carte, enchère, prison, garant…) porte un numéro identique partout ; elle est envoyée à l'hôte, qui la
   valide (la première reçue compte) et la rediffuse. Un joueur absent ou trop lent : l'hôte décide à sa place
   (choix par défaut), si bien que tous les appareils restent d'accord.
   ========================================================================= */
"use strict";
const PlateauIA = (() => {

/* ---------- Styles propres au plateau ---------- */
const css = document.createElement("style");
css.textContent = `
.plateau-ecran{gap:14px}
.p-hud{display:grid; grid-template-columns:auto 1fr auto; gap:10px; align-items:center}
.p-hud h1{margin:0; text-align:center; font-family:var(--f-titre); font-weight:400; font-size:30px; letter-spacing:.04em; line-height:1}
.p-hud h1 small{display:block; font-family:var(--f-ui); font-weight:700; font-size:14px; letter-spacing:.08em; color:var(--brume); text-transform:uppercase}
.p-grille{display:grid; gap:14px; grid-template-columns:minmax(0,1fr)}
.p-grille > *{min-width:0}
@media (min-width:980px){ .p-grille{grid-template-columns:minmax(0,1fr) 340px; align-items:start} .p-cote{position:sticky; top:12px} }
.tapis-cadre{position:relative; border-radius:22px; padding:10px; background:linear-gradient(145deg,#f6dc8a 0%,#c8922a 28%,#8a5a12 52%,#e9c25c 78%,#9a6a1a 100%); box-shadow:inset 0 2px 0 rgba(255,255,255,.55), inset 0 -3px 0 rgba(0,0,0,.3), 0 3px 0 #5a3706, 0 26px 50px rgba(0,0,0,.6)}
.tapis-cadre::before{content:""; position:absolute; inset:10px; border-radius:14px; box-shadow:inset 0 0 0 3px rgba(0,0,0,.45), inset 0 8px 24px rgba(0,0,0,.55); pointer-events:none; z-index:2}
.tapis-scroll{background:radial-gradient(30% 34% at 0% 0%, rgba(190,220,255,.55), transparent 70%), repeating-conic-gradient(from 100deg at 0 0, rgba(170,210,255,0) 0deg, rgba(170,210,255,.13) 2deg, rgba(170,210,255,0) 4.5deg, rgba(170,210,255,0) 8deg), radial-gradient(80% 75% at 50% 45%, #1546ba, #0b2a8c 55%, #061a5c)}
.tapis-scroll{overflow-x:auto; overflow-y:hidden; border-radius:12px; -webkit-overflow-scrolling:touch; scrollbar-width:none}
#tapis{display:block; width:100%; min-width:660px; height:auto}
#tapis .case-g{transition:filter .2s} #tapis .case-g:not(.cible):hover{filter:brightness(1.08)}
#tapis .lueur{animation:lueur 2.6s ease-in-out infinite} @keyframes lueur{50%{opacity:.55}}
#tapis .cible{cursor:pointer}
#tapis .cible .halo{display:block}
#tapis .halo{display:none; fill:none; stroke:#ffe68f; stroke-width:8; stroke-dasharray:18 10; animation:fourmi .8s linear infinite; filter:drop-shadow(0 0 8px #ffcf3a)}
#tapis .cible:hover .halo{stroke:#fff}
@keyframes fourmi{to{stroke-dashoffset:-28}}
#tapis .pion{transition:transform .17s ease-out} #tapis .pion.actif .corps-pion{animation:rebond 1s ease-in-out infinite; transform-box:fill-box; transform-origin:50% 100%} @keyframes rebond{50%{transform:translateY(-6px) scaleY(1.04)}}
#tapis .pion .aura{display:none; fill:none; stroke:#fff; stroke-width:3; stroke-dasharray:6 5; animation:tourne 3s linear infinite; transform-box:fill-box; transform-origin:center}
#tapis .pion.actif .aura{display:block}
@keyframes tourne{to{transform:rotate(360deg)}}
.p-cote{display:grid; gap:14px; align-content:start}
.joueurs{display:grid; grid-template-columns:repeat(auto-fill, minmax(150px,1fr)); gap:8px}
.joueur{display:grid; grid-template-columns:auto 1fr; gap:2px 10px; align-items:center; background:rgba(3,10,30,.5); border-radius:12px; padding:8px 10px; box-shadow:inset 0 0 0 1px rgba(255,255,255,.06); transition:box-shadow .2s, transform .2s; min-width:0}
.joueur{position:relative; overflow:hidden; background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(3,10,30,.6)); padding-left:14px}
.joueur::before{content:""; position:absolute; left:0; top:0; bottom:0; width:5px; background:var(--cj,#888); box-shadow:2px 0 8px var(--cj,#888)}
.joueur.actif{box-shadow:inset 0 0 0 2px var(--or), 0 0 22px rgba(255,207,58,.35), 0 8px 16px rgba(0,0,0,.35); transform:translateY(-3px) scale(1.02)}
.joueur .pion-svg{grid-row:span 2; width:22px; height:32px}
.joueur .pion-svg.jeton{width:38px; height:38px; padding:0; background:none; box-shadow:none; border-radius:0}
.joueur .nom{font-family:var(--f-ui); font-weight:800; font-size:17px; letter-spacing:.03em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
.joueur .nom small{font-weight:600; color:var(--brume); font-size:13px; margin-left:4px}
.joueur .argent{font-family:var(--f-titre); font-size:22px; color:var(--or); letter-spacing:.04em; line-height:1; font-variant-numeric:tabular-nums; display:flex; gap:6px; align-items:center; flex-wrap:wrap}
.joueur .argent.cache{color:var(--brume-2); letter-spacing:.2em}
.joueur .etat{font-family:var(--f-ui); font-weight:800; font-size:12px; letter-spacing:.06em; text-transform:uppercase; padding:1px 6px; border-radius:10px; background:#000; color:var(--orange-b)}
.joueur .etat.ok{color:var(--vert-b)}
.dock{background:radial-gradient(120% 80% at 50% 0%, #fffdf6, var(--ivoire) 65%); color:var(--sombre); border-radius:18px; padding:14px; display:grid; gap:12px; box-shadow:0 2px 0 var(--ivoire-3), 0 6px 0 -1px #dccfae, 0 22px 40px rgba(0,0,0,.5), inset 0 0 0 3px rgba(255,255,255,.55)}
.dock-haut{display:flex; align-items:center; gap:14px}
.dock .de{width:64px; height:64px; padding:9px; border-radius:13px; margin:0; flex:none}
.dock .de i{width:11px; height:11px}
.dock-msg{font-family:var(--f-ui); font-weight:700; font-size:19px; line-height:1.2; min-width:0}
.dock-msg small{display:block; font-weight:600; color:var(--gris); font-size:15px; margin-top:2px}
.dock-actions{display:grid; gap:8px}
.choix-case{display:flex; align-items:center; justify-content:space-between; gap:10px; min-height:50px; padding:8px 14px; font-family:var(--f-titre); font-size:23px; letter-spacing:.04em; line-height:1; text-align:left}
.choix-case small{font-family:var(--f-ui); font-weight:700; font-size:15px; letter-spacing:.02em; opacity:.95}
.journal{background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(3,10,30,.55)); border-radius:12px; padding:8px 12px; box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}
.journal summary{cursor:pointer; font-family:var(--f-ui); font-weight:800; letter-spacing:.08em; text-transform:uppercase; font-size:14px; color:var(--brume); padding:4px 0}
.journal ol{list-style:none; margin:6px 0 2px; padding:0; display:grid; gap:4px; max-height:220px; overflow:auto; font-size:14.5px}
.journal li{display:grid; grid-template-columns:10px 1fr; gap:8px; align-items:baseline; color:#dfe6fb}
.journal li i{width:10px; height:10px; border-radius:50%; display:inline-block; box-shadow:0 0 0 1.5px #000}
.panneau-jeu{width:min(100%, 560px); display:grid; gap:12px; animation:apparait .2s}
.panneau-jeu .bandeau-ia{display:flex; align-items:center; justify-content:center; gap:10px; font-family:var(--f-ui); font-weight:800; font-size:18px; letter-spacing:.03em; color:#fff; text-align:center}
.panneau-jeu .bandeau-ia .pion-svg{width:20px; height:29px}
.cmd-p{display:grid; grid-template-columns:auto auto 1fr auto; gap:10px; align-items:center}
.encheres{display:grid; gap:10px; background:var(--ivoire); color:var(--sombre); border-radius:16px; padding:12px 14px; box-shadow:0 2px 0 var(--ivoire-3)}
.pas{display:grid; grid-template-columns:auto 1fr auto; gap:10px; align-items:center}
.pas output{text-align:center; font-family:var(--f-titre); font-size:40px; line-height:1; font-variant-numeric:tabular-nums}
.pas .rond{color:#fff; font-family:var(--f-titre); font-size:30px}
.offres{display:grid; gap:8px}
.offre{display:flex; justify-content:space-between; align-items:center; gap:10px; font-family:var(--f-ui); font-weight:700; font-size:18px; padding:8px 12px; background:#fff; border-radius:10px; box-shadow:0 2px 0 var(--ivoire-3)}
.offre .pion-svg{width:18px; height:26px}
.offre b{font-family:var(--f-titre); font-weight:400; font-size:26px}
.config{display:grid; gap:14px}
.bloc{background:rgba(3,10,30,.45); border-radius:14px; padding:12px 14px; display:grid; gap:10px; box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}
.bloc > label, .bloc > .lbl{font-family:var(--f-ui); font-weight:800; font-size:14px; letter-spacing:.1em; text-transform:uppercase; color:var(--brume)}
.champ{font:600 19px var(--f-ui); color:var(--sombre); background:var(--ivoire); border:0; border-radius:10px; padding:10px 12px; width:100%; box-shadow:inset 0 2px 4px rgba(0,0,0,.2)}
.segment{display:grid; grid-auto-flow:column; grid-auto-columns:1fr; gap:6px}
.segment button{min-height:48px; border-radius:10px; font-family:var(--f-titre); font-size:24px; letter-spacing:.04em; background:#21305a; color:var(--brume); box-shadow:0 3px 0 #0b1430}
.segment button[aria-pressed="true"]{background:linear-gradient(165deg,var(--jaune-b),var(--jaune-a)); color:#1b1a05; box-shadow:0 3px 0 var(--jaune-o)}
.segment button small{display:block; font-family:var(--f-ui); font-weight:700; font-size:12.5px; letter-spacing:.02em; margin-top:-2px}
.couleurs{display:flex; gap:10px; flex-wrap:wrap}
.couleurs button{width:50px; height:56px; border-radius:12px; background:#21305a; display:grid; place-items:center; box-shadow:0 3px 0 #0b1430}
.couleurs button[aria-pressed="true"]{background:var(--ivoire); box-shadow:0 3px 0 var(--ivoire-3), 0 0 0 3px var(--or)}
.couleurs .pion-svg{width:24px; height:35px} .couleurs .pion-svg.jeton{height:30px}
.adversaires{display:flex; gap:8px; flex-wrap:wrap; font-family:var(--f-ui); font-weight:700; color:var(--brume)}
.adversaires span{display:flex; align-items:center; gap:4px; background:rgba(0,0,0,.3); padding:3px 9px 3px 5px; border-radius:20px}
.adversaires .pion-svg{width:14px; height:20px}
.ordre{display:grid; gap:8px}
.ordre-l{display:grid; grid-template-columns:28px auto 1fr auto; gap:10px; align-items:center; font-family:var(--f-ui); font-weight:700; font-size:19px; background:#fff; border-radius:10px; padding:6px 12px; box-shadow:0 2px 0 var(--ivoire-3)}
.ordre-l .rang{font-family:var(--f-titre); font-size:26px; color:var(--gris)}
.ordre-l .dee{font-size:34px; line-height:1}
.podium{display:grid; gap:8px}
.podium-l{display:grid; grid-template-columns:40px auto 1fr auto; gap:12px; align-items:center; background:rgba(3,10,30,.5); border-radius:12px; padding:10px 14px; font-family:var(--f-ui); font-weight:700; font-size:19px; animation:pioche .5s backwards}
.podium-l.premier{background:linear-gradient(100deg, rgba(255,207,58,.3), rgba(3,10,30,.5)); box-shadow:inset 0 0 0 2px var(--or)}
.podium-l.hors{opacity:.55}
.podium-detail{grid-column:1/-1; display:flex; flex-wrap:wrap; align-items:flex-start; align-self:start; gap:6px; margin-top:2px}
.podium-detail i{display:inline-block; width:auto; height:auto; min-height:0; line-height:1.35; white-space:nowrap; animation:none; font:700 13px/1.35 var(--f-ui); font-style:normal; letter-spacing:.03em; padding:3px 9px; border-radius:999px; background:rgba(255,255,255,.08); color:var(--brume-2)}
.podium-detail i em{font-style:normal; color:#fff} .podium-detail i.plus em{color:#9be15d} .podium-detail i.moins em{color:#ff8f7d} .podium-detail i.zero{opacity:.55}
.podium-detail i.pd-arrivee{box-shadow:inset 0 0 0 1px rgba(255,214,90,.55)}
.regle-or{margin:2px 0 0; padding:9px 12px; border-radius:12px; text-align:center; font:600 15.5px/1.3 var(--f-ui); color:#3a2a00; background:linear-gradient(180deg,#fff3c0,#ffd95e); box-shadow:inset 0 0 0 1.5px rgba(160,110,0,.35)}
.regle-or b{display:block; font:800 19px var(--f-ui); letter-spacing:.02em}
.podium-l .rang{font-family:var(--f-titre); font-size:34px; color:var(--or); line-height:1}
.podium-l .pion-svg{width:22px; height:32px}
.podium-l b{font-family:var(--f-titre); font-weight:400; font-size:30px; color:var(--or); font-variant-numeric:tabular-nums}
.podium-l small{display:block; color:var(--brume); font-weight:600; font-size:14px}

/* ===== V10 plateau : cadre doré fin, cases plus grandes sur mobile, fiches joueurs, bouton dé premium ===== */
.tapis-cadre{padding:5px; border-radius:20px; background:linear-gradient(145deg,#fff1b8,#d39a2c 38%,#ffe08a 62%,#b67f1f 82%,#f3cf6c); box-shadow:0 0 0 1px rgba(0,0,0,.35), 0 0 22px rgba(255,196,70,.5), 0 0 70px rgba(70,130,255,.28), 0 18px 40px rgba(0,0,0,.5)!important}
.tapis-cadre::before{inset:5px; border-radius:15px; box-shadow:inset 0 0 0 1px rgba(0,0,0,.4), inset 0 6px 18px rgba(0,0,0,.45)}
.tapis-cadre::after{display:none}
@media (max-width:699px){
  #tapis{min-width:880px}
  .p-grille{display:flex; flex-direction:column; gap:12px}
  .p-cote{display:contents}
  .joueurs{order:-1; display:flex; gap:8px; overflow-x:auto; scrollbar-width:none; padding:2px 2px 4px; margin:0 -2px; scroll-snap-type:x proximity}
  .joueurs::-webkit-scrollbar{display:none}
  .joueurs .joueur{flex:0 0 auto; min-width:128px; scroll-snap-align:start}
  .tapis-cadre{order:0} .dock{order:1} .journal{order:2} .p-grille > .pub-bandeau,.p-cote > .pub-bandeau{order:3}
}
/* fiches joueurs */
.joueur{padding:8px 12px 8px 10px; border-radius:14px; gap:1px 10px; background:linear-gradient(160deg, rgba(255,255,255,.08), rgba(10,22,60,.75)); box-shadow:inset 0 0 0 1px rgba(255,255,255,.08), 0 6px 14px rgba(0,0,0,.25)}
.joueur::before{width:auto; inset:auto 10px 0 10px; height:2px; border-radius:2px; box-shadow:0 0 8px var(--cj,#888); opacity:.85}
.joueur .pion-svg{width:34px; height:34px; padding:4px 7px; border-radius:50%; background:radial-gradient(circle at 35% 30%, rgba(255,255,255,.18), rgba(0,0,0,.35)); box-shadow:inset 0 0 0 1.5px var(--cj,#888)}
.joueur .nom{font-size:16px} .joueur .argent{font-size:21px}
.joueur.actif{box-shadow:inset 0 0 0 1.5px #ffd84a, 0 0 18px rgba(255,216,74,.28), 0 8px 16px rgba(0,0,0,.3); transform:none}
/* dock */
.dock{border-radius:18px; box-shadow:0 0 0 1px rgba(201,146,26,.45), 0 14px 30px rgba(0,0,0,.4)!important}
.dock::before{display:none}
#b-dock{position:relative; overflow:hidden; border-radius:16px; min-height:64px; font-size:31px; letter-spacing:.04em; color:#2a1800;
  background:linear-gradient(180deg,#fff2b0 0%,#ffd84a 38%,#f2b318 72%,#d99a0c 100%)!important;
  box-shadow:inset 0 0 0 1px #fff6c8, inset 0 2px 0 rgba(255,255,255,.9), inset 0 -3px 0 rgba(150,90,0,.35), 0 3px 0 #a86f00, 0 0 0 4px rgba(255,216,74,.14), 0 12px 30px rgba(255,180,20,.45)!important;
  animation:deAppel 2.4s ease-in-out infinite}
#b-dock::after{content:""; position:absolute; top:-30%; bottom:-30%; left:-40%; width:30%; transform:skewX(-20deg); background:linear-gradient(90deg,transparent,rgba(255,255,255,.65),transparent); animation:deReflet 2.4s ease-in-out infinite; pointer-events:none}
#b-dock svg{width:32px; height:32px; filter:drop-shadow(0 1px 0 rgba(255,255,255,.6))}
@keyframes deAppel{50%{box-shadow:inset 0 0 0 1px #fff6c8, inset 0 2px 0 rgba(255,255,255,.9), inset 0 -3px 0 rgba(150,90,0,.35), 0 3px 0 #a86f00, 0 0 0 7px rgba(255,216,74,.10), 0 14px 38px rgba(255,180,20,.6)}}
@keyframes deReflet{0%,55%{left:-40%} 100%{left:130%}}
@media (prefers-reduced-motion:reduce){ #b-dock,#b-dock::after{animation:none} }
.journal{border-radius:14px; box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}

/* dé lancé sur le plateau */
.de-vol-zone{position:fixed; z-index:40; pointer-events:none; overflow:hidden; border-radius:16px}
.de-vol{position:absolute; left:0; top:0; width:var(--d); height:var(--d); will-change:transform; filter:drop-shadow(0 4px 6px rgba(0,0,0,.35))}
.de-vol .de{--d:inherit; width:var(--d); height:var(--d); perspective:600px}
.de-vol .de::after{display:none}
.de-vol-sol{position:absolute; left:0; top:0; width:var(--d); height:calc(var(--d)*.42); margin-top:calc(var(--d)*.8); background:radial-gradient(closest-side, rgba(0,0,0,.6), transparent 72%); transform-origin:center}
.de-vol-val{position:absolute; transform:translate(-50%,-100%); font:400 54px/1 var(--f-titre); color:#fff6c8; text-shadow:0 0 18px rgba(255,214,74,.9), 0 3px 0 rgba(0,0,0,.6); opacity:0}
.de-vol-zone.pose .de-vol-val{animation:deVal .6s cubic-bezier(.2,.9,.3,1.4) forwards}
.de-vol-zone.pose .de-vol{filter:drop-shadow(0 0 22px rgba(255,214,74,.75)) drop-shadow(0 4px 6px rgba(0,0,0,.35))}
@keyframes deVal{from{opacity:0; transform:translate(-50%,-60%) scale(.5)} to{opacity:1; transform:translate(-50%,-110%) scale(1)}}

/* ===== Plateau sans défilement vertical : tout tient dans l'écran ===== */
.plateau-ecran{--entete:calc(var(--bp-h, 0px) + var(--ab-h, 58px)); gap:10px}
.plateau-ecran .p-hud h1{font-size:28px}
@media (min-width:980px){
  .plateau-ecran{--hp:calc(100dvh - var(--bb-h, 0px) - var(--entete) - 154px)}
  .plateau-ecran .p-grille{grid-template-columns:minmax(0,1fr) 330px; align-items:start; gap:16px}
  .plateau-ecran .tapis-cadre{width:min(100%, calc(var(--hp) * 1.79)); margin:0 auto}
  .plateau-ecran #tapis{min-width:0}
  .plateau-ecran .tapis-scroll{overflow:hidden}
  .plateau-ecran .p-cote{position:static; max-height:var(--hp); overflow-y:auto; overflow-x:hidden; scrollbar-width:none; padding-right:2px; overscroll-behavior:contain}
  .plateau-ecran .journal ol{max-height:120px}
  .plateau-ecran .joueurs{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:699px){
  /* hauteur du plateau calculée pour que joueurs + plateau + action tiennent sans faire défiler */
  .plateau-ecran{--hp:clamp(210px, calc(100dvh - var(--bb-h, 0px) - var(--entete) - 372px), 520px)}
  .plateau-ecran .tapis-scroll{height:var(--hp)}
  .plateau-ecran #tapis{min-width:0; width:auto; height:100%; max-width:none}
  .plateau-ecran .p-hud{margin-bottom:-2px}
  .plateau-ecran .dock{padding:10px 12px; gap:8px}
  .plateau-ecran .dock .de{--d:52px}
  .plateau-ecran #b-dock{min-height:54px; font-size:26px}
}
@media (min-width:700px) and (max-width:979px){
  .plateau-ecran{--hp:calc(100dvh - var(--bb-h, 0px) - var(--entete) - 360px)}
  .plateau-ecran .tapis-cadre{width:min(100%, calc(var(--hp) * 1.79)); margin:0 auto}
  .plateau-ecran #tapis{min-width:0}
}

/* dé en vol : halo doré et anneaux lumineux qui tournent autour (traînées), estompés une fois le dé posé */
.de-vol .de{position:relative; z-index:1}
.de-halo{position:absolute; inset:-95%; border-radius:50%; mix-blend-mode:screen; background:radial-gradient(closest-side, rgba(255,226,130,.95) 28%, rgba(255,186,60,.62) 48%, rgba(255,150,30,.22) 64%, transparent 78%); animation:deHalo .45s ease-in-out infinite alternate; pointer-events:none}
.de-orbite{position:absolute; inset:-62%; border-radius:50%; pointer-events:none; mix-blend-mode:screen;
  background:conic-gradient(from 0deg, transparent 0 8%, rgba(255,200,80,.25) 22%, rgba(255,224,120,.95) 42%, #fffbe6 50%, transparent 53% 58%, rgba(255,214,100,.5) 78%, #fff3c4 86%, transparent 89% 100%);
  -webkit-mask:radial-gradient(closest-side, transparent 80%, #000 84% 95%, transparent 99%); mask:radial-gradient(closest-side, transparent 80%, #000 84% 95%, transparent 99%);
  filter:drop-shadow(0 0 8px rgba(255,196,60,1)) drop-shadow(0 0 18px rgba(255,170,40,.7))}
.de-orbite.o1{animation:deOrbite1 .7s linear infinite}
.de-orbite.o2{inset:-88%; opacity:.8; animation:deOrbite2 .95s linear infinite}
.de-orbite.o3{inset:-40%; z-index:2; animation:deOrbite3 .6s linear infinite}
@keyframes deOrbite1{from{transform:rotateX(66deg) rotateZ(0deg)} to{transform:rotateX(66deg) rotateZ(360deg)}}
@keyframes deOrbite2{from{transform:rotateX(72deg) rotateY(20deg) rotateZ(360deg)} to{transform:rotateX(72deg) rotateY(20deg) rotateZ(0deg)}}
@keyframes deOrbite3{from{transform:rotateX(58deg) rotateY(-26deg) rotateZ(0deg)} to{transform:rotateX(58deg) rotateY(-26deg) rotateZ(360deg)}}
@keyframes deHalo{from{opacity:.75; transform:scale(.93)} to{opacity:1; transform:scale(1.07)}}
.de-vol-zone.pose .de-orbite{animation-play-state:paused; opacity:0; transition:opacity .35s}
.de-vol-zone.pose .de-halo{animation:none; opacity:.55; transition:opacity .3s}
.de-vol .face{border-radius:calc(var(--d)*.14)}
`;
document.head.appendChild(css);

/* ---------- Le tapis ---------- */
// Types : v b r n (couleurs), bonus:x, malus:x, prison:x, passe, retour ; « * » = case CD
const CASES = {
  "8,4":"v","7,4":"v","6,4":"v","5,4":"v","4,4":"b*",
  "3,4":"v","2,4":"v","1,4":"passe","0,4":"v*","0,3":"v","0,2":"v","0,1":"b","0,0":"v",
  "1,0":"prison:50","2,0":"v","3,0":"v","4,0":"v","4,1":"b","4,2":"bonus:75","4,3":"v",
  "4,5":"b","4,6":"bonus:40","4,7":"b*",
  "3,7":"v","2,7":"malus:40","1,7":"v","0,7":"v*","0,6":"v","0,5":"r",
  "0,8":"b","0,9":"prison:50","0,10":"b*","0,11":"malus:50","0,12":"b","0,13":"b",
  "4,8":"r","4,9":"n","4,10":"v*","3,10":"v","2,10":"v","1,10":"v",
  "4,11":"bonus:100","4,12":"b","4,13":"r",
  "5,7":"v","6,7":"malus:40","7,7":"v","7,8":"b","7,9":"retour","7,10":"b","7,11":"passe","7,12":"v","7,13":"v",
};
const CHEMINS = [
  ["D","8,4","7,4","6,4","5,4","4,4"],
  ["4,4","3,4","2,4","1,4","0,4","0,3","0,2","0,1","0,0","1,0","2,0","3,0","4,0","4,1","4,2","4,3","4,4"],
  ["4,4","4,5","4,6","4,7"],
  ["4,7","3,7","2,7","1,7","0,7"],
  ["0,7","0,6","0,5","0,4"],
  ["0,7","0,8","0,9","0,10"],
  ["0,10","0,11","0,12","0,13","A"],
  ["4,7","4,8","4,9","4,10"],
  ["4,10","3,10","2,10","1,10","0,10"],
  ["4,10","4,11","4,12","4,13","A"],
  ["4,7","5,7","6,7","7,7","7,8","7,9","7,10","7,11","7,12","7,13","A"],
];
const NOEUDS = { D:{id:"D", next:[]}, A:{id:"A", next:[]} };
for(const [id, def] of Object.entries(CASES)){
  const [r,c] = id.split(",").map(Number);
  const cd = def.endsWith("*"), d = def.replace("*","");
  const [type, m] = d.split(":");
  NOEUDS[id] = { id, r, c, cd, type: "vbrn".includes(type) && type.length===1 ? "carte" : type, niv: "vbrn".includes(type) && type.length===1 ? type : null, montant: m ? +m : 0, next:[] };
}
for(const ch of CHEMINS) for(let i=0;i<ch.length-1;i++){ const a = NOEUDS[ch[i]]; if(!a.next.includes(ch[i+1])) a.next.push(ch[i+1]); }
const DIST = (() => { // distance (en cases) jusqu'à l'arrivée
  const d = {A:0}, file = ["A"];
  const prec = {}; for(const n of Object.values(NOEUDS)) for(const s of n.next) (prec[s] = prec[s] || []).push(n.id);
  while(file.length){ const x = file.shift(); for(const p of (prec[x]||[])) if(d[p]==null){ d[p] = d[x]+1; file.push(p); } }
  return d;
})();
function destinations(depart, de){
  const res = new Map();
  (function rec(id, reste, chemin){
    if(id === "A"){ if(!res.has("A")) res.set("A", {id:"A", chemin}); return; }
    if(reste === 0){ if(!res.has(id)) res.set(id, {id, chemin}); return; }
    for(const n of NOEUDS[id].next) rec(n, reste-1, [...chemin, n]);
  })(depart, de, []);
  return [...res.values()];
}

/* ---------- Constantes de partie ---------- */
const PIONS = [
  {nom:"Yellow", c:"#ffd60a"}, {nom:"Pink", c:"#ff4fa3"}, {nom:"Cyan", c:"#35e0ff"},
  {nom:"White", c:"#f2f2f2"}, {nom:"Lilac", c:"#c59bff"}, {nom:"Orange", c:"#ff8a1f"},
];
const PROFILS = {
  debutant:{nom:"Beginner", p:{v:.62, b:.38, r:.2, n:.08}, alea:.55, garant:.35, reflexion:1.2},
  joueur:  {nom:"Player",   p:{v:.84, b:.62, r:.4, n:.2},  alea:.25, garant:.5,  reflexion:1},
  expert:  {nom:"Expert",   p:{v:.95, b:.84, r:.66, n:.42}, alea:.06, garant:.65, reflexion:.8},
};
const NOMS_IA = ["Emma","Jack","Chloe","Liam","Zoe"];
const BONUS_ARRIVEE = [100, 75, 50, -25, -50, -100];
const CAUTION = 50;
/* Règles validées par l'auteur du jeu (14/11/2026) :
   R1 série : après une carte réussie, on ne relance plus le dé ; on peut piocher une 2e carte de la même couleur
      sur la même case, ou s'arrêter (2 cartes par case au plus). Un échec termine le tour.
   R2 durée : partie courte (dé 1 à 6) ou longue (dé 1 à 3), choisie par celui qui crée la partie.
   R5 une mauvaise réponse laisse les autres enchérir ; R6 Passe : on passe son prochain tour ;
   R7 enchère acceptée : on encaisse sans rejouer ; R9 égalité : départage par l'ordre d'arrivée ;
   R10 dernier en lice : 3 tours pour franchir l'arrivée (pour tous). */
const MAX_SERIE = 2;
const FACES = {courte:6, longue:3};
const TR = document.documentElement.lang === "en" ? {
  duree:"Game length", courte:"Short", courteD:"die 1 to 6 · about 20 min", longue:"Long", longueD:"die 1 to 3 · about 45 min",
  serieT:"Card won!", serieQ:(c, g) => `Draw a 2nd ${c} card on this square (+€${g}), or stop here? If you miss it, your turn ends (you keep what you've won).`,
  piocher:"Draw a 2nd card", arreter:"Stop here", sArrete:n => `${n} stops.`, pioche2:(n, c) => `${n} draws a 2nd ${c} card.`, choisitSerie:n => `${n} decides whether to draw again…`,
  passe:"skips next turn", passeTxt:n => `${n} will skip the next turn.`, passeTour:n => `${n} skips this turn`, passeJ:n => `${n} skips a turn.`,
  dernier:n => `${n} is the last one still playing: 3 turns to cross the finish.`, dernierVous:"Last one still playing: 3 turns to cross the finish!", toursRestants:n => `Turns left to finish: ${n}`,
  refusee:p => `${p} isn't on the back of the card. The others can still bid.`, refuseeT:"Answer refused", aucune:"No bids.",
  enchFin:(w, g, m, j) => `${w} takes ${g} and pays ${m} to ${j}, whose turn ends.`, offreTxt:"You didn't find it. Other players offer to buy the card. If you accept, you take the offer and your turn ends.",
} : {
  duree:"Durée de la partie", courte:"Courte", courteD:"dé 1 à 6 · environ 20 min", longue:"Longue", longueD:"dé 1 à 3 · environ 45 min",
  serieT:"Carte gagnée !", serieQ:(c, g) => `Piocher une 2e carte ${c} sur cette case (+€${g}), ou s'arrêter ? En cas d'échec, votre tour s'arrête (vous gardez vos gains).`,
  piocher:"Piocher une 2e carte", arreter:"M'arrêter", sArrete:n => `${n} s'arrête.`, pioche2:(n, c) => `${n} pioche une 2e carte ${c}.`, choisitSerie:n => `${n} décide s'il pioche encore…`,
  passe:"passe son prochain tour", passeTxt:n => `${n} passera son prochain tour.`, passeTour:n => `${n} passe son tour`, passeJ:n => `${n} passe son tour.`,
  dernier:n => `${n} est le dernier en lice : 3 tours pour franchir l'arrivée.`, dernierVous:"Dernier en lice : 3 tours pour franchir l'arrivée !", toursRestants:n => `Tours restants pour arriver : ${n}`,
  refusee:p => `${p} ne figure pas au dos de la carte. Les autres joueurs peuvent encore enchérir.`, refuseeT:"Réponse refusée", aucune:"No bids.",
  enchFin:(w, g, m, j) => `${w} encaisse ${g} et verse ${m} à ${j}, dont le tour s'arrête.`, offreTxt:"Vous n'avez pas trouvé. D'autres joueurs vous proposent de racheter la carte. Si vous acceptez, vous encaissez l'offre et votre tour s'arrête.",
};
const DES = ["","⚀","⚁","⚂","⚃","⚄","⚅"];

/* ---------- État ---------- */
let G = null;
class Abandon extends Error{}
const J = id => G.joueurs.find(j => j.id === id);
const actifs = () => G.joueurs.filter(j => !j.arrive && !j.horsJeu);
const humain = () => G.joueurs.find(j => G.multi ? j.id === G.multi.moi : !j.ia);   // le joueur de CET appareil
const estLocal = j => !j.ia && (!G.multi || j.id === G.multi.moi);
const VITE = () => window.QLN_TEST_VITE || (G && G.rattrape ? .01 : 1);   // (tests ; reprise d'une partie : on rejoue vite les coups manqués)   // (tests automatiques : animations accélérées)
const attendre = ms => { const g = G; return new Promise((ok, ko) => setTimeout(() => (G && G === g) ? ok() : ko(new Abandon()), ms * (g && g.rapide ? .4 : 1) * VITE())); };
async function ui(promesse){ const g = G; const v = await promesse; if(!G || G !== g) throw new Abandon(); return v; }
const round5 = x => Math.max(5, Math.round(x/5)*5);
const hasard = t => t[Math.floor(Math.random()*t.length)];
const alea = () => G.rnd();   // hasard de la partie (graine commune en multijoueur)

/* ---------- Textes du multijoueur (la version EN remplace ce bloc) ---------- */
const TM = {
  multi:"Multiplayer", vous:"you", absent:"AI relay", joue:n=>`${n} is playing their card…`, choisit:n=>`${n} is choosing…`, lance:n=>`${n} is rolling the die…`,
  prepare:"Prepare an answer: if the player gets stuck, you can bid.", seche:n=>`${n} is stuck! Bidding is open.`, trouve:(n,m)=>`${n} suggests ${m}`,
  enchOuvertes:"The other players can bid…", offreEnvoyee:"Bid sent: waiting for the other players.", enchFermees:"Bidding is over.",
  prisonChoix:n=>`${n} is in jail and choosing…`, garantAttente:"Waiting for the other players' answers…", personneGarant:"No player agrees to pay your bail.",
  quitterQ:"You will leave the game; the AI will play for you and you can come back from the Multiplayer screen.", retour:n=>`${n} is back and takes over again.`, rattrapage:"Resuming the game…", retourSalon:"Back to the room", menu:"Menu",
  victoire:"Victory!", gagne:n=>`${n} wins`, hoteParti:"The host has left: the game stops.", deconnecte:n=>`${n} is disconnected: the app plays for them.`,
};

/* =========================================================================
   Multijoueur : décisions numérotées, validées par l'hôte
   ========================================================================= */
function decision(type, j, invite, defaut, delai = 60000, ctx = {}){
  const M = G.multi, g = G;
  const proprio = j === "hote" ? "hote" : j.id;   // (« hote » : décision de l'hôte du moment, quel qu'il soit)
  const cle = `${++G.n}:${type}:${proprio}`;
  return new Promise((ok, ko) => {
    M.attentes.set(cle, v => { if(G !== g) return ko(new Abandon()); ok(v); });
    if(M.decides.has(cle)){ appliquer(cle, M.decides.get(cle)); return; }
    if(G.rattrape) finRattrapage();
    M.meta.set(cle, {proprio, defaut, delai, invite});
    if(proprio === "hote"){ if(M.hote) Promise.resolve().then(invite).then(v => decider(cle, v)).catch(() => {}); return; }
    if(proprio === M.moi){
      // l'invite ne crée que des éléments à elle : on sait les fermer si l'hôte tranche avant (délai dépassé)
      const avant = new Set(document.querySelectorAll(".voile"));
      M.ouvertes.set(cle, () => { $$(".voile").forEach(v => { if(!avant.has(v)) v.remove(); }); const z = $("#dock-actions"); if(z) z.innerHTML = ""; marquerCibles([]); composeurActif = null; });
      // (tests automatiques : un « pilote » peut répondre à la place de l'interface)
      const pilote = window.QLN_TEST_PILOTE ? () => new Promise(r => setTimeout(() => r(window.QLN_TEST_PILOTE(type, {...ctx, j, moi:humain()})), 30)) : invite;
      Promise.resolve().then(pilote).then(v => { M.ouvertes.delete(cle); proposer(cle, v); }).catch(() => {});
    } else if(j !== "hote" && !M.present(proprio)) majJoueurs();
    if(M.hote) surveiller(cle, proprio, defaut, delai);
  });
}
function proposer(cle, v){
  const M = G && G.multi; if(!M) return;
  if(v === undefined) v = null;
  if(M.hote) decider(cle, v); else { M.propositions.set(cle, v); M.envoyer({t:"act", cle, val:v}); }   // (renvoyée au nouvel hôte si l'hôte change)
}
function decider(cle, v){   // (hôte) la première décision reçue pour un numéro est la bonne
  const M = G.multi; if(M.tranchees.has(cle)) return;
  M.tranchees.add(cle); M.envoyer({t:"dec", cle, val:v}); appliquer(cle, v);
}
function appliquer(cle, v){
  const M = G.multi; M.decides.set(cle, v); M.propositions.delete(cle); M.meta.delete(cle);
  const f = M.attentes.get(cle); if(!f) return;
  M.attentes.delete(cle);
  const fermer = M.ouvertes.get(cle); if(fermer){ M.ouvertes.delete(cle); fermer(); }
  f(v);
}
// choix par défaut d'un joueur absent : la case la plus proche de l'arrivée
const versArrivee = opts => { let k = 0; opts.forEach((o, i) => { if((o.id === "A" ? -1 : (DIST[o.id] ?? 99)) < (opts[k].id === "A" ? -1 : (DIST[opts[k].id] ?? 99))) k = i; }); return k; };
function surveiller(cle, proprio, defaut, delai){
  const M = G.multi, g = G, t0 = Date.now();
  const iv = setInterval(() => {
    if(G !== g || M.tranchees.has(cle)) return clearInterval(iv);
    const absent = proprio !== M.moi && !M.present(proprio);
    if((absent && Date.now() - t0 > 2500 * VITE()) || Date.now() - t0 > delai){ clearInterval(iv); decider(cle, typeof defaut === "function" ? defaut() : defaut); }
  }, 400 * Math.min(1, VITE() * 5));
}
function recevoirMulti(m){
  const M = G && G.multi; if(!M || !m || typeof m.cle !== "string") return;
  if(M.hote && m.t === "act"){ const i = m.cle.indexOf(":", m.cle.indexOf(":") + 1); if(m.cle.slice(i + 1) === m.de) decider(m.cle, m.val); }   // seul le joueur concerné décide pour lui
  else if(m.t === "dec" && M.hote && !M.tranchees.has(m.cle)){ M.tranchees.add(m.cle); appliquer(m.cle, m.val); }   // (décision de l'ancien hôte arrivée tard)
  else if(!M.hote && m.t === "dec") appliquer(m.cle, m.val);
}
/* changement d'hôte en cours de partie : le nouvel hôte reprend les décisions en attente */
function changerHote(nouveau){
  const M = G && G.multi; if(!M) return;
  M.hoteId = nouveau; const etait = M.hote; M.hote = nouveau === M.moi;
  if(M.hote && !etait){
    for(const cle of M.attentes.keys()){
      if(M.decides.has(cle)) continue;
      M.tranchees.delete(cle);
      const x = M.meta.get(cle); if(!x) continue;
      if(x.proprio === "hote"){ Promise.resolve().then(x.invite).then(v => decider(cle, v)).catch(() => {}); continue; }
      if(M.propositions.has(cle)) decider(cle, M.propositions.get(cle));
      else surveiller(cle, x.proprio, x.defaut, x.delai);
    }
    for(const [cle, v] of M.propositions) if(!M.decides.has(cle)) decider(cle, v);
  } else if(!M.hote) for(const [cle, v] of M.propositions) M.envoyer({t:"act", cle, val:v});
}
/* toutes les décisions déjà prises (pour un joueur qui revient) */
let journalFini = [];   // (partie terminée chez l'hôte : un joueur qui revient peut encore rejouer jusqu'au podium)
const journalMulti = () => G && G.multi ? [...G.multi.decides] : journalFini;
function appliquerJournal(decs){
  const M = G && G.multi; if(!M || !Array.isArray(decs)) return;
  for(const [cle, v] of decs) if(typeof cle === "string" && !M.decides.has(cle)){ if(M.hote) M.tranchees.add(cle); appliquer(cle, v); }
}
/* reprise : l'appli rejoue à toute vitesse les coups déjà joués, puis la partie continue normalement */
function finRattrapage(){ G.rattrape = false; if(G.sonAvant != null){ Son.actif = G.sonAvant; G.sonAvant = null; } const v = $("#rattrapage"); if(v) v.remove(); majJoueurs(); dessinerPions(); }
/* présence : chacun voit quand l'IA prend le relais d'un joueur, et quand il revient */
function surveillerPresence(){
  const g = G, vus = new Map(G.joueurs.map(j => [j.id, true]));
  const iv = setInterval(() => {
    if(G !== g || !G.multi){ clearInterval(iv); return; }
    let chg = false;
    for(const j of G.joueurs){
      if(j.id === G.multi.moi || j.arrive || j.horsJeu) continue;
      const p = !!G.multi.present(j.id);
      if(p !== vus.get(j.id)){ vus.set(j.id, p); chg = true;
        if(!G.rattrape){ const t = p ? TM.retour(j.nom) : TM.deconnecte(j.nom); toast(t, 4000); journal(j, t); } }
    }
    if(chg) majJoueurs();
  }, 1000);
}
async function demarrerMulti(opt){
  window.QLN_EVT && window.QLN_EVT("partie:multi");
  // opt : {graine, joueurs:[{id, pseudo, couleur}], moi, hote, hoteId, envoyer, present, quitter, retour}
  arreterVitrine(); journalFini = [];
  const joueurs = opt.joueurs.map(x => ({id:x.id, nom:x.pseudo, couleur:PIONS[x.couleur % PIONS.length].c, ia:null,
    argent:0, pos:"D", prison:0, dette:null, arrive:null, horsJeu:false, cartes:0, reussies:0, detail:{cartes:0, encheres:0, cases:0, arrivee:0}}));
  G = { joueurs, ordre:[], idx:0, caches:true, rapideIA:false, rapide:false, arrivees:[], deja:new Set(), journal:[], dernier:null, tours:0, courant:null,
        rnd:aleaGraine(opt.graine), n:0, faces:FACES[opt.duree] || 6,
        multi:{moi:opt.moi, hote:opt.hote, hoteId:opt.hoteId, envoyer:opt.envoyer, present:opt.present, quitter:opt.quitter, retour:opt.retour,
               attentes:new Map(), decides:new Map(), tranchees:new Set(), ouvertes:new Map(), meta:new Map(), propositions:new Map()} };
  ecranPlateau();
  if(opt.decs && opt.decs.length){   // retour dans une partie en cours
    G.rattrape = true; G.sonAvant = Son.actif; Son.actif = false;   // (rejeu muet)
    for(const [cle, v] of opt.decs){ G.multi.decides.set(cle, v); if(opt.hote) G.multi.tranchees.add(cle); }
    const v = document.createElement("div"); v.id = "rattrapage"; v.className = "voile"; v.innerHTML = `<div class="panneau-jeu" style="text-align:center"><b style="font:400 26px var(--f-titre); color:var(--or)">${TM.rattrapage}</b></div>`;
    document.body.appendChild(v);
  }
  surveillerPresence();
  // filet de sécurité : si j'attends une décision depuis plus de 6 s (message perdu, retour en cours…), je redemande le journal à l'hôte
  if(!opt.hote && opt.resync){ const g = G; let t = 0; const iv = setInterval(() => {
    if(G !== g){ clearInterval(iv); return; }
    t = G.multi.attentes.size ? t + 1 : 0;
    if(t >= 6 && !G.multi.hote){ t = 0; opt.resync(); }
  }, 1000); }
  try{
    await tirerOrdre();
    await boucle();
  }catch(e){ if(!(e instanceof Abandon)) { console.error(e); toast("Unexpected error: "+e.message); } }
}

/* =========================================================================
   Écran de configuration
   ========================================================================= */
function config(){
  arreterVitrine();
  const cfg = store.get("cfgIA", {nom:"", couleur:0, nb:3, niveau:"joueur", caches:true, rapide:false});
  if(!FACES[cfg.duree]) cfg.duree = "courte";
  const compte = typeof Multi !== "undefined" ? Multi.compte() : null;
  if(compte && !cfg.nom){ cfg.nom = compte.pseudo; cfg.couleur = compte.couleur; }
  app.classList.remove("large");
  app.innerHTML = `
  <section class="ecran">
    <div class="entete-ecran"><button class="icone-btn" id="b-retour" aria-label="Back">${ICO.retour}</button><h1>Versus AI</h1><span></span></div>
    <p class="sous-titre">The full board, 2 to 6 players. The app acts as Game Master.</p>
    <div class="config">
      <div class="bloc"><label for="cfg-nom">Your first name</label><input class="champ" id="cfg-nom" maxlength="14" placeholder="You" value="${esc(cfg.nom)}" autocomplete="given-name"></div>
      <div class="bloc"><span class="lbl">Your pawn</span><div class="couleurs" id="cfg-couleurs">${PIONS.map((p,i)=>`<button aria-pressed="${i===cfg.couleur}" data-i="${i}" aria-label="${p.nom} pawn">${jetonSVG(p.c)}</button>`).join("")}</div></div>
      <div class="bloc"><span class="lbl">Number of opponents</span><div class="segment" id="cfg-nb">${[1,2,3,4,5].map(n=>`<button aria-pressed="${n===cfg.nb}" data-n="${n}">${n}</button>`).join("")}</div><div class="adversaires" id="cfg-adv"></div></div>
      <div class="bloc"><span class="lbl">Opponent level</span><div class="segment" id="cfg-niv">${Object.entries(PROFILS).map(([k,p])=>`<button aria-pressed="${k===cfg.niveau}" data-k="${k}">${p.nom}<small>${k==="debutant"?"To get started":k==="joueur"?"Balanced":"Formidable"}</small></button>`).join("")}</div></div>
      <div class="bloc"><span class="lbl">${TR.duree}</span><div class="segment" id="cfg-duree">${["courte","longue"].map(k=>`<button aria-pressed="${k===cfg.duree}" data-k="${k}">${TR[k]}<small>${TR[k+"D"]}</small></button>`).join("")}</div></div>
      <label class="interrupteur" for="cfg-caches"><span>Opponents' winnings hidden<small>Like on the board: everything is revealed at the end</small></span><input type="checkbox" id="cfg-caches" ${cfg.caches?"checked":""}></label>
      <label class="interrupteur" for="cfg-rapide"><span>Faster AI turns<small>Quicker animations while the AI plays</small></span><input type="checkbox" id="cfg-rapide" ${cfg.rapide?"checked":""}></label>
      <button class="bouton piece c-rouge" id="b-go">Start the game</button>
    </div>
  </section>`;
  const maj = () => {
    const advC = PIONS.map((p,i)=>i).filter(i=>i!==cfg.couleur).slice(0, cfg.nb);
    $("#cfg-adv").innerHTML = advC.map((ci,k)=>`<span>${jetonSVG(PIONS[ci].c)}${NOMS_IA[k]}</span>`).join("");
  };
  $$("#cfg-couleurs button").forEach(b => b.onclick = () => { cfg.couleur = +b.dataset.i; $$("#cfg-couleurs button").forEach(x=>x.setAttribute("aria-pressed", x===b)); maj(); });
  $$("#cfg-nb button").forEach(b => b.onclick = () => { cfg.nb = +b.dataset.n; $$("#cfg-nb button").forEach(x=>x.setAttribute("aria-pressed", x===b)); maj(); });
  $$("#cfg-niv button").forEach(b => b.onclick = () => { cfg.niveau = b.dataset.k; $$("#cfg-niv button").forEach(x=>x.setAttribute("aria-pressed", x===b)); });
  $$("#cfg-duree button").forEach(b => b.onclick = () => { cfg.duree = b.dataset.k; $$("#cfg-duree button").forEach(x=>x.setAttribute("aria-pressed", x===b)); });
  $("#b-retour").onclick = ecranAccueil;
  $("#b-go").onclick = () => {
    cfg.nom = $("#cfg-nom").value.trim(); cfg.caches = $("#cfg-caches").checked; cfg.rapide = $("#cfg-rapide").checked;
    store.set("cfgIA", cfg);
    Pub.avantPartie().then(() => demarrer(cfg));
  };
  maj();
}

/* =========================================================================
   Démarrage, ordre de départ
   ========================================================================= */
async function demarrer(cfg){
  window.QLN_EVT && window.QLN_EVT("partie:ia");
  const advC = PIONS.map((p,i)=>i).filter(i=>i!==cfg.couleur).slice(0, cfg.nb);
  const joueurs = [
    {id:"h", nom: cfg.nom || "You", couleur: PIONS[cfg.couleur].c, ia:null},
    ...advC.map((ci,k) => ({id:"ia"+k, nom:NOMS_IA[k], couleur:PIONS[ci].c, ia:cfg.niveau})),
  ].map(j => ({...j, argent:0, pos:"D", prison:0, passe:false, dette:null, arrive:null, horsJeu:false, cartes:0, reussies:0, detail:{cartes:0, encheres:0, cases:0, arrivee:0}}));
  G = { joueurs, ordre:[], idx:0, caches:cfg.caches, rapideIA:cfg.rapide, rapide:false, arrivees:[], deja:new Set(), journal:[], dernier:null, tours:0, courant:null, rnd:Math.random, multi:null, faces:FACES[cfg.duree] || 6 };
  ecranPlateau();
  try{
    await tirerOrdre();
    await boucle();
  }catch(e){ if(!(e instanceof Abandon)) { console.error(e); toast("Unexpected error: "+e.message); } }
}
async function tirerOrdre(){
  // chaque joueur lance le dé ; égalités relancées
  const lancers = {};
  let groupe = [...G.joueurs];
  const classement = [];
  const departager = (liste) => {
    if(liste.length === 1){ classement.push(liste[0]); return; }
    const vals = liste.map(j => { const v = 1+Math.floor(alea()*6); (lancers[j.id] = lancers[j.id] || []).push(v); return {j, v}; });
    const parVal = {}; for(const x of vals) (parVal[x.v] = parVal[x.v] || []).push(x.j);
    Object.keys(parVal).map(Number).sort((a,b)=>b-a).forEach(v => departager(parVal[v]));
  };
  departager(groupe);
  G.ordre = classement.map(j => j.id);
  classement.forEach((j,i) => j.depart = i);
  dessinerPions(); majJoueurs();
  const v = panneau({classe:"c-jaune", titre:"Starting order", corps:`
    <p class="texte-centre" style="font-size:17px">Each player rolls the die. The highest goes first; ties are re-rolled.</p>
    <div class="ordre">${classement.map((j,i)=>`<div class="ordre-l"><span class="rang">${i+1}</span>${jetonSVG(j.couleur)}<span>${esc(j.nom)}${j === humain()?" (you)":""}</span><span class="dee" aria-label="die ${lancers[j.id].join(" then ")}">${lancers[j.id].map(x=>DES[x]).join(" ")}</span></div>`).join("")}</div>
    <p class="regle-or"><b>The richest player wins!</b> Finishing 1st only pays +€100: win cards, bid at auctions.</p>
    <button class="bouton piece c-rouge" id="b-parti">Let's go</button>`});
  $("#b-parti", v).focus();
  await ui(new Promise(r => { $("#b-parti", v).onclick = () => { v.remove(); r(); }; if(G.multi) setTimeout(() => { if(document.body.contains(v)){ v.remove(); r(); } }, 6000 * VITE()); }));
  toast("The richest player wins!\nFinishing 1st = only +€100", 3200);
  journal(null, `Starting order: ${classement.map(j=>j.nom).join(", ")}.`);
}

/* =========================================================================
   Boucle de jeu
   ========================================================================= */
async function boucle(){
  while(true){
    const restants = actifs();
    if(!restants.length) break;
    if(G.tours > 600){ journal(null, "Game stopped: too many turns."); break; }
    // règle du dernier joueur
    if(restants.length === 1 && G.arrivees.length && !G.dernier){
      const d = restants[0];
      G.dernier = {id:d.id, tours:3};
      journal(d, TR.dernier(d.nom));
      if(d === humain()) toast(TR.dernierVous, 4500);
      majHud();
    }
    const j = J(G.ordre[G.idx % G.ordre.length]); G.idx++;
    if(j.arrive || j.horsJeu) continue;
    if(G.dernier && G.dernier.id === j.id && dernierEchu(j)) continue;
    G.tours++;
    await jouerTour(j);
    if(G.dernier && G.dernier.id === j.id && !j.arrive){ G.dernier.tours--; dernierEchu(j); }
  }
  await finPartie();
}
/* dernier en lice : 3 tours (compte identique sur tous les appareils) */
function dernierEchu(j){
  const d = G.dernier; if(!d || j.arrive) return false;
  const echu = d.tours <= 0;
  if(echu && !j.horsJeu){ j.horsJeu = true; journal(j, `${j.nom} did not cross the finish in time: out of the game.`); majJoueurs(); dessinerPions(); }
  return echu;
}

async function jouerTour(j){
  G.courant = j.id; G.rapide = j.ia ? (G.rapideIA || (humain().arrive || humain().horsJeu)) : false;
  if(G.multi && !estLocal(j) && !G.multi.present(j.id)) G.rapide = true;
  majJoueurs(); dessinerPions(); majHud();
  if(j.prison > 0){
    j.prison--;
    journal(j, `${j.nom} waits in jail${j.prison?` (${pluriel(j.prison,"turn")} left)`:" (released next turn)"}.`);
    dock({de:false, msg:`${esc(j.nom)} is in jail`, sous: j.prison ? `${pluriel(j.prison,"turn")} left to wait.` : "Released next turn."});
    majJoueurs();
    if(estLocal(j) && !G.multi) await ui(boutonDock("Continue", "c-noir")); else await attendre(1300);
    finDeTour(j); return;
  }
  if(j.passe){   // case Passe : ce tour est sauté
    j.passe = false;
    journal(j, TR.passeJ(j.nom));
    dock({de:false, msg:esc(TR.passeTour(j.nom))});
    if(estLocal(j) && !G.multi) await ui(boutonDock("Continue", "c-noir")); else await attendre(1300);
    finDeTour(j); return;
  }
  if(!j.arrive && !j.horsJeu){
    const de = await lancer(j);
    const opts = destinations(j.pos, de);
    const choix = G.multi ? opts[Math.max(0, Math.min(opts.length - 1, (await decision("case", j, () => choisirCase(j, opts, de).then(o => opts.indexOf(o)), () => versArrivee(opts), 60000, {opts}))|0))]
      : !j.ia ? await ui(choisirCase(j, opts, de)) : (opts.length === 1 ? opts[0] : choixIA(j, opts));
    if(G.multi && !estLocal(j) && opts.length > 1){ marquerCibles([choix]); await attendre(500); marquerCibles([]); }
    if(j.ia && opts.length > 1) { dock({de, msg:`${esc(j.nom)} chooses a route…`}); marquerCibles(opts); await attendre(900); marquerCibles([]); }
    await deplacer(j, choix.chemin);
    if(choix.id === "A") await arriver(j);
    else await resoudreCase(j);
  }
  finDeTour(j);
}
function finDeTour(j){
  if(j.dette){ j.dette.tours--; if(j.dette.tours <= 0){ journal(j, `${j.nom} has finished paying back ${J(j.dette.vers).nom}.`); j.dette = null; } }
  majJoueurs();
}

/* ---------- Dé ---------- */
async function lancer(j){
  const valeur = 1 + Math.floor(alea()*(G.faces || 6));
  if(G.multi && !estLocal(j)){
    dock({de:true, msg:TM.lance(esc(j.nom))});
    await decision("de", j, null, true, 45000);
  } else if(G.multi){
    dock({de:true, msg:"Your turn", sous: G.dernier && G.dernier.id===j.id ? TR.toursRestants(G.dernier.tours) : "Roll the die to move."});
    await decision("de", j, () => {
      return boutonDock(`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="#1b1400"/><g fill="#ffd84a"><circle cx="8" cy="8" r="1.7"/><circle cx="16" cy="8" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="8" cy="16" r="1.7"/><circle cx="16" cy="16" r="1.7"/></g></svg>` + "Roll the die", "c-jaune").then(() => true); }, true, 45000);
  } else if(j.ia){
    dock({de:true, msg:`${esc(j.nom)} rolls the die…`});
    await attendre(500);
  } else {
    dock({de:true, msg:"Your turn", sous: G.dernier && G.dernier.id===j.id ? TR.toursRestants(G.dernier.tours) : "Roll the die to move."});
    await ui(boutonDock(`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="#1b1400"/><g fill="#ffd84a"><circle cx="8" cy="8" r="1.7"/><circle cx="16" cy="8" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="8" cy="16" r="1.7"/><circle cx="16" cy="16" r="1.7"/></g></svg>` + "Roll the die", "c-jaune"));
  }
  { const ms = (j.ia && G.rapide ? 520 : 1050) * VITE();
    const vol = deSurPlateau(valeur, ms);
    if($("#dock .de")) await ui(lancerDeAnime($("#dock .de"), valeur, ms));
    await ui(vol); }
  dock({de:valeur, msg:`${esc(j.nom)} fait ${valeur}`});
  journal(j, `${j.nom} rolls the die: ${valeur}.`);
  await attendre(350);
  return valeur;
}

/* ---------- Choix de la case ---------- */
function descriptionCase(id){
  if(id === "A"){ const rang = G.arrivees.length+1; return {titre:"Finish", detail:`${ordinal(rang)} · €${BONUS_ARRIVEE[rang-1]>0?"+":"−"}${Math.abs(BONUS_ARRIVEE[rang-1])}`, classe:"c-jaune"}; }
  const n = NOEUDS[id];
  if(n.type === "carte"){ const N = NIVEAUX[n.niv]; return {titre:`${N.nom} card`, detail:`€${N.gain} · ${N.temps<60?N.temps+" s":N.temps/60+" min"}${n.cd?" · CD":""}`, classe:N.classe}; }
  const T = {bonus:["Bonus", `+€${n.montant}`, "c-violet"], malus:["Penalty", `−€${n.montant}`, "c-orange"], prison:["Jail", `bail €${n.montant}`, "c-orange"], passe:["Pass", TR.passe, "c-orange"], retour:["Back to start", "back to the start square", "c-orange"]}[n.type];
  return {titre:T[0], detail:T[1], classe:T[2]};
}
function choisirCase(j, opts, de){
  return new Promise(res => {
    dock({de, msg: opts.length > 1 ? "Where do you place your pawn?" : "Place your pawn", sous: opts.length > 1 ? `${opts.length} possible squares: tap one on the board or choose below.` : "Tap the highlighted square on the board, or the button below."});
    const zone = $("#dock-actions");
    zone.innerHTML = opts.map((o,i)=>{ const d = descriptionCase(o.id); return `<button class="choix-case piece ${d.classe}" data-i="${i}"><span>${opts.length===1?"Move here · ":""}${d.titre}</span><small>${d.detail}</small></button>`; }).join("");
    const choisir = i => { marquerCibles([]); zone.innerHTML = ""; res(opts[i]); };
    $$("button", zone).forEach(b => b.onclick = () => choisir(+b.dataset.i));
    marquerCibles(opts, choisir);
    voirCibles(opts);
  });
}
function voirCibles(opts){
  // petits écrans : fait défiler le tapis pour montrer les cases possibles
  const sc = $("#tapis-scroll"), svg = $("#tapis"); if(!sc || !svg) return;
  sc.closest(".tapis-cadre").scrollIntoView({behavior:"smooth", block:"nearest"});
  if(sc.scrollWidth <= sc.clientWidth) return;
  const xs = opts.map(o => o.id === "A" ? XA + 38 : centre(o.id)[0]);
  const ratio = svg.clientWidth / LARG, milieu = (Math.min(...xs) + Math.max(...xs)) / 2;
  sc.scrollTo({left: milieu*ratio - sc.clientWidth/2, behavior:"smooth"});
}
function valeurCase(j, id, depart){
  const prof = PROFILS[j.ia];
  let v;
  if(id === "A"){
    const rang = G.arrivees.length+1;
    v = BONUS_ARRIVEE[rang-1] + 55 + Math.min(80, G.tours*.6);
  } else {
    const n = NOEUDS[id];
    if(n.type === "carte") v = prof.p[n.niv] * NIVEAUX[n.niv].gain * 1.35;
    else if(n.type === "bonus") v = n.montant;
    else if(n.type === "malus") v = -n.montant;
    else if(n.type === "prison") v = -75;
    else if(n.type === "retour") v = -140;
    else v = -6;
    v += ((DIST[depart] ?? 20) - (DIST[id] ?? 20)) * 4;
  }
  return v + (Math.random()-.5) * prof.alea * 90;
}
function choixIA(j, opts){
  let meilleur = opts[0], best = -Infinity;
  for(const o of opts){ const v = valeurCase(j, o.id, j.pos); if(v > best){ best = v; meilleur = o; } }
  return meilleur;
}
const NS_SVG = "http://www.w3.org/2000/svg";
const reduitMvt = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
function poussiere(j, grosse){
  const svg = $("#tapis"); if(!svg || !G || reduitMvt()) return;
  let fx = $("#fx", svg); if(!fx){ fx = document.createElementNS(NS_SVG, "g"); fx.id = "fx"; fx.setAttribute("pointer-events", "none"); svg.appendChild(fx); }
  const [x, y, s] = positionPion(j), n = grosse ? 9 : 5, pied = y + 21*s;
  for(let i=0;i<n;i++){
    const c = document.createElementNS(NS_SVG, "circle"); c.setAttribute("cx", x + (Math.random()-.5)*10); c.setAttribute("cy", pied); c.setAttribute("r", 2.5 + Math.random()*(grosse?5:3.5));
    c.setAttribute("fill", i%3 ? "rgba(255,244,214,.85)" : "rgba(255,207,58,.9)"); fx.appendChild(c);
    const dir = (i/(n-1) - .5)*2, dx = dir*(18+Math.random()*(grosse?30:16)), dy = -(4 + Math.random()*(grosse?20:10));
    const a = c.animate([{transform:"translate(0,0) scale(.6)", opacity:.95},{transform:`translate(${dx}px,${dy}px) scale(1.5)`, opacity:0}], {duration:420 + Math.random()*200, easing:"ease-out"});
    a.onfinish = () => c.remove();
  }
}
function sauterPion(j, ms, dernier){
  if(reduitMvt()) return;
  const e = $(`#tapis .pion[data-id="${j.id}"]`), c = e && $(".corps-pion", e); if(!c || !c.animate) return;
  c.style.transformBox = "fill-box"; c.style.transformOrigin = "50% 100%";
  c.animate([{transform:"translateY(0) scale(1,1)"},{transform:"translateY(-30px) scale(.88,1.16)", offset:.45},{transform:"translateY(0) scale(1.24,.78)", offset:.82},{transform:"translateY(0) scale(1,1)"}], {duration:ms, easing:"ease-out"});
  setTimeout(() => { poussiere(j, dernier); if(Son.atterrit) Son.atterrit(dernier); }, ms*.8);
}
async function deplacer(j, chemin){
  const ms = j.ia ? 210 : 230;
  for(let k=0;k<chemin.length;k++){
    const id = chemin[k];
    j.pos = id;
    if(id === "A") break;
    dessinerPions(); centrerSur(j); if(Son.saut) Son.saut(); else Son.tap();
    sauterPion(j, ms, k === chemin.length-1);
    await attendre(ms);
  }
}

/* ---------- Effets des cases ---------- */
async function resoudreCase(j){
  const n = NOEUDS[j.pos];
  const d = descriptionCase(j.pos);
  if(n.type === "carte") return await serieCartes(j, n.niv);
  if(n.type === "bonus"){ crediter(j, n.montant, "Bonus"); Son.piece(); await annonce(j, d, `${j.nom} receives €${n.montant} from the bank.`); return false; }
  if(n.type === "malus"){ debiter(j, n.montant, "Penalty"); Son.ko(); await annonce(j, d, `${j.nom} pays €${n.montant} to the bank.`); return false; }
  if(n.type === "passe"){ j.passe = true; journal(j, `${j.nom} lands on Pass.`); await annonce(j, d, TR.passeTxt(j.nom)); return false; }
  if(n.type === "retour"){ Son.ko(); await annonce(j, d, `${j.nom} goes back to the starting line.`); j.pos = "D"; dessinerPions(); journal(j, `${j.nom} goes back to the start.`); return false; }
  if(n.type === "prison"){ await prison(j); return false; }
  return false;
}
async function annonce(j, d, texte){
  dock({de:false, msg:texte});
  const v = panneau({classe:d.classe, titre:d.titre, valeur:"", corps:`<div class="case-speciale piece ${d.classe}">${d.titre}<small>${d.detail}</small></div><p class="texte-centre">${esc(texte)}</p><button class="bouton piece c-jaune" id="b-ok">Continue</button>`});
  await fermeture(v, j.ia || (G.multi && !estLocal(j)) ? 2200 : 0);
}
function fermeture(v, auto=0){
  return ui(new Promise(r => {
    const b = $("#b-ok", v); b.focus();
    let t = null;
    const fin = () => { clearTimeout(t); v.remove(); r(); };
    b.onclick = fin;
    if(!auto && G && G.multi) auto = 4500;   // multijoueur : on ne bloque pas la partie sur un bouton
    if(auto){ t = setTimeout(fin, auto * (G && G.rapide ? .5 : 1) * VITE()); }
  }));
}

/* ---------- Argent ---------- */
function crediter(j, montant, motif, cat = "cases"){
  if(montant <= 0) return;
  if(j.dette){
    const g = J(j.dette.vers);
    g.argent += montant; g.detail.cases += montant;
    journal(j, `${motif}: ${euros(montant)} for ${j.nom}, passed on to ${g.nom} (bail).`);
  } else {
    j.argent += montant; j.detail[cat] += montant;
    journal(j, `${motif} : ${j.nom} encaisse ${euros(montant)}.`);
  }
  if(estLocal(j) && !j.dette) envolerGain(montant, $(`.joueur[data-id="${j.id}"]`));
  majJoueurs();
}
function debiter(j, montant, motif, cat = "cases"){
  j.argent -= montant; j.detail[cat] -= montant;
  journal(j, `${motif} : ${j.nom} verse ${euros(montant)}.`);
  if(estLocal(j)) envolerGain(-montant, $(`.joueur[data-id="${j.id}"]`));
  majJoueurs();
}

/* ---------- Série (R1) : 2 cartes au plus par case, on peut s'arrêter après une réussite ---------- */
async function serieCartes(j, niv){
  const nomC = NIVEAUX[niv].nom.toLowerCase();
  for(let k = 1; k <= MAX_SERIE; k++){
    const reussi = await jouerCarte(j, niv);
    if(!reussi || k === MAX_SERIE || j.horsJeu) return false;
    let encore;
    if(G.multi){
      if(!estLocal(j)) dock({de:false, msg:esc(TR.choisitSerie(j.nom))});
      encore = await decision("serie", j, () => choixSerie(j, niv), false, 30000);
    } else if(j.ia){
      const p = PROFILS[j.ia].p[niv];
      encore = p >= .6 || Math.random() < p * .8;
      dock({de:false, msg:esc(TR.choisitSerie(j.nom))}); await attendre(700);
    } else encore = await ui(choixSerie(j, niv));
    if(encore !== true){ journal(j, TR.sArrete(j.nom)); return false; }
    journal(j, TR.pioche2(j.nom, nomC));
  }
  return false;
}
function choixSerie(j, niv){
  return new Promise(res => {
    const N = NIVEAUX[niv];
    dock({de:false, msg:TR.serieT});
    const v = panneau({classe:N.classe, titre:TR.serieT, valeur:`€${N.gain}`, corps:`<p class="texte-centre">${esc(TR.serieQ(N.nom.toLowerCase(), N.gain))}</p>
      <div class="duo"><button class="bouton piece c-noir" id="sr-non">${TR.arreter}</button><button class="bouton piece c-vert" id="sr-oui">${TR.piocher}</button></div>`});
    $("#sr-oui", v).onclick = () => { v.remove(); res(true); };
    $("#sr-non", v).onclick = () => { v.remove(); res(false); };
  });
}

/* ---------- Cartes (renvoie vrai seulement si le joueur a trouvé lui-même) ---------- */
async function jouerCarte(j, niv){
  if(G.multi) return jouerCarteMulti(j, niv);
  const c = tirerCarte(niv, Math.random, G.deja), N = NIVEAUX[niv];
  j.cartes++;
  dock({de:false, msg: j.ia ? `${esc(j.nom)} draws ${/^[aeiou]/i.test(N.nom) ? "an" : "a"} ${N.nom.toLowerCase()} card` : `${N.nom} card: €${N.gain}`});
  let resultat;
  if(j.ia) resultat = await ui(carteIA(j, c));
  else resultat = await ui(carteHumaine(j, c));
  if(!j.ia && typeof Progres !== "undefined") Progres.carte({niv, reussi:!!resultat.mot, nbTrouves:resultat.mot ? 1 : 0, nbSol:2});

  if(resultat.mot){
    j.reussies++;
    crediter(j, N.gain, `${N.nom} card`, "cartes");
    Son.ok();
    await faceB(c, {titre:`${j.nom} wins the card`, valeur:"+"+euros(N.gain), trouve:resultat.mot, auto: j.ia ? 2600 : 0});
    return true;
  }
  if(resultat.proposition){ // mauvaise réponse (R5) : c'est un échec, mais les autres peuvent encore enchérir
    Son.echec();
    journal(j, `${j.nom} suggests ${resultat.proposition}: refused.`);
    toast(TR.refusee(resultat.proposition), 3200);
  } else journal(j, `${j.nom} finds nothing.`);
  // enchères
  const offres = offresIA(j, c);
  if(resultat.offreHumaine) offres.push({...resultat.offreHumaine, joueur:humain()});
  if(!offres.length){
    Son.echec();
    await faceB(c, {titre: resultat.proposition ? TR.refuseeT : "Nobody finds it", valeur:"€0", texte:TR.aucune, auto: j.ia ? 2400 : 0, echec:true});
    return false;
  }
  const max = Math.max(...offres.map(o=>o.montant));
  const meilleures = offres.filter(o=>o.montant===max);
  let gagnante = null;
  if(j.ia){ gagnante = hasard(meilleures); }
  else { gagnante = await ui(choisirOffre(j, c, offres)); }
  if(!gagnante){
    journal(j, `${j.nom} refuses the bids.`);
    await faceB(c, {titre:"Bids refused", valeur:"€0", texte:`${j.nom} waits for their next turn.`, auto:0, echec:true});
    return false;
  }
  const w = gagnante.joueur;
  journal(w, `${w.nom} wins the auction with ${gagnante.mot.toUpperCase()} for ${euros(gagnante.montant)}.`);
  crediter(w, N.gain, "Card buyout", "cartes");
  debiter(w, gagnante.montant, "Auction", "encheres");
  crediter(j, gagnante.montant, "Auction income", "encheres");
  Son.piece();
  await faceB(c, {titre:`Auction: ${w.nom}`, valeur:euros(gagnante.montant), trouve:gagnante.mot,
    texte:TR.enchFin(w.nom, euros(N.gain), euros(gagnante.montant), j.nom), auto: (j.ia && w.ia) ? 3000 : 0});
  return false; // R7 : le joueur en échec encaisse l'offre mais son tour s'arrête
}
function offresIA(j, c){
  const N = NIVEAUX[c.niv], offres = [];
  for(const a of actifs()){
    if(a === j || !a.ia) continue;
    const prof = PROFILS[a.ia];
    if(Math.random() < prof.p[c.niv] * .85){
      let m = round5(N.gain * (.25 + Math.random()*.45));
      m = Math.min(m, N.gain - 5, Math.floor(Math.max(0, a.argent)/5)*5);
      if(m >= 5) offres.push({joueur:a, montant:m, mot:hasard(solutionsDe(c))});
    }
  }
  return offres;
}

/* Carte jouée par l'humain : une seule proposition */
function carteHumaine(j, c){
  return new Promise(res => {
    const N = NIVEAUX[c.niv], n = norm(c.origine).length;
    const v = document.createElement("div"); v.className = "voile";
    v.innerHTML = `<div class="panneau-jeu" role="dialog" aria-modal="true" aria-label="Card ${N.nom}" style="--tw:${largeurTuile(n, 52, Math.min(innerWidth,560)-72)}px">
      ${carteHTML(c, {chrono:true, indic:"One attempt only: check before you submit."})}
      <div id="compo-p"><div class="reponse" id="reponse"></div><div class="message" id="msg-p" role="status"></div><div class="reserve"></div></div>
      <div class="cmd-p">
        <button class="rond piece c-noir" id="p-eff" aria-label="Erase">${ICO.effacer}</button>
        <button class="rond piece c-noir" id="p-mel" aria-label="Shuffle">${ICO.melanger}</button>
        <button class="bouton piece c-jaune" id="p-ok">Submit</button>
        <button class="bouton petit piece c-noir" id="p-seche">I give up</button>
      </div></div>`;
    document.body.appendChild(v);
    const msg = (t, cls="") => { const m = $("#msg-p", v); m.textContent = t; m.className = "message "+cls; };
    const duree = N.temps*1000, t0 = performance.now(); let fini = false, raf = null, dernier = 99;
    const terminer = r => { if(fini) return; fini = true; cancelAnimationFrame(raf); composeurActif = null; v.remove(); res(r); };
    const proposer = () => {
      if(!compo.complet){ msg(`Use all ${compo.taille} letters.`, "ko"); compo.marquer("erreur"); Son.ko(); return; }
      const prop = compo.mot;
      if(prop === norm(c.origine)){ msg("That is the card's own word. Find another one.", "ko"); compo.marquer("erreur"); setTimeout(()=>compo.vider(), 600); return; }
      terminer({proposition:prop, mot:chercherMot(c, prop) || null});
    };
    const compo = Composeur($("#compo-p", v), c, { onValider: proposer, onChange: () => msg("") });
    $("#p-eff", v).onclick = () => compo.effacer();
    $("#p-mel", v).onclick = () => compo.melanger();
    $("#p-ok", v).onclick = proposer;
    $("#p-seche", v).onclick = () => terminer({proposition:null});
    (function tick(){
      if(fini) return;
      if(!document.body.contains(v)){ fini = true; return; }   // (fermée de l'extérieur : multijoueur, délai dépassé)
      if(!G){ terminer({proposition:null}); return; }
      const reste = Math.max(0, duree - (performance.now()-t0));
      majChrono(reste, duree);
      const s = Math.ceil(reste/1000); if(s<=10 && s!==dernier && s>0){ dernier = s; Son.tic(s); }
      if(reste <= 0){
        if(compo.complet && compo.mot !== norm(c.origine)) return proposer();
        return terminer({proposition:null});
      }
      raf = requestAnimationFrame(tick);
    })();
  });
}

/* Carte jouée par une IA : l'humain voit la carte et peut préparer une enchère */
function carteIA(j, c){
  return new Promise(res => {
    const N = NIVEAUX[c.niv], n = norm(c.origine).length, h = humain();
    const peutEncherir = !h.arrive && !h.horsJeu;
    const prof = PROFILS[j.ia];
    const reflexion = ({v:5,b:7,r:9,n:11}[c.niv]) * 1000 * prof.reflexion * (G.rapide ? .55 : 1);
    const reussit = Math.random() < prof.p[c.niv];
    const v = document.createElement("div"); v.className = "voile";
    v.innerHTML = `<div class="panneau-jeu" role="dialog" aria-modal="true" aria-label="${esc(j.nom)}'s card" style="--tw:${largeurTuile(n, 52, Math.min(innerWidth,560)-72)}px">
      <div class="bandeau-ia">${jetonSVG(j.couleur)}<span id="ia-etat">${esc(j.nom)} is thinking…</span></div>
      ${carteHTML(c, {chrono:true, consigne:`${esc(j.nom)}'s card`, indic: peutEncherir ? "Prepare an answer: if the AI gives up, you can bid." : ""})}
      ${peutEncherir ? `<div id="compo-p"><div class="reponse" id="reponse"></div><div class="message" id="msg-p" role="status"></div><div class="reserve"></div></div>
      <div class="cmd-p" id="cmd-ia"><button class="rond piece c-noir" id="p-eff" aria-label="Erase">${ICO.effacer}</button><button class="rond piece c-noir" id="p-mel" aria-label="Shuffle">${ICO.melanger}</button><span></span><span></span></div>
      <div class="encheres" id="zone-ench" hidden></div>` : `<div class="message" id="msg-p"></div>`}
    </div>`;
    document.body.appendChild(v);
    const msg = (t, cls="") => { const m = $("#msg-p", v); if(m){ m.textContent = t; m.className = "message "+cls; } };
    let compo = null, fini = false, raf = null;
    const terminer = r => { if(fini) return; fini = true; cancelAnimationFrame(raf); composeurActif = null; v.remove(); res(r); };
    if(peutEncherir){
      compo = Composeur($("#compo-p", v), c, { onChange: () => msg("") });
      $("#p-eff", v).onclick = () => compo.effacer();
      $("#p-mel", v).onclick = () => compo.melanger();
    }
    const t0 = performance.now();
    (function tick(){
      if(fini) return;
      if(!G){ terminer({}); return; }
      const reste = Math.max(0, reflexion - (performance.now()-t0));
      majChrono(reste * (N.temps*1000/reflexion), N.temps*1000);
      if(reste > 0){ raf = requestAnimationFrame(tick); return; }
      // l'IA donne sa réponse
      if(reussit){
        const mot = hasard(solutionsDe(c));
        $("#ia-etat", v).textContent = `${j.nom} propose ${mot.toUpperCase()}`;
        msg(`${j.nom} found ${mot.toUpperCase()}.`, "ok");
        if(compo) compo.bloquer(true);
        setTimeout(() => terminer({mot}), G && G.rapide ? 700 : 1400);
        return;
      }
      $("#ia-etat", v).textContent = `${j.nom} gives up!`;
      if(!peutEncherir){ msg(`${j.nom} didn't find it.`, "ko"); setTimeout(() => terminer({}), 1000); return; }
      // phase d'enchère pour l'humain
      phaseEnchere(v, c, compo, terminer, msg);
    })();
  });
}
function phaseEnchere(v, c, compo, terminer, msg){
  const N = NIVEAUX[c.niv], h = humain();
  const maxi = Math.min(N.gain - 5, Math.floor(Math.max(0, h.argent)/5)*5);
  const zone = $("#zone-ench", v); zone.hidden = false;
  $("#cmd-ia", v).hidden = false;
  if(maxi < 5){
    zone.innerHTML = `<p class="texte-centre">Not enough money to bid (minimum €5).</p><button class="bouton piece c-noir" id="e-non">Continue</button>`;
    $("#e-non", v).onclick = () => terminer({});
    return;
  }
  let montant = Math.min(maxi, round5(N.gain*.4));
  const duree = 30000, t0 = performance.now();
  zone.innerHTML = `<h3 style="margin:0">Bid on the card (€${N.gain})</h3>
    <p style="margin:0; font-size:15px">Build a solution and offer an amount below the card's value. The best offer wins.</p>
    <div class="pas"><button class="rond piece c-noir" id="e-moins" aria-label="Decrease">−</button><output id="e-val" aria-live="polite">€${montant}</output><button class="rond piece c-noir" id="e-plus" aria-label="Increase">+</button></div>
    <div class="duo"><button class="bouton piece c-noir" id="e-non">Pass</button><button class="bouton piece c-vert" id="e-oui">Bid</button></div>`;
  const maj = () => $("#e-val", v).textContent = "€" + montant;
  $("#e-moins", v).onclick = () => { montant = Math.max(5, montant-5); maj(); };
  $("#e-plus", v).onclick = () => { montant = Math.min(maxi, montant+5); maj(); };
  $("#e-non", v).onclick = () => terminer({});
  const encherir = () => {
    if(!compo.complet){ msg("Build your solution first.", "ko"); compo.marquer("erreur"); return; }
    const mot = chercherMot(c, compo.mot);
    if(!mot){ msg(`${compo.mot} is not a valid solution.`, "ko"); compo.marquer("erreur"); setTimeout(()=>compo.vider(), 600); return; }
    terminer({offreHumaine:{mot, montant}});
  };
  $("#e-oui", v).onclick = encherir;
  compo.activer();
  // Entrée valide l'enchère
  composeurActif.valider = encherir;
  msg("Your move: 30 seconds to bid.", "info");
  let fini = false;
  (function tick(){
    if(!document.body.contains(v) || fini) return;
    const reste = Math.max(0, duree - (performance.now()-t0));
    majChrono(reste, duree);
    if(reste <= 0){ fini = true; return terminer({}); }
    requestAnimationFrame(tick);
  })();
}
function choisirOffre(j, c, offres){
  return new Promise(res => {
    const N = NIVEAUX[c.niv];
    offres.sort((a,b)=>b.montant-a.montant);
    const max = offres[0].montant;
    const v = panneau({classe:N.classe, titre:"Auction time!", valeur:`€${N.gain}`, corps:`
      <p class="texte-centre">${TR.offreTxt}</p>
      <div class="offres">${offres.map((o,i)=>`<div class="offre"><span style="display:flex;gap:8px;align-items:center">${jetonSVG(o.joueur.couleur)}${esc(o.joueur.nom)}</span><b>€${o.montant}</b></div>`).join("")}</div>
      <div class="duo">${offres.filter(o=>o.montant===max).map((o,i)=>`<button class="bouton piece c-vert" data-i="${offres.indexOf(o)}">Accept ${esc(o.joueur.nom)}</button>`).join("")}<button class="bouton piece c-noir" id="o-non">Decline</button></div>`});
    $$("[data-i]", v).forEach(b => b.onclick = () => { v.remove(); res(offres[+b.dataset.i]); });
    $("#o-non", v).onclick = () => { v.remove(); res(null); };
  });
}
/* ---------- Multijoueur : carte d'un joueur, enchères des autres ---------- */
const maxiEnchere = (a, c) => Math.min(NIVEAUX[c.niv].gain - 5, Math.floor(Math.max(0, a.argent)/5)*5);
async function jouerCarteMulti(j, niv){
  const c = tirerCarte(niv, alea, G.deja), N = NIVEAUX[niv];
  j.cartes++;
  dock({de:false, msg: !estLocal(j) ? `${esc(j.nom)} draws ${/^[aeiou]/i.test(N.nom) ? "an" : "a"} ${N.nom.toLowerCase()} card` : `${N.nom} card: €${N.gain}`});
  const vue = estLocal(j) ? null : vueCarte(j, c);
  const r = await decision("carte", j, () => carteHumaine(j, c), {proposition:null}, (N.temps + 25)*1000, {c});
  const prop = r && typeof r.proposition === "string" ? r.proposition.slice(0, 20) : null;
  const mot = prop ? (chercherMot(c, prop) || null) : null;
  if(estLocal(j) && !G.rattrape && typeof Progres !== "undefined") Progres.carte({niv, reussi:!!mot, nbTrouves:mot ? 1 : 0, nbSol:2});
  if(mot){
    if(vue) vue.fermer();
    j.reussies++;
    crediter(j, N.gain, `${N.nom} card`, "cartes");
    Son.ok();
    await faceB(c, {titre:`${j.nom} wins the card`, valeur:"+"+euros(N.gain), trouve:mot, auto: estLocal(j) ? 0 : 2600});
    return true;
  }
  if(prop){ Son.echec(); journal(j, `${j.nom} suggests ${prop}: rejected.`); if(!G.rattrape) toast(TR.refusee(prop), 3200); }   // (R5 : les enchères restent possibles)
  else journal(j, `${j.nom} finds nothing.`);
  // enchères : chaque joueur encore en course qui peut miser au moins €5 fait une offre (ou passe), en même temps
  const encherisseurs = actifs().filter(a => a !== j && maxiEnchere(a, c) >= 5);
  if(vue) vue.seche(encherisseurs.includes(humain()));
  if(estLocal(j) && encherisseurs.length) dock({de:false, msg:TM.enchOuvertes});
  const brutes = await Promise.all(encherisseurs.map(a => decision("ench", a, () => vue.encherir(), null, 50000, {c, maxi:maxiEnchere(a, c)})));
  if(vue) vue.fermer();
  // offres vérifiées de la même façon sur chaque appareil ; triées (montant, puis ordre du tour) pour que tous voient la même liste
  const offres = [];
  encherisseurs.forEach((a, i) => {
    const o = brutes[i]; if(!o || typeof o.mot !== "string") return;
    const m = Number(o.montant), w = chercherMot(c, norm(o.mot));
    if(w && Number.isInteger(m) && m >= 5 && m % 5 === 0 && m <= maxiEnchere(a, c)) offres.push({joueur:a, montant:m, mot:w});
  });
  offres.sort((a, b) => b.montant - a.montant);
  if(!offres.length){
    Son.echec();
    await faceB(c, {titre: prop ? TR.refuseeT : "Nobody finds it", valeur:"€0", texte:TR.aucune, auto: 2400, echec:true});
    return false;
  }
  const iMax = 0;
  const choixI = await decision("offre", j, () => choisirOffre(j, c, offres).then(o => o ? offres.indexOf(o) : -1), iMax, 60000, {offres});
  const gagnante = Number.isInteger(choixI) && choixI >= 0 && choixI < offres.length && offres[choixI].montant === offres[0].montant ? offres[choixI] : null;
  if(!gagnante){
    journal(j, `${j.nom} refuses the bids.`);
    await faceB(c, {titre:"Bids refused", valeur:"€0", texte:`${j.nom} waits for their next turn.`, auto: estLocal(j) ? 0 : 2400, echec:true});
    return false;
  }
  const w = gagnante.joueur;
  journal(w, `${w.nom} wins the auction with ${gagnante.mot.toUpperCase()} for ${euros(gagnante.montant)}.`);
  crediter(w, N.gain, "Card buyout", "cartes");
  debiter(w, gagnante.montant, "Auction", "encheres");
  crediter(j, gagnante.montant, "Auction income", "encheres");
  Son.piece();
  await faceB(c, {titre:`Auction: ${w.nom}`, valeur:euros(gagnante.montant), trouve:gagnante.mot,
    texte:TR.enchFin(w.nom, euros(N.gain), euros(gagnante.montant), j.nom), auto: 0});
  return false;
}
/* la carte d'un autre joueur, vue d'ici : on prépare une réponse, puis on enchérit s'il sèche */
function vueCarte(j, c){
  const N = NIVEAUX[c.niv], n = norm(c.origine).length, h = humain();
  const peut = !h.arrive && !h.horsJeu && maxiEnchere(h, c) >= 5;
  const v = document.createElement("div"); v.className = "voile";
  v.innerHTML = `<div class="panneau-jeu" role="dialog" aria-modal="true" aria-label="${esc(j.nom)}'s card" style="--tw:${largeurTuile(n, 52, Math.min(innerWidth,560)-72)}px">
    <div class="bandeau-ia">${jetonSVG(j.couleur)}<span id="ia-etat">${TM.joue(esc(j.nom))}</span></div>
    ${carteHTML(c, {chrono:true, consigne:`${esc(j.nom)}'s card`, indic: peut ? TM.prepare : ""})}
    ${peut ? `<div id="compo-p"><div class="reponse" id="reponse"></div><div class="message" id="msg-p" role="status"></div><div class="reserve"></div></div>
    <div class="cmd-p" id="cmd-ia"><button class="rond piece c-noir" id="p-eff" aria-label="Erase">${ICO.effacer}</button><button class="rond piece c-noir" id="p-mel" aria-label="Shuffle">${ICO.melanger}</button><span></span><span></span></div>
    <div class="encheres" id="zone-ench" hidden></div>` : `<div class="message" id="msg-p"></div>`}
  </div>`;
  document.body.appendChild(v);
  const msg = (t, cls="") => { const m = $("#msg-p", v); if(m){ m.textContent = t; m.className = "message "+cls; } };
  let compo = null, fini = false, phase = "carte";
  if(peut){
    compo = Composeur($("#compo-p", v), c, { onChange: () => msg("") });
    $("#p-eff", v).onclick = () => compo.effacer();
    $("#p-mel", v).onclick = () => compo.melanger();
  }
  const duree = N.temps*1000, t0 = performance.now();
  (function tick(){
    if(fini || !document.body.contains(v)) return;
    if(phase === "carte") majChrono(Math.max(0, duree - (performance.now()-t0)), duree);
    requestAnimationFrame(tick);
  })();
  return {
    fermer(){ if(fini) return; fini = true; if(composeurActif && compo && composeurActif === compo) composeurActif = null; v.remove(); },
    seche(moiAussi){ phase = "ench"; const e = $("#ia-etat", v); if(e) e.textContent = TM.seche(j.nom); if(!moiAussi) msg(TM.enchOuvertes, "info"); },
    encherir(){
      return new Promise(res => {
        if(fini || !peut) return res(null);
        phaseEnchere(v, c, compo, r => {
          const o = r && r.offreHumaine ? {mot:r.offreHumaine.mot, montant:r.offreHumaine.montant} : null;
          const z = $("#zone-ench", v); if(z) z.innerHTML = `<p class="texte-centre">${o ? TM.offreEnvoyee : TM.enchFermees}</p>`;
          if(compo) compo.bloquer(true);
          res(o);
        }, msg);
      });
    },
  };
}

/* ---------- Multijoueur : prison (garant demandé aux autres joueurs) ---------- */
async function prisonMulti(j){
  Son.ko();
  journal(j, `${j.nom} tombe en prison.`);
  dock({de:false, msg:`${esc(j.nom)} is in jail`, sous:`Bail: €${CAUTION}`});
  let sansAide = false;
  while(true){
    if(!estLocal(j)) dock({de:false, msg:TM.prisonChoix(esc(j.nom)), sous:`Caution : €${CAUTION}`});
    const choix = await decision("prison", j, () => choixPrison(j, sansAide), () => "attendre", 60000, {sansAide});
    if(choix === "payer" && j.argent >= CAUTION){
      debiter(j, CAUTION, "Bail");
      await annonce(j, {titre:"Bail paid", detail:`−€${CAUTION}`, classe:"c-orange"}, estLocal(j) ? "You will be back in the game on your next turn." : `${j.nom} pays bail and will be back next turn.`);
      return;
    }
    if(choix === "aide" && !sansAide){
      const cands = actifs().filter(a => a !== j && a.argent >= CAUTION);
      if(estLocal(j) && cands.length) dock({de:false, msg:TM.garantAttente});
      const reps = await Promise.all(cands.map(a => decision("garant", a, () => demandeGarant(j), false, 30000, {prisonnier:j})));
      const oui = cands.filter((a, i) => reps[i] === true);
      if(oui.length){
        const g = oui.length > 1 ? oui[Math.floor(alea()*oui.length)] : oui[0];
        if(oui.length > 1) journal(null, "Several guarantors: the die picks "+g.nom+".");
        g.argent -= CAUTION; g.detail.cases -= CAUTION; j.dette = {vers:g.id, tours:2};
        journal(g, `${g.nom} pays ${j.nom}'s bail and will collect their winnings for 2 turns.`);
        majJoueurs();
        await annonce(j, {titre:"Released", detail:`thanks to ${g.nom}`, classe:"c-vert"}, `${g.nom} pays the bail. ${j.nom} will pass all their winnings to them for the next 2 turns.`);
        return;
      }
      if(estLocal(j)) toast(TM.personneGarant);
      sansAide = true; continue;
    }
    j.prison = 2; journal(j, `${j.nom} choisit d'attendre 2 tours.`); majJoueurs();
    return;
  }
}

async function faceB(c, {titre, valeur, trouve, texte, auto=0, echec=false}){
  const N = NIVEAUX[c.niv], tn = trouve ? norm(trouve) : null;
  const v = panneau({classe: echec ? "c-noir" : N.classe, titre, valeur, corps:`
    <h3>Side B · ${esc(norm(c.origine))}</h3>
    <div class="solutions">${c.mots.map(w=>{ const n = norm(w); return `<button class="sol ${n===norm(c.origine)?"origine":(n===tn?"trouve":"")}" data-def="${esc(w)}">${esc(w)}</button>`; }).join("")}</div>
    <p style="font-size:13.5px; color:var(--gris)">Tap a word to see its definition.</p>
    ${texte ? `<p class="texte-centre">${esc(texte)}</p>` : ""}
    <button class="bouton piece c-jaune" id="b-ok">Continue</button>`});
  await fermeture(v, auto);
}

/* ---------- Prison ---------- */
async function prison(j){
  if(G.multi) return prisonMulti(j);
  Son.ko();
  journal(j, `${j.nom} tombe en prison.`);
  dock({de:false, msg:`${esc(j.nom)} is in jail`, sous:`Bail: €${CAUTION}`});
  const garantsIA = () => actifs().filter(a => a !== j && a.ia && a.argent >= CAUTION + 30 && Math.random() < PROFILS[a.ia].garant);
  const payerGarant = async g => {
    g.argent -= CAUTION; g.detail.cases -= CAUTION; j.dette = {vers:g.id, tours:2};
    journal(g, `${g.nom} pays ${j.nom}'s bail and will collect their winnings for 2 turns.`);
    majJoueurs();
    await annonce(j, {titre:"Released", detail:`thanks to ${g.nom}`, classe:"c-vert"}, `${g.nom} pays the bail. ${j.nom} will pass all their winnings to them for the next 2 turns.`);
  };
  if(!j.ia){
    let sansAide = false;
    while(true){
      const choix = await ui(choixPrison(j, sansAide));
      if(choix === "payer"){ debiter(j, CAUTION, "Bail"); await annonce(j, {titre:"Bail paid", detail:`−€${CAUTION}`, classe:"c-orange"}, "You will be back in the game on your next turn."); return; }
      if(choix === "attendre"){ j.prison = 2; journal(j, `${j.nom} choisit d'attendre 2 tours.`); majJoueurs(); return; }
      const g = garantsIA();
      if(g.length){ await payerGarant(g.length>1 ? hasard(g) : g[0]); return; }
      toast("No player agrees to pay your bail."); sansAide = true;
    }
  }
  // IA
  if(j.argent >= CAUTION + 40){ debiter(j, CAUTION, "Bail"); await annonce(j, {titre:"Bail paid", detail:`−€${CAUTION}`, classe:"c-orange"}, `${j.nom} pays bail and will be back next turn.`); return; }
  const cands = garantsIA();
  const h = humain();
  if(!h.arrive && !h.horsJeu && h.argent >= CAUTION){
    if(await ui(demandeGarant(j))) cands.push(h);
  }
  if(cands.length){ const g = cands.length>1 ? hasard(cands) : cands[0]; if(cands.length>1) journal(null, "Several guarantors: the die picks "+g.nom+"."); await payerGarant(g); return; }
  j.prison = 2; journal(j, `${j.nom} stays in jail for 2 turns.`); majJoueurs();
  await annonce(j, {titre:"Jail", detail:"2 turns to wait", classe:"c-orange"}, `${j.nom} will wait 2 turns.`);
}
function choixPrison(j, sansAide){
  return new Promise(res => {
    const peutPayer = j.argent >= CAUTION;
    const v = panneau({classe:"c-orange", titre:"Jail", valeur:`€${CAUTION}`, corps:`
      <p class="texte-centre">Three options:</p>
      <button class="choix-case piece c-orange" id="pr-payer" ${peutPayer?"":"disabled"}><span>Pay the bail</span><small>${peutPayer?`−€${CAUTION}, you play again next turn`:"not enough money"}</small></button>
      <button class="choix-case piece c-violet" id="pr-aide" ${sansAide?"disabled":""}><span>Ask for a guarantor</span><small>${sansAide?"nobody agreed":"they collect your next 2 turns of winnings"}</small></button>
      <button class="choix-case piece c-noir" id="pr-att"><span>Wait</span><small>2 turns without playing</small></button>`});
    $("#pr-payer", v).onclick = () => { v.remove(); res("payer"); };
    $("#pr-aide", v).onclick = () => { v.remove(); res("aide"); };
    $("#pr-att", v).onclick = () => { v.remove(); res("attendre"); };
  });
}
function demandeGarant(j){
  return new Promise(res => {
    const v = panneau({classe:"c-orange", titre:`${j.nom} en prison`, valeur:`€${CAUTION}`, corps:`
      <p class="texte-centre">${esc(j.nom)} asks you to pay their bail of €${CAUTION}. In return you collect all their winnings for their next 2 turns.</p>
      <div class="duo"><button class="bouton piece c-noir" id="g-non">Decline</button><button class="bouton piece c-vert" id="g-oui">Pay €${CAUTION}</button></div>`});
    $("#g-oui", v).onclick = () => { v.remove(); res(true); };
    $("#g-non", v).onclick = () => { v.remove(); res(false); };
  });
}

/* ---------- Arrivée et fin ---------- */
async function arriver(j){
  const rang = G.arrivees.length + 1, bonus = BONUS_ARRIVEE[rang-1];
  j.arrive = rang; G.arrivees.push(j.id);
  dessinerPions();
  if(bonus > 0) crediter(j, bonus, `Finish ${ordinal(rang)}`, "arrivee"); else debiter(j, -bonus, `Finish ${ordinal(rang)}`, "arrivee");
  journal(j, `${j.nom} crosses the finish in ${ordinal(rang)} place.`);
  Son.fin(); if(estLocal(j)) confettis(110);
  await annonce(j, {titre:"Finish", detail:`${ordinal(rang)} · €${bonus>0?"+":"−"}${Math.abs(bonus)}`, classe:"c-jaune"},
    !estLocal(j) ? `${j.nom} finishes in ${ordinal(rang)} place.` : `You finish in ${ordinal(rang)} place. ${actifs().length ? "The other players finish the game." : ""}`);
}
/* détail des gains d'un joueur : d'où vient son argent (montre que l'arrivée n'est qu'un bonus) */
const LBL_DETAIL = {cartes:"Cards", encheres:"Auctions", cases:"Squares", arrivee:"Finish"};
function detailPodium(x){
  const d = x.detail || {};
  return `<span class="podium-detail">${Object.keys(LBL_DETAIL).map(k => { const v = d[k] || 0; return `<i class="${v > 0 ? "plus" : v < 0 ? "moins" : "zero"} pd-${k}">${LBL_DETAIL[k]} <em>${v > 0 ? "+" : v < 0 ? "−" : ""}${euros(Math.abs(v))}</em></i>`; }).join("")}</span>`;
}
async function finPartie(){
  G.courant = null;
  // R9 : à argent égal, le mieux classé à l'arrivée l'emporte
  const classes = [...G.joueurs].sort((a,b) => (a.horsJeu - b.horsJeu) || (b.argent - a.argent) || ((a.arrive || 99) - (b.arrive || 99)));
  const gagnant = classes.find(x=>!x.horsJeu);
  const h = humain();
  const victoire = gagnant === h;
  if(victoire && !G.multi) store.set("victoiresIA", store.get("victoiresIA", 0) + 1);
  const g = G; G = null;
  if(g.multi) return finMulti(g, classes, gagnant, victoire);
  app.classList.remove("large");
  setTimeout(() => { if(typeof Progres !== "undefined") Progres.finPartie({mode:"ia", victoire}); }, 0);
  app.innerHTML = `
  <section class="ecran">
    <h1 class="titre-ecran">${victoire ? "Victory!" : `${esc(gagnant ? gagnant.nom : "Nobody")} wins`}</h1>
    <p class="sous-titre">The richest player wins, not the first to finish. Here are the revealed winnings.</p>
    <div class="podium">${classes.map((x,i)=>`<div class="podium-l ${i===0&&!x.horsJeu?"premier":""} ${x.horsJeu?"hors":""}" style="animation-delay:${i*120}ms">
      <span class="rang">${x.horsJeu ? "—" : i+1}</span>${jetonSVG(x.couleur)}
      <span>${esc(x.nom)}${x.ia?` <small>${PROFILS[x.ia].nom.toLowerCase()} AI</small>`:" <small>you</small>"}<small>${x.horsJeu ? "Out" : `Finished${x.arrive?" "+ordinal(x.arrive):""}`} · ${x.reussies}/${x.cartes} cards</small></span>
      <b>${x.horsJeu ? "—" : euros(x.argent)}</b>${x.horsJeu ? "" : detailPodium(x)}</div>`).join("")}</div>
    <div class="duo"><button class="bouton piece c-rouge" id="b-rejouer">Play again</button><button class="bouton piece c-noir" id="b-menu">Menu</button></div>
  </section>`;
  if(victoire){ Son.fin(); setTimeout(()=>confettis(200), 300); } else Son.echec();
  $("#b-menu").onclick = ecranAccueil;
  $("#b-rejouer").onclick = config;
}

/* ---------- Multijoueur : podium ---------- */
function finMulti(g, classes, gagnant, victoire){
  journalFini = [...g.multi.decides];
  const moi = g.joueurs.find(j => j.id === g.multi.moi);
  setTimeout(() => { if(typeof Progres !== "undefined") Progres.finPartie({mode:"multi", victoire}); }, 0);
  app.innerHTML = `
  <section class="ecran">
    <h1 class="titre-ecran">${victoire ? TM.victoire : esc(TM.gagne(gagnant ? gagnant.nom : "—"))}</h1>
    <p class="sous-titre">The richest player wins, not the first to finish. Here are the revealed winnings.</p>
    <div class="podium">${classes.map((x,i)=>`<div class="podium-l ${i===0&&!x.horsJeu?"premier":""} ${x.horsJeu?"hors":""}" style="animation-delay:${i*120}ms">
      <span class="rang">${x.horsJeu ? "—" : i+1}</span>${jetonSVG(x.couleur)}
      <span>${esc(x.nom)}${x === moi ? ` <small>${TM.vous}</small>` : ""}<small>${x.horsJeu ? "Out" : `Finished${x.arrive?" "+ordinal(x.arrive):""}`} · ${x.reussies}/${x.cartes} cards</small></span>
      <b>${x.horsJeu ? "—" : euros(x.argent)}</b>${x.horsJeu ? "" : detailPodium(x)}</div>`).join("")}</div>
    <div class="duo"><button class="bouton piece c-orange" id="b-salon">${TM.retourSalon}</button><button class="bouton piece c-noir" id="b-menu">${TM.menu}</button></div>
  </section>`;
  if(victoire){ Son.fin(); setTimeout(()=>confettis(200), 300); } else Son.echec();
  $("#b-menu").onclick = () => { if(g.multi.quitter) g.multi.quitter(); ecranAccueil(); };
  $("#b-salon").onclick = () => { if(g.multi.retour) g.multi.retour(); };
}

/* =========================================================================
   Affichage du plateau
   ========================================================================= */
const CW = 100, CH = 88, X0 = 24, Y0 = 24;
const XA = X0 + 14*CW + 78;            // colonne d'arrivée
const LARG = XA + 175, HAUT = Y0 + 9*CH + 120;
const centre = id => { const n = NOEUDS[id]; return [X0 + n.c*CW + CW/2, Y0 + n.r*CH + CH/2]; };
const caseDepart = i => [X0 + 4.5*CW - 3*74 + i*74 + 37, Y0 + 9*CH + 46];
const caseArrivee = i => [XA + 38, Y0 + CH*1.05 + i*CH + CH/2];
const GRAD = {v:["#1e6a29","#8fca42"], b:["#1b47a3","#62a4ec"], r:["#7e0c14","#ea3039"], n:["#0b0b0d","#4a4c52"], orange:["#e46d16","#fbad38"], violet:["#3b1c70","#7444bd"], jaune:["#d8cb12","#fff47a"]};

function svgTapis(){
  const sphereDef = `<radialGradient id="sphere" cx=".32" cy=".26" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>`;
  const defs = sphereDef + Object.entries(GRAD).map(([k,[a,b]])=>`<linearGradient id="g-${k}" x1="0" y1="0" x2="1" y2=".35"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`).join("")
    + `<linearGradient id="g-reflet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
    + `<marker id="fl" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#000"/></marker>`
    + `<marker id="fl-c" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#cfe0ff"/></marker>`
    + `<pattern id="feutre" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="none"/><rect width="6" height="1" fill="#fff" opacity=".05"/><rect y="3" width="6" height="1" fill="#000" opacity=".1"/></pattern>`
    + `<radialGradient id="lampe" cx=".45" cy=".42" r=".8"><stop offset="0" stop-color="#2a63e0" stop-opacity=".35"/><stop offset=".6" stop-color="#0b2a8c" stop-opacity=".05"/><stop offset="1" stop-color="#020a30" stop-opacity=".4"/></radialGradient>`
    + `<linearGradient id="g-biseau" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".08" stop-color="#fff" stop-opacity="0"/><stop offset=".85" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>`
    + `<linearGradient id="g-or" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".5" stop-color="#ffcf3a"/><stop offset="1" stop-color="#b87d00"/></linearGradient>`
    + `<radialGradient id="g-halo-or" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe68f" stop-opacity=".5"/><stop offset="1" stop-color="#ffe68f" stop-opacity="0"/></radialGradient>`
    + `<filter id="ombre" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity=".5"/></filter>`
    + PIONS.map(p=>`<radialGradient id="gp-${p.c.slice(1)}" cx=".35" cy=".28" r=".85"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".3" stop-color="${p.c}"/><stop offset="1" stop-color="${p.c}" stop-opacity=".7"/></radialGradient>`).join("");
  let cases = "";
  for(const n of Object.values(NOEUDS)){
    if(n.id === "A" || n.id === "D") continue;
    const x = X0 + n.c*CW, y = Y0 + n.r*CH;
    const fill = n.type === "carte" ? n.niv : (n.type === "bonus" ? "violet" : "orange");
    let label = "";
    const txt = (t, dy, taille=30) => `<text x="${x+CW/2}" y="${y+CH/2+dy}" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="${taille}" fill="#fff" stroke="#000" stroke-width="1" paint-order="stroke" letter-spacing="1" ${t.length>=5?`textLength="${Math.min(84, t.length*14)}" lengthAdjust="spacingAndGlyphs"`:""}>${t}</text>`;
    if(n.type === "bonus") label = txt("BONUS", -4) + txt((n.montant<0?"−":"")+"€"+Math.abs(n.montant), 26);
    if(n.type === "malus") label = txt("PENALTY", -4) + txt((n.montant<0?"−":"")+"€"+Math.abs(n.montant), 26);
    if(n.type === "prison") label = txt("JAIL", -4) + txt((n.montant<0?"−":"")+"€"+Math.abs(n.montant), 26);
    if(n.type === "passe") label = txt("PASS", 11, 34);
    if(n.type === "retour") label = txt("BACK TO", -4, 28) + txt("START", 24, 28);
    let fleches = "";
    if(n.cd){
      const [cx, cy] = [x+CW/2, y+CH/2];
      fleches = n.next.map(t => { const m = NOEUDS[t]; const dx = Math.sign(m.c-n.c), dy = Math.sign(m.r-n.r); return `<line x1="${cx}" y1="${cy}" x2="${cx+dx*34}" y2="${cy+dy*30}" stroke="#000" stroke-width="4.5" marker-end="url(#fl)"/>`; }).join("")
        + `<text x="${x+16}" y="${y+CH-12}" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="26" fill="#000" opacity=".85">CD</text>`;
    }
    cases += `<g class="case-g" data-id="${n.id}">
      <rect x="${x}" y="${y}" width="${CW}" height="${CH}" fill="url(#g-${fill})" stroke="#000" stroke-width="3.5"/>
      <rect x="${x+2}" y="${y+2}" width="${CW-4}" height="${CH-4}" fill="url(#g-biseau)"/>
      <path d="M${x+4} ${y+4}H${x+CW-4}L${x+CW-4} ${y+CH*.38}Q${x+CW/2} ${y+CH*.5} ${x+4} ${y+CH*.34}Z" fill="url(#g-reflet)"/>
      ${label}${fleches}
      <rect class="halo" x="${x+5}" y="${y+5}" width="${CW-10}" height="${CH-10}" rx="6"/>
    </g>`;
  }
  // accolade vers l'arrivée
  const xb = X0 + 14*CW + 32;
  const yTop = Y0 + CH/2, yMil = Y0 + 4*CH + CH/2, yBas = Y0 + 7*CH + CH/2;
  const accolade = `<path d="M${X0+14*CW+4} ${yTop}H${xb}V${yBas}H${X0+14*CW+4}M${X0+14*CW+4} ${yMil}H${xb}" fill="none" stroke="#cfe0ff" stroke-width="4" opacity=".85"/>
    <line x1="${xb}" y1="${yMil}" x2="${XA-8}" y2="${yMil}" stroke="#cfe0ff" stroke-width="4" marker-end="url(#fl-c)" opacity=".85"/>`;
  const arrivee = `<ellipse class="lueur" cx="${XA+40}" cy="${Y0+CH*4.05}" rx="120" ry="${CH*3.6}" fill="url(#g-halo-or)"/><text x="${XA+38}" y="${Y0+CH*1.05-16}" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="32" fill="url(#g-or)" stroke="#5a3706" stroke-width=".8" paint-order="stroke" letter-spacing="1.5"><tspan x="${XA+38}" dy="-24" font-size="19" letter-spacing="2.5">FINISH</tspan><tspan x="${XA+38}" dy="24">BONUS</tspan></text>`
    + BONUS_ARRIVEE.map((b,i)=>{ const [cx,cy] = caseArrivee(i); const col = i<2 ? ["#b8c21a","#e8ee55"] : i<4 ? ["#8f9399","#d9dce0"] : ["#8a4a2c","#c98463"];
      return `<g class="case-g" data-id="A${i}"><rect x="${cx-36}" y="${cy-CH/2+2}" width="72" height="${CH-4}" fill="${col[1]}" stroke="#000" stroke-width="3.5"/><rect x="${cx-34}" y="${cy-CH/2+4}" width="68" height="${CH-8}" fill="url(#g-biseau)"/><rect x="${cx-32}" y="${cy-CH/2+6}" width="64" height="${CH*.4}" fill="url(#g-reflet)"/>
        <text x="${cx}" y="${cy+16}" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="46" fill="#111">${i+1}</text>
        <text x="${cx+48}" y="${cy+10}" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="30" fill="${b>0?"#9be15d":"#ff6b6b"}">${b>0?"+":""}€${b}</text></g>`; }).join("")
    + `<g class="case-g" data-id="A"><rect class="halo" x="${XA-2}" y="${Y0+CH*1.05-4}" width="80" height="${CH*6+8}" rx="8"/></g>`;
  const depart = [0,1,2,3,4,5].map(i=>{ const [cx,cy] = caseDepart(i); return `<rect x="${cx-35}" y="${cy-35}" width="70" height="70" fill="url(#g-jaune)" stroke="#000" stroke-width="3.5"/><rect x="${cx-33}" y="${cy-33}" width="66" height="66" fill="url(#g-biseau)"/><text x="${cx}" y="${cy+16}" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="44" fill="#111">${i+1}</text>`; }).join("")
    + `<text x="${X0+4.5*CW}" y="${Y0+9*CH+110}" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="30" fill="#fff" letter-spacing="1.5">START</text>`;
  const logo = `<g transform="translate(${X0+12.5*CW} ${Y0+2.5*CH}) rotate(-9)"><ellipse rx="138" ry="50" fill="#000" opacity=".95" stroke="#6b7ca3" stroke-width="2"/><ellipse cx="-10" cy="-26" rx="104" ry="17" fill="#fff" opacity=".14"/><text y="22" text-anchor="middle" font-family="Bebas Neue, Oswald, Impact, sans-serif" font-size="66" fill="#fff" letter-spacing="2" textLength="200" lengthAdjust="spacingAndGlyphs">LE - QLN</text></g>`;
  const bx = X0 + 8, by = Y0 + 5.35*CH, bw = 92;
  const bareme = `<g filter="url(#ombre)"><rect x="${bx-4}" y="${by-4}" width="${bw*4+8}" height="${CH*2.3+8}" fill="#000"/>`
    + Object.values(NIVEAUX).map((N,i)=>{ const x = bx + i*bw, f = N.cle;
      return `<text x="${x+bw/2}" y="${by+26}" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="22" fill="#ffe68f" textLength="${Math.min(84, N.nom.length*10.5)}" lengthAdjust="spacingAndGlyphs">${N.nom.toUpperCase()}</text>
        <rect x="${x+3}" y="${by+38}" width="${bw-6}" height="${CH*.75}" fill="url(#g-${f})"/><text x="${x+bw/2}" y="${by+38+CH*.5}" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="34" fill="#fff">€${N.gain}</text>
        <rect x="${x+3}" y="${by+44+CH*.75}" width="${bw-6}" height="${CH*.75}" fill="url(#g-${f})"/><text x="${x+bw/2}" y="${by+44+CH*1.25}" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="26" fill="#fff" textLength="${N.temps<60?60:56}" lengthAdjust="spacingAndGlyphs">${N.temps<60?N.temps+" SEC":N.temps/60+" MIN"}</text>`; }).join("") + `</g>`;
  return `<svg id="tapis" viewBox="0 0 ${LARG} ${HAUT}" role="img" aria-label="Le-QLN board"><defs>${defs}</defs>
    <rect width="${LARG}" height="${HAUT}" fill="url(#lampe)"/><rect width="${LARG}" height="${HAUT}" fill="url(#feutre)"/><g filter="url(#ombre)">${cases}</g>${accolade}${arrivee}<g filter="url(#ombre)">${depart}</g>${bareme}${logo}<g id="pions"></g></svg>`;
}

function ecranPlateau(){
  app.classList.add("large");
  app.innerHTML = `
  <section class="ecran plateau-ecran">
    <div class="p-hud">
      <button class="icone-btn" id="b-quitter" aria-label="Quit the game">${ICO.croix}</button>
      <h1 id="p-titre">Le-QLN<small id="p-sous">${G && G.multi ? TM.multi : "Versus AI"}</small></h1>
      ${boutonSon()}
    </div>
    <div class="p-grille">
      <div class="tapis-cadre"><div class="tapis-scroll" id="tapis-scroll">${svgTapis()}</div></div>
      <div class="p-cote">
        <div class="joueurs" id="joueurs"></div>
        <div class="dock" id="dock"><div class="dock-haut"><div class="dock-msg">Getting ready…</div></div><div class="dock-actions" id="dock-actions"></div></div>
        <details class="journal" open><summary>Game log</summary><ol id="journal"></ol></details>
        ${Pub.bandeau()}
      </div>
    </div>
  </section>`;
  brancherSon();
  $("#b-quitter").onclick = () => {
    const v = panneau({classe:"c-orange", titre:"Quit the game?", corps:`<p class="texte-centre">${G && G.multi ? TM.quitterQ : "The current game will be lost."}</p><div class="duo"><button class="bouton piece c-noir" id="q-non">Continue</button><button class="bouton piece c-rouge" id="q-oui">Quit</button></div>`});
    $("#q-non", v).onclick = () => v.remove();
    $("#q-oui", v).onclick = () => { v.remove(); ecranAccueil(); };
  };
  dessinerPions(); majJoueurs();
  Pub.animerBandeau();
}
/* jeton du plateau : rond, de la couleur du joueur, avec son initiale (on reconnaît chacun d'un coup d'œil) */
function initialeDe(j){
  let n = j.nom;
  if(!j.ia && !G.multi){ try{ const c = typeof Multi !== "undefined" && Multi.compte(); if(c && c.pseudo) n = c.pseudo; }catch(e){} }
  return (norm(String(n || "?")).match(/[A-Z0-9]/) || ["?"])[0];
}
function pionG(j, x, y, s){
  const id = j.couleur.slice(1);
  return `<g class="pion ${G.courant===j.id?"actif":""}" data-id="${j.id}" style="transform:translate(${x}px, ${y}px) scale(${s})">
    <circle class="aura" cx="0" cy="0" r="30"/>
    <ellipse class="ombre-pion" cx="4" cy="19" rx="19" ry="6" fill="#000" opacity=".5"/>
    <g class="corps-pion">
      <circle cx="0" cy="0" r="23" fill="${j.couleur}" stroke="#06122f" stroke-width="2"/>
      <circle cx="0" cy="0" r="18.8" fill="url(#gp-${id})" stroke="#0b1d49" stroke-width="2.6"/>
      <ellipse cx="-5" cy="-8" rx="6.5" ry="3.6" fill="#fff" opacity=".6"/>
      <text x="0" y="9.4" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="27" fill="#10204a" stroke="#fff" stroke-opacity=".55" stroke-width=".9" paint-order="stroke">${initialeDe(j)}</text>
    </g>
  </g>`;
}
function positionPion(j){
  if(j.arrive) return [...caseArrivee(j.arrive-1), .95];
  if(j.pos === "D") return [...caseDepart(j.depart ?? 0), .95];
  const [cx, cy] = centre(j.pos);
  const ici = G.joueurs.filter(x => !x.arrive && !x.horsJeu && x.pos === j.pos);
  const k = ici.indexOf(j), n = ici.length;
  if(n === 1) return [cx, cy, 1];
  const offs = [[-24,-14],[24,-14],[0,14],[-24,16],[24,16],[0,-18]];
  const o = offs[k % offs.length];
  return [cx + o[0], cy + o[1], .72];
}
function dessinerPions(){
  const g = $("#pions"); if(!g || !G) return;
  // mise à jour incrémentale pour que les transitions CSS jouent
  for(const j of G.joueurs){
    if(j.horsJeu){ const e = $(`.pion[data-id="${j.id}"]`, g); if(e) e.remove(); continue; }
    const [x, y, s] = positionPion(j);
    let e = $(`.pion[data-id="${j.id}"]`, g);
    if(!e){ g.insertAdjacentHTML("beforeend", pionG(j, x, y, s)); e = $(`.pion[data-id="${j.id}"]`, g); }
    e.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    e.classList.toggle("actif", G.courant === j.id);
  }
  const act = $(`.pion[data-id="${G.courant}"]`, g); if(act) g.appendChild(act);
}
function centrerSur(j){
  const sc = $("#tapis-scroll"), svg = $("#tapis"); if(!sc || !svg || sc.scrollWidth <= sc.clientWidth || j.pos==="D" || j.pos==="A") return;
  const [x] = centre(j.pos); const ratio = svg.clientWidth / LARG;
  sc.scrollTo({left: x*ratio - sc.clientWidth/2, behavior:"smooth"});
}
function marquerCibles(opts, onChoix){
  $$("#tapis .case-g").forEach(g => { g.classList.remove("cible"); g.onclick = null; });
  opts.forEach((o, i) => {
    const g = $(`#tapis .case-g[data-id="${o.id}"]`);
    if(g){ g.classList.add("cible"); if(onChoix) g.onclick = () => onChoix(i); }
  });
}
function majJoueurs(){
  const z = $("#joueurs"); if(!z || !G) return;
  const ordre = G.ordre.length ? G.ordre.map(J) : G.joueurs;
  z.innerHTML = ordre.map(j => {
    const cache = G.caches && (G.multi ? j !== humain() : j.ia);
    let etat = "";
    if(j.horsJeu) etat = `<span class="etat">Out</span>`;
    else if(j.arrive) etat = `<span class="etat ok">Finished ${ordinal(j.arrive)}</span>`;
    else if(j.prison) etat = `<span class="etat">Jail ${j.prison}</span>`;
    else if(j.dette) etat = `<span class="etat">Owes ${J(j.dette.vers).nom}</span>`;
    return `<div class="joueur ${G.courant===j.id?"actif":""}" data-id="${j.id}" style="--cj:${j.couleur}">${jetonSVG(j.couleur)}
      <span class="nom">${esc(j.nom)}${j.ia?`<small>AI</small>`:""}${G.multi && j === humain() ? `<small>${TM.vous}</small>` : ""}${G.multi && j !== humain() && !G.multi.present(j.id) ? `<small class="absent">${TM.absent}</small>` : ""}</span>
      <span class="argent ${cache?"cache":""}">${cache ? "•••" : euros(j.argent)} ${etat}</span></div>`;
  }).join("");
}
function majHud(){
  const t = $("#p-titre"); if(!t || !G) return;
  const j = G.courant ? J(G.courant) : null;
  t.innerHTML = `${j ? (!estLocal(j) ? esc(j.nom)+"'s turn" : "Your turn") : "Le-QLN"}<small id="p-sous">${G.dernier ? "Last one in" : `Turn ${Math.max(1, Math.ceil(G.tours / Math.max(1, actifs().length)))}`}</small>`;
}
function dock({de, msg, sous}){
  const d = $("#dock"); if(!d) return;
  const deEl = $(".de", d);
  const garderDe = de !== false && deEl;
  $(".dock-haut", d).innerHTML = `${de===false ? "" : deHTML("de-dock")}<div class="dock-msg">${msg||""}${sous?`<small>${sous}</small>`:""}</div>`;
  const nouveau = $(".de", d);
  if(nouveau){ afficherDe(nouveau, typeof de === "number" ? de : 1); if(typeof de !== "number") nouveau.classList.add("vide"); }
  $("#dock-actions").innerHTML = "";
}

/* ---------- Dé 3D lancé sur le plateau : il entre par un coin, rebondit et s'immobilise au centre ---------- */
function deSurPlateau(valeur, ms){
  const cadre = $(".tapis-cadre");
  // le lancer du dé fait partie du jeu : on le montre même si Windows / le téléphone demande moins d'animations
  if(!cadre || !Element.prototype.animate) return Promise.resolve();
  // zone de lancer : la partie visible du plateau ; s'il est trop peu visible (page défilée), tout l'écran
  const barre = $("#barre-app"), plafond = barre ? barre.getBoundingClientRect().bottom : 0;
  let r = cadre.getBoundingClientRect();
  let haut = Math.max(r.top, plafond), bas = Math.min(r.bottom, innerHeight);
  if(bas - haut < 260) r = {left:0, width:innerWidth}, haut = plafond, bas = innerHeight;
  const zone = document.createElement("div"); zone.className = "de-vol-zone";
  const d = Math.round(Math.min(168, Math.max(78, r.width*.17)));
  zone.style.cssText = `left:${r.left}px; top:${haut}px; width:${r.width}px; height:${bas-haut}px; --d:${d}px`;
  zone.innerHTML = `<div class="de-vol-sol"></div><div class="de-vol"><i class="de-halo"></i><i class="de-orbite o1"></i><i class="de-orbite o2"></i>${deHTML("de-vol")}<i class="de-orbite o3"></i></div><div class="de-vol-val"></div>`;
  document.body.appendChild(zone);
  const W = r.width, H = bas - haut, cx = W/2 - d/2, cy = H/2 - d/2;
  const x0 = -d*1.2, y0 = H*.85, sens = Math.random() < .5 ? 1 : -1;
  const xs = sens > 0 ? [x0, W*.18, W*.36, cx] : [W + d*.2, W*.82 - d, W*.62 - d, cx];
  const ys = [y0, cy + H*.12, cy - H*.04, cy];
  const vol = $(".de-vol", zone), cube = $(".cube", zone), sol = $(".de-vol-sol", zone);
  // noyau : un cube intérieur aux arêtes vives comble les coins arrondis des faces (sinon on voit « à travers » le dé)
  const [fx, fy] = ROT_DE[valeur];
  const INC = typeof INCLINE_DE === "string" ? INCLINE_DE : "";
  cube.style.transform = `${INC}rotateX(${fx}deg) rotateY(${fy}deg)`;
  // trajectoire : 3 arcs de plus en plus bas (rebonds), puis petit tassement
  const k = [], ks = [], arcs = [.34, .28, .18], hauteurs = [H*.38, H*.18, H*.07];
  let t = 0;
  k.push({transform:`translate(${xs[0]}px,${ys[0]-H*.3}px) scale(1.1)`, offset:0}); ks.push({transform:`translate(${xs[0]}px,${ys[0]}px) scale(.5)`, opacity:.15, offset:0});
  for(let i=0;i<3;i++){
    const a = arcs[i], xa = xs[i], xb = xs[i+1], ya = ys[i], yb = ys[i+1];
    const tm = t + a/2, tb = t + a;
    k.push({transform:`translate(${(xa+xb)/2}px,${(ya+yb)/2 - hauteurs[i]}px) scale(${1 + hauteurs[i]/H*.35})`, offset:tm, easing:"cubic-bezier(.3,0,.7,1)"});
    k.push({transform:`translate(${xb}px,${yb}px) scale(1.06,.92)`, offset:tb, easing:"cubic-bezier(.3,0,.7,1)"});
    ks.push({transform:`translate(${(xa+xb)/2}px,${(ya+yb)/2}px) scale(${.6 - hauteurs[i]/H*.4})`, opacity:.25, offset:tm});
    ks.push({transform:`translate(${xb}px,${yb}px) scale(1)`, opacity:.55, offset:tb});
    t = tb;
  }
  k[k.length-1].easing = "ease-out";
  k.push({transform:`translate(${cx}px,${cy}px) scale(1)`, offset:1});
  ks.push({transform:`translate(${cx}px,${cy}px) scale(1)`, opacity:.55, offset:1});
  vol.animate(k, {duration:ms, fill:"forwards"});
  sol.animate(ks, {duration:ms, fill:"forwards"});
  cube.animate([{transform:`${INC}rotateX(${fx+1440}deg) rotateY(${fy-1080}deg) rotateZ(${sens*180}deg)`},{transform:`${INC}rotateX(${fx+360}deg) rotateY(${fy-180}deg) rotateZ(${sens*30}deg)`, offset:.62},{transform:`${INC}rotateX(${fx}deg) rotateY(${fy}deg) rotateZ(0deg)`}], {duration:ms, easing:"cubic-bezier(.2,.6,.3,1)", fill:"forwards"});
  // rebonds : petites secousses du plateau (désactivées si l'on évite les animations)
  [.34,.62].forEach(f => setTimeout(() => cadre.animate([{transform:"translateY(0)"},{transform:"translateY(2px)"},{transform:"translateY(0)"}], {duration:140}), ms*f));
  return new Promise(res => {
    setTimeout(() => {
      zone.classList.add("pose");
      const v = $(".de-vol-val", zone); v.textContent = valeur;
      v.style.cssText = `left:${W/2}px; top:${cy - 18}px`;
      setTimeout(() => {
        zone.animate([{opacity:1},{opacity:0}], {duration:260, fill:"forwards"}).onfinish = () => zone.remove();
        res();
      }, ms > 600 ? 650 : 320);
    }, ms);
  });
}
function boutonDock(texte, classe){
  return new Promise(res => {
    const z = $("#dock-actions");
    z.innerHTML = `<button class="bouton piece ${classe}" id="b-dock">${texte}</button>`;
    const b = $("#b-dock"); b.focus({preventScroll:true});
    b.onclick = () => { z.innerHTML = ""; res(); };
  });
}
function journal(j, texte){
  if(!G) return;
  G.journal.unshift({c: j ? j.couleur : "#888", t: texte});
  const ol = $("#journal"); if(!ol) return;
  ol.innerHTML = G.journal.slice(0, 40).map(e => `<li><i style="background:${e.c}"></i><span>${esc(e.t)}</span></li>`).join("");
}

return {
  config,
  stop(){ if(G){ const m = G.multi; G = null; $$(".voile").forEach(v=>v.remove()); composeurActif = null; if(m && m.quitter) m.quitter(); } },
  arreter(){ if(G){ G = null; $$(".voile").forEach(v=>v.remove()); composeurActif = null; } },   // (multijoueur : arrêt sans prévenir le salon)
  demarrerMulti, recevoirMulti, changerHote, journalMulti, appliquerJournal, enCours:() => !!(G && G.multi),
  _etat: () => G, _noeuds: NOEUDS, _destinations: destinations, _fin: () => finPartie(),   // (pour les tests)
};
})();
