import { NextResponse } from 'next/server'
import { API_URL } from '@/lib/config'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    try {
      const res = await fetch(`${API_URL}/v1/auth/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (res.ok) {
        const data = await res.json()
        // Token is set in HttpOnly cookie by backend
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (err) {
      console.error('Auth callback failed:', err)
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
