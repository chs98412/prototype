'use client'

import { useState } from 'react'
import { StarRating } from '../content/StarRating'

interface Track {
  id: string
  spotify_id: string
  title: string
  artist: string
  duration_ms: number
  track_number: number
}

interface TrackRatingTableProps {
  tracks: Track[]
  onRateTrack: (trackId: string, rating: number) => Promise<void>
  currentRatings: Map<string, number>
  savingTrackId?: string
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export default function TrackRatingTable({
  tracks,
  onRateTrack,
  currentRatings,
  savingTrackId,
}: TrackRatingTableProps) {
  const [savingTracks, setSavingTracks] = useState<Set<string>>(new Set())

  const handleRateTrack = async (trackId: string, rating: number) => {
    setSavingTracks(prev => new Set([...prev, trackId]))
    try {
      await onRateTrack(trackId, rating)
    } finally {
      setSavingTracks(prev => {
        const next = new Set(prev)
        next.delete(trackId)
        return next
      })
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3 w-10">
              #
            </th>
            <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">
              곡명
            </th>
            <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3 hidden sm:table-cell">
              아티스트
            </th>
            <th className="text-right text-xs font-semibold text-gray-600 px-4 py-3 w-12">
              시간
            </th>
            <th className="text-center text-xs font-semibold text-gray-600 px-4 py-3 min-w-[140px]">
              평가
            </th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track) => {
            const rating = currentRatings.get(track.id) || 0
            const isSaving = savingTracks.has(track.id)

            return (
              <tr key={track.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="text-left text-xs font-bold text-gray-500 px-4 py-3">
                  {track.track_number}
                </td>
                <td className="text-left text-sm font-semibold text-gray-900 px-4 py-3">
                  <div className="line-clamp-1">{track.title}</div>
                  <div className="text-xs text-gray-500 line-clamp-1 sm:hidden">
                    {track.artist}
                  </div>
                </td>
                <td className="text-left text-xs text-gray-500 px-4 py-3 hidden sm:table-cell line-clamp-1">
                  {track.artist}
                </td>
                <td className="text-right text-xs text-gray-400 px-4 py-3">
                  {formatDuration(track.duration_ms)}
                </td>
                <td className="text-center text-xs px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <StarRating
                      value={rating}
                      onChange={(newRating) => handleRateTrack(track.id, newRating)}
                      disabled={isSaving}
                    />
                  </div>
                  {isSaving && (
                    <div className="text-xs text-gray-400 mt-1">저장중...</div>
                  )}
                  {!isSaving && rating > 0 && (
                    <div className="text-xs text-gray-400 mt-1">✓</div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
