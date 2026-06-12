import { useNavigate } from 'react-router-dom';
import { ListItem } from '../../lib/data';
import { HeartIcon } from '../ui/Icons';
import TypeBadge from './TypeBadge';

const ACCENT = '#6a7040';

export default function ListCard({ item }: { item: ListItem }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/post/list/${item.id}`)}
      style={{
        display: 'flex', gap: 14, padding: '20px 22px 22px',
        borderBottom: '1px solid var(--line-soft)',
        cursor: 'pointer', background: 'transparent',
      }}
    >
      <div style={{ position: 'relative', width: 130, height: 180, flexShrink: 0 }}>
        {item.covers.slice(0, 3).map((src, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: i * 16, top: i * 10,
            width: 96, height: 134, borderRadius: 3,
            background: `url(${src}) center / cover no-repeat #eee`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            zIndex: 3 - i,
            border: '2px solid #fff',
          }} />
        ))}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TypeBadge label="컬렉션" />
        <div style={{
          marginTop: 6, fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500,
          letterSpacing: '-0.01em', lineHeight: 1.3,
        }}>{item.title}</div>
        <div style={{ marginTop: 6, fontSize: 11, color: ACCENT, fontWeight: 500, letterSpacing: '0.04em' }}>
          {item.author} · 영화 {item.count}편
        </div>
        <p style={{
          margin: '10px 0 0', fontFamily: 'var(--serif)',
          fontSize: 12.5, lineHeight: 1.65, color: '#222',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', flex: 1,
        } as React.CSSProperties}>눈이 오는 날, 다시 꺼내어 보고 싶은 영화들의 모음.</p>
        <div style={{
          marginTop: 12, display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <HeartIcon size={14} />
            <span style={{ fontSize: 10, fontWeight: 500 }}>{item.likes}</span>
          </span>
          <span style={{ fontSize: 9.5, color: 'var(--mute)', letterSpacing: '0.06em' }}>{item.when}</span>
        </div>
      </div>
    </div>
  );
}
