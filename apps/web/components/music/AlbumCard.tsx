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

function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

interface AlbumCardProps {
  album: Album
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  const year = album.release_date ? new Date(album.release_date).getFullYear() : ''
  const genre = album.genres?.[0] ?? '기타'

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      {/* 이미지 — 클릭 시 상세 */}
      <div
        className="relative bg-gray-100 cursor-pointer"
        style={{ aspectRatio: '1' }}
        onClick={() => router.push(`/music/albums/${album.spotify_id}`)}
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
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
        {/* 앨범 배지 */}
        <div className="absolute top-1.5 left-1.5 bg-black bg-opacity-60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
          앨범
        </div>
      </div>

      {/* 정보 */}
      <div
        className="px-2.5 pt-2 pb-1 cursor-pointer"
        onClick={() => router.push(`/music/albums/${album.spotify_id}`)}
      >
        <h3 className="font-bold text-xs text-gray-900 line-clamp-1">{album.title}</h3>
        <p className="text-[11px] text-gray-500 truncate mt-0.5">{album.artist}</p>
        <p className="text-[10px] text-gray-400 truncate">{year}{year && genre ? ' · ' : ''}{genre}</p>
      </div>

      {/* 곡목 토글 버튼 */}
      <div className="px-2.5 pb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded transition-colors ${
            isExpanded ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <ListIcon />
          <span>{album.tracks.length > 0 ? `${album.tracks.length}곡` : '곡목'}</span>
        </button>
      </div>

      {/* 곡목 미리보기 */}
      {isExpanded && (
        <AlbumTrackList
          tracks={album.tracks}
          isExpanded={true}
          onToggle={() => setIsExpanded(false)}
          onAddAlbum={() => router.push(`/music/albums/${album.spotify_id}`)}
        />
      )}
    </div>
  )
}
