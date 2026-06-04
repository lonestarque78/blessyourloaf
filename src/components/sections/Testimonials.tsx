const testimonials = [
  { name: "Dolores M., Nashville", quote: "I killed three starters before this app. Daisy Mae is on Day 47 and she's my pride and joy." },
  { name: "Rebecca T., Charleston", quote: "The bake scheduler changed my life. I just tell it when I want bread and it does all the thinkin' for me." },
  { name: "June P., Atlanta", quote: "Finally used up my discard without feeling guilty. Those sweet tea crackers are gone in under an hour every time." },
]

export default function Testimonials() {
  return (
    <section className="py-24 px-6" style={{ background: 'linear-gradient(160deg, #ede0d4, #e8d5c8)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">✦ From the Kitchen Table ✦</p>
          <h2 className="font-playfair text-4xl font-extrabold text-[#3d2b1f]">What the neighbors are sayin'</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ name, quote }) => (
            <div key={name} className="bg-white rounded-2xl p-7 shadow-md border-l-4 border-[#c9956c]">
              <div className="text-xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="font-lora italic text-[#3d2b1f] leading-relaxed mb-5">"{quote}"</p>
              <div className="font-playfair font-bold text-[#b07d62] text-sm">— {name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}