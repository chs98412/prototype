import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Logo } from '@/design-system/components/Logo'
import { BottomNav } from '@/components/layout/BottomNav'
import Link from 'next/link'

const STREAK_MILESTONES = [7, 30, 100]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: streak } = user
    ? await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', user.id)
        .maybeSingle()
    : { data: null }

  const currentStreak = streak?.current_streak ?? 0
  const isMilestone = STREAK_MILESTONES.includes(currentStreak)

  return (
    <main className="flex flex-col min-h-screen bg-background pb-16">
      <header className="flex items-center justify-between px-4 h-14 border-b border-border">
        <Logo size="sm" />
        <LogoutButton />
      </header>

      <div className="flex flex-col gap-4 px-4 pt-5">
        {/* Streak widget */}
        <div className={`flex items-center justify-between px-5 py-4 rounded-2xl ${currentStreak > 0 ? 'bg-primary' : 'bg-surface'}`}>
          <div>
            <p className={`text-[13px] font-medium ${currentStreak > 0 ? 'text-white/80' : 'text-muted'}`}>연속 기록</p>
            <p className={`text-3xl font-bold mt-0.5 ${currentStreak > 0 ? 'text-white' : 'text-text'}`}>
              {currentStreak}일
            </p>
            {isMilestone && (
              <p className="text-white text-[12px] mt-1">🎉 {currentStreak}일 달성!</p>
            )}
          </div>
          <span className="text-5xl">{currentStreak > 0 ? '🔥' : '💤'}</span>
        </div>

        {/* Search shortcut */}
        <Link
          href="/search"
          className="flex items-center gap-2 w-full h-12 px-4 rounded-xl bg-surface text-muted text-[15px]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          영화, 시리즈 검색...
        </Link>

        {/* User info */}
        {user?.email && (
          <p className="text-muted text-[12px] text-center mt-1">{user.email}</p>
        )}
      </div>

      <BottomNav active="home" />
    </main>
  )
}
