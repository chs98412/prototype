'use client'

import { useState } from 'react'

interface Track {
  spotify_id: string
  title: string
  artist: string
  duration_ms: number
  track_number: number
}

interface AlbumTrackListProps {
  tracks: Track[]
  isExpanded: boolean
  onToggle: () => void
  onAddAlbum: () => void
  isLoading?: boolean
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function formatTotalDuration(tracks: Track[]): string {
  const totalSeconds = Math.floor(tracks.reduce((sum, t) => sum + t.duration_ms, 0) / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export default function AlbumTrackList({
  tracks,
  isExpanded,
  onToggle,
  onAddAlbum,
  isLoading = false,
}: AlbumTrackListProps) {
  const [showAll, setShowAll] = useState(false)
  const displayTracks = showAll ? tracks : tracks.slice(0, 5)
  const hiddenCount = Math.max(0, tracks.length - 5)

  return (
    <div className="border-t border-gray-200">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-900">
          곡목 ({tracks.length}) · {formatTotalDuration(tracks)}
        </span>
        <ChevronIcon expanded={isExpanded} />
      </button>

      {isExpanded && (
        <div className="px-4 py-3 bg-gray-50">
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {displayTracks.map((track) => (
              <div key={track.spotify_id} className="py-2 flex items-start gap-3">
                <span className="text-xs font-bold text-gray-500 flex-shrink-0 w-5">
                  {track.track_number}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {track.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatDuration(track.duration_ms)}
                </span>
              </div>
            ))}
          </div>

          {hiddenCount > 0 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full text-center text-xs text-blue-500 font-semibold mt-2 py-2 hover:bg-gray-100 rounded"
            >
              더 보기 ({hiddenCount}곡)
            </button>
          )}

          <button
            onClick={onAddAlbum}
            disabled={isLoading}
            className="w-full mt-4 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            {isLoading ? '추가 중...' : '음반 추가'}
          </button>
        </div>
      )}
    </div>
  )
}
