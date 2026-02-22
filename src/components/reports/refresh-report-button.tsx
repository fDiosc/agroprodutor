'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface RefreshReportButtonProps {
  propertyId: string
  className?: string
}

export function RefreshReportButton({
  propertyId,
  className,
}: RefreshReportButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleRefresh() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/properties/${propertyId}/esg`, {
        method: 'POST',
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isLoading}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-70',
        'hover:opacity-90',
        className
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
        'Atualizar Relatório'
      )}
    </button>
  )
}
