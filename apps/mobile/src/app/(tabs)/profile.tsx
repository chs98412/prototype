import React, { useState, useEffect } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { apiCall } from '../../lib/api-client'
import { clearToken } from '../../lib/auth'
import { RecordTabs } from '../../components/RecordTabs'

export default function ProfileScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiCall('/v1/profile'),
      apiCall('/v1/records/stats'),
    ]).then(([{ data: profileData }, { data: statsData }]) => {
      setProfile(profileData)
      setStats(statsData)
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    await clearToken()
    router.replace('/login')
  }

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#0a0a0a" /></View>
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{profile?.display_name || '사용자'}</Text>
          <Text style={styles.bio}>{profile?.bio || '소개글을 추가해보세요'}</Text>
        </View>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.watched_count || 0}</Text>
            <Text style={styles.statLabel}>본 영화</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.watching_count || 0}</Text>
            <Text style={styles.statLabel}>보는 중</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.want_count || 0}</Text>
            <Text style={styles.statLabel}>보고 싶음</Text>
          </View>
        </View>
        <Pressable style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>로그아웃</Text>
        </Pressable>

        <View style={styles.records}>
          <Text style={styles.sectionTitle}>내 기록</Text>
          <RecordTabs />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  header: { marginBottom: 32 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#0a0a0a', marginBottom: 8 },
  bio: { fontSize: 14, color: '#666' },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#0a0a0a' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  button: { backgroundColor: '#0a0a0a', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  records: { marginTop: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0a0a0a', marginBottom: 12 },
})
