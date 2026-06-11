import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { BackIcon } from './Icons';

type SubHeaderProps = {
  title?: string;
  trailing?: React.ReactNode;
  transparent?: boolean;
  onBack?: () => void;
};

export default function SubHeader({ title, trailing, transparent = false, onBack }: SubHeaderProps) {
  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={[styles.container, transparent && styles.transparent]}>
      <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={8}>
        <BackIcon color={transparent ? '#fff' : '#1f1f1f'} />
      </Pressable>
      {title ? (
        <Text style={[styles.title, transparent && styles.titleDark]}>{title}</Text>
      ) : null}
      <View style={styles.trailing}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  titleDark: {
    color: '#fff',
  },
  trailing: {
    width: 32,
    alignItems: 'flex-end',
  },
});
