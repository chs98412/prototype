'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface SearchTrack {
  spotify_id: string
  title: string
  artist: string
  album_title: string
  album_id: string
  duration_ms: number
  image_url: string
}

function MusicNoteIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="none">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  )
}

export default function TrackCard({ track }: { track: SearchTrack }) {
  const router = useRouter()

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer"
      onClick={() => router.push(`/music/tracks/${track.spotify_id}?albumId=${track.album_id}`)}
    >
      {/* 이미지 */}
      <div className="relative bg-gray-100" style={{ aspectRatio: '1' }}>
        {track.image_url ? (
          <Image
            src={track.image_url}
            alt={track.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
        {/* 곡 배지 */}
        <div className="absolute top-1.5 left-1.5 bg-blue-600 bg-opacity-90 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
          <MusicNoteIcon />
          <span>곡</span>
        </div>
      </div>

      {/* 정보 */}
      <div className="px-2.5 py-2">
        <h3 className="font-bold text-xs text-gray-900 line-clamp-1">{track.title}</h3>
        <p className="text-[11px] text-gray-500 truncate mt-0.5">{track.artist}</p>
        <p className="text-[10px] text-gray-400 truncate">{track.album_title}</p>
      </div>
    </div>
  )
}
