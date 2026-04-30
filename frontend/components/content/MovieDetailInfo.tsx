import Link from 'next/link'
import Image from 'next/image'

const IMG_BASE = 'https://image.tmdb.org/t/p'

interface Director {
  id: number
  name: string
  job: string
}

interface CastMember {
  id: number
  name: string
  character: string
  profile_path?: string
}

interface MovieDetailInfoProps {
  overview?: string
  directors: Director[]
  cast: CastMember[]
}

export function MovieDetailInfo({ overview, directors, cast }: MovieDetailInfoProps) {
  return (
    <div className="flex flex-col gap-6 px-4 pb-4">
      {/* Synopsis */}
      {overview && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">줄거리</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{overview}</p>
        </div>
      )}

      {/* Director */}
      {directors.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">감독</h2>
          <div className="flex gap-2 flex-wrap">
            {directors.map((d) => (
              <Link
                key={d.id}
                href={`/person/${d.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                {d.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Cast */}
      {cast.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3">출연진</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {cast.map((actor) => (
              <Link
                key={actor.id}
                href={`/person/${actor.id}`}
                className="flex flex-col items-center gap-1 flex-shrink-0 w-[70px]"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  {actor.profile_path ? (
                    <Image
                      src={`${IMG_BASE}/w185${actor.profile_path}`}
                      alt={actor.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-900 text-center line-clamp-2">
                  {actor.name}
                </p>
                <p className="text-xs text-gray-500 text-center line-clamp-1">
                  {actor.character}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
