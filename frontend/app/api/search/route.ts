import { NextResponse, type NextRequest } from 'next/server'
import { TMDB_BASE } from '@/lib/config'

const GENRE_MAP: Record<number, string> = {
  28: '액션', 12: '모험', 16: '애니메이션', 35: '코미디', 80: '범죄',
  99: '다큐멘터리', 18: '드라마', 10751: '가족', 14: '판타지', 36: '역사',
  27: '공포', 10402: '음악', 9648: '미스터리', 10749: '로맨스',
  878: 'SF', 53: '스릴러', 10752: '전쟁', 37: '서부극',
  10759: '액션', 10762: '어린이', 10765: 'SF', 10766: '연속극', 10768: '전쟁',
}

const LANG_MAP: Record<string, string> = {
  ko: '한국', ja: '일본', en: '미국', fr: '프랑스', zh: '중국',
  es: '스페인', it: '이탈리아', de: '독일', hi: '인도', th: '태국',
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] })
  }

  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    return NextResponse.json({ results: [] }, { status: 500 })
  }

  const url = `${TMDB_BASE}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(q)}&include_adult=false&language=ko-KR`

  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) {
    return NextResponse.json({ results: [] }, { status: res.status })
  }

  const data = await res.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = (data.results as any[])
    .filter((item) => item.media_type !== 'person' && item.poster_path)
    .slice(0, 20)
    .map((item) => {
      const genreIds: number[] = item.genre_ids ?? []
      const firstGenreId = genreIds[0]
      const genre = firstGenreId != null ? (GENRE_MAP[firstGenreId] ?? null) : null
      const language = item.original_language ? (LANG_MAP[item.original_language] ?? null) : null

      return {
        id: item.id,
        type: item.media_type as 'movie' | 'tv',
        title: (item.title ?? item.name) as string,
        year: ((item.release_date ?? item.first_air_date) as string | undefined)?.slice(0, 4),
        poster: `https://image.tmdb.org/t/p/w300${item.poster_path}`,
        rating: (item.vote_average as number | undefined)?.toFixed(1),
        genre,
        language,
      }
    })

  return NextResponse.json({ results })
}
