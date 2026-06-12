import { useNavigate } from 'react-router-dom';
import { Essay, MOVIE_BY_ID } from '../../lib/data';
import { HeartIcon, CommentIcon } from '../ui/Icons';
import TypeBadge from './TypeBadge';

const ACCENT = '#6a7040';

export default function EssayCard({ essay }: { essay: Essay }) {
  const navigate = useNavigate();
  const movie = MOVIE_BY_ID[essay.movieId];

  return (
    <div
      onClick={() => navigate(`/essay/${essay.id}`)}
      style={{
        display: 'flex', gap: 14, padding: '20px 22px 22px',
        borderBottom: '1px solid var(--line-soft)',
        cursor: 'pointer', background: 'transparent',
      }}
    >
      <div
        onClick={e => { e.stopPropagation(); navigate(`/movie/${movie.id}`); }}
        style={{ flexShrink: 0 }}
      >
        <div style={{
          width: 130, height: 180, borderRadius: 5,
          background: `url(${movie.poster}) center / cover no-repeat #eee`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <TypeBadge label="에세이" />
        <div style={{
          marginTop: 6, fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500,
          lineHeight: 1.35, letterSpacing: '-0.01em', color: '#000',
        }}>{essay.title}</div>
        <div style={{ marginTop: 6, fontSize: 11, color: ACCENT, fontWeight: 500, letterSpacing: '0.04em' }}>
          {essay.author} · {essay.date}
        </div>

        <div style={{ position: 'relative', marginTop: 12, minHeight: 70 }}>
          <p style={{
            margin: 0, fontSize: 12.5, lineHeight: 1.65,
            color: essay.private ? 'transparent' : '#222',
            fontFamily: 'var(--serif)',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            userSelect: essay.private ? 'none' : 'auto',
          } as React.CSSProperties}>{essay.excerpt}</p>
          {essay.private && (
            <div style={{
              position: 'absolute', inset: -4,
              background: 'rgba(106,112,64,0.18)',
              backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 3,
            }}>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.15em',
                color: '#fff', textTransform: 'uppercase',
              }}>· 잠긴 글 · 미리보기</span>
            </div>
          )}
        </div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <HeartIcon size={14} stroke="#1f1f1f" />
              <span style={{ fontSize: 10, fontWeight: 500 }}>{essay.likes}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CommentIcon size={14} stroke="#1f1f1f" />
              <span style={{ fontSize: 10, fontWeight: 500 }}>{essay.comments}</span>
            </span>
          </div>
          <span style={{ fontSize: 9.5, color: 'var(--mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {movie.title}
          </span>
        </div>
      </div>
    </div>
  );
}
