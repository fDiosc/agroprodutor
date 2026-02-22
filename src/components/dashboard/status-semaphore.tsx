'use client'

import { cn } from '@/lib/utils'

type SemaphoreStatus = 'green' | 'yellow' | 'red'

interface StatusSemaphoreProps {
  status: SemaphoreStatus
  totalApontamentos?: number
  naoConformeCount?: number
  className?: string
}

function getSemaphoreLabel(
  status: SemaphoreStatus,
  totalApontamentos: number,
  naoConformeCount: number
): string {
  switch (status) {
    case 'green':
      return 'Todas as propriedades estão conformes'
    case 'yellow':
      return `Atenção: ${totalApontamentos} apontamento${totalApontamentos === 1 ? '' : 's'} detectado${totalApontamentos === 1 ? '' : 's'}`
    case 'red':
      return `${naoConformeCount} propriedade${naoConformeCount === 1 ? '' : 's'} não conforme${naoConformeCount === 1 ? '' : 's'}`
  }
}

const statusColors: Record<SemaphoreStatus, string> = {
  green: '#00C287',
  yellow: '#F59E0B',
  red: '#EF4444',
}

export function StatusSemaphore({
  status,
  totalApontamentos = 0,
  naoConformeCount = 0,
  className,
}: StatusSemaphoreProps) {
  const color = statusColors[status]
  const label = getSemaphoreLabel(status, totalApontamentos, naoConformeCount)

  return (
    <div
      data-testid="status-semaphore"
      className={cn('flex flex-col items-center gap-4', className)}
    >
      <div
        className="h-24 w-24 rounded-full shadow-lg md:h-32 md:w-32"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <p className="text-center text-sm font-medium text-neutral-text-primary md:text-base">
        {label}
      </p>
    </div>
  )
}
