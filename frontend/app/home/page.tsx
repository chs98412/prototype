import { getServerToken } from '@/lib/auth/getServerToken'
import { API_URL } from '@/lib/config'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Logo } from '@/design-system/components/Logo'
import { BottomNav } from '@/components/layout/BottomNav'
import { FriendFeed } from '@/components/feed/FriendFeed'
import { YearlyGoal } from '@/components/home/YearlyGoal'
import Link from 'next/link'

const STREAK_MILESTONES = [7, 30, 100]

export default async function HomePage() {
  const token = await getServerToken()

  const year = new Date().getFullYear()

  // Fetch all data from API
  const [streakRes, goalRes, recordsRes] = await Promise.all([
    fetch(`${API_URL}/v1/streaks`, { headers: { Authorization: `Bearer ${token}` } }),
    fetch(`${API_URL}/v1/goal`, { headers: { Authorization: `Bearer ${token}` } }),
    fetch(`${API_URL}/v1/records/stats`, { headers: { Authorization: `Bearer ${token}` } }),
  ])

  const currentStreak = streakRes.ok ? (await streakRes.json()).current_streak ?? 0 : 0
  const isMilestone = STREAK_MILESTONES.includes(currentStreak)
  const goalTarget = goalRes.ok ? (await goalRes.json()).movie_goal ?? null : null
  const watchedCount = recordsRes.ok ? (await recordsRes.json()).watched_count ?? 0 : 0
  const recentMusic: any[] = []

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

        {/* Search shortcuts */}
        <Link
          href="/search"
          className="flex items-center gap-2 w-full h-12 px-4 rounded-sm border border-border bg-surface text-muted text-[13px] tracking-wide"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          영화, 시리즈 검색...
        </Link>
        <Link
          href="/music/search"
          className="flex items-center gap-2 w-full h-12 px-4 rounded-sm border border-border bg-surface text-muted text-[13px] tracking-wide"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13a4 4 0 1 1-4 4 4 4 0 0 1 4-4" /><circle cx="6" cy="21" r="2" />
          </svg>
          음반 검색...
        </Link>

        {/* 최근 평가한 음반 */}
        {recentMusic.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-text font-semibold text-[15px]">최근 평가한 음반</h2>
            {recentMusic.map((item) => (
              <Link
                key={item.album_spotify_id}
                href={`/music/albums/${item.album_spotify_id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-sm border border-border bg-surface"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted flex-shrink-0">
                  <path d="M9 18V5l12-2v13a4 4 0 1 1-4 4 4 4 0 0 1 4-4" /><circle cx="6" cy="21" r="2" />
                </svg>
                <p className="text-sm text-text truncate">{item.content}</p>
              </Link>
            ))}
          </div>
        )}

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
