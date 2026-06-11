import { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { FEED_ITEMS, MOVIE_BY_ID, ESSAY_BY_ID } from '@/lib/data';
import { Images } from '@/lib/images';
import { Colors } from '@/lib/design';
import SubHeader from '@/components/ui/SubHeader';
import Poster from '@/components/ui/Poster';
import Avatar from '@/components/ui/Avatar';
import Stars from '@/components/ui/Stars';
import { HeartIcon, CommentIcon, BookmarkIcon, EllipsisIcon } from '@/components/ui/Icons';
import type { RatingItem, LogItem, QuoteItem, ListItem } from '@/lib/data';

const ACCENT = Colors.olive;

export default function PostScreen() {
  const { kind, id } = useLocalSearchParams<{ kind: string; id: string }>();

  if (kind === 'essay') {
    router.replace(`/essay/${id}`);
    return null;
  }

  const item = FEED_ITEMS.find(x => x.kind !== 'day' && x.kind !== 'essay' && (x as { id: string }).id === id);

  if (kind === 'rating' && item?.kind === 'rating') {
    return <RatingDetailScreen item={item} />;
  }
  if (kind === 'log' && item?.kind === 'log') {
    return <LogDetailScreen item={item} />;
  }
  if (kind === 'quote' && item?.kind === 'quote') {
    return <QuoteDetailScreen item={item} />;
  }
  if (kind === 'list' && item?.kind === 'list') {
    return <ListDetailScreen item={item} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <SubHeader />
    </SafeAreaView>
  );
}

function RatingDetailScreen({ item }: { item: RatingItem }) {
  const movie = MOVIE_BY_ID[item.movieId]!;
  const [liked, setLiked] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SubHeader title="한줄평" trailing={<Pressable hitSlop={8}><EllipsisIcon /></Pressable>} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.centerContent}>
          <Poster imageKey={movie.poster} width={170} height={236} style={styles.mainPoster} />
          <Pressable onPress={() => router.push(`/movie/${movie.id}`)}>
            <Text style={styles.movieTitle}>{movie.title}</Text>
          </Pressable>
          <Text style={[styles.movieMeta, { color: ACCENT }]}>{movie.year} · {movie.genre} · {movie.director}</Text>
          <View style={styles.bigStars}>
            <Stars value={item.stars} size={28} />
          </View>
          <Text style={[styles.starsSub, { color: ACCENT }]}>{item.stars}.0 · 다섯 별 중에서</Text>
          <Text style={styles.blurb}>{item.blurb}</Text>
          <Text style={styles.endMark}>※</Text>
        </View>

        <View style={styles.authorRow}>
          <Avatar size={38} />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{item.author}</Text>
            <Text style={styles.authorWhen}>{item.when}</Text>
          </View>
          <Pressable onPress={() => setLiked(!liked)} style={styles.iconBtn}>
            <HeartIcon filled={liked} color={liked ? '#c44444' : '#1f1f1f'} />
          </Pressable>
          <Pressable style={styles.iconBtn}><CommentIcon /></Pressable>
          <Pressable style={styles.iconBtn}><BookmarkIcon /></Pressable>
        </View>
        <Text style={styles.likeMeta}>
          {liked ? item.likes + 1 : item.likes} likes{item.comments != null ? ` · ${item.comments} comments` : ''}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function LogDetailScreen({ item }: { item: LogItem }) {
  const movie = MOVIE_BY_ID[item.movieId]!;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SubHeader title="로그" trailing={<Pressable hitSlop={8}><EllipsisIcon /></Pressable>} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.centerContent, { paddingTop: 30 }]}>
          <Poster imageKey={movie.poster} width={210} height={290} style={styles.bigPoster} />
          <Pressable onPress={() => router.push(`/movie/${movie.id}`)}>
            <Text style={styles.movieTitle}>{movie.title}</Text>
          </Pressable>
          <Text style={[styles.movieMeta, { color: ACCENT }]}>{movie.year} · {movie.director}</Text>
          <View style={styles.bigStars}>
            <Stars value={item.stars} size={24} />
          </View>
          <Text style={styles.logAuthor}>
            <Text style={{ fontWeight: '500', color: '#1f1f1f' }}>{item.author}</Text>
            <Text style={{ color: '#666' }}> · {item.when}</Text>
          </Text>
          <View style={{ height: 60 }} />
          <Text style={styles.logSilence}>— 멘트 없이 기록됨</Text>
        </View>

        <View style={styles.logActions}>
          <Pressable style={styles.iconBtn}><HeartIcon /></Pressable>
          <Pressable style={styles.iconBtn}><BookmarkIcon /></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuoteDetailScreen({ item }: { item: QuoteItem }) {
  const movie = MOVIE_BY_ID[item.movieId]!;
  const backdropSrc = Images[movie.backdrop ?? movie.poster];

  return (
    <View style={[styles.safe, { backgroundColor: '#000' }]}>
      <View style={styles.quoteBackdrop}>
        {backdropSrc && (
          <Image source={backdropSrc} style={[StyleSheet.absoluteFill, { opacity: 0.45 }]} resizeMode="cover" />
        )}
        <View style={styles.quoteGradient} />
      </View>

      <View style={styles.quoteFloatHeader}>
        <SubHeader transparent trailing={<Pressable hitSlop={8}><BookmarkIcon color="#fff" /></Pressable>} />
      </View>

      <View style={styles.quoteCenter}>
        <Text style={[styles.quoteBigMark, { color: ACCENT }]}>"</Text>
        <Text style={styles.quoteText}>{item.text}</Text>
        <Pressable onPress={() => router.push(`/movie/${movie.id}`)}>
          <Text style={styles.quoteCite}>{item.cite}</Text>
        </Pressable>
        <Text style={styles.quoteSource}>{item.source}</Text>
      </View>

      <View style={styles.quoteBottomBar}>
        <Pressable style={styles.iconBtn}>
          <HeartIcon stroke="#fff" color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 6, fontSize: 11 }}>{item.likes}</Text>
        </Pressable>
        <Pressable style={styles.iconBtn}><CommentIcon color="#fff" /></Pressable>
        <Pressable style={styles.iconBtn}><BookmarkIcon color="#fff" /></Pressable>
      </View>
    </View>
  );
}

function ListDetailScreen({ item }: { item: ListItem }) {
  const { MOVIES } = require('@/lib/data');
  const allPosters = [...item.covers, ...MOVIES.map((m: { poster: string }) => m.poster)].slice(0, item.count) as string[];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SubHeader title="컬렉션" trailing={<Pressable hitSlop={8}><EllipsisIcon /></Pressable>} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Collage hero */}
        <View style={styles.collageHero}>
          {item.covers.slice(0, 3).map((key, i) => {
            const src = Images[key];
            return src ? (
              <Image
                key={i}
                source={src}
                style={[
                  styles.collageImg,
                  {
                    left: 30 + i * 30,
                    top: i * 10,
                    zIndex: 3 - i,
                    transform: [{ rotate: `${(i - 1) * 4}deg` }],
                  },
                ]}
                resizeMode="cover"
              />
            ) : null;
          })}
        </View>

        <View style={styles.listContent}>
          <Text style={styles.listTitle}>{item.title}</Text>
          <Text style={[styles.listMeta, { color: ACCENT }]}>
            {item.author} · 영화 {item.count}편 · 좋아요 {item.likes}
          </Text>
          <Text style={styles.listDesc}>
            눈이 오는 날, 다시 꺼내어 보고 싶은 영화들의 모음. 천천히 다시 보면서 그 시간을 한 번 더 살아내는 것에 가까운 일들에 대해서.
          </Text>

          <View style={[styles.section, { marginTop: 28 }]}>
            <Text style={styles.sectionTitle}>이 컬렉션의 영화</Text>
            <View style={styles.filmGrid}>
              {allPosters.map((key, i) => {
                const src = Images[key];
                const movieMatch = MOVIES.find((m: { poster: string }) => m.poster === key);
                return (
                  <Pressable
                    key={i}
                    onPress={() => movieMatch && router.push(`/movie/${movieMatch.id}`)}
                    style={styles.filmGridItem}
                  >
                    {src ? (
                      <Image source={src} style={styles.filmGridImg} resizeMode="cover" />
                    ) : (
                      <View style={[styles.filmGridImg, { backgroundColor: '#eee' }]} />
                    )}
                    {movieMatch && (
                      <Text style={styles.filmGridTitle} numberOfLines={1}>{movieMatch.title}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.listActions}>
            <Pressable style={styles.iconBtn}><HeartIcon /></Pressable>
            <Pressable style={styles.iconBtn}><BookmarkIcon /></Pressable>
            <Pressable style={styles.iconBtn}><CommentIcon /></Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  centerContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
    alignItems: 'center',
  },
  mainPoster: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 8,
  },
  bigPoster: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 36,
    elevation: 10,
  },
  movieTitle: {
    marginTop: 18,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  movieMeta: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  bigStars: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 6,
  },
  starsSub: {
    marginTop: 8,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 13,
    letterSpacing: 0.4,
  },
  blurb: {
    marginTop: 32,
    maxWidth: 300,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 17,
    lineHeight: 29,
    color: '#1f1f1f',
    letterSpacing: -0.1,
    textAlign: 'center',
  },
  endMark: {
    marginTop: 24,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 18,
  },
  authorRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginHorizontal: 22,
    paddingVertical: 16,
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: Colors.lineSoft,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
  },
  authorInfo: { flex: 1 },
  authorName: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 14,
    fontWeight: '500',
  },
  authorWhen: { fontSize: 10, color: Colors.mute, marginTop: 2 },
  iconBtn: {
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeMeta: {
    marginHorizontal: 22,
    paddingVertical: 18,
    fontSize: 10,
    color: Colors.mute,
    letterSpacing: 0.8,
  },
  logAuthor: {
    marginTop: 30,
    fontSize: 12,
    fontFamily: 'NotoSerifKR_500Medium',
    textAlign: 'center',
  },
  logSilence: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 13,
    color: Colors.mute,
    fontStyle: 'italic',
    letterSpacing: 0.4,
  },
  logActions: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    marginHorizontal: 22,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.lineSoft,
  },
  quoteBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111',
  },
  quoteGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  quoteFloatHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  quoteCenter: {
    flex: 1,
    paddingHorizontal: 32,
    paddingBottom: 100,
    justifyContent: 'center',
  },
  quoteBigMark: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 60,
    lineHeight: 50,
    opacity: 0.9,
    marginBottom: 8,
  },
  quoteText: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 38,
    color: '#fff',
    letterSpacing: -0.2,
  },
  quoteCite: {
    marginTop: 24,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.8,
    textDecorationLine: 'underline',
  },
  quoteSource: {
    marginTop: 2,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.8,
  },
  quoteBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingHorizontal: 22,
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  collageHero: {
    height: 200,
    position: 'relative',
    overflow: 'visible',
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  collageImg: {
    position: 'absolute',
    width: 120,
    height: 168,
    borderRadius: 3,
    borderWidth: 3,
    borderColor: '#fff',
  },
  listContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 24,
    alignItems: 'center',
  },
  listTitle: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 24,
    fontWeight: '500',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  listMeta: {
    marginTop: 4,
    fontSize: 11,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  listDesc: {
    marginTop: 18,
    maxWidth: 300,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 13,
    lineHeight: 22,
    color: '#1f1f1f',
    textAlign: 'center',
  },
  section: { width: '100%' },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  filmGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filmGridItem: {
    width: '30%',
    alignItems: 'flex-start',
  },
  filmGridImg: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 3,
  },
  filmGridTitle: {
    marginTop: 5,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 10.5,
    fontWeight: '500',
    letterSpacing: -0.1,
    color: '#1f1f1f',
  },
  listActions: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    marginTop: 24,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.lineSoft,
    width: '100%',
  },
});
