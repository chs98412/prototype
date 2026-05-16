'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import AlbumSearchBar from '@/components/music/AlbumSearchBar'
import AlbumGridView from '@/components/music/AlbumGridView'

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
  spotify_id: string
  title: string
  artist: string
  duration_ms: number
  track_number: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export default function MusicSearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [albums, setAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 검색 쿼리 변경 시
  useEffect(() => {
    // 이전 타이머 취소
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.trim().length < 2) {
      setAlbums([])
      setError(null)
      return
    }

    // 500ms 디바운싱
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/v1/music/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 20,
        }),
      })

      if (!response.ok) {
        throw new Error('검색 실패')
      }

      const data = await response.json()
      const albumsWithTracks = await Promise.all(
        (data.albums || []).map(async (album: any) => {
          try {
            const detailResponse = await fetch(`${API_BASE}/v1/music/albums/${album.spotify_id}`)
            if (detailResponse.ok) {
              return await detailResponse.json()
            }
          } catch (err) {
            console.error(`Failed to fetch album details for ${album.spotify_id}:`, err)
          }
          return {
            spotify_id: album.spotify_id,
            title: album.title,
            artist: album.artist,
            image_url: album.image_url || '',
            release_date: album.release_date || '',
            genres: album.genres || [],
            tracks: [],
          }
        })
      )

      setAlbums(albumsWithTracks)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류 발생')
      setAlbums([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AlbumSearchBar
        query={query}
        onQueryChange={setQuery}
        isLoading={isLoading}
      />

      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="px-4 py-3 bg-red-50 border-b border-red-200">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <AlbumGridView
          albums={albums}
          isLoading={isLoading}
        />
      </div>

      <BottomNav active="search" />
    </div>
  )
}
