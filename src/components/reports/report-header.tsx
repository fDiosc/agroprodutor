'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface ReportHeaderProps {
  propertyName: string
  propertyId: string
  checkedAt?: Date | null
  className?: string
}

export function ReportHeader({
  propertyName,
  propertyId,
  checkedAt,
  className,
}: ReportHeaderProps) {
  const router = useRouter()
  const formattedDate = checkedAt
    ? checkedAt.toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR')

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/properties')}
            className="rounded-lg p-2 text-neutral-text-secondary transition-colors hover:bg-gray-100 hover:text-neutral-text-primary"
            aria-label="Voltar para propriedades"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <nav className="flex items-center gap-2 text-sm text-neutral-text-secondary">
            <Link
              href="/properties"
              className="hover:text-neutral-text-primary hover:underline"
            >
              Propriedades
            </Link>
            <span>/</span>
            <span className="text-neutral-text-primary">{propertyName}</span>
          </nav>
        </div>
        <p className="text-sm text-neutral-text-secondary">
          Data da Consulta: {formattedDate}
        </p>
      </div>
      <h1 className="text-2xl font-bold text-neutral-text-primary">
        {propertyName}
      </h1>
    </div>
  )
}
