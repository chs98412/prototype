import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { SearchIcon, PlusIcon } from '../components/ui/Icons';
import { api } from '../lib/api';
import type { TmdbSearchResult, TmdbSearchResponse } from '../lib/apiTypes';

const ACCENT = '#6a7040';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w185';
const RECENT = ['스즈메의 문단속', '30일', '에에올', '괴물'];

export default function SearchPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); return; }

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      api.get<TmdbSearchResponse>(`/v1/movies/search?q=${encodeURIComponent(q)}`)
        .then(res => setResults(res.results ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 350);
  }, [q]);

  return (
    <Layout>
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 999,
          background: 'rgb(231,231,231)',
          border: '0.5px solid rgba(0,0,0,0.04)',
        }}>
          <SearchIcon size={18} stroke="#666" strokeWidth={1.8} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="영화, 평론가, 키워드"
            style={{
              flex: 1, border: 0, outline: 'none', background: 'transparent',
              fontSize: 13, fontFamily: 'var(--sans)', color: '#1f1f1f',
            }}
          />
          {q && (
            <button onClick={() => setQ('')} style={{
              background: 'rgba(0,0,0,0.15)', border: 0, color: '#fff',
              width: 18, height: 18, borderRadius: 999, cursor: 'pointer',
              fontSize: 11, lineHeight: 1, display: 'grid', placeItems: 'center',
            }}>×</button>
          )}
        </div>

        {!q && (
          <div style={{ marginTop: 24 }}>
            <div style={{
              fontSize: 11, color: '#666', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12,
            }}>최근 검색</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {RECENT.map(r => (
                <button key={r} onClick={() => setQ(r)} style={{
                  border: '0.5px solid var(--line-soft)', background: '#fff',
                  color: '#1f1f1f', padding: '7px 14px', borderRadius: 999,
                  fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sans)',
                }}>{r}</button>
              ))}
            </div>
          </div>
        )}

        {!q && (
          <div style={{ marginTop: 32 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em' }}>
              이번 주 추천
            </div>
            <div style={{ marginTop: 4, fontSize: 11, color: ACCENT, letterSpacing: '0.06em' }}>
              에디터의 픽 · 검색어를 입력하세요
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 22 }}>
        {loading && (
          <div style={{ padding: '40px 22px', textAlign: 'center', color: 'var(--mute)', fontSize: 13 }}>
            검색 중…
          </div>
        )}

        {!loading && results.map((m, idx) => (
          <button key={m.id} onClick={() => navigate(`/movie/${m.id}`)} style={{
            display: 'flex', gap: 18, alignItems: 'center',
            padding: '16px 22px', width: '100%',
            background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left',
            borderBottom: idx < results.length - 1 ? '1px solid var(--line-soft)' : 'none',
          }}>
            <div style={{
              width: 70, height: 94, borderRadius: 3, flexShrink: 0,
              background: m.poster_path
                ? `url(${TMDB_IMG}${m.poster_path}) center / cover no-repeat #eee`
                : '#eee',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em' }}>
                {m.title}
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: ACCENT, lineHeight: 1.55, fontWeight: 500 }}>
                {m.release_date?.slice(0, 4)}
                {m.vote_average > 0 && ` · ★ ${m.vote_average.toFixed(1)}`}
              </div>
            </div>
            <PlusIcon size={18} stroke="#9a9a9a" strokeWidth={1.8} />
          </button>
        ))}

        {!loading && q && results.length === 0 && (
          <div style={{ padding: '60px 22px', textAlign: 'center', color: 'var(--mute)', fontSize: 13 }}>
            결과가 없습니다.
          </div>
        )}
      </div>
    </Layout>
  );
}
