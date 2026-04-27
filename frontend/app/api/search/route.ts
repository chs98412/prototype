import { NextResponse, type NextRequest } from 'next/server'

const TMDB_BASE = 'https://api.themoviedb.org/3'

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
    .map((item) => ({
      id: item.id,
      type: item.media_type as 'movie' | 'tv',
      title: (item.title ?? item.name) as string,
      year: ((item.release_date ?? item.first_air_date) as string | undefined)?.slice(0, 4),
      poster: `https://image.tmdb.org/t/p/w300${item.poster_path}`,
      rating: (item.vote_average as number | undefined)?.toFixed(1),
    }))

  return NextResponse.json({ results })
}
