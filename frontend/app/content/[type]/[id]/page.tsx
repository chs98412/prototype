import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { TMDB_BASE, IMG_BASE } from '@/lib/config'
import { BackButton } from '@/components/content/BackButton'
import { RecordSection } from '@/components/content/RecordSection'
import { ReviewSection } from '@/components/content/ReviewSection'
import { MovieDetailHeader } from '@/components/content/MovieDetailHeader'
import { MovieDetailInfo } from '@/components/content/MovieDetailInfo'
import type { Metadata } from 'next'

export const revalidate = 86400

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

  const user = await getCurrentUser()

  // 관련 도전과제 조회 (프론트엔드에서 필터링)
  const tmdbId = Number(id)
  const relatedChallenges: any[] = []

  // 유저의 해당 도전과제 진척도
  const progressMap = new Map<string, { current_count: number; completed_at: string | null }>()

  const title = content.title ?? content.name ?? ''
  const originalTitle = content.original_title ?? content.original_name ?? ''
  const year = (content.release_date ?? content.first_air_date ?? '').slice(0, 4)
  const rating = content.vote_average?.toFixed(1) ?? '0.0'
  const voteCount = content.vote_count ?? 0
  const directors = content.credits?.crew.filter((c) => c.job === 'Director').slice(0, 2) ?? []
  const cast = content.credits?.cast.slice(0, 10) ?? []
  const typeLabel = type === 'movie' ? '영화' : '시리즈'

  return (
    <main className="flex flex-col min-h-screen bg-white pb-10">
      {/* Header with poster and title */}
      <MovieDetailHeader
        title={title}
        originalTitle={originalTitle}
        year={year}
        genres={content.genres}
        posterPath={content.poster_path}
        backdropPath={content.backdrop_path}
        typeLabel={typeLabel}
      />

      <div className="flex flex-col gap-6 px-4 pt-6">
        {/* Rating */}
        <div className="flex items-center gap-3 py-3 px-4 rounded-lg bg-gray-50 border border-gray-200">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="text-gray-900 font-bold text-xl">{rating}</p>
            <p className="text-gray-500 text-xs">{voteCount.toLocaleString()}명이 평가</p>
          </div>
        </div>

        {/* Record status & rating */}
        <RecordSection
          tmdbId={content.id}
          mediaType={type as 'movie' | 'tv'}
          isLoggedIn={!!user}
          title={title}
          posterPath={content.poster_path}
          genreIds={content.genres?.map((g) => g.id)}
        />

        {/* Info section */}
        <MovieDetailInfo
          overview={content.overview}
          directors={directors}
          cast={cast}
        />

        {/* Related challenges */}
        {relatedChallenges && relatedChallenges.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-gray-600 mb-3">관련 도전과제</h2>
            <div className="flex flex-col gap-2">
              {relatedChallenges.map((ch) => {
                const p = progressMap.get(ch.id)
                const current = p?.current_count ?? 0
                const isDone = !!p?.completed_at
                const pct = Math.min(100, Math.round((current / ch.required_count) * 100))
                return (
                  <div key={ch.id} className={`flex items-center gap-3 p-3 rounded-lg ${isDone ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <span className="text-2xl">{ch.badge_emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm font-medium">{ch.title}</p>
                      {user && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 rounded-full bg-gray-200 overflow-hidden">
                            <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">{current}/{ch.required_count}</span>
                        </div>
                      )}
                    </div>
                    {isDone && <span className="text-blue-600 text-xs font-bold flex-shrink-0">✓</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Reviews */}
        <ReviewSection
          tmdbId={content.id}
          mediaType={type as 'movie' | 'tv'}
          userId={user?.id ?? null}
        />
      </div>
    </main>
  )
}
