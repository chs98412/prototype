import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { ESSAY_BY_ID, MOVIE_BY_ID, ME } from '../lib/data';
import { HeartIcon, CommentIcon, BookmarkIcon, EllipsisIcon, BackIcon } from '../components/ui/Icons';

const ACCENT = '#6a7040';
const BTN: React.CSSProperties = { background: 'none', border: 0, padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center' };

export default function EssayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const essay = (id && ESSAY_BY_ID[id]) || Object.values(ESSAY_BY_ID)[0];
  const movie = MOVIE_BY_ID[essay.movieId];
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <Layout>
      {/* Sub-header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid var(--line-soft)',
        position: 'sticky', top: 0, background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)', zIndex: 10,
      }}>
        <button onClick={() => navigate(-1)} style={BTN}><BackIcon /></button>
        <button style={BTN}><EllipsisIcon /></button>
      </div>

      <div style={{ padding: '16px 22px 0' }}>
        {/* Poster + title */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          <div
            onClick={() => navigate(`/movie/${movie.id}`)}
            style={{
              width: 140, height: 195, borderRadius: 5, flexShrink: 0, cursor: 'pointer',
              background: `url(${movie.poster}) center / cover no-repeat #eee`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          />
          <div style={{ flex: 1, paddingTop: 4 }}>
            <div style={{
              fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.3,
              fontWeight: 500, letterSpacing: '-0.01em',
            }}>{essay.title}</div>
            <div style={{ marginTop: 18, textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 500 }}>{essay.author}</div>
              <div style={{ marginTop: 2, fontSize: 10, color: ACCENT, letterSpacing: '0.06em' }}>{essay.date}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', gap: 16, marginTop: 14,
          paddingBottom: 18, borderBottom: '1px solid var(--line-soft)',
          alignItems: 'center',
        }}>
          <button onClick={() => setLiked(!liked)} style={BTN}>
            <HeartIcon filled={liked} stroke={liked ? '#c44' : '#1f1f1f'} />
          </button>
          <button style={BTN}><CommentIcon /></button>
          <button onClick={() => setSaved(!saved)} style={BTN}>
            <BookmarkIcon filled={saved} />
          </button>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: 'var(--mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {liked ? essay.likes + 1 : essay.likes} likes · {essay.comments} comments
          </span>
        </div>

        {/* Body */}
        <div style={{ paddingTop: 22 }}>
          {essay.body.map((p, i) => (
            <p key={i} style={{
              margin: '0 0 18px', fontFamily: 'var(--serif)', fontSize: 13.5,
              lineHeight: 1.85, color: '#1f1f1f', wordBreak: 'keep-all',
            }}>{p}</p>
          ))}

          {essay.inlineImage && (
            <figure style={{ margin: '26px 0 22px' }}>
              <div style={{
                width: '100%', aspectRatio: '16/9',
                background: `url(${essay.inlineImage}) center / cover no-repeat #ddd`,
                borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              }} />
              <figcaption style={{ marginTop: 8, fontSize: 10, color: 'var(--mute)', letterSpacing: '0.04em', textAlign: 'center' }}>
                still from {movie.title} · {movie.director}
              </figcaption>
            </figure>
          )}

          <div style={{ margin: '30px 0 20px', textAlign: 'center', fontFamily: 'var(--serif)', fontSize: 18 }}>※</div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
            {essay.tags.map(t => (
              <span key={t} style={{
                fontSize: 10, color: ACCENT, border: `0.5px solid ${ACCENT}`,
                padding: '3px 9px', borderRadius: 999, letterSpacing: '0.04em',
              }}>#{t}</span>
            ))}
          </div>
        </div>

        {/* Author card */}
        <div style={{
          display: 'flex', gap: 12, alignItems: 'center',
          padding: '14px 0', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)',
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
            background: `url(${ME.avatar}) center / cover no-repeat #ddd`,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 500 }}>{essay.author}</div>
            <div style={{ fontSize: 10, color: 'var(--mute)', marginTop: 2 }}>비평 24 · 에세이 41 · 팔로워 312</div>
          </div>
          <button style={{
            border: `0.5px solid ${ACCENT}`, background: 'transparent', color: ACCENT,
            padding: '6px 14px', borderRadius: 999, fontSize: 11, fontWeight: 500, cursor: 'pointer',
          }}>팔로우</button>
        </div>

        {/* Comments */}
        <div style={{ marginTop: 22, paddingBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#666' }}>
            코멘트 · {essay.comments}
          </div>
          {[
            { who: '최혁순', body: '한 문장 한 문장 곱씹어서 다 읽었어요.', when: '6h' },
            { who: '지윤',   body: '필름 시대 사랑의 띠지라니, 너무 좋네요.', when: '1d' },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: `url(${ME.avatar}) center / cover no-repeat #ddd`,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{c.who}</span>
                  <span style={{ fontSize: 9.5, color: 'var(--mute)' }}>{c.when}</span>
                </div>
                <div style={{ marginTop: 3, fontSize: 12, lineHeight: 1.5, fontFamily: 'var(--serif)' }}>{c.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
