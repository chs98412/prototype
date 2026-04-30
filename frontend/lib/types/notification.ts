export type NotificationType = 'follow' | 'like' | 'comment' | 'review'

export interface Notification {
  id: string
  user_id: string
  user_name: string
  user_avatar: string | null
  recipient_id: string
  type: NotificationType
  action_text: string
  related_id: string | null
  is_read: boolean
  created_at: string
  updated_at: string
}
