import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LikeButton } from '@/components/review/LikeButton'

const TMDB_BASE = 'https://api.themoviedb.org/3'

type Params = { id: string }

export default async function ReviewPage({ params }: { params: Promise<Params> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: review } = await supabase
    .from('reviews')
    .select('id, user_id, content, is_spoiler, created_at, tmdb_id, media_type, user_profiles(display_name)')
    .eq('id', id)
    .maybeSingle()

  if (!review) notFound()

  const profile = review.user_profiles as unknown as { display_name: string | null } | null

  const apiKey = process.env.TMDB_API_KEY
  let posterPath: string | null = null
  let contentTitle: string | null = null

  if (apiKey) {
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

  const [{ count: likeCount }, likeCheck] = await Promise.all([
    supabase.from('review_likes').select('*', { count: 'exact', head: true }).eq('review_id', id),
    user
      ? supabase.from('review_likes').select('user_id').eq('review_id', id).eq('user_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const initialLiked = !!likeCheck.data
  const initialCount = likeCount ?? 0

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
            <p className="text-muted text-[13px] text-right">{profile?.display_name ?? '유저'}</p>
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
