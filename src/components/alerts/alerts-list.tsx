'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SeverityBadge } from './severity-badge'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

const ALERT_TYPE_LABELS: Record<string, string> = {
  STATUS_CHANGE: 'Mudança de Status',
  NEW_EMBARGO: 'Novo Embargo',
  EUDR_CHANGE: 'Mudança EUDR',
}

export interface AlertWithProperty {
  id: string
  propertyId: string
  type: string
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  message: string
  read: boolean
  createdAt: Date
  property: {
    id: string
    name: string | null
    carCode: string
  }
}

interface AlertsListProps {
  alerts: AlertWithProperty[]
}

export function AlertsList({ alerts }: AlertsListProps) {
  const router = useRouter()
  const unreadIds = alerts.filter((a) => !a.read).map((a) => a.id)

  const markAsRead = async (alertIds: string[]) => {
    if (alertIds.length === 0) return
    const res = await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertIds }),
    })
    if (res.ok) router.refresh()
  }

  const markAllRead = () => {
    markAsRead(unreadIds)
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-border bg-white p-8 shadow-card">
        <p className="text-center text-neutral-text-secondary">
          Nenhum alerta encontrado
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {unreadIds.length > 0 && (
        <button
          type="button"
          onClick={markAllRead}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--color-brand-primary)' }}
        >
          Marcar todos como resolvidos
        </button>
      )}

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            data-testid="alert-card"
            className={cn(
              'rounded-lg border border-neutral-border bg-white p-4 shadow-card',
              !alert.read && 'border-l-4 border-l-[var(--color-brand-primary)]'
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={alert.severity} />
                  <span className="text-xs text-neutral-text-secondary">
                    {ALERT_TYPE_LABELS[alert.type] ?? alert.type}
                  </span>
                  {!alert.read && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: 'var(--color-brand-primary)' }}
                      title="Não lido"
                    />
                  )}
                </div>
                <p className="text-sm text-neutral-text-primary">
                  {alert.message}
                </p>
                <Link
                  href={`/properties/${alert.property.id}`}
                  className="inline-block text-sm font-medium transition-colors hover:underline"
                  style={{ color: 'var(--color-brand-primary)' }}
                >
                  {alert.property.name ?? alert.property.carCode}
                </Link>
                <p className="text-xs text-neutral-text-secondary">
                  {formatDateTime(alert.createdAt)}
                </p>
              </div>
              {!alert.read && (
                <button
                  type="button"
                  onClick={() => markAsRead([alert.id])}
                  className="shrink-0 rounded-lg border border-neutral-border px-3 py-1.5 text-sm font-medium text-neutral-text-primary transition-colors hover:bg-neutral-border"
                >
                  Resolver
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
