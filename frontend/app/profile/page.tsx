import { redirect } from 'next/navigation'
import { getServerToken } from '@/lib/auth/getServerToken'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export default async function ProfilePage() {
  const token = await getServerToken()

  if (!token) {
    redirect('/login')
  }

  try {
    const res = await fetch(`${API_URL}/v1/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) {
      redirect('/login')
    }

    const user = await res.json()
    redirect(`/profile/${user.user_id}`)
  } catch (err) {
    redirect('/login')
  }
}
