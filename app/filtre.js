/* Le-QLN — filtre des pseudos grossiers (français et anglais).
   Module universel : utilisé par l'appli (création de compte, profil multijoueur, affichage des autres joueurs)
   et par le serveur (inscription, modification du profil, salons, classements).
   Repère aussi les formes déguisées : majuscules, accents, chiffres à la place des lettres (« s4l0pe »),
   lettres répétées (« puuute »), séparateurs (« p.u.t.e »), chiffres collés (« pute93 »).
   Filtre.grossier(texte) → true/false ; Filtre.masquer(pseudo, remplacement) → pseudo ou remplacement. */
(function(racine, fabrique){
  if(typeof module === "object" && module.exports) module.exports = fabrique();
  else racine.Filtre = fabrique();
})(typeof self !== "undefined" ? self : this, function(){
  "use strict";
  // repérés n'importe où dans le pseudo (assez longs pour ne pas toucher de mots ordinaires)
  const RACINES = ["conar", "salop", "encul", "enfoir", "batar", "pedal", "tapet", "niktamer", "niquetamer", "niquetonper", "putain", "pouffias", "bougnoul",
    "negre", "negro", "nigga", "niga", "youpin", "bamboul", "chinetok", "bite", "zizi", "couille", "branl", "suceu", "sucemoi", "suceus", "chate", "foufoun",
    "fuck", "fuk", "shit", "bitch", "biatch", "cunt", "whore", "slut", "faggot", "motherf", "asshol", "dickhead", "cocksuck", "wanker", "bollock",
    "nazi", "hitler", "heilhit", "siegheil", "porno", "pornhub", "xvideo", "hentai", "viol", "pedo", "pedophil", "zoophil", "terroris", "jihad", "daech"];
  // refusés seulement comme mot entier (trop courts ou contenus dans des mots ordinaires : « computer », « second »…)
  const MOTS = ["con", "cons", "conne", "pute", "putes", "pd", "fdp", "ntm", "tg", "ta gueule", "nik", "niq", "nique", "niquer", "bz", "cul", "culs", "teub", "zob", "chier", "merde",
    "ass", "arse", "dick", "cock", "porn", "sex", "sexe", "anal", "anus", "kkk", "fag", "tits", "boobs", "penis", "vagin", "vagina", "kys", "wtf", "stfu"];
  // « viol » : refusé dans « violeur », « violer »… mais pas dans « violette », « violon », « violent »
  const SAUFS = ["violet", "violon", "violen", "violin", "violat", "violaine", "bitum", "habite", "habitu", "orbite", "subite", "cohabit", "petites", "bitcoin",
    "scunthorp", "shitake", "shiitak", "titre", "pedalo", "pedago", "pedestr", "pedicur", "pediatr", "speedo", "torpedo", "nigeria", "chateau", "chaton", "achat",
    "nigaud", "montenegro", "fukushima", "consigne", "concours", "concert", "reconna", "connai", "assassin"];
  const LEET = {"0":"o", "1":"i", "3":"e", "4":"a", "5":"s", "7":"t", "8":"b", "@":"a", "$":"s", "€":"e", "!":"i", "|":"i", "+":"t"};
  const sansAccent = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/œ/g, "oe").replace(/æ/g, "ae");
  const leet = s => s.replace(/[0134578@$€!|+]/g, c => LEET[c]);
  const serrer = s => s.replace(/([a-z])\1+/g, "$1");          // « puuute » → « pute »
  function formes(texte){
    const t = sansAccent(texte);
    const jetons = t.split(/[\s_\-.,;:'"’/\\]+/).filter(Boolean)
      .map(j => serrer(leet(j.replace(/^\d+|\d+$/g, "")).replace(/[^a-z]/g, ""))).filter(Boolean);
    const colle = serrer(leet(t).replace(/[^a-z]/g, ""));
    return {jetons, colle, phrase: jetons.join(" ")};
  }
  const MOTS_S = new Set(MOTS.map(m => serrer(m)));
  function grossier(texte){
    if(!texte) return false;
    const {jetons, colle, phrase} = formes(texte);
    if(jetons.some(j => MOTS_S.has(j)) || MOTS_S.has(phrase) || MOTS_S.has(colle)) return true;
    // racines : on retire d'abord les mots ordinaires qui les contiennent
    let reste = colle; for(const s of SAUFS) reste = reste.split(serrer(s)).join("·");
    return RACINES.some(r => reste.includes(serrer(r)));
  }
  const masquer = (pseudo, remplacement = "Joueur") => grossier(pseudo) ? remplacement : pseudo;
  return { grossier, masquer, _formes: formes };
});
