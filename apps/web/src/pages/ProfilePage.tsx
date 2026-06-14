import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { ME, ESSAY_BY_ID, MOVIES } from '../lib/data';

type Tab = 'watched' | 'essays' | 'lists';

const LISTS = [
  { title: '겨울에 다시 보는 영화', count: 12, cover: '/images/poster-yuhi.png' },
  { title: '사랑한다는 말 없이', count: 7, cover: '/images/poster-rachel.png' },
  { title: '감독판만', count: 18, cover: '/images/poster-extra3.png' },
  { title: '어디에도 없는 풍경', count: 9, cover: '/images/poster-feed.png' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('watched');

  return (
    <Layout>
      <div>
        {/* Header */}
        <div style={{ padding: '32px 22px 0', textAlign: 'center' }}>
          <div style={{
            width: 86, height: 86, borderRadius: '50%',
            background: `url(${ME.avatar}) center / cover no-repeat #ddd`,
            margin: '0 auto',
            boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px #6a7040',
            flexShrink: 0,
          }} />
          <div style={{
            marginTop: 16, fontFamily: 'var(--serif)', fontSize: 22,
            fontWeight: 500, letterSpacing: '-0.01em',
          }}>{ME.name}</div>
          <div style={{ marginTop: 2, fontSize: 11, color: '#6a7040', letterSpacing: '0.06em' }}>
            {ME.handle}
          </div>
          <p style={{
            margin: '14px auto 0', maxWidth: 240, fontFamily: 'var(--serif)',
            fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#1f1f1f',
          }}>{ME.bio}</p>

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
            ['영화', ME.stats.films],
            ['기록', ME.stats.logs],
            ['팔로잉', ME.stats.following],
            ['팔로워', ME.stats.followers],
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
              }}>{v}</div>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {ME.watched.map((poster, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: '3 / 4', borderRadius: 2,
                    background: `url(${poster}) center / cover no-repeat #eee`,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}

          {tab === 'essays' && (
            <div>
              {Object.values(ESSAY_BY_ID).slice(0, 3).map(essay => {
                const movie = MOVIES.find(m => m.id === essay.movieId);
                return (
                  <button
                    key={essay.id}
                    onClick={() => navigate(`/essay/${essay.id}`)}
                    style={{
                      display: 'flex', gap: 12, width: '100%', textAlign: 'left',
                      padding: '12px 0', borderBottom: '1px solid var(--line-soft)',
                      background: 'transparent', border: 0, cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 50, height: 68, borderRadius: 2,
                      background: `url(${movie?.poster}) center / cover no-repeat #eee`,
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 13, fontWeight: 500 }}>
                        {essay.title}
                      </div>
                      <div style={{
                        marginTop: 4, fontSize: 11, color: '#444', fontFamily: 'var(--serif)',
                        lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      } as React.CSSProperties}>{essay.excerpt}</div>
                      <div style={{ marginTop: 6, fontSize: 10, color: '#6a7040' }}>
                        {essay.date} · ♥ {essay.likes}
                      </div>
                    </div>
                  </button>
                );
              })}
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
