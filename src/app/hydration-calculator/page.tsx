import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import HydrationCalculatorTool from '@/components/tools/HydrationCalculatorTool'

export default function HydrationCalculatorPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">✦ Baker&apos;s Tools ✦</p>
          <h1 className="font-playfair text-5xl font-bold text-[#3d2b1f] mb-4">
            Hydration Calculator
          </h1>
          <p className="font-lora italic text-[#9a7060] max-w-lg mx-auto">
            &quot;Hydration is just flour and water getting to know each other. Let&apos;s do the math.&quot;
          </p>
        </div>

        <div className="mb-12">
          <HydrationCalculatorTool />
        </div>

        {/* What is hydration */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] mb-12">
          <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-4">What is baker&apos;s hydration?</h2>
          <p className="font-lora text-[#6b4c3b] leading-relaxed mb-4">
            Hydration is the weight of water in a dough as a percentage of the weight of flour — 500g flour and 375g water is 75% hydration. It&apos;s the single biggest lever you have over how a dough feels and bakes: higher hydration makes a wetter, stickier dough with a more open, airy crumb; lower hydration makes a firmer dough that&apos;s easier to handle and shape.
          </p>
          <p className="font-lora italic text-[#7a4f3a]">
            &quot;New to this? Stay around 65-70% until you get a feel for handling wet dough. You can always work your way up.&quot;
          </p>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg, #3d2b1f, #5c3d2e)' }}>
          <h2 className="font-playfair text-2xl font-bold text-white mb-3">
            Want a hydration calculator that knows your starter?
          </h2>
          <p className="font-lora italic text-[#c9a090] text-sm mb-6 max-w-md mx-auto">
            Save your starters in Bless Your Loaf and every bake schedule accounts for her hydration automatically.
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
