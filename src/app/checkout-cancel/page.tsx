import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function CheckoutCancelPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-6"
        style={{ background: 'linear-gradient(160deg, #fdf6f0 0%, #f5e6d8 50%, #ede0d4 100%)' }}>
        <div className="text-center max-w-md">
          <div className="text-5xl mb-6">🫙</div>
          <h1 className="font-playfair text-3xl font-bold text-[#3d2b1f] mb-4">
            No worries, honey.
          </h1>
          <p className="font-lora italic text-[#9a7060] leading-relaxed mb-8">
            "You can always come back when you're ready. The kitchen will be here waitin' on you."
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing"
              className="inline-block bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white px-6 py-3 rounded-full font-lora text-sm hover:-translate-y-0.5 transition-transform shadow-md">
              See Pricing Again
            </Link>
            <Link href="/dashboard"
              className="inline-block border border-[#c9956c] text-[#7a4f3a] px-6 py-3 rounded-full font-lora text-sm hover:bg-[#c9956c] hover:text-white transition-all">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
