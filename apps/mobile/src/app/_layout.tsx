import { useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useFonts, NotoSerifKR_400Regular, NotoSerifKR_500Medium, NotoSerifKR_700Bold } from '@expo-google-fonts/noto-serif-kr'
import { getToken } from '../lib/auth'
import { apiCall } from '../lib/api-client'

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()
  const [isReady, setIsReady] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [fontsLoaded] = useFonts({
    NotoSerifKR_400Regular,
    NotoSerifKR_500Medium,
    NotoSerifKR_700Bold,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!isReady || !fontsLoaded) return
    const inAuthGroup = segments[0] === 'login' || segments[0] === '(auth)'
    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/login')
    } else if (isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [isReady, isLoggedIn, segments, fontsLoaded])

  const checkAuth = async () => {
    try {
      const token = await getToken()
      if (token) {
        const { data } = await apiCall('/v1/profile')
        setIsLoggedIn(!!data)
      } else {
        setIsLoggedIn(false)
      }
    } catch {
      setIsLoggedIn(false)
    } finally {
      setIsReady(true)
    }
  }

  if (!isReady || !fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="movie/[id]" />
      </Stack>
    </GestureHandlerRootView>
  )
}
