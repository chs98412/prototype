import React, { useState, useEffect } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { apiCall } from '../../lib/api-client'
import { clearToken } from '../../lib/auth'
import { Colors } from '../../lib/design'

type Tab = 'watched' | 'reviews' | 'lists'

export default function ProfileScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [records, setRecords] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('watched')

  useEffect(() => {
    Promise.all([
      apiCall('/v1/profile'),
      apiCall('/v1/records/stats'),
      apiCall('/v1/records?status=watched'),
      apiCall('/v1/reviews'),
    ]).then(([{ data: p }, { data: s }, { data: r }, { data: rv }]) => {
      setProfile(p)
      setStats(s)
      setRecords(r || [])
      setReviews(rv || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await clearToken()
    router.replace('/login')
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.olive} /></View>
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'watched', label: '내가 뭘 봤게?' },
    { key: 'reviews', label: '내 평론' },
    { key: 'lists', label: '목록' },
  ]

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 프로필 헤더 */}
        <View style={styles.profileHeader}>
          {/* 아바타 */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.display_name || '?')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.display_name || '사용자'}</Text>
          <Text style={styles.handle}>@{profile?.user_id?.slice(0, 8) || 'user'}</Text>
          {profile?.bio ? (
            <Text style={styles.bio}>{profile.bio}</Text>
          ) : null}

          <View style={styles.actionRow}>
            <Pressable style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>프로필 편집</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handleLogout}>
              <Text style={styles.actionBtnText}>로그아웃</Text>
            </Pressable>
          </View>
        </View>

        {/* 통계 그리드 */}
        <View style={styles.statsGrid}>
          {[
            { label: '영화', value: stats?.watched_count || 0 },
            { label: '기록', value: stats?.watching_count || 0 },
            { label: '팔로잉', value: profile?.following_count || 0 },
            { label: '팔로워', value: profile?.follower_count || 0 },
          ].map((s, i) => (
            <View key={s.label} style={[styles.statCell, i < 3 && styles.statCellBorder]}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* 탭 */}
        <View style={styles.tabRow}>
          {tabs.map(t => (
            <Pressable key={t.key} onPress={() => setTab(t.key)} style={styles.tabBtn}>
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
              <View style={[styles.tabUnderline, tab === t.key && styles.tabUnderlineActive]} />
            </Pressable>
          ))}
        </View>

        {/* 탭 콘텐츠 */}
        <View style={styles.tabContent}>
          {tab === 'watched' && (
            <View style={styles.posterGrid}>
              {records.length === 0 ? (
                <Text style={styles.emptyText}>아직 기록이 없습니다</Text>
              ) : (
                records.map((r, i) => (
                  <View key={r.id || i} style={styles.posterCell} />
                ))
              )}
            </View>
          )}
          {tab === 'reviews' && (
            <View>
              {reviews.length === 0 ? (
                <Text style={styles.emptyText}>아직 평론이 없습니다</Text>
              ) : (
                reviews.slice(0, 10).map((r) => (
                  <View key={r.id} style={styles.reviewRow}>
                    <View style={styles.reviewPoster} />
                    <View style={styles.reviewInfo}>
                      <Text style={styles.reviewContent} numberOfLines={2}>{r.content}</Text>
                      <Text style={styles.reviewMeta}>{r.created_at?.slice(0, 10)} · ♥ {r.like_count || 0}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
          {tab === 'lists' && (
            <View style={styles.listsGrid}>
              {[
                '보고 싶은 영화',
                '다시 보고 싶은 영화',
                '최근 감명 깊었던 영화',
                '겨울에 보기 좋은 영화',
              ].map((title, i) => (
                <View key={i} style={styles.listCell}>
                  <Text style={styles.listTitle}>{title}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  profileHeader: { paddingTop: 60, paddingHorizontal: 22, alignItems: 'center' },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: Colors.olive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: '600' },
  name: {
    marginTop: 12,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 22,
    letterSpacing: -0.3,
    color: Colors.inkSoft,
  },
  handle: { marginTop: 2, fontSize: 11, color: Colors.olive, letterSpacing: 1 },
  bio: {
    marginTop: 14,
    maxWidth: 240,
    fontFamily: 'NotoSerifKR_400Regular',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: Colors.inkSoft,
  },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionBtn: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: Colors.lineSoft,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  actionBtnText: { fontSize: 11, fontWeight: '500', color: Colors.inkSoft },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: 22,
    marginTop: 22,
    borderWidth: 1,
    borderColor: Colors.lineSoft,
    borderRadius: 4,
  },
  statCell: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  statCellBorder: { borderRightWidth: 1, borderRightColor: Colors.lineSoft },
  statValue: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 18,
    letterSpacing: -0.3,
    color: Colors.inkSoft,
  },
  statLabel: { marginTop: 4, fontSize: 9, color: '#666', letterSpacing: 1, textTransform: 'uppercase' },
  tabRow: {
    flexDirection: 'row',
    marginTop: 26,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
    gap: 22,
  },
  tabBtn: { paddingBottom: 10, paddingTop: 10 },
  tabText: { fontSize: 12, fontWeight: '500', color: '#999' },
  tabTextActive: { color: '#000' },
  tabUnderline: { height: 1.5, backgroundColor: 'transparent', marginBottom: -1 },
  tabUnderlineActive: { backgroundColor: '#000' },
  tabContent: { padding: 22 },
  posterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  posterCell: {
    width: '23%',
    aspectRatio: 3 / 4,
    backgroundColor: Colors.lineSoft,
    borderRadius: 2,
  },
  reviewRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
  },
  reviewPoster: { width: 50, height: 68, borderRadius: 3, backgroundColor: Colors.lineSoft },
  reviewInfo: { flex: 1, minWidth: 0 },
  reviewContent: {
    fontFamily: 'NotoSerifKR_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: Colors.inkSoft,
  },
  reviewMeta: { marginTop: 6, fontSize: 10, color: Colors.olive },
  emptyText: { fontSize: 13, color: Colors.mute, paddingVertical: 40, textAlign: 'center' },
  listsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  listCell: {
    width: '47%',
    aspectRatio: 1 / 1.1,
    borderRadius: 4,
    backgroundColor: Colors.lineSoft,
    padding: 10,
    justifyContent: 'flex-end',
  },
  listTitle: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 12,
    color: Colors.inkSoft,
  },
})
