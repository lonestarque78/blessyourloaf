import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local without requiring dotenv as a dependency
const envContent = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
envContent.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) return
  const key = trimmed.slice(0, eqIdx).trim()
  const val = trimmed.slice(eqIdx + 1).trim()
  if (key && !(key in process.env)) process.env[key] = val
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

type Category = 'loaf' | 'discard' | 'rolls' | 'focaccia' | 'other'
type Difficulty = 'beginner' | 'intermediate' | 'advanced'
type Ingredient = { item: string; amount: string; note?: string }
type Step = { title: string; description: string; duration_minutes?: number }

interface Recipe {
  title: string
  slug: string
  description: string
  category: Category
  is_premium: boolean
  prep_time_minutes: number
  bake_time_minutes: number
  difficulty: Difficulty
  ingredients: Ingredient[]
  steps: Step[]
  tags: string[]
  published: boolean
}

const recipes: Recipe[] = [
  // ─── FREE RECIPES ──────────────────────────────────────────────────────────

  {
    title: 'Classic Sourdough Loaf',
    slug: 'classic-sourdough-loaf',
    description:
      "Honey, this is the one that started it all. A golden, crackling crust hiding a chewy, open crumb with just the right tang — this classic sourdough loaf is your foundation recipe. Once you bake this one, sugar, you'll never go back to store-bought bread again.",
    category: 'loaf',
    is_premium: false,
    prep_time_minutes: 60,
    bake_time_minutes: 45,
    difficulty: 'beginner',
    ingredients: [
      { item: 'bread flour', amount: '450g' },
      { item: 'whole wheat flour', amount: '50g' },
      { item: 'filtered water, divided', amount: '375g', note: '350g for autolyse, 25g to dissolve salt' },
      { item: 'active sourdough starter', amount: '100g', note: '100% hydration, fed 4–12 hours before use' },
      { item: 'fine sea salt', amount: '10g' },
      { item: 'rice flour', amount: 'as needed', note: 'for dusting the banneton' },
      { item: 'semolina', amount: '1 tablespoon', note: 'optional — sprinkle on parchment for a crunchy bottom' },
      { item: 'sesame seeds or rolled oats', amount: '2 tablespoons', note: 'optional topping' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Autolyse',
        description:
          'In a large bowl, mix 450g bread flour and 50g whole wheat flour with 350g water until no dry flour remains. Cover with a damp towel and rest 45–60 minutes. This hydrates the flour and starts gluten development before the starter is even added.',
        duration_minutes: 60,
      },
      {
        title: 'Add starter and salt',
        description:
          'Add 100g active starter to the dough. Dissolve 10g salt in the remaining 25g water and pour that over the dough too. Squeeze the dough through your fingers repeatedly for 2–3 minutes until everything is fully incorporated and the dough feels cohesive. Cover and rest 30 minutes.',
        duration_minutes: 30,
      },
      {
        title: 'Stretch and fold — set 1',
        description:
          'Wet your hand, reach under the dough, grab a portion, stretch it up and fold it to the opposite side. Rotate the bowl 90° and repeat until you\'ve gone all the way around — that\'s one set. Do 4–5 of these. Cover and rest 30 minutes.',
        duration_minutes: 30,
      },
      {
        title: 'Stretch and fold — sets 2, 3, and 4',
        description:
          'Repeat 3 more sets of stretch and folds every 30 minutes. The dough will grow smoother and more elastic with each round. After the final set, leave it alone to bulk ferment at 75°F for an additional 2–4 hours until the dough has grown about 75%, the surface looks domed, and you can see bubbles through the sides of the bowl.',
        duration_minutes: 270,
      },
      {
        title: 'Pre-shape',
        description:
          'Turn the dough onto a lightly floured surface. Using a bench scraper, fold the edges into the center and flip the dough over so the seam is down. Cup your hands around the dough and drag it gently toward you to build surface tension. Rest uncovered 20–25 minutes.',
        duration_minutes: 25,
      },
      {
        title: 'Final shape and cold proof',
        description:
          'Flip the dough and stretch it gently into a rough rectangle. Fold the sides in, then roll it away from you into a tight boule. Pinch the seam. Dust a banneton generously with rice flour and place the dough seam-side up. Cover with plastic wrap and refrigerate 8–14 hours overnight.',
        duration_minutes: 15,
      },
      {
        title: 'Preheat Dutch oven',
        description:
          'The next morning, place your Dutch oven (with the lid on) in the oven and preheat to 500°F. Let it heat for at least 45–60 minutes — the Dutch oven must be screaming hot, darlin\'. This is what gives you that gorgeous oven spring.',
        duration_minutes: 60,
      },
      {
        title: 'Score and bake',
        description:
          'Flip the cold dough onto a sheet of parchment. Score with a lame or sharp razor blade at a 30–45° angle — one bold slash or your own design. Carefully lower the dough (with the parchment) into the screaming-hot Dutch oven. Cover and bake at 500°F for 20 minutes. Remove the lid, reduce oven to 450°F, and bake 20–25 more minutes until deep golden brown all over. Cool on a wire rack at least 1 hour before slicing — cutting too soon lets all the steam escape and gums up the crumb.',
        duration_minutes: 45,
      },
    ] as Step[],
    tags: ['sourdough', 'bread', 'loaf', 'beginner', 'classic', 'dutch oven'],
    published: true,
  },

  {
    title: "Sunday Mornin' Discard Pancakes",
    slug: 'sunday-mornin-discard-pancakes',
    description:
      "Lord have mercy, are these good. Fluffy, golden, with that gentle sourdough tang that makes you wonder why you ever used a box mix. These Sunday Mornin' Pancakes are what getting up early is all about — tall stacks on the table before the rest of the family even stirs.",
    category: 'discard',
    is_premium: false,
    prep_time_minutes: 10,
    bake_time_minutes: 20,
    difficulty: 'beginner',
    ingredients: [
      { item: 'sourdough starter discard', amount: '1 cup (240g)', note: 'unfed, room temperature' },
      { item: 'all-purpose flour', amount: '1 cup (120g)' },
      { item: 'granulated sugar', amount: '1 tablespoon' },
      { item: 'baking powder', amount: '1 teaspoon' },
      { item: 'baking soda', amount: '½ teaspoon' },
      { item: 'fine salt', amount: '½ teaspoon' },
      { item: 'large egg', amount: '1' },
      { item: 'buttermilk', amount: '¾ cup (180ml)', note: 'whole milk works too' },
      { item: 'unsalted butter, melted and cooled', amount: '3 tablespoons', note: 'plus more for the pan' },
      { item: 'pure vanilla extract', amount: '1 teaspoon' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Mix dry ingredients',
        description:
          'In a large bowl, whisk together the flour, sugar, baking powder, baking soda, and salt until evenly combined.',
        duration_minutes: 2,
      },
      {
        title: 'Mix wet ingredients',
        description:
          'In a separate bowl, whisk together the sourdough discard, egg, buttermilk, melted and cooled butter, and vanilla extract until smooth.',
        duration_minutes: 2,
      },
      {
        title: 'Combine the batter',
        description:
          'Pour the wet ingredients into the dry and stir gently with a spatula until just combined. A few lumps are your friend, sugar — overmixing makes flat, tough pancakes. Let the batter rest 5 minutes while the pan heats up.',
        duration_minutes: 5,
      },
      {
        title: 'Heat the pan',
        description:
          'Heat a cast iron skillet or griddle over medium heat. Add a small pat of butter and swirl to coat. The pan is ready when a drop of water dances across the surface.',
        duration_minutes: 3,
      },
      {
        title: 'Cook the pancakes',
        description:
          'Pour ¼ cup batter per pancake onto the hot pan. Cook until bubbles form across the entire surface and the edges look set — about 2–3 minutes. Flip once and cook 1–2 minutes more until golden. Adjust heat as needed; cast iron holds heat, so you may need to turn it down after the first batch.',
        duration_minutes: 15,
      },
      {
        title: 'Serve',
        description:
          'Serve immediately with a good pat of real butter and genuine maple syrup. A pile of fresh berries on the side never hurt nobody. These do not reheat well, so eat them while they\'re hot — which should not be a problem.',
        duration_minutes: 2,
      },
    ] as Step[],
    tags: ['discard', 'pancakes', 'breakfast', 'beginner', 'quick', 'weekend'],
    published: true,
  },

  // ─── PREMIUM LOAVES ────────────────────────────────────────────────────────

  {
    title: 'Jalapeño Cheddar Sourdough',
    slug: 'jalapeno-cheddar-sourdough',
    description:
      "This loaf brings the heat, sugar — pockets of melted sharp cheddar woven right through a crackling sourdough crust, with jalapeño in every single bite. It's bold, it's beautiful, and it disappears faster than it takes to cool. Fair warning: this one will make you famous at every potluck.",
    category: 'loaf',
    is_premium: true,
    prep_time_minutes: 75,
    bake_time_minutes: 45,
    difficulty: 'intermediate',
    ingredients: [
      { item: 'bread flour', amount: '450g' },
      { item: 'whole wheat flour', amount: '50g' },
      { item: 'filtered water, divided', amount: '380g', note: '355g for autolyse, 25g for salt' },
      { item: 'active sourdough starter', amount: '100g', note: '100% hydration' },
      { item: 'fine sea salt', amount: '10g' },
      { item: 'sharp cheddar cheese, cut into ½-inch cubes', amount: '150g (about 1½ cups)' },
      { item: 'fresh jalapeños, seeded and finely diced', amount: '2–3 medium (about ½ cup)', note: 'leave seeds in for more heat' },
      { item: 'pickled jalapeño brine', amount: '1 tablespoon', note: 'optional — adds extra tang and heat' },
      { item: 'rice flour', amount: 'as needed', note: 'for dusting banneton' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Autolyse',
        description:
          'Mix bread flour, whole wheat flour, and 355g water together until no dry flour remains. Cover and rest 45–60 minutes.',
        duration_minutes: 60,
      },
      {
        title: 'Add starter and salt',
        description:
          'Add 100g active starter and dissolve 10g salt in the remaining 25g water (add pickled brine here if using). Pour both over the dough and squeeze through your fingers for 2–3 minutes until fully incorporated. Cover and rest 30 minutes.',
        duration_minutes: 30,
      },
      {
        title: 'Stretch and fold — sets 1 and 2',
        description:
          'Perform 2 sets of stretch and folds every 30 minutes. The dough will strengthen noticeably between sets.',
        duration_minutes: 60,
      },
      {
        title: 'Fold in cheddar and jalapeños',
        description:
          'During the 3rd set of stretch and folds, add the cubed cheddar and diced jalapeños to the dough. Use the stretch-and-fold motion to work them in gently — some cheddar will smear, and that\'s beautiful. Do one more set 30 minutes later.',
        duration_minutes: 60,
      },
      {
        title: 'Complete bulk fermentation',
        description:
          'Leave dough undisturbed at 75°F for 2–4 more hours after the final fold, until it has grown about 75% in volume, the surface looks domed and bubbly, and the dough jiggles when you shake the bowl.',
        duration_minutes: 240,
      },
      {
        title: 'Pre-shape and rest',
        description:
          'Turn dough onto a lightly floured surface. Pre-shape into a round using a bench scraper, creating surface tension. Rest uncovered 20–25 minutes.',
        duration_minutes: 25,
      },
      {
        title: 'Final shape and cold proof',
        description:
          'Shape into a tight boule. Dust banneton generously with rice flour and place the dough seam-side up. Cover with plastic wrap and refrigerate 8–14 hours overnight.',
        duration_minutes: 15,
      },
      {
        title: 'Score and bake',
        description:
          'Preheat Dutch oven in a 500°F oven for 45–60 minutes. Flip cold dough onto parchment. Score with a cross or bold single slash. Lower into Dutch oven. Bake covered at 500°F for 20 minutes. Remove lid, reduce to 450°F, and bake 20–25 more minutes until deep golden with caramelized, slightly crispy cheddar on the crust. Cool completely — at least 1 full hour — before slicing.',
        duration_minutes: 45,
      },
    ] as Step[],
    tags: ['sourdough', 'loaf', 'jalapeño', 'cheddar', 'spicy', 'cheese', 'intermediate'],
    published: true,
  },

  {
    title: 'Lemon Blueberry Sourdough',
    slug: 'lemon-blueberry-sourdough',
    description:
      "Bright, jammy blueberries and fresh lemon zest baked right into a tender sourdough crumb — this loaf tastes like Sunday morning in June. It's sweet enough to serve with afternoon tea and sophisticated enough to gift. Slice it thin, darlin', and slather it with cultured butter.",
    category: 'loaf',
    is_premium: true,
    prep_time_minutes: 60,
    bake_time_minutes: 45,
    difficulty: 'intermediate',
    ingredients: [
      { item: 'bread flour', amount: '450g' },
      { item: 'all-purpose flour', amount: '50g' },
      { item: 'filtered water, divided', amount: '360g', note: '335g for autolyse, 25g for salt' },
      { item: 'active sourdough starter', amount: '100g', note: '100% hydration' },
      { item: 'fine sea salt', amount: '10g' },
      { item: 'raw honey', amount: '2 tablespoons' },
      { item: 'lemon zest', amount: '2 teaspoons (about 2 large lemons)' },
      { item: 'lemon juice', amount: '2 tablespoons', note: 'from the zested lemons' },
      { item: 'fresh or frozen blueberries', amount: '1 cup (150g)', note: 'frozen work great — no need to thaw' },
      { item: 'rice flour', amount: 'as needed', note: 'for banneton' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Autolyse with honey',
        description:
          'Whisk together bread flour and all-purpose flour. Add 335g water and 2 tablespoons honey and mix until no dry flour remains. Cover and rest 45–60 minutes. The honey will feed the starter and gently sweeten the crumb.',
        duration_minutes: 60,
      },
      {
        title: 'Add starter, salt, and lemon',
        description:
          'Stir the lemon juice into the remaining 25g water. Add the active starter, dissolved salt, and lemon zest all at once. Squeeze through your fingers for 2–3 minutes until fully incorporated. Cover and rest 30 minutes.',
        duration_minutes: 30,
      },
      {
        title: 'Stretch and fold — set 1',
        description:
          'Perform the first set of stretch and folds. The dough will feel slightly stiff — the lemon juice is fine, it is doing its job. Cover and rest 30 minutes.',
        duration_minutes: 30,
      },
      {
        title: 'Fold in blueberries — set 2',
        description:
          'During the second set, add the blueberries to the dough. Fold them in gently — you want to distribute them without crushing every single berry. A few broken ones are fine and create gorgeous purple streaks through the crumb. Do 2 more sets of folds, 30 minutes apart.',
        duration_minutes: 60,
      },
      {
        title: 'Complete bulk fermentation',
        description:
          'After the final fold, bulk ferment at 75°F for 3–5 more hours until the dough has grown about 75% and the surface looks domed. Blueberry juice may tint the dough slightly — that is absolutely beautiful.',
        duration_minutes: 240,
      },
      {
        title: 'Pre-shape, shape, and cold proof',
        description:
          'Turn dough onto a floured surface and pre-shape into a round. Rest 20 minutes. Final shape into a tight boule or oval batard. Place seam-side up in a generously rice-floured banneton. Cover and refrigerate 8–16 hours overnight.',
        duration_minutes: 35,
      },
      {
        title: 'Preheat Dutch oven',
        description:
          'Place Dutch oven in oven and preheat to 500°F for at least 45–60 minutes.',
        duration_minutes: 60,
      },
      {
        title: 'Score and bake',
        description:
          'Flip cold dough onto parchment. Score with a single long deep slash or a decorative leaf pattern — the blueberries near the score line will bubble and caramelize into something gorgeous. Bake covered at 500°F for 20 minutes. Remove lid, reduce to 450°F, bake 22–25 more minutes until deeply golden with jammy blueberry pockets on the crust. Cool at least 1 hour before slicing.',
        duration_minutes: 45,
      },
    ] as Step[],
    tags: ['sourdough', 'loaf', 'blueberry', 'lemon', 'sweet', 'fruit bread', 'intermediate'],
    published: true,
  },

  {
    title: 'Rosemary Garlic Sourdough',
    slug: 'rosemary-garlic-sourdough',
    description:
      "Roasted garlic melts into the crumb like butter, and fresh rosemary perfumes the whole kitchen while this beauty bakes. This loaf is meant to be torn apart at the table, still warm, with a good olive oil for dipping. It's comfort food that thinks it's fancy.",
    category: 'loaf',
    is_premium: true,
    prep_time_minutes: 75,
    bake_time_minutes: 45,
    difficulty: 'intermediate',
    ingredients: [
      { item: 'bread flour', amount: '450g' },
      { item: 'whole wheat flour', amount: '50g' },
      { item: 'filtered water, divided', amount: '375g', note: '350g for autolyse, 25g for salt' },
      { item: 'active sourdough starter', amount: '100g', note: '100% hydration' },
      { item: 'fine sea salt', amount: '10g' },
      { item: 'garlic cloves, roasted and squeezed from skins', amount: '8 cloves', note: 'roast whole head at 400°F for 40 min' },
      { item: 'fresh rosemary, roughly chopped', amount: '3 tablespoons (about 3 sprigs)' },
      { item: 'good extra-virgin olive oil', amount: '2 tablespoons' },
      { item: 'coarse sea salt', amount: '1 teaspoon', note: 'for sprinkling into banneton' },
      { item: 'rice flour', amount: 'as needed', note: 'for banneton' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Roast the garlic',
        description:
          'Slice the top off a whole head of garlic, drizzle with olive oil, wrap tightly in foil, and roast at 400°F for 35–40 minutes until the cloves are soft, golden, and caramelized. Cool and squeeze cloves from their skins. You can do this a day ahead.',
        duration_minutes: 45,
      },
      {
        title: 'Autolyse with olive oil',
        description:
          'Mix bread flour, whole wheat flour, 350g water, and the 2 tablespoons olive oil together until no dry flour remains. Cover and rest 45–60 minutes.',
        duration_minutes: 60,
      },
      {
        title: 'Add starter, salt, and aromatics',
        description:
          'Add starter, salt dissolved in remaining 25g water, the roasted garlic cloves, and chopped rosemary. Squeeze through your fingers for 3–4 minutes until fully incorporated. The garlic will smash and meld into the dough — gorgeous. Cover and rest 30 minutes.',
        duration_minutes: 30,
      },
      {
        title: 'Stretch and fold',
        description:
          'Perform 4 sets of stretch and folds every 30 minutes over 2 hours. The dough will become beautifully smooth and full of aroma.',
        duration_minutes: 120,
      },
      {
        title: 'Complete bulk fermentation',
        description:
          'After folds, bulk ferment at 75°F for 2–4 more hours until dough has grown about 75%, is domed on top, and jiggles when you shake the bowl.',
        duration_minutes: 240,
      },
      {
        title: 'Pre-shape and rest',
        description:
          'Turn dough onto a lightly floured surface. Pre-shape into a round, building tension with a bench scraper. Rest uncovered 20–25 minutes.',
        duration_minutes: 25,
      },
      {
        title: 'Final shape and cold proof',
        description:
          'Shape into a tight boule. Before placing in the banneton, sprinkle coarse sea salt into the bottom of the banneton — it will form a salty, crunchy crust on top of the baked loaf. Place dough seam-side up. Cover and refrigerate 8–14 hours.',
        duration_minutes: 15,
      },
      {
        title: 'Score and bake',
        description:
          'Preheat Dutch oven in a 500°F oven for 45–60 minutes. Flip cold dough onto parchment. Score with a bold cross or leaf pattern. Bake covered 20 minutes at 500°F. Remove lid, reduce to 450°F, bake 22–25 more minutes until deep golden brown and the kitchen smells like heaven. Cool 1 hour. This is the loaf that makes people knock on your door.',
        duration_minutes: 45,
      },
    ] as Step[],
    tags: ['sourdough', 'loaf', 'rosemary', 'garlic', 'savory', 'herb', 'intermediate'],
    published: true,
  },

  {
    title: 'Cinnamon Raisin Swirl Sourdough',
    slug: 'cinnamon-raisin-swirl-sourdough',
    description:
      "Every slice reveals a gorgeous cinnamon swirl and plump, sweet raisins nestled in a pillowy sourdough crumb. Toasted with a pat of butter? Darlin', this loaf might be better than dessert. It's the kind of bread that makes a house feel like a home.",
    category: 'loaf',
    is_premium: true,
    prep_time_minutes: 90,
    bake_time_minutes: 45,
    difficulty: 'intermediate',
    ingredients: [
      { item: 'bread flour', amount: '450g' },
      { item: 'whole wheat flour', amount: '50g' },
      { item: 'filtered water, divided', amount: '375g', note: '350g for autolyse, 25g for salt' },
      { item: 'active sourdough starter', amount: '100g', note: '100% hydration' },
      { item: 'fine sea salt', amount: '10g' },
      { item: 'raisins', amount: '1 cup (150g)', note: 'soaked 20 min in warm water, then drained and patted dry' },
      { item: 'unsalted butter, softened', amount: '2 tablespoons', note: 'for the swirl filling' },
      { item: 'granulated sugar', amount: '3 tablespoons', note: 'for the swirl filling' },
      { item: 'ground cinnamon', amount: '2½ teaspoons', note: 'for the swirl filling' },
      { item: 'freshly grated nutmeg', amount: '¼ teaspoon', note: 'for the swirl filling' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Prep raisins',
        description:
          'Soak raisins in warm water for 20 minutes to plump them up. Drain thoroughly and pat dry with a kitchen towel. Damp raisins can make the dough sticky and uneven, so get them good and dry, honey.',
        duration_minutes: 20,
      },
      {
        title: 'Autolyse',
        description:
          'Mix bread flour, whole wheat flour, and 350g water together until no dry flour remains. Cover and rest 45–60 minutes.',
        duration_minutes: 60,
      },
      {
        title: 'Add starter and salt',
        description:
          'Add starter and dissolve salt in remaining 25g water. Add both to the dough. Squeeze through fingers for 2–3 minutes until incorporated. Cover and rest 30 minutes.',
        duration_minutes: 30,
      },
      {
        title: 'Stretch and fold with raisins',
        description:
          'Perform 4 sets of stretch and folds every 30 minutes. During the last set, fold in the dried raisins gently, distributing them evenly through the dough without tearing it.',
        duration_minutes: 120,
      },
      {
        title: 'Complete bulk fermentation',
        description:
          'After folds, bulk ferment at 75°F for 2–4 more hours until dough has grown about 75% and is bubbly.',
        duration_minutes: 240,
      },
      {
        title: 'Add the cinnamon swirl',
        description:
          'Turn dough onto a lightly floured surface and pre-shape into a round. Rest 20–25 minutes. Then gently flatten into a rectangle about 10×14 inches. Spread the softened butter evenly all over the surface. Mix together the sugar, cinnamon, and nutmeg and sprinkle evenly over the butter. Roll up tightly from the short end into a log. Pinch the seam.',
        duration_minutes: 30,
      },
      {
        title: 'Shape and cold proof',
        description:
          'Tuck the ends of the roll underneath and carefully place the log seam-side up in a well-floured oval banneton. If using a round banneton, coil the log gently. Cover with plastic and refrigerate 8–14 hours overnight.',
        duration_minutes: 15,
      },
      {
        title: 'Score and bake',
        description:
          'Preheat Dutch oven in a 500°F oven for 45–60 minutes. Flip cold dough onto parchment. Score with a single deep slash down the center to expose the swirl as the loaf blooms. Bake covered 20 minutes at 500°F. Remove lid, reduce to 450°F, bake 22–25 more minutes. Cool completely — at least 2 full hours — before slicing. Cutting too soon will cause the swirl to collapse. It is worth every minute of the wait.',
        duration_minutes: 45,
      },
    ] as Step[],
    tags: ['sourdough', 'loaf', 'cinnamon', 'raisin', 'sweet', 'swirl', 'breakfast bread', 'intermediate'],
    published: true,
  },

  {
    title: 'Whole Wheat Sourdough',
    slug: 'whole-wheat-sourdough',
    description:
      "Earthy, nutty, and deeply satisfying, this 40% whole wheat sourdough is the daily bread this house was built on. A little honey softens the bran's bite, and the long cold ferment coaxes out a complexity you just can't rush. Slice it thick, sugar. It can hold anything you pile on it.",
    category: 'loaf',
    is_premium: true,
    prep_time_minutes: 60,
    bake_time_minutes: 45,
    difficulty: 'intermediate',
    ingredients: [
      { item: 'bread flour', amount: '300g' },
      { item: 'whole wheat flour', amount: '200g', note: 'stone-ground if you can find it' },
      { item: 'filtered water, divided', amount: '390g', note: 'higher hydration for whole wheat; 370g for autolyse, 20g for salt' },
      { item: 'active sourdough starter', amount: '100g', note: '100% hydration' },
      { item: 'fine sea salt', amount: '10g' },
      { item: 'raw honey', amount: '1 tablespoon' },
      { item: 'extra-virgin olive oil', amount: '2 tablespoons' },
      { item: 'rice flour', amount: 'as needed', note: 'for banneton' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Extended autolyse',
        description:
          'Mix bread flour, whole wheat flour, 370g water, honey, and olive oil until no dry flour remains. Cover and rest 60 minutes — whole wheat needs this longer rest to fully hydrate and soften the bran particles, which can otherwise cut through gluten strands.',
        duration_minutes: 60,
      },
      {
        title: 'Add starter and salt',
        description:
          'Add starter and dissolve salt in remaining 20g water. Add both to the dough. Squeeze through fingers thoroughly for 3 minutes — whole wheat takes more work to incorporate. Cover and rest 30 minutes.',
        duration_minutes: 30,
      },
      {
        title: 'Stretch and fold',
        description:
          'Perform 4 sets of stretch and folds every 30 minutes over 2 hours. Whole wheat develops a slightly different feel from white flour dough — a little more dense, a little less silky. That is totally fine, darlin\'.',
        duration_minutes: 120,
      },
      {
        title: 'Bulk fermentation',
        description:
          'After the final fold, bulk ferment at 75°F for 2–3 more hours. Whole wheat ferments faster than white flour doughs, so watch for the signs: dough grown about 75%, domed on top, visible bubbles, and a slight jiggle. Do not let it go too long.',
        duration_minutes: 180,
      },
      {
        title: 'Pre-shape and rest',
        description:
          'Turn dough onto a floured surface. Pre-shape gently — whole wheat dough tears more easily than white dough, so handle with care. Rest uncovered 20 minutes.',
        duration_minutes: 20,
      },
      {
        title: 'Final shape and cold proof',
        description:
          'Shape into a tight boule. Dust banneton with a mixture of rice flour and whole wheat flour for extra coating. Place dough seam-side up. Cover and refrigerate 8–12 hours — no longer than 12 hours, as whole wheat can overproof even cold.',
        duration_minutes: 15,
      },
      {
        title: 'Preheat Dutch oven',
        description:
          'Place Dutch oven with lid in oven and preheat to 500°F for at least 45–60 minutes.',
        duration_minutes: 60,
      },
      {
        title: 'Score and bake',
        description:
          'Flip cold dough onto parchment. Score deeply — whole wheat dough needs a confident, deep score to bloom properly. Bake covered at 500°F for 20 minutes. Remove lid, reduce to 450°F, bake 20–22 minutes until rich, deep brown. The whole wheat will color a bit faster than white flour loaves. Cool 1–2 hours before slicing.',
        duration_minutes: 45,
      },
    ] as Step[],
    tags: ['sourdough', 'loaf', 'whole wheat', 'healthy', 'everyday bread', 'intermediate'],
    published: true,
  },

  {
    title: 'Dark Rye Sourdough',
    slug: 'dark-rye-sourdough',
    description:
      "This is a serious loaf, darlin' — dense, dark, and full of deep caraway-kissed flavor that gets better every single day it sits. Dark rye honors a rich European tradition, and this recipe deepens it with molasses and espresso. Slice it thin with good butter and smoked salmon. You'll feel like you earned it.",
    category: 'loaf',
    is_premium: true,
    prep_time_minutes: 90,
    bake_time_minutes: 50,
    difficulty: 'advanced',
    ingredients: [
      { item: 'bread flour', amount: '300g' },
      { item: 'dark rye flour', amount: '150g' },
      { item: 'whole wheat flour', amount: '50g' },
      { item: 'filtered water, divided', amount: '375g', note: '350g for mixing, 25g for salt' },
      { item: 'active sourdough starter', amount: '150g', note: 'rye or regular starter, 100% hydration — use more starter for rye\'s weaker gluten' },
      { item: 'fine sea salt', amount: '12g' },
      { item: 'caraway seeds, toasted', amount: '2 tablespoons' },
      { item: 'unsulfured molasses', amount: '1 tablespoon', note: 'deepens color and adds complexity' },
      { item: 'instant espresso powder', amount: '2 teaspoons', note: 'amplifies the rye flavor without tasting like coffee' },
      { item: 'rice flour', amount: 'as needed', note: 'generous amount for banneton — rye sticks badly' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Toast caraway seeds',
        description:
          'In a dry skillet over medium heat, toast caraway seeds 2–3 minutes until fragrant. Watch them — they go from perfect to burnt quickly. Remove from heat and let cool.',
        duration_minutes: 5,
      },
      {
        title: 'Mix the dough',
        description:
          'Combine bread flour, dark rye flour, and whole wheat flour. Add 350g water, molasses, and espresso powder. Mix until combined. Rye dough will be sticky, heavy, and will never smooth out like a wheat dough — this is completely normal. Rest covered 45–60 minutes.',
        duration_minutes: 60,
      },
      {
        title: 'Add starter, salt, and caraway',
        description:
          'Add starter, salt dissolved in remaining 25g water, and toasted caraway seeds. Mix by squeezing dough through fingers for 3–4 minutes. Do not expect this to feel like bread dough. It will feel more like very thick batter. Cover and rest 30 minutes.',
        duration_minutes: 30,
      },
      {
        title: 'Coil folds — 3 sets',
        description:
          'Perform 3 sets of coil folds (wet hands, lift center of dough, let ends fold under) every 30 minutes. Rye has very little gluten development compared to wheat — the folds help organize structure, but the dough will remain soft and sticky throughout.',
        duration_minutes: 90,
      },
      {
        title: 'Bulk fermentation',
        description:
          'After folds, bulk ferment at 75°F for 3–5 hours until dough has risen about 60% and the surface looks domed and bubbly. Do not expect the same dramatic rise you see with wheat doughs. Rye ferments differently.',
        duration_minutes: 300,
      },
      {
        title: 'Shape with wet hands',
        description:
          'Wet your hands thoroughly — do not use flour. Turn dough onto a lightly wet surface. Using a bench scraper and wet hands, shape into a rough oval or round. The dough will be sticky; work quickly. Do not fight it.',
        duration_minutes: 10,
      },
      {
        title: 'Cold proof in banneton',
        description:
          'Dust a banneton VERY generously with rice flour — more than you think you need. Place shaped dough seam-side up. Cover and refrigerate 8–12 hours. Rye sticks to everything, so be generous.',
        duration_minutes: 15,
      },
      {
        title: 'Bake and rest',
        description:
          'Preheat Dutch oven in a 475°F oven for 1 full hour. Flip dough onto parchment and score with shallow slashes — rye does not bloom dramatically, so deep scoring is not necessary. Bake covered 25 minutes at 475°F. Remove lid, reduce to 425°F, bake 25 more minutes until very dark brown. Now for the hardest part: wrap in a clean kitchen towel and rest on a wire rack 12–24 hours before slicing. The crumb needs time to set and the flavors deepen dramatically overnight. This loaf is worth every bit of patience, darlin\'.',
        duration_minutes: 50,
      },
    ] as Step[],
    tags: ['sourdough', 'loaf', 'rye', 'dark bread', 'caraway', 'advanced', 'European'],
    published: true,
  },

  {
    title: 'Honey Oat Sourdough',
    slug: 'honey-oat-sourdough',
    description:
      "Golden, soft, and just sweet enough from the honey, with a gorgeous oat-crusted top that makes every slice look like it came from a proper bakery. This is the loaf that converts people who think they don't like sourdough — light enough for a school-day sandwich, special enough for Sunday toast with homemade jam.",
    category: 'loaf',
    is_premium: true,
    prep_time_minutes: 60,
    bake_time_minutes: 45,
    difficulty: 'beginner',
    ingredients: [
      { item: 'bread flour', amount: '400g' },
      { item: 'whole wheat flour', amount: '50g' },
      { item: 'old-fashioned rolled oats', amount: '50g (about ½ cup)', note: 'plus extra for topping' },
      { item: 'hot water for soaking oats', amount: '75g' },
      { item: 'filtered water, divided', amount: '300g', note: '275g for autolyse, 25g for salt' },
      { item: 'active sourdough starter', amount: '100g', note: '100% hydration' },
      { item: 'fine sea salt', amount: '10g' },
      { item: 'raw honey', amount: '3 tablespoons' },
      { item: 'unsalted butter, softened', amount: '2 tablespoons' },
      { item: 'egg wash', amount: '1 egg beaten with 1 tablespoon water', note: 'for adhering oats to crust' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Soak the oats',
        description:
          'Combine rolled oats with 75g hot water. Stir and let soak 20–30 minutes until oats are softened and most of the water is absorbed. This keeps them tender in the crumb and prevents them from drawing moisture out of the dough.',
        duration_minutes: 30,
      },
      {
        title: 'Autolyse with honey',
        description:
          'Mix bread flour, whole wheat flour, 275g water, and 3 tablespoons honey together until no dry flour remains. Cover and rest 45–60 minutes.',
        duration_minutes: 60,
      },
      {
        title: 'Add starter, salt, butter, and oats',
        description:
          'Add starter and salt dissolved in remaining 25g water. Add softened butter and the soaked oats. Squeeze through fingers for 3 full minutes until everything is incorporated. The oats will feel chunky at first — keep going. Cover and rest 30 minutes.',
        duration_minutes: 30,
      },
      {
        title: 'Stretch and fold',
        description:
          'Perform 4 sets of stretch and folds every 30 minutes over 2 hours. The oats and butter make this dough smooth and slightly rich feeling.',
        duration_minutes: 120,
      },
      {
        title: 'Bulk fermentation',
        description:
          'After final fold, bulk ferment at 75°F for 2–4 more hours until dough has grown about 75% and surface is domed and bubbly.',
        duration_minutes: 240,
      },
      {
        title: 'Pre-shape and rest',
        description:
          'Turn onto floured surface. Pre-shape into a round. Rest uncovered 20 minutes.',
        duration_minutes: 20,
      },
      {
        title: 'Shape with oat crust and cold proof',
        description:
          'Final shape into a tight boule. Brush the top and sides generously with egg wash. Pour a pile of rolled oats onto the counter and press the egg-washed top firmly down into the oats, coating it completely. Flip the dough oat-side up into the rice-floured banneton. Cover and refrigerate 8–14 hours. The oat crust will bake up golden and crunchy.',
        duration_minutes: 20,
      },
      {
        title: 'Score and bake',
        description:
          'Preheat Dutch oven in a 500°F oven for 45–60 minutes. Flip cold dough oat-side up onto parchment. Score with a bold single slash or cross right through the oats. Bake covered 20 minutes at 500°F. Remove lid, reduce to 450°F, bake 22–25 more minutes until deep golden with toasty, crunchy oats on top. Cool completely before slicing.',
        duration_minutes: 45,
      },
    ] as Step[],
    tags: ['sourdough', 'loaf', 'oat', 'honey', 'beginner', 'sandwich bread', 'mild'],
    published: true,
  },

  {
    title: 'Sun-Dried Tomato Basil Sourdough',
    slug: 'sun-dried-tomato-basil-sourdough',
    description:
      "Savory, bright, and absolutely gorgeous with ruby-red tomato pockets and green herb flecks throughout the crumb. This Italian-inspired sourdough is stunning sliced on its own, and it makes the most extraordinary grilled cheese you have ever tasted in your life. Bake it once and it'll be in your regular rotation, I promise you that.",
    category: 'loaf',
    is_premium: true,
    prep_time_minutes: 75,
    bake_time_minutes: 45,
    difficulty: 'intermediate',
    ingredients: [
      { item: 'bread flour', amount: '450g' },
      { item: 'semolina flour', amount: '50g', note: 'adds a slightly nutty, golden quality; sub all-purpose if unavailable' },
      { item: 'filtered water, divided', amount: '370g', note: '345g for autolyse, 25g for salt' },
      { item: 'active sourdough starter', amount: '100g', note: '100% hydration' },
      { item: 'fine sea salt', amount: '10g' },
      { item: 'oil-packed sun-dried tomatoes, roughly chopped', amount: '100g (about ¾ cup)' },
      { item: 'fresh basil leaves, torn', amount: '3 tablespoons', note: 'about 12 large leaves' },
      { item: 'olive oil from the tomato jar', amount: '2 tablespoons', note: 'full of flavor — do not waste it' },
      { item: 'garlic cloves, minced', amount: '4 cloves' },
      { item: 'finely grated Parmesan', amount: '2 tablespoons', note: 'plus extra to coat the banneton' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Autolyse with tomato oil',
        description:
          'Mix bread flour and semolina flour together. Add 345g water and the 2 tablespoons of oil from the tomato jar. Mix until no dry flour remains. Cover and rest 45–60 minutes.',
        duration_minutes: 60,
      },
      {
        title: 'Add starter and salt',
        description:
          'Add starter and salt dissolved in remaining 25g water. Squeeze through fingers for 2–3 minutes until fully incorporated. Cover and rest 30 minutes.',
        duration_minutes: 30,
      },
      {
        title: 'Fold in add-ins',
        description:
          'During the second set of stretch and folds, add the sun-dried tomatoes, torn basil, minced garlic, and Parmesan. Fold gently to distribute throughout the dough.',
        duration_minutes: 60,
      },
      {
        title: 'Continue stretch and folds and bulk fermentation',
        description:
          'Perform 2 more sets of stretch and folds, then bulk ferment at 75°F for 3–5 hours until dough has grown about 75% and is bubbly. The tomato oil will tint the dough a warm pinkish-gold.',
        duration_minutes: 300,
      },
      {
        title: 'Pre-shape and rest',
        description:
          'Turn dough onto a floured surface. Pre-shape into a round. Rest 20 minutes uncovered.',
        duration_minutes: 20,
      },
      {
        title: 'Final shape with Parmesan crust',
        description:
          'Shape into a tight boule. Sprinkle 1 tablespoon grated Parmesan into the bottom of a well-floured banneton. Place dough seam-side up on top of the Parmesan — it will form a golden, savory crust on the top of the baked loaf. Cover and refrigerate 8–14 hours.',
        duration_minutes: 15,
      },
      {
        title: 'Preheat Dutch oven',
        description:
          'Preheat Dutch oven in a 500°F oven for at least 45–60 minutes.',
        duration_minutes: 60,
      },
      {
        title: 'Score and bake',
        description:
          'Flip cold dough onto parchment — the Parmesan will now be face-up, gorgeous. Score with a cross or star pattern. Bake covered at 500°F for 20 minutes. Remove lid, reduce to 450°F, bake 22–25 minutes until deep golden brown with caramelized tomato bits on the crust. Cool fully — at least 1 hour — before slicing.',
        duration_minutes: 45,
      },
    ] as Step[],
    tags: ['sourdough', 'loaf', 'sun-dried tomato', 'basil', 'Italian', 'savory', 'intermediate'],
    published: true,
  },

  // ─── PREMIUM DISCARD ──────────────────────────────────────────────────────

  {
    title: 'Sweet Tea Crackers',
    slug: 'sweet-tea-crackers',
    description:
      "Crispy, buttery, and herb-flecked — these crackers are a love letter to your sourdough discard. They come together in minutes, bake up golden and snappy, and taste like something from an artisan shop. Perfect with sharp cheddar and a cold glass of sweet tea, naturally.",
    category: 'discard',
    is_premium: true,
    prep_time_minutes: 20,
    bake_time_minutes: 25,
    difficulty: 'beginner',
    ingredients: [
      { item: 'sourdough starter discard', amount: '1 cup (240g)', note: 'unfed, any hydration' },
      { item: 'all-purpose flour', amount: '1½ cups (180g)', note: 'plus more for rolling' },
      { item: 'cold unsalted butter, cut into small cubes', amount: '¼ cup (55g)' },
      { item: 'fine salt', amount: '1 teaspoon' },
      { item: 'granulated sugar', amount: '1 teaspoon' },
      { item: 'garlic powder', amount: '½ teaspoon' },
      { item: 'dried herbs', amount: '1 teaspoon', note: 'rosemary, thyme, or Italian seasoning — your choice' },
      { item: 'cold water', amount: '2 tablespoons', note: 'add a teaspoon at a time as needed' },
      { item: 'olive oil, for brushing', amount: '2 tablespoons' },
      { item: 'flaky sea salt', amount: '1 teaspoon', note: 'for topping' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Mix dry ingredients',
        description:
          'Combine flour, fine salt, sugar, garlic powder, and dried herbs in a large bowl and whisk together.',
        duration_minutes: 2,
      },
      {
        title: 'Cut in the butter',
        description:
          'Add cold butter cubes. Use your fingers or a pastry cutter to work the butter into the flour until the mixture looks like coarse crumbs with some pea-sized pieces. Work fast — warm hands melt the butter and greasy crackers do not shatter the way they should.',
        duration_minutes: 5,
      },
      {
        title: 'Add the discard',
        description:
          'Add the sourdough discard and mix with a fork until the dough just comes together. Add cold water a teaspoon at a time if needed. The dough should be firm and just barely tacky — not sticky.',
        duration_minutes: 3,
      },
      {
        title: 'Chill the dough',
        description:
          'Flatten dough into a disc, wrap in plastic, and refrigerate 20–30 minutes. Cold dough rolls thinner and more evenly.',
        duration_minutes: 30,
      },
      {
        title: 'Roll thin',
        description:
          'Preheat oven to 350°F. Place dough between two sheets of parchment paper and roll as thin as you can — aim for 1/16 inch. The thinner the cracker, the crispier it will be. Paper thin is what you want, darlin\'.',
        duration_minutes: 5,
      },
      {
        title: 'Cut, dock, and season',
        description:
          'Remove top parchment. Cut dough into desired shapes with a pizza cutter, pastry wheel, or cookie cutters. Slide the parchment with cut crackers onto a baking sheet. Use a fork or docker to poke holes all over — this prevents puffing. Brush lightly with olive oil and sprinkle with flaky salt.',
        duration_minutes: 5,
      },
      {
        title: 'Bake',
        description:
          'Bake at 350°F for 20–25 minutes, rotating the pan halfway through, until golden brown and dry to the touch. Watch carefully the last 5 minutes — edges brown fast and you do not want burned crackers.',
        duration_minutes: 25,
      },
      {
        title: 'Cool and store',
        description:
          'Let crackers cool completely on the pan — they will crisp up significantly as they cool. Store in an airtight container at room temperature up to 1 week. They will not last that long.',
        duration_minutes: 15,
      },
    ] as Step[],
    tags: ['discard', 'crackers', 'snack', 'beginner', 'quick', 'savory', 'party food'],
    published: true,
  },

  {
    title: "Mama's Pizza Dough",
    slug: 'mamas-pizza-dough',
    description:
      "Your discard has been waiting for this moment, honey. This pizza dough is tender inside, beautifully crispy on the bottom, and carries just enough sourdough character to make people ask what your secret is. One batch makes two thin-crust pies or one gorgeous thick-crust pizza — your call.",
    category: 'discard',
    is_premium: true,
    prep_time_minutes: 20,
    bake_time_minutes: 15,
    difficulty: 'beginner',
    ingredients: [
      { item: 'sourdough starter discard', amount: '1 cup (240g)', note: 'unfed, room temperature' },
      { item: 'all-purpose flour', amount: '2 cups (240g)', note: 'plus more for kneading' },
      { item: 'fine salt', amount: '1 teaspoon' },
      { item: 'granulated sugar', amount: '1 teaspoon' },
      { item: 'extra-virgin olive oil', amount: '1 tablespoon', note: 'plus more for the bowl' },
      { item: 'warm water (around 100°F)', amount: '½ cup (120ml)' },
      { item: 'active dry yeast', amount: '1 teaspoon', note: 'optional but guarantees rise if discard is sluggish' },
      { item: 'Italian seasoning', amount: '1 teaspoon' },
      { item: 'cornmeal or semolina', amount: '2 tablespoons', note: 'for the pan — gives the bottom a beautiful crunch' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Activate yeast',
        description:
          'If using yeast, combine warm water, sugar, and yeast in a small bowl. Let sit 5–10 minutes until foamy and fragrant. If your discard is active and bubbly, you can skip the yeast and just use plain warm water.',
        duration_minutes: 10,
      },
      {
        title: 'Mix the dough',
        description:
          'In a large bowl, combine flour, salt, and Italian seasoning. Add discard, olive oil, and the yeast mixture (or plain warm water). Mix with a wooden spoon until a shaggy dough forms.',
        duration_minutes: 3,
      },
      {
        title: 'Knead',
        description:
          'Turn dough onto a floured surface and knead 6–8 minutes until smooth, elastic, and slightly tacky but not sticky. If the dough keeps sticking to your hands, add flour one tablespoon at a time.',
        duration_minutes: 8,
      },
      {
        title: 'First rise',
        description:
          'Place dough in a lightly oiled bowl and turn to coat. Cover with plastic wrap. Let rise at room temperature 1–2 hours until doubled. For better flavor, refrigerate overnight — pull it out 1 hour before using.',
        duration_minutes: 120,
      },
      {
        title: 'Divide and shape',
        description:
          'Punch down dough and turn onto a floured surface. Divide in half for two 10-inch pizzas. Stretch each portion by hand or roll with a rolling pin to your desired thickness. Let shaped dough rest 10 minutes before adding toppings — it will be easier to stretch and won\'t spring back.',
        duration_minutes: 15,
      },
      {
        title: 'Par-bake the crust',
        description:
          'Preheat oven to 450°F with a pizza stone or heavy baking sheet inside. For a crispier crust, brush the shaped dough with olive oil and pre-bake 5–7 minutes before adding toppings.',
        duration_minutes: 10,
      },
      {
        title: 'Top and bake',
        description:
          'Slide dough onto cornmeal-dusted preheated surface. Spread sauce, then cheese, then toppings. Bake at 450°F for 10–15 minutes until the crust is golden brown and the cheese is bubbly with a few brown spots on top.',
        duration_minutes: 15,
      },
      {
        title: 'Slice and serve',
        description:
          'Let cool 2–3 minutes before slicing — molten cheese burns, sugar. Best eaten right away while the crust is at peak crispiness.',
        duration_minutes: 3,
      },
    ] as Step[],
    tags: ['discard', 'pizza', 'dough', 'dinner', 'beginner', 'family meal', 'quick'],
    published: true,
  },

  {
    title: 'Peach Cobbler Muffins',
    slug: 'peach-cobbler-muffins',
    description:
      "All the cozy warmth of a peach cobbler packed into a handheld muffin with a buttery streusel top. Fresh Georgia peaches sink right into the tender discard batter, and the cinnamon streusel gets all golden and crunchy on top. Best eaten warm with a pat of butter and absolutely no apologies.",
    category: 'discard',
    is_premium: true,
    prep_time_minutes: 20,
    bake_time_minutes: 25,
    difficulty: 'beginner',
    ingredients: [
      { item: 'sourdough starter discard', amount: '1 cup (240g)', note: 'unfed, room temperature' },
      { item: 'all-purpose flour', amount: '1½ cups (180g)' },
      { item: 'light brown sugar, packed', amount: '½ cup (100g)' },
      { item: 'unsalted butter, melted and cooled', amount: '¼ cup (55g)' },
      { item: 'large eggs', amount: '2' },
      { item: 'whole milk', amount: '½ cup (120ml)' },
      { item: 'pure vanilla extract', amount: '1 teaspoon' },
      { item: 'baking powder', amount: '1½ teaspoons' },
      { item: 'ground cinnamon', amount: '1 teaspoon' },
      { item: 'fine salt', amount: '¼ teaspoon' },
      { item: 'fresh or canned peaches, diced and patted dry', amount: '1½ cups (225g)', note: 'canned peaches must be well drained' },
      { item: 'cold unsalted butter', amount: '3 tablespoons', note: 'for the streusel topping' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Preheat and prep',
        description:
          'Preheat oven to 375°F. Line a standard 12-cup muffin tin with paper liners or grease each cup generously with butter.',
        duration_minutes: 5,
      },
      {
        title: 'Make the streusel',
        description:
          'In a small bowl, combine 3 tablespoons all-purpose flour, 3 tablespoons brown sugar, and ½ teaspoon cinnamon. Add 3 tablespoons cold butter cut into tiny cubes. Use your fingers to rub the butter into the flour until you have clumpy, sandy crumbs. Refrigerate until ready to use.',
        duration_minutes: 5,
      },
      {
        title: 'Mix wet ingredients',
        description:
          'In a large bowl, whisk together discard, melted butter, eggs, milk, and vanilla until smooth and combined.',
        duration_minutes: 3,
      },
      {
        title: 'Mix dry ingredients',
        description:
          'In a separate bowl, whisk together flour, brown sugar, baking powder, cinnamon, and salt.',
        duration_minutes: 2,
      },
      {
        title: 'Combine',
        description:
          'Add dry ingredients to wet ingredients and fold gently until just combined — stop when you no longer see dry streaks. Fold in the diced peaches. Do not overmix or your muffins will be tough.',
        duration_minutes: 2,
      },
      {
        title: 'Fill and top',
        description:
          'Divide batter evenly among muffin cups, filling each about ¾ full. Top generously with cold streusel, pressing lightly so it adheres.',
        duration_minutes: 3,
      },
      {
        title: 'Bake',
        description:
          'Bake 22–25 minutes until a toothpick inserted in the center of a muffin comes out clean and the streusel is golden brown. Do not overbake, darlin\' — dry muffins are a tragedy.',
        duration_minutes: 25,
      },
      {
        title: 'Cool and serve',
        description:
          'Cool in the pan 5 minutes, then transfer to a wire rack. Best eaten warm — the peaches stay juicy and the streusel stays crunchy. A small pat of salted butter on top never hurt a single soul.',
        duration_minutes: 5,
      },
    ] as Step[],
    tags: ['discard', 'muffins', 'peach', 'breakfast', 'cobbler', 'Southern', 'beginner', 'streusel'],
    published: true,
  },

  {
    title: 'Sourdough Waffles',
    slug: 'sourdough-waffles',
    description:
      "The crispiest, most flavorful waffles you will ever put in your mouth — and I mean that, sugar. The sourdough discard gives them a light tang and the buttermilk makes them impossibly fluffy. The outside shatters. The inside is soft and airy. They stay crispy, too, which is a miracle in waffle form.",
    category: 'discard',
    is_premium: true,
    prep_time_minutes: 15,
    bake_time_minutes: 25,
    difficulty: 'beginner',
    ingredients: [
      { item: 'sourdough starter discard', amount: '2 cups (480g)', note: 'unfed, room temperature' },
      { item: 'all-purpose flour', amount: '2 cups (240g)' },
      { item: 'granulated sugar', amount: '2 tablespoons' },
      { item: 'baking soda', amount: '1½ teaspoons', note: 'reacts with the discard\'s acidity to create lift' },
      { item: 'fine salt', amount: '1 teaspoon' },
      { item: 'large eggs', amount: '2' },
      { item: 'unsalted butter, melted and cooled', amount: '¼ cup (55g)' },
      { item: 'buttermilk', amount: '1½ cups (360ml)', note: 'whole milk works; buttermilk is better' },
      { item: 'pure vanilla extract', amount: '1 teaspoon' },
      { item: 'neutral oil or nonstick spray', amount: 'as needed', note: 'for the waffle iron' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Mix dry ingredients',
        description:
          'In a large bowl, whisk together flour, sugar, baking soda, and salt.',
        duration_minutes: 2,
      },
      {
        title: 'Mix wet ingredients',
        description:
          'In a separate large bowl, whisk together eggs, melted and cooled butter, buttermilk, and vanilla. Add the sourdough discard and whisk until smooth.',
        duration_minutes: 3,
      },
      {
        title: 'Combine and rest',
        description:
          'Pour wet ingredients into dry and stir gently until just combined — a few lumps are fine. Do not overmix. Let batter rest 5–10 minutes while the waffle iron heats up. You will see it begin to bubble slightly as the baking soda and discard react.',
        duration_minutes: 10,
      },
      {
        title: 'Heat the waffle iron',
        description:
          'Preheat your waffle iron to medium-high heat according to its instructions. Brush or spray the plates with oil. A hot iron is the secret to a crispy exterior.',
        duration_minutes: 5,
      },
      {
        title: 'Cook the waffles',
        description:
          'Pour enough batter to just fill the iron — about ¾ cup for a standard Belgian waffle iron. Close the lid and cook 4–5 minutes. Do not open the iron early! When steam slows significantly, your waffle is done.',
        duration_minutes: 5,
      },
      {
        title: 'Keep waffles crispy',
        description:
          'Transfer cooked waffles to a wire rack set on a baking sheet in a 200°F oven. Never stack hot waffles — they go soggy immediately. Continue cooking remaining batter.',
        duration_minutes: 20,
      },
      {
        title: 'Serve',
        description:
          'Serve hot with fresh berries, whipped cream, or real maple syrup. These waffles also freeze beautifully — cool completely, freeze in a single layer, then toast straight from frozen for weekday mornings that feel like the weekend.',
        duration_minutes: 2,
      },
    ] as Step[],
    tags: ['discard', 'waffles', 'breakfast', 'beginner', 'brunch', 'crispy', 'weekend'],
    published: true,
  },

  {
    title: 'Cheddar Herb Biscuits',
    slug: 'cheddar-herb-biscuits',
    description:
      "Flaky, buttery layers hiding pockets of melted cheddar and fresh herbs — these biscuits do not need apology or explanation. They just need to be eaten hot from the oven, ideally right over the sink because they are too good to wait for a plate. Your discard is the secret that makes them taste bakery-special.",
    category: 'discard',
    is_premium: true,
    prep_time_minutes: 20,
    bake_time_minutes: 18,
    difficulty: 'beginner',
    ingredients: [
      { item: 'sourdough starter discard', amount: '1 cup (240g)', note: 'cold, straight from the refrigerator' },
      { item: 'all-purpose flour', amount: '2 cups (240g)', note: 'plus more for the surface' },
      { item: 'baking powder', amount: '1 tablespoon' },
      { item: 'fine salt', amount: '1 teaspoon' },
      { item: 'garlic powder', amount: '½ teaspoon' },
      { item: 'cold unsalted butter, cut into ½-inch cubes', amount: '½ cup (115g)', note: 'must be very cold — freeze for 10 min if needed' },
      { item: 'sharp cheddar cheese, shredded', amount: '1 cup (115g)' },
      { item: 'fresh chives, finely chopped', amount: '2 tablespoons' },
      { item: 'fresh thyme leaves', amount: '1 tablespoon', note: 'or 1 teaspoon dried thyme' },
      { item: 'cold buttermilk', amount: '¼ cup (60ml)' },
      { item: 'unsalted butter, melted, mixed with ¼ tsp garlic powder', amount: '2 tablespoons', note: 'for brushing after baking' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Preheat oven',
        description:
          'Preheat oven to 425°F. Line a baking sheet with parchment paper.',
        duration_minutes: 15,
      },
      {
        title: 'Mix dry ingredients',
        description:
          'Whisk flour, baking powder, salt, and garlic powder together in a large bowl.',
        duration_minutes: 2,
      },
      {
        title: 'Cut in cold butter',
        description:
          'Add cold butter cubes. Working quickly with your fingers or a pastry cutter, break the butter into the flour until you have a mix of pea-sized and corn-kernel-sized pieces. Visible chunks of butter are what create flaky layers — do not cut them too small.',
        duration_minutes: 5,
      },
      {
        title: 'Add cheese and herbs',
        description:
          'Toss the shredded cheddar, chives, and thyme into the flour-butter mixture until coated.',
        duration_minutes: 2,
      },
      {
        title: 'Add wet ingredients',
        description:
          'Add cold discard and cold buttermilk. Mix with a fork until dough just barely comes together — it will look shaggy and rough. That is exactly right. Do not overwork it.',
        duration_minutes: 2,
      },
      {
        title: 'Laminate the dough',
        description:
          'Turn dough onto a lightly floured surface. Pat gently into a 1-inch-thick rectangle. Fold in half like a letter, pat back to 1 inch, and fold once more. This creates layers. Pat to 1-inch thickness one final time.',
        duration_minutes: 3,
      },
      {
        title: 'Cut and bake',
        description:
          'Using a sharp 2½-inch round biscuit cutter, press straight down without twisting — twisting seals the edges and prevents rising. Place biscuits on prepared baking sheet, sides touching for soft biscuits or 2 inches apart for crustier ones. Bake 15–18 minutes until tall, golden brown on top, and cooked through.',
        duration_minutes: 18,
      },
      {
        title: 'Brush and serve',
        description:
          'The moment they come out of the oven, brush generously with garlic butter. Serve immediately. These do not keep well and do not need to — they will be gone before they cool.',
        duration_minutes: 2,
      },
    ] as Step[],
    tags: ['discard', 'biscuits', 'cheddar', 'herb', 'Southern', 'beginner', 'side dish', 'breakfast'],
    published: true,
  },

  {
    title: 'Sourdough Banana Bread',
    slug: 'sourdough-banana-bread',
    description:
      "This is the banana bread recipe that will make your neighbors come knockin'. The sourdough discard adds a depth of flavor that regular banana bread just cannot touch — a gentle tang that plays beautifully against the sweet, caramelized banana. Dense enough to slice, moist enough to eat plain, and perfect enough to share. Or not.",
    category: 'discard',
    is_premium: true,
    prep_time_minutes: 15,
    bake_time_minutes: 65,
    difficulty: 'beginner',
    ingredients: [
      { item: 'sourdough starter discard', amount: '½ cup (120g)', note: 'unfed, room temperature' },
      { item: 'very ripe bananas, mashed', amount: '3 large (about 1½ cups / 340g)', note: 'the blacker and spottier, the sweeter and better' },
      { item: 'all-purpose flour', amount: '1¾ cups (210g)' },
      { item: 'granulated sugar', amount: '¾ cup (150g)' },
      { item: 'unsalted butter, melted', amount: '⅓ cup (75g)' },
      { item: 'large eggs', amount: '2' },
      { item: 'pure vanilla extract', amount: '1 teaspoon' },
      { item: 'baking soda', amount: '1 teaspoon' },
      { item: 'fine salt', amount: '½ teaspoon' },
      { item: 'ground cinnamon', amount: '1 teaspoon' },
      { item: 'semi-sweet chocolate chips or chopped walnuts', amount: '½ cup (85g)', note: 'optional but highly encouraged' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Preheat and prep',
        description:
          'Preheat oven to 350°F. Grease a 9×5-inch loaf pan or line it with parchment paper, leaving some overhang on the sides for easy lifting.',
        duration_minutes: 5,
      },
      {
        title: 'Mash the bananas',
        description:
          'Mash bananas very thoroughly with a fork in a large bowl until nearly smooth. A few small lumps are completely fine. Use the ripest, most spotted bananas you can find — they are sweeter, more flavorful, and easier to mash.',
        duration_minutes: 3,
      },
      {
        title: 'Mix wet ingredients',
        description:
          'To the mashed bananas, add melted butter, eggs, sourdough discard, and vanilla extract. Whisk until well combined.',
        duration_minutes: 2,
      },
      {
        title: 'Mix dry ingredients',
        description:
          'In a separate bowl, whisk flour, sugar, baking soda, salt, and cinnamon together.',
        duration_minutes: 2,
      },
      {
        title: 'Combine',
        description:
          'Add dry ingredients to wet ingredients and fold gently with a spatula until just combined. Fold in chocolate chips or walnuts if using. Do not overmix — a few flour streaks are fine; tough banana bread is not.',
        duration_minutes: 2,
      },
      {
        title: 'Pour and bake',
        description:
          'Pour batter into prepared loaf pan. If you have a spare banana, press a few slices on top for a beautiful presentation. Bake 60–65 minutes until a toothpick inserted in the center comes out clean or with a few moist crumbs. If the top is browning too fast after 45 minutes, tent loosely with foil.',
        duration_minutes: 65,
      },
      {
        title: 'Cool before slicing',
        description:
          'Cool in the pan 10 minutes, then use the parchment overhang to lift onto a wire rack. Let cool at least 30 minutes before slicing — cutting too early makes the inside gummy. An hour is better. We know. It is hard.',
        duration_minutes: 30,
      },
    ] as Step[],
    tags: ['discard', 'banana bread', 'quick bread', 'beginner', 'snack', 'chocolate', 'classic'],
    published: true,
  },

  // ─── PREMIUM ROLLS & FLATBREADS ────────────────────────────────────────────

  {
    title: 'Sourdough Focaccia',
    slug: 'sourdough-focaccia',
    description:
      "Pillowy, olive-oil-drenched, and dimpled all the way to the bottom of the pan — this focaccia is practically a religious experience. The long cold ferment builds incredible flavor, and the generous pour of good olive oil gives you that impossibly crispy bottom and tender, airy crumb. Top it with whatever your heart desires, darlin'.",
    category: 'focaccia',
    is_premium: true,
    prep_time_minutes: 45,
    bake_time_minutes: 25,
    difficulty: 'intermediate',
    ingredients: [
      { item: 'bread flour', amount: '500g', note: 'all-purpose flour works too' },
      { item: 'warm water (around 86°F)', amount: '430g' },
      { item: 'active sourdough starter', amount: '100g', note: '100% hydration' },
      { item: 'fine sea salt', amount: '10g' },
      { item: 'good extra-virgin olive oil', amount: '½ cup (120ml)', note: 'divided — do not skimp here' },
      { item: 'garlic cloves, thinly sliced', amount: '4 cloves' },
      { item: 'fresh rosemary, leaves stripped', amount: '2 sprigs' },
      { item: 'flaky sea salt (Maldon or fleur de sel)', amount: '1 teaspoon', note: 'for finishing' },
      { item: 'freshly cracked black pepper', amount: 'to taste' },
      { item: 'cherry tomatoes or Kalamata olives', amount: '½ cup', note: 'optional toppings — press into dimples' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Mix the dough',
        description:
          'Combine flour, 380g warm water, and starter in a large bowl. Mix with your hands or a spatula until no dry flour remains. Cover and rest 30–45 minutes.',
        duration_minutes: 45,
      },
      {
        title: 'Add salt',
        description:
          'Dissolve salt in the remaining 50g water and pour over dough. Squeeze and fold through fingers for 2–3 minutes until fully incorporated. Drizzle 2 tablespoons olive oil over dough. Cover and rest 30 minutes.',
        duration_minutes: 30,
      },
      {
        title: 'Coil folds',
        description:
          'Perform 3–4 coil folds every 30 minutes: reach under the center of the dough, lift it up, and let the ends fall down and fold underneath. Rotate 90° and repeat. The dough will go from ragged to smooth and pillowy.',
        duration_minutes: 120,
      },
      {
        title: 'Bulk ferment',
        description:
          'After folds, bulk ferment at room temperature until the dough is very puffy, jiggly, and has grown about 75%. This takes 2–4 more hours at room temp, or you can refrigerate overnight (8–16 hours) for a more flavorful result. Cold ferment is strongly recommended, darlin\'.',
        duration_minutes: 240,
      },
      {
        title: 'Pan and stretch',
        description:
          'Pour 3 tablespoons olive oil into a rimmed 13×18-inch sheet pan (for thin focaccia) or 9×13-inch pan (for thick focaccia). Transfer dough to pan. Gently stretch to fill the pan as best you can. If it springs back, let it rest 20 minutes and try again.',
        duration_minutes: 30,
      },
      {
        title: 'Final proof',
        description:
          'Cover pan loosely with plastic wrap and let rise at room temperature 2–4 hours until very puffy and wobbly when you shake the pan.',
        duration_minutes: 240,
      },
      {
        title: 'Dimple and top',
        description:
          'Preheat oven to 450°F. Drizzle remaining olive oil generously over the dough. Wet your fingers thoroughly and push deep dimples all the way to the bottom of the pan across the entire surface. Press garlic slices, rosemary, tomatoes, or olives into the dimples. Sprinkle liberally with flaky salt and cracked black pepper.',
        duration_minutes: 5,
      },
      {
        title: 'Bake and finish',
        description:
          'Bake 20–25 minutes until deeply golden on top and the bottom is crispy and brown (lift a corner with a spatula to check). Immediately transfer to a cooling rack and brush with a final drizzle of good olive oil while still hot. Slice and serve warm. This is the bread that requires no butter, no accompaniment, and no occasion.',
        duration_minutes: 25,
      },
    ] as Step[],
    tags: ['sourdough', 'focaccia', 'Italian', 'olive oil', 'flatbread', 'intermediate', 'crowd pleaser'],
    published: true,
  },

  {
    title: 'Sourdough Dinner Rolls',
    slug: 'sourdough-dinner-rolls',
    description:
      "Soft, pillowy, slightly sweet dinner rolls with a gorgeous golden top and a pull-apart tenderness that makes everyone reach for seconds before they have finished their first. These are the rolls that make holiday tables feel special and weeknight suppers feel like celebrations. Make them ahead, honey — they hold beautifully.",
    category: 'rolls',
    is_premium: true,
    prep_time_minutes: 60,
    bake_time_minutes: 25,
    difficulty: 'intermediate',
    ingredients: [
      { item: 'bread flour', amount: '400g' },
      { item: 'active sourdough starter', amount: '75g', note: '100% hydration, fed 4–8 hours before use' },
      { item: 'whole milk, warmed to 90°F', amount: '200g' },
      { item: 'water', amount: '50g' },
      { item: 'large egg plus 1 extra yolk', amount: '1 whole egg + 1 yolk', note: 'the yolk adds richness and a golden crumb' },
      { item: 'unsalted butter, softened', amount: '40g', note: 'plus more for brushing after baking' },
      { item: 'raw honey', amount: '30g (about 1½ tablespoons)' },
      { item: 'fine sea salt', amount: '8g' },
      { item: 'egg wash', amount: '1 egg beaten with 1 tablespoon milk', note: 'for brushing before baking' },
      { item: 'flaky sea salt', amount: '½ teaspoon', note: 'for topping' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Mix the dough',
        description:
          'Combine flour, starter, warm milk, water, whole egg, egg yolk, and honey in a large bowl. Mix until a shaggy dough forms. Cover and rest 30–45 minutes.',
        duration_minutes: 45,
      },
      {
        title: 'Add butter and salt',
        description:
          'Add salt and softened butter in 3 small additions. After each addition, knead or squeeze the dough until the butter is fully incorporated before adding the next portion. The dough will be sticky at first — keep going. Eventually it will come together into a smooth, slightly tacky dough. Rest 30 minutes.',
        duration_minutes: 30,
      },
      {
        title: 'Bulk fermentation',
        description:
          'Perform 3 sets of stretch and folds every 30 minutes. Then bulk ferment at 75°F for 3–5 hours until dough has grown about 75% and feels pillowy and airy.',
        duration_minutes: 300,
      },
      {
        title: 'Divide and shape',
        description:
          'Turn dough onto a lightly floured surface. Divide into 12 equal pieces — weigh them for consistency, about 65–70g each. Shape each piece into a tight ball by pulling the edges underneath and rolling with a cupped hand on the counter with gentle pressure.',
        duration_minutes: 15,
      },
      {
        title: 'Second rise',
        description:
          'Arrange rolls in a buttered 9×13-inch baking dish, touching each other. Cover with plastic wrap. For overnight rolls: refrigerate 8–14 hours, then pull out 1–2 hours before baking to come to room temperature. For same-day: proof at room temperature 2–4 hours until rolls are puffy and the spaces between them are nearly filled.',
        duration_minutes: 120,
      },
      {
        title: 'Brush with egg wash',
        description:
          'Preheat oven to 375°F. Brush tops of rolls generously with egg wash. Sprinkle with flaky salt.',
        duration_minutes: 5,
      },
      {
        title: 'Bake',
        description:
          'Bake 22–25 minutes until deep golden brown. The rolls should sound hollow when you tap the top.',
        duration_minutes: 25,
      },
      {
        title: 'Butter and serve',
        description:
          'Immediately brush the hot rolls with melted butter — generously. Let cool 10 minutes before pulling apart. These rolls are worth every single step, I promise you, sugar.',
        duration_minutes: 10,
      },
    ] as Step[],
    tags: ['sourdough', 'rolls', 'dinner rolls', 'holiday', 'pull-apart', 'intermediate', 'make-ahead'],
    published: true,
  },

  {
    title: 'Sourdough Cinnamon Rolls',
    slug: 'sourdough-cinnamon-rolls',
    description:
      "Big, fluffy, gooey cinnamon rolls with swirls of brown sugar and cinnamon throughout, finished with a tangy cream cheese frosting that just barely melts into the hot rolls. The sourdough gives them a complexity that a can from the store simply cannot touch. These are a labor of love, and every single minute is worth it, sugar.",
    category: 'rolls',
    is_premium: true,
    prep_time_minutes: 90,
    bake_time_minutes: 30,
    difficulty: 'intermediate',
    ingredients: [
      { item: 'all-purpose flour', amount: '400g' },
      { item: 'active sourdough starter', amount: '100g', note: '100% hydration, fed 4–8 hours before use' },
      { item: 'whole milk, warmed to 90°F', amount: '180g' },
      { item: 'large eggs', amount: '2' },
      { item: 'unsalted butter, softened', amount: '60g', note: 'plus 4 tablespoons softened for the filling' },
      { item: 'granulated sugar', amount: '50g' },
      { item: 'fine sea salt', amount: '8g' },
      { item: 'light brown sugar, packed', amount: '⅔ cup (135g)', note: 'for the cinnamon filling' },
      { item: 'ground cinnamon', amount: '2 tablespoons', note: 'for the filling — use good Vietnamese cinnamon if you can' },
      { item: 'cream cheese, softened', amount: '4 ounces (115g)', note: 'for the frosting' },
      { item: 'powdered sugar', amount: '1½ cups (180g)', note: 'for the frosting' },
      { item: 'heavy cream', amount: '3–4 tablespoons', note: 'for the frosting — adjust for drizzle or thick consistency' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Mix the dough',
        description:
          'Combine flour, starter, warm milk, eggs, sugar, and salt. Mix into a shaggy dough. Cover and rest 30–45 minutes.',
        duration_minutes: 45,
      },
      {
        title: 'Add butter and develop gluten',
        description:
          'Add 60g softened butter in 3 additions, kneading well after each. Knead or perform stretch and folds until the dough passes the windowpane test — stretch a small piece thin enough to see light through it without tearing. This usually takes 10–15 minutes of kneading or about 8 folds over 2 hours. Rest 30 minutes.',
        duration_minutes: 30,
      },
      {
        title: 'Bulk fermentation',
        description:
          'Perform 3 sets of stretch and folds every 30 minutes. Then bulk ferment at 75°F for 3–5 hours until dough has grown 75% and feels airy. For best flavor, after 2 hours at room temp, refrigerate overnight up to 12 hours. Bring back to room temperature 1 hour before rolling.',
        duration_minutes: 300,
      },
      {
        title: 'Make cinnamon filling',
        description:
          'Mix together brown sugar and cinnamon in a small bowl. Have the 4 tablespoons softened butter ready.',
        duration_minutes: 2,
      },
      {
        title: 'Roll and fill',
        description:
          'On a lightly floured surface, roll dough into a 12×18-inch rectangle, keeping edges as straight as possible. Spread softened butter evenly all the way to the edges. Sprinkle the cinnamon sugar mixture evenly over the butter, right to the edges.',
        duration_minutes: 10,
      },
      {
        title: 'Roll, cut, and proof',
        description:
          'Starting from the long side, roll the dough tightly into an even log. Pinch the seam shut. Cut into 12 rolls about 1½ inches thick using unflavored dental floss (slide under the log, cross over the top, pull) or a sharp knife. Place in a buttered 9×13-inch pan. Cover and proof at room temperature 2–4 hours until rolls are puffy and touching.',
        duration_minutes: 15,
      },
      {
        title: 'Bake',
        description:
          'Preheat oven to 375°F. Bake 28–32 minutes until deep golden brown on top. If tops are browning too fast, tent loosely with foil after 20 minutes.',
        duration_minutes: 30,
      },
      {
        title: 'Make frosting and serve',
        description:
          'Beat softened cream cheese until fluffy. Add powdered sugar and heavy cream and beat until smooth and spreadable. Spread generously over rolls while they are still warm — the frosting will melt slightly into all those beautiful swirls. Serve immediately. These are best hot from the oven, honey, and nothing else even comes close.',
        duration_minutes: 5,
      },
    ] as Step[],
    tags: ['sourdough', 'cinnamon rolls', 'rolls', 'breakfast', 'sweet', 'cream cheese frosting', 'intermediate', 'brunch'],
    published: true,
  },

  {
    title: 'Sourdough Pita',
    slug: 'sourdough-pita',
    description:
      "Hot, puffy, soft pita bread that balloons up in the oven right before your eyes — it's pure magic, darlin'. The sourdough starter gives these pitas a gentle tang and a chewiness that store-bought pitas simply dream about. Stuff them, dip them in hummus, or just tear off pieces fresh from the oven.",
    category: 'other',
    is_premium: true,
    prep_time_minutes: 30,
    bake_time_minutes: 15,
    difficulty: 'intermediate',
    ingredients: [
      { item: 'all-purpose flour', amount: '300g', note: 'or 250g all-purpose + 50g whole wheat for more flavor' },
      { item: 'active sourdough starter', amount: '100g', note: '100% hydration' },
      { item: 'warm water (around 90°F)', amount: '200g' },
      { item: 'fine sea salt', amount: '7g' },
      { item: 'extra-virgin olive oil', amount: '1 tablespoon' },
      { item: 'honey', amount: '1 teaspoon', note: 'feeds the starter and promotes browning' },
      { item: 'rice flour or semolina', amount: 'as needed', note: 'for dusting the rolling surface and peel' },
      { item: 'olive oil spray or light brushing', amount: 'as needed', note: 'for the hot baking stone or sheet' },
    ] as Ingredient[],
    steps: [
      {
        title: 'Mix the dough',
        description:
          'Combine flour, starter, warm water, olive oil, and honey. Mix until no dry flour remains. Rest 10 minutes uncovered, then add salt and knead briefly — just 2–3 minutes until smooth. The dough should be soft and slightly tacky but not sticky.',
        duration_minutes: 20,
      },
      {
        title: 'Bulk fermentation',
        description:
          'Cover dough and bulk ferment at room temperature 4–6 hours, performing 3 sets of stretch and folds in the first 90 minutes. For best flavor and reliability, after the room-temperature bulk, refrigerate overnight up to 12 hours. The cold retard relaxes the gluten for easier rolling and deepens the flavor.',
        duration_minutes: 360,
      },
      {
        title: 'Divide and ball',
        description:
          'Turn dough onto a lightly floured surface. Divide into 8 equal pieces — about 80–85g each. Roll each into a smooth ball. Cover with a damp kitchen towel and rest 20–30 minutes. Do not skip this rest — relaxed gluten rolls much more easily.',
        duration_minutes: 30,
      },
      {
        title: 'Roll thin and even',
        description:
          'On a lightly floured surface, roll each ball into a flat round about 6–7 inches in diameter and ⅛ inch thick. Thin and perfectly even is the goal — uneven pitas inflate unevenly and often do not puff at all. Take your time with each one.',
        duration_minutes: 20,
      },
      {
        title: 'Rest rolled pitas',
        description:
          'Place rolled pitas on parchment-lined baking sheets. Let rest uncovered 10–15 minutes. This brief rest lets the rolled shape relax and ensures even baking.',
        duration_minutes: 15,
      },
      {
        title: 'Preheat the stone',
        description:
          'Place a baking stone or a heavy, rimless baking sheet in the oven. Preheat to 500°F for at least 30–45 minutes. The heat must be fierce for pitas to puff — a cold surface means flat bread.',
        duration_minutes: 45,
      },
      {
        title: 'Bake in batches',
        description:
          'Lightly dust a pizza peel or thin cutting board with rice flour or semolina. Slide 2–3 pitas at a time onto the screaming hot stone. Bake 3–5 minutes until puffed like a pillow and just barely golden — you want them soft and pliable, not crispy or browned.',
        duration_minutes: 15,
      },
      {
        title: 'Wrap and serve',
        description:
          'Wrap hot pitas immediately in a clean kitchen towel as they come out of the oven — the steam keeps them soft and pliable. Serve warm. If they do not all puff perfectly the first time, do not be discouraged, darlin\'. It takes one or two bakes to get the feel of it, and they taste wonderful either way.',
        duration_minutes: 2,
      },
    ] as Step[],
    tags: ['sourdough', 'pita', 'flatbread', 'Middle Eastern', 'intermediate', 'versatile', 'dipping'],
    published: true,
  },
]

async function seed() {
  console.log(`Seeding ${recipes.length} recipes into Supabase...`)

  const { data, error } = await supabase
    .from('recipes')
    .upsert(recipes, { onConflict: 'slug' })
    .select('id, title, slug')

  if (error) {
    console.error('Seed failed:', error.message)
    console.error(error)
    process.exit(1)
  }

  console.log(`\nSuccessfully seeded ${data?.length ?? 0} recipes:\n`)
  data?.forEach(r => console.log(`  ✓ [${r.id}] ${r.title} (${r.slug})`))
  console.log('\nDone, sugar.')
}

seed()

/*
 * ─── HOW TO RUN ──────────────────────────────────────────────────────────────
 *
 * This script uses tsx (TypeScript executor) to run directly without compiling.
 * tsx is not in devDependencies, so use npx to run it on demand.
 *
 * Prerequisites:
 *   - Node.js 18+ installed
 *   - .env.local present in the project root with NEXT_PUBLIC_SUPABASE_URL
 *     and SUPABASE_SERVICE_ROLE_KEY set (already the case if the app is running)
 *
 * Run from the project root:
 *
 *   npx tsx scripts/seed-recipes.ts
 *
 * If you see an error about "Cannot find package 'tsx'", install it first:
 *
 *   npm install -D tsx
 *   npx tsx scripts/seed-recipes.ts
 *
 * The script uses upsert (on conflict: slug), so it is safe to run multiple
 * times — existing recipes are updated, not duplicated.
 * ─────────────────────────────────────────────────────────────────────────────
 */
