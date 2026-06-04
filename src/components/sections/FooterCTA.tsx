import Link from 'next/link'

export default function FooterCTA() {
  return (
    <section className="py-24 px-6 text-center relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #3d2b1f, #5c3d2e)' }}>
      <div className="absolute top-1/4 left-[10%] w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(201,149,108,0.15), transparent)' }} />
      <div className="absolute bottom-1/4 right-[8%] w-48 h-48 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(181,131,141,0.15), transparent)' }} />

      <div className="relative max-w-2xl mx-auto">
        <div className="text-5xl mb-6">🍞</div>
        <h2 className="font-playfair text-4xl md:text-6xl font-black text-white mb-5">
          Ready to rise, darlin'?
        </h2>
        <p className="font-lora italic text-[#c9a090] text-lg mb-12 leading-relaxed">
          "Your starter's waitin' on you, honey. Let's bake something that makes the whole neighborhood jealous."
        </p>
        <Link href="/signup" className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-10 py-5 rounded-full font-lora text-lg hover:-translate-y-0.5 transition-transform shadow-xl shadow-[#b07d62]/30">
          Start Bakin' Free Today →
        </Link>
      </div>
    </section>
  )
}