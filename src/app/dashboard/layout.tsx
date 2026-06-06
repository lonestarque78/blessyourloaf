import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: '#fdf6f0' }}>
      {/* Dashboard nav — flex-shrink-0 keeps it from collapsing */}
      <nav className="bg-white border-b border-[#f0e4db] px-6 py-4 flex items-center justify-between flex-shrink-0 z-50 shadow-sm">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl">🍞</span>
          <span className="font-playfair text-lg font-bold text-[#3d2b1f]">Bless Your Loaf</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/dashboard/starters" className="font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] transition-colors">
            My Starters
          </Link>
          <Link href="/dashboard/scheduler" className="font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] transition-colors">
            Bake Scheduler
          </Link>
          <Link href="/dashboard/history" className="font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] transition-colors">
            Bake History
          </Link>
          <Link href="/dashboard/my-recipes" className="font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] transition-colors">
            My Recipes
          </Link>
          <Link href="/dashboard/troubleshooter" className="font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] transition-colors">
            Troubleshooter
          </Link>
          <Link href="/recipes" className="font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] transition-colors">
            Recipes
          </Link>
          <Link href="/discard" className="font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] transition-colors">
            Discard Vault
          </Link>
          <Link href="/dashboard/account" className="font-lora text-sm text-[#7a4f3a] hover:text-[#b07d62] transition-colors">
            Account
          </Link>
          <form action={signOut}>
            <button type="submit" className="font-lora text-sm text-[#9a7060] hover:text-[#b07d62] transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </nav>

      {/* Scrollable area for regular dashboard pages; troubleshooter overrides with flex-1 */}
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
        {children}
      </div>

      <Footer />
    </div>
  )
}