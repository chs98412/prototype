'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
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
