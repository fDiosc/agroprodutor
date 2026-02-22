'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

interface AdvancedModeToggleProps {
  initialValue: boolean
}

export function AdvancedModeToggle({ initialValue }: AdvancedModeToggleProps) {
  const [enabled, setEnabled] = useState(initialValue)
  const [loading, setLoading] = useState(false)
  const { update } = useSession()

  const handleToggle = async () => {
    const newValue = !enabled
    setLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advancedMode: newValue }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Erro ao atualizar')
      }
      setEnabled(newValue)
      await update({ user: { advancedMode: newValue } })
    } catch (err) {
      console.error('Advanced mode toggle error:', err)
      setEnabled(enabled)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-lg border border-neutral-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-text-primary">
            Modo avançado
          </h2>
          <p className="mt-1 text-sm text-neutral-text-secondary">
            Ative o modo avançado para ter controle granular sobre quais módulos
            de relatório são exibidos.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          data-testid="advanced-mode-toggle"
          disabled={loading}
          onClick={handleToggle}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary,#00C287)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            enabled ? 'bg-[var(--color-brand-primary,#00C287)]' : 'bg-neutral-border'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition',
              enabled ? 'translate-x-5' : 'translate-x-0.5'
            )}
          />
        </button>
      </div>
    </section>
  )
}
