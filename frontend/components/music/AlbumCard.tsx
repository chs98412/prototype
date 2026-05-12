'use client'

import { useState } from 'react'
import Image from 'next/image'
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
  isAdded?: boolean
  onAdd?: () => Promise<void>
}

export default function AlbumCard({ album, isAdded = false, onAdd }: AlbumCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const year = new Date(album.release_date).getFullYear()
  const genres = album.genres && album.genres.length > 0 ? album.genres.slice(0, 2).join(', ') : '기타'

  const handleAdd = async () => {
    if (!onAdd || isAdded) return

    setIsLoading(true)
    try {
      await onAdd()
    } catch (error) {
      console.error('Failed to add album:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      {/* 이미지 */}
      <div className="relative bg-gray-100" style={{ aspectRatio: '1' }}>
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
        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-1">
          {album.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-1 mb-2">
          {album.artist}
        </p>
        <p className="text-xs text-gray-400 line-clamp-1 mb-3">
          {year} · {genres}
        </p>

        {/* 추가 버튼 */}
        <button
          onClick={() => {
            if (!isExpanded) {
              setIsExpanded(true)
            } else {
              handleAdd()
            }
          }}
          disabled={isAdded || isLoading}
          className={`w-full h-10 rounded-lg font-semibold text-sm transition-colors ${
            isAdded
              ? 'bg-gray-200 text-gray-500 cursor-default'
              : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white'
          }`}
        >
          {isLoading ? '추가 중...' : isAdded ? '✓ 추가됨' : '곡목 보기'}
        </button>
      </div>

      {/* 곡목 리스트 (펼쳐질 때) */}
      {isExpanded && (
        <AlbumTrackList
          tracks={album.tracks}
          isExpanded={true}
          onToggle={() => setIsExpanded(false)}
          onAddAlbum={handleAdd}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
