import { useNavigate } from 'react-router-dom';
import { LogItem, MOVIE_BY_ID } from '../../lib/data';
import TypeBadge from './TypeBadge';
import Stars from './Stars';

const ACCENT = '#6a7040';

export default function LogCard({ item }: { item: LogItem }) {
  const navigate = useNavigate();
  const movie = MOVIE_BY_ID[item.movieId];

  return (
    <div
      onClick={() => navigate(`/post/log/${item.id}`)}
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

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TypeBadge label="로그" />
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'url(/images/profile.jpg) center / cover no-repeat #ddd',
            flexShrink: 0,
          }} />
          <div style={{ fontSize: 11.5, color: '#1f1f1f', lineHeight: 1.4 }}>
            <strong style={{ fontWeight: 600 }}>{item.author}</strong>
            <span style={{ color: '#666' }}> 님이 보았어요</span>
          </div>
        </div>
        <div style={{
          marginTop: 14, fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 500,
          letterSpacing: '-0.01em', lineHeight: 1.25,
        }}>{movie.title}</div>
        <div style={{ marginTop: 4, fontSize: 11, color: ACCENT, fontWeight: 500 }}>
          {movie.year} · {movie.director}
        </div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Stars value={item.stars} size={14} accent="#1f1f1f" />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: 10.5, color: 'var(--mute)',
            fontStyle: 'italic', fontFamily: 'var(--serif)',
          }}>— 멘트 없이 기록됨</span>
          <span style={{ fontSize: 10, color: 'var(--mute)' }}>{item.when}</span>
        </div>
      </div>
    </div>
  );
}
