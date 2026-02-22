'use client'

import { useState } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'

interface DeletePropertyButtonProps {
  propertyId: string
  propertyName: string
}

export function DeletePropertyButton({
  propertyId,
  propertyName,
}: DeletePropertyButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleDelete() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        window.location.href = '/properties'
      }
    } finally {
      setIsLoading(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600">
          Remover &quot;{propertyName}&quot;?
        </span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-70"
        >
          {isLoading ? 'Removendo...' : 'Confirmar'}
        </button>
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          className="rounded-lg border border-neutral-border px-3 py-2 text-sm font-medium text-neutral-text-secondary transition-colors hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
    >
      <TrashIcon className="h-4 w-4" />
      Remover Propriedade
    </button>
  )
}
