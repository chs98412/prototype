import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { PencilIcon } from '../components/ui/Icons';
import { api } from '../lib/api';
import type { SocialFeedItem, ApiList } from '../lib/apiTypes';

const FILTERS = ['전체', '평론', '기록'] as const;
type Filter = typeof FILTERS[number];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

function Stars({ n }: { n: number }) {
  return (
    <span style={{ color: '#6a7040', fontSize: 11, letterSpacing: 1 }}>
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  );
}

function FeedCard({ item }: { item: SocialFeedItem }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/post/${item.kind}/${item.id}`)}
      style={{
        padding: '18px 22px',
        borderBottom: '1px solid var(--line-soft)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: item.avatar_url
            ? `url(${item.avatar_url}) center / cover no-repeat #ddd`
            : '#ddd',
        }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1f1f1f' }}>
            {item.display_name || '알 수 없는 사용자'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--mute)', marginTop: 1 }}>
            {timeAgo(item.event_time)}
          </div>
        </div>
        <div style={{
          marginLeft: 'auto', fontSize: 9.5, fontWeight: 500, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: item.kind === 'review' ? '#6a7040' : '#888',
          border: `0.5px solid ${item.kind === 'review' ? '#6a7040' : '#ccc'}`,
          borderRadius: 3, padding: '2px 6px',
        }}>
          {item.kind === 'review' ? '평론' : '기록'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{
          width: 50, height: 70, borderRadius: 2, flexShrink: 0, background: '#eee',
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {item.rating != null && (
            <div style={{ marginBottom: 4 }}>
              <Stars n={item.rating} />
            </div>
          )}
          {item.content && (
            <p style={{
              margin: 0, fontFamily: 'var(--serif)', fontSize: 13,
              lineHeight: 1.6, color: '#1f1f1f',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            } as React.CSSProperties}>{item.content}</p>
          )}
          {!item.content && item.kind === 'record' && (
            <p style={{ margin: 0, fontSize: 12, color: 'var(--mute)' }}>시청 기록</p>
          )}
          {item.kind === 'review' && (
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--mute)' }}>
              ♥ {item.like_count}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('전체');
  const [items, setItems] = useState<SocialFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get<ApiList<SocialFeedItem>>('/v1/feed/social?limit=30')
      .then(res => {
        setItems(res.data ?? []);
        setError(null);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(item => {
    if (filter === '전체') return true;
    if (filter === '평론') return item.kind === 'review';
    return item.kind === 'record';
  });

  return (
    <Layout>
      <div>
        {/* Masthead */}
        <div style={{ padding: '24px 22px 6px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1 }}>
              피드
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: '#6a7040', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              팔로우한 사람들의 기록
            </div>
          </div>
          <button
            onClick={() => navigate('/editor')}
            style={{ background: 'none', border: 0, cursor: 'pointer', padding: 6 }}
          >
            <PencilIcon />
          </button>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, padding: '14px 22px', overflowX: 'auto' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flexShrink: 0, padding: '5px 12px', borderRadius: 999,
                fontSize: 11, fontWeight: 500, cursor: 'pointer',
                border: '0.5px solid',
                background: filter === f ? '#1f1f1f' : '#fff',
                color: filter === f ? '#fff' : '#1f1f1f',
                borderColor: filter === f ? '#1f1f1f' : 'var(--line-soft)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.12s',
              }}
            >{f}</button>
          ))}
        </div>

        {/* Feed */}
        {loading && (
          <div style={{ padding: '60px 22px', textAlign: 'center', color: 'var(--mute)', fontSize: 13 }}>
            불러오는 중…
          </div>
        )}

        {error && (
          <div style={{ padding: '40px 22px', textAlign: 'center', color: '#c44', fontSize: 13 }}>
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ padding: '60px 22px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 16, color: '#888', marginBottom: 8 }}>
              아직 피드가 비어있어요
            </div>
            <div style={{ fontSize: 12, color: 'var(--mute)' }}>
              친구를 팔로우하면 여기에 기록이 쌓입니다.
            </div>
          </div>
        )}

        {!loading && !error && filtered.map(item => (
          <FeedCard key={item.id} item={item} />
        ))}

        {/* Footer */}
        <div style={{
          marginTop: 20, padding: '30px 22px 40px',
          textAlign: 'center', borderTop: '1px solid var(--line-soft)',
        }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 400, letterSpacing: '0.2em' }}>
            L O G G E D
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: 'var(--mute)' }}>vol. 014 · 평론 매거진</div>
        </div>
      </div>
    </Layout>
  );
}
