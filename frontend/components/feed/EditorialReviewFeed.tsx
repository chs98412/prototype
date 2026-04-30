'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils/date'

const IMG_BASE = 'https://image.tmdb.org/t/p'
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

  useEffect(() => {
    const supabase = createClient()

    // Fetch reviews (need to implement get_friend_reviews RPC)
    supabase
      .from('reviews')
      .select(`
        id,
        user_id,
        tmdb_id,
        media_type,
        title,
        review_text,
        rating,
        created_at,
        user_profiles(display_name, avatar_url),
        reviews_likes(count)
      `)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE)
      .then(({ data }) => {
        // Transform data
        const results = (data ?? []).map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          display_name: item.user_profiles?.display_name,
          avatar_url: item.user_profiles?.avatar_url,
          tmdb_id: item.tmdb_id,
          media_type: item.media_type,
          title: item.title,
          poster_path: null, // Need to join with content
          rating: item.rating,
          review_text: item.review_text,
          like_count: item.reviews_likes?.[0]?.count ?? 0,
          comment_count: 0,
          created_at: item.created_at
        })) as ReviewItem[]

        setItems(results)
        setHasMore(results.length === PAGE_SIZE)
        setOffset(results.length)
        setLoading(false)
      })
  }, [userId, onlyFollowing])

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
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/review/${item.id}`}
          className="px-4 py-6 hover:bg-gray-50 transition-colors"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {item.avatar_url ? (
                <Image
                  src={item.avatar_url}
                  alt={item.display_name ?? 'User'}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">👤</div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {item.display_name ?? '유저'}
              </p>
              <p className="text-xs text-gray-500">
                {formatRelativeTime(new Date(item.created_at))}
              </p>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 mb-3">{item.title ?? '제목 없음'}</h3>

          {/* Content: Poster + Review */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Poster */}
            {item.poster_path && (
              <div className="relative w-full md:w-40 h-48 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                <Image
                  src={`${IMG_BASE}/w300${item.poster_path}`}
                  alt={item.title ?? ''}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
            )}

            {/* Review Text */}
            <div className="flex-1">
              {item.highlight_text && (
                <div className="bg-gray-100 border-l-4 border-gray-400 p-3 rounded mb-3 italic text-gray-700 text-sm">
                  "{item.highlight_text}"
                </div>
              )}
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap line-clamp-5">
                {item.review_text}
              </p>
            </div>
          </div>

          {/* Rating & Actions */}
          <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
            {item.rating && (
              <span className="text-sm text-gray-600">⭐ {item.rating}</span>
            )}
            <div className="flex gap-4 ml-auto">
              <button className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors">
                <span>❤️</span>
                <span className="text-xs">{item.like_count}</span>
              </button>
              <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                <span>💬</span>
                <span className="text-xs">{item.comment_count}</span>
              </button>
            </div>
          </div>
        </Link>
      ))}

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
