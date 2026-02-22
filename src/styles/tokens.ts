export const colors = {
  brand: {
    primary: '#00C287',
    gradientStart: '#00C287',
    gradientEnd: '#008CFF',
    navy: '#0B1B32',
    navyLight: '#163A5F',
  },
  neutral: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
  },
  status: {
    success: { text: '#065F46', bg: '#D1FAE5' },
    warning: { text: '#92400E', bg: '#FEF3C7' },
    error: { text: '#991B1B', bg: '#FEE2E2' },
  },
} as const

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
} as const

export const radius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
} as const

export const fontSize = {
  h1: '24px',
  h2: '20px',
  h3: '16px',
  body: '14px',
  small: '12px',
} as const
