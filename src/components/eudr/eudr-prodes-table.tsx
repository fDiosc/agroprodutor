import { cn } from '@/lib/utils'

export interface EudrLayer {
  layer_name: string
  eudr_status?: string
  total_issues: number
  total_area?: number
  issues_information?: Array<{ key: string; value: string }>
}

interface EudrProdesTableProps {
  prodesLayerData: EudrLayer[]
  className?: string
}

function formatArea(ha: number): string {
  return ha.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

const EUDR_STATUS_LABELS: Record<string, string> = {
  CONFORME: 'Conforme',
  NAO_CONFORME: 'Não Conforme',
}

export function EudrProdesTable({ prodesLayerData, className }: EudrProdesTableProps) {
  const layers = Array.isArray(prodesLayerData) ? prodesLayerData : []

  if (layers.length === 0) return null

  return (
    <div className={cn('overflow-hidden rounded-lg border border-[#E5E7EB]', className)}>
      <div className="bg-[#0B1B32] px-4 py-3">
        <span className="font-medium text-white">Desmatamento - PRODES</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">
                Camada
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">
                Total de Apontamentos
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">
                Status EUDR
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">
                Área Total (ha)
              </th>
            </tr>
          </thead>
          <tbody>
            {layers.map((row, idx) => (
              <tr
                key={row.layer_name}
                className={cn(
                  'border-b border-[#E5E7EB]',
                  idx % 2 === 1 && 'bg-gray-50/50'
                )}
              >
                <td className="px-4 py-3 text-sm text-neutral-text-primary">
                  {row.layer_name}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-text-primary">
                  {new Intl.NumberFormat('pt-BR').format(row.total_issues)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                      row.eudr_status === 'CONFORME'
                        ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
                        : 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]'
                    )}
                  >
                    {EUDR_STATUS_LABELS[row.eudr_status ?? ''] ?? row.eudr_status ?? '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-text-primary">
                  {row.total_area != null ? formatArea(row.total_area) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
