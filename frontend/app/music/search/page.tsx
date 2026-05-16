'use client'

import { useState, useEffect, useRef } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import AlbumSearchBar from '@/components/music/AlbumSearchBar'
import AlbumGridView from '@/components/music/AlbumGridView'
import TrackSearchResults from '@/components/music/TrackSearchResults'
import ArtistSearchResults from '@/components/music/ArtistSearchResults'

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

interface SearchTrack {
  spotify_id: string
  title: string
  artist: string
  album_title: string
  album_id: string
  duration_ms: number
  image_url: string
}

interface SearchArtist {
  id: string
  name: string
  genre: string
}

type Tab = 'songs-albums' | 'artists'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export default function MusicSearchPage() {
  const [query, setQuery] = useState('')
  const [albums, setAlbums] = useState<Album[]>([])
  const [tracks, setTracks] = useState<SearchTrack[]>([])
  const [artists, setArtists] = useState<SearchArtist[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('songs-albums')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    if (query.trim().length < 2) {
      setAlbums([])
      setTracks([])
      setArtists([])
      setError(null)
      return
    }

    searchTimeoutRef.current = setTimeout(() => performSearch(query), 500)

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/v1/music/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 20 }),
      })

      if (!response.ok) throw new Error('검색 실패')

      const data = await response.json()

      // 앨범은 상세 정보(트랙 목록)를 병렬 로드
      const albumsWithTracks = await Promise.all(
        (data.albums || []).map(async (album: Album) => {
          try {
            const detail = await fetch(`${API_BASE}/v1/music/albums/${album.spotify_id}`)
            if (detail.ok) return await detail.json()
          } catch {}
          return { ...album, tracks: [] }
        })
      )

      setAlbums(albumsWithTracks)
      setTracks(data.tracks || [])
      setArtists(data.artists || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류 발생')
      setAlbums([])
      setTracks([])
      setArtists([])
    } finally {
      setIsLoading(false)
    }
  }

  const hasResults = albums.length > 0 || tracks.length > 0

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AlbumSearchBar query={query} onQueryChange={setQuery} isLoading={isLoading} />

      {/* 탭 */}
      {(hasResults || isLoading) && (
        <div className="flex border-b border-gray-200 bg-white sticky top-[57px] z-10">
          <button
            onClick={() => setActiveTab('songs-albums')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'songs-albums'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            곡 & 앨범
          </button>
          <button
            onClick={() => setActiveTab('artists')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'artists'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            아티스트 {artists.length > 0 && `(${artists.length})`}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="px-4 py-3 bg-red-50 border-b border-red-200">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {activeTab === 'songs-albums' && (
          <>
            <TrackSearchResults tracks={tracks} />
            {tracks.length > 0 && albums.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">앨범</h2>
              </div>
            )}
            <AlbumGridView albums={albums} isLoading={isLoading} />
          </>
        )}

        {activeTab === 'artists' && (
          <ArtistSearchResults artists={artists} />
        )}
      </div>

      <BottomNav active="search" />
    </div>
  )
}
