import { theme } from '../../theme.config'

interface LogoDefaultProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { icon: 28, text: 20, radius: 7 },
  md: { icon: 40, text: 28, radius: 10 },
  lg: { icon: 52, text: 36, radius: 13 },
}

export function LogoDefault({ size = 'md', className = '' }: LogoDefaultProps) {
  const s = sizes[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        style={{
          width: s.icon,
          height: s.icon,
          background: `var(--color-primary)`,
          borderRadius: s.radius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width={s.icon * 0.55}
          height={s.icon * 0.55}
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="2" y="4" width="18" height="14" rx="2" stroke="white" strokeWidth="1.8" />
          <path d="M2 8h18" stroke="white" strokeWidth="1.8" />
          <circle cx="6" cy="6" r="1" fill="white" />
          <circle cx="9" cy="6" r="1" fill="white" />
          <path
            d="M9 13l2.5 2L16 11"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <span
        style={{
          fontSize: s.text,
          fontWeight: 800,
          color: 'var(--color-text)',
          letterSpacing: '-0.5px',
          lineHeight: 1,
        }}
      >
        {theme.logo.wordmark.slice(0, 1)}
        <span style={{ color: 'var(--color-primary)' }}>
          {theme.logo.wordmark.slice(1, 2)}
        </span>
        {theme.logo.wordmark.slice(2)}
      </span>
    </div>
  )
}
