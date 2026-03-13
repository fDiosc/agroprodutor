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

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

  let token = await getToken({ req, secret, secureCookie: true })
  if (!token) {
    token = await getToken({ req, secret, secureCookie: false })
  }

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
