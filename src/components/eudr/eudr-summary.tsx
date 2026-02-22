import { cn } from '@/lib/utils'

interface EudrSummaryProps {
  euStatus: string | null
  forestLossArea: number | null
  checkedAt: Date | null
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatArea(ha: number): string {
  return ha.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

const EU_STATUS_LABELS: Record<string, string> = {
  CONFORME: 'Conforme',
  NAO_CONFORME: 'Não Conforme',
  UNKNOWN: 'Desconhecido',
}

export function EudrSummary({
  euStatus,
  forestLossArea,
  checkedAt,
}: EudrSummaryProps) {
  const isConforme = euStatus === 'CONFORME'
  const statusLabel = EU_STATUS_LABELS[euStatus ?? ''] ?? euStatus ?? 'Desconhecido'

  return (
    <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
      <div className="bg-[#0B1B32] px-4 py-3">
        <span className="font-medium text-white">Análise EUDR</span>
      </div>
      <div className="space-y-4 bg-white p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-sm text-neutral-text-secondary">Status EUDR: </span>
            <span
              className={cn(
                'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                isConforme
                  ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
                  : 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]'
              )}
            >
              {statusLabel}
            </span>
          </div>
          {forestLossArea != null && (
            <div>
              <span className="text-sm text-neutral-text-secondary">Área de perda florestal: </span>
              <span className="text-sm font-medium text-neutral-text-primary">
                {formatArea(forestLossArea)} ha
              </span>
            </div>
          )}
          {checkedAt && (
            <div>
              <span className="text-sm text-neutral-text-secondary">Verificado em: </span>
              <span className="text-sm text-neutral-text-primary">{formatDate(checkedAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
