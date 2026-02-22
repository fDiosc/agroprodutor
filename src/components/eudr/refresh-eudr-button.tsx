'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface RefreshEudrButtonProps {
  propertyId: string
  className?: string
}

export function RefreshEudrButton({
  propertyId,
  className,
}: RefreshEudrButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [detailed, setDetailed] = useState(false)

  async function handleRefresh() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/properties/${propertyId}/eudr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detailed }),
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', className)}>
      <label className="flex items-center gap-2 text-sm text-neutral-text-primary">
        <input
          type="checkbox"
          checked={detailed}
          onChange={(e) => setDetailed(e.target.checked)}
          disabled={isLoading}
          className="rounded border-[#E5E7EB] text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
        />
        Relatório detalhado
      </label>
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isLoading}
        className={cn(
          'inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-70',
          'hover:opacity-90'
        )}
        style={{ backgroundColor: 'var(--color-brand-primary)' }}
      >
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Atualizando...
          </>
        ) : (
          'Atualizar EUDR'
        )}
      </button>
    </div>
  )
}
