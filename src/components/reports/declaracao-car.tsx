import { CAR_STATUS_LABELS } from '@/lib/constants'
import { formatArea, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DeclaracaoCarProps {
  carStatus: string | null
  areaImovel: number | null
  carStatusUpdatedAt?: number | null
  className?: string
}

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-neutral-text-primary read-only:cursor-default read-only:border-gray-200'

export function DeclaracaoCar({
  carStatus,
  areaImovel,
  carStatusUpdatedAt,
  className,
}: DeclaracaoCarProps) {
  const statusLabel = carStatus ? CAR_STATUS_LABELS[carStatus] ?? carStatus : '—'
  const dateDisplay =
    carStatusUpdatedAt != null ? formatDate(carStatusUpdatedAt) : '—'
  const areaDisplay = areaImovel != null ? formatArea(areaImovel) : '—'

  return (
    <div className={cn('space-y-3', className)}>
      <h2 className="text-lg font-semibold text-neutral-text-primary">
        Declaração do CAR
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-text-secondary">
            Situação do CAR
          </label>
          <input
            type="text"
            readOnly
            value={statusLabel}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-text-secondary">
            Data de Atualização na Base MerX
          </label>
          <input
            type="text"
            readOnly
            value={dateDisplay}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-text-secondary">
            Área Total Declarada (ha)
          </label>
          <input
            type="text"
            readOnly
            value={areaDisplay}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  )
}
