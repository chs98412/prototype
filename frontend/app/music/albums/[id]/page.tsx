'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import AlbumDetailHeader from '@/components/music/AlbumDetailHeader'
import TrackRatingTable from '@/components/music/TrackRatingTable'
import ReviewSection from '@/components/music/ReviewSection'
import AlbumStatsCards from '@/components/music/AlbumStatsCards'
import AlbumReviewDisplay from '@/components/music/AlbumReviewDisplay'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Album {
  spotify_id: string
  title: string
  artist: string
  image_url: string
  release_date: string
  genres?: string[]
  tracks: Track[]
}

interface Track {
  id: string
  spotify_id: string
  title: string
  artist: string
  duration_ms: number
  track_number: number
}

interface Review {
  id: string
  content: string
  hasSpoiler: boolean
  createdAt: Date
  updatedAt: Date
}

function BackArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

export default function AlbumDetailPage() {
  const router = useRouter()
  const params = useParams()
  const albumId = params.id as string

  const [album, setAlbum] = useState<Album | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ratings, setRatings] = useState<Map<string, number>>(new Map())
  const [avgRating, setAvgRating] = useState(0)
  const [review, setReview] = useState<Review | null>(null)
  const [listenDays, setListenDays] = useState(0)

  // 음반 상세 로드
  useEffect(() => {
    const loadAlbum = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${API_BASE}/v1/music/albums/${albumId}`)

        if (!response.ok) {
          throw new Error('음반 정보를 불러올 수 없습니다')
        }

        const data = await response.json()
        setAlbum(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류 발생')
      } finally {
        setIsLoading(false)
      }
    }

    loadAlbum()
  }, [albumId])

  // 평균 평점 계산
  useEffect(() => {
    if (ratings.size === 0) {
      setAvgRating(0)
      return
    }

    const sum = Array.from(ratings.values()).reduce((a, b) => a + b, 0)
    const avg = sum / ratings.size
    setAvgRating(Math.round(avg * 10) / 10)
  }, [ratings])

  // 청취 일수 계산 (임시)
  useEffect(() => {
    if (ratings.size > 0) {
      setListenDays(Math.min(ratings.size, 30))
    } else {
      setListenDays(0)
    }
  }, [ratings])

  const handleRateTrack = async (trackId: string, rating: number) => {
    try {
      const spotifyTrackId = album?.tracks.find(t => t.id === trackId)?.spotify_id
      if (!spotifyTrackId) return

      const response = await fetch(`${API_BASE}/v1/music/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(typeof window !== 'undefined' ? localStorage.getItem('sb-auth-token') : '') || ''}`
        },
        body: JSON.stringify({
          track_spotify_id: spotifyTrackId,
          rating: rating
        })
      })

      if (!response.ok) {
        throw new Error('Failed to rate track')
      }

      setRatings(prev => {
        const next = new Map(prev)
        next.set(trackId, rating)
        return next
      })
    } catch (err) {
      console.error('Failed to rate track:', err)
      throw err
    }
  }

  const handleSubmitReview = async (content: string, hasSpoiler: boolean) => {
    try {
      const response = await fetch(`${API_BASE}/v1/music/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(typeof window !== 'undefined' ? localStorage.getItem('sb-auth-token') : '') || ''}`
        },
        body: JSON.stringify({
          album_spotify_id: album?.spotify_id,
          content: content,
          has_spoiler: hasSpoiler
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      const data = await response.json()
      setReview({
        id: data.id || 'temp-' + Date.now(),
        content,
        hasSpoiler,
        createdAt: new Date(data.created_at || new Date()),
        updatedAt: new Date(data.updated_at || new Date())
      })
    } catch (err) {
      console.error('Failed to submit review:', err)
      throw err
    }
  }

  const handleDeleteReview = async () => {
    try {
      if (!review) return

      const response = await fetch(`${API_BASE}/v1/music/reviews/${review.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete review')
      }

      setReview(null)
    } catch (err) {
      console.error('Failed to delete review:', err)
      throw err
    }
  }

  const handleEditReview = async (content: string, hasSpoiler: boolean) => {
    try {
      if (!review) return

      const response = await fetch(`${API_BASE}/v1/music/reviews/${review.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(typeof window !== 'undefined' ? localStorage.getItem('sb-auth-token') : '') || ''}`
        },
        body: JSON.stringify({
          content: content,
          has_spoiler: hasSpoiler
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update review')
      }

      setReview({
        ...review,
        content,
        hasSpoiler,
        updatedAt: new Date()
      })
    } catch (err) {
      console.error('Failed to update review:', err)
      throw err
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-900">
            <BackArrowIcon />
          </button>
          <span className="text-gray-400">로드 중...</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">로드 중...</div>
        </div>
        <BottomNav active="search" />
      </div>
    )
  }

  if (error || !album) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-900">
            <BackArrowIcon />
          </button>
          <span className="text-gray-900 text-sm">오류</span>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-gray-900 font-semibold mb-2">음반을 불러올 수 없습니다</p>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold"
            >
              뒤로가기
            </button>
          </div>
        </div>
        <BottomNav active="search" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 스티키 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex-shrink-0 text-gray-900 hover:text-gray-700">
          <BackArrowIcon />
        </button>
        <span className="text-sm font-semibold text-gray-900 truncate">
          {album.title}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 음반 헤더 */}
        <AlbumDetailHeader
          album={album}
          avgRating={avgRating}
          ratedTracksCount={ratings.size}
          totalTracksCount={album.tracks.length}
        />

        {/* 곡 평가 테이블 */}
        <div>
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">
              곡목 ({album.tracks.length}곡)
            </h2>
          </div>
          <TrackRatingTable
            tracks={album.tracks}
            onRateTrack={handleRateTrack}
            currentRatings={ratings}
          />
        </div>

        {/* 통계 카드 (곡이 평가된 경우만 표시) */}
        {ratings.size > 0 && (
          <AlbumStatsCards
            stats={{
              ratedTracks: ratings.size,
              totalTracks: album.tracks.length,
              avgRating: avgRating,
              listenDays: listenDays,
              lastListened: new Date()
            }}
          />
        )}

        {/* 리뷰 섹션 */}
        {review ? (
          <AlbumReviewDisplay
            review={review}
            isOwnReview={true}
            onDelete={handleDeleteReview}
            onSubmitEdit={handleEditReview}
          />
        ) : (
          <ReviewSection onSubmitReview={handleSubmitReview} />
        )}
      </div>

      <BottomNav active="search" />
    </div>
  )
}
