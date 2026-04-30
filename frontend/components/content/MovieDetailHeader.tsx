import Image from 'next/image'
import { BackButton } from './BackButton'

const IMG_BASE = 'https://image.tmdb.org/t/p'

interface MovieDetailHeaderProps {
  title: string
  originalTitle?: string
  year?: string
  genres?: { id: number; name: string }[]
  posterPath?: string
  backdropPath?: string
  typeLabel: string
}

export function MovieDetailHeader({
  title,
  originalTitle,
  year,
  genres,
  posterPath,
  backdropPath,
  typeLabel
}: MovieDetailHeaderProps) {
  return (
    <div>
      {/* Back Button Header */}
      <div className="sticky top-0 flex items-center justify-center h-14 px-4 border-b border-gray-200 bg-white">
        <div className="absolute left-4">
          <BackButton />
        </div>
        <h1 className="font-bold text-lg">상세 정보</h1>
      </div>

      {/* Content Section */}
      <div className="px-4 py-8 flex flex-col items-center gap-6">
        {/* Poster */}
        {posterPath && (
          <div className="relative w-40 h-60 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={`${IMG_BASE}/w300${posterPath}`}
              alt={title}
              fill
              priority
              className="object-cover"
              sizes="200px"
            />
          </div>
        )}

        {/* Title & Meta */}
        <div className="text-center max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-1 line-clamp-2">{title}</h2>
          {originalTitle && originalTitle !== title && (
            <p className="text-xs text-gray-500 mb-3">{originalTitle}</p>
          )}
          <p className="text-sm text-gray-600 leading-relaxed">
            {[typeLabel, year].filter(Boolean).join(' · ')}
          </p>
          {genres && genres.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {genres.slice(0, 2).map((g) => g.name).join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
