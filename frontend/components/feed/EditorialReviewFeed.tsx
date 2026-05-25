'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getReviews, type Review } from '@/lib/api/fetch'
import { formatRelativeTime } from '@/lib/utils/date'

const IMG_BASE = 'https://image.tmdb.org/t/p'
const PAGE_SIZE = 10

interface EditorialReviewFeedProps {
  userId?: string
  onlyFollowing?: boolean
}

export function EditorialReviewFeed({
  userId,
  onlyFollowing = true
}: EditorialReviewFeedProps) {
  const [items, setItems] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    const loadReviews = async () => {
      const response = await getReviews(PAGE_SIZE, 0)
      if (!response.error && response.data) {
        setItems(response.data)
        setHasMore(response.data.length === PAGE_SIZE)
        setOffset(response.data.length)
      }
      setLoading(false)
    }

    loadReviews()
  }, [userId, onlyFollowing])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    const response = await getReviews(PAGE_SIZE, offset)
    if (!response.error && response.data) {
      setItems([...items, ...response.data])
      setHasMore(response.data.length === PAGE_SIZE)
      setOffset(offset + response.data.length)
    }
    setLoadingMore(false)
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
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/review/${item.id}`}
          className="px-4 py-6 hover:bg-gray-50 transition-colors"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {item.user_profiles?.avatar_url ? (
                <Image
                  src={item.user_profiles.avatar_url}
                  alt={item.user_profiles.display_name ?? 'User'}
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
                {item.user_profiles?.display_name ?? '유저'}
              </p>
              <p className="text-xs text-gray-500">
                {formatRelativeTime(new Date(item.created_at))}
              </p>
            </div>
          </div>

          {/* Review Text */}
          <div className="flex-1">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap line-clamp-5">
              {item.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-3 border-t border-gray-200 mt-4">
            <div className="flex gap-4 ml-auto">
              <button className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors">
                <span>❤️</span>
                <span className="text-xs">{item.like_count ?? 0}</span>
              </button>
            </div>
          </div>
        </Link>
      ))}

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="w-full py-4 text-center text-blue-600 hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium text-sm"
        >
          {loadingMore ? '로딩 중...' : '더 보기'}
        </button>
      )}
    </div>
  )
}
