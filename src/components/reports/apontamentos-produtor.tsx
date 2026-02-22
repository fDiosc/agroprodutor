'use client'

import { PRODUCER_ESG_LAYERS, PRODUCER_ESG_TOOLTIPS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { InfoTooltip } from '@/components/ui/info-tooltip'

interface ApontamentosProdutorProps {
  esgData: Record<string, unknown> | null
  className?: string
}

export function ApontamentosProdutor({
  esgData,
  className,
}: ApontamentosProdutorProps) {
  const totalApontamentos = PRODUCER_ESG_LAYERS.reduce((acc, layer) => {
    return acc + ((esgData?.[layer.key] as number) ?? 0)
  }, 0)
  const hasApontamentos = totalApontamentos > 0

  return (
    <CollapsibleSection
      title="Apontamentos Produtor"
      badge={
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
      }
      className={className}
    >
      <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">
                  Camadas
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">
                  Apontamentos
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {PRODUCER_ESG_LAYERS.map((layer, idx) => {
                const count = (esgData?.[layer.key] as number) ?? 0
                const hasLayerApontamentos = count > 0
                const tooltip = PRODUCER_ESG_TOOLTIPS[layer.key]
                return (
                  <tr
                    key={layer.key}
                    className={cn(
                      'border-b border-[#E5E7EB]',
                      idx % 2 === 1 && 'bg-gray-50/50'
                    )}
                  >
                    <td className="px-4 py-3 text-sm text-neutral-text-primary">
                      <span className="inline-flex items-center gap-1.5">
                        {layer.label}
                        {tooltip && <InfoTooltip text={tooltip} />}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-text-primary">
                      {count}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                          hasLayerApontamentos
                            ? 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]'
                            : 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
                        )}
                      >
                        {hasLayerApontamentos ? 'Sim' : 'Sem apontamento'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </CollapsibleSection>
  )
}
