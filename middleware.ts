import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function getSupabaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/^<|>$/g, '').trim()
  if (!raw) return 'https://placeholder.supabase.co'
  try {
    return new URL(raw).origin
  } catch {
    return 'https://placeholder.supabase.co'
  }
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // If Supabase isn't configured yet, pass all requests through
  const supabaseUrl = getSupabaseUrl()
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  if (!supabaseKey || supabaseKey === 'placeholder-anon-key') {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    const protectedPrefixes = ['/home', '/search', '/program', '/profile', '/onboarding', '/dashboard', '/programs', '/settings']
    const isProtected = protectedPrefixes.some(p => pathname.startsWith(p))

    if (isProtected && !user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const authPaths = ['/login', '/signup']
    if (authPaths.includes(pathname) && user) {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/home'
      return NextResponse.redirect(homeUrl)
    }
  } catch {
    // Middleware never crashes the request — if Supabase fails, pass through
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
