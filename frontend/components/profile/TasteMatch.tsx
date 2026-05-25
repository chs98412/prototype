'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getClientToken } from '@/lib/auth/getToken'

const IMG_BASE = 'https://image.tmdb.org/t/p'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

type MatchResult = { compatibility_score: number | null; common_titles: number }
type CommonWork = { tmdb_id: number; media_type: string; title: string | null; poster_path: string | null; rating: number | null }

export function TasteMatch({ myId, friendId }: { myId: string; friendId: string }) {
  const [result, setResult] = useState<MatchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCommon, setShowCommon] = useState(false)
  const [commonWorks, setCommonWorks] = useState<CommonWork[]>([])
  const [loadingCommon, setLoadingCommon] = useState(false)

  useEffect(() => {
    async function fetchMatch() {
      try {
        const token = await getClientToken()
        const res = await fetch(`${API_URL}/v1/taste-match/${friendId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch taste match')
        const data = await res.json()
        setResult(data)
      } catch (err) {
        console.error('Failed to fetch taste match:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMatch()
  }, [friendId])

  async function toggleCommon() {
    if (showCommon) { setShowCommon(false); return }
    setLoadingCommon(true)
    try {
      const token = await getClientToken()
      const res = await fetch(`${API_URL}/v1/taste-match/${friendId}/common`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch common works')
      const data = await res.json()
      setCommonWorks(data.data || [])
    } catch (err) {
      console.error('Failed to fetch common works:', err)
    } finally {
      setLoadingCommon(false)
      setShowCommon(true)
    }
  }

  if (loading) return null

  const pct = result?.compatibility_score
  const common = result?.common_titles ?? 0

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
