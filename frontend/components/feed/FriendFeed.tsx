'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getFeed, type FeedItem } from '@/lib/api/fetch'

const IMG_BASE = 'https://image.tmdb.org/t/p'
const PAGE_SIZE = 20

const STATUS_LABELS: Record<string, string> = {
  watched: '봤어요',
  watching: '보는 중',
  want: '보고 싶어요',
}

function relativeTime(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export function FriendFeed({ userId }: { userId: string }) {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    const loadFeed = async () => {
      const response = await getFeed(PAGE_SIZE, 0)
      if (!response.error && response.data) {
        const results = response.data
        setItems(results)
        setHasMore(results.length === PAGE_SIZE)
        setOffset(results.length)
      }
      setLoading(false)
    }
    loadFeed()
  }, [userId])

  async function handleLoadMore() {
    setLoadingMore(true)
    const response = await getFeed(PAGE_SIZE, offset)
    if (!response.error && response.data) {
      const results = response.data
      setItems((prev) => [...prev, ...results])
      setHasMore(results.length === PAGE_SIZE)
      setOffset((prev) => prev + results.length)
    }
    setLoadingMore(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="text-4xl">👥</span>
        <p className="text-text font-medium text-[15px]">친구를 팔로우해보세요</p>
        <p className="text-muted text-[13px]">팔로우한 친구의 기록이 여기에 표시돼요</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <Link
          key={`${item.friend_id}-${item.media_type}-${item.tmdb_id}-${i}`}
          href={`/content/${item.media_type}/${item.tmdb_id}`}
          className="flex gap-3 bg-surface rounded-2xl p-3 active:bg-border transition-colors"
        >
          <div className="relative w-[54px] h-[80px] rounded-lg overflow-hidden bg-background flex-shrink-0">
            {item.poster_path ? (
              <Image
                src={`${IMG_BASE}/w185${item.poster_path}`}
                alt={item.title ?? ''}
                fill
                className="object-cover"
                sizes="54px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">🎬</div>
            )}
          </div>

          <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
            <div className="flex items-center gap-2">
              <div className="relative w-5 h-5 rounded-full overflow-hidden bg-background flex-shrink-0">
                {item.avatar_url ? (
                  <Image
                    src={item.avatar_url}
                    alt={item.display_name ?? ''}
                    fill
                    className="object-cover"
                    sizes="20px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px]">👤</div>
                )}
              </div>
              <span className="text-muted text-[12px] font-medium truncate">{item.display_name ?? '유저'}</span>
              <span className="text-muted text-[11px] ml-auto flex-shrink-0">{relativeTime(item.updated_at)}</span>
            </div>

            <p className="text-text text-[14px] font-semibold leading-snug line-clamp-2 mt-1">
              {item.title ?? '제목 없음'}
            </p>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-muted bg-background px-2 py-0.5 rounded-full">
                {STATUS_LABELS[item.status] ?? item.status}
              </span>
              {item.rating && (
                <span className="text-[11px] text-muted">⭐ {item.rating}</span>
              )}
            </div>
          </div>
        </Link>
      ))}

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="text-primary text-[14px] font-medium py-3 text-center disabled:opacity-50"
        >
          {loadingMore ? '로딩 중...' : '더 보기'}
        </button>
      )}
    </div>
  )
}
