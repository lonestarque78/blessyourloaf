import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import DashboardNavClient from '@/components/dashboard/DashboardNavClient'

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
    <div className="min-h-screen" style={{ background: '#fdf6f0' }}>
      <nav className="relative bg-white border-b border-[#f0e4db] px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl">🍞</span>
          <span className="font-playfair text-lg font-bold text-[#3d2b1f]">Bless Your Loaf</span>
        </Link>

        <DashboardNavClient signOut={signOut} />
      </nav>

      {children}

      <Footer />
    </div>
  )
}