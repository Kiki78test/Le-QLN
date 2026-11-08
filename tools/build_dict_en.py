"""Builds the Le-QLN English anagram dictionary -> app/data/en.json  {"v":[[words...],...], "b":..., "r":..., "n":...}
Sources (all open): word list "web2" (english-words package, Webster's 2nd, lower case = no proper nouns),
word frequencies (wordfreq, Zipf scale), inflection dictionary (lemminflect) to drop plurals and conjugated forms.
Rules mirrored from the French dictionary: 4 letters minimum; base forms only (no plurals, no conjugations);
levels green 4-5, blue 6-7, red 8-9, black 10+; a card needs at least 2 common words.
"""
import json, re, sys
from collections import defaultdict
from english_words import get_english_words_set
from wordfreq import zipf_frequency
from lemminflect import getAllLemmas
from better_profanity import profanity

OUT = sys.argv[1]
ACCEPT, COMMON = 2.3, 3.0   # Zipf thresholds : answer accepted / counts as "common"
profanity.load_censor_words()
EXTRA_BLOCK = set("""anal anus arse arses boner boob boobs butt butts cock cocks cunt dick dicks dildo fuck fucks fucker
whore whores slut sluts bitch bitches bastard bastards damn crap piss pissed rape raped raping rapist porn porno
nazi nazis negro negros nigger faggot fags fagot gonad gonads horny jizz kike semen sperm testicle testicles
vagina vaginas penis penises orgasm orgasms erotic erotica prostitute prostitutes lesbo""".split())
web2 = {w for w in get_english_words_set(["web2"], lower=False) if w.isalpha() and w.islower() and w.isascii()}

def base_form(w):
    lem = getAllLemmas(w)
    if not lem:
        return True
    return any(w in forms for forms in lem.values())

def level(n): return "v" if n <= 5 else "b" if n <= 7 else "r" if n <= 9 else "n"

from wordfreq import top_n_list
extra = {w for w in top_n_list("en", 60000) if w.isalpha() and w.isascii() and w.islower() and zipf_frequency(w,"en") >= 3.3 and getAllLemmas(w)}
words = {}
for w in web2 | extra:
    if len(w) < 4 or len(w) > 13: continue
    if w in EXTRA_BLOCK or profanity.contains_profanity(w): continue
    z = zipf_frequency(w, "en")
    if z < ACCEPT: continue
    words[w] = (z, base_form(w))

groups = defaultdict(list)
for w, (z, b) in words.items(): groups["".join(sorted(w))].append((w, z, b))
out = {"v": [], "b": [], "r": [], "n": []}
for key, lst in groups.items():
    if len(lst) < 2: continue
    # a card needs >=2 common BASE words (no plurals/conjugations as targets); inflected forms are still accepted as answers
    if sum(1 for _, z, b in lst if b and z >= COMMON) < 2: continue
    lst.sort(key=lambda x: (not x[2], -x[1]))
    out[level(len(key))].append([w for w, _, _ in lst])
for lv in out: out[lv].sort(key=lambda g: g[0])
with open(OUT, "w", encoding="utf-8") as f: json.dump(out, f, separators=(",", ":"))
print({k: len(v) for k, v in out.items()}, "total", sum(len(v) for v in out.values()))
