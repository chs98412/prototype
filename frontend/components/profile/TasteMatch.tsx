'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const IMG_BASE = 'https://image.tmdb.org/t/p'

type MatchResult = { match_pct: number | null; common_count: number }
type CommonWork = { tmdb_id: number; media_type: string; title: string | null; poster_path: string | null; rating: number | null }

export function TasteMatch({ myId, friendId }: { myId: string; friendId: string }) {
  const [result, setResult] = useState<MatchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCommon, setShowCommon] = useState(false)
  const [commonWorks, setCommonWorks] = useState<CommonWork[]>([])
  const [loadingCommon, setLoadingCommon] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .rpc('get_taste_match', { p_user_id: myId, p_friend_id: friendId })
      .then(({ data }) => {
        const row = (data as MatchResult[] | null)?.[0] ?? null
        setResult(row)
        setLoading(false)
      })
  }, [myId, friendId])

  async function toggleCommon() {
    if (showCommon) { setShowCommon(false); return }
    setLoadingCommon(true)
    const supabase = createClient()
    const [{ data: mine }, { data: friend }] = await Promise.all([
      supabase.from('user_records').select('tmdb_id, media_type, title, poster_path, rating').eq('user_id', myId),
      supabase.from('user_records').select('tmdb_id, media_type').eq('user_id', friendId),
    ])
    const friendSet = new Set((friend ?? []).map((r) => `${r.media_type}-${r.tmdb_id}`))
    const common = (mine ?? []).filter((r) => friendSet.has(`${r.media_type}-${r.tmdb_id}`)) as CommonWork[]
    setCommonWorks(common)
    setLoadingCommon(false)
    setShowCommon(true)
  }

  if (loading) return null

  const pct = result?.match_pct
  const common = result?.common_count ?? 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-surface">
        <span className="text-3xl">💫</span>
        <div className="flex-1">
          <p className="text-muted text-[12px]">취향 궁합</p>
          {pct != null ? (
            <>
              <p className="text-text font-bold text-2xl">{pct}%</p>
              <div className="h-1.5 rounded-full bg-border overflow-hidden mt-1">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
              <button
                onClick={toggleCommon}
                disabled={loadingCommon}
                className="text-muted text-[11px] mt-1 underline disabled:opacity-40"
              >
                {loadingCommon ? '로딩...' : showCommon ? '접기' : `공통 작품 ${common}편 보기`}
              </button>
            </>
          ) : (
            <>
              <p className="text-text font-medium text-[15px]">데이터 부족</p>
              <p className="text-muted text-[11px] mt-0.5">
                {common > 0 ? `공통 작품 ${common}편 (별점 5개 이상 필요)` : '공통으로 기록한 작품이 없어요'}
              </p>
              {common > 0 && (
                <button
                  onClick={toggleCommon}
                  disabled={loadingCommon}
                  className="text-muted text-[11px] mt-1 underline disabled:opacity-40"
                >
                  {loadingCommon ? '로딩...' : showCommon ? '접기' : `공통 작품 ${common}편 보기`}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Common works list */}
      {showCommon && commonWorks.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {commonWorks.map((r) => (
            <Link
              key={`${r.media_type}-${r.tmdb_id}`}
              href={`/content/${r.media_type}/${r.tmdb_id}`}
              className="flex flex-col gap-1"
            >
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface">
                {r.poster_path ? (
                  <Image
                    src={`${IMG_BASE}/w185${r.poster_path}`}
                    alt={r.title ?? ''}
                    fill
                    className="object-cover"
                    sizes="30vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
                )}
                {r.rating != null && (
                  <div className="absolute bottom-1 right-1 bg-black/60 rounded px-1 py-0.5">
                    <span className="text-white text-[10px] font-bold">⭐{r.rating}</span>
                  </div>
                )}
              </div>
              {r.title && (
                <p className="text-text text-[11px] font-medium leading-tight line-clamp-2">{r.title}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
