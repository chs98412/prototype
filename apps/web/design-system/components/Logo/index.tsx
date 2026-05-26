import { theme } from '../../theme.config'
import { LogoDefault } from './LogoDefault'
import { LogoMinimal } from './LogoMinimal'

export type { } from './LogoDefault'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  iconOnly?: boolean
  className?: string
}

export function Logo({ size = 'md', iconOnly = false, className = '' }: LogoProps) {
  if (iconOnly || theme.logo.variant === 'minimal') {
    const iconSize = size === 'sm' ? 28 : size === 'lg' ? 52 : 40
    return <LogoMinimal size={iconSize} className={className} />
  }

  return <LogoDefault size={size} className={className} />
}
