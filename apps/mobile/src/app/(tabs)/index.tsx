import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const API_URL = 'https://logged-backend.fly.dev'

export default function HomeScreen() {
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // API 호출 예시
    console.log('API URL:', API_URL)
    setLoading(false)
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Logged</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0a0a0a" />
        ) : (
          <View style={styles.content}>
            <Text style={styles.subtitle}>영화를 평가해보세요</Text>
            <Text style={styles.description}>로그인하여 시작하세요</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    padding: 16,
    color: '#0a0a0a',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 16,
    color: '#0a0a0a',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    padding: 16,
  },
})
