import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getUserProfile, getRecords } from '@/lib/api/fetch'
import { BottomNav } from '@/components/layout/BottomNav'
import { FollowButton } from '@/components/profile/FollowButton'
import { BackButton } from '@/components/content/BackButton'
import { LogoutButton } from '@/components/auth/LogoutButton'

type Params = { userId: string }

export default async function ProfileDetailPage({ params }: { params: Promise<Params> }) {
  const { userId } = await params

  const [profileRes, recordsRes] = await Promise.all([
    getUserProfile(userId),
    getRecords('watched', 40, 0),
  ])

  const { data: profile } = profileRes

  if (!profile) notFound()

  const { data: allRecords = [] } = recordsRes

  // Filter watched records for this user (in production, should get from dedicated endpoint)
  const watched = allRecords.filter((r: any) => r.user_id === userId) ?? []

  // Note: In a real scenario, would fetch user-specific records from backend
  // For now using the public records endpoint which may have limitations
  const isSelf = false // Can't determine without auth info, assume not self when viewing profile
  const followerCount = profile.follower_count ?? 0
  const followingCount = profile.following_count ?? 0
  const watchedMovies = profile.movie_count ?? 0
  const totalCount = profile.total_records ?? 0
  const isFollowing = profile.is_following ?? false

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
        {isFollowing !== undefined ? (
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
            {watched.slice(0, 40).map((record) => (
              <Link
                key={`${record.media_type}-${record.tmdb_id}`}
                href={`/content/${record.media_type}/${record.tmdb_id}`}
              >
                <div className="relative w-full bg-surface flex items-center justify-center" style={{ aspectRatio: '2/3' }}>
                  <span className="text-muted text-[10px] text-center px-1">{record.tmdb_id}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
