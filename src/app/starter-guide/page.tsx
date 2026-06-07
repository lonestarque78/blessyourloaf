import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const steps = [
  {
    day: 'Day 1',
    title: 'Mix your first feeding',
    description: 'In a clean jar, mix 50g of flour and 50g of room temperature water until no dry flour remains. Cover loosely — she needs air to breathe. Leave her somewhere warm, around 70-75°F.',
    tip: "Use a rubber band to mark where she starts. That way you can see if she's risen, sugar.",
    what_to_expect: 'Nothing much yet. She might look lumpy and smell like raw flour. That is perfectly normal.',
  },
  {
    day: 'Days 2-3',
    title: 'First signs of life',
    description: 'Discard all but 50g of your starter. Feed with 50g flour and 50g water. Repeat this every 24 hours. Keep her in that warm spot.',
    tip: "Don't throw away the discard — save it in a separate jar in the fridge. You can use it for pancakes even this early.",
    what_to_expect: 'You might see some bubbles forming. She might smell a little funky — almost like cheese or acetone. This is normal and temporary.',
  },
  {
    day: 'Days 4-7',
    title: 'Building strength',
    description: 'Keep discarding and feeding every 24 hours. If she is rising and falling predictably, try feeding twice a day — once in the morning and once at night.',
    tip: "If she smells like nail polish remover, she's too hungry. Feed her more frequently, darlin'.",
    what_to_expect: 'Bubbles throughout, a domed top, and a more pleasant yeasty or tangy smell. She should be doubling in size within 4-8 hours of a feeding.',
  },
  {
    day: 'Week 2+',
    title: 'The float test',
    description: 'Drop a small spoonful of your starter into a glass of water. If it floats, she is ready to bake with. If it sinks, keep feeding for a few more days.',
    tip: "The float test isn't perfect — some healthy starters sink. The best sign is consistent doubling within 4-6 hours of feeding.",
    what_to_expect: 'A mature starter smells pleasantly sour and yeasty, doubles reliably, and has a domed top with lots of bubbles when at peak.',
  },
]

const faqs = [
  {
    q: "How long does it take to make a starter?",
    a: "Most starters are ready to bake with in 7-14 days, but some take 3-4 weeks. Temperature, flour type, and the wild yeast in your environment all play a role. Don't rush her, honey."
  },
  {
    q: "What flour should I use?",
    a: "All-purpose or bread flour works great for beginners. Adding a tablespoon of whole wheat or rye flour speeds things up — those flours have more wild yeast and nutrients. Check our Flour Guide for more detail."
  },
  {
    q: "My starter smells bad. Is it dead?",
    a: "Almost certainly not. Young starters go through a smelly phase — acetone, cheese, even vomit smells are all normal in the first week. Keep feeding and she'll come around. Check the Starter Troubleshooter if you're worried."
  },
  {
    q: "There's liquid on top. Is that mold?",
    a: "That's hooch — a layer of alcohol produced when your starter is hungry. It's gray or dark in color, not fuzzy. Just stir it in or pour it off and feed her. Mold is fuzzy and colorful (pink, orange, black). If you see actual mold, scoop it out and hope for the best."
  },
  {
    q: "How do I store my starter long term?",
    a: "Once established, keep her in the fridge and feed once a week. Take her out the night before baking, feed her, and let her come to peak activity at room temperature before using."
  },
  {
    q: "Can I use a starter that hasn't been fed in months?",
    a: "Usually yes. Discard most of it, feed what's left, and give her a few days of regular feedings to wake back up. Starters are more resilient than you think, sugar."
  },
]

export default function StarterGuidePage() {
  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">✦ The Starter Guide ✦</p>
          <h1 className="font-playfair text-5xl font-bold text-[#3d2b1f] mb-4">
            Grow your starter from scratch.
          </h1>
          <p className="font-lora italic text-[#9a7060] max-w-lg mx-auto">
            "All you need is flour, water, and patience, darlin'. Your starter will do the rest."
          </p>
        </div>

        {/* What is a starter */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] mb-12">
          <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-4">What is a sourdough starter?</h2>
          <p className="font-lora text-[#6b4c3b] leading-relaxed mb-4">
            A sourdough starter is a living culture of wild yeast and bacteria that you grow at home using nothing but flour and water. It's the leavening agent that makes sourdough bread rise — no commercial yeast needed.
          </p>
          <p className="font-lora text-[#6b4c3b] leading-relaxed mb-4">
            The wild yeast produces carbon dioxide (which makes the bread rise) and the bacteria produce lactic and acetic acids (which give sourdough its signature tangy flavor). Together they create something no commercial yeast can replicate.
          </p>
          <p className="font-lora italic text-[#7a4f3a]">
            "Think of her as a pet, sugar. Feed her regularly, keep her comfortable, and she'll take care of you for years."
          </p>
        </div>

        {/* What you need */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] mb-12">
          <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-5">What you'll need</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { item: 'A clean glass jar', note: 'At least 1 quart — she needs room to grow' },
              { item: 'A kitchen scale', note: 'Measuring by weight is far more accurate than cups' },
              { item: 'All-purpose or bread flour', note: 'Unbleached works best' },
              { item: 'Non-chlorinated water', note: 'Filtered or left out overnight if your tap is heavily chlorinated' },
              { item: 'A rubber band', note: 'To mark her rise level after each feeding' },
              { item: 'A warm spot', note: '70-75°F is ideal — on top of the fridge or near the oven' },
            ].map(({ item, note }) => (
              <div key={item} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-[#c9956c] mt-2 flex-shrink-0" />
                <div>
                  <div className="font-lora font-medium text-[#3d2b1f]">{item}</div>
                  <div className="font-lora text-xs italic text-[#9a7060]">{note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Day by day guide */}
        <h2 className="font-playfair text-3xl font-bold text-[#3d2b1f] mb-8">The day-by-day guide</h2>
        <div className="space-y-6 mb-16">
          {steps.map((step, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db]">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-4 py-1.5 rounded-full font-lora text-sm">
                  {step.day}
                </div>
                <h3 className="font-playfair text-xl font-bold text-[#3d2b1f]">{step.title}</h3>
              </div>
              <p className="font-lora text-[#6b4c3b] leading-relaxed mb-4">{step.description}</p>
              <div className="bg-[#f9ede5] rounded-xl p-4 mb-4">
                <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-1">Miss Loretta Mae says</div>
                <p className="font-lora italic text-sm text-[#7a4f3a]">"{step.tip}"</p>
              </div>
              <div className="bg-[#f0e8f0] rounded-xl p-4">
                <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-1">What to expect</div>
                <p className="font-lora text-sm text-[#3d2b1f]">{step.what_to_expect}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="font-playfair text-3xl font-bold text-[#3d2b1f] mb-8">Common questions</h2>
        <div className="space-y-4 mb-16">
          {faqs.map(({ q, a }) => (
            <div key={q} className="bg-white rounded-2xl p-6 shadow-md border border-[#f0e4db]">
              <h3 className="font-playfair font-bold text-[#3d2b1f] mb-2">{q}</h3>
              <p className="font-lora text-sm text-[#6b4c3b] leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg, #3d2b1f, #5c3d2e)' }}>
          <h2 className="font-playfair text-2xl font-bold text-white mb-3">
            Ready to track your starter's journey?
          </h2>
          <p className="font-lora italic text-[#c9a090] text-sm mb-6 max-w-md mx-auto">
            Name her, log her feedings, and watch her grow — right here in Bless Your Loaf.
          </p>
          <Link href="/signup"
            className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-8 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-lg">
            Start Free Today →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}