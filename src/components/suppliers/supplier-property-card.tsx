'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  EyeIcon,
  TrashIcon,
  CalendarDaysIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import {
  ShieldCheckIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/solid'

interface SupplierPropertyCardProps {
  supplierId: string
  carId: string
  carCode: string
  esgStatus: string | null
  eudrStatus: string | null
  lastCheckAt: string | null
}

function StatusIndicator({ label, status, icon: Icon }: { label: string; status: string | null; icon: React.ElementType }) {
  const isConforme = status === 'CONFORME'
  const isPending = !status

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-2.5 py-2',
        isPending
          ? 'border-gray-200 bg-gray-50'
          : isConforme
            ? 'border-green-100 bg-green-50/60'
            : 'border-red-100 bg-red-50/60'
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0',
          isPending ? 'text-gray-400' : isConforme ? 'text-green-600' : 'text-red-500'
        )}
      />
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase leading-tight tracking-wider text-neutral-text-secondary">
          {label}
        </p>
        <p
          className={cn(
            'text-[11px] font-semibold leading-tight',
            isPending ? 'text-gray-500' : isConforme ? 'text-green-700' : 'text-red-600'
          )}
        >
          {isPending ? 'Pendente' : isConforme ? 'Conforme' : 'Não Conforme'}
        </p>
      </div>
    </div>
  )
}

export function SupplierPropertyCard({
  supplierId,
  carId,
  carCode,
  esgStatus,
  eudrStatus,
  lastCheckAt,
}: SupplierPropertyCardProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const overallOk = esgStatus === 'CONFORME' && (eudrStatus === 'CONFORME' || !eudrStatus)
  const isPending = !esgStatus

  async function handleRemove() {
    if (!confirm('Remover esta propriedade do fornecedor?')) return
    setDeleting(true)
    try {
      await fetch(`/api/suppliers/registered/${supplierId}/cars/${carId}`, { method: 'DELETE' })
      router.refresh()
    } catch { /* ignore */ }
    finally { setDeleting(false) }
  }

  return (
    <div
      className={cn(
        'relative rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md',
        isPending
          ? 'border-[#E5E7EB]'
          : overallOk
            ? 'border-green-200/60'
            : 'border-red-200/60'
      )}
    >
      {/* Accent bar */}
      <div
        className={cn(
          'h-1 rounded-t-xl',
          isPending
            ? 'bg-gray-300'
            : overallOk
              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
              : 'bg-gradient-to-r from-red-400 to-rose-500'
        )}
      />

      <div className="p-4">
        {/* CAR code */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
              Código CAR
            </p>
            <p className="mt-0.5 truncate text-sm font-bold text-[#0B1B32]" title={carCode}>
              {carCode}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Link
              href={`/reports/car?car=${encodeURIComponent(carCode)}`}
              className="rounded-lg p-1.5 text-neutral-text-secondary transition-colors hover:bg-gray-100 hover:text-[var(--color-brand-primary)]"
              title="Ver relatório ESG completo"
            >
              <EyeIcon className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={handleRemove}
              disabled={deleting}
              className="rounded-lg p-1.5 text-neutral-text-secondary transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              title="Remover propriedade"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-[#E5E7EB]" />

        {/* Status grid */}
        <div className="grid grid-cols-2 gap-2">
          <StatusIndicator label="ESG" status={esgStatus} icon={ShieldCheckIcon} />
          <StatusIndicator label="EUDR" status={eudrStatus} icon={GlobeAltIcon} />
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center">
          {lastCheckAt ? (
            <div className="flex items-center gap-1">
              <CalendarDaysIcon className="h-3 w-3 shrink-0 text-neutral-text-secondary" />
              <span className="whitespace-nowrap text-[10px] text-neutral-text-secondary">
                {new Date(lastCheckAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3 shrink-0 text-neutral-text-secondary" />
              <span className="whitespace-nowrap text-[10px] text-neutral-text-secondary">Sem verificação</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
