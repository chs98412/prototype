import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { Images } from '@/lib/images';

type PosterProps = {
  imageKey: string;
  width?: number;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

export default function Poster({ imageKey, width = 150, height = 200, radius = 5, style }: PosterProps) {
  const source = Images[imageKey];
  return (
    <View style={[styles.container, { width, height, borderRadius: radius }, style]}>
      {source ? (
        <Image
          source={source}
          style={{ width, height, borderRadius: radius }}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.placeholder, { width, height, borderRadius: radius }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    flexShrink: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholder: {
    backgroundColor: '#eee',
  },
});
