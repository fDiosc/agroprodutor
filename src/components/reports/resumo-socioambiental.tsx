import { cn } from '@/lib/utils'

interface ResumoSocioambientalProps {
  status: string | null
  totalApontamentos: number
  className?: string
}

export function ResumoSocioambiental({
  status,
  totalApontamentos,
  className,
}: ResumoSocioambientalProps) {
  const hasData = status != null
  const hasApontamentos = totalApontamentos > 0

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between bg-[#0B1B32] px-4 py-3">
        <h2 className="text-lg font-semibold text-white">
          Resumo Socioambiental
        </h2>
        {hasData ? (
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium',
              hasApontamentos
                ? 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]'
                : 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
            )}
          >
            {hasApontamentos ? 'Com apontamentos' : 'Sem apontamentos'}
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            Pendente - Atualize o relatório
          </span>
        )}
      </div>
    </div>
  )
}
