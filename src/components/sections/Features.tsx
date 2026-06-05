const features = [
  { icon: "🫙", label: "Starter Journal", bg: "#f9ede5", desc: "Name her, track her feedings, and watch her grow from a tiny flour paste into something glorious." },
  { icon: "📅", label: "Bake Scheduler", bg: "#f0e8f0", desc: "Tell us when you want fresh bread. We'll work backwards and hand you a step-by-step timeline." },
  { icon: "🗄️", label: "Discard Vault", bg: "#fef3e2", desc: "A growing library of recipes for your leftover starter. Pancakes, crackers, pasta — not a drop goes to waste." },
  { icon: "🩺", label: "Starter Troubleshooter", bg: "#e8f4f0", desc: "Starter smells funny? Not rising? Tell us what's goin' on and we'll nurse her back to health." },
  { icon: "📖", label: "Recipe Library", bg: "#fde8e8", desc: "Loaves, rolls, focaccia, and more — each one tested in a real Southern kitchen." },
  { icon: "🌾", label: "Flour Guide", bg: "#f5f0e8", desc: "All-purpose, whole wheat, rye — we break down every flour so you know exactly what you're workin' with." },
]

export default function Features() {
  return (
    <section className="py-24 px-6 bg-[#fdf6f0]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">✦ Everything You Need ✦</p>
          <h2 className="font-playfair text-4xl md:text-5xl font-extrabold text-[#3d2b1f]">Your full sourdough kitchen, sugar.</h2>
          <div className="w-14 h-0.5 bg-gradient-to-r from-[#c9956c] to-[#b5838d] rounded mx-auto my-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon, label, bg, desc }) => (
            <div key={label} className="bg-white rounded-2xl p-7 shadow-md hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4" style={{ background: bg }}>
                {icon}
              </div>
              <div className="font-playfair text-lg font-bold text-[#3d2b1f] mb-2">{label}</div>
              <p className="font-lora italic text-sm text-[#6b4c3b] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}