import { createClient } from '@/lib/supabase/server'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let firstName: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    firstName = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || null
  }

  return <NavbarClient user={user ? { firstName: firstName! } : null} />
}
