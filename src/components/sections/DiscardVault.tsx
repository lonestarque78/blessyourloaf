import Link from 'next/link'

const recipes = [
  { name: "Sunday Mornin' Pancakes", time: "20 min", tag: "Breakfast", color: "#f4a261", icon: "🥞" },
  { name: "Sweet Tea Crackers", time: "45 min", tag: "Snackin'", color: "#b5838d", icon: "🫙" },
  { name: "Mama's Pizza Dough", time: "1 hr", tag: "Supper", color: "#6d6875", icon: "🍕" },
  { name: "Peach Cobbler Muffins", time: "35 min", tag: "Dessert", color: "#c9a84c", icon: "🧁" },
]

export default function DiscardVault() {
  return (
    <section className="py-24 px-6" style={{ background: 'linear-gradient(160deg, #f5e6d8, #ede0d4)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">✦ The Discard Vault ✦</p>
          <h2 className="font-playfair text-4xl md:text-5xl font-extrabold text-[#3d2b1f]">Don't you dare throw that away.</h2>
          <div className="w-14 h-0.5 bg-gradient-to-r from-[#c9956c] to-[#b5838d] rounded mx-auto my-4" />
          <p className="font-lora italic text-[#6b4c3b] max-w-md mx-auto">
            "Discard is just starter that ain't reached its full potential yet. We make it shine."
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {recipes.map(r => (
            <div key={r.name} className="bg-white rounded-2xl p-6 shadow-md hover:-translate-y-1 transition-transform cursor-pointer">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ background: r.color + '22', border: `1.5px solid ${r.color}44` }}>
                {r.icon}
              </div>
              <span className="font-lora text-xs px-3 py-1 rounded-full"
                style={{ background: r.color + '18', color: r.color }}>
                {r.tag}
              </span>
              <div className="font-playfair font-bold text-[#3d2b1f] mt-3 mb-2">{r.name}</div>
              <div className="font-lora text-sm text-[#9a7060]">⏱ {r.time}</div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/discard" className="border border-[#c9956c] text-[#7a4f3a] px-7 py-3 rounded-full font-lora text-sm hover:bg-[#c9956c] hover:text-white transition-all inline-block">
            Explore Discard Recipes →
          </Link>
        </div>
      </div>
    </section>
  )
}