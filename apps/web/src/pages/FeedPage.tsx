import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { PencilIcon } from '../components/ui/Icons';
import { api } from '../lib/api';
import type { SocialFeedItem, ApiList } from '../lib/apiTypes';

const ACCENT = '#6a7040';

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

function Stars({ n, size = 13 }: { n: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= n ? ACCENT : 'none'}>
          <path
            d="m12 3 2.6 6 6.4.6-4.9 4.2L17.6 21 12 17.3 6.4 21l1.5-7.2L3 9.6 9.4 9 12 3Z"
            stroke={ACCENT} strokeWidth="1.4" strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}

function Poster({ path, w, h }: { path: string; w: number; h: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: 5, flexShrink: 0,
      background: path
        ? `url(https://image.tmdb.org/t/p/w185${path}) center / cover no-repeat #eee`
        : '#eee',
      boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
    }} />
  );
}

// ── Essay card: large poster + review title + excerpt ──
function EssayCard({ item }: { item: SocialFeedItem }) {
  const navigate = useNavigate();
  const displayTitle = item.review_title || item.title;

  return (
    <div
      onClick={() => navigate(`/post/review/${item.id}`)}
      style={{
        display: 'flex', gap: 14, padding: '20px 22px 22px',
        borderBottom: '1px solid var(--line-soft)', cursor: 'pointer',
      }}
    >
      <Poster path={item.poster_path} w={130} h={180} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          marginTop: 6,
          fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500,
          lineHeight: 1.35, letterSpacing: '-0.01em', color: '#000',
        }}>{displayTitle}</div>
        <div style={{ marginTop: 6, fontSize: 11, color: ACCENT, fontWeight: 500, letterSpacing: '0.04em' }}>
          {item.display_name} · {timeAgo(item.event_time)}
        </div>
        <p style={{
          margin: '10px 0 0', fontSize: 12.5, lineHeight: 1.65,
          color: '#222', fontFamily: 'var(--serif)',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } as React.CSSProperties}>{item.content}</p>
        <div style={{
          marginTop: 10, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 10, fontWeight: 500 }}>♥ {item.like_count}</span>
          <span style={{ fontSize: 9.5, color: 'var(--mute)', letterSpacing: '0.06em' }}>{item.title}</span>
        </div>
      </div>
    </div>
  );
}

// ── Eval card: unified 평가 — rating or log ──
function EvalCard({ item }: { item: SocialFeedItem }) {
  const navigate = useNavigate();
  const stars = Math.round((item.rating ?? 0) / 2);
  const hasBlurb = !!item.content;

  return (
    <div
      onClick={() => navigate(item.kind === 'log' ? `/movie/${item.tmdb_id}` : `/post/review/${item.id}`)}
      style={{
        display: 'flex', gap: 14, padding: '20px 22px 22px',
        borderBottom: '1px solid var(--line-soft)', cursor: 'pointer',
      }}
    >
      <Poster path={item.poster_path} w={130} h={180} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          marginTop: 6,
          fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500,
          letterSpacing: '-0.01em', lineHeight: 1.3,
        }}>{item.title}</div>
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Stars n={stars} size={13} />
          {stars > 0 && <span style={{ fontSize: 11, color: ACCENT, fontWeight: 500 }}>{stars}.0</span>}
        </div>
        <div style={{ marginTop: 4, fontSize: 11, color: ACCENT, fontWeight: 500, letterSpacing: '0.04em' }}>
          {item.display_name} · {timeAgo(item.event_time)}
        </div>
        {hasBlurb ? (
          <>
            <p style={{
              margin: '10px 0 0', fontFamily: 'var(--serif)',
              fontSize: 12.5, lineHeight: 1.65, color: '#222',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
              overflow: 'hidden', flex: 1,
            } as React.CSSProperties}>{item.content}</p>
            <div style={{ marginTop: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 500 }}>♥ {item.like_count}</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ flex: 1 }} />
            <div style={{
              marginTop: 12, fontSize: 10.5, color: 'var(--mute)',
              fontStyle: 'italic', fontFamily: 'var(--serif)',
            }}>— 멘트 없이 기록됨</div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Quote card: bordered box with centred quote ──
function QuoteCard({ item }: { item: SocialFeedItem }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/post/review/${item.id}`)}
      style={{ padding: '20px 22px 22px', borderBottom: '1px solid var(--line-soft)', cursor: 'pointer' }}
    >
      <div style={{
        marginTop: 10,
        background: '#f7f6f3',
        borderTop: `1px solid ${ACCENT}`,
        borderBottom: `1px solid ${ACCENT}`,
        padding: '18px 20px',
        minHeight: 100,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500,
          lineHeight: 1.55, color: '#1f1f1f', letterSpacing: '-0.005em',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 22, color: ACCENT, verticalAlign: '-4px' }}>"</span>
          {item.content}
          <span style={{ fontSize: 22, color: ACCENT, verticalAlign: '-4px' }}>"</span>
        </div>
        <div style={{
          marginTop: 12, textAlign: 'center',
          fontSize: 10, color: ACCENT, letterSpacing: '0.08em',
        }}>
          〈{item.title}〉 중에서 · {item.display_name}
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 500 }}>♥ {item.like_count}</span>
      </div>
    </div>
  );
}

function FeedCard({ item }: { item: SocialFeedItem }) {
  if (item.kind === 'essay') return <EssayCard item={item} />;
  if (item.kind === 'rating' || item.kind === 'log') return <EvalCard item={item} />;
  if (item.kind === 'quote') return <QuoteCard item={item} />;
  return null;
}

export default function FeedPage() {
  const navigate = useNavigate();
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

  return (
    <Layout>
      <div>
        {/* Masthead */}
        <div style={{ padding: '16px 22px 6px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1 }}>
              피드
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: ACCENT, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              essays · ratings · logs · 이번 주
            </div>
          </div>
          <button
            onClick={() => navigate('/editor')}
            style={{ background: 'none', border: 0, cursor: 'pointer', padding: 6 }}
          >
            <PencilIcon />
          </button>
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

        {!loading && !error && items.length === 0 && (
          <div style={{ padding: '60px 22px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 16, color: '#888', marginBottom: 8 }}>
              아직 피드가 비어있어요
            </div>
            <div style={{ fontSize: 12, color: 'var(--mute)' }}>
              친구를 팔로우하면 여기에 기록이 쌓입니다.
            </div>
          </div>
        )}

        {!loading && !error && items.map(item => (
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
