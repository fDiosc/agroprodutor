'use client'

import { cn } from '@/lib/utils'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { DetalhamentoApontamentos } from '@/components/reports/detalhamento-apontamentos'

interface EudrLayer {
  layer_name: string
  total_issues: number
  eudr_status?: string
  total_area?: number
  issues_information?: Array<{ key: string; value: string }>
}

interface EudrPropertySectionProps {
  euStatus: string | null
  forestLossArea: number | null
  layerData: EudrLayer[] | null
  prodesLayerData: EudrLayer[] | null
  checkedAt: Date | null
  className?: string
}

const EUDR_STATUS_LABELS: Record<string, string> = {
  CONFORME: 'Conforme',
  NAO_CONFORME: 'Não Conforme',
  RISK: 'Risco',
  NO_RISK: 'Sem Risco',
  compliant: 'Conforme',
  non_compliant: 'Não Conforme',
}

function formatArea(ha: number): string {
  return ha.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

export function EudrPropertySection({
  euStatus,
  forestLossArea,
  layerData,
  prodesLayerData,
  checkedAt,
  className,
}: EudrPropertySectionProps) {
  const hasData = euStatus != null

  return (
    <CollapsibleSection
      title="EUDR - Regulamento Europeu"
      badge={
        hasData ? (
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-medium',
              euStatus === 'CONFORME' || euStatus === 'compliant' || euStatus === 'NO_RISK'
                ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
                : 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]'
            )}
          >
            {EUDR_STATUS_LABELS[euStatus ?? ''] ?? euStatus}
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            Pendente
          </span>
        )
      }
      className={className}
    >
      {!hasData ? (
        <div className="rounded-lg border border-[#E5E7EB] bg-gray-50 p-6 text-center">
          <p className="text-sm text-neutral-text-secondary">
            Dados EUDR não disponíveis. Atualize o relatório para buscar os dados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
              <p className="text-xs text-neutral-text-secondary">Status EU</p>
              <p className="mt-1 text-lg font-semibold text-neutral-text-primary">
                {EUDR_STATUS_LABELS[euStatus ?? ''] ?? euStatus}
              </p>
            </div>
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
              <p className="text-xs text-neutral-text-secondary">Perda Florestal</p>
              <p className="mt-1 text-lg font-semibold text-neutral-text-primary">
                {forestLossArea != null ? `${formatArea(forestLossArea)} ha` : '—'}
              </p>
            </div>
            {checkedAt && (
              <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
                <p className="text-xs text-neutral-text-secondary">Última verificação</p>
                <p className="mt-1 text-lg font-semibold text-neutral-text-primary">
                  {new Date(checkedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>

          {layerData && layerData.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
              <div className="bg-[#0B1B32] px-4 py-3">
                <span className="font-medium text-white">Camadas de Análise</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">Camada</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">Apontamentos</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">Área (ha)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {layerData.map((layer, idx) => (
                      <tr key={layer.layer_name} className={cn('border-b border-[#E5E7EB]', idx % 2 === 1 && 'bg-gray-50/50')}>
                        <td className="px-4 py-3 text-sm text-neutral-text-primary">{layer.layer_name}</td>
                        <td className="px-4 py-3 text-sm text-neutral-text-primary">{layer.total_issues}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                            (layer.eudr_status === 'CONFORME' || layer.total_issues === 0)
                              ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
                              : 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]'
                          )}>
                            {layer.eudr_status ? (EUDR_STATUS_LABELS[layer.eudr_status] ?? layer.eudr_status) : (layer.total_issues > 0 ? 'Sim' : 'Sem apontamento')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-text-primary">
                          {layer.total_area != null ? formatArea(layer.total_area) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {prodesLayerData && prodesLayerData.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
              <div className="bg-[#0B1B32] px-4 py-3">
                <span className="font-medium text-white">Camadas PRODES</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">Camada</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">Apontamentos</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prodesLayerData.map((layer, idx) => (
                      <tr key={layer.layer_name} className={cn('border-b border-[#E5E7EB]', idx % 2 === 1 && 'bg-gray-50/50')}>
                        <td className="px-4 py-3 text-sm text-neutral-text-primary">{layer.layer_name}</td>
                        <td className="px-4 py-3 text-sm text-neutral-text-primary">{layer.total_issues}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                            layer.total_issues === 0
                              ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
                              : 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]'
                          )}>
                            {layer.total_issues > 0 ? 'Sim' : 'Sem apontamento'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {layerData && <DetalhamentoApontamentos layers={layerData} />}
        </div>
      )}
    </CollapsibleSection>
  )
}
