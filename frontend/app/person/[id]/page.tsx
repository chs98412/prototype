import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getServerToken } from '@/lib/auth/getServerToken'
import { BackButton } from '@/components/content/BackButton'
import type { Metadata } from 'next'

export const revalidate = 604800 // 7일

const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

type Params = { id: string }

type Credit = {
  id: number
  media_type: 'movie' | 'tv'
  title?: string
  name?: string
  poster_path?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
  job?: string
  character?: string
}

type Person = {
  id: number
  name: string
  profile_path?: string
  biography?: string
  known_for_department?: string
}

async function fetchPerson(id: string) {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return null

  const [personRes, creditsRes] = await Promise.all([
    fetch(`${TMDB_BASE}/person/${id}?api_key=${apiKey}&language=ko-KR`, { next: { revalidate: 604800 } }),
    fetch(`${TMDB_BASE}/person/${id}/combined_credits?api_key=${apiKey}&language=ko-KR`, { next: { revalidate: 604800 } }),
  ])

  if (!personRes.ok) return null

  const person: Person = await personRes.json()
  const credits = creditsRes.ok ? await creditsRes.json() : { cast: [], crew: [] }

  // 출연작 + 감독작 합쳐서 중복 제거, 포스터 있는 것만, 최신순
  const castCredits: Credit[] = (credits.cast ?? []).map((c: Credit) => ({ ...c, media_type: c.media_type }))
  const crewCredits: Credit[] = (credits.crew ?? [])
    .filter((c: Credit) => c.job === 'Director')
    .map((c: Credit) => ({ ...c, media_type: c.media_type }))

  const seen = new Set<string>()
  const allCredits: Credit[] = []
  for (const c of [...crewCredits, ...castCredits]) {
    const key = `${c.media_type}-${c.id}`
    if (!seen.has(key) && c.poster_path) {
      seen.add(key)
      allCredits.push(c)
    }
  }

  allCredits.sort((a, b) => {
    const dateA = a.release_date ?? a.first_air_date ?? ''
    const dateB = b.release_date ?? b.first_air_date ?? ''
    return dateB.localeCompare(dateA)
  })

  return { person, credits: allCredits }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params
  const data = await fetchPerson(id)
  if (!data) return { title: '인물' }
  return { title: `${data.person.name} — Logged` }
}

export default async function PersonPage({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const data = await fetchPerson(id)
  if (!data) notFound()

  const { person, credits } = data

  const token = await getServerToken()

  // 유저의 시청 기록 조회
  const watchedSet = new Set<string>()
  const recordsRes = await fetch(`${API_URL}/v1/records?status=watched`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (recordsRes.ok) {
    const records = (await recordsRes.json()).data ?? []
    records?.forEach((r: any) => watchedSet.add(`${r.media_type}-${r.tmdb_id}`))
  }

  const watchedCount = credits.filter((c) => watchedSet.has(`${c.media_type}-${c.id}`)).length

  return (
    <main className="flex flex-col min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <BackButton />
        </div>
        <div className="flex items-end gap-4 px-4 pt-16 pb-5 bg-gradient-to-b from-surface to-background">
          <div className="relative w-[80px] h-[80px] rounded-full overflow-hidden bg-surface flex-shrink-0">
            {person.profile_path ? (
              <Image
                src={`${IMG_BASE}/w185${person.profile_path}`}
                alt={person.name}
                fill
                priority
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-text text-xl font-bold">{person.name}</h1>
            <p className="text-muted text-sm">{person.known_for_department === 'Directing' ? '감독' : '배우'}</p>
            {user && (
              <p className="text-primary text-sm font-semibold mt-1">
                {credits.length}편 중 {watchedCount}편 시청
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filmography grid */}
      <div className="px-4">
        <h2 className="text-text font-semibold text-[15px] mb-3">필모그래피</h2>
        <div className="grid grid-cols-3 gap-2">
          {credits.map((credit) => {
            const watched = watchedSet.has(`${credit.media_type}-${credit.id}`)
            const title = credit.title ?? credit.name ?? ''
            const year = (credit.release_date ?? credit.first_air_date ?? '').slice(0, 4)
            return (
              <Link
                key={`${credit.media_type}-${credit.id}`}
                href={`/content/${credit.media_type}/${credit.id}`}
                className="flex flex-col gap-1"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface">
                  <Image
                    src={`${IMG_BASE}/w300${credit.poster_path}`}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="30vw"
                  />
                  {watched && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                  )}
                </div>
                <p className="text-text text-[12px] font-medium leading-tight line-clamp-2">{title}</p>
                {year && <p className="text-muted text-[11px]">{year}</p>}
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
