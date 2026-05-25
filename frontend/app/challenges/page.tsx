import { getServerToken } from '@/lib/auth/getServerToken'
import { BottomNav } from '@/components/layout/BottomNav'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

type Challenge = {
  id: string
  title: string
  description: string
  required_count: number
  badge_emoji: string
  current_count?: number
  completed_at?: string | null
}

type Progress = {
  challenge_id: string
  current_count: number
  completed_at: string | null
}

type Tab = 'all' | 'in_progress' | 'done'

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab = 'all' } = await searchParams
  const activeTab = (tab as Tab) ?? 'all'

  const token = await getServerToken()

  const res = await fetch(`${API_URL}/v1/challenges`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  const challenges: Challenge[] = res.ok ? ((await res.json()).data ?? []) : []

  const progressMap = new Map<string, Progress>()
  challenges?.forEach((c) => {
    if (c.current_count !== undefined) {
      progressMap.set(c.id, {
        challenge_id: c.id,
        current_count: c.current_count,
        completed_at: c.completed_at ?? null
      })
    }
  })

  const filtered = (challenges ?? []).filter((c) => {
    const p = progressMap.get(c.id)
    if (activeTab === 'done') return !!p?.completed_at
    if (activeTab === 'in_progress') return p && !p.completed_at && p.current_count > 0
    return true
  })

  const TABS: { id: Tab; label: string }[] = [
    { id: 'all', label: '전체' },
    { id: 'in_progress', label: '진행 중' },
    { id: 'done', label: '완료' },
  ]

  return (
    <main className="flex flex-col min-h-screen bg-background pb-16">
      <header className="px-4 pt-5 pb-3">
        <h1 className="text-2xl font-bold text-text">도전과제</h1>
        <p className="text-muted text-sm mt-1">기록하면 자동으로 진척도가 올라가요</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mb-4">
        {TABS.map(({ id, label }) => (
          <Link
            key={id}
            href={`/challenges?tab=${id}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-primary text-white'
                : 'bg-surface text-muted'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Challenge list */}
      <div className="flex flex-col gap-3 px-4">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <span className="text-4xl">🔍</span>
            <p className="text-text font-semibold">해당하는 도전과제가 없어요</p>
          </div>
        )}

        {filtered.map((challenge) => {
          const progress = progressMap.get(challenge.id)
          const current = progress?.current_count ?? 0
          const isDone = !!progress?.completed_at
          const pct = Math.min(100, Math.round((current / challenge.required_count) * 100))

          return (
            <div
              key={challenge.id}
              className={`p-4 rounded-2xl border ${isDone ? 'border-primary/30 bg-primary/5' : 'border-border bg-background'}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">{challenge.badge_emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-text font-semibold text-[15px] leading-snug">{challenge.title}</p>
                    {isDone && <span className="text-[11px] text-primary font-bold">✓ 완료</span>}
                  </div>
                  <p className="text-muted text-[13px] mt-0.5 leading-snug">{challenge.description}</p>

                  {user && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] text-muted">{current} / {challenge.required_count}</span>
                        <span className="text-[12px] text-muted">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {!user && (
          <div className="mt-4 p-4 rounded-2xl bg-surface text-center">
            <p className="text-muted text-sm">
              <Link href="/login" className="text-primary font-semibold">로그인</Link>하면 진척도를 확인할 수 있어요
            </p>
          </div>
        )}
      </div>

      <BottomNav active="home" />
    </main>
  )
}
