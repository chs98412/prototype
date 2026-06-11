import { Text, View, StyleSheet, ViewStyle } from 'react-native';

type PillProps = {
  children: string;
  dark?: boolean;
  style?: ViewStyle;
};

export default function Pill({ children, dark = false, style }: PillProps) {
  return (
    <View style={[styles.base, dark ? styles.dark : styles.light, style]}>
      <Text style={[styles.text, dark ? styles.darkText : styles.lightText]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 0.5,
    alignSelf: 'flex-start',
  },
  dark: {
    backgroundColor: '#1f1f1f',
    borderColor: '#1f1f1f',
  },
  light: {
    backgroundColor: '#fff',
    borderColor: '#ededed',
  },
  text: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
  },
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#1f1f1f',
  },
});
