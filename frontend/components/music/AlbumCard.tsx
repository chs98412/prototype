'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import AlbumTrackList from './AlbumTrackList'

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

interface AlbumCardProps {
  album: Album
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  const year = album.release_date ? new Date(album.release_date).getFullYear() : ''
  const genres = album.genres && album.genres.length > 0 ? album.genres.slice(0, 2).join(', ') : '기타'

  const handleGoToDetail = () => {
    router.push(`/music/albums/${album.spotify_id}`)
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      {/* 이미지 (클릭시 상세 페이지) */}
      <div
        className="relative bg-gray-100 cursor-pointer"
        style={{ aspectRatio: '1' }}
        onClick={handleGoToDetail}
      >
        {album.image_url ? (
          <Image
            src={album.image_url}
            alt={album.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="p-3">
        <h3
          className="font-bold text-sm text-gray-900 line-clamp-2 mb-1 cursor-pointer hover:text-blue-600"
          onClick={handleGoToDetail}
        >
          {album.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-1 mb-2">
          {album.artist}
        </p>
        <p className="text-xs text-gray-400 line-clamp-1 mb-3">
          {year} · {genres}
        </p>

        {/* 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 h-9 rounded-lg font-semibold text-xs border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            곡목
          </button>
          <button
            onClick={handleGoToDetail}
            className="flex-1 h-9 rounded-lg font-semibold text-xs bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            평가하기
          </button>
        </div>
      </div>

      {/* 곡목 리스트 (펼쳐질 때) */}
      {isExpanded && (
        <AlbumTrackList
          tracks={album.tracks}
          isExpanded={true}
          onToggle={() => setIsExpanded(false)}
          onAddAlbum={handleGoToDetail}
        />
      )}
    </div>
  )
}
