import NotificationItem from './NotificationItem'
import type { Notification } from '@/lib/types/notification'

interface NotificationFeedProps {
  notifications: Notification[]
  isLoading: boolean
  error: string | null
  onDelete: (id: string) => void
}

export default function NotificationFeed({
  notifications,
  isLoading,
  error,
  onDelete
}: NotificationFeedProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-8">
        <p className="text-center text-sm text-red-600">{error}</p>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="px-4 py-12">
        <p className="text-center text-gray-500">아직 알림이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
