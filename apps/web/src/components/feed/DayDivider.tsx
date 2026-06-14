const ACCENT = '#6a7040';

export default function DayDivider({ when }: { when: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 22px 8px' }}>
      <span style={{
        fontFamily: 'var(--serif)', fontSize: 11, fontWeight: 500,
        color: ACCENT, letterSpacing: '0.18em', textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>{when}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
    </div>
  );
}
