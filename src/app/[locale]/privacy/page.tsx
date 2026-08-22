import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import PublicNavbar from '@/components/layout/PublicNavbar'
import PublicFooter from '@/components/layout/PublicFooter'
import { isSupportedLocale } from '@/i18n/locale'
import { buildAlternates } from '@/i18n/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { alternates: buildAlternates('/privacy', isSupportedLocale(locale) ? locale : 'en') }
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <PublicNavbar />
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-20">
        <div className="mb-12">
          <p className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-3">✦ Legal ✦</p>
          <h1 className="font-playfair text-5xl font-bold text-[#3d2b1f] mb-4">Privacy Policy</h1>
          <p className="font-lora italic text-[#9a7060]">Last updated August 22, 2026</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] space-y-8 font-lora text-[#3d2b1f] leading-relaxed">
          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Who we are</h2>
            <p>Bless Your Loaf is operated by Lone Star Que LLC, based in Frisco, Texas. We built this app because we love sourdough and we think every baker deserves great tools. When you use Bless Your Loaf, you&apos;re trusting us with your information — and we take that seriously.</p>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">What we collect</h2>
            <p className="mb-3">We collect only what we need to make the app work for you:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Account information</strong> — your name and email address when you sign up</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Starter data</strong> — the information you enter about your sourdough starters, feedings, and bake schedules</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Payment information</strong> — processed securely by Stripe. We never see or store your card number</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Usage data</strong> — basic analytics to understand how people use the app so we can improve it</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Photos</strong> — if you upload a photo to the Starter Troubleshooter, it&apos;s sent to Anthropic&apos;s API for analysis and saved as part of that conversation in our database, the same as your troubleshooter messages (see AI features below)</span></li>
            </ul>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">How we use your information</h2>
            <ul className="space-y-2 ml-4">
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span>To provide and improve the Bless Your Loaf service</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span>To process your subscription payments through Stripe</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span>To send you important account and service updates</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span>To power the app&apos;s AI features — the Starter Troubleshooter, Ingredient Substitution guide, Recipe Generator, Recipe Import, and Bake Scheduler — via Anthropic&apos;s Claude API (see AI features below)</span></li>
            </ul>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">AI features</h2>
            <p className="mb-3">Five features in Bless Your Loaf send what you type — and, for the Starter Troubleshooter, any photo you upload — to Anthropic, the company whose Claude models power these features, so it can generate a response for you:</p>
            <ul className="space-y-2 ml-4 mb-3">
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Starter Troubleshooter</strong> — your message, any photo you attach, and context about the selected starter (its name, flour type, hydration, and recent feeding history)</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Ingredient Substitution</strong> — your message</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Recipe Generator</strong> — the description you type of what you&apos;d like to bake</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Recipe Import</strong> — the URL you provide (we fetch the page and send its text) or the raw text you paste in</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Bake Scheduler</strong> — your recipe description, target date and time, and the selected starter&apos;s name, activity level, last-fed time, flour type, and hydration</span></li>
            </ul>
            <p className="mb-3">Anthropic processes this information only to generate the response shown to you. Anthropic does not use it to train its models, and Anthropic&apos;s own retention of it is separate from and shorter than what we describe below — driven by their trust and safety obligations, not ours.</p>
            <p className="font-bold mb-2">What we keep, and for how long</p>
            <ul className="space-y-2 ml-4">
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Troubleshooter and Ingredient Substitution conversations</strong> — we save your full conversation, including any photos you upload to the Troubleshooter, to your account so you can pick it back up later. We keep it for up to 14 days from when the conversation starts, then it&apos;s automatically and permanently deleted, whether or not your account is still open. Deleting your account deletes it immediately, sooner than that 14-day window if it hasn&apos;t already passed (see Your rights below).</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Recipe Generator and Recipe Import</strong> — we don&apos;t keep a separate copy of what you typed or the URL you submitted. If you save the resulting recipe to My Recipes, that saved recipe is stored the same way as any recipe you create by hand; your original request isn&apos;t stored alongside it.</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Bake Scheduler</strong> — same as above: we don&apos;t keep a separate copy of your prompt. If you save the generated schedule, it&apos;s stored the same way as your other bake schedules, until you delete it or your account.</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Daily usage limits</strong> — for all five features, we log that you used a feature and when, to enforce daily usage limits. That log entry is a timestamp and which feature you used, not the content of what you asked.</span></li>
            </ul>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Who we share your data with</h2>
            <p className="mb-3">We don&apos;t sell your data. Ever. We share it only with the services that make the app run:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Supabase</strong> — our database and authentication provider</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Stripe</strong> — payment processing</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Anthropic</strong> — powers the app&apos;s AI features; see AI features above for exactly what&apos;s sent and what we keep</span></li>
              <li className="flex gap-3"><span className="text-[#c9956c] mt-1">·</span><span><strong>Vercel</strong> — hosting and infrastructure</span></li>
            </ul>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Your rights</h2>
            <p>You can delete your account at any time from your Account Settings page. When you delete your account, we delete all your data — your starters, feedings, schedules, recipes, and AI conversation history (including any uploaded photos). Some data may remain in backups for up to 30 days before being permanently removed.</p>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Cookies</h2>
            <p>We use cookies only for authentication — to keep you logged in. We don&apos;t use advertising or tracking cookies.</p>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3">Contact us</h2>
            <p>If you have any questions about this policy, reach out to us at <a href="mailto:hello@blessyourloaf.com" className="text-[#b07d62] hover:underline">hello@blessyourloaf.com</a>. We&apos;re real people and we&apos;ll write back.</p>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}