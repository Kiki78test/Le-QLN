/* =========================================================================
   Le-QLN — analyse d'un mot contesté à partir de sa page Wiktionnaire.
   Partagé entre l'appli (navigateur) et le serveur (Node) pour appliquer exactement les mêmes règles :
     acceptés : noms communs, adjectifs, verbes à l'infinitif, participes passés et présents (et leurs pluriels / féminins) ;
     refusés  : verbes conjugués, noms propres, prénoms, sigles, abréviations, symboles, mots d'autres langues.
   ========================================================================= */
(function(racine){
  "use strict";
  const CONFIG = {
    fr: {
      section: /==\s*\{\{langue\|fr\}\}\s*==/, finSection: /\n==\s*\{\{langue\|/,
      titre: /^===+\s*\{\{S\|([^|}]+)\|fr((?:\|[^}]*)?)\}\}\s*=+/,
      ok: ["nom", "nom commun", "adjectif", "adjectif qualificatif", "participe", "adjectif numéral"],
      verbe: ["verbe"],
      refus: ["nom propre", "prénom", "nom de famille", "sigle", "abréviation", "symbole", "acronyme", "lettre", "erreur", "nom scientifique"],
      participe: /participe\s+(pass[ée]|présent)/i,
    },
    en: {
      section: /^==\s*English\s*==\s*$/m, finSection: /\n==[^=]/,
      titre: /^===+\s*([A-Za-z ]+?)\s*=+\s*$/,
      ok: ["noun", "adjective"],
      verbe: ["verb"],
      refus: ["proper noun", "abbreviation", "initialism", "acronym", "symbol", "letter", "prefix", "suffix"],
      participe: /(past|present) participle of/i,
      conjugue: /\{\{(third-person singular of|simple past of|inflection of)\|en\|/i,
    },
  };
  const NOMS_RAISONS = {
    fr: {absent:"mot introuvable dans le Wiktionnaire", langue:"pas de définition en français", conjugue:"forme conjuguée d'un verbe", propre:"nom propre, sigle ou abréviation", nature:"nature de mot non acceptée par les règles"},
    en: {absent:"word not found in Wiktionary", langue:"no English entry", conjugue:"conjugated verb form", propre:"proper noun, abbreviation or symbol", nature:"part of speech not allowed by the rules"},
  };

  // renvoie {ok, nature, raison}
  function analyserWikitexte(wt, langue){
    const C = CONFIG[langue] || CONFIG.fr, R = NOMS_RAISONS[langue] || NOMS_RAISONS.fr;
    if(!wt) return {ok:false, raison:R.absent};
    const d = wt.search(C.section);
    if(d < 0) return {ok:false, raison:R.langue};
    let s = wt.slice(d + 8); const f = s.search(C.finSection); if(f >= 0) s = s.slice(0, f);
    // découpe en sections de nature (nom, adjectif, verbe…) avec leurs définitions
    const parts = []; let cur = null;
    for(const ligne of s.split("\n")){
      const m = ligne.match(C.titre);
      if(m){ cur = {nature:m[1].trim().toLowerCase(), flexion:/flexion/i.test(m[2] || "") , defs:[]}; parts.push(cur); continue; }
      if(cur && /^#(?![*:#])/.test(ligne)) cur.defs.push(ligne);
    }
    let vuPropre = false, vuConjugue = false;
    for(const p of parts){
      if(!p.defs.length) continue;
      const texte = p.defs.join(" ");
      if(C.refus.includes(p.nature)){ vuPropre = true; continue; }
      if(C.ok.includes(p.nature)) return {ok:true, nature:p.nature};
      if(C.verbe.includes(p.nature)){
        if(langue === "en"){
          if(C.participe.test(texte)) return {ok:true, nature:"participle"};
          if(C.conjugue.test(texte) && !C.participe.test(texte)){ vuConjugue = true; continue; }
          return {ok:true, nature:"verb"};
        }
        if(!p.flexion) return {ok:true, nature:"verbe (infinitif)"};
        if(C.participe.test(texte)) return {ok:true, nature:"participe"};
        vuConjugue = true; continue;
      }
    }
    return {ok:false, raison: vuConjugue ? R.conjugue : vuPropre ? R.propre : R.nature};
  }

  const api = { analyserWikitexte };
  if(typeof module !== "undefined" && module.exports) module.exports = api;
  else racine.AnalyseMot = api;
})(typeof window !== "undefined" ? window : globalThis);
