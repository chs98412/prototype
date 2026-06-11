import { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ESSAY_BY_ID, MOVIE_BY_ID } from '@/lib/data';
import { Images } from '@/lib/images';
import { Colors } from '@/lib/design';
import SubHeader from '@/components/ui/SubHeader';
import Poster from '@/components/ui/Poster';
import Avatar from '@/components/ui/Avatar';
import { HeartIcon, CommentIcon, BookmarkIcon, EllipsisIcon } from '@/components/ui/Icons';

const ACCENT = Colors.olive;
const MOCK_COMMENTS = [
  { who: '최혁순', body: '한 문장 한 문장 곱씹어서 다 읽었어요.', when: '6h' },
  { who: '지윤', body: '필름 시대 사랑의 띠지라니, 너무 좋네요.', when: '1d' },
];

export default function EssayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const essay = ESSAY_BY_ID[id] ?? ESSAY_BY_ID['e1']!;
  const movie = MOVIE_BY_ID[essay.movieId]!;

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SubHeader
        trailing={
          <Pressable hitSlop={8}>
            <EllipsisIcon />
          </Pressable>
        }
      />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Poster + title */}
          <View style={styles.topRow}>
            <Pressable onPress={() => router.push(`/movie/${movie.id}`)}>
              <Poster imageKey={movie.poster} width={140} height={195} />
            </Pressable>
            <View style={styles.topRight}>
              <Text style={styles.essayTitle}>{essay.title}</Text>
              <View style={styles.authorBlock}>
                <Text style={styles.authorName}>{essay.author}</Text>
                <Text style={[styles.authorDate, { color: ACCENT }]}>{essay.date}</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <Pressable onPress={() => setLiked(!liked)} style={styles.iconBtn}>
              <HeartIcon size={20} filled={liked} color={liked ? '#c44444' : '#1f1f1f'} />
            </Pressable>
            <Pressable style={styles.iconBtn}>
              <CommentIcon size={20} />
            </Pressable>
            <Pressable onPress={() => setSaved(!saved)} style={styles.iconBtn}>
              <BookmarkIcon size={20} filled={saved} />
            </Pressable>
            <View style={styles.spacer} />
            <Text style={styles.actionMeta}>
              {liked ? essay.likes + 1 : essay.likes} likes · {essay.comments} comments
            </Text>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {essay.body.map((p, i) => (
              <Text key={i} style={styles.bodyText}>{p}</Text>
            ))}

            {/* Inline image */}
            {essay.inlineImage && Images[essay.inlineImage] && (
              <View style={styles.inlineFigure}>
                <Image
                  source={Images[essay.inlineImage]!}
                  style={styles.inlineImage}
                  resizeMode="cover"
                />
                <Text style={styles.caption}>still from {movie.title} · {movie.director}</Text>
              </View>
            )}

            {/* End mark */}
            <Text style={styles.endMark}>※</Text>

            {/* Tags */}
            <View style={styles.tags}>
              {essay.tags.map(t => (
                <View key={t} style={[styles.tag, { borderColor: ACCENT }]}>
                  <Text style={[styles.tagText, { color: ACCENT }]}>#{t}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Author footer */}
          <View style={styles.authorCard}>
            <Avatar size={42} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorCardName}>{essay.author}</Text>
              <Text style={styles.authorCardMeta}>비평 24 · 에세이 41 · 팔로워 312</Text>
            </View>
            <Pressable style={[styles.followBtn, { borderColor: ACCENT }]}>
              <Text style={[styles.followBtnText, { color: ACCENT }]}>팔로우</Text>
            </Pressable>
          </View>

          {/* Comments */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsLabel}>코멘트 · {essay.comments}</Text>
            {MOCK_COMMENTS.map((c, i) => (
              <View key={i} style={styles.comment}>
                <Avatar size={30} />
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentWho}>{c.who}</Text>
                    <Text style={styles.commentWhen}>{c.when}</Text>
                  </View>
                  <Text style={styles.commentBody}>{c.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 22 },
  topRow: { flexDirection: 'row', gap: 18, alignItems: 'flex-start' },
  topRight: {
    flex: 1,
    paddingTop: 4,
    justifyContent: 'space-between',
    minHeight: 195,
  },
  essayTitle: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 19,
    fontWeight: '500',
    lineHeight: 27,
    letterSpacing: -0.2,
  },
  authorBlock: { alignItems: 'flex-end' },
  authorName: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 14,
    fontWeight: '500',
  },
  authorDate: {
    marginTop: 2,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 14,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
  },
  iconBtn: { padding: 4 },
  spacer: { flex: 1 },
  actionMeta: {
    fontSize: 10,
    color: Colors.mute,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  body: { paddingTop: 22 },
  bodyText: {
    marginBottom: 18,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 13.5,
    lineHeight: 25,
    color: '#1f1f1f',
  },
  inlineFigure: {
    marginVertical: 26,
    marginHorizontal: -6,
  },
  inlineImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 2,
  },
  caption: {
    marginTop: 8,
    fontSize: 10,
    color: Colors.mute,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  endMark: {
    marginVertical: 30,
    textAlign: 'center',
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 18,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 24,
  },
  tag: {
    borderWidth: 0.5,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 10,
    letterSpacing: 0.4,
  },
  authorCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.lineSoft,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
  },
  authorInfo: { flex: 1, minWidth: 0 },
  authorCardName: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 14,
    fontWeight: '500',
  },
  authorCardMeta: {
    fontSize: 10,
    color: Colors.mute,
    marginTop: 2,
  },
  followBtn: {
    borderWidth: 0.5,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  followBtnText: {
    fontSize: 11,
    fontWeight: '500',
  },
  commentsSection: { marginTop: 22 },
  commentsLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#666',
  },
  comment: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  commentContent: { flex: 1 },
  commentHeader: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'baseline',
  },
  commentWho: { fontSize: 12, fontWeight: '600' },
  commentWhen: { fontSize: 9.5, color: Colors.mute },
  commentBody: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'NotoSerifKR_500Medium',
  },
});
