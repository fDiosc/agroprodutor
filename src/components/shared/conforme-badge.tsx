'use client'

import { cn } from '@/lib/utils'

interface ConformeBadgeProps {
  status: string | null | undefined
  variant?: 'status' | 'apontamentos'
  className?: string
}

export function ConformeBadge({ status, variant = 'status', className }: ConformeBadgeProps) {
  if (variant === 'status') {
    if (!status) {
      return (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            'bg-gray-100 text-gray-600',
            className
          )}
        >
          Pendente
        </span>
      )
    }
    const isConforme = status === 'CONFORME'
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          isConforme
            ? 'text-[var(--color-status-success-text)] bg-[var(--color-status-success-bg)]'
            : 'text-[var(--color-status-error-text)] bg-[var(--color-status-error-bg)]',
          className
        )}
      >
        {isConforme ? 'Conforme' : 'Não Conforme'}
      </span>
    )
  }

  const hasApontamentos = status === 'Com apontamentos' || status === 'true'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        hasApontamentos
          ? 'text-[var(--color-status-error-text)] bg-[var(--color-status-error-bg)]'
          : 'text-[var(--color-status-success-text)] bg-[var(--color-status-success-bg)]',
        className
      )}
    >
      {hasApontamentos ? 'Com apontamentos' : 'Sem apontamentos'}
    </span>
  )
}
