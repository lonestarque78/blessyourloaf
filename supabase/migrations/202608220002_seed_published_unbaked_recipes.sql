-- Promotes the 10 recipe drafts from drafts/recipe-drafts-2026-08-22.md into
-- public.recipes, published before being baked — a deliberate exception to the usual
-- bake-first rule (see VOICE.md section 5 and drafts/README.md). Tracked in BACKLOG.md
-- so each one gets struck off that list once actually baked and confirmed.
-- Mirrors scripts/seed-recipes.ts exactly (same upsert-by-slug semantics), which was
-- updated in the same commit so a future reseed keeps these too.

insert into public.recipes
  (title, slug, description, category, is_premium, prep_time_minutes, bake_time_minutes, difficulty, ingredients, steps, tags, published)
values (
  'Everyday Country Loaf',
  'everyday-country-loaf',
  'This is the loaf to bake when you want proof that sourdough doesn''t have to be complicated. A simple blend of bread flour and whole wheat, shaped into a round, baked hot and covered so the crust cracks the way it should. Good for a first attempt, and good enough that you''ll keep making it after your tenth.',
  'loaf',
  false,
  30,
  45,
  'beginner',
  $json$[{"item":"bread flour","amount":"425g (about 3½ cups)"},{"item":"whole wheat flour","amount":"75g (about ⅝ cup)"},{"item":"filtered water, divided","amount":"380g (about 1½ cups)","note":"355g for the autolyse, 25g to dissolve the salt"},{"item":"active sourdough starter","amount":"100g (about ⅓ cup)","note":"fed 4 to 12 hours before you mix"},{"item":"fine sea salt","amount":"10g (about 1½ teaspoons)"},{"item":"rice flour","amount":"as needed","note":"for dusting the banneton"}]$json$::jsonb,
  $json$[{"title":"Autolyse","description":"In a large bowl, mix the bread flour, whole wheat flour, and 355g water until no dry flour is left. Cover and let it rest 45 to 60 minutes. This hydrates the flour before the starter goes in.","duration_minutes":60},{"title":"Add starter and salt","description":"Add the starter to the dough. Dissolve the salt in the remaining 25g water and pour that in too. Squeeze the dough through your fingers for 2 to 3 minutes until it comes together. Cover and rest 30 minutes.","duration_minutes":30},{"title":"Stretch and fold, four sets","description":"Wet one hand, reach under the dough, pull up a section, and fold it over itself. Turn the bowl a quarter turn and repeat until you've gone all the way around. That's one set. Do four sets, 30 minutes apart, then leave the dough alone.","duration_minutes":120},{"title":"Bulk ferment","description":"Let the dough sit at about 75°F for 2 to 4 more hours, until it's grown by about half, looks domed, and jiggles when you nudge the bowl. In a hot kitchen this can happen closer to 2 hours. In a cold one it can take longer than 4, so watch the dough and not the clock.","duration_minutes":240},{"title":"Pre-shape","description":"Turn the dough onto a lightly floured counter. Use a bench scraper to fold the edges toward the center, then flip it seam-side down and drag it gently toward you a few times to build tension on top. Rest, uncovered, 20 to 25 minutes.","duration_minutes":25},{"title":"Final shape and cold proof","description":"Shape into a tight round, pinch the seam closed, and set it seam-side up in a banneton dusted heavily with rice flour. Cover and refrigerate 8 to 14 hours.","duration_minutes":15},{"title":"Preheat","description":"The next day, put your Dutch oven, lid on, into the oven and heat to 500°F. Give it a full 45 to 60 minutes to get properly hot.","duration_minutes":60},{"title":"Score and bake","description":"Turn the cold dough out onto parchment. Score it with one confident slash. Lower it into the hot Dutch oven, cover, and bake 20 minutes at 500°F. Remove the lid, drop the oven to 450°F, and bake 20 to 25 minutes more, until deeply golden. Let it cool on a rack at least an hour before you cut into it.","duration_minutes":45}]$json$::jsonb,
  ARRAY['sourdough', 'loaf', 'beginner', 'everyday', 'dutch oven', 'whole wheat']::text[],
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  is_premium = excluded.is_premium,
  prep_time_minutes = excluded.prep_time_minutes,
  bake_time_minutes = excluded.bake_time_minutes,
  difficulty = excluded.difficulty,
  ingredients = excluded.ingredients,
  steps = excluded.steps,
  tags = excluded.tags,
  published = excluded.published;

insert into public.recipes
  (title, slug, description, category, is_premium, prep_time_minutes, bake_time_minutes, difficulty, ingredients, steps, tags, published)
values (
  'Same-Day Sandwich Loaf',
  'same-day-sandwich-loaf',
  'Not every loaf needs an overnight wait. This one is soft-crumbed, easy to slice, and finished start to finish in one day, no cold retard required. It''s the loaf to bake when you''re testing whether your starter is strong enough for a same-day bake, or when you just don''t want to wait until tomorrow for toast.',
  'loaf',
  false,
  30,
  45,
  'beginner',
  $json$[{"item":"bread flour","amount":"500g (about 4 cups)"},{"item":"filtered water, divided","amount":"350g (about 1½ cups)","note":"325g for the autolyse, 25g to dissolve the salt"},{"item":"active sourdough starter","amount":"120g (about ½ cup)","note":"fed and bubbly, used a little more heavily here to help the same-day timeline"},{"item":"fine sea salt","amount":"10g (about 1½ teaspoons)"},{"item":"neutral oil","amount":"as needed","note":"for the loaf pan"}]$json$::jsonb,
  $json$[{"title":"Autolyse","description":"Mix the flour and 325g water in a large bowl until no dry flour remains. Cover and rest 30 to 45 minutes.","duration_minutes":45},{"title":"Add starter and salt","description":"Add the starter and the salt, dissolved in the remaining 25g water. Squeeze the dough through your fingers for 2 to 3 minutes until smooth. Cover and rest 30 minutes.","duration_minutes":30},{"title":"Stretch and fold, three sets","description":"Do three sets of stretch and folds, 30 minutes apart.","duration_minutes":90},{"title":"Bulk ferment","description":"Let the dough rise at 78 to 80°F, warmer than a typical bulk, for 3 to 4 hours, until it's nearly doubled and full of visible bubbles along the sides of the bowl. A warm Texas kitchen can get there closer to 3 hours. A cooler house may need the full 4, or a little more.","duration_minutes":240},{"title":"Shape and pan","description":"Turn the dough out, pat it into a rough rectangle, and roll it up tightly from the short end. Pinch the seam and tuck the ends under. Place it seam-side down in a greased 9x5-inch loaf pan.","duration_minutes":10},{"title":"Proof in the pan","description":"Cover loosely and let it rise at room temperature 2 to 3 hours, until the center of the dough crests an inch or two above the rim of the pan.","duration_minutes":180},{"title":"Bake","description":"Preheat the oven to 425°F. Bake 20 minutes, then reduce to 375°F and bake 20 to 25 minutes more, until the top is deep golden and the loaf sounds hollow when you tap the bottom. Cool in the pan 10 minutes, then turn out onto a rack and cool at least an hour before slicing.","duration_minutes":45}]$json$::jsonb,
  ARRAY['sourdough', 'loaf', 'beginner', 'same-day', 'sandwich bread', 'no cold proof']::text[],
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  is_premium = excluded.is_premium,
  prep_time_minutes = excluded.prep_time_minutes,
  bake_time_minutes = excluded.bake_time_minutes,
  difficulty = excluded.difficulty,
  ingredients = excluded.ingredients,
  steps = excluded.steps,
  tags = excluded.tags,
  published = excluded.published;

insert into public.recipes
  (title, slug, description, category, is_premium, prep_time_minutes, bake_time_minutes, difficulty, ingredients, steps, tags, published)
values (
  'High-Hydration Open Crumb Batard',
  'high-hydration-open-crumb-batard',
  'This one asks more of you and gives more back. A wetter dough than most, handled with coil folds instead of stretch and folds, aimed at the big irregular holes people chase when they say they want an open crumb. Not a first loaf. A good one for a baker who''s made the country loaf a few times and wants to see what their starter can really do.',
  'loaf',
  false,
  40,
  50,
  'advanced',
  $json$[{"item":"bread flour","amount":"500g (about 4 cups)","note":"a strong bread flour helps here"},{"item":"filtered water, divided","amount":"410g (about 1¾ cups)","note":"385g for the autolyse, 25g to dissolve the salt"},{"item":"active sourdough starter","amount":"100g (about ⅓ cup)","note":"fed 4 to 8 hours before you mix and at its peak"},{"item":"fine sea salt","amount":"10g (about 1½ teaspoons)"},{"item":"rice flour","amount":"as needed","note":"for the banneton"}]$json$::jsonb,
  $json$[{"title":"Extended autolyse","description":"Mix the flour and 385g water until no dry flour remains. Cover and rest a full hour. Wetter dough needs the extra time to hydrate evenly.","duration_minutes":60},{"title":"Add starter and salt","description":"Add the starter and the salt dissolved in the remaining 25g water. Squeeze and fold the dough in the bowl for 3 to 4 minutes until it comes together. It'll feel loose and slack. That's correct for this hydration. Cover and rest 30 minutes.","duration_minutes":30},{"title":"Coil folds, five sets","description":"Wet your hands. Lift the dough gently from the center, letting the ends fold underneath as it stretches. Rotate the bowl and repeat on the other side. Do five sets, 30 minutes apart. The dough will tighten noticeably between sets even though it stays soft.","duration_minutes":150},{"title":"Bulk ferment","description":"Let the dough sit at 75°F for 3 to 5 more hours, until it's grown by about half again and the surface looks glossy and full of small bubbles. High hydration dough can look deceptively slack even when it's ready, so go by the rise and the bubbles, not by how firm it feels. It'll move faster in summer heat, slower in a cold kitchen.","duration_minutes":300},{"title":"Pre-shape","description":"Turn the dough onto a lightly floured counter using a wet bowl scraper. Shape it gently into a loose round without knocking too much gas out. Rest, uncovered, 20 minutes.","duration_minutes":20},{"title":"Final shape and cold proof","description":"With wet hands, shape into a batard by folding the sides in and rolling it away from you into a log. Place seam-side up in a rice-floured banneton. Cover and refrigerate 10 to 16 hours. The longer cold rest helps a wet dough firm up enough to score and handle well.","duration_minutes":15},{"title":"Preheat","description":"Heat your Dutch oven, lid on, at 500°F for a full hour.","duration_minutes":60},{"title":"Score and bake","description":"Turn the cold dough onto parchment. Score at a fairly shallow angle, since a deep score on wet dough can cause a blowout somewhere else on the loaf instead. Bake covered at 500°F for 20 minutes, then uncovered at 450°F for 25 to 30 minutes, until deeply browned. Cool at least 90 minutes before cutting. This crumb needs the extra time to set.","duration_minutes":50}]$json$::jsonb,
  ARRAY['sourdough', 'loaf', 'advanced', 'high hydration', 'open crumb', 'batard', 'coil fold']::text[],
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  is_premium = excluded.is_premium,
  prep_time_minutes = excluded.prep_time_minutes,
  bake_time_minutes = excluded.bake_time_minutes,
  difficulty = excluded.difficulty,
  ingredients = excluded.ingredients,
  steps = excluded.steps,
  tags = excluded.tags,
  published = excluded.published;

insert into public.recipes
  (title, slug, description, category, is_premium, prep_time_minutes, bake_time_minutes, difficulty, ingredients, steps, tags, published)
values (
  'Seeded Multigrain Boule',
  'seeded-multigrain-boule',
  'Bread flour and whole wheat carrying a soaker of toasted seeds and oats, so every slice has something to chew on. This is the loaf for someone who wants a hearty daily bread without giving up an open, moist crumb. Toast the seeds the night before if you want to shave a little time off the morning.',
  'loaf',
  false,
  40,
  45,
  'intermediate',
  $json$[{"item":"bread flour","amount":"400g (about 3⅓ cups)"},{"item":"whole wheat flour","amount":"100g (about ⅞ cup)"},{"item":"filtered water, divided","amount":"390g (about 1⅔ cups)","note":"365g for the autolyse, 25g to dissolve the salt"},{"item":"active sourdough starter","amount":"100g (about ⅓ cup)"},{"item":"fine sea salt","amount":"10g (about 1½ teaspoons)"},{"item":"mixed seeds","amount":"60g (about ½ cup)","note":"sunflower, flax, and sesame in whatever ratio you like, lightly toasted"},{"item":"old-fashioned rolled oats","amount":"20g (about 3 tablespoons)"},{"item":"hot water","amount":"80g (about ⅓ cup)","note":"for the soaker"},{"item":"rice flour","amount":"as needed","note":"for the banneton"}]$json$::jsonb,
  $json$[{"title":"Make the soaker","description":"Combine the seeds, oats, and hot water in a small bowl. Let it sit at least 30 minutes, until the water is mostly absorbed. This keeps the seeds from pulling moisture out of the dough later.","duration_minutes":30},{"title":"Autolyse","description":"Mix the bread flour, whole wheat flour, and 365g water until no dry flour remains. Cover and rest 45 to 60 minutes.","duration_minutes":60},{"title":"Add starter, salt, and the soaker","description":"Add the starter, the salt dissolved in the remaining 25g water, and the soaked seed mixture. Squeeze the dough through your fingers for 3 minutes until everything is evenly worked in. Cover and rest 30 minutes.","duration_minutes":30},{"title":"Stretch and fold, four sets","description":"Do four sets of stretch and folds, 30 minutes apart.","duration_minutes":120},{"title":"Bulk ferment","description":"Let the dough rise at 75°F for 2 to 4 more hours, until it's grown by about half, looks domed, and jiggles when the bowl moves. Faster in a hot kitchen, slower in a cold one.","duration_minutes":240},{"title":"Pre-shape","description":"Turn out onto a floured counter and pre-shape into a round. Rest, uncovered, 20 minutes.","duration_minutes":20},{"title":"Final shape and cold proof","description":"Shape into a tight boule, place seam-side up in a rice-floured banneton, cover, and refrigerate 8 to 14 hours.","duration_minutes":15},{"title":"Preheat and bake","description":"Heat your Dutch oven at 500°F for 45 to 60 minutes. Score the cold dough and bake covered 20 minutes at 500°F, then uncovered at 450°F for 22 to 25 minutes, until deep golden brown. Cool at least an hour before slicing.","duration_minutes":90}]$json$::jsonb,
  ARRAY['sourdough', 'loaf', 'intermediate', 'multigrain', 'seeded', 'whole wheat', 'hearty']::text[],
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  is_premium = excluded.is_premium,
  prep_time_minutes = excluded.prep_time_minutes,
  bake_time_minutes = excluded.bake_time_minutes,
  difficulty = excluded.difficulty,
  ingredients = excluded.ingredients,
  steps = excluded.steps,
  tags = excluded.tags,
  published = excluded.published;

insert into public.recipes
  (title, slug, description, category, is_premium, prep_time_minutes, bake_time_minutes, difficulty, ingredients, steps, tags, published)
values (
  'Spelt and Honey Loaf',
  'spelt-and-honey-loaf',
  'Spelt has a nuttier, slightly sweeter character than whole wheat, and it plays well with a little honey. Its gluten is more fragile than modern bread wheat, so this loaf gets a gentler hand throughout and a shorter bulk. The reward is a tender, golden crumb that tastes like something worth waiting for.',
  'loaf',
  false,
  30,
  40,
  'intermediate',
  $json$[{"item":"bread flour","amount":"350g (about 3 cups)"},{"item":"whole spelt flour","amount":"150g (about 1¼ cups)"},{"item":"filtered water, divided","amount":"370g (about 1½ cups)","note":"345g for the autolyse, 25g to dissolve the salt"},{"item":"active sourdough starter","amount":"100g (about ⅓ cup)"},{"item":"fine sea salt","amount":"10g (about 1½ teaspoons)"},{"item":"raw honey","amount":"20g (about 1 tablespoon)"},{"item":"rice flour","amount":"as needed","note":"for the banneton"}]$json$::jsonb,
  $json$[{"title":"Autolyse with honey","description":"Mix the bread flour, spelt flour, 345g water, and honey until no dry flour remains. Cover and rest 45 minutes.","duration_minutes":45},{"title":"Add starter and salt","description":"Add the starter and the salt dissolved in the remaining 25g water. Mix gently for 2 minutes. Spelt dough tears more easily than wheat dough, so handle it with a lighter touch than you would a regular loaf. Cover and rest 30 minutes.","duration_minutes":30},{"title":"Stretch and fold, three sets","description":"Do three gentle sets of stretch and folds, 30 minutes apart. Pull less forcefully than usual. Spelt doesn't need, or want, aggressive handling.","duration_minutes":90},{"title":"Bulk ferment","description":"Let the dough rise at 75°F for 2 to 3 more hours. Spelt ferments faster than wheat, so check it earlier than you would a country loaf, around the point where it's grown by about half, domed and jiggly. Don't let it run long. In a hot kitchen this can move even faster, so check at the 90-minute mark the first time you bake this one.","duration_minutes":180},{"title":"Pre-shape","description":"Turn the dough out gently and pre-shape into a round, handling it more like a soft ball of dough than a taut one. Rest, uncovered, 20 minutes.","duration_minutes":20},{"title":"Final shape and cold proof","description":"Shape into a boule, being gentle with the surface tension since spelt tears if you pull too hard. Place seam-side up in a rice-floured banneton, cover, and refrigerate 8 to 12 hours, no longer, since spelt can overproof even cold.","duration_minutes":15},{"title":"Preheat and bake","description":"Heat your Dutch oven at 500°F for 45 to 60 minutes. Score the cold dough, bake covered 20 minutes at 500°F, then uncovered at 450°F for 18 to 22 minutes, until golden. Spelt colors a little faster than a standard loaf, so check it a few minutes early the first time. Cool at least an hour before slicing.","duration_minutes":85}]$json$::jsonb,
  ARRAY['sourdough', 'loaf', 'intermediate', 'spelt', 'honey', 'ancient grain']::text[],
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  is_premium = excluded.is_premium,
  prep_time_minutes = excluded.prep_time_minutes,
  bake_time_minutes = excluded.bake_time_minutes,
  difficulty = excluded.difficulty,
  ingredients = excluded.ingredients,
  steps = excluded.steps,
  tags = excluded.tags,
  published = excluded.published;

insert into public.recipes
  (title, slug, description, category, is_premium, prep_time_minutes, bake_time_minutes, difficulty, ingredients, steps, tags, published)
values (
  'Sourdough Discard Naan',
  'sourdough-discard-naan',
  'A same-day way to use up a big jar of hungry discard. Yogurt makes the dough tender and a little tangy, and a hot skillet does the rest. No oven, no overnight wait, just a soft, blistered flatbread good for scooping up whatever you''re eating alongside it.',
  'discard',
  false,
  45,
  20,
  'beginner',
  $json$[{"item":"sourdough starter discard","amount":"200g (about ¾ cup)","note":"unfed, any hydration"},{"item":"all-purpose flour","amount":"250g (about 2 cups)","note":"plus more for the counter"},{"item":"plain whole-milk yogurt","amount":"120g (about ½ cup)"},{"item":"baking powder","amount":"1 teaspoon"},{"item":"fine salt","amount":"1 teaspoon"},{"item":"neutral oil","amount":"2 tablespoons","note":"plus more for the pan"},{"item":"unsalted butter, melted","amount":"30g (about 2 tablespoons)","note":"for brushing"},{"item":"garlic clove, minced","amount":"1","note":"optional, for the butter"}]$json$::jsonb,
  $json$[{"title":"Mix the dough","description":"In a large bowl, combine the discard, yogurt, oil, baking powder, and salt. Add the flour and mix with a spoon, then your hands, until a soft dough forms. It should be a little tacky but not sticking to your palms.","duration_minutes":5},{"title":"Rest","description":"Cover and let it sit at room temperature 30 to 60 minutes. This isn't a fermentation rest so much as a chance for the flour to hydrate fully and the gluten to relax.","duration_minutes":60},{"title":"Divide and roll","description":"Divide the dough into six pieces. On a lightly floured counter, roll each into an oval about a quarter-inch thick.","duration_minutes":10},{"title":"Cook","description":"Heat a dry cast iron or heavy skillet over medium-high heat until it's properly hot. Cook each naan 2 to 3 minutes per side, until puffed in places and blistered with brown spots. Turn the heat down if they're browning faster than they're cooking through.","duration_minutes":20},{"title":"Brush and serve","description":"Stir the minced garlic into the melted butter, if using, and brush it over each naan as it comes off the skillet. Serve warm. These are best eaten the same day, though they'll reheat in a dry skillet for a day or two after.","duration_minutes":5}]$json$::jsonb,
  ARRAY['discard', 'naan', 'flatbread', 'beginner', 'same-day', 'skillet', 'no oven']::text[],
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  is_premium = excluded.is_premium,
  prep_time_minutes = excluded.prep_time_minutes,
  bake_time_minutes = excluded.bake_time_minutes,
  difficulty = excluded.difficulty,
  ingredients = excluded.ingredients,
  steps = excluded.steps,
  tags = excluded.tags,
  published = excluded.published;

insert into public.recipes
  (title, slug, description, category, is_premium, prep_time_minutes, bake_time_minutes, difficulty, ingredients, steps, tags, published)
values (
  'Sourdough Discard Soft Pretzels',
  'sourdough-discard-soft-pretzels',
  'Chewy, dark gold, and finished with plenty of coarse salt, these come from a boil-then-bake dough enriched just enough to make them tender. A splash of instant yeast alongside the discard keeps the timeline predictable even on a day when your starter isn''t at its most energetic.',
  'discard',
  false,
  60,
  15,
  'intermediate',
  $json$[{"item":"sourdough starter discard","amount":"200g (about ¾ cup)","note":"unfed"},{"item":"bread flour","amount":"300g (about 2½ cups)"},{"item":"warm water, divided","amount":"100g (about ⅓ cup plus 1 tablespoon)","note":"60g to bloom the yeast, 40g mixed into the dough"},{"item":"instant yeast","amount":"½ teaspoon"},{"item":"light brown sugar","amount":"15g (about 1 tablespoon)","note":"divided between the dough and the boiling water"},{"item":"unsalted butter, melted and cooled","amount":"30g (about 2 tablespoons)"},{"item":"fine salt","amount":"1 teaspoon"},{"item":"baking soda","amount":"75g (about ⅓ cup)","note":"for the boiling water"},{"item":"coarse pretzel salt","amount":"as needed","note":"for topping"},{"item":"large egg","amount":"1","note":"beaten with a tablespoon of water, for the egg wash"}]$json$::jsonb,
  $json$[{"title":"Bloom the yeast","description":"Stir the yeast and half the brown sugar into the 60g warm water. Let it sit 5 to 10 minutes, until foamy.","duration_minutes":10},{"title":"Mix the dough","description":"In a large bowl, combine the flour, remaining brown sugar, and salt. Add the discard, the yeast mixture, the remaining 40g water, and the melted butter. Mix until a shaggy dough forms, then turn it out and knead 6 to 8 minutes, until smooth and only slightly tacky.","duration_minutes":10},{"title":"First rise","description":"Place the dough in a lightly oiled bowl, cover, and let it rise at room temperature about an hour, until it's grown by about half. This dough won't double the way a purely yeasted one might, and that's fine.","duration_minutes":60},{"title":"Divide and shape","description":"Turn the dough out and divide it into six pieces. Roll each into a rope about 20 inches long, then twist into a pretzel shape, pressing the ends firmly into the bottom of the loop so they hold during boiling.","duration_minutes":15},{"title":"Boil","description":"Bring a large pot of water to a boil and stir in the baking soda carefully, since it'll foam up. Boil each pretzel 20 to 30 seconds per side, then lift out with a slotted spoon or spider and set on a parchment-lined baking sheet.","duration_minutes":10},{"title":"Egg wash and bake","description":"Preheat the oven to 425°F. Brush each pretzel with the egg wash and sprinkle generously with pretzel salt. Bake 12 to 15 minutes, until deep mahogany brown. Cool at least 10 minutes before eating, since the inside stays hot a lot longer than you'd expect.","duration_minutes":15}]$json$::jsonb,
  ARRAY['discard', 'pretzels', 'snack', 'intermediate', 'boiled', 'party food']::text[],
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  is_premium = excluded.is_premium,
  prep_time_minutes = excluded.prep_time_minutes,
  bake_time_minutes = excluded.bake_time_minutes,
  difficulty = excluded.difficulty,
  ingredients = excluded.ingredients,
  steps = excluded.steps,
  tags = excluded.tags,
  published = excluded.published;

insert into public.recipes
  (title, slug, description, category, is_premium, prep_time_minutes, bake_time_minutes, difficulty, ingredients, steps, tags, published)
values (
  'Sourdough Discard Skillet Cookie',
  'sourdough-discard-skillet-cookie',
  'For the days when you want to use up discard and eat dessert inside of an hour. One skillet, one bowl, no waiting on fermentation of any kind. This is a butter-and-brown-sugar cookie, not a bread, so don''t expect it to behave like one.',
  'discard',
  false,
  15,
  25,
  'beginner',
  $json$[{"item":"unsalted butter, melted","amount":"115g (about ½ cup)"},{"item":"light brown sugar","amount":"100g (about ½ cup, packed)"},{"item":"granulated sugar","amount":"50g (about ¼ cup)"},{"item":"sourdough starter discard","amount":"100g (about ⅓ cup)","note":"unfed, any hydration"},{"item":"large egg","amount":"1"},{"item":"pure vanilla extract","amount":"1 teaspoon"},{"item":"all-purpose flour","amount":"190g (about 1½ cups)"},{"item":"baking soda","amount":"½ teaspoon"},{"item":"fine salt","amount":"½ teaspoon"},{"item":"semi-sweet chocolate chips","amount":"200g (about 1¼ cups)"},{"item":"flaky sea salt","amount":"as needed","note":"for topping, optional"}]$json$::jsonb,
  $json$[{"title":"Preheat and mix the wet ingredients","description":"Preheat the oven to 350°F. In a large bowl, whisk together the melted butter and both sugars until smooth. Whisk in the discard, egg, and vanilla.","duration_minutes":5},{"title":"Add the dry ingredients","description":"Add the flour, baking soda, and salt. Stir with a spatula until just combined, then fold in the chocolate chips. Don't overmix, or the cookie will bake up tough instead of tender.","duration_minutes":5},{"title":"Fill the skillet","description":"Spread the dough evenly into a well-buttered 10-inch cast iron skillet. Scatter a few extra chocolate chips and a pinch of flaky salt over the top if you like.","duration_minutes":3},{"title":"Bake","description":"Bake 22 to 25 minutes, until the edges are set and golden and the center still looks slightly underdone. It'll keep cooking from residual heat once it's out of the oven.","duration_minutes":25},{"title":"Rest and serve","description":"Let it sit at least 10 minutes before slicing into wedges. This one is at its best barely warm, with a scoop of vanilla ice cream melting into the cracks.","duration_minutes":10}]$json$::jsonb,
  ARRAY['discard', 'cookie', 'dessert', 'beginner', 'quick', 'skillet', 'chocolate chip']::text[],
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  is_premium = excluded.is_premium,
  prep_time_minutes = excluded.prep_time_minutes,
  bake_time_minutes = excluded.bake_time_minutes,
  difficulty = excluded.difficulty,
  ingredients = excluded.ingredients,
  steps = excluded.steps,
  tags = excluded.tags,
  published = excluded.published;

insert into public.recipes
  (title, slug, description, category, is_premium, prep_time_minutes, bake_time_minutes, difficulty, ingredients, steps, tags, published)
values (
  'Soft Sourdough Dinner Rolls',
  'soft-sourdough-dinner-rolls',
  'Pillowy, pull-apart rolls with just enough sourdough character to be interesting without overpowering the butter you''re going to put on them. An enriched dough with milk and egg, so it handles differently than a lean loaf. Give the shaped rolls a proper second rise and they''ll be tall and tender.',
  'rolls',
  false,
  45,
  25,
  'intermediate',
  $json$[{"item":"bread flour","amount":"500g (about 4 cups)"},{"item":"whole milk, warmed to about 100°F","amount":"200g (about ¾ cup)"},{"item":"unsalted butter, melted and cooled","amount":"60g (about ¼ cup)"},{"item":"large egg","amount":"1"},{"item":"granulated sugar","amount":"25g (about 2 tablespoons)"},{"item":"fine sea salt","amount":"9g (about 1½ teaspoons)"},{"item":"active sourdough starter","amount":"100g (about ⅓ cup)"},{"item":"unsalted butter, melted","amount":"as needed","note":"for brushing after baking"}]$json$::jsonb,
  $json$[{"title":"Mix the dough","description":"In a large bowl, whisk together the warm milk, melted butter, egg, and sugar. Add the starter and mix to combine. Add the flour and salt and mix until a shaggy dough forms.","duration_minutes":5},{"title":"Knead","description":"Turn the dough out and knead 8 to 10 minutes, either by hand or in a stand mixer with a dough hook, until it's smooth, elastic, and only slightly tacky.","duration_minutes":10},{"title":"Bulk ferment","description":"Place the dough in a lightly oiled bowl, cover, and let it rise at about 78°F for 3 to 4 hours, until nearly doubled. Enriched dough rises more slowly than a lean loaf, so give it the full time, longer in a cool kitchen.","duration_minutes":240},{"title":"Divide and shape","description":"Turn the dough out and divide it into 15 equal pieces, about 55g each. Shape each into a tight ball by cupping your hand around it and rolling it against the counter. Arrange in a buttered 9x13-inch pan, evenly spaced.","duration_minutes":15},{"title":"Second rise","description":"Cover loosely and let the rolls rise at room temperature 1.5 to 2 hours, until puffy and touching each other. If you'd rather bake fresh in the morning, cover the shaped rolls and refrigerate overnight instead, then let them sit at room temperature about an hour before baking.","duration_minutes":120},{"title":"Bake","description":"Preheat the oven to 375°F. Bake 20 to 25 minutes, until deep golden brown on top and cooked through. Brush with melted butter the moment they come out of the oven. Serve warm.","duration_minutes":25}]$json$::jsonb,
  ARRAY['sourdough', 'rolls', 'intermediate', 'enriched', 'dinner rolls', 'holiday']::text[],
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  is_premium = excluded.is_premium,
  prep_time_minutes = excluded.prep_time_minutes,
  bake_time_minutes = excluded.bake_time_minutes,
  difficulty = excluded.difficulty,
  ingredients = excluded.ingredients,
  steps = excluded.steps,
  tags = excluded.tags,
  published = excluded.published;

insert into public.recipes
  (title, slug, description, category, is_premium, prep_time_minutes, bake_time_minutes, difficulty, ingredients, steps, tags, published)
values (
  'Cinnamon Sugar Sourdough Rolls',
  'cinnamon-sugar-sourdough-rolls',
  'A sweet enriched dough rolled around brown sugar and cinnamon, finished with a simple cream cheese glaze. These take real time between the dough, the fill, and the second rise, but almost none of it is active work. Good for a weekend morning when you don''t mind the kitchen smelling like this all day.',
  'rolls',
  false,
  60,
  30,
  'intermediate',
  $json$[{"item":"bread flour","amount":"500g (about 4 cups)"},{"item":"whole milk, warmed to about 100°F","amount":"180g (about ¾ cup)"},{"item":"unsalted butter, melted and cooled","amount":"75g (about ⅓ cup)"},{"item":"large egg","amount":"1"},{"item":"granulated sugar","amount":"50g (about ¼ cup)"},{"item":"fine sea salt","amount":"9g (about 1½ teaspoons)"},{"item":"active sourdough starter","amount":"100g (about ⅓ cup)"},{"item":"unsalted butter, softened","amount":"60g (about ¼ cup)","note":"for the filling"},{"item":"light brown sugar","amount":"100g (about ½ cup, packed)","note":"for the filling"},{"item":"ground cinnamon","amount":"2 tablespoons","note":"for the filling"},{"item":"cream cheese, softened","amount":"60g (about ¼ cup)","note":"for the glaze"},{"item":"powdered sugar","amount":"120g (about 1 cup)","note":"for the glaze"},{"item":"whole milk","amount":"2 to 3 tablespoons","note":"for the glaze"},{"item":"pure vanilla extract","amount":"½ teaspoon","note":"for the glaze"}]$json$::jsonb,
  $json$[{"title":"Mix the dough","description":"Whisk together the warm milk, melted butter, egg, and sugar. Add the starter, then the flour and salt. Mix until a shaggy dough forms.","duration_minutes":5},{"title":"Knead","description":"Turn out and knead 8 to 10 minutes until smooth and elastic.","duration_minutes":10},{"title":"Bulk ferment","description":"Place in an oiled bowl, cover, and let rise at about 78°F for 3 to 4 hours, until nearly doubled. Slower in a cool kitchen, faster in a hot one, so watch the dough rather than the clock.","duration_minutes":240},{"title":"Roll and fill","description":"Turn the dough out and roll into a rectangle about 12 by 18 inches. Spread the softened butter evenly over the surface. Mix the brown sugar and cinnamon together and sprinkle it evenly over the butter, all the way to the edges.","duration_minutes":10},{"title":"Roll and cut","description":"Starting from the long edge, roll the dough tightly into a log. Pinch the seam closed. Using a piece of plain floss slid underneath and crossed over the top, or a sharp serrated knife, cut into 12 even rolls.","duration_minutes":10},{"title":"Second rise","description":"Arrange the rolls cut-side up in a buttered 9x13-inch pan. Cover loosely and let rise at room temperature 1.5 to 2 hours, until puffy and touching. For an overnight option, cover and refrigerate right after shaping, then let the rolls sit out about an hour before baking the next morning.","duration_minutes":120},{"title":"Bake","description":"Preheat the oven to 350°F. Bake 25 to 30 minutes, until golden brown and the centers are cooked through.","duration_minutes":30},{"title":"Glaze","description":"While the rolls bake, whisk together the cream cheese, powdered sugar, 2 tablespoons milk, and vanilla until smooth, adding the last tablespoon of milk if it's too thick to drizzle. Spread over the rolls while they're still warm, so it melts slightly into the layers.","duration_minutes":5}]$json$::jsonb,
  ARRAY['sourdough', 'rolls', 'intermediate', 'enriched', 'cinnamon', 'sweet', 'breakfast', 'weekend']::text[],
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  is_premium = excluded.is_premium,
  prep_time_minutes = excluded.prep_time_minutes,
  bake_time_minutes = excluded.bake_time_minutes,
  difficulty = excluded.difficulty,
  ingredients = excluded.ingredients,
  steps = excluded.steps,
  tags = excluded.tags,
  published = excluded.published;

