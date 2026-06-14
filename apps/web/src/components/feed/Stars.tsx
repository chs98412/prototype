import { StarIcon } from '../ui/Icons';

type Props = { value: number; size?: number; accent?: string };

export default function Stars({ value, size = 12, accent = '#1f1f1f' }: Props) {
  return (
    <span style={{ display: 'inline-flex', gap: 1.5 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <StarIcon key={i} size={size} filled={i <= value} stroke={accent} strokeWidth={1.4} />
      ))}
    </span>
  );
}
