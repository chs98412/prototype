interface LogoMinimalProps {
  size?: number
  className?: string
}

export function LogoMinimal({ size = 40, className = '' }: LogoMinimalProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        background: 'var(--color-primary)',
        borderRadius: size * 0.25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
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
  )
}
