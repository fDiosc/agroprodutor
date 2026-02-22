'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ArrowPathIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

interface SupplierActionsProps {
  supplierId: string
}

export function SupplierActions({ supplierId }: SupplierActionsProps) {
  const router = useRouter()
  const [checking, setChecking] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleCheck() {
    setChecking(true)
    try {
      const res = await fetch(`/api/suppliers/registered/${supplierId}/check`, { method: 'POST' })
      if (res.ok) router.refresh()
    } catch { /* ignore */ }
    finally { setChecking(false) }
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja remover este fornecedor e todas as suas propriedades?')) return
    setDeleting(true)
    try {
      await fetch(`/api/suppliers/registered/${supplierId}`, { method: 'DELETE' })
      router.push('/suppliers')
    } catch { /* ignore */ }
    finally { setDeleting(false) }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCheck}
        disabled={checking}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-60"
      >
        <ArrowPathIcon className={cn('h-3.5 w-3.5', checking && 'animate-spin')} />
        {checking ? 'Verificando...' : 'Verificar Tudo'}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-200 transition-colors hover:bg-red-500/30 disabled:opacity-60"
      >
        <TrashIcon className="h-3.5 w-3.5" />
        Remover
      </button>
    </div>
  )
}
