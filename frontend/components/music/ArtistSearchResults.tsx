'use client'

interface SearchArtist {
  id: string
  name: string
  genre: string
}

interface ArtistSearchResultsProps {
  artists: SearchArtist[]
}

function MusicNoteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  )
}

export default function ArtistSearchResults({ artists }: ArtistSearchResultsProps) {
  if (artists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] px-4">
        <p className="text-gray-500 text-sm">아티스트를 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {artists.map((artist) => (
        <div key={artist.id} className="flex items-center gap-3 px-4 py-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <MusicNoteIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{artist.name}</p>
            {artist.genre && (
              <p className="text-xs text-gray-500 truncate">{artist.genre}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
