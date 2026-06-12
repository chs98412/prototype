type P = { size?: number; stroke?: string; strokeWidth?: number };

export function HomeIcon({ size = 24, stroke = '#1f1f1f', strokeWidth = 1.8 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9.5Z"
        stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
  );
}

export function SearchIcon({ size = 24, stroke = '#1f1f1f', strokeWidth = 1.8 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke={stroke} strokeWidth={strokeWidth} />
      <path d="m20 20-3.6-3.6" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function BellIcon({ size = 24, stroke = '#1f1f1f', strokeWidth = 1.8, dot = false }: P & { dot?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 16V11.5a6 6 0 0 1 12 0V16l1.5 2h-15L6 16Z"
        stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M10 20a2 2 0 0 0 4 0" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      {dot && <circle cx="18" cy="6" r="3" fill="#c44" stroke="#fff" strokeWidth="1" />}
    </svg>
  );
}

export function PersonIcon({ size = 24, stroke = '#1f1f1f', strokeWidth = 1.8 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="9" r="4" stroke={stroke} strokeWidth={strokeWidth} />
      <path d="M4 20.5c0-3.6 3.6-6.5 8-6.5s8 2.9 8 6.5"
        stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function HeartIcon({ size = 18, stroke = '#1f1f1f', strokeWidth = 1.6, filled = false }: P & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? stroke : 'none'}>
      <path d="M12 20s-7-4.5-9-9c-1.2-2.7.5-6 3.5-6 1.9 0 3.5 1 4.5 2.5C12 6 13.6 5 15.5 5c3 0 4.7 3.3 3.5 6-2 4.5-7 9-7 9Z"
        stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
  );
}

export function CommentIcon({ size = 18, stroke = '#1f1f1f', strokeWidth = 1.6 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4 4v-4H6.5A2.5 2.5 0 0 1 4 14.5v-8Z"
        stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
  );
}

export function BookmarkIcon({ size = 18, stroke = '#1f1f1f', strokeWidth = 1.6, filled = false }: P & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? stroke : 'none'}>
      <path d="M6 4h12v17l-6-4-6 4V4Z" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
  );
}

export function PencilIcon({ size = 18, stroke = '#1f1f1f', strokeWidth = 1.6 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 20h4l10-10-4-4L4 16v4Z" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="m14 6 4 4" stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  );
}

export function StarIcon({ size = 14, stroke = '#1f1f1f', strokeWidth = 1.4, filled = false }: P & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? stroke : 'none'}>
      <path d="m12 3 2.6 6 6.4.6-4.9 4.2L17.6 21 12 17.3 6.4 21l1.5-7.2L3 9.6 9.4 9 12 3Z"
        stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
  );
}

export function EllipsisIcon({ size = 18, stroke = '#1f1f1f' }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={stroke}>
      <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

export function BackIcon({ size = 24, stroke = '#1f1f1f', strokeWidth = 1.8 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="m14 6-6 6 6 6" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlusIcon({ size = 18, stroke = '#9a9a9a', strokeWidth = 1.8 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function CameraIcon({ size = 14, stroke = '#1f1f1f', strokeWidth = 1.6 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke={stroke} strokeWidth={strokeWidth} />
      <circle cx="12" cy="14" r="3.5" stroke={stroke} strokeWidth={strokeWidth} />
      <path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  );
}

export function SparkleIcon({ size = 14, stroke = '#1f1f1f', strokeWidth = 1.6 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
        stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}
