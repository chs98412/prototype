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

interface TrackSearchResultsProps {
  tracks: SearchTrack[]
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export default function TrackSearchResults({ tracks }: TrackSearchResultsProps) {
  const router = useRouter()

  if (tracks.length === 0) return null

  return (
    <div>
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">곡</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {tracks.map((track) => (
          <button
            key={track.spotify_id}
            onClick={() => router.push(`/music/albums/${track.album_id}`)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="relative flex-shrink-0 w-10 h-10 rounded overflow-hidden bg-gray-100">
              {track.image_url ? (
                <Image src={track.image_url} alt={track.title} fill className="object-cover" sizes="40px" />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{track.title}</p>
              <p className="text-xs text-gray-500 truncate">{track.artist} · {track.album_title}</p>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{formatDuration(track.duration_ms)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
