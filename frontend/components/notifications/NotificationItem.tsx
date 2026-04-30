'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils/date'
import type { Notification } from '@/lib/types/notification'

interface NotificationItemProps {
  notification: Notification
  onDelete: (id: string) => void
}

export default function NotificationItem({
  notification,
  onDelete
}: NotificationItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notification.id)

      if (error) throw error
      onDelete(notification.id)
    } catch (err) {
      console.error('Failed to delete notification:', err)
    } finally {
      setIsDeleting(false)
      setShowMenu(false)
    }
  }

  const getNavigationUrl = () => {
    switch (notification.type) {
      case 'follow':
        return `/profile/${notification.user_id}`
      case 'like':
      case 'comment':
        return `/review/${notification.related_id}`
      default:
        return '#'
    }
  }

  return (
    <Link href={getNavigationUrl()}>
      <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group relative">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {notification.user_avatar ? (
            <Image
              src={notification.user_avatar}
              alt={notification.user_name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300" />
          )}
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          <p className="text-sm text-gray-900">
            <span className="font-semibold">{notification.user_name}</span>{' '}
            {notification.action_text}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatRelativeTime(new Date(notification.created_at))}
          </p>
        </div>

        {/* Menu */}
        <div className="flex-shrink-0 relative">
          <button
            onClick={(e) => {
              e.preventDefault()
              setShowMenu(!showMenu)
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            aria-label="메뉴"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {/* Dropdown */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg z-10 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleDelete()
                }}
                disabled={isDeleting}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
