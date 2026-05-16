'use client'

import { useState } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import AlbumSearchBar from '@/components/music/AlbumSearchBar'
import AlbumCard from '@/components/music/AlbumCard'
import TrackCard from '@/components/music/TrackCard'
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
  const [hasSearched, setHasSearched] = useState(false)

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const response = await fetch(`${API_BASE}/v1/music/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 20 }),
      })

      if (!response.ok) throw new Error('검색 실패')

      const data = await response.json()

      // 앨범 트랙 목록 병렬 로드
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

  // 곡과 앨범을 교차 배치 (인기도 순서 유지)
  const mixedItems: Array<{ type: 'track'; data: SearchTrack } | { type: 'album'; data: Album }> = []
  const maxLen = Math.max(albums.length, tracks.length)
  for (let i = 0; i < maxLen; i++) {
    if (i < tracks.length) mixedItems.push({ type: 'track', data: tracks[i] })
    if (i < albums.length) mixedItems.push({ type: 'album', data: albums[i] })
  }

  const hasResults = mixedItems.length > 0 || artists.length > 0

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AlbumSearchBar
        query={query}
        onQueryChange={setQuery}
        onSearch={() => performSearch(query)}
        isLoading={isLoading}
      />

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
            곡 & 앨범 {mixedItems.length > 0 && `(${mixedItems.length})`}
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

        {/* 곡 & 앨범 탭 */}
        {activeTab === 'songs-albums' && (
          <>
            {isLoading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-3 pb-20">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-lg overflow-hidden border border-gray-100">
                    <div className="bg-gray-200 animate-pulse" style={{ aspectRatio: '1' }} />
                    <div className="p-2.5 space-y-1.5">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5" />
                      <div className="h-2.5 bg-gray-200 rounded animate-pulse w-3/5" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && mixedItems.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-3 pb-20">
                {mixedItems.map((item) =>
                  item.type === 'track' ? (
                    <TrackCard key={`track-${item.data.spotify_id}`} track={item.data} />
                  ) : (
                    <AlbumCard key={`album-${item.data.spotify_id}`} album={item.data} />
                  )
                )}
              </div>
            )}

            {!isLoading && hasSearched && mixedItems.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[40vh] px-4">
                <p className="text-gray-500 text-sm">곡이나 앨범을 찾을 수 없습니다.</p>
              </div>
            )}

            {!hasSearched && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
                <p className="text-gray-600 font-semibold">음악을 검색해보세요</p>
                <p className="text-gray-400 text-sm mt-1">곡 제목, 앨범명, 아티스트명으로 검색</p>
              </div>
            )}
          </>
        )}

        {/* 아티스트 탭 */}
        {activeTab === 'artists' && (
          <ArtistSearchResults artists={artists} />
        )}
      </div>

      <BottomNav active="search" />
    </div>
  )
}
