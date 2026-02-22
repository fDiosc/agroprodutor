'use client'

import Link from 'next/link'
import { cn, formatCpfCnpj } from '@/lib/utils'
import {
  UserIcon,
  MapPinIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { ShieldCheckIcon } from '@heroicons/react/24/solid'

interface SupplierCardProps {
  id: string
  name: string
  cpfCnpj: string
  esgStatus: string | null
  lastCheckAt: string | null
  carCount: number
  totalApontamentos: number
}

export function SupplierCard({
  id,
  name,
  cpfCnpj,
  esgStatus,
  lastCheckAt,
  carCount,
  totalApontamentos,
}: SupplierCardProps) {
  const isConforme = esgStatus === 'CONFORME'
  const isPending = !esgStatus
  const hasIssues = totalApontamentos > 0

  return (
    <Link
      href={`/suppliers/${id}`}
      className={cn(
        'group relative block overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
        isPending
          ? 'border-[#E5E7EB] hover:border-gray-300'
          : isConforme
            ? 'border-green-200/60 hover:border-green-300'
            : 'border-red-200/60 hover:border-red-300'
      )}
    >
      {/* Accent top bar */}
      <div
        className={cn(
          'h-1',
          isPending
            ? 'bg-gray-300'
            : isConforme
              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
              : 'bg-gradient-to-r from-red-400 to-rose-500'
        )}
      />

      <div className="p-4 md:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B1B32]">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-[#0B1B32]">{name}</h3>
                <p className="text-xs text-neutral-text-secondary">{formatCpfCnpj(cpfCnpj)}</p>
              </div>
            </div>
          </div>
          <span
            className={cn(
              'mt-1 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
              isPending
                ? 'bg-gray-100 text-gray-500'
                : isConforme
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-600'
            )}
          >
            {isPending ? 'Pendente' : isConforme ? 'Conforme' : 'Não Conforme'}
          </span>
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-[#E5E7EB]" />

        {/* Stats row */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <MapPinIcon className="h-4 w-4 text-neutral-text-secondary" />
            <span className="text-sm font-medium text-neutral-text-primary">
              {carCount} {carCount === 1 ? 'propriedade' : 'propriedades'}
            </span>
          </div>

          {hasIssues ? (
            <div className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5">
              <ExclamationTriangleIcon className="h-3.5 w-3.5 text-red-500" />
              <span className="text-xs font-bold text-red-600">
                {totalApontamentos} {totalApontamentos === 1 ? 'alerta' : 'alertas'}
              </span>
            </div>
          ) : esgStatus ? (
            <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5">
              <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />
              <span className="text-xs font-bold text-green-600">OK</span>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          {lastCheckAt ? (
            <div className="flex items-center gap-1">
              <CalendarDaysIcon className="h-3 w-3 text-neutral-text-secondary" />
              <span className="text-[10px] text-neutral-text-secondary">
                Verificado em {new Date(lastCheckAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3 text-neutral-text-secondary" />
              <span className="text-[10px] text-neutral-text-secondary">Sem verificação</span>
            </div>
          )}
          <span className="flex items-center gap-1 text-xs font-medium text-[var(--color-brand-primary)] opacity-0 transition-opacity group-hover:opacity-100">
            Gerenciar
            <ArrowRightIcon className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}
