import { LogoutButton } from '@/components/auth/LogoutButton'
import { Logo } from '@/design-system/components/Logo'
import { BottomNav } from '@/components/layout/BottomNav'
import { YearlyGoal } from '@/components/home/YearlyGoal'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const STREAK_MILESTONES = [7, 30, 100]

export const revalidate = 60

export default async function HomePage() {
  let currentStreak = 0
  let goalTarget: number | null = null
  let watchedCount = 0

  try {
    // Fetch data from public API endpoints
    const [streakRes, goalRes, statsRes] = await Promise.all([
      fetch(`${API_BASE}/v1/streaks`, { cache: 'no-store' }).catch(() => ({ ok: false })),
      fetch(`${API_BASE}/v1/goal`, { cache: 'no-store' }).catch(() => ({ ok: false })),
      fetch(`${API_BASE}/v1/records/stats`, { cache: 'no-store' }).catch(() => ({ ok: false })),
    ])

    if (streakRes.ok && 'json' in streakRes) {
      const streakData = await (streakRes as Response).json()
      currentStreak = streakData.current_streak ?? 0
    }
    if (goalRes.ok && 'json' in goalRes) {
      const goalData = await (goalRes as Response).json()
      goalTarget = goalData.target_count ?? null
    }
    if (statsRes.ok && 'json' in statsRes) {
      const statsData = await (statsRes as Response).json()
      watchedCount = statsData.watched_count ?? 0
    }
  } catch (error) {
    console.error('Failed to fetch home page data:', error)
  }

  const isMilestone = STREAK_MILESTONES.includes(currentStreak)

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
        <YearlyGoal currentCount={watchedCount} initialTarget={goalTarget} />

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

        {/* Friend feed - TODO: Add user auth to Server Component */}
        {/* <FriendFeed /> */}
      </div>

      <BottomNav active="home" />
    </main>
  )
}
