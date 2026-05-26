import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LoginScreen } from './screens/LoginScreen'
import { HomeScreen } from './screens/HomeScreen'
import { getCurrentUser } from './lib/supabase'

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {user ? (
        <HomeScreen />
      ) : (
        <LoginScreen onLoginSuccess={() => checkAuth()} />
      )}
    </SafeAreaView>
  )
}
