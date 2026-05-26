import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { apiCall } from '../../lib/api-client'
import { Colors } from '../../lib/design'

export default function FeedScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('전체')

  useEffect(() => {
    Promise.all([
      apiCall('/v1/profile'),
      apiCall('/v1/reviews'),
    ]).then(([{ data: profileData }, { data: reviewData }]) => {
      setProfile(profileData)
      setReviews(reviewData || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filters = ['전체', '에세이', '한줄평', '로그']

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>피드</Text>
            <Text style={styles.subtitle}>reviews · ratings · logs</Text>
          </View>
          <Pressable onPress={() => router.push('/movie/search')} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>＋</Text>
          </Pressable>
        </View>

        {/* 필터 칩 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
          {filters.map((f, i) => (
            <Pressable key={f} onPress={() => setActiveFilter(f)} style={[styles.pill, activeFilter === f && styles.pillActive]}>
              <Text style={[styles.pillText, activeFilter === f && styles.pillTextActive]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.olive} />
          </View>
        ) : (
          <View>
            {/* 구분선 */}
            <DayDivider label="이번 주" />

            {reviews.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptySerifText}>아직 기록이 없습니다.</Text>
                <Text style={styles.emptyText}>영화를 검색하고 첫 리뷰를 남겨보세요.</Text>
              </View>
            ) : (
              reviews.slice(0, 10).map((review) => (
                <ReviewCard key={review.id} review={review} onPress={() => {}} />
              ))
            )}

            {/* 푸터 */}
            <View style={styles.footerMast}>
              <Text style={styles.footerMastTitle}>L O G G E D</Text>
              <Text style={styles.footerMastSub}>vol. 001 · 평론 매거진</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

function DayDivider({ label }: { label: string }) {
  return (
    <View style={styles.dayDivider}>
      <Text style={styles.dayDividerText}>{label}</Text>
      <View style={styles.dayDividerLine} />
    </View>
  )
}

function ReviewCard({ review, onPress }: { review: any; onPress: () => void }) {
  const stars = review.rating || 0
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardInner}>
        {/* 포스터 자리 */}
        <View style={styles.posterPlaceholder} />
        <View style={styles.cardContent}>
          <Text style={styles.typeBadge}>· 한줄평</Text>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {review.content || '제목 없음'}
          </Text>
          <View style={styles.starRow}>
            {[1,2,3,4,5].map(i => (
              <Text key={i} style={{ color: i <= stars ? Colors.inkSoft : Colors.lineSoft, fontSize: 12 }}>★</Text>
            ))}
            <Text style={styles.starText}>{stars}.0</Text>
          </View>
          <Text style={styles.cardMeta}>{review.created_at?.slice(0, 10) || ''}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardAction}>♡ {review.like_count || 0}</Text>
            <Text style={styles.cardAction}>💬 {review.comment_count || 0}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: 22,
    paddingTop: 60,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 28,
    letterSpacing: -0.5,
    color: Colors.inkSoft,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 11,
    color: Colors.olive,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerBtn: { padding: 6 },
  headerBtnText: { fontSize: 24, color: Colors.inkSoft },
  filterRow: { paddingBottom: 4 },
  filterContent: { paddingHorizontal: 22, gap: 8, paddingVertical: 14 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: Colors.lineSoft,
  },
  pillActive: { backgroundColor: Colors.inkSoft, borderColor: Colors.inkSoft },
  pillText: { fontSize: 11, fontWeight: '500', color: Colors.inkSoft },
  pillTextActive: { color: '#fff' },
  center: { paddingVertical: 60, alignItems: 'center' },
  dayDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 8,
  },
  dayDividerText: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 11,
    color: Colors.olive,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dayDividerLine: { flex: 1, height: 1, backgroundColor: Colors.lineSoft },
  empty: {
    paddingVertical: 60,
    paddingHorizontal: 22,
    alignItems: 'center',
    gap: 8,
  },
  emptySerifText: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 16,
    color: Colors.inkSoft,
  },
  emptyText: { fontSize: 13, color: Colors.mute, textAlign: 'center' },
  card: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
  },
  cardInner: {
    flexDirection: 'row',
    gap: 14,
    padding: 20,
    paddingHorizontal: 22,
  },
  posterPlaceholder: {
    width: 90,
    height: 126,
    borderRadius: 4,
    backgroundColor: Colors.lineSoft,
    flexShrink: 0,
  },
  cardContent: { flex: 1, minWidth: 0 },
  typeBadge: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2,
    color: Colors.olive,
    textTransform: 'uppercase',
  },
  cardTitle: {
    marginTop: 6,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.3,
    color: '#000',
  },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 6 },
  starText: { fontSize: 11, color: Colors.olive, fontWeight: '500', marginLeft: 4 },
  cardMeta: { marginTop: 4, fontSize: 11, color: Colors.olive, fontWeight: '500' },
  cardFooter: { flexDirection: 'row', gap: 14, marginTop: 10 },
  cardAction: { fontSize: 11, fontWeight: '500', color: Colors.inkSoft },
  footerMast: {
    paddingVertical: 40,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.lineSoft,
    marginTop: 20,
  },
  footerMastTitle: {
    fontFamily: 'NotoSerifKR_400Regular',
    fontSize: 16,
    letterSpacing: 6,
    color: Colors.inkSoft,
  },
  footerMastSub: {
    marginTop: 6,
    fontSize: 10,
    color: Colors.mute,
  },
})
