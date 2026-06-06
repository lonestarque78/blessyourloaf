import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const flours = [
  {
    name: 'All-Purpose Flour',
    protein: '10–12%',
    best_for: 'Beginner loaves, discard recipes, pancakes, crackers',
    difficulty: 'Beginner',
    color: '#f9ede5',
    description: 'The workhorse of the Southern kitchen, sugar. All-purpose is forgiving, widely available, and produces a mild-flavored loaf with a soft, open crumb. Your starter will be happy on it.',
    characteristics: [
      'Moderate protein content means moderate gluten development',
      'Produces a lighter, more open crumb than whole grain flours',
      'Mild flavor that lets your starter shine',
      'Ferments at a predictable, moderate pace',
      'Easiest flour to work with for new bakers',
    ],
    tips: 'If you\'re just starting out, this is your flour, darlin\'. Get comfortable with AP before you start experimenting with others.',
    hydration: '65–75%',
    fermentation: 'Moderate — expect 4–6 hours bulk at 75°F',
  },
  {
    name: 'Bread Flour',
    protein: '12–14%',
    best_for: 'Artisan loaves, bagels, rolls, anything needing strong structure',
    difficulty: 'Beginner',
    color: '#f0e8f0',
    description: 'This is what most professional bakers reach for, honey. The higher protein content builds stronger gluten networks, giving you better oven spring and that gorgeous ear on your scored loaf.',
    characteristics: [
      'Higher protein builds stronger, more extensible gluten',
      'Better oven spring and taller loaves',
      'Chewier crumb with larger, more irregular holes',
      'Can handle higher hydration doughs',
      'Produces a more complex, slightly nuttier flavor',
    ],
    tips: 'Once you\'ve got a few AP loaves under your belt, switch to bread flour. You\'ll notice the difference immediately — more spring, better structure, prettier scoring.',
    hydration: '70–80%',
    fermentation: 'Moderate — similar to AP but handles longer ferments well',
  },
  {
    name: 'Whole Wheat Flour',
    protein: '13–14%',
    best_for: 'Hearty loaves, nutritious everyday bread, adding depth to blends',
    difficulty: 'Intermediate',
    color: '#fef3e2',
    description: 'Whole wheat includes the bran and germ, which means more nutrition, more flavor, and — here\'s the thing, sugar — faster fermentation. The bran cuts gluten strands, so you\'ll need to adjust your timing.',
    characteristics: [
      'Bran and germ add nutty, earthy flavor complexity',
      'Ferments significantly faster than white flours',
      'Bran cuts gluten strands, producing a denser crumb',
      'More nutritious than refined flours',
      'Absorbs more water than white flour',
    ],
    tips: 'Start by substituting just 20–30% whole wheat in your usual recipe before going 100%. Pure whole wheat loaves are dense but deeply flavorful — worth working up to.',
    hydration: '75–85%',
    fermentation: 'Fast — reduce bulk time by 20–30% compared to white flour',
  },
  {
    name: 'Rye Flour',
    protein: '8–9%',
    best_for: 'Dark rye loaves, starter feedings, adding sour complexity',
    difficulty: 'Intermediate',
    color: '#e8f4f0',
    description: 'Rye is the secret weapon of serious sourdough bakers, darlin\'. It ferments faster than any other flour, feeds your starter like nothing else, and adds a deep, earthy complexity that plain white loaves just can\'t match.',
    characteristics: [
      'Contains pentosans instead of gluten — produces sticky, dense dough',
      'Ferments extremely fast due to high enzyme activity',
      'Adds deep, earthy, slightly sour flavor',
      'Excellent for starter maintenance — activates sluggish starters',
      'High in fiber and nutrients',
    ],
    tips: 'Even a tablespoon of rye in your starter feeding will wake her right up. For baking, start with a 10–20% rye blend before attempting a full rye loaf — pure rye is a whole different beast.',
    hydration: '80–90%',
    fermentation: 'Very fast — can double in 2–3 hours at room temperature',
  },
  {
    name: 'Spelt Flour',
    protein: '12–15%',
    best_for: 'Lighter whole grain loaves, digestibility-focused baking',
    difficulty: 'Intermediate',
    color: '#fde8e8',
    description: 'Spelt is an ancient grain that\'s having a moment, sugar. It has good protein content but the gluten is more fragile than modern wheat — which means it ferments quickly and can over-proof on you if you\'re not paying attention.',
    characteristics: [
      'Ancient grain with a sweet, nutty flavor',
      'Gluten is more extensible but less strong than modern wheat',
      'More digestible for some people sensitive to modern wheat',
      'Ferments faster than bread flour',
      'Produces a lighter crumb than whole wheat',
    ],
    tips: 'Handle spelt dough gently — it tears easily if you overwork it. Shorter fermentation times and gentler shaping are your friends here.',
    hydration: '65–75%',
    fermentation: 'Fast — similar pace to whole wheat',
  },
  {
    name: 'Einkorn Flour',
    protein: '18%',
    best_for: 'Ancient grain enthusiasts, highly digestible loaves',
    difficulty: 'Advanced',
    color: '#f5f0e8',
    description: 'Einkorn is the oldest wheat on earth, honey, and it bakes like nothing else. High in protein but with weak gluten structure — it produces a dense, moist, deeply flavorful loaf that\'s unlike any modern wheat bread you\'ve tasted.',
    characteristics: [
      'Highest protein of any wheat but weakest gluten structure',
      'Rich, buttery, almost sweet flavor profile',
      'Very sticky dough that\'s difficult to work with',
      'Does not develop gluten the same way modern wheat does',
      'Highly digestible — often tolerated by those with wheat sensitivities',
    ],
    tips: 'Don\'t try to develop gluten with einkorn the way you would bread flour. Use a no-knead approach, keep hydration lower than you think, and be patient with a long cold proof.',
    hydration: '55–65%',
    fermentation: 'Slow to moderate — enzyme activity is different from modern wheat',
  },
  {
    name: 'Gluten-Free Blends',
    protein: 'Varies',
    best_for: 'Gluten-free bakers, celiac-friendly loaves',
    difficulty: 'Advanced',
    color: '#f0e8f0',
    description: 'Gluten-free sourdough is a whole different craft, darlin\'. Without gluten, you\'re relying on xanthan gum, psyllium husk, or other binders to hold the structure together. It takes patience and experimentation, but it can be done.',
    characteristics: [
      'No gluten means no traditional dough development',
      'Requires binders like psyllium husk or xanthan gum',
      'Starter must be maintained on GF flours (rice, sorghum, buckwheat)',
      'Produces a batter-like dough rather than a shapeable dough',
      'Flavor varies significantly by blend used',
    ],
    tips: 'Use a certified GF sourdough starter fed on rice flour or a certified GF blend. Psyllium husk is your best friend for structure. Bake in a loaf pan rather than free-form.',
    hydration: 'Varies significantly by blend',
    fermentation: 'Varies — GF starters can be unpredictable',
  },
]

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-green-50 text-green-700',
  Intermediate: 'bg-amber-50 text-amber-700',
  Advanced: 'bg-rose-50 text-rose-700',
}

export default function FlourGuidePage() {
  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">✦ The Flour Guide ✦</p>
          <h1 className="font-playfair text-5xl font-bold text-[#3d2b1f] mb-4">
            Know your flour, know your bread.
          </h1>
          <p className="font-lora italic text-[#9a7060] max-w-lg mx-auto">
            "The flour you choose changes everything — the flavor, the texture, the timing. Let me walk you through what you need to know, sugar."
          </p>
        </div>

        {/* Quick comparison table */}
        <div className="bg-white rounded-2xl shadow-md border border-[#f0e4db] mb-16 overflow-hidden">
          <div className="p-6 border-b border-[#f0e4db]">
            <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f]">Quick Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f9ede5]">
                  <th className="text-left font-lora text-xs uppercase tracking-widest text-[#b8896e] px-5 py-3">Flour</th>
                  <th className="text-left font-lora text-xs uppercase tracking-widest text-[#b8896e] px-5 py-3">Protein</th>
                  <th className="text-left font-lora text-xs uppercase tracking-widest text-[#b8896e] px-5 py-3">Hydration</th>
                  <th className="text-left font-lora text-xs uppercase tracking-widest text-[#b8896e] px-5 py-3">Fermentation</th>
                  <th className="text-left font-lora text-xs uppercase tracking-widest text-[#b8896e] px-5 py-3">Level</th>
                </tr>
              </thead>
              <tbody>
                {flours.map((flour, i) => (
                  <tr key={flour.name} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fdf6f0]'}>
                    <td className="font-playfair font-bold text-[#3d2b1f] px-5 py-3">{flour.name}</td>
                    <td className="font-lora text-sm text-[#6b4c3b] px-5 py-3">{flour.protein}</td>
                    <td className="font-lora text-sm text-[#6b4c3b] px-5 py-3">{flour.hydration}</td>
                    <td className="font-lora text-sm text-[#6b4c3b] px-5 py-3">{flour.fermentation.split('—')[0].trim()}</td>
                    <td className="px-5 py-3">
                      <span className={`font-lora text-xs px-2.5 py-1 rounded-full ${difficultyColors[flour.difficulty]}`}>
                        {flour.difficulty}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Individual flour cards */}
        <div className="space-y-8">
          {flours.map(flour => (
            <div key={flour.name} className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-playfair text-3xl font-bold text-[#3d2b1f]">{flour.name}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="font-lora text-xs bg-[#f9ede5] text-[#b07d62] px-3 py-1 rounded-full">
                      Protein: {flour.protein}
                    </span>
                    <span className="font-lora text-xs bg-[#f9ede5] text-[#b07d62] px-3 py-1 rounded-full">
                      Hydration: {flour.hydration}
                    </span>
                    <span className={`font-lora text-xs px-3 py-1 rounded-full ${difficultyColors[flour.difficulty]}`}>
                      {flour.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              <p className="font-lora italic text-[#6b4c3b] leading-relaxed mb-5">{flour.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                <div>
                  <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">Characteristics</div>
                  <ul className="space-y-2">
                    {flour.characteristics.map((c, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#c9956c] mt-1.5 flex-shrink-0" />
                        <span className="font-lora text-sm text-[#3d2b1f]">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">Best For</div>
                    <p className="font-lora text-sm text-[#3d2b1f]">{flour.best_for}</p>
                  </div>
                  <div>
                    <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">Fermentation</div>
                    <p className="font-lora text-sm text-[#3d2b1f]">{flour.fermentation}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#f9ede5] rounded-xl p-4">
                <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-1">Miss Loretta Mae Says</div>
                <p className="font-lora italic text-sm text-[#7a4f3a]">"{flour.tips}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}