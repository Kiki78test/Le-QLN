P = [
('role="group" aria-label="Affichage des publicités"','role="group" aria-label="Ad display"'),
('aria-label="Langue"','aria-label="Language"'),
('accroche:"Le premier café de la journée"','accroche:"The first coffee of the day"'),
('accroche:"La trottinette qui va plus loin"','accroche:"The scooter that goes further"'),
('accroche:"Le studio qui fait jouer"','accroche:"The studio that makes you play"'),
('"Simulation · "','"Simulation · "'),
("${stats.videos+stats.recompenses} vidéo${stats.videos+stats.recompenses>1?\"s\":\"\"} · <b>≈ ${revenu().toFixed(2).replace(\".\",\",\")} €</b>","${stats.videos+stats.recompenses} video${stats.videos+stats.recompenses!==1?\"s\":\"\"} · <b>≈ €${revenu().toFixed(2)}</b>"),
('"Version sans publicité"','"Ad-free version"'),

('aria-pressed="${actif}">Pub</button><button data-v="0" aria-pressed="${!actif}">No Pub</button>','aria-pressed="${actif}">Ads</button><button data-v="0" aria-pressed="${!actif}">No Ads</button>'),
('"Mode No Pub : aucune publicité."','"No Ads mode: no advertising."'),
('"Mode Pub : un spot entre deux parties, un bandeau sur les écrans calmes, des vidéos facultatives contre des bonus. Jamais pendant un sablier."','"Ads mode: a spot between two games, a banner on quiet screens, optional videos for bonuses. Never during a timer."'),
('titre = "Publicité"','titre = "Advertisement"'),
('<span class="tag">Pub</span>','<span class="tag">Ad</span>'),
("`Passer dans ${passerApres} s`","`Skip in ${passerApres} s`"),("Passer dans ${passerApres} s","Skip in ${passerApres} s"),
('"Regardez jusqu\'au bout pour recevoir votre <b>récompense</b>." : "Spot fictif de démonstration · son coupé"','"Watch to the end to receive your <b>reward</b>." : "Fictional demo spot · sound off"'),
('"Récupérer ›" : "Continuer ›"','"Claim ›" : "Continue ›"'),('"Fermer (sans récompense)" : "Passer ›"','"Close (no reward)" : "Skip ›"'),
('titre:"Publicité avant la partie"','titre:"Advertisement before the game"'),('titre:"Publicité récompense"','titre:"Reward advertisement"'),
('aria-label="Publicité"','aria-label="Advertisement"'),
('<span class="pb-tag">Pub</span>','<span class="pb-tag">Ad</span>'),
]
P += [('titre:"Publicité"}','titre:"Advertisement"}'),('titre:"Publicité"','titre:"Advertisement"')]
