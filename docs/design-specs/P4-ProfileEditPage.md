# P4: 프로필 편집 페이지 개선 (ProfileEditPage)

## 📋 개요
사용자 프로필을 편집하는 페이지. 프로필 사진, 이름, 별명, 한 줄 설명, 커스텀 목록 이름을 수정할 수 있음.

## 🎨 페이지 구조

### 현재 구조 (기존)
```
┌────────────────────┐
│ 프로필 편집        │
├────────────────────┤
│ 이름 [입력]        │
│ 별명 [입력]        │
│ 소개 [입력]        │
│ [저장]             │
└────────────────────┘
```

### 신규 구조 (개선)
```
┌────────────────────────┐
│   프로필 편집          │
├────────────────────────┤
│                        │
│    [큰 프로필 사진]    │  ← 중앙, 120px
│   [사진 선택] [삭제]   │  ← 2개 버튼
│                        │
├────────────────────────┤
│ 이름                   │
│ [입력 필드]            │
├────────────────────────┤
│ 별명                   │
│ [입력 필드]            │
├────────────────────────┤
│ 한 줄 설명             │
│ [입력 필드]            │
├────────────────────────┤
│ 내가 볼 뻔했어?       │
│ [입력 필드]            │  ← 커스텀 목록 이름
├────────────────────────┤
│  [저장]  [취소]        │
└────────────────────────┘
```

## 🧩 컴포넌트 상세

### 1. ProfileEditPage (페이지)
**책임**: 프로필 편집 폼 관리 및 제출

**State**:
```ts
const [formData, setFormData] = useState({
  name: string;
  nickname: string;
  bio: string;
  customListName: string;
  avatarUrl: string;
});

const [isDirty, setIsDirty] = useState(false);
const [isLoading, setIsLoading] = useState(false);
```

**기능**:
- 각 필드 입력 처리
- 저장/취소 버튼
- 폼 변경 감지 (isDirty)
- 저장 요청 처리

---

### 2. ProfilePhotoSection (컴포넌트)
**책임**: 프로필 사진 업로드 및 삭제

**UI**:
```
┌──────────────────────┐
│                      │
│  [120px 원형 사진]   │  ← 중앙 정렬
│                      │
├──────────────────────┤
│ [사진 선택]  [삭제]  │  ← 2개 버튼, 50% 각각
└──────────────────────┘
```

**Props**:
```ts
interface ProfilePhotoSectionProps {
  avatarUrl: string | null;
  onPhotoSelect: (file: File) => void;
  onPhotoDelete: () => void;
  isLoading: boolean;
}
```

**스타일**:
```ts
{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  padding: '24px 16px',
  
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #f0f0f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  
  buttons: {
    display: 'flex',
    gap: '8px',
    width: '100%'
  }
}
```

**버튼**:
- "사진 선택": 주색 (#007AFF)
- "삭제": 회색 (#E8E8E8), 사진이 없으면 비활성

---

### 3. FormSection (컴포넌트)
**책임**: 각 폼 섹션 렌더링

**UI**:
```
┌──────────────────────┐
│ 라벨 (옵션 텍스트)   │  ← 12px gray, 700
│ [입력 필드]          │
└──────────────────────┘
```

**Props**:
```ts
interface FormSectionProps {
  label: string;
  optional?: boolean;
  children: ReactNode;
}
```

**스타일**:
```ts
{
  padding: '16px',
  borderTop: '1px solid #eee',
  
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#666',
    marginBottom: '8px',
    display: 'block'
  }
}
```

---

### 4. FormInput (컴포넌트)
**책임**: 텍스트 입력 필드

**Props**:
```ts
interface FormInputProps {
  type?: 'text' | 'email' | 'textarea';
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
}
```

**UI**:
```
┌────────────────────────┐
│ [입력 필드]            │
│ 입력 글자수 / 최대     │  ← 우측 하단, 12px gray
└────────────────────────┘
```

**스타일**:
```ts
{
  width: '100%',
  padding: '12px',
  fontSize: '16px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  outline: 'none',
  transition: 'border-color 0.2s',
  
  '&:focus': {
    borderColor: '#007AFF',
    boxShadow: '0 0 0 3px rgba(0,122,255,0.1)'
  }
}
```

**Textarea (한 줄 설명용)**:
- Min-height: 60px
- Max-length: 100자
- 실시간 글자 수 표시

---

### 5. ActionButtons (컴포넌트)
**책임**: 저장/취소 버튼

**UI**:
```
┌──────────────────────┐
│  [저장]  [취소]      │  ← 2개 버튼, 50% 각각
└──────────────────────┘
```

**Props**:
```ts
interface ActionButtonsProps {
  onSave: () => Promise<void>;
  onCancel: () => void;
  isDirty: boolean;
  isLoading: boolean;
}
```

**스타일**:
```ts
{
  display: 'flex',
  gap: '8px',
  padding: '16px',
  borderTop: '1px solid #eee',
  
  saveBtn: {
    flex: 1,
    background: isDirty ? '#007AFF' : '#E8E8E8',
    color: isDirty ? '#fff' : '#ccc',
    cursor: isDirty ? 'pointer' : 'not-allowed'
  },
  
  cancelBtn: {
    flex: 1,
    background: '#fff',
    border: '1px solid #ddd',
    color: '#333'
  }
}
```

**상호작용**:
- 저장: 변경이 없으면 비활성 (disabled)
- 저장 중: 로딩 상태 표시
- 취소: 이전 페이지 또는 프로필 페이지로 이동

---

## 📱 반응형

| 화면 | 프로필 사진 크기 | 레이아웃 |
|------|----------------|---------|
| Mobile (375px) | 100px | 전체 너비, 한 열 |
| Tablet (768px) | 120px | 전체 너비, 한 열 |
| Desktop (1280px) | 140px | 중앙 정렬 (max-width: 500px) |

---

## 🔧 기술 스펙

**파일 위치**:
```
app/
├── components/
│   ├── profile/
│   │   ├── ProfileEditPage.tsx
│   │   ├── ProfilePhotoSection.tsx
│   │   ├── FormSection.tsx
│   │   ├── FormInput.tsx
│   │   └── ActionButtons.tsx
│   └── common/
│       └── ImageUpload.tsx (재사용)
```

**API 연결**:
- 프로필 조회: `getUserProfile(userId)`
- 프로필 업데이트: `updateUserProfile(data)`
- 사진 업로드: `uploadProfilePhoto(file)` (Supabase Storage)
- 사진 삭제: `deleteProfilePhoto(userId)`

**Supabase Storage**:
```
Bucket: avatars/
Path: {user_id}/profile.jpg
```

**폼 검증**:
- 이름: 필수, 1-50자
- 별명: 선택, 1-20자
- 한 줄 설명: 선택, 1-100자
- 목록 이름: 선택, 1-30자

---

## ✅ 승인 기준 (AC)

- [ ] ProfilePhotoSection 구현 (120px 원형, 중앙)
- [ ] "사진 선택" 버튼 (파일 업로드)
- [ ] "삭제" 버튼 (확인 후 삭제)
- [ ] FormSection 컴포넌트 (라벨 + 입력)
- [ ] FormInput 컴포넌트 (텍스트/텍스트에어어)
- [ ] 글자 수 카운팅 표시
- [ ] 저장/취소 버튼 (isDirty 기반 활성/비활성)
- [ ] 폼 검증 (길이, 필수 필드)
- [ ] 저장 요청 처리 (로딩 상태)
- [ ] 모바일 반응형 테스트
- [ ] 사진 업로드 진행률 표시 (선택)
- [ ] 취소 시 변경사항 확인 (선택)

---

## 🎬 v0.dev 프롬프트

```
Create a profile edit page for a movie app.

ProfilePhotoSection:
- Large circular avatar (120px, centered) with border and subtle shadow
- Below: "사진 선택" button (blue, full-width 50%) and "삭제" button (gray, full-width 50%)
- Gap between buttons: 8px
- Placeholder if no photo: gray background with camera icon

Form sections (each section):
- Gray label (12px, 700 weight) at top
- Input field below (or textarea for bio)
  - Padding: 12px
  - Border: 1px #ddd
  - Border-radius: 8px
  - Focus: blue border + light blue shadow
  - Font: 16px

Fields (in order):
1. "이름" - text input, placeholder "이름을 입력하세요", max 50 chars, required
2. "별명" - text input, placeholder "별명을 입력하세요", max 20 chars
3. "한 줄 설명" - textarea, placeholder "자신을 소개하세요", max 100 chars, show char count
4. "내가 볼 뻔했어?" - text input, placeholder "커스텀 목록 이름", max 30 chars

Bottom section:
- 2 buttons: "저장" (blue, enabled only if form changed) and "취소" (gray border)
- Each button: 50% width, 8px gap
- Height: 44px, bold text

Spacing:
- Each section: padding 16px, border-top 1px #eee
- Photo section: 24px padding, 16px gap between photo and buttons

All inputs should have smooth focus transitions and validation states.
```

