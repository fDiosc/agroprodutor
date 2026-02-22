'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface AlertsFilterProps {
  currentSeverity?: string
  currentRead?: string
}

const SEVERITY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'INFO', label: 'Informativo' },
  { value: 'WARNING', label: 'Atenção' },
  { value: 'CRITICAL', label: 'Urgente' },
]

const READ_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'false', label: 'Pendentes' },
  { value: 'true', label: 'Resolvidos' },
]

export function AlertsFilter({
  currentSeverity,
  currentRead,
}: AlertsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/monitoring?${params.toString()}`)
  }

  return (
    <div data-testid="alerts-filter" className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-neutral-text-secondary">
          Prioridade:
        </span>
        {SEVERITY_OPTIONS.map((opt) => (
          <button
            key={opt.value || 'all-severity'}
            type="button"
            onClick={() => updateParams('severity', opt.value)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              (opt.value ? currentSeverity === opt.value : !currentSeverity)
                ? 'bg-[var(--color-brand-navy)] text-white'
                : 'bg-neutral-surface border border-neutral-border text-neutral-text-primary hover:bg-neutral-border'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-neutral-text-secondary">
          Situação:
        </span>
        {READ_OPTIONS.map((opt) => (
          <button
            key={opt.value || 'all-read'}
            type="button"
            onClick={() => updateParams('read', opt.value)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              (opt.value ? currentRead === opt.value : !currentRead)
                ? 'bg-[var(--color-brand-navy)] text-white'
                : 'bg-neutral-surface border border-neutral-border text-neutral-text-primary hover:bg-neutral-border'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
