import Link from 'next/link'

const freeTier = ["5 recipes", "Starter day tracker", "Basic discard ideas", "Community access"]
const proTier = ["Full recipe library (300+)", "Starter Journal + alerts", "Bake Scheduler", "Full Discard Vault", "Starter Troubleshooter", "Flour & hydration guides", "New recipes every week"]
const annualTier = ["All Pitmaster features", "Priority support", "Early recipe access", "Annual baking planner"]

export default function Pricing() {
  return (
    <section className="py-24 px-6 bg-[#fdf6f0]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">✦ Join the Kitchen ✦</p>
          <h2 className="font-playfair text-4xl md:text-5xl font-extrabold text-[#3d2b1f]">Good bread don't cost much, sugar.</h2>
          <div className="w-14 h-0.5 bg-gradient-to-r from-[#c9956c] to-[#b5838d] rounded mx-auto my-4" />
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center md:items-stretch">
          {/* Free */}
          <div className="bg-white rounded-3xl p-9 shadow-md border border-[#f0e4db] flex-1 max-w-sm">
            <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">Free Forever</div>
            <div className="font-playfair text-5xl font-black text-[#3d2b1f] mb-1">$0</div>
            <p className="font-lora italic text-[#9a7060] text-sm mb-8">Dip your toe in the dough</p>
            {freeTier.map(f => (
              <div key={f} className="flex gap-3 items-center mb-3">
                <span className="text-[#c9956c]">✓</span>
                <span className="font-lora text-sm text-[#3d2b1f]">{f}</span>
              </div>
            ))}
            <Link href="/signup" className="block text-center border border-[#c9956c] text-[#7a4f3a] px-6 py-3 rounded-full font-lora text-sm hover:bg-[#c9956c] hover:text-white transition-all mt-8">
              Get Started Free
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-3xl p-9 flex-1 max-w-sm md:scale-105 shadow-2xl"
            style={{ background: 'linear-gradient(160deg, #3d2b1f, #5c3d2e)', border: '1.5px solid #c9956c' }}>
            <div className="flex justify-between items-start mb-2">
              <div className="font-lora text-xs uppercase tracking-widest text-[#e8b4a0]">Pitmaster</div>
              <span className="bg-gradient-to-r from-[#c9956c] to-[#b5838d] text-white text-xs font-lora px-3 py-1 rounded-full">Most Popular</span>
            </div>
            <div className="font-playfair text-5xl font-black text-white mb-1">$5.99<span className="text-xl font-normal">/mo</span></div>
            <p className="font-lora italic text-[#c9a090] text-sm mb-8">Full run of the kitchen</p>
            {proTier.map(f => (
              <div key={f} className="flex gap-3 items-center mb-3">
                <span className="text-[#c9956c]">✓</span>
                <span className="font-lora text-sm text-[#e8d5c8]">{f}</span>
              </div>
            ))}
            <Link href="/signup?plan=monthly" className="block text-center bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-6 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-lg mt-8">
              Start 7-Day Free Trial →
            </Link>
          </div>

          {/* Annual */}
          <div className="bg-white rounded-3xl p-9 shadow-md border border-[#f0e4db] flex-1 max-w-sm">
            <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-2">Annual</div>
            <div className="font-playfair text-5xl font-black text-[#3d2b1f] mb-1">$55.99<span className="text-xl font-normal">/yr</span></div>
            <span className="inline-block bg-gradient-to-r from-[#e8b4a0] to-[#c9956c] text-white text-xs font-lora px-3 py-1 rounded-full mb-6">Save 20% · Best Value</span>
            {annualTier.map(f => (
              <div key={f} className="flex gap-3 items-center mb-3">
                <span className="text-[#c9956c]">✓</span>
                <span className="font-lora text-sm text-[#3d2b1f]">{f}</span>
              </div>
            ))}
            <Link href="/signup?plan=annual" className="block text-center bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-6 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-lg mt-8">
              Go Annual
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}