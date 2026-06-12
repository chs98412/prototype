import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { setToken } from '../lib/auth'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const code = new URLSearchParams(window.location.search).get('code')
    if (!code) {
      navigate('/login', { replace: true })
      return
    }

    api.post<{ access_token: string }>(`/v1/auth/callback?code=${encodeURIComponent(code)}`)
      .then(({ access_token }) => {
        setToken(access_token)
        navigate('/', { replace: true })
      })
      .catch(() => navigate('/login', { replace: true }))
  }, [navigate])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--serif)',
      color: 'var(--mute)',
      fontSize: 14,
    }}>
      로그인 중...
    </div>
  )
}
