'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FooterView from './FooterView'

// Static-tier equivalent of Footer.tsx: the marketing/guide pages that use this are
// statically rendered, so there's no server-side session to read. Defaults to the
// logged-out footer (correct for the vast majority of marketing-page traffic) and
// refines client-side for the rare case of an already-logged-in visitor landing here.
export default function PublicFooter() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    let active = true
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (active && user) setLoggedIn(true)
    })
    return () => {
      active = false
    }
  }, [])

  async function handleSignOut() {
    await createClient().auth.signOut()
    window.location.href = '/'
  }

  return <FooterView user={loggedIn ? {} : null} onSignOut={handleSignOut} />
}
