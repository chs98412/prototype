import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { RatingItem, MOVIE_BY_ID } from '@/lib/data';
import { Colors } from '@/lib/design';
import Poster from '@/components/ui/Poster';
import TypeBadge from '@/components/ui/TypeBadge';
import Stars from '@/components/ui/Stars';
import { HeartIcon, CommentIcon } from '@/components/ui/Icons';

type RatingCardProps = {
  item: RatingItem;
  accent?: string;
};

export default function RatingCard({ item, accent = Colors.olive }: RatingCardProps) {
  const movie = MOVIE_BY_ID[item.movieId];

  return (
    <Pressable
      onPress={() => router.push(`/post/rating/${item.id}`)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <Pressable onPress={() => router.push(`/movie/${movie.id}`)}>
        <Poster imageKey={movie.poster} width={130} height={180} />
      </Pressable>

      <View style={styles.right}>
        <TypeBadge label="한줄평" accent={accent} />
        <Text style={styles.title}>{movie.title}</Text>
        <View style={styles.starsRow}>
          <Stars value={item.stars} size={13} color={accent} />
          <Text style={[styles.starsLabel, { color: accent }]}>{item.stars}.0</Text>
        </View>
        <Text style={[styles.meta, { color: accent }]}>{item.author} · {item.when}</Text>
        <Text style={styles.blurb} numberOfLines={3}>{item.blurb}</Text>

        <View style={styles.actions}>
          <View style={styles.actionItem}>
            <HeartIcon size={14} />
            <Text style={styles.actionCount}>{item.likes}</Text>
          </View>
          {item.comments != null && (
            <View style={styles.actionItem}>
              <CommentIcon size={14} />
              <Text style={styles.actionCount}>{item.comments}</Text>
            </View>
          )}
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
  starsRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  meta: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  blurb: {
    marginTop: 10,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 12.5,
    lineHeight: 20,
    color: '#222',
    flex: 1,
  },
  actions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 14,
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
});
