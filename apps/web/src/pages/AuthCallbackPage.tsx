import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { setToken } from '../lib/auth'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const called = useRef(false)
  const [status, setStatus] = useState('초기화 중...')

  useEffect(() => {
    if (called.current) return
    called.current = true

    const fullUrl = window.location.href
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')

    setStatus(`URL: ${fullUrl}\ncode: ${code ? code.slice(0, 20) + '...' : 'null'}\nerror: ${error ?? 'null'}`)

    if (error) {
      setStatus(prev => prev + `\n\nGoogle 오류: ${error}`)
      return
    }

    if (!code) {
      setStatus(prev => prev + '\n\ncode 없음 → /login으로 이동')
      setTimeout(() => navigate('/login', { replace: true }), 3000)
      return
    }

    setStatus(prev => prev + '\n\nAPI 호출 중...')
    api.post<{ access_token: string }>(`/v1/auth/callback?code=${encodeURIComponent(code)}`)
      .then(({ access_token }) => {
        setToken(access_token)
        setStatus(prev => prev + '\n\n✅ 토큰 저장 완료 → / 이동')
        setTimeout(() => navigate('/', { replace: true }), 1000)
      })
      .catch((err) => {
        setStatus(prev => prev + `\n\n❌ API 실패: ${String(err)}`)
      })
  }, [navigate])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24,
      fontFamily: 'var(--sans)', gap: 16,
    }}>
      <div style={{ fontSize: 13, color: '#666' }}>로그인 처리 중...</div>
      <pre style={{
        fontSize: 11, color: '#333', background: '#f5f5f5',
        padding: 16, borderRadius: 8, maxWidth: 500, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
      }}>{status}</pre>
      <button onClick={() => navigate('/login')} style={{
        padding: '8px 20px', borderRadius: 6, border: '1px solid #ccc',
        background: '#fff', cursor: 'pointer', fontSize: 13,
      }}>로그인으로 돌아가기</button>
    </div>
  )
}
