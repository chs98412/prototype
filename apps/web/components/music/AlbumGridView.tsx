'use client'

import AlbumCard from './AlbumCard'

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

interface AlbumGridViewProps {
  albums: Album[]
  isLoading: boolean
}

export default function AlbumGridView({
  albums,
  isLoading,
}: AlbumGridViewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 md:gap-x-3 gap-y-4 md:gap-y-5 px-4 pt-4 pb-20">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg animate-pulse" style={{ aspectRatio: '1' }} />
        ))}
      </div>
    )
  }

  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 mb-3">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p className="text-gray-600 text-center">결과를 찾을 수 없습니다.</p>
        <p className="text-gray-400 text-sm text-center mt-1">다른 검색어를 시도해보세요.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 md:gap-x-3 gap-y-4 md:gap-y-5 px-4 pt-4 pb-20">
      {albums.map((album) => (
        <AlbumCard
          key={album.spotify_id}
          album={album}
        />
      ))}
    </div>
  )
}
