import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const publicPaths = ['/login', '/register', '/api/auth', '/']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isPublic = publicPaths.some((path) => {
    if (path === '/') return pathname === '/'
    return pathname === path || pathname.startsWith(`${path}/`)
  })

  if (isPublic) return NextResponse.next()

  const isSecure = req.headers.get('x-forwarded-proto') === 'https'
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: isSecure })

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.png|logo.png).*)'],
}
