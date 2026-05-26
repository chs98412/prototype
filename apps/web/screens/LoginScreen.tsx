import React, { useState } from 'react'
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { apiCall } from '../lib/api-client'
import { saveToken, saveUser } from '../lib/auth'

export function LoginScreen({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      // 백엔드에서 OAuth 시작
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback`
        : 'http://localhost:3000/auth/callback'

      // 백엔드의 OAuth 초기화 엔드포인트 호출
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/v1/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirect_uri: redirectUrl }),
      })

      const data = await response.json()
      if (data.auth_url) {
        // Supabase 인증 페이지로 리다이렉트
        window.location.href = data.auth_url
      }
    } catch (error) {
      console.error('로그인 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logged</Text>
      <Text style={styles.subtitle}>영화를 평가해보세요</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0a0a0a" />
      ) : (
        <Pressable style={styles.button} onPress={handleGoogleLogin}>
          <Text style={styles.buttonText}>Google로 로그인</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0a0a0a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#0a0a0a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
