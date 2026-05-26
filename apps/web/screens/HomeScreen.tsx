import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { apiCall } from '../lib/api/client'

export function HomeScreen() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data } = await apiCall('/v1/profile')
      setProfile(data)
    } catch (error) {
      console.error('프로필 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>홈</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0a0a0a" />
        ) : profile ? (
          <View>
            <Text style={styles.greeting}>안녕하세요, {profile.display_name}님</Text>
            <View style={styles.stats}>
              <Text style={styles.statText}>기록된 영화: --</Text>
              <Text style={styles.statText}>팔로워: {profile.follower_count}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.text}>프로필을 불러올 수 없습니다</Text>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#0a0a0a',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#0a0a0a',
  },
  stats: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
})
