'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getClientToken } from '@/lib/auth/getToken'
import { formatRelativeTime } from '@/lib/utils/date'
import { API_URL, IMG_BASE } from '@/lib/config'
const PAGE_SIZE = 10

type ReviewItem = {
  id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  tmdb_id: number
  media_type: string
  title: string | null
  poster_path: string | null
  rating: number | null
  review_text: string
  highlight_text?: string
  like_count: number
  comment_count: number
  created_at: string
  is_liked?: boolean
}

interface EditorialReviewFeedProps {
  userId?: string
  onlyFollowing?: boolean
}

export function EditorialReviewFeed({
  userId,
  onlyFollowing = true
}: EditorialReviewFeedProps) {
  const [items, setItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchReviews() {
      try {
        const token = await getClientToken()
        const url = new URL(`${API_URL}/v1/reviews`)
        url.searchParams.append('limit', String(PAGE_SIZE))
        if (userId) {
          url.searchParams.append('user_id', userId)
        }
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch reviews')
        const json = await res.json()
        const results = (json.data ?? []) as ReviewItem[]
        setItems(results)
        setHasMore(results.length === PAGE_SIZE)
        setOffset(results.length)
      } catch (err) {
        console.error('Failed to fetch reviews:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [userId, onlyFollowing])

  const handleLike = (reviewId: string) => {
    const newLiked = new Set(likedReviews)
    if (newLiked.has(reviewId)) {
      newLiked.delete(reviewId)
    } else {
      newLiked.add(reviewId)
    }
    setLikedReviews(newLiked)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <span className="text-5xl">📝</span>
        <p className="text-gray-900 font-medium">아직 리뷰가 없어요</p>
        <p className="text-gray-500 text-sm">친구들의 리뷰를 기다려보세요</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-gray-200">
      {items.map((item) => {
        const isLiked = likedReviews.has(item.id)
        return (
          <div key={item.id} className="py-6">
            {/* Header */}
            <div className="px-4 mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {item.title ?? '제목 없음'}
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {item.avatar_url ? (
                    <Image
                      src={item.avatar_url}
                      alt={item.display_name ?? 'User'}
                      fill
                      className="object-cover"
                      sizes="24px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {item.display_name ?? '유저'} · {formatRelativeTime(new Date(item.created_at))}
                </p>
              </div>
            </div>

            {/* Content: Poster + Quote + Review Text */}
            <div className="px-4 mb-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Poster */}
                {item.poster_path && (
                  <div className="relative w-40 h-60 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 shadow-md">
                    <Image
                      src={`${IMG_BASE}/w300${item.poster_path}`}
                      alt={item.title ?? ''}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                )}

                {/* Quote Box + Review Text */}
                <div className="flex-1">
                  {item.highlight_text && (
                    <div className="bg-gray-100 border-l-4 border-gray-400 px-4 py-3 rounded mb-4 italic text-gray-700 text-sm leading-relaxed">
                      "{item.highlight_text}"
                    </div>
                  )}
                  <p className="text-gray-700 text-sm leading-8 whitespace-pre-wrap">
                    {item.review_text}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 flex items-center gap-6 pt-3 border-t border-gray-200">
              <button
                onClick={() => handleLike(item.id)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                style={{ color: isLiked ? '#ff4458' : '#666' }}
              >
                <span className="text-base">{isLiked ? '❤️' : '🤍'}</span>
                <span className="text-xs font-medium">{item.like_count}</span>
              </button>
              <Link
                href={`/review/${item.id}`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span className="text-base">💬</span>
                <span className="text-xs font-medium">{item.comment_count}</span>
              </Link>
            </div>
          </div>
        )
      })}

      {hasMore && (
        <button
          onClick={() => {
            // Load more logic
          }}
          disabled={loadingMore}
          className="w-full py-4 text-center text-blue-600 hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium text-sm"
        >
          {loadingMore ? '로딩 중...' : '더 보기'}
        </button>
      )}
    </div>
  )
}
