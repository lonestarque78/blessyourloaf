import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/sections/Hero'
import StarterJournal from '@/components/sections/StarterJournal'
import DiscardVault from '@/components/sections/DiscardVault'
import Features from '@/components/sections/Features'
import Pricing from '@/components/sections/Pricing'
import FooterCTA from '@/components/sections/FooterCTA'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <StarterJournal />
      <DiscardVault />
      <Features />
      <Pricing />
      <FooterCTA />
      <Footer />
    </main>
  )
}
