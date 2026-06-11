import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LogItem, MOVIE_BY_ID } from '@/lib/data';
import { Colors } from '@/lib/design';
import Poster from '@/components/ui/Poster';
import TypeBadge from '@/components/ui/TypeBadge';
import Stars from '@/components/ui/Stars';
import Avatar from '@/components/ui/Avatar';

type LogCardProps = {
  item: LogItem;
  accent?: string;
};

export default function LogCard({ item, accent = Colors.olive }: LogCardProps) {
  const movie = MOVIE_BY_ID[item.movieId];

  return (
    <Pressable
      onPress={() => router.push(`/post/log/${item.id}`)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <Pressable onPress={() => router.push(`/movie/${movie.id}`)}>
        <Poster imageKey={movie.poster} width={130} height={180} />
      </Pressable>

      <View style={styles.right}>
        <TypeBadge label="로그" accent={accent} />

        <View style={styles.authorRow}>
          <Avatar size={22} />
          <Text style={styles.authorText}>
            <Text style={styles.authorName}>{item.author}</Text>
            <Text style={styles.authorSuffix}> 님이 보았어요</Text>
          </Text>
        </View>

        <Text style={styles.movieTitle}>{movie.title}</Text>
        <Text style={[styles.movieMeta, { color: accent }]}>{movie.year} · {movie.director}</Text>

        <View style={styles.starsRow}>
          <Stars value={item.stars} size={14} />
        </View>

        <View style={styles.spacer} />
        <View style={styles.footer}>
          <Text style={styles.silence}>— 멘트 없이 기록됨</Text>
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
  right: {
    flex: 1,
    minWidth: 0,
  },
  authorRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorText: {
    fontSize: 11.5,
    color: '#1f1f1f',
    lineHeight: 16,
  },
  authorName: {
    fontWeight: '600',
  },
  authorSuffix: {
    color: '#666',
  },
  movieTitle: {
    marginTop: 14,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 19,
    fontWeight: '500',
    letterSpacing: -0.2,
    lineHeight: 25,
  },
  movieMeta: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  starsRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: { flex: 1 },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  silence: {
    fontSize: 10.5,
    color: Colors.mute,
    fontStyle: 'italic',
    fontFamily: 'NotoSerifKR_500Medium',
  },
  when: {
    fontSize: 10,
    color: Colors.mute,
  },
});
