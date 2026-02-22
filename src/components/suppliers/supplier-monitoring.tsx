'use client'

import { cn } from '@/lib/utils'
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
} from '@heroicons/react/24/outline'

interface MonitoringEvent {
  supplierName: string
  cpfCnpj: string
  carCode: string | null
  previousStatus: string | null
  currentStatus: string | null
  field: 'ESG' | 'EUDR'
  checkedAt: string
}

interface SupplierMonitoringProps {
  events: MonitoringEvent[]
}

function getStatusLabel(status: string | null): string {
  if (!status) return 'Pendente'
  if (status === 'CONFORME') return 'Conforme'
  return 'Não Conforme'
}

type ChangeType = 'improved' | 'worsened' | 'unchanged'

function getChangeType(prev: string | null, curr: string | null): ChangeType {
  if (prev === curr) return 'unchanged'
  if (curr === 'CONFORME') return 'improved'
  if (prev === 'CONFORME' && curr !== 'CONFORME') return 'worsened'
  if (!prev && curr) return curr === 'CONFORME' ? 'improved' : 'worsened'
  return 'unchanged'
}

export function SupplierMonitoring({ events }: SupplierMonitoringProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 text-center">
        <p className="text-sm text-neutral-text-secondary">
          Nenhuma mudança de status registrada. Verifique seus fornecedores periodicamente.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {events.map((event, idx) => {
        const change = getChangeType(event.previousStatus, event.currentStatus)
        const isImproved = change === 'improved'
        const isWorsened = change === 'worsened'

        return (
          <div
            key={idx}
            className={cn(
              'flex items-start gap-3 rounded-lg border px-4 py-3',
              isWorsened
                ? 'border-red-200 bg-red-50/50'
                : isImproved
                  ? 'border-green-200 bg-green-50/50'
                  : 'border-[#E5E7EB] bg-white'
            )}
          >
            <div className="mt-0.5 shrink-0">
              {isWorsened ? (
                <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
              ) : isImproved ? (
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
              ) : (
                <MinusIcon className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-neutral-text-primary">
                  {event.supplierName}
                </span>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-text-secondary">
                  {event.field}
                </span>
                {event.carCode && (
                  <span className="truncate text-xs text-neutral-text-secondary">
                    CAR: {event.carCode}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-neutral-text-secondary">
                {getStatusLabel(event.previousStatus)}
                {' → '}
                <span
                  className={cn(
                    'font-medium',
                    isWorsened && 'text-red-600',
                    isImproved && 'text-green-600'
                  )}
                >
                  {getStatusLabel(event.currentStatus)}
                </span>
                <span className="ml-2 text-neutral-text-secondary">
                  {new Date(event.checkedAt).toLocaleDateString('pt-BR')}
                </span>
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
