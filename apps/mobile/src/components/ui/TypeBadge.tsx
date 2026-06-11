import { Text } from 'react-native';
import { Colors } from '@/lib/design';

type TypeBadgeProps = {
  label: string;
  accent?: string;
};

export default function TypeBadge({ label, accent = Colors.olive }: TypeBadgeProps) {
  return (
    <Text
      style={{
        fontSize: 9,
        fontWeight: '600',
        letterSpacing: 1.8,
        color: accent,
        textTransform: 'uppercase',
      }}
    >
      · {label}
    </Text>
  );
}
