'use client'

import Image from 'next/image'

interface AlbumDetailHeaderProps {
  album: {
    title: string
    artist: string
    image_url: string
    release_date: string
    genres?: string[]
  }
  avgRating: number
  ratedTracksCount: number
  totalTracksCount: number
}

export default function AlbumDetailHeader({
  album,
  avgRating,
  ratedTracksCount,
  totalTracksCount,
}: AlbumDetailHeaderProps) {
  const year = new Date(album.release_date).getFullYear()
  const genres = album.genres && album.genres.length > 0
    ? album.genres.slice(0, 3).join(', ')
    : '기타'

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push('★')
      } else if (rating >= i - 0.5) {
        stars.push('½')
      } else {
        stars.push('☆')
      }
    }
    return stars.join('')
  }

  return (
    <div className="bg-white px-4 py-6 border-b border-gray-200">
      <div className="flex gap-4">
        {/* 이미지 */}
        <div className="relative flex-shrink-0" style={{ width: '150px', height: '150px' }}>
          {album.image_url ? (
            <Image
              src={album.image_url}
              alt={album.title}
              fill
              className="object-cover rounded-lg"
              sizes="150px"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-lg font-bold text-gray-900 line-clamp-2 mb-1">
            {album.title}
          </h1>
          <p className="text-sm text-gray-500 mb-3">{album.artist}</p>

          {/* 평점 & 진행도 */}
          {ratedTracksCount > 0 && (
            <div className="inline-block bg-yellow-50 px-3 py-2 rounded-lg mb-2 w-fit">
              <p className="text-sm font-semibold text-gray-900">
                {renderStars(avgRating)} {avgRating.toFixed(1)}/5.0
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${ratedTracksCount === totalTracksCount ? 'bg-green-500' : 'bg-blue-400'}`}
                style={{ width: totalTracksCount > 0 ? `${(ratedTracksCount / totalTracksCount) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {ratedTracksCount}/{totalTracksCount}곡
            </span>
          </div>

          {/* 메타데이터 */}
          <p className="text-xs text-gray-500">
            {year} · {genres}
          </p>
        </div>
      </div>
    </div>
  )
}
