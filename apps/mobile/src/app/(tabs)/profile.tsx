import { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ME, ESSAYS, MOVIE_BY_ID } from '@/lib/data';
import { Images } from '@/lib/images';
import { Colors } from '@/lib/design';
import Avatar from '@/components/ui/Avatar';
import Poster from '@/components/ui/Poster';

const ACCENT = Colors.olive;

type ProfileTab = 'watched' | 'essays' | 'lists';

const MY_LISTS = [
  { title: '겨울에 다시 보는 영화', count: 12, cover: 'posterYuhi' },
  { title: '사랑한다는 말 없이', count: 7, cover: 'posterRachel' },
  { title: '감독판만', count: 18, cover: 'posterExtra3' },
  { title: '어디에도 없는 풍경', count: 9, cover: 'posterFeed' },
];

export default function ProfileScreen() {
  const [tab, setTab] = useState<ProfileTab>('watched');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar + bio */}
        <View style={styles.headerSection}>
          <Avatar size={86} ring />
          <Text style={styles.name}>{ME.name}</Text>
          <Text style={[styles.handle, { color: ACCENT }]}>{ME.handle}</Text>
          <Text style={styles.bio}>{ME.bio}</Text>

          <View style={styles.buttonRow}>
            <Pressable onPress={() => router.push('/edit')} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>프로필 편집</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/follow')} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>친구 찾기</Text>
            </Pressable>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {([
            ['영화', ME.stats.films, null],
            ['기록', ME.stats.logs, null],
            ['팔로잉', ME.stats.following, 'following'],
            ['팔로워', ME.stats.followers, 'followers'],
          ] as const).map(([k, v, tab], i) => (
            <Pressable
              key={k}
              style={[styles.statCell, i < 3 && styles.statBorder]}
              onPress={() => tab && router.push(`/follow?tab=${tab}`)}
            >
              <Text style={styles.statValue}>{v}</Text>
              <Text style={styles.statLabel}>{k}</Text>
            </Pressable>
          ))}
        </View>

        {/* Sub-tabs */}
        <View style={styles.tabRow}>
          {([['watched', '내가 뭘 봤게?'], ['essays', '내 평론'], ['lists', '목록']] as const).map(([id, label]) => (
            <Pressable key={id} onPress={() => setTab(id)} style={styles.tabItem}>
              <Text style={[styles.tabLabel, tab === id && styles.tabLabelActive]}>{label}</Text>
              <View style={[styles.tabUnderline, tab === id && styles.tabUnderlineActive]} />
            </Pressable>
          ))}
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {tab === 'watched' && (
            <View style={styles.watchedGrid}>
              {ME.watched.map((key, i) => {
                const src = Images[key];
                return src ? (
                  <Image key={i} source={src} style={styles.watchedPoster} resizeMode="cover" />
                ) : (
                  <View key={i} style={[styles.watchedPoster, styles.watchedPlaceholder]} />
                );
              })}
            </View>
          )}
          {tab === 'essays' && (
            <View>
              {ESSAYS.slice(0, 3).map(e => {
                const m = MOVIE_BY_ID[e.movieId];
                return (
                  <Pressable
                    key={e.id}
                    onPress={() => router.push(`/essay/${e.id}`)}
                    style={styles.essayItem}
                  >
                    <Poster imageKey={m.poster} width={50} height={68} />
                    <View style={styles.essayInfo}>
                      <Text style={styles.essayTitle} numberOfLines={2}>{e.title}</Text>
                      <Text style={styles.essayExcerpt} numberOfLines={2}>{e.excerpt}</Text>
                      <Text style={[styles.essayMeta, { color: ACCENT }]}>{e.date} · ♥ {e.likes}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
          {tab === 'lists' && (
            <View style={styles.listsGrid}>
              {MY_LISTS.map((l, i) => {
                const src = Images[l.cover];
                return (
                  <View key={i} style={styles.listCard}>
                    {src && <Image source={src} style={StyleSheet.absoluteFill} resizeMode="cover" />}
                    <View style={styles.listOverlay} />
                    <Text style={styles.listTitle}>{l.title}</Text>
                    <Text style={styles.listCount}>{l.count}편</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  headerSection: {
    paddingTop: 20,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  name: {
    marginTop: 12,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  handle: {
    marginTop: 2,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  bio: {
    marginTop: 14,
    maxWidth: 240,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    color: '#1f1f1f',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  actionBtn: {
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: Colors.lineSoft,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: 22,
    marginTop: 22,
    borderWidth: 1,
    borderColor: Colors.lineSoft,
    borderRadius: 4,
  },
  statCell: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: Colors.lineSoft,
  },
  statValue: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 9.5,
    color: '#666',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 26,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
    gap: 22,
  },
  tabItem: {
    paddingVertical: 10,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
  },
  tabLabelActive: {
    color: '#000',
  },
  tabUnderline: {
    height: 1.5,
    backgroundColor: 'transparent',
    marginTop: 2,
  },
  tabUnderlineActive: {
    backgroundColor: '#000',
  },
  tabContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 20,
  },
  watchedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  watchedPoster: {
    width: '23.5%',
    aspectRatio: 3 / 4,
    borderRadius: 2,
  },
  watchedPlaceholder: {
    backgroundColor: '#eee',
  },
  essayItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
  },
  essayInfo: {
    flex: 1,
    minWidth: 0,
  },
  essayTitle: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
  essayExcerpt: {
    marginTop: 4,
    fontSize: 11,
    color: '#444',
    fontFamily: 'NotoSerifKR_500Medium',
    lineHeight: 16,
  },
  essayMeta: {
    marginTop: 6,
    fontSize: 10,
  },
  listsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  listCard: {
    width: '47%',
    aspectRatio: 1 / 1.1,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#333',
    padding: 10,
    justifyContent: 'flex-end',
  },
  listOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  listTitle: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    zIndex: 1,
  },
  listCount: {
    fontSize: 9.5,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    zIndex: 1,
  },
});
