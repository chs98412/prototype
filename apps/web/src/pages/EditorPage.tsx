import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { api } from '../lib/api';
import type { Movie } from '../lib/data';
import type { TmdbMovieDetail } from '../lib/apiTypes';
import { MOVIES, MOVIE_BY_ID } from '../lib/data';
import { BackIcon, StarIcon, CameraIcon, SparkleIcon, BookmarkIcon } from '../components/ui/Icons';

const ACCENT = '#6a7040';
const BTN: React.CSSProperties = { background: 'none', border: 0, padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center' };

type Kind = 'essay' | 'rating' | 'log' | 'quote' | 'list';
const TYPES: { id: Kind; label: string }[] = [
  { id: 'essay', label: '에세이' },
  { id: 'rating', label: '한줄평' },
  { id: 'log', label: '로그' },
  { id: 'quote', label: '인용' },
  { id: 'list', label: '컬렉션' },
];

const INPUT: React.CSSProperties = {
  width: '100%', border: 0, outline: 'none', background: 'transparent',
  fontSize: 13, padding: '8px 0',
  borderBottom: '1px solid var(--line-soft)',
  fontFamily: 'var(--sans)', color: '#1f1f1f',
};

function EssayForm({ title, setTitle, body, setBody }: { title: string; setTitle: (v: string) => void; body: string; setBody: (v: string) => void }) {
  return (
    <div style={{ padding: '20px 22px' }}>
      <input value={title} onChange={e => setTitle(e.target.value)}
        placeholder="제목을 적어주세요"
        style={{ width: '100%', border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em' }} />
      <div style={{ height: 1, background: 'var(--line-soft)', margin: '12px 0' }} />
      <textarea value={body} onChange={e => setBody(e.target.value)}
        placeholder="문장은 천천히 흘러도 괜찮습니다. 한 호흡 길게, 그러나 묽지 않게 쓰는 평론을 응원해요."
        rows={12}
        style={{ width: '100%', border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--serif)', fontSize: 14, lineHeight: 1.8, resize: 'none', color: '#1f1f1f' }} />
    </div>
  );
}

function RatingForm({ stars, setStars, blurb, setBlurb }: { stars: number; setStars: (v: number) => void; blurb: string; setBlurb: (v: string) => void }) {
  return (
    <div style={{ padding: '28px 22px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: 'var(--mute)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>별점</div>
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 8 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <button key={i} onClick={() => setStars(i)} style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}>
              <StarIcon size={32} filled={i <= stars} stroke="#1f1f1f" strokeWidth={1.6} />
            </button>
          ))}
        </div>
        {stars > 0 && <div style={{ marginTop: 8, fontSize: 12, color: ACCENT }}>{stars}.0</div>}
      </div>
      <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--line-soft)' }}>
        <div style={{ fontSize: 10, color: 'var(--mute)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
          한 줄로 말한다면
        </div>
        <textarea value={blurb} onChange={e => setBlurb(e.target.value)}
          placeholder="한 호흡으로 끝나는 짧은 평. 농담도, 한 줄 인상도 환영합니다."
          rows={4}
          style={{ width: '100%', border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.7, resize: 'none', color: '#1f1f1f' }} />
      </div>
    </div>
  );
}

function LogForm({ stars, setStars, movie }: { stars: number; setStars: (v: number) => void; movie: Movie }) {
  return (
    <div style={{ padding: '28px 22px', textAlign: 'center' }}>
      <div style={{
        width: 140, height: 196, borderRadius: 3, margin: '0 auto',
        background: `url(${movie.poster}) center / cover no-repeat #eee`,
        boxShadow: '0 8px 22px rgba(0,0,0,0.18)',
      }} />
      <div style={{ marginTop: 18, fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500 }}>{movie.title}</div>
      <div style={{ marginTop: 4, fontSize: 11, color: ACCENT }}>봤습니다.</div>
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 10, color: 'var(--mute)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>한 마디로 별점만</div>
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 8 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <button key={i} onClick={() => setStars(i)} style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}>
              <StarIcon size={28} filled={i <= stars} stroke="#1f1f1f" strokeWidth={1.6} />
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 32, fontFamily: 'var(--serif)', fontSize: 12, color: 'var(--mute)', fontStyle: 'italic' }}>
        — 멘트 없이 기록됩니다.
      </div>
    </div>
  );
}

function QuoteForm({ quote, setQuote, cite, setCite }: { quote: string; setQuote: (v: string) => void; cite: string; setCite: (v: string) => void }) {
  return (
    <div style={{ padding: '20px 22px' }}>
      <div style={{ fontSize: 10, color: 'var(--mute)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>영화 속 대사</div>
      <div style={{ background: '#f7f6f3', borderTop: `1px solid ${ACCENT}`, borderBottom: `1px solid ${ACCENT}`, padding: '22px 18px' }}>
        <span style={{ fontSize: 26, color: ACCENT, lineHeight: 0.5 }}>"</span>
        <textarea value={quote} onChange={e => setQuote(e.target.value)}
          placeholder="기억하고 싶은 한 마디를 적어주세요."
          rows={4}
          style={{ width: '100%', marginTop: 8, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.65, textAlign: 'center', resize: 'none', color: '#1f1f1f' }} />
      </div>
      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 10, color: 'var(--mute)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>누가 / 어느 장면</div>
        <input value={cite} onChange={e => setCite(e.target.value)}
          placeholder="예) 〈괴물〉의 마지막 장면에서"
          style={INPUT} />
      </div>
    </div>
  );
}

function ListForm({ listName, setListName, listDesc, setListDesc, picks, setPicks }: {
  listName: string; setListName: (v: string) => void;
  listDesc: string; setListDesc: (v: string) => void;
  picks: string[]; setPicks: (v: string[]) => void;
}) {
  const toggle = (id: string) => {
    setPicks(picks.includes(id) ? picks.filter(p => p !== id) : [...picks, id]);
  };
  return (
    <div style={{ padding: '20px 22px' }}>
      <div style={{ fontSize: 10, color: 'var(--mute)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>컬렉션 이름</div>
      <input value={listName} onChange={e => setListName(e.target.value)}
        placeholder="예) 겨울에 다시 보는 영화"
        style={{ width: '100%', border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, padding: '6px 0', borderBottom: '1px solid var(--line-soft)' }} />
      <div style={{ marginTop: 18, fontSize: 10, color: 'var(--mute)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>큐레이터 노트</div>
      <textarea value={listDesc} onChange={e => setListDesc(e.target.value)}
        placeholder="왜 이 영화들을 모으셨나요?"
        rows={3}
        style={{ width: '100%', border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--serif)', fontSize: 13, lineHeight: 1.7, resize: 'none', color: '#1f1f1f' }} />
      <div style={{ marginTop: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', color: '#666', textTransform: 'uppercase', marginBottom: 12 }}>
          <span>영화 고르기 · {picks.length}편 선택</span>
          <span style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {MOVIES.map(m => {
            const sel = picks.includes(m.id);
            return (
              <button key={m.id} onClick={() => toggle(m.id)} style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer', position: 'relative' }}>
                <div style={{
                  aspectRatio: '3/4', borderRadius: 3,
                  background: `url(${m.poster}) center / cover no-repeat #eee`,
                  outline: sel ? `3px solid ${ACCENT}` : '1px solid transparent',
                  outlineOffset: sel ? -3 : 0,
                  filter: sel ? 'none' : 'saturate(0.9)',
                }} />
                {sel && (
                  <div style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 22, height: 22, borderRadius: 999,
                    background: ACCENT, color: '#fff',
                    display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600,
                  }}>{picks.indexOf(m.id) + 1}</div>
                )}
                <div style={{
                  marginTop: 5, fontFamily: 'var(--serif)', fontSize: 10.5, textAlign: 'left', color: '#1f1f1f',
                  display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                } as React.CSSProperties}>{m.title}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as { movie?: TmdbMovieDetail; kind?: Kind } | null) || {};

  const [kind, setKind] = useState<Kind>(locationState.kind || 'essay');
  const kindRef = useRef<Kind>(locationState.kind || 'essay');
  const handleKindChange = (k: Kind) => { setKind(k); kindRef.current = k; };
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [blurb, setBlurb] = useState('');
  const [stars, setStars] = useState(0);
  const [quote, setQuote] = useState('');
  const [cite, setCite] = useState('');
  const [listName, setListName] = useState('');
  const [listDesc, setListDesc] = useState('');
  const [listPicks, setListPicks] = useState<string[]>([]);
  const [movieId, setMovieId] = useState(MOVIES[0].id);
  const [isPosting, setIsPosting] = useState(false);

  const handlePublish = async () => {
    if (isPosting) return;
    setIsPosting(true);

    try {
      const tmdbId = locationState.movie?.id || parseInt(movieId);
      const currentKind = kindRef.current;

      if (currentKind === 'essay') {
        if (!body.trim()) {
          alert('내용을 입력해주세요');
          setIsPosting(false);
          return;
        }
        await api.post('/v1/reviews', {
          tmdb_id: tmdbId,
          media_type: 'movie',
          kind: 'essay',
          title: title,
          content: body,
          spoiler: false,
        });
      } else if (currentKind === 'rating') {
        if (!blurb.trim() || stars === 0) {
          alert('별점과 한 줄평을 입력해주세요');
          setIsPosting(false);
          return;
        }
        await api.post('/v1/reviews', {
          tmdb_id: tmdbId,
          media_type: 'movie',
          kind: 'rating',
          content: blurb,
          spoiler: false,
        });
        await api.post('/v1/records', {
          tmdb_id: tmdbId,
          media_type: 'movie',
          rating: stars,
        });
      } else if (currentKind === 'log') {
        if (stars === 0) {
          alert('별점을 선택해주세요');
          setIsPosting(false);
          return;
        }
        await api.post('/v1/records', {
          tmdb_id: tmdbId,
          media_type: 'movie',
          rating: stars,
        });
      } else if (currentKind === 'quote') {
        if (!quote.trim()) {
          alert('대사를 입력해주세요');
          setIsPosting(false);
          return;
        }
        await api.post('/v1/reviews', {
          tmdb_id: tmdbId,
          media_type: 'movie',
          kind: 'quote',
          content: `"${quote}"\n\n— ${cite}`,
          spoiler: false,
        });
      }

      navigate('/');
    } catch (err) {
      alert(`게시 중 오류가 발생했습니다: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsPosting(false);
    }
  };

  // If coming from MoviePage, convert TmdbMovieDetail to mock Movie for display
  let movie = MOVIE_BY_ID[movieId];
  if (locationState.movie) {
    const tmdb = locationState.movie;
    // Create a mock Movie object from TMDB data for UI display
    movie = {
      id: String(tmdb.id),
      title: tmdb.title,
      poster: tmdb.poster_path
        ? `https://image.tmdb.org/t/p/w185${tmdb.poster_path}`
        : '/images/poster-feed.png',
      backdrop: tmdb.backdrop_path
        ? `https://image.tmdb.org/t/p/w500${tmdb.backdrop_path}`
        : undefined,
      year: parseInt(tmdb.release_date?.split('-')[0] || '0'),
      genre: tmdb.genres.map(g => g.name).join(', '),
      country: '-',
      runtime: `${tmdb.runtime}분`,
      rating: tmdb.vote_average.toFixed(1),
      director: tmdb.credits?.crew.find(c => c.job === 'Director')?.name || '-',
    };
  }

  const currentType = TYPES.find(t => t.id === kind);

  return (
    <Layout>
      {/* Sub-header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid var(--line-soft)',
        position: 'sticky', top: 0, background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)', zIndex: 10,
      }}>
        <button onClick={() => navigate(-1)} style={BTN}><BackIcon /></button>
        <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600 }}>새 {currentType?.label}</span>
        <button onClick={handlePublish} disabled={isPosting} style={{ background: 'none', border: 0, color: ACCENT, fontSize: 12, fontWeight: 600, cursor: isPosting ? 'not-allowed' : 'pointer', opacity: isPosting ? 0.5 : 1 }}>
          {isPosting ? '게시 중...' : '게시'}
        </button>
      </div>

      {/* Type picker */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 16px 14px', borderBottom: '1px solid var(--line-soft)', overflowX: 'auto' }}>
        {TYPES.map(tp => (
          <button key={tp.id} onClick={() => handleKindChange(tp.id)} style={{
            flexShrink: 0, padding: '7px 14px', borderRadius: 999,
            fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)', whiteSpace: 'nowrap',
            background: kind === tp.id ? '#1f1f1f' : 'transparent',
            color: kind === tp.id ? '#fff' : '#666',
            border: kind === tp.id ? '0.5px solid #1f1f1f' : '0.5px solid var(--line-soft)',
          }}>{tp.label}</button>
        ))}
      </div>

      {/* Movie display (no dropdown if from MoviePage) */}
      {kind !== 'list' && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 22px', borderBottom: '1px solid var(--line-soft)' }}>
          <div style={{ width: 50, height: 68, borderRadius: 2, flexShrink: 0, background: `url(${movie.poster}) center / cover no-repeat #eee` }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: 'var(--mute)', letterSpacing: '0.08em' }}>대상 영화</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 500 }}>{movie.title}</div>
            <div style={{ fontSize: 10, color: ACCENT }}>{movie.year} · {movie.director}</div>
          </div>
          {!locationState.movie && (
            <select value={movieId} onChange={e => setMovieId(e.target.value)} style={{
              background: 'transparent', border: '0.5px solid var(--line-soft)',
              padding: '5px 12px', borderRadius: 999, cursor: 'pointer',
              fontSize: 10, fontWeight: 500, color: ACCENT, fontFamily: 'var(--sans)',
            }}>
              {MOVIES.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          )}
        </div>
      )}

      {/* Form body */}
      {kind === 'essay' && <EssayForm title={title} setTitle={setTitle} body={body} setBody={setBody} />}
      {kind === 'rating' && <RatingForm stars={stars} setStars={setStars} blurb={blurb} setBlurb={setBlurb} />}
      {kind === 'log' && <LogForm stars={stars} setStars={setStars} movie={movie} />}
      {kind === 'quote' && <QuoteForm quote={quote} setQuote={setQuote} cite={cite} setCite={setCite} />}
      {kind === 'list' && <ListForm listName={listName} setListName={setListName} listDesc={listDesc} setListDesc={setListDesc} picks={listPicks} setPicks={setListPicks} />}

      {/* Essay action chips */}
      {kind === 'essay' && (
        <div style={{
          display: 'flex', gap: 10, padding: '12px 22px',
          borderTop: '1px solid var(--line-soft)', background: 'rgba(247,246,243,0.6)',
        }}>
          {[
            { Icon: CameraIcon, label: '스틸 추가' },
            { Icon: SparkleIcon, label: 'AI 다듬기' },
            { Icon: BookmarkIcon, label: '임시 저장' },
          ].map(({ Icon, label }) => (
            <button key={label} style={{
              background: '#fff', border: '0.5px solid var(--line-soft)',
              padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
              display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </Layout>
  );
}
