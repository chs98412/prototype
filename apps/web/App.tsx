import React, { useState, useEffect } from 'react'
import { View, Pressable, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LoginScreen } from './screens/LoginScreen'
import { HomeScreen } from './screens/HomeScreen'
import { SearchScreen } from './screens/SearchScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { MovieDetailScreen } from './screens/MovieDetailScreen'
import { getCurrentUser } from './lib/supabase'

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'profile'>('home')
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser()
      setUser(user)
    } catch (error) {
      console.error('인증 확인 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />
  }

  if (!user) {
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
            setUser(null)
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
