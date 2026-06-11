import { ScrollView, View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MOVIE_BY_ID, ESSAYS } from '@/lib/data';
import { Images } from '@/lib/images';
import { Colors } from '@/lib/design';
import SubHeader from '@/components/ui/SubHeader';
import Poster from '@/components/ui/Poster';
import Stars from '@/components/ui/Stars';
import SectionLabel from '@/components/ui/SectionLabel';
import { BookmarkIcon } from '@/components/ui/Icons';

const ACCENT = Colors.olive;

const SYNOPSIS: Record<string, string> = {
  monster: '어느 날 밤, 학교에서 일어난 작은 사건이 한 어머니와 교사, 그리고 두 아이의 세계를 차례로 흔든다. 세 개의 시점이 겹쳐지며 \'누가 괴물인가\'라는 질문은 점점 거울처럼 관객을 향한다.',
};

export default function MovieScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const movie = MOVIE_BY_ID[id] ?? MOVIE_BY_ID['monster']!;
  const movieEssays = ESSAYS.filter(e => e.movieId === movie.id);

  const backdropKey = movie.backdrop ?? movie.poster;
  const backdropSrc = Images[backdropKey];
  const synopsis = SYNOPSIS[movie.id] ?? '영화와 함께 남겨진 이야기들. 평론과 함께 영화를 천천히 읽어내려 갑니다.';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Backdrop */}
        <View style={styles.backdrop}>
          {backdropSrc && (
            <Image source={backdropSrc} style={StyleSheet.absoluteFill} resizeMode="cover" />
          )}
          <View style={styles.backdropGradient} />
        </View>

        {/* Floating header */}
        <View style={styles.floatingHeader}>
          <SubHeader
            transparent
            trailing={
              <Pressable hitSlop={8}>
                <BookmarkIcon color="#fff" />
              </Pressable>
            }
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Poster centered */}
          <View style={styles.posterCenter}>
            <Poster
              imageKey={movie.poster}
              width={186}
              height={264}
              radius={2}
              style={styles.mainPoster}
            />
          </View>

          {/* Title block */}
          <View style={styles.titleBlock}>
            <Text style={styles.movieTitle}>{movie.title}</Text>
            <Text style={[styles.movieMeta, { color: ACCENT }]}>
              {movie.year} · {movie.genre} · {movie.country}
            </Text>
            <Text style={[styles.movieMeta, { color: ACCENT }]}>
              {movie.runtime} · {movie.rating} · {movie.director}
            </Text>

            <View style={styles.starsRow}>
              <Stars value={4} size={20} />
            </View>
            <Text style={styles.ratingMeta}>4.1 · {movieEssays.length} 평론</Text>
          </View>

          {/* CTAs */}
          <View style={styles.ctaRow}>
            <Pressable
              onPress={() => router.push('/editor')}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>평론 쓰러가기</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>보기 목록</Text>
            </Pressable>
          </View>

          {/* Synopsis */}
          <View style={styles.section}>
            <SectionLabel>시놉시스</SectionLabel>
            <Text style={styles.synopsis}>{synopsis}</Text>
          </View>

          {/* Essays */}
          <View style={[styles.section, styles.essaySection]}>
            <SectionLabel>이 영화의 평론</SectionLabel>
            {(movieEssays.length ? movieEssays : ESSAYS.slice(0, 2)).map(e => (
              <Pressable
                key={e.id}
                onPress={() => router.push(`/essay/${e.id}`)}
                style={styles.essayItem}
              >
                <Text style={styles.essayTitle}>{e.title}</Text>
                <Text style={styles.essayExcerpt} numberOfLines={2}>{e.excerpt}</Text>
                <Text style={[styles.essayMeta, { color: ACCENT }]}>
                  {e.author} · {e.date} · 좋아요 {e.likes}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  backdrop: {
    height: 320,
    backgroundColor: '#222',
    position: 'relative',
  },
  backdropGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  floatingHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  content: {
    marginTop: -190,
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  posterCenter: {
    alignItems: 'center',
  },
  mainPoster: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 10,
  },
  titleBlock: {
    marginTop: 18,
    alignItems: 'center',
  },
  movieTitle: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 26,
    fontWeight: '500',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  movieMeta: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 4,
  },
  ratingMeta: {
    marginTop: 6,
    fontSize: 10,
    color: Colors.mute,
    letterSpacing: 0.4,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  primaryBtn: {
    flex: 2,
    backgroundColor: '#1f1f1f',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: Colors.line,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  section: {
    marginTop: 28,
  },
  essaySection: {
    marginBottom: 24,
  },
  synopsis: {
    marginTop: 10,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 13,
    lineHeight: 24,
    color: '#1f1f1f',
  },
  essayItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
  },
  essayTitle: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  essayExcerpt: {
    marginTop: 6,
    fontSize: 11.5,
    color: '#444',
    fontFamily: 'NotoSerifKR_500Medium',
    lineHeight: 17,
  },
  essayMeta: {
    marginTop: 8,
    fontSize: 10,
    letterSpacing: 0.6,
  },
});
