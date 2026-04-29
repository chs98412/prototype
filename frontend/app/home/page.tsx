import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Logo } from '@/design-system/components/Logo'
import { BottomNav } from '@/components/layout/BottomNav'
import { FriendFeed } from '@/components/feed/FriendFeed'
import { YearlyGoal } from '@/components/home/YearlyGoal'
import Link from 'next/link'

const STREAK_MILESTONES = [7, 30, 100]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const year = new Date().getFullYear()

  const [streakResult, goalResult, watchedResult] = user
    ? await Promise.all([
        supabase.from('user_streaks').select('current_streak').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_goals').select('target_count').eq('user_id', user.id).eq('year', year).maybeSingle(),
        supabase.from('user_records').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'watched'),
      ])
    : [{ data: null }, { data: null }, { count: 0 }]

  const currentStreak = (streakResult as { data: { current_streak: number } | null }).data?.current_streak ?? 0
  const isMilestone = STREAK_MILESTONES.includes(currentStreak)
  const goalTarget = (goalResult as { data: { target_count: number } | null }).data?.target_count ?? null
  const watchedCount = (watchedResult as { count: number | null }).count ?? 0

  return (
    <main className="flex flex-col min-h-screen bg-background pb-16">
      <header className="flex items-center justify-between px-4 h-14 border-b border-border">
        <Logo size="sm" />
        <LogoutButton />
      </header>

      <div className="flex flex-col gap-4 px-4 pt-5">
        {/* Streak widget */}
        <div className={`flex items-center justify-between px-5 py-4 rounded-sm border ${currentStreak > 0 ? 'bg-text border-text' : 'bg-surface border-border'}`}>
          <div>
            <p className={`text-[11px] font-medium tracking-widest uppercase ${currentStreak > 0 ? 'text-white/60' : 'text-muted'}`}>연속 기록</p>
            <p className={`text-3xl font-bold mt-1 ${currentStreak > 0 ? 'text-white' : 'text-text'}`}>
              {currentStreak}일
            </p>
            {isMilestone && (
              <p className="text-white/80 text-[11px] mt-1 tracking-wide">🎉 {currentStreak}일 달성</p>
            )}
          </div>
          <span className="text-4xl">{currentStreak > 0 ? '🔥' : '💤'}</span>
        </div>

        {/* Yearly goal widget */}
        {user && (
          <YearlyGoal currentCount={watchedCount} initialTarget={goalTarget} />
        )}

        {/* Search shortcut */}
        <Link
          href="/search"
          className="flex items-center gap-2 w-full h-12 px-4 rounded-sm border border-border bg-surface text-muted text-[13px] tracking-wide"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          영화, 시리즈 검색...
        </Link>

        {/* Friend feed */}
        {user && (
          <div className="flex flex-col gap-3">
            <h2 className="text-text font-semibold text-[15px]">친구 피드</h2>
            <FriendFeed userId={user.id} />
          </div>
        )}
      </div>

      <BottomNav active="home" />
    </main>
  )
}
