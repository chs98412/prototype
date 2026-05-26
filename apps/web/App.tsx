import React, { useState, useEffect } from 'react'
import { View, Pressable, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LoginScreen } from './screens/LoginScreen'
import { HomeScreen } from './screens/HomeScreen'
import { SearchScreen } from './screens/SearchScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { MovieDetailScreen } from './screens/MovieDetailScreen'
import { getToken, clearToken } from './lib/auth'
import { apiCall } from './lib/api-client'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'profile'>('home')
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = getToken()
      if (token) {
        // 토큰이 유효한지 백엔드에서 확인
        const { data } = await apiCall('/v1/profile')
        setIsLoggedIn(!!data)
      } else {
        setIsLoggedIn(false)
      }
    } catch (error) {
      console.error('인증 확인 실패:', error)
      setIsLoggedIn(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <LoginScreen onLoginSuccess={() => checkAuth()} />
      </SafeAreaView>
    )
  }

  if (selectedMovieId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <MovieDetailScreen
          movieId={selectedMovieId}
          onBack={() => setSelectedMovieId(null)}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'search' && (
          <SearchScreen onSelectMovie={setSelectedMovieId} />
        )}
        {activeTab === 'profile' && (
          <ProfileScreen onLogout={() => {
            clearToken()
            setIsLoggedIn(false)
            setActiveTab('home')
          }} />
        )}
      </View>

      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'home' && styles.tabActive]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={styles.tabLabel}>🏠 홈</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'search' && styles.tabActive]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={styles.tabLabel}>🔍 검색</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={styles.tabLabel}>👤 프로필</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#0a0a0a',
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
  },
})
