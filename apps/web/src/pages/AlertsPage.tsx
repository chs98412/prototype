import { useState, useEffect } from 'react';
import Layout from '../components/ui/Layout';
import { EllipsisIcon } from '../components/ui/Icons';
import { api } from '../lib/api';
import type { NotificationDTO, ApiList } from '../lib/apiTypes';

const ACCENT = '#6a7040';

type FilterTab = '전체' | '좋아요' | '코멘트' | '팔로우';
const TABS: FilterTab[] = ['전체', '좋아요', '코멘트', '팔로우'];

const KIND_FILTER: Record<FilterTab, string | null> = {
  '전체': null, '좋아요': 'like', '코멘트': 'comment', '팔로우': 'follow',
};

const DOT_COLOR: Record<string, string> = {
  like: '#c44',
  comment: ACCENT,
  follow: '#5887d6',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

export default function AlertsPage() {
  const [tab, setTab] = useState<FilterTab>('전체');
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ApiList<NotificationDTO>>('/v1/notifications?limit=50')
      .then(res => setNotifications(res.data ?? []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const visible = notifications.filter(n => {
    const kind = KIND_FILTER[tab];
    return kind === null || n.type === kind;
  });

  const newCount = notifications.length;

  return (
    <Layout>
      <div style={{ padding: '16px 22px 6px' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>
          알림
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: ACCENT, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {newCount > 0 ? `${newCount} new · 최근` : '새 알림 없음'}
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

      {loading && (
        <div style={{ padding: '40px 22px', textAlign: 'center', color: 'var(--mute)', fontSize: 13 }}>
          불러오는 중…
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        {!loading && visible.map(n => (
          <div
            key={n.id}
            style={{
              display: 'flex', gap: 14, padding: '14px 22px',
              borderBottom: '1px solid var(--line-soft)',
              background: 'transparent',
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: '#999',
            }}>
              {n.type === 'like' ? '♥' : n.type === 'comment' ? '💬' : '👤'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: '#1f1f1f' }}>
                {n.content}
              </div>
              <div style={{ marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{
                  width: 6, height: 6, borderRadius: 999,
                  background: DOT_COLOR[n.type] || ACCENT,
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 10, color: 'var(--mute)' }}>{timeAgo(n.created_at)}</span>
              </div>
            </div>
            {n.type === 'follow' ? (
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

        {!loading && visible.length === 0 && (
          <div style={{ padding: '60px 22px', textAlign: 'center', color: 'var(--mute)', fontSize: 13 }}>
            알림이 없습니다.
          </div>
        )}
      </div>
    </Layout>
  );
}
