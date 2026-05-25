'use client'

import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export function LogoutButton() {
  const router = useRouter()

  async function logout() {
    try {
      await fetch(`${API_URL}/v1/auth/logout`, { method: 'POST' })
    } catch (err) {
      console.error('Logout failed:', err)
    }
    router.push('/')
  }

  return (
    <button
      onClick={logout}
      className="text-sm font-semibold text-muted hover:text-text transition-colors"
    >
      로그아웃
    </button>
  )
}
