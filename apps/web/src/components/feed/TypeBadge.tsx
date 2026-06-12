const ACCENT = '#6a7040';

export default function TypeBadge({ label }: { label: string }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 600, letterSpacing: '0.2em',
      color: ACCENT, textTransform: 'uppercase',
    }}>· {label}</span>
  );
}
