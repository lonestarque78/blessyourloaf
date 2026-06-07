import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-20">
        <div className="mb-12">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">✦ Legal ✦</p>
          <h1 className="font-playfair text-5xl font-bold text-[#3d2b1f] mb-4">Privacy Policy</h1>
          <p className="font-lora italic text-[#9a7060]">Last updated June 6, 2026</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] space-y-8 font-lora text-[#3d2b1f] leading-relaxed">
          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Who we are</h2>
            <p>Bless Your Loaf is operated by Lone Star Que LLC, based in Frisco, Texas. We built this app because we love sourdough and we think every baker deserves great tools. When you use Bless Your Loaf, you're trusting us with your information — and we take that seriously, sugar.</p>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">What we collect</h2>
            <p className="mb-3">We collect only what we need to make the app work for you:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Account information</strong> — your name and email address when you sign up</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Starter data</strong> — the information you enter about your sourdough starters, feedings, and bake schedules</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Payment information</strong> — processed securely by Stripe. We never see or store your card number</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Usage data</strong> — basic analytics to understand how people use the app so we can improve it</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Photos</strong> — if you upload photos to the Starter Troubleshooter, they are sent to Anthropic's API for analysis and are not stored by us</span></li>
            </ul>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">How we use your information</h2>
            <ul className="space-y-2 ml-4">
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span>To provide and improve the Bless Your Loaf service</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span>To process your subscription payments through Stripe</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span>To send you important account and service updates</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span>To power AI features like the Bake Scheduler and Starter Troubleshooter via Anthropic's Claude API</span></li>
            </ul>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Who we share your data with</h2>
            <p className="mb-3">We don't sell your data. Ever. We share it only with the services that make the app run:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Supabase</strong> — our database and authentication provider</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Stripe</strong> — payment processing</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Anthropic</strong> — AI features (your prompts and photos are sent to their API)</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Vercel</strong> — hosting and infrastructure</span></li>
            </ul>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Your rights</h2>
            <p>You can delete your account at any time from your Account Settings page. When you delete your account, we delete all your data — your starters, feedings, schedules, and recipes. Some data may remain in backups for up to 30 days before being permanently removed.</p>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Cookies</h2>
            <p>We use cookies only for authentication — to keep you logged in. We don't use advertising or tracking cookies.</p>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Contact us</h2>
            <p>If you have any questions about this policy, reach out to us at <a href="mailto:hello@blessyourloaf.com" className="text-[#b07d62] hover:underline">hello@blessyourloaf.com</a>. We're real people and we'll write back, honey.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}