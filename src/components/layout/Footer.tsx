import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FooterView from './FooterView'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

// Used on pages that are already dynamic (dashboard, auth, checkout) — see PublicFooter.tsx
// for the client-fetched equivalent used on the static marketing/guide tier.
export default async function Footer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <FooterView user={user ? {} : null} onSignOut={signOut} />
}
