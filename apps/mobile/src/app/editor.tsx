import { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MOVIES, MOVIE_BY_ID } from '@/lib/data';
import { Colors } from '@/lib/design';
import SubHeader from '@/components/ui/SubHeader';
import Poster from '@/components/ui/Poster';
import Stars from '@/components/ui/Stars';
import { CameraIcon, SparkleIcon, BookmarkIcon } from '@/components/ui/Icons';

const ACCENT = Colors.olive;
const TYPES = [
  { id: 'essay', label: '에세이' },
  { id: 'rating', label: '한줄평' },
  { id: 'log', label: '로그' },
  { id: 'quote', label: '인용' },
  { id: 'list', label: '컬렉션' },
] as const;

type PostKind = typeof TYPES[number]['id'];

export default function EditorScreen() {
  const { id: movieIdParam } = useLocalSearchParams<{ id?: string }>();
  const [kind, setKind] = useState<PostKind>('essay');
  const [movieId, setMovieId] = useState(movieIdParam ?? MOVIES[0]!.id);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [blurb, setBlurb] = useState('');
  const [stars, setStars] = useState(0);
  const [quote, setQuote] = useState('');
  const [cite, setCite] = useState('');
  const [listName, setListName] = useState('');
  const [listDesc, setListDesc] = useState('');

  const movie = MOVIE_BY_ID[movieId] ?? MOVIES[0]!;

  const typeLabel = TYPES.find(t => t.id === kind)?.label ?? '';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SubHeader
        title={`새 ${typeLabel}`}
        onBack={() => router.back()}
        trailing={
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.submitBtn, { color: ACCENT }]}>게시</Text>
          </Pressable>
        }
      />

      {/* Type picker */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typePicker}
        contentContainerStyle={styles.typePickerContent}
      >
        {TYPES.map(t => (
          <Pressable
            key={t.id}
            onPress={() => setKind(t.id)}
            style={[styles.typeChip, kind === t.id ? styles.typeChipActive : styles.typeChipInactive]}
          >
            <Text style={[styles.typeChipText, kind === t.id ? styles.typeChipTextActive : styles.typeChipTextInactive]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Movie picker (except list) */}
        {kind !== 'list' && (
          <View style={styles.moviePicker}>
            <Poster imageKey={movie.poster} width={50} height={68} />
            <View style={styles.movieInfo}>
              <Text style={styles.moviePickerLabel}>대상 영화</Text>
              <Text style={styles.moviePickerTitle}>{movie.title}</Text>
              <Text style={[styles.moviePickerMeta, { color: ACCENT }]}>{movie.year} · {movie.director}</Text>
            </View>
          </View>
        )}

        {/* Forms */}
        {kind === 'essay' && (
          <View style={styles.form}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="제목을 적어주세요"
              placeholderTextColor="#999"
              style={styles.titleInput}
            />
            <View style={styles.divider} />
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="문장은 천천히 흘러도 괜찮습니다. 한 호흡 길게, 그러나 묽지 않게 쓰는 평론을 응원해요."
              placeholderTextColor="#999"
              multiline
              numberOfLines={12}
              style={styles.bodyInput}
              textAlignVertical="top"
            />
          </View>
        )}

        {kind === 'rating' && (
          <View style={styles.ratingForm}>
            <Text style={styles.ratingLabel}>별점</Text>
            <View style={styles.starsInteractive}>
              {[1, 2, 3, 4, 5].map(i => (
                <Pressable key={i} onPress={() => setStars(i)} hitSlop={4}>
                  <Stars value={i <= stars ? i : 0} size={32} />
                </Pressable>
              ))}
            </View>
            {stars > 0 && <Text style={[styles.starsValue, { color: ACCENT }]}>{stars}.0</Text>}
            <View style={styles.blurbArea}>
              <Text style={styles.blurbLabel}>한 줄로 말한다면</Text>
              <TextInput
                value={blurb}
                onChangeText={setBlurb}
                placeholder="한 호흡으로 끝나는 짧은 평. 농담도, 한 줄 인상도 환영합니다."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                style={styles.blurbInput}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}

        {kind === 'log' && (
          <View style={styles.logForm}>
            <Poster imageKey={movie.poster} width={140} height={196} style={styles.logPoster} />
            <Text style={styles.logMovieTitle}>{movie.title}</Text>
            <Text style={[styles.logSaw, { color: ACCENT }]}>봤습니다.</Text>
            <Text style={styles.logStarLabel}>한 마디로 별점만</Text>
            <View style={styles.starsInteractive}>
              {[1, 2, 3, 4, 5].map(i => (
                <Pressable key={i} onPress={() => setStars(i)} hitSlop={4}>
                  <Stars value={i <= stars ? i : 0} size={28} />
                </Pressable>
              ))}
            </View>
            <Text style={styles.logSilence}>— 멘트 없이 기록됩니다.</Text>
          </View>
        )}

        {kind === 'quote' && (
          <View style={styles.form}>
            <Text style={styles.quoteFieldLabel}>영화 속 대사</Text>
            <View style={[styles.quoteBox, { borderTopColor: ACCENT, borderBottomColor: ACCENT }]}>
              <Text style={[styles.quoteMarkLarge, { color: ACCENT }]}>"</Text>
              <TextInput
                value={quote}
                onChangeText={setQuote}
                placeholder="기억하고 싶은 한 마디를 적어주세요."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                style={styles.quoteInput}
                textAlignVertical="top"
                textAlign="center"
              />
            </View>
            <Text style={styles.citeLabel}>누가 / 어느 장면</Text>
            <TextInput
              value={cite}
              onChangeText={setCite}
              placeholder="예) 〈괴물〉의 마지막 장면에서"
              placeholderTextColor="#999"
              style={styles.citeInput}
            />
          </View>
        )}

        {kind === 'list' && (
          <View style={styles.form}>
            <Text style={styles.quoteFieldLabel}>컬렉션 이름</Text>
            <TextInput
              value={listName}
              onChangeText={setListName}
              placeholder="예) 겨울에 다시 보는 영화"
              placeholderTextColor="#999"
              style={styles.listNameInput}
            />
            <Text style={[styles.quoteFieldLabel, { marginTop: 18 }]}>큐레이터 노트</Text>
            <TextInput
              value={listDesc}
              onChangeText={setListDesc}
              placeholder="왜 이 영화들을 모으셨나요?"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              style={styles.listDescInput}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Essay toolbar */}
        {kind === 'essay' && (
          <View style={styles.toolbar}>
            {[
              { Icon: CameraIcon, label: '스틸 추가' },
              { Icon: SparkleIcon, label: 'AI 다듬기' },
              { Icon: BookmarkIcon, label: '임시 저장' },
            ].map(({ Icon, label }) => (
              <Pressable key={label} style={styles.toolbarBtn}>
                <Icon size={14} />
                <Text style={styles.toolbarBtnText}>{label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  submitBtn: { fontSize: 12, fontWeight: '600' },
  typePicker: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
    flexGrow: 0,
  },
  typePickerContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 0.5,
    flexShrink: 0,
  },
  typeChipActive: {
    backgroundColor: '#1f1f1f',
    borderColor: '#1f1f1f',
  },
  typeChipInactive: {
    backgroundColor: 'transparent',
    borderColor: Colors.lineSoft,
  },
  typeChipText: { fontSize: 11, fontWeight: '500' },
  typeChipTextActive: { color: '#fff' },
  typeChipTextInactive: { color: '#666' },
  scroll: { flex: 1 },
  moviePicker: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
  },
  movieInfo: { flex: 1 },
  moviePickerLabel: { fontSize: 10, color: Colors.mute, letterSpacing: 0.8 },
  moviePickerTitle: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 15,
    fontWeight: '500',
  },
  moviePickerMeta: { fontSize: 10, marginTop: 2 },
  form: { padding: 22 },
  titleInput: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: -0.2,
    color: '#1f1f1f',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lineSoft,
    marginVertical: 12,
  },
  bodyInput: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 14,
    lineHeight: 25,
    color: '#1f1f1f',
    minHeight: 200,
  },
  ratingForm: {
    padding: 28,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 10,
    color: Colors.mute,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  starsInteractive: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  starsValue: { marginTop: 8, fontSize: 12 },
  blurbArea: {
    marginTop: 28,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.lineSoft,
    width: '100%',
  },
  blurbLabel: {
    fontSize: 10,
    color: Colors.mute,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  blurbInput: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 16,
    lineHeight: 27,
    color: '#1f1f1f',
    minHeight: 100,
  },
  logForm: {
    padding: 28,
    alignItems: 'center',
  },
  logPoster: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 6,
  },
  logMovieTitle: {
    marginTop: 18,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 18,
    fontWeight: '500',
  },
  logSaw: { marginTop: 4, fontSize: 11 },
  logStarLabel: {
    marginTop: 28,
    fontSize: 10,
    color: Colors.mute,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  logSilence: {
    marginTop: 32,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 12,
    color: Colors.mute,
    fontStyle: 'italic',
  },
  quoteFieldLabel: {
    fontSize: 10,
    color: Colors.mute,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  quoteBox: {
    backgroundColor: Colors.bgWarm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    padding: 22,
  },
  quoteMarkLarge: { fontSize: 26, lineHeight: 20 },
  quoteInput: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 18,
    lineHeight: 30,
    color: '#1f1f1f',
    marginTop: 8,
    textAlign: 'center',
    minHeight: 80,
  },
  citeLabel: {
    marginTop: 22,
    fontSize: 10,
    color: Colors.mute,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  citeInput: {
    fontSize: 13,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
    color: '#1f1f1f',
  },
  listNameInput: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 18,
    fontWeight: '500',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
    color: '#1f1f1f',
  },
  listDescInput: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 13,
    lineHeight: 22,
    color: '#1f1f1f',
    minHeight: 72,
  },
  toolbar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.lineSoft,
    backgroundColor: 'rgba(247,246,243,0.6)',
  },
  toolbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: Colors.lineSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  toolbarBtnText: { fontSize: 11 },
});
