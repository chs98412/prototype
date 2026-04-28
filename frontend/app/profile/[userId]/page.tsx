import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/BottomNav'
import { FollowButton } from '@/components/profile/FollowButton'
import { BackButton } from '@/components/content/BackButton'
import { LogoutButton } from '@/components/auth/LogoutButton'

const IMG_BASE = 'https://image.tmdb.org/t/p'

type Params = { userId: string }

export default async function ProfileDetailPage({ params }: { params: Promise<Params> }) {
  const { userId } = await params

  const supabase = await createClient()
  const { data: { user: me } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_id, display_name, avatar_url')
    .eq('user_id', userId)
    .maybeSingle()

  if (!profile) notFound()

  const isSelf = me?.id === userId

  const [
    { count: followerCount },
    { count: followingCount },
    { data: recentRecords = [] },
  ] = await Promise.all([
    supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
    supabase
      .from('user_records')
      .select('tmdb_id, media_type, status, rating, updated_at')
      .eq('user_id', userId)
      .eq('status', 'watched')
      .order('updated_at', { ascending: false })
      .limit(10),
  ])

  const isFollowing = me && !isSelf
    ? !!(await supabase.from('user_follows').select('follower_id').eq('follower_id', me.id).eq('following_id', userId).maybeSingle()).data
    : false

  // TMDB 포스터 가져오기
  const tmdbIds = (recentRecords ?? []).map((r) => `${r.media_type}-${r.tmdb_id}`)
  const posterMap = new Map<string, string>()
  await Promise.all(
    (recentRecords ?? []).slice(0, 10).map(async (r) => {
      const apiKey = process.env.TMDB_API_KEY
      if (!apiKey) return
      const res = await fetch(
        `https://api.themoviedb.org/3/${r.media_type}/${r.tmdb_id}?api_key=${apiKey}&language=ko-KR`,
        { next: { revalidate: 86400 } }
      )
      if (!res.ok) return
      const data = await res.json()
      const poster = data.poster_path
      const title = data.title ?? data.name ?? ''
      if (poster) posterMap.set(`${r.media_type}-${r.tmdb_id}`, poster)
      posterMap.set(`title-${r.media_type}-${r.tmdb_id}`, title)
    })
  )

  return (
    <main className="flex flex-col min-h-screen bg-background pb-16">
      <div className="flex items-center justify-between px-4 h-14">
        {isSelf ? (
          <>
            <span className="text-text font-bold text-lg">프로필</span>
            <LogoutButton />
          </>
        ) : (
          <>
            <BackButton />
            <span />
          </>
        )}
      </div>

      {/* Profile header */}
      <div className="flex flex-col items-center gap-3 px-4 py-5">
        <div className="relative w-[80px] h-[80px] rounded-full overflow-hidden bg-surface">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.display_name ?? ''} fill className="object-cover" sizes="80px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
          )}
        </div>

        <p className="text-text text-lg font-bold">{profile.display_name ?? '유저'}</p>

        <div className="flex gap-6 text-center">
          <div>
            <p className="text-text font-bold text-lg">{followerCount ?? 0}</p>
            <p className="text-muted text-[12px]">팔로워</p>
          </div>
          <div>
            <p className="text-text font-bold text-lg">{followingCount ?? 0}</p>
            <p className="text-muted text-[12px]">팔로잉</p>
          </div>
          <div>
            <p className="text-text font-bold text-lg">{recentRecords?.length ?? 0}</p>
            <p className="text-muted text-[12px]">기록</p>
          </div>
        </div>

        {!isSelf && me && (
          <FollowButton targetUserId={userId} initialFollowing={isFollowing} />
        )}
        {!isSelf && !me && (
          <Link href="/login" className="px-5 py-2 rounded-full text-sm font-semibold bg-primary text-white">
            로그인하고 팔로우
          </Link>
        )}
      </div>

      {/* Recent records */}
      <div className="px-4">
        <h2 className="text-text font-semibold text-[15px] mb-3">최근 기록</h2>
        {(!recentRecords || recentRecords.length === 0) ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="text-3xl">🎬</span>
            <p className="text-muted text-sm">아직 기록이 없어요</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {recentRecords.map((r) => {
              const key = `${r.media_type}-${r.tmdb_id}`
              const poster = posterMap.get(key)
              const title = posterMap.get(`title-${key}`) ?? ''
              return (
                <Link key={key} href={`/content/${r.media_type}/${r.tmdb_id}`} className="flex flex-col gap-1">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface">
                    {poster ? (
                      <Image src={`${IMG_BASE}/w300${poster}`} alt={title} fill className="object-cover" sizes="30vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
                    )}
                    {r.rating && (
                      <div className="absolute bottom-1 right-1 bg-black/60 rounded px-1 py-0.5">
                        <span className="text-white text-[10px] font-bold">⭐{r.rating}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-text text-[11px] font-medium leading-tight line-clamp-2">{title}</p>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {isSelf && <BottomNav active="profile" />}
    </main>
  )
}
