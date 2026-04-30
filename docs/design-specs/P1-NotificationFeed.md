# P1: 알림 시스템 (NotificationFeed)

## 📋 개요
사용자의 활동 알림을 표시하는 피드 페이지. 팔로우, 좋아요, 댓글 등의 활동을 시간 역순으로 표시.

## 🎨 페이지 구조

```
┌─────────────────────────────────────┐
│         NotificationFeed            │
├─────────────────────────────────────┤
│ [NotificationItem]                  │
│ ├─ Avatar (32px)                    │
│ ├─ Action Text                      │
│ ├─ Timestamp (몇 일 전)             │
│ └─ [Menu Icon]                      │
├─────────────────────────────────────┤
│ [NotificationItem]                  │
│ ...                                 │
└─────────────────────────────────────┘
```

## 🧩 컴포넌트 상세

### 1. NotificationFeed (페이지)
**책임**: 알림 리스트 조회 및 표시

**Props**:
```ts
interface NotificationFeedProps {
  notifications: Notification[];
  onNotificationClick: (id: string) => void;
  onNotificationDelete: (id: string) => void;
}
```

**기능**:
- 알림 리스트 로드 (무한 스크롤 또는 페이지네이션)
- 알림 클릭 → 해당 페이지 이동
- 알림 삭제

---

### 2. NotificationItem (컴포넌트)
**책임**: 단일 알림 아이템 렌더링

**Props**:
```ts
interface NotificationItemProps {
  notification: {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    type: 'follow' | 'like' | 'comment' | 'review';
    actionText: string;  // "팔로우했습니다"
    createdAt: Date;
    relatedId?: string;  // 관련 영화/리뷰 ID
  };
  onClick: () => void;
  onDelete: () => void;
}
```

**UI 스펙**:
```
┌────────────────────────────────────────┐
│ [32px Avatar] 사용자명 동작 ... ⋮      │
│                   몇 일 전              │
└────────────────────────────────────────┘
```

**레이아웃**:
- Flexbox (row)
- Avatar: 32px 원형, margin-right: 12px
- 텍스트: flex-grow: 1
- 메뉴: margin-left: auto
- Padding: 12px 16px
- Border-bottom: 1px #eee

**색상**:
- 텍스트: #333
- 타임스탬프: #999
- 배경 (hover): #f5f5f5

**상호작용**:
- 클릭: 해당 영화/리뷰로 이동
- 메뉴 버튼: 삭제 옵션 표시

---

## 📱 상태 관리

**데이터 흐름**:
```
Supabase RPC (get_notifications)
  ↓
NotificationFeed State
  ↓
NotificationItem 컴포넌트 렌더링
```

**Supabase RPC** (`get_notifications`):
```sql
SELECT 
  n.id, n.user_id, n.type, n.created_at,
  u.name, u.avatar_url,
  CASE 
    WHEN n.type = 'follow' THEN CONCAT(u.name, ' 님이 팔로우했습니다')
    WHEN n.type = 'like' THEN CONCAT(u.name, ' 님이 좋아했습니다')
    WHEN n.type = 'comment' THEN CONCAT(u.name, ' 님이 댓글을 달았습니다')
    ELSE ''
  END as action_text
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE n.recipient_id = auth.uid()
ORDER BY n.created_at DESC
LIMIT 20;
```

---

## 🔧 기술 스펙

**파일 위치**:
```
app/
├── components/
│   ├── notifications/
│   │   ├── NotificationFeed.tsx
│   │   ├── NotificationItem.tsx
│   │   └── useNotifications.ts (hook)
└── pages/
    └── notifications.tsx
```

**API 연결**:
- 조회: `getRealtime('notifications')`로 실시간 업데이트
- 삭제: `deleteNotification(id)`
- 마크 리드: `markNotificationRead(id)`

**라이브러리**:
- Framer Motion (스윽 에니메이션)
- Zustand (상태 관리)

---

## ✅ 승인 기준 (AC)

- [ ] NotificationFeed 페이지 구현
- [ ] NotificationItem 컴포넌트 구현
- [ ] 실시간 알림 업데이트 (Supabase Realtime)
- [ ] 알림 삭제 기능
- [ ] 알림 클릭 → 해당 페이지 이동
- [ ] 아바타 + 액션 텍스트 + 타임스탬프 정확히 표시
- [ ] 무한 스크롤 또는 페이지네이션
- [ ] 모바일 반응형 테스트

---

## 🎬 v0.dev 프롬프트

```
Create a notification feed page for a movie social app. 

Components:
1. NotificationFeed: List container with infinite scroll
   - Empty state: "아직 알림이 없습니다"
   
2. NotificationItem: Single notification row
   - Left: 32px avatar (circular)
   - Middle: User name + action text (e.g., "김철순 님이 팔로우했습니다") + timestamp (relative, e.g., "1일 전")
   - Right: 3-dot menu (delete option)
   - Hover state: light gray background (#f5f5f5)
   - Click: navigate to related item

Styling:
- Color: #333 for text, #999 for timestamp
- Padding: 12px 16px
- Border-bottom: 1px #eee
- Responsive: Full width on mobile
```

