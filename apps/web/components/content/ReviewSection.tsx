'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getReviewsByTmdbId } from '@/lib/api/reviews'
import { upsertReview, deleteReview } from '@/app/actions/reviews'
import { LoadingSpinner } from '@/components/ui/Loading'
import type { Review } from '@/lib/types/reviews'

function relativeTime(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

interface ReviewSectionProps {
  tmdbId: number
  mediaType: 'movie' | 'tv'
  userId: string | null
}

export function ReviewSection({ tmdbId, mediaType, userId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState('')
  const [isSpoiler, setIsSpoiler] = useState(false)
  const [saving, setSaving] = useState(false)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())

  const myReview = reviews.find((r) => r.user_id === userId) ?? null

  async function fetchReviews() {
    const response = await getReviewsByTmdbId(tmdbId, 20)
    if (!response.error && response.data) {
      setReviews(response.data as Review[])
    }
    setLoading(false)
  }

  useEffect(() => { fetchReviews() }, [tmdbId, mediaType])

  function startEdit() {
    setContent(myReview?.content ?? '')
    setIsSpoiler(myReview?.spoiler ?? false)
    setEditing(true)
  }

  async function handleSubmit() {
    if (!content.trim() || saving) return
    setSaving(true)
    try {
      await upsertReview({ tmdbId, content: content.trim(), spoiler: isSpoiler })
      await fetchReviews()
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (saving || !myReview) return
    setSaving(true)
    try {
      await deleteReview({ reviewId: myReview.id })
      setReviews((prev) => prev.filter((r) => r.user_id !== userId))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-text font-semibold text-[15px]">리뷰</h2>
        {userId && !editing && !myReview && (
          <button onClick={startEdit} className="text-primary text-[13px] font-medium">
            + 리뷰 쓰기
          </button>
        )}
      </div>

      {userId && editing && (
        <div className="flex flex-col gap-3 p-4 rounded-sm bg-surface">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="감상을 남겨보세요... (최대 500자)"
            className="w-full bg-background p-3 text-[14px] text-text resize-none outline-none border border-border focus:border-text"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[13px] text-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSpoiler}
                onChange={(e) => setIsSpoiler(e.target.checked)}
              />
              스포일러 포함
            </label>
            <div className="flex gap-2 items-center">
              <span className="text-muted text-[11px]">{content.length}/500</span>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 text-[13px] text-muted"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !content.trim()}
                className="px-4 py-1.5 bg-text text-white text-[13px] font-medium disabled:opacity-50"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-6">
          <LoadingSpinner size="md" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 bg-surface text-center">
          <p className="text-text font-medium text-[14px]">첫 리뷰를 남겨보세요</p>
          <p className="text-muted text-[12px]">아직 리뷰가 없어요</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r) => {
            const isMe = r.user_id === userId
            const profile = r.user
            const spoilerVisible = revealed.has(r.id)
            const preview = r.content.slice(0, 100)

            return (
              <div key={r.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-text text-[13px] font-medium">
                    {profile?.display_name ?? '유저'}
                  </span>
                  <span className="text-muted text-[11px] ml-auto">{relativeTime(r.created_at)}</span>
                  {isMe && (
                    <div className="flex gap-2">
                      <button
                        onClick={startEdit}
                        className="text-muted text-[11px] underline"
                      >
                        편집
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={saving}
                        className="text-muted text-[11px] underline disabled:opacity-40"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>

                {r.spoiler && !spoilerVisible ? (
                  <div className="flex flex-col items-center gap-2 py-4 bg-surface">
                    <p className="text-muted text-[12px]">스포일러가 포함된 리뷰입니다</p>
                    <button
                      onClick={() => setRevealed((prev) => new Set([...prev, r.id]))}
                      className="px-3 py-1 border border-border text-text text-[12px] font-medium"
                    >
                      스포일러 보기
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-text text-[14px] leading-relaxed">
                      {preview}{r.content.length > 100 ? '...' : ''}
                    </p>
                    {r.content.length > 100 && (
                      <Link
                        href={`/review/${r.id}`}
                        className="text-muted text-[12px] underline underline-offset-2"
                      >
                        더 보기
                      </Link>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-muted">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span className="text-[12px]">{r.like_count ?? 0}</span>
                  </div>
                </div>

                <div className="h-px bg-border" />
              </div>
            )
          })}
        </div>
      )}

      {!userId && reviews.length === 0 && (
        <p className="text-muted text-[12px] text-center py-2">로그인하면 리뷰를 남길 수 있어요</p>
      )}
    </div>
  )
}
