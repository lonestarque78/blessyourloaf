import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, responseHeaders) {
          cookiesToSet.forEach(({ name, value }) => {
            if (value) {
              request.cookies.set(name, value)
            } else {
              request.cookies.delete(name)
            }
          })
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          if (responseHeaders) {
            Object.entries(responseHeaders).forEach(([key, value]) =>
              supabaseResponse.headers.set(key, value)
            )
          }
        },
      },
    }
  )

  await supabase.auth.getUser()
  return supabaseResponse
}