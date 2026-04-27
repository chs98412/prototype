export const theme = {
  colors: {
    primary:    '#FF5733',
    background: '#FFFFFF',
    surface:    '#F5F5F5',
    text:       '#1A1A1A',
    textMuted:  '#6B6B6B',
    border:     '#E5E5E5',
    accent:     '#FFC107',
  },
  typography: {
    fontFamily: 'Pretendard, Inter, sans-serif',
    baseSize:   '16px',
  },
  logo: {
    variant:  'default' as 'default' | 'minimal',
    wordmark: 'Logged',
  },
  layout: {
    nav:          'bottom-tab' as 'bottom-tab' | 'top-bar' | 'sidebar',
    card:         'poster'     as 'poster' | 'list' | 'grid',
    borderRadius: '12px',
    spacing:      '4px',
  },
} as const

export type Theme = typeof theme
