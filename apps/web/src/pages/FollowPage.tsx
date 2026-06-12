import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { FOLLOWS, ME } from '../lib/data';
import { BackIcon } from '../components/ui/Icons';

const ACCENT = '#6a7040';
const BTN: React.CSSProperties = { background: 'none', border: 0, padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center' };

type Tab = 'following' | 'followers';

export default function FollowPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab: Tab = (location.state as { tab?: Tab } | null)?.tab ?? 'following';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [list, setList] = useState(FOLLOWS);

  const toggle = (id: string) => setList(list.map(u => u.id === id ? { ...u, following: !u.following } : u));
  const visible = tab === 'following' ? list.filter(u => u.following) : list;

  return (
    <Layout>
      {/* Sub-header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid var(--line-soft)',
        position: 'sticky', top: 0, background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)', zIndex: 10,
      }}>
        <button onClick={() => navigate('/profile')} style={BTN}><BackIcon /></button>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 500 }}>{ME.name}</span>
        <span style={{ width: 24 }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line-soft)' }}>
        {([
          ['following', '팔로잉', ME.stats.following],
          ['followers', '팔로워', ME.stats.followers],
        ] as [Tab, string, number][]).map(([k, label, n]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: '14px 10px',
            background: 'transparent', border: 0, cursor: 'pointer',
            borderBottom: `2px solid ${tab === k ? '#000' : 'transparent'}`,
            marginBottom: -1,
          }}>
            <div style={{ fontSize: 12, color: tab === k ? '#000' : '#999', fontWeight: 600 }}>{label}</div>
            <div style={{ marginTop: 2, fontSize: 14, fontFamily: 'var(--serif)' }}>{n}</div>
          </button>
        ))}
      </div>

      {/* List */}
      <div>
        {visible.map(u => (
          <div key={u.id} style={{
            display: 'flex', gap: 14, alignItems: 'center',
            padding: '14px 22px', borderBottom: '1px solid var(--line-soft)',
          }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0, background: `url(${ME.avatar}) center / cover no-repeat #ddd` }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
              <div style={{ fontSize: 11, color: 'var(--mute)', marginTop: 1 }}>{u.handle}</div>
              <div style={{ fontSize: 11, color: ACCENT, marginTop: 2, fontFamily: 'var(--serif)' }}>{u.bio}</div>
            </div>
            <button onClick={() => toggle(u.id)} style={{
              padding: '6px 14px', borderRadius: 4,
              fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)',
              background: u.following ? '#fff' : '#1f1f1f',
              color: u.following ? '#1f1f1f' : '#fff',
              border: u.following ? '0.5px solid var(--line-soft)' : '0.5px solid #1f1f1f',
              boxShadow: u.following ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>{u.following ? '팔로잉' : '팔로우'}</button>
          </div>
        ))}
        {visible.length === 0 && (
          <div style={{ padding: '60px 22px', textAlign: 'center', color: 'var(--mute)', fontSize: 13 }}>
            아직 없습니다.
          </div>
        )}
      </div>
    </Layout>
  );
}
