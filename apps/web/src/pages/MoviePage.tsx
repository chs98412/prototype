import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from '../components/ui/Layout';
import { BackIcon, BookmarkIcon, StarIcon } from '../components/ui/Icons';
import { api } from '../lib/api';
import type { TmdbMovieDetail } from '../lib/apiTypes';

const ACCENT = '#6a7040';
const BTN: React.CSSProperties = { background: 'none', border: 0, padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center' };
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', color: '#666', textTransform: 'uppercase' }}>
      <span>{children}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
    </div>
  );
}

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<TmdbMovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('영화 ID가 없습니다');
      setLoading(false);
      return;
    }

    setLoading(true);
    api.get<TmdbMovieDetail>(`/v1/movies/${id}`)
      .then(data => {
        setMovie(data);
        setError(null);
      })
      .catch(e => {
        setError(e.message);
        setMovie(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: '40px 22px', textAlign: 'center', color: 'var(--mute)' }}>
          불러오는 중…
        </div>
      </Layout>
    );
  }

  if (error || !movie) {
    return (
      <Layout>
        <div style={{ padding: '40px 22px', textAlign: 'center' }}>
          <div style={{ color: '#c44', marginBottom: 8 }}>오류 발생</div>
          <div style={{ color: 'var(--mute)', fontSize: 13 }}>{error}</div>
          <button
            onClick={() => navigate(-1)}
            style={{ marginTop: 16, padding: '8px 16px', borderRadius: 4, border: '1px solid #ccc', cursor: 'pointer' }}
          >
            돌아가기
          </button>
        </div>
      </Layout>
    );
  }

  const year = new Date(movie.release_date).getFullYear();
  const genreStr = movie.genres.map(g => g.name).join(', ');
  const director = movie.credits?.crew.find(c => c.job === 'Director')?.name || '-';

  return (
    <Layout>
      {/* Floating header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', position: 'sticky', top: 0,
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', zIndex: 10,
        borderBottom: '1px solid var(--line-soft)',
      }}>
        <button onClick={() => navigate(-1)} style={BTN}><BackIcon /></button>
        <button style={BTN}><BookmarkIcon /></button>
      </div>

      {/* Backdrop */}
      <div style={{
        width: '100%', height: 280,
        background: movie.backdrop_path
          ? `url(${TMDB_IMG}${movie.backdrop_path}) center / cover no-repeat #222`
          : `url(${TMDB_IMG}${movie.poster_path}) center / cover no-repeat #222`,
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0.95) 100%)',
        }} />
      </div>

      <div style={{ marginTop: -150, padding: '0 22px', position: 'relative' }}>
        {/* Poster overlapping backdrop */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 186, height: 264, borderRadius: 2, flexShrink: 0,
            background: movie.poster_path
              ? `url(${TMDB_IMG}${movie.poster_path}) center / cover no-repeat #eee`
              : '#eee',
            boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
          }} />
        </div>

        {/* Title block */}
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}>
            {movie.title}
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: ACCENT, fontWeight: 500, letterSpacing: '0.06em' }}>
            {year} · {genreStr}
          </div>
          <div style={{ marginTop: 2, fontSize: 11, color: ACCENT, fontWeight: 500, letterSpacing: '0.06em' }}>
            {movie.runtime ? `${movie.runtime}분` : '-'} · {movie.vote_average.toFixed(1)}
          </div>
          {director !== '-' && (
            <div style={{ marginTop: 2, fontSize: 11, color: ACCENT, fontWeight: 500, letterSpacing: '0.06em' }}>
              감독 · {director}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 16 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <StarIcon key={i} size={20} filled={i <= Math.round(movie.vote_average / 2)} stroke="#1f1f1f" />
            ))}
          </div>
        </div>

        {/* Synopsis */}
        <div style={{ marginTop: 32, padding: '0 0 32px' }}>
          <SectionLabel>시놉시스</SectionLabel>
          <p style={{
            marginTop: 12, fontFamily: 'var(--serif)', fontSize: 13, lineHeight: 1.8,
            color: '#1f1f1f',
          }}>
            {movie.overview || '시놉시스가 없습니다.'}
          </p>
        </div>

        {/* Cast */}
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionLabel>출연</SectionLabel>
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {movie.credits.cast.slice(0, 6).map((actor) => (
                <div key={actor.id} style={{ fontSize: 12 }}>
                  <div style={{ fontWeight: 500, color: '#1f1f1f' }}>{actor.name}</div>
                  <div style={{ marginTop: 2, fontSize: 11, color: 'var(--mute)' }}>{actor.character}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div style={{ marginBottom: 40, paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
          <SectionLabel>평론</SectionLabel>
          <div style={{ marginTop: 16, textAlign: 'center', color: 'var(--mute)', fontSize: 13 }}>
            평론을 작성해보세요.
          </div>
          <button
            onClick={() => navigate('/editor', { state: { movie, kind: 'rating' } })}
            style={{
              width: '100%', marginTop: 16,
              padding: '12px', borderRadius: 4,
              background: '#1f1f1f', color: '#fff', border: 0,
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}
          >
            평론 작성
          </button>
        </div>
      </div>
    </Layout>
  );
}
