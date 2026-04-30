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
      {/* Hero Background */}
      <div className="relative w-full h-[280px] md:h-[360px]">
        {backdropPath ? (
          <Image
            src={`${IMG_BASE}/w780${backdropPath}`}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : posterPath ? (
          <Image
            src={`${IMG_BASE}/w500${posterPath}`}
            alt={title}
            fill
            priority
            className="object-cover object-top"
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-6xl">🎬</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />

        <div className="absolute top-4 left-4">
          <BackButton />
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 py-6 flex flex-col items-center gap-4">
        {/* Poster */}
        {posterPath && (
          <div className="relative w-[160px] h-[240px] rounded-lg overflow-hidden shadow-md md:w-[200px] md:h-[300px]">
            <Image
              src={`${IMG_BASE}/w300${posterPath}`}
              alt={title}
              fill
              className="object-cover"
              sizes="200px"
            />
          </div>
        )}

        {/* Title & Meta */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{title}</h1>
          {originalTitle && originalTitle !== title && (
            <p className="text-sm text-gray-500 mb-3">{originalTitle}</p>
          )}
          <div className="flex justify-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-600">
              {typeLabel}
            </span>
            {year && (
              <span className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-600">
                {year}
              </span>
            )}
            {genres?.slice(0, 2).map((g) => (
              <span key={g.id} className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-600">
                {g.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
