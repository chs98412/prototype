import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Logo } from '@/design-system/components/Logo'
import { BottomNav } from '@/components/layout/BottomNav'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="flex flex-col min-h-screen bg-background pb-16">
      <header className="flex items-center justify-between px-4 h-14 border-b border-border">
        <Logo size="sm" />
        <LogoutButton />
      </header>

      <div className="flex flex-col flex-1 items-center justify-center gap-5 px-6 text-center">
        <span className="text-5xl">🎬</span>
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-text">환영합니다!</h1>
          {user?.email && (
            <p className="text-muted text-sm">{user.email}</p>
          )}
        </div>
        <Link
          href="/search"
          className="flex items-center gap-2 w-full max-w-xs h-12 px-4 rounded-xl bg-surface text-muted text-[15px]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          영화, 시리즈 검색...
        </Link>
      </div>

      <BottomNav active="home" />
    </main>
  )
}
