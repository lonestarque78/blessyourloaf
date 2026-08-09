import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import TemperaturePredictorTool from '@/components/tools/TemperaturePredictorTool'

export default function TemperatureGuidePage() {
  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">✦ Baker&apos;s Tools ✦</p>
          <h1 className="font-playfair text-5xl font-bold text-[#3d2b1f] mb-4">
            Temperature Guide
          </h1>
          <p className="font-lora italic text-[#9a7060] max-w-lg mx-auto">
            &quot;A recipe&apos;s just a starting point. Your kitchen has the final say.&quot;
          </p>
        </div>

        <div className="mb-12">
          <TemperaturePredictorTool />
        </div>

        {/* Why temperature matters */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] mb-12">
          <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-4">Why temperature matters so much</h2>
          <p className="font-lora text-[#6b4c3b] leading-relaxed mb-4">
            The wild yeast and bacteria in your starter are living things — they eat, breathe, and multiply faster or slower depending on how warm they are, the same way most living things do. Recipe times are always written for one specific temperature, usually somewhere around 75-78°F. If your kitchen runs warmer or cooler than that, the recipe&apos;s clock stops being reliable.
          </p>
          <p className="font-lora text-[#6b4c3b] leading-relaxed mb-4">
            That&apos;s why we always say to watch the dough, not the clock — but knowing roughly how much extra (or less) time to expect helps you plan your day instead of getting surprised.
          </p>
          <p className="font-lora italic text-[#7a4f3a]">
            &quot;Summer kitchen running hot? Your bulk ferment that usually takes 4 hours might be done in 2. Winter got you at 65°F? Budget most of the day for it.&quot;
          </p>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg, #3d2b1f, #5c3d2e)' }}>
          <h2 className="font-playfair text-2xl font-bold text-white mb-3">
            Want this factored into your whole bake schedule?
          </h2>
          <p className="font-lora italic text-[#c9a090] text-sm mb-6 max-w-md mx-auto">
            The Bake Scheduler already accounts for your starter&apos;s activity when it plans your timing — sign up and try it.
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
