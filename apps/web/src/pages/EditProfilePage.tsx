import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { ME } from '../lib/data';
import { BackIcon } from '../components/ui/Icons';

const ACCENT = '#6a7040';
const BTN: React.CSSProperties = { background: 'none', border: 0, padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center' };
const INPUT: React.CSSProperties = {
  width: '100%', border: 0, outline: 'none', background: 'transparent',
  fontSize: 13, padding: '8px 0',
  borderBottom: '1px solid var(--line-soft)',
  fontFamily: 'var(--sans)', color: '#1f1f1f',
  boxSizing: 'border-box',
};
const EDIT_BTN: React.CSSProperties = {
  background: '#fff', border: '0.5px solid var(--line-soft)',
  boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
  borderRadius: 4, padding: '7px 16px',
  fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2, fontWeight: 600 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: ME.name,
    handle: ME.handle,
    bio: ME.bio,
    listName: '내가 뭘 봤게?',
    lineTag: '영화를 존나게 좋아합니다 진짜루요',
  });
  const set = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

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
        <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600 }}>프로필 편집</span>
        <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 0, color: ACCENT, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          완료
        </button>
      </div>

      {/* Avatar */}
      <div style={{ padding: '22px 22px 0', textAlign: 'center' }}>
        <div style={{
          width: 150, height: 200, margin: '0 auto', borderRadius: 5, position: 'relative',
          background: `url(${ME.avatar}) center / cover no-repeat`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 5,
            background: 'linear-gradient(180deg, transparent 70%, rgba(0,0,0,0.45) 100%)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
          <button style={EDIT_BTN}>사진 선택</button>
          <button style={EDIT_BTN}>사진 삭제</button>
        </div>
      </div>

      {/* Fields */}
      <div style={{ padding: '30px 22px 20px' }}>
        {([
          ['별명', 'name'],
          ['이름', 'handle'],
          ['한 줄 설명', 'lineTag'],
          ['목록 이름', 'listName'],
        ] as [string, keyof typeof form][]).map(([label, k]) => (
          <Field key={k} label={label}>
            <input value={form[k]} onChange={e => set(k, e.target.value)} style={INPUT} />
          </Field>
        ))}
        <Field label="소개">
          <textarea
            value={form.bio}
            onChange={e => set('bio', e.target.value)}
            rows={3}
            style={{ ...INPUT, resize: 'none', fontFamily: 'var(--serif)' } as React.CSSProperties}
          />
        </Field>
      </div>
    </Layout>
  );
}
