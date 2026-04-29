import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/BottomNav'
import { FollowButton } from '@/components/profile/FollowButton'
import { BackButton } from '@/components/content/BackButton'
import { LogoutButton } from '@/components/auth/LogoutButton'

type Params = { userId: string }

export default async function ProfileDetailPage({ params }: { params: Promise<Params> }) {
  const { userId } = await params

  const supabase = await createClient()
  const { data: { user: me } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_id, display_name, avatar_url, bio')
    .eq('user_id', userId)
    .maybeSingle()

  if (!profile) notFound()

  const isSelf = me?.id === userId

  const [
    { count: followerCount },
    { count: followingCount },
    { data: statsRecords = [] },
    { data: watchedRecords = [] },
  ] = await Promise.all([
    supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
    supabase.from('user_records').select('status, rating, media_type').eq('user_id', userId),
    supabase
      .from('user_records')
      .select('tmdb_id, media_type, title, poster_path')
      .eq('user_id', userId)
      .eq('status', 'watched')
      .order('updated_at', { ascending: false })
      .limit(40),
  ])

  const isFollowing = me && !isSelf
    ? !!(await supabase.from('user_follows').select('follower_id').eq('follower_id', me.id).eq('following_id', userId).maybeSingle()).data
    : false

  const allRecords = statsRecords ?? []
  const totalCount = allRecords.length
  const watchedFiltered = allRecords.filter((r) => r.status === 'watched')
  const watchedMovies = watchedFiltered.filter((r) => r.media_type === 'movie').length

  const watched = watchedRecords ?? []

  if (isSelf) {
    return (
      <main className="flex flex-col min-h-screen bg-background pb-16">
        <div className="relative flex items-center justify-center h-14">
          <span className="text-text font-semibold text-[16px]">프로필</span>
          <div className="absolute right-4">
            <LogoutButton />
          </div>
        </div>

        <div className="flex flex-col items-center px-4 mt-6">
          <p className="text-text font-bold text-xl">{profile.display_name ?? '유저'}</p>

          <div className="grid grid-cols-2 gap-6 mt-4 text-center">
            <div>
              <p className="text-text font-bold text-lg">{watchedMovies}</p>
              <p className="text-muted text-[12px]">영화</p>
            </div>
            <div>
              <p className="text-text font-bold text-lg">{totalCount}</p>
              <p className="text-muted text-[12px]">기록</p>
            </div>
            <div>
              <p className="text-text font-bold text-lg">{followingCount ?? 0}</p>
              <p className="text-muted text-[12px]">팔로잉</p>
            </div>
            <div>
              <p className="text-text font-bold text-lg">{followerCount ?? 0}</p>
              <p className="text-muted text-[12px]">팔로워</p>
            </div>
          </div>

          {profile.bio && (
            <p className="text-muted text-[14px] text-center mt-3 max-w-xs">{profile.bio}</p>
          )}

          <Link
            href="/profile/edit"
            className="mt-3 px-5 py-1.5 border border-text text-text text-[13px] rounded-sm"
          >
            프로필 편집
          </Link>
        </div>

        <div className="mt-8 px-4">
          <h2 className="font-bold text-[16px] text-text">내가 뭘 봤게?</h2>
          {watched.length === 0 ? (
            <p className="text-muted text-[13px] mt-4">아직 기록이 없어요</p>
          ) : (
            <div className="grid grid-cols-4 gap-1.5 mt-3">
              {watched.map((record) => (
                <Link
                  key={`${record.media_type}-${record.tmdb_id}`}
                  href={`/content/${record.media_type}/${record.tmdb_id}`}
                >
                  <div className="relative w-full" style={{ aspectRatio: '2/3' }}>
                    {record.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w200${record.poster_path}`}
                        alt={record.title ?? ''}
                        fill
                        className="object-cover"
                        sizes="25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface flex items-center justify-center">
                        <span className="text-muted text-[10px] text-center px-1">{record.title}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <BottomNav active="profile" />
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen bg-background pb-16">
      <div className="relative flex items-center h-14 px-4">
        <BackButton />
      </div>

      <p className="text-text font-bold text-xl text-center mt-4">{profile.display_name ?? '유저'}</p>

      <div className="flex items-start gap-4 px-4 mt-4">
        <div className="relative w-[120px] h-[120px] flex-shrink-0 overflow-hidden bg-surface">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.display_name ?? ''}
              fill
              className="object-cover"
              sizes="120px"
            />
          ) : (
            <div className="w-full h-full bg-surface" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-center flex-1">
          <div>
            <p className="text-text font-bold text-lg">{watchedMovies}</p>
            <p className="text-muted text-[12px]">영화</p>
          </div>
          <div>
            <p className="text-text font-bold text-lg">{totalCount}</p>
            <p className="text-muted text-[12px]">기록</p>
          </div>
          <div>
            <p className="text-text font-bold text-lg">{followingCount ?? 0}</p>
            <p className="text-muted text-[12px]">팔로잉</p>
          </div>
          <div>
            <p className="text-text font-bold text-lg">{followerCount ?? 0}</p>
            <p className="text-muted text-[12px]">팔로워</p>
          </div>
        </div>
      </div>

      {profile.bio && (
        <p className="text-muted text-[14px] text-center px-4 mt-3">{profile.bio}</p>
      )}

      <div className="flex justify-center mt-3">
        {me ? (
          <FollowButton targetUserId={userId} initialFollowing={isFollowing} />
        ) : (
          <Link href="/login" className="px-5 py-2 rounded-full text-sm font-semibold bg-text text-white">
            로그인하고 팔로우
          </Link>
        )}
      </div>

      <div className="mt-8 px-4">
        <h2 className="font-bold text-[16px] text-text">내가 뭘 봤게?</h2>
        {watched.length === 0 ? (
          <p className="text-muted text-[13px] mt-4">아직 기록이 없어요</p>
        ) : (
          <div className="grid grid-cols-4 gap-1.5 mt-3">
            {watched.map((record) => (
              <Link
                key={`${record.media_type}-${record.tmdb_id}`}
                href={`/content/${record.media_type}/${record.tmdb_id}`}
              >
                <div className="relative w-full" style={{ aspectRatio: '2/3' }}>
                  {record.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w200${record.poster_path}`}
                      alt={record.title ?? ''}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface flex items-center justify-center">
                      <span className="text-muted text-[10px] text-center px-1">{record.title}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
