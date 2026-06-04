import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#3d2b1f] text-[#c9a090] py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍞</span>
              <span className="font-playfair text-xl font-bold text-white">Bless Your Loaf</span>
            </div>
            <p className="font-lora italic text-sm leading-relaxed max-w-xs">
              "Good bread takes time, honey. And we've got all the time in the world for you."
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <div className="font-lora text-xs uppercase tracking-widest text-[#b07d62] mb-4">Bake</div>
              <div className="flex flex-col gap-2">
                <Link href="/recipes" className="font-lora text-sm hover:text-white transition-colors">Recipes</Link>
                <Link href="/discard" className="font-lora text-sm hover:text-white transition-colors">Discard Vault</Link>
                <Link href="/starter-guide" className="font-lora text-sm hover:text-white transition-colors">Starter Guide</Link>
              </div>
            </div>
            <div>
              <div className="font-lora text-xs uppercase tracking-widest text-[#b07d62] mb-4">Account</div>
              <div className="flex flex-col gap-2">
                <Link href="/signup" className="font-lora text-sm hover:text-white transition-colors">Sign Up</Link>
                <Link href="/login" className="font-lora text-sm hover:text-white transition-colors">Log In</Link>
                <Link href="/pricing" className="font-lora text-sm hover:text-white transition-colors">Pricing</Link>
              </div>
            </div>
            <div>
              <div className="font-lora text-xs uppercase tracking-widest text-[#b07d62] mb-4">Legal</div>
              <div className="flex flex-col gap-2">
                <Link href="/privacy" className="font-lora text-sm hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="font-lora text-sm hover:text-white transition-colors">Terms</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#5c3d2e] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-lora text-xs">© {new Date().getFullYear()} Bless Your Loaf · A Lone Star Que LLC product</p>
          <p className="font-lora text-xs italic">Made with love in Texas 🤠</p>
        </div>
      </div>
    </footer>
  )
}