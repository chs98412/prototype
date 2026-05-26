import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/home', '/profile']
const AUTH_ROUTES = ['/', '/login']

export async function proxy(request: NextRequest) {
  const startTime = Date.now()
  const token = request.cookies.get('auth_token')?.value
  const pathname = request.nextUrl.pathname

  if (!token && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (token && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  const response = NextResponse.next()

  // 요청 처리 시간 추적
  const duration = Date.now() - startTime
  response.headers.set('x-response-time', `${duration}ms`)
  response.headers.set('x-page', pathname)

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
