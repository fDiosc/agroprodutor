'use client'

import { cn } from '@/lib/utils'

type Severity = 'INFO' | 'WARNING' | 'CRITICAL'

interface SeverityBadgeProps {
  severity: Severity
  className?: string
}

const SEVERITY_CONFIG: Record<Severity, { bg: string; text: string; label: string }> = {
  INFO: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    label: 'Informativo',
  },
  WARNING: {
    bg: 'bg-[var(--color-status-warning-bg)]',
    text: 'text-[var(--color-status-warning-text)]',
    label: 'Atenção',
  },
  CRITICAL: {
    bg: 'bg-[var(--color-status-error-bg)]',
    text: 'text-[var(--color-status-error-text)]',
    label: 'Urgente',
  },
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.INFO
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  )
}
