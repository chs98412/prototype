// 클라이언트 토큰 관리 (localStorage 사용)

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

export function saveUser(user: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

export function getUser(): any {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}
