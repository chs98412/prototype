import { useNavigate } from 'react-router-dom';
import { QuoteItem, MOVIE_BY_ID } from '../../lib/data';
import { HeartIcon, BookmarkIcon } from '../ui/Icons';
import TypeBadge from './TypeBadge';

const ACCENT = '#6a7040';

export default function QuoteCard({ item }: { item: QuoteItem }) {
  const navigate = useNavigate();
  const movie = MOVIE_BY_ID[item.movieId];

  return (
    <div
      onClick={() => navigate(`/post/quote/${item.id}`)}
      style={{
        padding: '20px 22px 22px',
        borderBottom: '1px solid var(--line-soft)',
        cursor: 'pointer', background: 'transparent',
      }}
    >
      <TypeBadge label="인용" />
      <div style={{
        marginTop: 10,
        background: 'var(--bg-warm)',
        borderTop: `1px solid ${ACCENT}`,
        borderBottom: `1px solid ${ACCENT}`,
        padding: '18px 20px',
        minHeight: 130,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500,
          lineHeight: 1.55, color: '#1f1f1f', letterSpacing: '-0.005em',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 22, color: ACCENT, verticalAlign: '-4px' }}>"</span>
          {item.text}
          <span style={{ fontSize: 22, color: ACCENT, verticalAlign: '-4px' }}>"</span>
        </div>
        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 10, color: ACCENT, letterSpacing: '0.08em' }}>
          <span
            onClick={e => { e.stopPropagation(); navigate(`/movie/${movie.id}`); }}
            style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(0,0,0,0.15)', textUnderlineOffset: 3 }}
          >{item.cite}</span>
          <span style={{ color: 'var(--mute)' }}> · {item.source}</span>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 14, alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <HeartIcon size={14} />
          <span style={{ fontSize: 10, fontWeight: 500 }}>{item.likes}</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <BookmarkIcon size={14} />
        </span>
      </div>
    </div>
  );
}
