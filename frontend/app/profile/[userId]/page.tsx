import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/BottomNav'
import { FollowButton } from '@/components/profile/FollowButton'
import { BackButton } from '@/components/content/BackButton'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { GenreRatings } from '@/components/profile/GenreRatings'
import { RecordTabs } from '@/components/profile/RecordTabs'
import { ActivityHeatmap } from '@/components/profile/ActivityHeatmap'
import { TasteMatch } from '@/components/profile/TasteMatch'

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
    { data: statsRecords = [] },
    { data: genreRatings = [] },
  ] = await Promise.all([
    supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
    supabase.from('user_records').select('status, rating, media_type').eq('user_id', userId),
    supabase.rpc('get_genre_ratings', { p_user_id: userId }),
  ])

  const isFollowing = me && !isSelf
    ? !!(await supabase.from('user_follows').select('follower_id').eq('follower_id', me.id).eq('following_id', userId).maybeSingle()).data
    : false

  // 통계 계산
  const allRecords = statsRecords ?? []
  const totalCount = allRecords.length
  const watchedRecords = allRecords.filter((r) => r.status === 'watched')
  const ratedRecords = watchedRecords.filter((r) => r.rating != null)
  const avgRating = ratedRecords.length >= 3
    ? (ratedRecords.reduce((sum, r) => sum + (r.rating as number), 0) / ratedRecords.length).toFixed(1)
    : null
  const watchedMovies = watchedRecords.filter((r) => r.media_type === 'movie').length
  const watchedTv = watchedRecords.filter((r) => r.media_type === 'tv').length
  const estimatedHours = Math.round((watchedMovies * 110 + watchedTv * 45) / 60)

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
            <p className="text-text font-bold text-lg">{totalCount}</p>
            <p className="text-muted text-[12px]">기록</p>
          </div>
        </div>

        {!isSelf && me && (
          <div className="flex flex-col items-center gap-2 w-full">
            <FollowButton targetUserId={userId} initialFollowing={isFollowing} />
          </div>
        )}
        {!isSelf && !me && (
          <Link href="/login" className="px-5 py-2 rounded-full text-sm font-semibold bg-primary text-white">
            로그인하고 팔로우
          </Link>
        )}
      </div>

      {/* Stats */}
      {watchedRecords.length > 0 && (
        <div className="mx-4 flex gap-2 mb-2">
          <div className="flex-1 flex flex-col items-center py-3 rounded-xl bg-surface">
            <p className="text-text font-bold text-lg">{watchedRecords.length}</p>
            <p className="text-muted text-[11px]">봄</p>
          </div>
          {avgRating && (
            <div className="flex-1 flex flex-col items-center py-3 rounded-xl bg-surface">
              <p className="text-text font-bold text-lg">⭐{avgRating}</p>
              <p className="text-muted text-[11px]">평균 별점</p>
            </div>
          )}
          {estimatedHours > 0 && (
            <div className="flex-1 flex flex-col items-center py-3 rounded-xl bg-surface">
              <p className="text-text font-bold text-lg">{estimatedHours}h</p>
              <p className="text-muted text-[11px]">추정 시청 시간</p>
            </div>
          )}
        </div>
      )}

      {/* Taste match — only for other logged-in users */}
      {!isSelf && me && (
        <div className="px-4 mt-2">
          <TasteMatch myId={me.id} friendId={userId} />
        </div>
      )}

      {/* Activity heatmap */}
      <div className="px-4 mt-4">
        <h2 className="text-text font-semibold text-[15px] mb-3">활동 히트맵</h2>
        <ActivityHeatmap userId={userId} />
      </div>

      {/* Genre ratings */}
      <div className="px-4 mt-6">
        <h2 className="text-text font-semibold text-[15px] mb-3">취향 레이팅</h2>
        <GenreRatings ratings={(genreRatings ?? []) as { genre_id: number; cnt: number; avg_rating: number; level: number }[]} />
      </div>

      {/* Record tabs */}
      <div className="px-4 mt-6">
        <h2 className="text-text font-semibold text-[15px] mb-3">기록</h2>
        <RecordTabs userId={userId} showAllTabs={isSelf} />
      </div>

      {isSelf && <BottomNav active="profile" />}
    </main>
  )
}
