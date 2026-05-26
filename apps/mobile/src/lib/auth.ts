import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export async function saveToken(token: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    await AsyncStorage.setItem(TOKEN_KEY, token)
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return AsyncStorage.getItem(TOKEN_KEY)
}

export async function clearToken() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } else {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY])
  }
}

export async function saveUser(user: any) {
  const value = JSON.stringify(user)
  if (Platform.OS === 'web') {
    localStorage.setItem(USER_KEY, value)
  } else {
    await AsyncStorage.setItem(USER_KEY, value)
  }
}

export async function getUser(): Promise<any> {
  let value: string | null
  if (Platform.OS === 'web') {
    value = localStorage.getItem(USER_KEY)
  } else {
    value = await AsyncStorage.getItem(USER_KEY)
  }
  return value ? JSON.parse(value) : null
}
