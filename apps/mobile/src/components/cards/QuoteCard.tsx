import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { QuoteItem, MOVIE_BY_ID } from '@/lib/data';
import { Colors } from '@/lib/design';
import TypeBadge from '@/components/ui/TypeBadge';
import { HeartIcon, BookmarkIcon } from '@/components/ui/Icons';

type QuoteCardProps = {
  item: QuoteItem;
  accent?: string;
};

export default function QuoteCard({ item, accent = Colors.olive }: QuoteCardProps) {
  const movie = MOVIE_BY_ID[item.movieId];

  return (
    <Pressable
      onPress={() => router.push(`/post/quote/${item.id}`)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <TypeBadge label="인용" accent={accent} />
      <View style={[styles.quoteBox, { borderTopColor: accent, borderBottomColor: accent }]}>
        <Text style={[styles.quoteText, { }]}>
          <Text style={[styles.quoteMark, { color: accent }]}>"</Text>
          {item.text}
          <Text style={[styles.quoteMark, { color: accent }]}>"</Text>
        </Text>
        <View style={styles.citeRow}>
          <Pressable onPress={() => router.push(`/movie/${movie.id}`)}>
            <Text style={[styles.cite, { color: accent }]}>{item.cite}</Text>
          </Pressable>
          <Text style={styles.source}> · {item.source}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <View style={styles.actionItem}>
          <HeartIcon size={14} />
          <Text style={styles.actionCount}>{item.likes}</Text>
        </View>
        <BookmarkIcon size={14} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
    backgroundColor: 'transparent',
  },
  pressed: { opacity: 0.85 },
  quoteBox: {
    marginTop: 10,
    backgroundColor: Colors.bgWarm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    padding: 18,
    minHeight: 130,
    justifyContent: 'center',
  },
  quoteText: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 26,
    color: '#1f1f1f',
    textAlign: 'center',
  },
  quoteMark: {
    fontSize: 22,
  },
  citeRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  cite: {
    fontSize: 10,
    letterSpacing: 0.8,
    textDecorationLine: 'underline',
  },
  source: {
    fontSize: 10,
    color: Colors.mute,
  },
  actions: {
    marginTop: 12,
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
