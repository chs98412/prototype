import { Platform } from 'react-native'

const isLocalhost = Platform.OS !== 'web' ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost')

export const API_URL = process.env.EXPO_PUBLIC_API_URL ||
  (isLocalhost ? 'http://localhost:8080' : 'https://logged-backend.fly.dev')
