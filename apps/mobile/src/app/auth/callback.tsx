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
      if (typeof window === 'undefined') {
        router.replace('/login')
        return
      }

      // Supabase implicit flow: token comes in URL hash
      const hash = window.location.hash
      const params = new URLSearchParams(hash.replace('#', ''))
      const accessToken = params.get('access_token')

      // Also check query params as fallback
      const queryParams = new URLSearchParams(window.location.search)
      const queryToken = queryParams.get('token')

      const token = accessToken || queryToken

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
