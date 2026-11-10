# Source du document (charte commune : docs-src/charte.py). Régénérer : python3 docs-src/idees_de_noms.py
import os
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "stylepdf.py")).read())
groups=[
("A. Le jeu de l'argent et des mots (le plus parlant sur un store)",[
("Anagold","Word Cash Game","Anagramme + gold : on devine tout de suite les mots ET les gains. Court, prononçable partout, très « icône dorée ». Mon n°1.","★★★"),
("Wordheist","Anagram Cash Showdown","Le « casse » de mots : on rafle la banque. Ton fun et un peu rival, bon pour le multijoueur.","★★☆"),
("Lexipot","Word Jackpot","Lexique + pot : la cagnotte de mots. Sonne bien en français et en anglais.","★★☆"),
("Letter Tycoon","Anagram Empire","Le magnat des lettres : met en avant la progression (devenir riche).","★★☆"),
("Jackpot Letters","Anagram Board Game","Très explicite mais plus générique, risque de se noyer dans les jeux de casino.","★☆☆"),
("MotMoney","Le jeu d'anagrammes qui rapporte","Clair et français, difficile à exporter tel quel.","★☆☆"),
]),
("B. Le jeu de plateau et de défi",[
("Anagrammy","Board Game of Words","Doux, accessible, famille. Peu de rapport à l'argent, très « tout public ».","★★☆"),
("Scramblers","Race the Clock","Scramble = mélanger les lettres. Met l'accent sur le sablier.","★★☆"),
("Tilt & Twist","Anagram Board Party","Rythme et retournements (Retour départ, Malus). Convient à la soirée entre amis.","★☆☆"),
("Mixeur de Mots","Word Mixer","Image forte du mélange de lettres, très français ; à adapter pour l'international.","★☆☆"),
("Brainstack","Word Duel","Plus « cerveau » que « argent » ; moins différenciant.","★☆☆"),
]),
("C. Noms courts et mémorables (marque)",[
("Qlinn","Anagram Cash Game","Dérivé de Le-QLN : conserve l'identité tout en devenant prononçable à l'international.","★★★"),
("Quill","Word Cash Game","Plume (écrivain) : élégant, mais très répandu, risque élevé de conflit de marque.","★☆☆"),
("Wordly Rich","Anagram Board Game","Jeu de mots avec « worldly » ; pas très net à l'oral.","★☆☆"),
("Letterlux","Anagram Treasure Game","Lettres + luxe : positionnement chic, plus « premium ».","★☆☆"),
("Gramgold","Anagram Treasure Hunt","Anagram + gold, plus technique que Anagold.","★★☆"),
("Cashgram","Word Cash Game","Cash + anagram, très lisible ; ressemble à des apps de paiement.","★☆☆"),
]),
]
def build():
    doc=SimpleDocTemplate("idees-de-noms.pdf",pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=16*mm,bottomMargin=16*mm,title="Le-QLN — idées de noms",author="Claude")
    st=[Paragraph("Le-QLN — idées de noms",T),Spacer(1,3),Paragraph("Pistes pour un nom international, attractif et parlant sur un store · 8 novembre 2026",S),Spacer(1,8)]
    st.append(Paragraph("<b>Critères retenus :</b> court (moins de 12 caractères), prononçable en français et en anglais, évoque à la fois les <b>mots</b> et l'<b>argent</b>, mémorable sur une icône, trouvable via un sous-titre de store (« Word Cash Game »). Le nom « Le-QLN » peut rester en signature : <i>« by Le-QLN »</i>.",P))
    st.append(Paragraph("<b>Notation :</b> ★★★ = recommandé · ★★☆ = bonne alternative · ★☆☆ = piste secondaire.",P))
    for g,items in groups:
        st.append(Paragraph(g,H))
        for n,sub,why,r in items:
            row=[[Paragraph(f"<b style='font-size:11.5pt;color:#0f2a6b'>{n}</b> &nbsp;<span style='color:#c9921a'>{r}</span>",P),Paragraph(f"<b>Sous-titre :</b> {sub}",S)],[Paragraph(why,P),""]]
            t=Table(row,colWidths=[85*mm,89*mm]); t.setStyle(TableStyle([("SPAN",(0,1),(1,1)),("BOX",(0,0),(-1,-1),.6,colors.HexColor("#d8d2bf")),("BACKGROUND",(0,0),(-1,0),colors.HexColor("#faf6e8")),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]))
            st.append(KeepTogether([t,Spacer(1,4)]))
    st.append(Paragraph("Mon top 3",H))
    st.append(Paragraph("<b>1. Anagold</b> — le plus clair, la meilleure icône (une pièce d'or), sous-titre « Word Cash Game ». <b>2. Qlinn</b> — garde l'ADN Le-QLN. <b>3. Lexipot</b> — ludique, bon en français comme en anglais.",P))
    st.append(Paragraph("À vérifier avant de choisir",H))
    st.append(Paragraph("• <b>Disponibilité</b> : recherche du nom dans l'App Store, Google Play, et les noms de domaine (.com, .app, .fr).<br/>• <b>Marque</b> : consultation INPI / EUIPO / USPTO, classes 9 (logiciels) et 28 (jeux). Je ne peux pas garantir qu'un nom soit libre : c'est une vérification à faire avec un conseil en propriété industrielle.<br/>• <b>Réseaux sociaux</b> : @pseudo libre sur Instagram, TikTok, YouTube.<br/>• <b>Test auprès de joueurs</b> : demander à 10 personnes de redire le nom après l'avoir entendu une fois.",P))
    doc.build(st)
build()
