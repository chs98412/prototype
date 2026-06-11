import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/lib/design';

type DayDividerProps = {
  when: string;
  accent?: string;
};

export default function DayDivider({ when, accent = Colors.olive }: DayDividerProps) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: accent }]}>{when}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 8,
  },
  label: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.lineSoft,
  },
});
