import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { saveToken } from '../../lib/auth'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    try {
      const params = new URLSearchParams(
        typeof window !== 'undefined' ? window.location.search : ''
      )
      const token = params.get('token')

      if (token) {
        await saveToken(token)
        router.replace('/(tabs)')
      } else {
        router.replace('/login')
      }
    } catch {
      router.replace('/login')
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0a0a0a" />
    </View>
  )
}
