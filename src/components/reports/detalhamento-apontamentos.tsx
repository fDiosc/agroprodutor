'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface IssueInfo {
  key: string
  value: string
}

interface LayerWithDetails {
  layer_name: string
  total_issues: number
  eudr_status?: string
  total_area?: number
  issues_information?: IssueInfo[]
}

interface DetalhamentoApontamentosProps {
  layers: LayerWithDetails[]
  title?: string
  className?: string
}

export function DetalhamentoApontamentos({
  layers,
  title = 'Detalhamento dos Apontamentos',
  className,
}: DetalhamentoApontamentosProps) {
  const layersWithIssues = layers.filter(
    (l) => l.issues_information && l.issues_information.length > 0
  )

  if (layersWithIssues.length === 0) return null

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-base font-semibold text-neutral-text-primary">{title}</h3>
      <div className="space-y-2">
        {layersWithIssues.map((layer) => (
          <LayerDetail key={layer.layer_name} layer={layer} />
        ))}
      </div>
    </div>
  )
}

function LayerDetail({ layer }: { layer: LayerWithDetails }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-text-primary">
            {layer.layer_name}
          </span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              layer.total_issues > 0
                ? 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]'
                : 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
            )}
          >
            {layer.total_issues} apontamento{layer.total_issues !== 1 ? 's' : ''}
          </span>
        </div>
        <ChevronDownIcon
          className={cn(
            'h-4 w-4 text-neutral-text-secondary transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>
      {expanded && layer.issues_information && (
        <div className="border-t border-[#E5E7EB] p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="pb-2 text-left text-xs font-medium text-neutral-text-secondary">
                    Campo
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-neutral-text-secondary">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {layer.issues_information.map((info, idx) => (
                  <tr
                    key={idx}
                    className={cn(
                      'border-b border-[#E5E7EB] last:border-0',
                      idx % 2 === 1 && 'bg-gray-50/50'
                    )}
                  >
                    <td className="py-2 pr-4 text-xs font-medium text-neutral-text-primary">
                      {info.key}
                    </td>
                    <td className="py-2 text-xs text-neutral-text-primary">
                      {info.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
