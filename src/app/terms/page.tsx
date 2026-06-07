import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-20">
        <div className="mb-12">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">✦ Legal ✦</p>
          <h1 className="font-playfair text-5xl font-bold text-[#3d2b1f] mb-4">Terms of Service</h1>
          <p className="font-lora italic text-[#9a7060]">Last updated June 6, 2026</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] space-y-8 font-lora text-[#3d2b1f] leading-relaxed">
          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">The short version</h2>
            <p>Use Bless Your Loaf to bake great bread. Don't abuse it. Pay for what you use. We'll do our best to keep it running and improving. If something goes wrong, we're not liable for your bread failing — but we'll sure try to help you figure out why.</p>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Who can use this service</h2>
            <p>Bless Your Loaf is available to anyone 13 years of age or older. By using the service you confirm you meet this requirement and that the information you provide is accurate.</p>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Your account</h2>
            <p>You're responsible for keeping your account credentials secure. Don't share your password. If you suspect unauthorized access to your account, contact us immediately at hello@blessyourloaf.com.</p>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Subscriptions and payments</h2>
            <ul className="space-y-2 ml-4">
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span>Subscriptions renew automatically at the end of each billing period</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span>You can cancel at any time from your Account Settings — cancellation takes effect at the end of your current billing period</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span>We don't offer refunds for partial billing periods, but if you have an issue reach out and we'll work with you</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span>Prices may change with 30 days notice</span></li>
            </ul>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Free trial</h2>
            <p>New subscribers get a 7-day free trial. Your card is required to start the trial but you won't be charged until the trial ends. Cancel before the trial ends and you won't be charged anything.</p>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Your content</h2>
            <p>The recipes, starter data, and notes you create in Bless Your Loaf belong to you. We don't claim ownership of your content. You grant us permission to store and display it to power the service.</p>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">AI features</h2>
            <p>The Bake Scheduler and Starter Troubleshooter use AI powered by Anthropic's Claude. The advice provided is for informational purposes. We do our best to make it accurate but we're not responsible if a schedule or diagnosis doesn't work out for your specific situation. Sourdough has a mind of its own, honey.</p>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Limitation of liability</h2>
            <p>Bless Your Loaf is provided as-is. We work hard to keep it running but we can't guarantee it'll be available 100% of the time. We're not liable for lost data, failed bakes, or any other damages arising from your use of the service.</p>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Changes to these terms</h2>
            <p>We may update these terms from time to time. We'll notify you of significant changes by email. Continuing to use the service after changes are posted means you accept the updated terms.</p>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Contact</h2>
            <p>Questions? Email us at <a href="mailto:hello@blessyourloaf.com" className="text-[#b07d62] hover:underline">hello@blessyourloaf.com</a>. We're a small team and we actually read our email.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}