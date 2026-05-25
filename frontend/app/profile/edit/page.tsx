'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getClientToken } from '@/lib/auth/getToken'
import { updateProfile } from '@/app/actions/profile'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export default function ProfileEditPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState('')
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [customListName, setCustomListName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const token = await getClientToken()
        const res = await fetch(`${API_URL}/v1/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to load profile')
        const profile = await res.json()
        if (profile) {
          setDisplayName(profile.display_name ?? '')
          setBio(profile.bio ?? '')
          setAvatarUrl(profile.avatar_url ?? null)
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
        router.replace('/login')
      } finally {
        setLoading(false)
        setIsDirty(false)
      }
    }
    load()
  }, [router])

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    // File upload not yet implemented - use avatar URL in profile settings instead
    alert('파일 업로드는 현재 준비 중입니다.')
  }

  async function handleDeletePhoto() {
    setAvatarUrl(null)
  }

  async function handleSave() {
    if (saving || !displayName.trim()) return
    setSaving(true)
    try {
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
      })

      setIsDirty(false)
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
        <div className="px-4 py-8 flex flex-col items-center gap-6 border-b border-gray-200">
          <div className="relative w-30 h-30 rounded-full overflow-hidden bg-gray-200 shadow-md border-4 border-gray-100">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile"
                fill
                className="object-cover"
                sizes="120px"
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
        <div className="px-4 py-4 flex flex-col gap-0 divide-y divide-gray-200">
          {/* Name */}
          <div className="py-4">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              이름
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value)
                setIsDirty(true)
              }}
              maxLength={50}
              placeholder="이름을 입력하세요"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{displayName.length}/50</p>
          </div>

          {/* Nickname */}
          <div className="py-4">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              별명
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value)
                setIsDirty(true)
              }}
              maxLength={20}
              placeholder="별명을 입력하세요"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{nickname.length}/20</p>
          </div>

          {/* Bio */}
          <div className="py-4">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              한 줄 설명
            </label>
            <textarea
              value={bio}
              onChange={(e) => {
                setBio(e.target.value)
                setIsDirty(true)
              }}
              maxLength={100}
              rows={3}
              placeholder="자신을 소개하세요"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{bio.length}/100</p>
          </div>

          {/* Custom List Name */}
          <div className="py-4">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              내가 볼 뻔했어?
            </label>
            <input
              type="text"
              value={customListName}
              onChange={(e) => {
                setCustomListName(e.target.value)
                setIsDirty(true)
              }}
              maxLength={30}
              placeholder="커스텀 목록 이름"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{customListName.length}/30</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-4 flex gap-2 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving || !displayName.trim() || !isDirty}
            className="flex-1 py-3 font-semibold rounded-lg transition-colors"
            style={{
              backgroundColor: isDirty && displayName.trim() ? '#007AFF' : '#E8E8E8',
              color: isDirty && displayName.trim() ? '#fff' : '#999',
              cursor: isDirty && displayName.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 bg-white border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </main>
  )
}
