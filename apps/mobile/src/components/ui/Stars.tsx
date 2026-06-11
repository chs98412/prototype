import { View, StyleSheet } from 'react-native';
import { StarIcon } from './Icons';

type StarsProps = {
  value?: number;
  size?: number;
  color?: string;
};

export default function Stars({ value = 0, size = 12, color = '#1f1f1f' }: StarsProps) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map(i => (
        <StarIcon key={i} size={size} color={color} filled={i <= value} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 1,
  },
});
