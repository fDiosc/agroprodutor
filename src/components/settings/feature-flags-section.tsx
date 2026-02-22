'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface FeatureFlagsSectionProps {
  reportsEnabled: boolean
}

export function FeatureFlagsSection({ reportsEnabled: initial }: FeatureFlagsSectionProps) {
  const [reportsEnabled, setReportsEnabled] = useState(initial)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    const newValue = !reportsEnabled
    setLoading(true)
    try {
      const res = await fetch('/api/settings/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportsEnabled: newValue }),
      })
      if (!res.ok) throw new Error('Erro ao atualizar')
      setReportsEnabled(newValue)
    } catch (err) {
      console.error('Feature flag toggle error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
          Super Admin
        </span>
        <h2 className="text-sm font-semibold text-neutral-text-primary">
          Feature Flags
        </h2>
      </div>
      <p className="mb-4 text-xs text-neutral-text-secondary">
        Controle quais funcionalidades estão disponíveis para todos os usuários deste workspace.
      </p>
      <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-white p-3">
        <div>
          <p className="text-sm font-medium text-neutral-text-primary">Relatórios</p>
          <p className="text-xs text-neutral-text-secondary">
            ESG Completo, EUDR e Relatório por Produtor
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={reportsEnabled}
          disabled={loading}
          onClick={handleToggle}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            reportsEnabled ? 'bg-[var(--color-brand-primary,#00C287)]' : 'bg-neutral-border'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition',
              reportsEnabled ? 'translate-x-5' : 'translate-x-0.5'
            )}
          />
        </button>
      </div>
    </section>
  )
}
