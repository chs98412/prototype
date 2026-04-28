import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BackButton } from '@/components/content/BackButton'
import { RecordSection } from '@/components/content/RecordSection'
import type { Metadata } from 'next'

export const revalidate = 86400

const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p'

type Params = { type: string; id: string }

type TmdbContent = {
  id: number
  title?: string
  name?: string
  original_title?: string
  original_name?: string
  overview?: string
  poster_path?: string
  backdrop_path?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
  vote_count?: number
  genres?: { id: number; name: string }[]
  credits?: {
    cast: { id: number; name: string; character: string; profile_path?: string }[]
    crew: { id: number; name: string; job: string }[]
  }
}

async function fetchContent(type: string, id: string): Promise<TmdbContent | null> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return null

  if (type !== 'movie' && type !== 'tv') return null

  const url = `${TMDB_BASE}/${type}/${id}?api_key=${apiKey}&language=ko-KR&append_to_response=credits`
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) return null
  return res.json()
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { type, id } = await params
  const content = await fetchContent(type, id)
  if (!content) return { title: '작품 상세' }
  const title = content.title ?? content.name ?? '작품 상세'
  return {
    title: `${title} — Logged`,
    description: content.overview?.slice(0, 150),
  }
}

export default async function ContentDetailPage({ params }: { params: Promise<Params> }) {
  const { type, id } = await params
  const content = await fetchContent(type, id)
  if (!content) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 관련 도전과제 조회 (tmdb_ids에 현재 작품 포함된 것)
  const tmdbId = Number(id)
  const { data: relatedChallenges = [] } = await supabase
    .from('challenges')
    .select('id, title, badge_emoji, required_count')
    .contains('tmdb_ids', [tmdbId])

  // 유저의 해당 도전과제 진척도
  const progressMap = new Map<string, { current_count: number; completed_at: string | null }>()
  if (user && relatedChallenges && relatedChallenges.length > 0) {
    const { data: progresses = [] } = await supabase
      .from('user_challenge_progress')
      .select('challenge_id, current_count, completed_at')
      .eq('user_id', user.id)
      .in('challenge_id', relatedChallenges.map((c) => c.id))
    progresses?.forEach((p) => progressMap.set(p.challenge_id, p))
  }

  const title = content.title ?? content.name ?? ''
  const originalTitle = content.original_title ?? content.original_name ?? ''
  const year = (content.release_date ?? content.first_air_date ?? '').slice(0, 4)
  const rating = content.vote_average?.toFixed(1) ?? '0.0'
  const voteCount = content.vote_count ?? 0
  const directors = content.credits?.crew.filter((c) => c.job === 'Director').slice(0, 2) ?? []
  const cast = content.credits?.cast.slice(0, 10) ?? []
  const typeLabel = type === 'movie' ? '영화' : '시리즈'

  return (
    <main className="flex flex-col min-h-screen bg-background pb-10">
      {/* Hero */}
      <div className="relative w-full h-[360px]">
        {content.backdrop_path ? (
          <Image
            src={`${IMG_BASE}/w780${content.backdrop_path}`}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : content.poster_path ? (
          <Image
            src={`${IMG_BASE}/w500${content.poster_path}`}
            alt={title}
            fill
            priority
            className="object-cover object-top"
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center text-6xl">🎬</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        <div className="absolute top-4 left-4">
          <BackButton />
        </div>

        {/* Poster + title overlay */}
        <div className="absolute bottom-0 left-0 right-0 flex gap-4 px-4 pb-4">
          {content.poster_path && (
            <div className="relative w-[80px] h-[120px] rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
              <Image
                src={`${IMG_BASE}/w300${content.poster_path}`}
                alt={title}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          )}
          <div className="flex flex-col justify-end gap-1 min-w-0 pb-1">
            <h1 className="text-text font-bold text-xl leading-tight">{title}</h1>
            {originalTitle && originalTitle !== title && (
              <p className="text-muted text-[13px] leading-tight truncate">{originalTitle}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-surface text-[12px] text-muted">{typeLabel}</span>
              {year && <span className="px-2 py-0.5 rounded-full bg-surface text-[12px] text-muted">{year}</span>}
              {content.genres?.slice(0, 2).map((g) => (
                <span key={g.id} className="px-2 py-0.5 rounded-full bg-surface text-[12px] text-muted">{g.name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-4 pt-4">
        {/* Rating */}
        <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-surface">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="text-text font-bold text-xl">{rating}</p>
            <p className="text-muted text-[12px]">{voteCount.toLocaleString()}명이 평가</p>
          </div>
        </div>

        {/* Record status & rating */}
        <RecordSection
          tmdbId={content.id}
          mediaType={type as 'movie' | 'tv'}
          isLoggedIn={!!user}
          title={title}
          posterPath={content.poster_path}
        />

        {/* Synopsis */}
        {content.overview && (
          <div>
            <h2 className="text-text font-semibold text-[15px] mb-2">줄거리</h2>
            <p className="text-muted text-[14px] leading-relaxed">{content.overview}</p>
          </div>
        )}

        {/* Director */}
        {directors.length > 0 && (
          <div>
            <h2 className="text-text font-semibold text-[15px] mb-2">감독</h2>
            <div className="flex gap-2 flex-wrap">
              {directors.map((d) => (
                <Link key={d.id} href={`/person/${d.id}`} className="text-primary text-[14px] underline-offset-2 hover:underline">
                  {d.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <div>
            <h2 className="text-text font-semibold text-[15px] mb-3">출연진</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {cast.map((actor) => (
                <Link key={actor.id} href={`/person/${actor.id}`} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-[68px]">
                  <div className="relative w-[60px] h-[60px] rounded-full overflow-hidden bg-surface">
                    {actor.profile_path ? (
                      <Image
                        src={`${IMG_BASE}/w185${actor.profile_path}`}
                        alt={actor.name}
                        fill
                        className="object-cover"
                        sizes="60px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                    )}
                  </div>
                  <p className="text-text text-[11px] font-medium text-center leading-tight line-clamp-2">{actor.name}</p>
                  <p className="text-muted text-[10px] text-center leading-tight line-clamp-1">{actor.character}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related challenges */}
        {relatedChallenges && relatedChallenges.length > 0 && (
          <div>
            <h2 className="text-text font-semibold text-[15px] mb-3">관련 도전과제</h2>
            <div className="flex flex-col gap-2">
              {relatedChallenges.map((ch) => {
                const p = progressMap.get(ch.id)
                const current = p?.current_count ?? 0
                const isDone = !!p?.completed_at
                const pct = Math.min(100, Math.round((current / ch.required_count) * 100))
                return (
                  <div key={ch.id} className={`flex items-center gap-3 p-3 rounded-xl ${isDone ? 'bg-primary/10' : 'bg-surface'}`}>
                    <span className="text-2xl">{ch.badge_emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-text text-[14px] font-medium">{ch.title}</p>
                      {user && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[11px] text-muted flex-shrink-0">{current}/{ch.required_count}</span>
                        </div>
                      )}
                    </div>
                    {isDone && <span className="text-primary text-[12px] font-bold flex-shrink-0">✓</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Reviews placeholder */}
        <div>
          <h2 className="text-text font-semibold text-[15px] mb-3">리뷰</h2>
          <div className="flex flex-col items-center gap-2 py-8 rounded-xl bg-surface text-center">
            <span className="text-3xl">✏️</span>
            <p className="text-text font-medium text-[14px]">첫 리뷰를 남겨보세요</p>
            <p className="text-muted text-[12px]">아직 리뷰가 없어요</p>
          </div>
        </div>
      </div>
    </main>
  )
}
