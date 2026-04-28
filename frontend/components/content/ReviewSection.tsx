'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { upsertReview, deleteReview } from '@/app/actions/reviews'

type Review = {
  id: string
  user_id: string
  content: string
  is_spoiler: boolean
  created_at: string
  user_profiles: { display_name: string | null; avatar_url: string | null } | null
}

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
    const supabase = createClient()
    const { data } = await supabase
      .from('reviews')
      .select('id, user_id, content, is_spoiler, created_at, user_profiles(display_name, avatar_url)')
      .eq('tmdb_id', tmdbId)
      .eq('media_type', mediaType)
      .order('created_at', { ascending: false })
    setReviews((data ?? []) as unknown as Review[])
    setLoading(false)
  }

  useEffect(() => { fetchReviews() }, [tmdbId, mediaType])

  function startEdit() {
    setContent(myReview?.content ?? '')
    setIsSpoiler(myReview?.is_spoiler ?? false)
    setEditing(true)
  }

  async function handleSubmit() {
    if (!content.trim() || saving) return
    setSaving(true)
    try {
      await upsertReview({ tmdbId, mediaType, content: content.trim(), isSpoiler })
      await fetchReviews()
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (saving) return
    setSaving(true)
    try {
      await deleteReview({ tmdbId, mediaType })
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

      {/* Write/Edit form */}
      {userId && editing && (
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="감상을 남겨보세요... (최대 500자)"
            className="w-full bg-background rounded-lg p-3 text-[14px] text-text resize-none outline-none border border-border focus:border-primary"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[13px] text-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSpoiler}
                onChange={(e) => setIsSpoiler(e.target.checked)}
                className="rounded"
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
                className="px-4 py-1.5 rounded-lg bg-primary text-white text-[13px] font-medium disabled:opacity-50"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 rounded-xl bg-surface text-center">
          <span className="text-3xl">✏️</span>
          <p className="text-text font-medium text-[14px]">첫 리뷰를 남겨보세요</p>
          <p className="text-muted text-[12px]">아직 리뷰가 없어요</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r) => {
            const isMe = r.user_id === userId
            const profile = r.user_profiles
            const spoilerVisible = revealed.has(r.id)
            return (
              <div key={r.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative w-7 h-7 rounded-full overflow-hidden bg-surface flex-shrink-0">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={profile.display_name ?? ''}
                        fill
                        className="object-cover"
                        sizes="28px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
                    )}
                  </div>
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

                {r.is_spoiler && !spoilerVisible ? (
                  <div className="flex flex-col items-center gap-2 py-4 rounded-xl bg-surface">
                    <p className="text-muted text-[12px]">스포일러가 포함된 리뷰입니다</p>
                    <button
                      onClick={() => setRevealed((prev) => new Set([...prev, r.id]))}
                      className="px-3 py-1 rounded-full bg-border text-text text-[12px] font-medium"
                    >
                      스포일러 보기
                    </button>
                  </div>
                ) : (
                  <p className="text-text text-[14px] leading-relaxed whitespace-pre-wrap">{r.content}</p>
                )}

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
