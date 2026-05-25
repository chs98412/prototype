'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { getClientToken } from '@/lib/auth/getToken'
import { BottomNav } from '@/components/layout/BottomNav'
import { StarRating } from '@/components/content/StarRating'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Track {
  spotify_id: string
  title: string
  artist: string
  duration_ms: number
  track_number: number
}

interface Album {
  spotify_id: string
  title: string
  artist: string
  image_url: string
  release_date: string
  genres?: string[]
  tracks: Track[]
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function AlbumIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export default function TrackDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const trackId = params.id as string
  const albumId = searchParams.get('albumId')

  const [album, setAlbum] = useState<Album | null>(null)
  const [track, setTrack] = useState<Track | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [token, setToken] = useState('')

  useEffect(() => {
    const loadToken = async () => {
      const t = await getClientToken()
      setToken(t)
    }
    loadToken()
  }, [])

  useEffect(() => {
    if (!albumId) {
      setError('앨범 정보가 없습니다.')
      setIsLoading(false)
      return
    }

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/music/albums/${albumId}`)
        if (!res.ok) throw new Error('정보를 불러올 수 없습니다')
        const data: Album = await res.json()
        setAlbum(data)
        const found = data.tracks.find((t) => t.spotify_id === trackId)
        if (!found) throw new Error('곡을 찾을 수 없습니다')
        setTrack(found)
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류 발생')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [trackId, albumId])

  const handleRate = async (newRating: number) => {
    if (!token) {
      console.error('No auth token available')
      return
    }
    setIsSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`${API_BASE}/v1/music/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ track_spotify_id: trackId, rating: newRating }),
      })
      if (!res.ok) throw new Error('Failed to rate')
      setRating(newRating)
      setSaved(true)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-900"><BackIcon /></button>
          <span className="text-gray-400 text-sm">로드 중...</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
        <BottomNav active="search" />
      </div>
    )
  }

  if (error || !track || !album) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-900"><BackIcon /></button>
          <span className="text-sm text-gray-900">오류</span>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 text-center">
          <div>
            <p className="text-gray-900 font-semibold mb-2">곡을 불러올 수 없습니다</p>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button onClick={() => router.back()} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold">
              뒤로가기
            </button>
          </div>
        </div>
        <BottomNav active="search" />
      </div>
    )
  }

  const otherTracks = album.tracks.filter((t) => t.spotify_id !== trackId)
  const year = album.release_date ? new Date(album.release_date).getFullYear() : ''
  const genre = album.genres?.[0]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex-shrink-0 text-gray-900 hover:text-gray-700">
          <BackIcon />
        </button>
        <span className="text-sm font-semibold text-gray-900 truncate">{track.title}</span>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* 앨범 아트 + 기본 정보 */}
        <div className="px-6 py-8 flex flex-col items-center text-center">
          <div className="relative w-52 h-52 rounded-xl overflow-hidden shadow-lg mb-5">
            {album.image_url ? (
              <Image src={album.image_url} alt={album.title} fill className="object-cover" sizes="208px" />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-1">{track.title}</h1>
          <p className="text-base text-gray-500 mb-4">{track.artist}</p>

          {/* 메타 정보 */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-6">
            <span className="flex items-center gap-1">
              <AlbumIcon />
              {track.track_number}번 트랙
            </span>
            <span className="text-gray-200">|</span>
            <span className="flex items-center gap-1">
              <ClockIcon />
              {formatDuration(track.duration_ms)}
            </span>
            {genre && (
              <>
                <span className="text-gray-200">|</span>
                <span>{genre}</span>
              </>
            )}
          </div>

          {/* 별점 */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <p className="text-sm font-semibold text-gray-700">이 곡 평가</p>
            <StarRating value={rating} onChange={handleRate} disabled={isSaving} />
            {isSaving && <p className="text-xs text-gray-400">저장 중...</p>}
            {saved && !isSaving && <p className="text-xs text-green-600">저장됨 ✓</p>}
          </div>
        </div>

        {/* 앨범 정보 카드 */}
        <div
          className="mx-4 mb-4 flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => router.push(`/music/albums/${album.spotify_id}`)}
        >
          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
            {album.image_url ? (
              <Image src={album.image_url} alt={album.title} fill className="object-cover" sizes="56px" />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">수록 앨범</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{album.title}</p>
            <p className="text-xs text-gray-500 truncate">{album.artist}{year ? ` · ${year}` : ''}</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>

        {/* 앨범의 다른 곡 */}
        {otherTracks.length > 0 && (
          <div className="mx-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">앨범의 다른 곡</p>
            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
              {otherTracks.slice(0, 8).map((t) => (
                <button
                  key={t.spotify_id}
                  onClick={() => router.push(`/music/tracks/${t.spotify_id}?albumId=${album.spotify_id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-xs text-gray-400 w-5 text-center flex-shrink-0">{t.track_number}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                    <p className="text-xs text-gray-400 truncate">{t.artist}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDuration(t.duration_ms)}</span>
                </button>
              ))}
              {otherTracks.length > 8 && (
                <button
                  onClick={() => router.push(`/music/albums/${album.spotify_id}`)}
                  className="w-full py-3 text-xs text-blue-500 font-semibold hover:bg-gray-50"
                >
                  앨범 전체 보기 ({album.tracks.length}곡)
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav active="search" />
    </div>
  )
}
