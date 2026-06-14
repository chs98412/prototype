import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { api } from '../lib/api';
import type { ProfileDTO, RecordStatsDTO, ReviewDTO, RecordDTO, ApiList } from '../lib/apiTypes';

type Tab = 'watched' | 'essays' | 'lists';

const LISTS = [
  { title: '겨울에 다시 보는 영화', count: 12, cover: '/images/poster-yuhi.png' },
  { title: '사랑한다는 말 없이', count: 7, cover: '/images/poster-rachel.png' },
  { title: '감독판만', count: 18, cover: '/images/poster-extra3.png' },
  { title: '어디에도 없는 풍경', count: 9, cover: '/images/poster-feed.png' },
];

type ProfileState = {
  profile: ProfileDTO | null
  stats: RecordStatsDTO | null
  reviews: ReviewDTO[]
  records: RecordDTO[]
  followingCount: number
  followersCount: number
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('watched');
  const [state, setState] = useState<ProfileState>({
    profile: null, stats: null, reviews: [], records: [],
    followingCount: 0, followersCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<ProfileDTO>('/v1/me').catch(() => null),
      api.get<RecordStatsDTO>('/v1/records/stats').catch(() => null),
      api.get<ApiList<ReviewDTO>>('/v1/reviews?limit=20').catch(() => ({ data: [], count: 0 })),
      api.get<ApiList<RecordDTO>>('/v1/records?limit=50&status=watched').catch(() => ({ data: [], count: 0 })),
      api.get<ApiList<unknown>>('/v1/follows?limit=1').catch(() => ({ data: [], count: 0 })),
      api.get<ApiList<unknown>>('/v1/followers?limit=1').catch(() => ({ data: [], count: 0 })),
    ]).then(([profile, stats, reviews, records, follows, followers]) => {
      setState({
        profile: profile as ProfileDTO | null,
        stats: stats as RecordStatsDTO | null,
        reviews: (reviews as ApiList<ReviewDTO>).data ?? [],
        records: (records as ApiList<RecordDTO>).data ?? [],
        followingCount: (follows as ApiList<unknown>).count ?? 0,
        followersCount: (followers as ApiList<unknown>).count ?? 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  const { profile, stats, reviews, records, followingCount, followersCount } = state;
  const displayName = profile?.display_name || '사용자';
  const handle = profile ? `@${profile.user_id.slice(0, 8)}` : '';
  const bio = profile?.bio || '';
  const avatarUrl = profile?.avatar_url || '';

  return (
    <Layout>
      <div>
        {/* Header */}
        <div style={{ padding: '32px 22px 0', textAlign: 'center' }}>
          <div style={{
            width: 86, height: 86, borderRadius: '50%',
            background: avatarUrl
              ? `url(${avatarUrl}) center / cover no-repeat #ddd`
              : '#ddd',
            margin: '0 auto',
            boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px #6a7040',
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, color: '#aaa',
          }}>
            {!avatarUrl && '👤'}
          </div>
          <div style={{
            marginTop: 16, fontFamily: 'var(--serif)', fontSize: 22,
            fontWeight: 500, letterSpacing: '-0.01em',
          }}>{loading ? '…' : displayName}</div>
          <div style={{ marginTop: 2, fontSize: 11, color: '#6a7040', letterSpacing: '0.06em' }}>
            {handle}
          </div>
          {bio && (
            <p style={{
              margin: '14px auto 0', maxWidth: 240, fontFamily: 'var(--serif)',
              fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#1f1f1f',
            }}>{bio}</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
            <button
              onClick={() => navigate('/edit-profile')}
              style={{
                background: '#fff', border: '0.5px solid var(--line-soft)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                borderRadius: 4, padding: '7px 16px', fontSize: 11,
                fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)',
              }}
            >프로필 편집</button>
            <button
              onClick={() => navigate('/follow')}
              style={{
                background: '#fff', border: '0.5px solid var(--line-soft)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                borderRadius: 4, padding: '7px 16px', fontSize: 11,
                fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)',
              }}
            >친구 찾기</button>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{
          margin: '22px 22px 0',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          border: '1px solid var(--line-soft)', borderRadius: 4,
        }}>
          {[
            ['영화', stats?.movies_watched ?? records.length],
            ['기록', stats?.total_records ?? 0],
            ['팔로잉', followingCount],
            ['팔로워', followersCount],
          ].map(([k, v], i) => (
            <div
              key={k}
              onClick={() => {
                if (i >= 2) navigate('/follow', { state: { tab: i === 2 ? 'following' : 'followers' } });
              }}
              style={{
                padding: '12px 4px', textAlign: 'center',
                borderRight: i < 3 ? '1px solid var(--line-soft)' : 'none',
                cursor: i >= 2 ? 'pointer' : 'default',
              }}
            >
              <div style={{
                fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500,
                letterSpacing: '-0.01em',
              }}>{loading ? '…' : v}</div>
              <div style={{ marginTop: 4, fontSize: 9.5, color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {k}
              </div>
            </div>
          ))}
        </div>

        {/* Sub-tabs */}
        <div style={{
          marginTop: 26, padding: '0 22px',
          display: 'flex', gap: 22, borderBottom: '1px solid var(--line-soft)',
        }}>
          {[
            ['watched', '내가 뭘 봤게?'],
            ['essays', '내 평론'],
            ['lists', '목록'],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k as Tab)}
              style={{
                background: 'none', border: 0, cursor: 'pointer',
                padding: '10px 0',
                fontFamily: 'var(--sans)',
                fontSize: 12, fontWeight: 500,
                color: tab === k ? '#000' : '#999',
                borderBottom: `1.5px solid ${tab === k ? '#000' : 'transparent'}`,
                marginBottom: -1,
              }}
            >{label}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: '16px 22px 40px' }}>
          {tab === 'watched' && (
            <div>
              {records.length === 0 && !loading && (
                <div style={{ textAlign: 'center', color: 'var(--mute)', fontSize: 13, padding: '40px 0' }}>
                  시청 기록이 없습니다.
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                {records.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => navigate(`/movie/${rec.tmdb_id}`)}
                    style={{
                      aspectRatio: '3 / 4', borderRadius: 2,
                      background: rec.poster_path
                        ? `url(https://image.tmdb.org/t/p/w185${rec.poster_path}) center / cover no-repeat #e8e4df`
                        : '#e8e4df',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, color: '#aaa',
                    }}
                  >
                    {!rec.poster_path && rec.tmdb_id}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'essays' && (
            <div>
              {reviews.length === 0 && !loading && (
                <div style={{ textAlign: 'center', color: 'var(--mute)', fontSize: 13, padding: '40px 0' }}>
                  작성한 평론이 없습니다.
                </div>
              )}
              {reviews.map(review => (
                <button
                  key={review.id}
                  onClick={() => navigate(`/post/${review.id}`)}
                  style={{
                    display: 'flex', gap: 12, width: '100%', textAlign: 'left',
                    padding: '12px 0', borderBottom: '1px solid var(--line-soft)',
                    background: 'transparent', border: 0, cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 50, height: 68, borderRadius: 2,
                    background: review.poster_path
                      ? `url(https://image.tmdb.org/t/p/w185${review.poster_path}) center / cover no-repeat #e8e4df`
                      : '#e8e4df',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 13, fontWeight: 500 }}>
                      {review.title || `TMDB #${review.tmdb_id}`}
                    </div>
                    <div style={{
                      marginTop: 4, fontSize: 11, color: '#444', fontFamily: 'var(--serif)',
                      lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    } as React.CSSProperties}>{review.content}</div>
                    <div style={{ marginTop: 6, fontSize: 10, color: '#6a7040' }}>
                      {new Date(review.created_at).toLocaleDateString('ko-KR')} · ♥ {review.like_count}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {tab === 'lists' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {LISTS.map((list, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: '1 / 1.1', borderRadius: 4,
                    background: `linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7)), url(${list.cover}) center / cover no-repeat`,
                    padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    color: '#fff', cursor: 'pointer',
                  }}
                >
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 12, fontWeight: 500 }}>
                    {list.title}
                  </div>
                  <div style={{ fontSize: 9.5, opacity: 0.9, marginTop: 2 }}>{list.count}편</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
