'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ReportConfigSectionProps {
  config: {
    esgEnabled: boolean
    eudrEnabled: boolean
    productivityEnabled: boolean
    producerReportEnabled: boolean
  }
}

const reportLabels: Record<keyof ReportConfigSectionProps['config'], string> = {
  esgEnabled: 'ESG Completo',
  eudrEnabled: 'EUDR',
  productivityEnabled: 'Produtividade',
  producerReportEnabled: 'Relatório Produtor',
}

export function ReportConfigSection({ config }: ReportConfigSectionProps) {
  const [state, setState] = useState(config)
  const [loading, setLoading] = useState<keyof ReportConfigSectionProps['config'] | null>(null)

  const handleToggle = async (field: keyof ReportConfigSectionProps['config']) => {
    const newValue = !state[field]
    setLoading(field)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportConfig: { [field]: newValue } }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Erro ao atualizar')
      }
      setState((prev) => ({ ...prev, [field]: newValue }))
    } catch (err) {
      console.error('Report config toggle error:', err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="rounded-lg border border-neutral-border bg-white shadow-sm">
      <div className="rounded-t-lg bg-[var(--color-brand-navy,#0B1B32)] px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Módulos de Relatório</h2>
      </div>
      <div className="space-y-4 p-4">
        {(Object.keys(reportLabels) as Array<keyof ReportConfigSectionProps['config']>).map(
          (field) => (
            <div
              key={field}
              className="flex items-center justify-between gap-4"
            >
              <span className="text-sm font-medium text-neutral-text-primary">
                {reportLabels[field]}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={state[field]}
                disabled={loading === field}
                onClick={() => handleToggle(field)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary,#00C287)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  state[field]
                    ? 'bg-[var(--color-brand-primary,#00C287)]'
                    : 'bg-neutral-border'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition',
                    state[field] ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          )
        )}
      </div>
    </section>
  )
}
