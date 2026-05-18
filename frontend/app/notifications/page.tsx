'use client'

import { useEffect, useState } from 'react'
import { getNotifications } from '@/lib/api/fetch'
import NotificationFeed from '@/components/notifications/NotificationFeed'
import type { Notification } from '@/lib/types/notification'

export const dynamic = 'force-dynamic'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        const response = await getNotifications(20, 0)

        if (response.error) {
          setError(response.error)
          return
        }

        // Type conversion - backend provides different fields than required
        setNotifications((response.data as any || []) as Notification[])
      } catch (err) {
        setError(err instanceof Error ? err.message : '알림 로드 실패')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-10">
          <h1 className="text-xl font-bold text-gray-900">알림</h1>
        </div>

        {/* Content */}
        <NotificationFeed
          notifications={notifications}
          isLoading={isLoading}
          error={error}
          onDelete={(id) => {
            setNotifications((prev) => prev.filter((n) => n.id !== id))
          }}
        />
      </div>
    </div>
  )
}
