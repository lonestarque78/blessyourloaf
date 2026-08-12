'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import NavbarClient from './NavbarClient'

// Static-tier equivalent of Navbar.tsx: the marketing/guide pages that use this are
// statically rendered, so there's no server-side session to read. Defaults to the
// logged-out nav (correct for the vast majority of marketing-page traffic — this is the
// acquisition channel, prospective customers, not existing ones) and refines client-side
// for the rare case of an already-logged-in visitor landing here (e.g. clicking the logo
// or a footer link from the dashboard).
export default function PublicNavbar() {
  const [user, setUser] = useState<{ firstName: string } | null>(null)

  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!active || !user) return
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      if (!active) return
      setUser({ firstName: profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || '' })
    })
    return () => {
      active = false
    }
  }, [])

  return <NavbarClient user={user} localeRouting />
}
