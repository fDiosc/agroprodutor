'use client'

import { ConformeBadge } from '@/components/shared/conforme-badge'
import { ApontamentoCounter } from '@/components/shared/apontamento-counter'
import { formatDateTime, formatCpfCnpj } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface SupplierResultProps {
  supplierCpfCnpj: string | null
  supplierName: string | null
  supplierCar: string | null
  esgStatus: string | null
  eudrStatus: string | null
  reportData: unknown
  checkedAt: Date | string
  className?: string
}

function getTotalApontamentos(reportData: unknown): number | null {
  if (!reportData || typeof reportData !== 'object') return null
  const data = reportData as Record<string, unknown>
  if (typeof data.total_apontamentos === 'number') return data.total_apontamentos
  const producerKeys = [
    'qtd_apontamentos_sema_mt',
    'qtd_apontamentos_ibama',
    'qtd_apontamentos_lista_suja',
    'qtd_apontamentos_moratoria_soja',
    'qtd_apontamentos_icmbio_produtor',
    'qtd_apontamentos_sema_pa',
  ]
  const sum = producerKeys.reduce(
    (acc, key) => acc + (typeof data[key] === 'number' ? (data[key] as number) : 0),
    0
  )
  return sum > 0 ? sum : null
}

export function SupplierResult({
  supplierCpfCnpj,
  supplierName,
  supplierCar,
  esgStatus,
  eudrStatus,
  reportData,
  checkedAt,
  className,
}: SupplierResultProps) {
  const displayName =
    supplierName ||
    (supplierCpfCnpj ? `CPF/CNPJ: ${formatCpfCnpj(supplierCpfCnpj)}` : null) ||
    (supplierCar ? `CAR: ${supplierCar}` : null) ||
    '—'
  const totalApontamentos = getTotalApontamentos(reportData)

  return (
    <div
      className={cn(
        'rounded-lg border border-neutral-border bg-white p-4 shadow-card',
        className
      )}
    >
      <h3 className="text-lg font-semibold text-neutral-text-primary">
        {displayName}
      </h3>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ConformeBadge status={esgStatus} variant="status" />
        {eudrStatus != null && (
          <ConformeBadge status={eudrStatus} variant="status" />
        )}
        {totalApontamentos != null && (
          <ApontamentoCounter count={totalApontamentos} />
        )}
      </div>
      <p className="mt-3 text-sm text-neutral-text-secondary">
        Consultado em {formatDateTime(checkedAt)}
      </p>
    </div>
  )
}
