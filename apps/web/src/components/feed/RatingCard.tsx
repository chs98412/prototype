import { useNavigate } from 'react-router-dom';
import { RatingItem, MOVIE_BY_ID } from '../../lib/data';
import { HeartIcon, CommentIcon } from '../ui/Icons';
import TypeBadge from './TypeBadge';
import Stars from './Stars';

const ACCENT = '#6a7040';

export default function RatingCard({ item }: { item: RatingItem }) {
  const navigate = useNavigate();
  const movie = MOVIE_BY_ID[item.movieId];

  return (
    <div
      onClick={() => navigate(`/post/rating/${item.id}`)}
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
        <TypeBadge label="한줄평" />
        <div style={{
          marginTop: 6, fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500,
          letterSpacing: '-0.01em', lineHeight: 1.3,
        }}>{movie.title}</div>
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Stars value={item.stars} size={13} accent={ACCENT} />
          <span style={{ fontSize: 11, color: ACCENT, fontWeight: 500 }}>{item.stars}.0</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 11, color: ACCENT, fontWeight: 500, letterSpacing: '0.04em' }}>
          {item.author} · {item.when}
        </div>
        <p style={{
          margin: '10px 0 0', fontFamily: 'var(--serif)',
          fontSize: 12.5, lineHeight: 1.65, color: '#222',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', flex: 1,
        } as React.CSSProperties}>{item.blurb}</p>
        <div style={{ marginTop: 10, display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <HeartIcon size={14} stroke="#1f1f1f" />
            <span style={{ fontSize: 10, fontWeight: 500 }}>{item.likes}</span>
          </span>
          {item.comments != null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CommentIcon size={14} stroke="#1f1f1f" />
              <span style={{ fontSize: 10, fontWeight: 500 }}>{item.comments}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
