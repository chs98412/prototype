'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/app/actions/profile'

export default function ProfileEditPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

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
        .select('display_name, bio, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle()
      if (profile) {
        setDisplayName(profile.display_name ?? '')
        setBio(profile.bio ?? '')
        setAvatarUrl(profile.avatar_url ?? null)
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const filename = `${user.id}-${Date.now()}`
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filename, file, { upsert: true })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filename)

      setAvatarUrl(publicUrl)
    } catch (err) {
      console.error('Failed to upload photo:', err)
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleDeletePhoto() {
    setAvatarUrl(null)
  }

  async function handleSave() {
    if (saving) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('user_profiles')
        .update({
          display_name: displayName,
          bio: bio || null,
          avatar_url: avatarUrl
        })
        .eq('user_id', user.id)

      router.push('/profile')
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="flex flex-col min-h-screen bg-white items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-center h-14 px-4 border-b border-gray-200 bg-white">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="font-bold text-lg">프로필 편집</h1>
      </div>

      <div className="flex-1 flex flex-col divide-y divide-gray-200">
        {/* Photo Section */}
        <div className="px-4 py-6 flex flex-col items-center gap-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 shadow-md border-4 border-gray-100">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile"
                fill
                className="object-cover"
                sizes="128px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">👤</div>
            )}
          </div>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {uploadingPhoto ? '업로드 중...' : '사진 선택'}
            </button>
            {avatarUrl && (
              <button
                onClick={handleDeletePhoto}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                삭제
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>

        {/* Form Section */}
        <div className="px-4 py-4 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              이름
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              placeholder="이름을 입력하세요"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{displayName.length}/50</p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              한 줄 설명
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={100}
              rows={3}
              placeholder="자신을 소개하세요"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{bio.length}/100</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-4 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !displayName.trim()}
            className="flex-1 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </main>
  )
}
