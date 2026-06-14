import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { MOVIE_BY_ID, MOVIES, ESSAYS } from '../lib/data';
import { BackIcon, BookmarkIcon, StarIcon } from '../components/ui/Icons';

const ACCENT = '#6a7040';
const BTN: React.CSSProperties = { background: 'none', border: 0, padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center' };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', color: '#666', textTransform: 'uppercase' }}>
      <span>{children}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
    </div>
  );
}

const SYNOPSES: Record<string, string> = {
  monster: '어느 날 밤, 학교에서 일어난 작은 사건이 한 어머니와 교사, 그리고 두 아이의 세계를 차례로 흔든다. 세 개의 시점이 겹쳐지며 \'누가 괴물인가\'라는 질문은 점점 거울처럼 관객을 향한다.',
};
const DEFAULT_SYNOPSIS = '여기에 들어갈 시놉시스. 평론과 함께 영화를 천천히 읽어내려 갑니다. 세 개의 시점이 겹쳐지면서 우리가 무엇을 보았다고 말할 수 있는지에 대해 질문을 던집니다.';

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const movie = (id && MOVIE_BY_ID[id]) || MOVIES[0];
  const movieEssays = ESSAYS.filter(e => e.movieId === movie.id);

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
        background: `url(${movie.backdrop || movie.poster}) center / cover no-repeat #222`,
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
            background: `url(${movie.poster}) center / cover no-repeat #eee`,
            boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
          }} />
        </div>

        {/* Title block */}
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}>
            {movie.title}
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: ACCENT, fontWeight: 500, letterSpacing: '0.06em' }}>
            {movie.year} · {movie.genre} · {movie.country}
          </div>
          <div style={{ marginTop: 2, fontSize: 11, color: ACCENT, fontWeight: 500, letterSpacing: '0.06em' }}>
            {movie.runtime} · {movie.rating} · {movie.director}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 16 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <StarIcon key={i} size={20} filled={i <= 4} stroke="#1f1f1f" />
            ))}
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: 'var(--mute)', letterSpacing: '0.04em' }}>
            4.1 · {movieEssays.length} 평론
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button
            onClick={() => navigate('/editor')}
            style={{
              flex: 2, background: '#1f1f1f', color: '#fff', border: 0,
              padding: '13px 14px', borderRadius: 8, cursor: 'pointer',
              fontSize: 12.5, fontWeight: 600, letterSpacing: '0.04em', fontFamily: 'var(--sans)',
            }}
          >평론 쓰러가기</button>
          <button style={{
            flex: 1, background: 'transparent', border: '0.5px solid var(--line-soft)',
            padding: '13px 14px', borderRadius: 8, cursor: 'pointer',
            fontSize: 12.5, fontWeight: 500, fontFamily: 'var(--sans)',
          }}>보기 목록</button>
        </div>

        {/* Synopsis */}
        <div style={{ marginTop: 28 }}>
          <SectionLabel>시놉시스</SectionLabel>
          <p style={{
            margin: '10px 0 0', fontFamily: 'var(--serif)',
            fontSize: 13, lineHeight: 1.85, color: '#1f1f1f', wordBreak: 'keep-all',
          }}>
            {SYNOPSES[movie.id] || DEFAULT_SYNOPSIS}
          </p>
        </div>

        {/* Essays */}
        <div style={{ marginTop: 32, marginBottom: 24 }}>
          <SectionLabel>이 영화의 평론</SectionLabel>
          <div style={{ marginTop: 8 }}>
            {(movieEssays.length ? movieEssays : ESSAYS.slice(0, 2)).map(e => (
              <button key={e.id} onClick={() => navigate(`/essay/${e.id}`)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: 'transparent', border: 0, cursor: 'pointer',
                padding: '14px 0', borderBottom: '1px solid var(--line-soft)',
              }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 500, letterSpacing: '-0.005em' }}>
                  {e.title}
                </div>
                <div style={{
                  marginTop: 6, fontSize: 11.5, color: '#444', fontFamily: 'var(--serif)', lineHeight: 1.55,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                } as React.CSSProperties}>{e.excerpt}</div>
                <div style={{ marginTop: 8, fontSize: 10, color: ACCENT, letterSpacing: '0.06em' }}>
                  {e.author} · {e.date} · 좋아요 {e.likes}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
