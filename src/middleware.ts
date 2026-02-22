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

  // #region agent log
  const cookieNames = req.cookies.getAll().map(c => c.name)
  console.log('[DEBUG-MW]', JSON.stringify({ pathname, cookieNames, hasSecret: !!process.env.NEXTAUTH_SECRET, secretLen: process.env.NEXTAUTH_SECRET?.length }))
  // #endregion

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // #region agent log
  console.log('[DEBUG-MW]', JSON.stringify({ pathname, tokenFound: !!token, tokenId: token?.id ?? null }))
  // #endregion

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    // #region agent log
    console.log('[DEBUG-MW]', JSON.stringify({ action: 'redirect-to-login', from: pathname, to: loginUrl.toString() }))
    // #endregion
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.png|logo.png).*)'],
}
