import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { PencilIcon } from '../components/ui/Icons';
import DayDivider from '../components/feed/DayDivider';
import EssayCard from '../components/feed/EssayCard';
import RatingCard from '../components/feed/RatingCard';
import LogCard from '../components/feed/LogCard';
import QuoteCard from '../components/feed/QuoteCard';
import ListCard from '../components/feed/ListCard';
import { FEED_ITEMS, ESSAY_BY_ID } from '../lib/data';

const FILTERS = ['전체', '에세이', '한줄평', '로그', '인용', '컬렉션'] as const;
type Filter = typeof FILTERS[number];

const KIND_MAP: Record<string, Filter> = {
  essay: '에세이', rating: '한줄평', log: '로그', quote: '인용', list: '컬렉션',
};

export default function FeedPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('전체');

  const filtered = FEED_ITEMS.filter(item => {
    if (item.kind === 'day') return true;
    if (filter === '전체') return true;
    if (item.kind === 'essay') return filter === '에세이';
    return KIND_MAP[item.kind] === filter;
  });

  return (
    <Layout>
      <div>
        {/* Masthead */}
        <div style={{ padding: '24px 22px 6px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1 }}>
              피드
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: '#6a7040', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              essays · ratings · logs · 이번 주
            </div>
          </div>
          <button
            onClick={() => navigate('/editor')}
            style={{ background: 'none', border: 0, cursor: 'pointer', padding: 6 }}
          >
            <PencilIcon />
          </button>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, padding: '14px 22px', overflowX: 'auto' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flexShrink: 0, padding: '5px 12px', borderRadius: 999,
                fontSize: 11, fontWeight: 500, cursor: 'pointer',
                border: '0.5px solid',
                background: filter === f ? '#1f1f1f' : '#fff',
                color: filter === f ? '#fff' : '#1f1f1f',
                borderColor: filter === f ? '#1f1f1f' : 'var(--line-soft)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.12s',
              }}
            >{f}</button>
          ))}
        </div>

        {/* Feed */}
        <div>
          {filtered.map((item, i) => {
            if (item.kind === 'day') return <DayDivider key={i} when={item.when} />;
            if (item.kind === 'essay') {
              const essay = ESSAY_BY_ID[item.essayId];
              return essay ? <EssayCard key={i} essay={essay} /> : null;
            }
            if (item.kind === 'rating') return <RatingCard key={i} item={item} />;
            if (item.kind === 'log')    return <LogCard    key={i} item={item} />;
            if (item.kind === 'quote')  return <QuoteCard  key={i} item={item} />;
            if (item.kind === 'list')   return <ListCard   key={i} item={item} />;
            return null;
          })}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 20, padding: '30px 22px 40px',
          textAlign: 'center', borderTop: '1px solid var(--line-soft)',
        }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 400, letterSpacing: '0.2em' }}>
            L O G G E D
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: 'var(--mute)' }}>vol. 014 · 평론 매거진</div>
        </div>
      </div>
    </Layout>
  );
}
