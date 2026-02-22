'use client'

import { CULTURE_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { formatArea } from '@/lib/utils'
import { CollapsibleSection } from '@/components/ui/collapsible-section'

interface ProductivityReport {
  id: string
  culture: string
  harvest: string | null
  plantedArea: number | null
  declaredArea: number | null
  countyProductivity: number | null
  estimatedProduction: number | null
  checkedAt: Date
}

interface ProductivitySectionProps {
  reports: ProductivityReport[]
  className?: string
}

export function ProductivitySection({ reports, className }: ProductivitySectionProps) {
  if (reports.length === 0) return null

  const harvests = [...new Set(reports.map((r) => r.harvest).filter(Boolean))] as string[]

  return (
    <CollapsibleSection title="Produtividade" className={className}>
      <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">
                  Cultura
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">
                  Safra
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">
                  Área Plantada (ha)
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">
                  Área Declarada (ha)
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">
                  Produtividade Municipal
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">
                  Produção Estimada
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, idx) => {
                const cultureLabel =
                  CULTURE_LABELS[report.culture as keyof typeof CULTURE_LABELS] ??
                  report.culture
                return (
                  <tr
                    key={report.id}
                    className={cn(
                      'border-b border-[#E5E7EB]',
                      idx % 2 === 1 && 'bg-gray-50/50'
                    )}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-neutral-text-primary">
                      {cultureLabel}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-text-primary">
                      {report.harvest ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-text-primary">
                      {report.plantedArea != null
                        ? formatArea(report.plantedArea)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-text-primary">
                      {report.declaredArea != null
                        ? formatArea(report.declaredArea)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-text-primary">
                      {report.countyProductivity != null
                        ? report.countyProductivity.toLocaleString('pt-BR')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-text-primary">
                      {report.estimatedProduction != null
                        ? report.estimatedProduction.toLocaleString('pt-BR')
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {harvests.length > 1 && (
        <p className="text-xs text-neutral-text-secondary">
          Safras disponíveis: {harvests.join(', ')}
        </p>
      )}
    </CollapsibleSection>
  )
}
