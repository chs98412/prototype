import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ListItem } from '@/lib/data';
import { Images } from '@/lib/images';
import { Colors } from '@/lib/design';
import TypeBadge from '@/components/ui/TypeBadge';
import { HeartIcon } from '@/components/ui/Icons';
import { Image } from 'react-native';

type ListCardProps = {
  item: ListItem;
  accent?: string;
};

export default function ListCard({ item, accent = Colors.olive }: ListCardProps) {
  return (
    <Pressable
      onPress={() => router.push(`/post/list/${item.id}`)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      {/* 3-poster stacked collage */}
      <View style={styles.collage}>
        {item.covers.slice(0, 3).map((key, i) => {
          const source = Images[key];
          return source ? (
            <Image
              key={i}
              source={source}
              style={[styles.collageItem, { left: i * 16, top: i * 10, zIndex: 3 - i }]}
              resizeMode="cover"
            />
          ) : (
            <View key={i} style={[styles.collageItem, styles.collagePlaceholder, { left: i * 16, top: i * 10, zIndex: 3 - i }]} />
          );
        })}
      </View>

      <View style={styles.right}>
        <TypeBadge label="컬렉션" accent={accent} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={[styles.meta, { color: accent }]}>{item.author} · 영화 {item.count}편</Text>
        <Text style={styles.desc} numberOfLines={3}>눈이 오는 날, 다시 꺼내어 보고 싶은 영화들의 모음.</Text>
        <View style={styles.footer}>
          <View style={styles.actionItem}>
            <HeartIcon size={14} />
            <Text style={styles.actionCount}>{item.likes}</Text>
          </View>
          <Text style={styles.when}>{item.when}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
    backgroundColor: 'transparent',
  },
  pressed: { opacity: 0.85 },
  collage: {
    width: 130,
    height: 180,
    flexShrink: 0,
    position: 'relative',
  },
  collageItem: {
    position: 'absolute',
    width: 96,
    height: 134,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#fff',
  },
  collagePlaceholder: {
    backgroundColor: '#eee',
  },
  right: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    marginTop: 6,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
    lineHeight: 21,
  },
  meta: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  desc: {
    marginTop: 10,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 12.5,
    lineHeight: 20,
    color: '#222',
    flex: 1,
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 10,
    fontWeight: '500',
  },
  when: {
    fontSize: 9.5,
    color: Colors.mute,
    letterSpacing: 0.6,
  },
});
