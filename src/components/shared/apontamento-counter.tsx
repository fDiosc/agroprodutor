'use client'

import { cn } from '@/lib/utils'

interface ApontamentoCounterProps {
  count: number
  className?: string
}

export function ApontamentoCounter({ count, className }: ApontamentoCounterProps) {
  const hasApontamentos = count > 0

  return (
    <span
      className={cn(
        'inline-flex items-center text-sm font-medium',
        hasApontamentos
          ? 'rounded px-2 py-0.5 text-[var(--color-status-error-text)] bg-[var(--color-status-error-bg)]'
          : 'text-[var(--color-status-success-text)]',
        className
      )}
    >
      {count} {count === 1 ? 'apontamento' : 'apontamentos'}
    </span>
  )
}
