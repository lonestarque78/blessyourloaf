'use client'

import Link from 'next/link'

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center relative overflow-hidden px-6 pt-28 pb-20"
      style={{ background: 'linear-gradient(160deg, #fdf6f0 0%, #f5e6d8 50%, #ede0d4 100%)' }}>

      {/* Decorative blobs */}
      <div className="absolute top-[10%] right-[5%] w-96 h-96 rounded-[60%_40%_70%_30%/50%_60%_40%_50%] opacity-60"
        style={{ background: 'linear-gradient(135deg, rgba(201,149,108,0.25), rgba(181,131,141,0.25))', filter: 'blur(2px)' }} />
      <div className="absolute bottom-[10%] left-[2%] w-72 h-72 rounded-[40%_60%_30%_70%/60%_40%_60%_40%]"
        style={{ background: 'linear-gradient(135deg, rgba(232,180,160,0.2), rgba(201,149,108,0.15))' }} />

      <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center gap-16 relative">
        {/* Text */}
        <div className="flex-1 animate-fadeInUp">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-4">✦ Homemade, Honey ✦</p>
          <h1 className="font-playfair text-5xl md:text-7xl font-black leading-[1.1] mb-6">
            Sourdough that'd make{' '}
            <span className="bg-gradient-to-r from-[#e8b4a0] via-[#c9956c] to-[#b5838d] bg-clip-text text-transparent">
              Grandmama proud.
            </span>
          </h1>
          <p className="font-lora italic text-lg leading-relaxed text-[#6b4c3b] max-w-lg mb-10">
            "Sugar, there ain't a thing in this world more satisfying than pullin' a golden loaf outta the oven that you grew yourself — starter and all."
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/signup" className="bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-8 py-4 rounded-full font-lora hover:-translate-y-0.5 transition-transform shadow-lg shadow-[#b07d62]/30">
              Start Bakin', Darlin' →
            </Link>
            <Link href="/recipes" className="border border-[#c9956c] text-[#7a4f3a] px-7 py-3.5 rounded-full font-lora text-sm hover:bg-[#c9956c] hover:text-white transition-all">
              See the Recipes
            </Link>
          </div>

          <div className="flex gap-10 mt-14">
            {[['12k+', 'Happy Bakers'], ['300+', 'Recipes'], ['5 days', 'Starter to Loaf']].map(([num, label]) => (
              <div key={label}>
                <div className="font-playfair text-3xl font-bold text-[#b07d62]">{num}</div>
                <div className="font-lora text-xs text-[#9a7060] tracking-wide mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating bread */}
        <div className="flex-shrink-0 animate-float">
          <div className="w-72 h-72 md:w-80 md:h-80 rounded-full flex items-center justify-center text-[8rem] shadow-2xl border-4 border-white/60"
            style={{ background: 'linear-gradient(145deg, #f0d5c0, #e8c4a8, #d4a080)', boxShadow: '0 20px 60px rgba(176,125,98,0.3), inset 0 -10px 30px rgba(0,0,0,0.08)' }}>
            🍞
          </div>
        </div>
      </div>
    </section>
  )
}