import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getServerToken } from '@/lib/auth/getServerToken'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { TMDB_BASE, API_URL } from '@/lib/config'
import { LikeButton } from '@/components/review/LikeButton'

type Params = { id: string }

type Review = {
  id: string
  user_id: string
  content: string
  is_spoiler: boolean
  created_at: string
  tmdb_id: number
  media_type: string
  user_name?: string
}

export default async function ReviewPage({ params }: { params: Promise<Params> }) {
  const { id } = await params

  const token = await getServerToken()
  const user = await getCurrentUser()

  const reviewRes = await fetch(`${API_URL}/v1/reviews/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!reviewRes.ok) notFound()

  const review = (await reviewRes.json()) as Review

  // Fetch TMDB data and likes in parallel
  const apiKey = process.env.TMDB_API_KEY
  let posterPath: string | null = null
  let contentTitle: string | null = null

  const fetchTmdbData = async () => {
    if (!apiKey) return
    const endpoint = review.media_type === 'movie'
      ? `${TMDB_BASE}/movie/${review.tmdb_id}?api_key=${apiKey}&language=ko-KR`
      : `${TMDB_BASE}/tv/${review.tmdb_id}?api_key=${apiKey}&language=ko-KR`
    try {
      const res = await fetch(endpoint, { next: { revalidate: 3600 } })
      if (res.ok) {
        const data = await res.json()
        posterPath = data.poster_path ?? null
        contentTitle = (data.title ?? data.name) as string | null
      }
    } catch {
    }
  }

  const fetchLikes = async () => {
    const res = await fetch(`${API_URL}/v1/reviews/${id}/likes`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.ok ? (await res.json()).count || 0 : 0
  }

  const [, initialCount] = await Promise.all([
    fetchTmdbData(),
    fetchLikes()
  ])
  const initialLiked = false

  const previewTitle = review.content.slice(0, 80)

  return (
    <main className="flex flex-col min-h-screen bg-background">
      <div className="px-4 pt-6">
        <div className="flex gap-3 items-start">
          <div className="relative w-[100px] h-[100px] flex-shrink-0 bg-surface overflow-hidden">
            {posterPath ? (
              <Image
                src={`https://image.tmdb.org/t/p/w200${posterPath}`}
                alt={contentTitle ?? ''}
                fill
                className="object-cover"
                sizes="100px"
              />
            ) : (
              <div className="w-full h-full bg-surface" />
            )}
          </div>

          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <p className="font-bold text-[22px] leading-tight text-text">{previewTitle}</p>
            <p className="text-muted text-[13px] text-right">{review.user_name ?? '유저'}</p>
          </div>
        </div>

        <div className="mt-4">
          <LikeButton
            reviewId={id}
            initialLiked={initialLiked}
            initialCount={initialCount}
            userId={user?.id ?? null}
          />
        </div>

        <div className="my-4 h-px bg-border" />

        <p className="text-text text-[15px] leading-relaxed whitespace-pre-wrap">
          {review.content}
        </p>

        <div className="mt-8 pb-10">
          <Link
            href={`/content/${review.media_type}/${review.tmdb_id}`}
            className="text-muted text-[13px] underline underline-offset-2"
          >
            작품 정보 보기
          </Link>
        </div>
      </div>
    </main>
  )
}
