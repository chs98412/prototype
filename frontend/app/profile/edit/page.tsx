'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/app/actions/profile'
import { BackButton } from '@/components/content/BackButton'

export default function ProfileEditPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('display_name, bio')
        .eq('user_id', user.id)
        .maybeSingle()
      if (profile) {
        setDisplayName(profile.display_name ?? '')
        setBio(profile.bio ?? '')
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSave() {
    if (saving) return
    setSaving(true)
    try {
      await updateProfile({ displayName, bio })
      router.push('/profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="flex flex-col min-h-screen bg-background items-center justify-center">
        <div className="w-6 h-6 border-2 border-text border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen bg-background">
      <div className="relative flex items-center justify-center h-14 px-4">
        <div className="absolute left-4">
          <BackButton />
        </div>
        <span className="text-text font-semibold text-[16px]">프로필 편집</span>
      </div>

      <div className="flex flex-col gap-5 px-4 mt-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-text text-[13px] font-medium">이름</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full h-11 px-3 border border-border bg-background text-text text-[15px] outline-none focus:border-text rounded-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-text text-[13px] font-medium">한 줄 소개</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={80}
            rows={3}
            className="w-full px-3 py-2.5 border border-border bg-background text-text text-[15px] outline-none focus:border-text resize-none rounded-sm"
          />
          <span className="text-muted text-[11px] text-right">{bio.length}/80</span>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !displayName.trim()}
          className="w-full h-12 bg-text text-white font-semibold text-[15px] disabled:opacity-50"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </main>
  )
}
