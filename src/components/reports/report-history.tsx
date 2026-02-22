'use client'

import { cn } from '@/lib/utils'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { EvolutionChart } from '@/components/reports/evolution-chart'

interface ReportHistoryProps {
  reports: Array<{
    id: string
    esgStatus: string
    totalApontamentos: number
    checkedAt: Date
  }>
}

function formatComparison(
  current: number,
  previous: number
): string {
  if (current === previous) return 'Sem alterações'
  const delta = current - previous
  const sign = delta > 0 ? '+' : ''
  return `${previous} → ${current} (${sign}${delta})`
}

export function ReportHistory({ reports }: ReportHistoryProps) {
  if (reports.length === 0) return null

  const chartData = [...reports]
    .reverse()
    .map((r) => ({
      date: r.checkedAt.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
      value: r.totalApontamentos,
    }))

  return (
    <CollapsibleSection title="Histórico de Relatórios" defaultOpen={false}>
      <div className="space-y-4">
        {chartData.length >= 2 && <EvolutionChart data={chartData} />}

        <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
          <div className="p-4">
            <div className="relative">
              <div
                className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-[#E5E7EB]"
                aria-hidden
              />
              <ul className="space-y-0">
                {reports.map((report, idx) => {
                  const isLatest = idx === 0
                  const previousReport = reports[idx + 1]
                  const comparison = previousReport
                    ? formatComparison(
                        report.totalApontamentos,
                        previousReport.totalApontamentos
                      )
                    : null
                  const hasApontamentos = report.totalApontamentos > 0

                  return (
                    <li
                      key={report.id}
                      className={cn(
                        'relative flex gap-4 pb-6 last:pb-0',
                        isLatest && 'rounded-lg bg-[#F0F9FF] p-3 -m-3'
                      )}
                    >
                      <div
                        className={cn(
                          'relative z-10 mt-1.5 h-6 w-6 shrink-0 rounded-full border-2',
                          isLatest
                            ? 'border-[#0B1B32] bg-[#0B1B32]'
                            : 'border-[#E5E7EB] bg-white'
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-neutral-text-primary">
                            {report.checkedAt.toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </span>
                          <span
                            className={cn(
                              'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                              hasApontamentos
                                ? 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]'
                                : 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
                            )}
                          >
                            {hasApontamentos
                              ? 'Com apontamentos'
                              : 'Sem apontamentos'}
                          </span>
                          {isLatest && (
                            <span className="rounded-full bg-[#0B1B32] px-2.5 py-0.5 text-xs font-medium text-white">
                              Mais recente
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-neutral-text-secondary">
                          Apontamentos: {report.totalApontamentos}
                          {comparison && (
                            <span className="ml-1 text-neutral-text-muted">
                              — {comparison}
                            </span>
                          )}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}
