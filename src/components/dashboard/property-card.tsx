'use client'

import Link from 'next/link'
import { cn, formatArea } from '@/lib/utils'
import {
  MapPinIcon,
  Square3Stack3DIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import {
  ShieldCheckIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/solid'

interface PropertyCardProps {
  id: string
  name: string | null
  carCode: string
  municipio: string | null
  uf: string | null
  areaImovel: number | null
  esgStatus: string | null
  eudrStatus: string | null
  totalApontamentos: number
  lastCheckAt?: string | null
  className?: string
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
      <div className="min-w-0 flex-1">
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

export function PropertyCard({
  id,
  name,
  carCode,
  municipio,
  uf,
  areaImovel,
  esgStatus,
  eudrStatus,
  totalApontamentos,
  lastCheckAt,
  className,
}: PropertyCardProps) {
  const displayName = name || carCode
  const location = [municipio, uf].filter(Boolean).join(', ')
  const hasApontamentos = totalApontamentos > 0
  const overallOk = esgStatus === 'CONFORME' && (eudrStatus === 'CONFORME' || !eudrStatus)

  return (
    <Link
      href={`/properties/${id}`}
      data-testid="property-card"
      className={cn(
        'group relative block rounded-xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
        overallOk
          ? 'border-green-200/60 hover:border-green-300'
          : esgStatus
            ? 'border-red-200/60 hover:border-red-300'
            : 'border-[#E5E7EB] hover:border-gray-300',
        className
      )}
    >
      {/* Accent top bar */}
      <div
        className={cn(
          'h-1 rounded-t-xl',
          !esgStatus
            ? 'bg-gray-300'
            : overallOk
              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
              : 'bg-gradient-to-r from-red-400 to-rose-500'
        )}
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-[#0B1B32]">
              {displayName}
            </h3>
            {location && (
              <div className="mt-1 flex items-center gap-1">
                <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-neutral-text-secondary" />
                <span className="truncate text-sm text-neutral-text-secondary">{location}</span>
              </div>
            )}
          </div>
          {hasApontamentos ? (
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2.5 py-1">
              <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0 text-red-500" />
              <span className="text-xs font-bold text-red-600">{totalApontamentos}</span>
            </div>
          ) : overallOk ? (
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2.5 py-1">
              <CheckCircleIcon className="h-3.5 w-3.5 shrink-0 text-green-500" />
              <span className="text-xs font-bold text-green-600">OK</span>
            </div>
          ) : esgStatus ? (
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2.5 py-1">
              <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0 text-red-500" />
              <span className="text-xs font-bold text-red-600">!</span>
            </div>
          ) : null}
        </div>

        {/* Meta info */}
        <div className="mt-3 space-y-1">
          {areaImovel != null && (
            <div className="flex items-center gap-1">
              <Square3Stack3DIcon className="h-3.5 w-3.5 shrink-0 text-neutral-text-secondary" />
              <span className="text-xs font-medium text-neutral-text-primary">
                {formatArea(areaImovel)} ha
              </span>
            </div>
          )}
          <div className="flex items-start gap-1">
            <span className="shrink-0 text-[10px] font-medium leading-4 text-neutral-text-secondary">CAR</span>
            <span className="break-all text-xs leading-4 text-neutral-text-secondary">
              {carCode}
            </span>
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
        <div className="mt-3 flex items-center justify-between">
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
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[var(--color-brand-primary)] opacity-0 transition-opacity group-hover:opacity-100">
            Ver detalhes
            <ArrowRightIcon className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}
