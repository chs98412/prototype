import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/lib/design';

type SectionLabelProps = {
  children: string;
};

export default function SectionLabel({ children }: SectionLabelProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.text}>{children}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: '#666',
    textTransform: 'uppercase',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.lineSoft,
  },
});
