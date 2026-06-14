import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { api } from '../lib/api';
import type { ReviewDTO } from '../lib/apiTypes';
import { FEED_ITEMS, MOVIE_BY_ID, MOVIES, ME } from '../lib/data';
import type { RatingItem, LogItem, QuoteItem, ListItem } from '../lib/data';
import { BackIcon, EllipsisIcon, HeartIcon, CommentIcon, BookmarkIcon, StarIcon } from '../components/ui/Icons';

const ACCENT = '#6a7040';
const BTN: React.CSSProperties = { background: 'none', border: 0, padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 };

function Stars({ value, size = 20 }: { value: number; size?: number }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map(i => (
        <StarIcon key={i} size={size} filled={i <= value} stroke="#1f1f1f" />
      ))}
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', color: '#666', textTransform: 'uppercase' }}>
      <span>{children}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
    </div>
  );
}

function SubHeader({ onBack, title, trailing }: { onBack: () => void; title: string; trailing?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderBottom: '1px solid var(--line-soft)',
      position: 'sticky', top: 0, background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(10px)', zIndex: 10,
    }}>
      <button onClick={onBack} style={BTN}><BackIcon /></button>
      <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600 }}>{title}</span>
      {trailing || <span style={{ width: 24 }} />}
    </div>
  );
}

function RatingDetail({ item }: { item: RatingItem }) {
  const navigate = useNavigate();
  const m = MOVIE_BY_ID[item.movieId];
  const [liked, setLiked] = useState(false);

  return (
    <>
      <div style={{ padding: '12px 22px 0', textAlign: 'center' }}>
        <div onClick={() => navigate(`/movie/${m.id}`)} style={{
          width: 170, height: 236, borderRadius: 3, margin: '0 auto', cursor: 'pointer',
          background: `url(${m.poster}) center / cover no-repeat #eee`,
          boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
        }} />

        <div onClick={() => navigate(`/movie/${m.id}`)} style={{
          marginTop: 18, fontFamily: 'var(--serif)', fontSize: 22,
          fontWeight: 500, letterSpacing: '-0.02em', cursor: 'pointer',
        }}>{m.title}</div>
        <div style={{ marginTop: 4, fontSize: 11, color: ACCENT, fontWeight: 500 }}>
          {m.year} · {m.genre} · {m.director}
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 6 }}>
          <Stars value={item.stars} size={28} />
        </div>
        <div style={{ marginTop: 8, fontFamily: 'var(--serif)', fontSize: 13, color: ACCENT, letterSpacing: '0.04em' }}>
          {item.stars}.0 · 다섯 별 중에서
        </div>

        <p style={{
          margin: '32px auto 0', maxWidth: 300,
          fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.7,
          color: '#1f1f1f', letterSpacing: '-0.005em', wordBreak: 'keep-all',
        }}>{item.blurb}</p>

        <div style={{ marginTop: 24, fontFamily: 'var(--serif)', fontSize: 18 }}>※</div>
      </div>

      <div style={{
        margin: '30px 22px 0', padding: '16px 0',
        display: 'flex', gap: 12, alignItems: 'center',
        borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)',
      }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: `url(${ME.avatar}) center / cover no-repeat #ddd` }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 500 }}>{item.author}</div>
          <div style={{ fontSize: 10, color: 'var(--mute)', marginTop: 2 }}>{item.when}</div>
        </div>
        <button onClick={() => setLiked(!liked)} style={BTN}>
          <HeartIcon filled={liked} stroke={liked ? '#c44' : '#1f1f1f'} />
        </button>
        <button style={BTN}><CommentIcon /></button>
        <button style={BTN}><BookmarkIcon /></button>
      </div>

      <div style={{ padding: '18px 22px', fontSize: 10, color: 'var(--mute)', letterSpacing: '0.08em' }}>
        {(liked ? item.likes + 1 : item.likes)} likes{item.comments != null ? ` · ${item.comments} comments` : ''}
      </div>
    </>
  );
}

function LogDetail({ item }: { item: LogItem }) {
  const navigate = useNavigate();
  const m = MOVIE_BY_ID[item.movieId];

  return (
    <div style={{ padding: '30px 22px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div onClick={() => navigate(`/movie/${m.id}`)} style={{
        width: 210, height: 290, borderRadius: 3, cursor: 'pointer',
        background: `url(${m.poster}) center / cover no-repeat #eee`,
        boxShadow: '0 16px 36px rgba(0,0,0,0.28)',
      }} />
      <div onClick={() => navigate(`/movie/${m.id}`)} style={{
        marginTop: 22, fontFamily: 'var(--serif)', fontSize: 22,
        fontWeight: 500, letterSpacing: '-0.02em', cursor: 'pointer',
      }}>{m.title}</div>
      <div style={{ marginTop: 4, fontSize: 11, color: ACCENT, fontWeight: 500 }}>
        {m.year} · {m.director}
      </div>
      <div style={{ marginTop: 24, display: 'flex', gap: 6 }}>
        <Stars value={item.stars} size={24} />
      </div>
      <div style={{ marginTop: 30, fontSize: 12, color: '#666', fontFamily: 'var(--serif)' }}>
        <strong style={{ color: '#1f1f1f', fontWeight: 500 }}>{item.author}</strong>
        <span> · {item.when}</span>
      </div>
      <div style={{ marginTop: 60, fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--mute)', fontStyle: 'italic', letterSpacing: '0.04em' }}>
        — 멘트 없이 기록됨
      </div>
      <div style={{ height: 80 }} />
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: '16px 0', borderTop: '1px solid var(--line-soft)', width: '100%' }}>
        <button style={BTN}><HeartIcon /></button>
        <button style={BTN}><BookmarkIcon /></button>
      </div>
    </div>
  );
}

function QuoteDetail({ item }: { item: QuoteItem }) {
  const navigate = useNavigate();
  const m = MOVIE_BY_ID[item.movieId];

  return (
    <div style={{ flex: 1, position: 'relative', minHeight: '80vh', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `url(${m.backdrop || m.poster}) center / cover no-repeat #111`,
        filter: 'brightness(0.45)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.85) 100%)',
      }} />
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 32px 100px', color: '#fff', minHeight: '80vh',
      }}>
        <div style={{ fontSize: 60, fontFamily: 'var(--serif)', color: ACCENT, opacity: 0.9, lineHeight: 0.5, marginBottom: 8 }}>"</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 500, lineHeight: 1.6, letterSpacing: '-0.01em', wordBreak: 'keep-all' }}>
          {item.text}
        </div>
        <div style={{ marginTop: 24, fontFamily: 'var(--serif)', fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em' }}>
          <div onClick={() => navigate(`/movie/${m.id}`)} style={{ cursor: 'pointer' }}>{item.cite}</div>
          <div style={{ marginTop: 2 }}>{item.source}</div>
        </div>
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '16px 22px',
        background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.9))',
        display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', zIndex: 3,
      }}>
        <button style={{ ...BTN, color: '#fff' }}>
          <HeartIcon stroke="#fff" />
          <span style={{ color: '#fff', fontSize: 11 }}>{item.likes}</span>
        </button>
        <button style={BTN}><CommentIcon stroke="#fff" /></button>
        <button style={BTN}><BookmarkIcon stroke="#fff" /></button>
      </div>
    </div>
  );
}

function ListDetail({ item }: { item: ListItem }) {
  const navigate = useNavigate();
  const posters = [...item.covers, ...MOVIES.map(m => m.poster)].slice(0, item.count);

  return (
    <>
      {/* Collage hero */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', padding: '10px 22px 30px' }}>
        <div style={{ position: 'relative', width: 240, height: 180, margin: '0 auto' }}>
          {item.covers.slice(0, 3).map((c, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: 30 + i * 30, top: i * 10,
              width: 120, height: 168, borderRadius: 3,
              background: `url(${c}) center / cover no-repeat #eee`,
              boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
              zIndex: 3 - i, transform: `rotate(${(i - 1) * 4}deg)`,
              border: '3px solid #fff',
            }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '0 22px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em' }}>
            {item.title}
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: ACCENT, letterSpacing: '0.06em' }}>
            {item.author} · 영화 {item.count}편 · 좋아요 {item.likes}
          </div>
          <p style={{ margin: '18px auto 0', maxWidth: 300, fontFamily: 'var(--serif)', fontSize: 13, lineHeight: 1.7, color: '#1f1f1f' }}>
            눈이 오는 날, 다시 꺼내어 보고 싶은 영화들의 모음. 천천히 다시 보면서 그 시간을 한 번 더 살아내는 것에 가까운 일들에 대해서.
          </p>
        </div>

        <div style={{ marginTop: 28 }}>
          <SectionLabel>이 컬렉션의 영화</SectionLabel>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {posters.map((p, i) => {
              const movie = MOVIES.find(m => m.poster === p) || MOVIES[i % MOVIES.length];
              return (
                <button key={i} onClick={() => navigate(`/movie/${movie.id}`)} style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}>
                  <div style={{ aspectRatio: '3/4', borderRadius: 3, background: `url(${p}) center / cover no-repeat #eee`, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} />
                  <div style={{
                    marginTop: 5, fontFamily: 'var(--serif)', fontSize: 10.5,
                    fontWeight: 500, textAlign: 'left', letterSpacing: '-0.005em', color: '#1f1f1f',
                    display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  } as React.CSSProperties}>{movie.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ margin: '24px 0', padding: '14px 0', display: 'flex', gap: 14, justifyContent: 'center', borderTop: '1px solid var(--line-soft)' }}>
          <button style={BTN}><HeartIcon /></button>
          <button style={BTN}><BookmarkIcon /></button>
          <button style={BTN}><CommentIcon /></button>
        </div>
      </div>
    </>
  );
}

export default function PostPage() {
  const { kind, id } = useParams<{ kind: string; id: string }>();
  const navigate = useNavigate();
  const [review, setReview] = useState<ReviewDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && kind === 'review') {
      api.get<ReviewDTO>(`/v1/reviews/${id}`)
        .then(r => setReview(r))
        .catch(err => {
          console.error('Failed to fetch review:', err);
          setReview(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, kind]);

  // If kind is specified, use mock data (for backward compat)
  const item = kind ? FEED_ITEMS.find(x => 'id' in x && x.id === id) : null;

  const titleMap: Record<string, string> = { rating: '한줄평', log: '로그', quote: '인용', list: '컬렉션' };

  if (loading) {
    return (
      <Layout>
        <SubHeader onBack={() => navigate(-1)} title="평론" trailing={<button style={BTN}><EllipsisIcon /></button>} />
        <div style={{ padding: '60px 22px', textAlign: 'center', color: 'var(--mute)', fontSize: 13 }}>
          로딩 중...
        </div>
      </Layout>
    );
  }

  if (!item && !review) {
    return (
      <Layout>
        <SubHeader onBack={() => navigate(-1)} title="평론" trailing={<button style={BTN}><EllipsisIcon /></button>} />
        <div style={{ padding: '60px 22px', textAlign: 'center', color: 'var(--mute)', fontSize: 13 }}>
          게시물을 찾을 수 없습니다.
        </div>
      </Layout>
    );
  }

  if (review) {
    const isEssay = review.review_title && review.review_title.trim().length > 0;

    return (
      <Layout>
        <SubHeader onBack={() => navigate(-1)} title={isEssay ? "에세이" : "한줄평"} trailing={<button style={BTN}><EllipsisIcon /></button>} />
        <div style={{ padding: isEssay ? '20px 22px 0' : '12px 22px 0', textAlign: isEssay ? 'left' : 'center' }}>
          {isEssay ? (
            <>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 8 }}>
                {review.review_title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--mute)', marginBottom: 24 }}>
                {review.title}
              </div>
              <p style={{
                fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.8,
                color: '#1f1f1f', letterSpacing: '-0.004em', wordBreak: 'keep-all',
              }}>{review.content}</p>
            </>
          ) : (
            <>
              {review.poster_path && (
                <div style={{
                  width: 170, height: 236, borderRadius: 3, margin: '0 auto', cursor: 'pointer',
                  background: `url(https://image.tmdb.org/t/p/w500${review.poster_path}) center / cover no-repeat #eee`,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
                }} />
              )}
              <div style={{
                marginTop: 18, fontFamily: 'var(--serif)', fontSize: 22,
                fontWeight: 500, letterSpacing: '-0.02em',
              }}>{review.title}</div>
              <p style={{
                margin: '32px auto 0', maxWidth: 300,
                fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.7,
                color: '#1f1f1f', letterSpacing: '-0.005em', wordBreak: 'keep-all',
              }}>{review.content}</p>
            </>
          )}
        </div>
        <div style={{
          margin: '30px 22px 0', padding: '16px 0',
          display: 'flex', gap: 12, alignItems: 'center',
          borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)',
        }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: `url(${ME.avatar}) center / cover no-repeat #ddd` }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 500 }}>{review.user_id}</div>
            <div style={{ fontSize: 10, color: 'var(--mute)', marginTop: 2 }}>
              {new Date(review.created_at).toLocaleDateString('ko-KR')}
            </div>
          </div>
          <button style={BTN}><HeartIcon /></button>
        </div>
        <div style={{ padding: '18px 22px', fontSize: 10, color: 'var(--mute)', letterSpacing: '0.08em' }}>
          {review.like_count} likes
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SubHeader onBack={() => navigate(-1)} title={titleMap[kind ?? ''] ?? ''} trailing={
        <button style={BTN}><EllipsisIcon /></button>
      } />
      {kind === 'rating' && item?.kind === 'rating' && <RatingDetail item={item as RatingItem} />}
      {kind === 'log' && item?.kind === 'log' && <LogDetail item={item as LogItem} />}
      {kind === 'quote' && item?.kind === 'quote' && <QuoteDetail item={item as QuoteItem} />}
      {kind === 'list' && item?.kind === 'list' && <ListDetail item={item as ListItem} />}
    </Layout>
  );
}
