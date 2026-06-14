import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { setToken } from '../lib/auth'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const called = useRef(false)
  const [error, setError] = useState<string | null>(null)

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
      .catch((err) => {
        console.error('Auth callback error:', err)
        setError(String(err))
      })
  }, [navigate])

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 24,
        fontFamily: 'var(--sans)', gap: 16,
      }}>
        <div style={{ fontSize: 14, color: '#c44', maxWidth: 400, textAlign: 'center' }}>
          로그인 실패: {error}
        </div>
        <button onClick={() => navigate('/login')} style={{
          padding: '8px 20px', borderRadius: 6, border: '1px solid #ccc',
          background: '#fff', cursor: 'pointer', fontSize: 13,
        }}>돌아가기</button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--serif)', color: 'var(--mute)', fontSize: 14,
    }}>
      로그인 중...
    </div>
  )
}
