import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getServerToken } from '@/lib/auth/getServerToken'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { API_URL } from '@/lib/config'
import type { Record } from '@/lib/types/records'
import { BottomNav } from '@/components/layout/BottomNav'
import { FollowButton } from '@/components/profile/FollowButton'
import { BackButton } from '@/components/content/BackButton'
import { LogoutButton } from '@/components/auth/LogoutButton'

type Params = { userId: string }

type ProfileData = {
  user_id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  follower_count?: number
  following_count?: number
  is_following?: boolean
}

export default async function ProfileDetailPage({ params }: { params: Promise<Params> }) {
  const { userId } = await params

  const currentUser = await getCurrentUser()
  const token = await getServerToken()

  // Parallel fetch for better performance
  const [profileRes, recordsRes] = await Promise.all([
    fetch(`${API_URL}/v1/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
    fetch(`${API_URL}/v1/records?user_id=${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  ])

  if (!profileRes.ok) notFound()

  const profile: ProfileData = await profileRes.json()
  const records: Record[] = recordsRes.ok ? (await recordsRes.json()).data ?? [] : []

  const isSelf = currentUser?.id === userId
  const isFollowing = profile.is_following ?? false
  const followerCount = profile.follower_count ?? 0
  const followingCount = profile.following_count ?? 0

  const allRecords: Record[] = records
  const totalCount = allRecords.length
  const watchedFiltered = allRecords.filter((r) => r.status === 'watched')
  const watchedMovies = watchedFiltered.filter((r) => r.media_type === 'movie').length

  const watched = watchedFiltered.slice(0, 40)
  const musicReviews: any[] = []

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

          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div>
              <p className="text-text font-bold text-lg">{watchedMovies}</p>
              <p className="text-muted text-[12px]">영화</p>
            </div>
            <div>
              <p className="text-text font-bold text-lg">{totalCount}</p>
              <p className="text-muted text-[12px]">기록</p>
            </div>
            <div>
              <p className="text-text font-bold text-lg">{musicReviews.length}</p>
              <p className="text-muted text-[12px]">음반 평가</p>
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

        {/* 음반 평가 섹션 */}
        {musicReviews.length > 0 && (
          <div className="mt-8 px-4">
            <h2 className="font-bold text-[16px] text-text mb-3">내가 뭘 들었게?</h2>
            <div className="flex flex-col gap-2">
              {musicReviews.map((item) => (
                <Link
                  key={item.album_spotify_id}
                  href={`/music/albums/${item.album_spotify_id}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-sm border border-border bg-surface"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted flex-shrink-0">
                    <path d="M9 18V5l12-2v13a4 4 0 1 1-4 4 4 4 0 0 1 4-4" /><circle cx="6" cy="21" r="2" />
                  </svg>
                  <p className="text-sm text-text truncate">{item.content}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

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
        {currentUser ? (
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
