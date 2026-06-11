import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Essay } from '@/lib/data';
import { MOVIE_BY_ID } from '@/lib/data';
import { Colors } from '@/lib/design';
import Poster from '@/components/ui/Poster';
import TypeBadge from '@/components/ui/TypeBadge';
import { HeartIcon, CommentIcon } from '@/components/ui/Icons';

type EssayCardProps = {
  essay: Essay;
  accent?: string;
  divider?: boolean;
};

export default function EssayCard({ essay, accent = Colors.olive, divider = true }: EssayCardProps) {
  const movie = MOVIE_BY_ID[essay.movieId];

  return (
    <Pressable
      onPress={() => router.push(`/essay/${essay.id}`)}
      style={({ pressed }) => [styles.container, divider && styles.border, pressed && styles.pressed]}
    >
      <Pressable onPress={() => router.push(`/movie/${movie.id}`)}>
        <Poster imageKey={movie.poster} width={130} height={180} />
      </Pressable>

      <View style={styles.right}>
        <TypeBadge label="에세이" accent={accent} />
        <Text style={styles.title}>{essay.title}</Text>
        <Text style={[styles.meta, { color: accent }]}>{essay.author} · {essay.date}</Text>

        <View style={styles.excerptWrapper}>
          {essay.private ? (
            <View style={styles.lockedOverlay}>
              <Text style={styles.lockedText}>· 잠긴 글 · 미리보기</Text>
            </View>
          ) : (
            <Text style={styles.excerpt} numberOfLines={3}>{essay.excerpt}</Text>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.actions}>
            <View style={styles.actionItem}>
              <HeartIcon size={14} />
              <Text style={styles.actionCount}>{essay.likes}</Text>
            </View>
            <View style={styles.actionItem}>
              <CommentIcon size={14} />
              <Text style={styles.actionCount}>{essay.comments}</Text>
            </View>
          </View>
          <Text style={styles.movieTitle}>{movie.title}</Text>
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
    backgroundColor: 'transparent',
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
  },
  pressed: {
    opacity: 0.85,
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
    lineHeight: 22,
    letterSpacing: -0.2,
    color: '#000',
  },
  meta: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  excerptWrapper: {
    marginTop: 12,
    minHeight: 58,
  },
  excerpt: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 12.5,
    lineHeight: 20,
    color: '#222',
  },
  lockedOverlay: {
    backgroundColor: 'rgba(106,112,64,0.18)',
    flex: 1,
    minHeight: 58,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: Colors.olive,
    textTransform: 'uppercase',
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
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
    color: '#1f1f1f',
  },
  movieTitle: {
    fontSize: 9.5,
    color: Colors.mute,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
