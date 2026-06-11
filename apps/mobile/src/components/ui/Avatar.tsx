import { View, Image, StyleSheet } from 'react-native';
import { Images } from '@/lib/images';
import { Colors } from '@/lib/design';

type AvatarProps = {
  size?: number;
  ring?: boolean;
};

export default function Avatar({ size = 36, ring = false }: AvatarProps) {
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        ring && styles.ring,
      ]}
    >
      <Image
        source={Images.profile}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    backgroundColor: '#ddd',
    flexShrink: 0,
  },
  ring: {
    borderWidth: 2,
    borderColor: Colors.olive,
  },
});
