import React, { useState } from 'react'
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Platform } from 'react-native'
import { API_URL } from '../lib/config'
import { Colors } from '../lib/design'

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const redirectUrl = Platform.OS === 'web' && typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : 'logged://auth/callback'

      const response = await fetch(`${API_URL}/v1/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirect_uri: redirectUrl }),
      })

      const data = await response.json()
      if (data.auth_url) {
        if (Platform.OS === 'web') {
          window.location.href = data.auth_url
        } else {
          const { Linking } = require('react-native')
          Linking.openURL(data.auth_url)
        }
      }
    } catch (error) {
      console.error('로그인 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* 브랜드 */}
      <View style={styles.brand}>
        <Text style={styles.brandName}>logged</Text>
        <Text style={styles.brandDot}>.</Text>
      </View>

      <Text style={styles.tagline}>영화를 읽는 방식</Text>
      <Text style={styles.desc}>
        별점보다 문장을{'\n'}에세이, 한줄평, 로그로 기록합니다.
      </Text>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 로그인 버튼 */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.olive} />
      ) : (
        <Pressable style={styles.button} onPress={handleGoogleLogin}>
          <Text style={styles.buttonText}>Google로 시작하기</Text>
        </Pressable>
      )}

      {/* 푸터 */}
      <Text style={styles.footer}>logged · 평론 매거진 플랫폼</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f6f3',
    padding: 36,
  },
  brand: { flexDirection: 'row', alignItems: 'baseline' },
  brandName: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 42,
    color: Colors.inkSoft,
    letterSpacing: -1,
  },
  brandDot: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 42,
    color: Colors.olive,
    letterSpacing: -1,
  },
  tagline: {
    marginTop: 16,
    fontFamily: 'NotoSerifKR_400Regular',
    fontSize: 16,
    color: Colors.inkSoft,
    letterSpacing: 0.5,
  },
  desc: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.mute,
    textAlign: 'center',
    lineHeight: 20,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: Colors.olive,
    marginVertical: 40,
    opacity: 0.4,
  },
  button: {
    backgroundColor: Colors.inkSoft,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontSize: 10,
    color: Colors.mute,
    letterSpacing: 1,
  },
})
