import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { NOTIFICATIONS, ME } from '../lib/data';
import { EllipsisIcon } from '../components/ui/Icons';

const ACCENT = '#6a7040';
type FilterTab = '전체' | '좋아요' | '코멘트' | '팔로우';
const TABS: FilterTab[] = ['전체', '좋아요', '코멘트', '팔로우'];
const KIND_MAP: Record<FilterTab, string | null> = {
  '전체': null, '좋아요': 'like', '코멘트': 'comment', '팔로우': 'follow',
};

const DOT_COLOR: Record<string, string> = {
  like: '#c44',
  comment: ACCENT,
  follow: '#5887d6',
};

export default function AlertsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<FilterTab>('전체');

  const visible = NOTIFICATIONS.filter(n => {
    const kind = KIND_MAP[tab];
    return kind === null || n.kind === kind;
  });

  return (
    <Layout>
      <div style={{ padding: '16px 22px 6px' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>
          알림
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: ACCENT, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {NOTIFICATIONS.length} new · 이번 주
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '14px 22px 4px' }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flexShrink: 0, padding: '5px 12px', borderRadius: 999,
            fontSize: 11, fontWeight: 500, cursor: 'pointer',
            border: '0.5px solid',
            background: tab === t ? '#1f1f1f' : '#fff',
            color: tab === t ? '#fff' : '#1f1f1f',
            borderColor: tab === t ? '#1f1f1f' : 'var(--line-soft)',
          }}>{t}</button>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        {visible.map(n => (
          <div
            key={n.id}
            onClick={() => n.essayId && navigate(`/essay/${n.essayId}`)}
            style={{
              display: 'flex', gap: 14, padding: '14px 22px',
              borderBottom: '1px solid var(--line-soft)',
              background: n.id === 'n1' ? 'rgba(106,112,64,0.04)' : 'transparent',
              cursor: n.essayId ? 'pointer' : 'default',
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              background: `url(${ME.avatar}) center / cover no-repeat #ddd`,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: '#1f1f1f' }}>
                <strong style={{ fontWeight: 600 }}>{n.who}</strong>{n.body}
              </div>
              <div style={{ marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{
                  width: 6, height: 6, borderRadius: 999,
                  background: DOT_COLOR[n.kind] || ACCENT,
                }} />
                <span style={{ fontSize: 10, color: 'var(--mute)' }}>{n.when}</span>
              </div>
            </div>
            {n.kind === 'follow' ? (
              <button style={{
                alignSelf: 'center', border: '0.5px solid #1f1f1f',
                background: '#1f1f1f', color: '#fff',
                padding: '5px 12px', borderRadius: 999,
                fontSize: 10, fontWeight: 500, cursor: 'pointer',
              }}>팔로우</button>
            ) : (
              <button style={{ background: 'none', border: 0, padding: 4, cursor: 'pointer' }}>
                <EllipsisIcon />
              </button>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
}
