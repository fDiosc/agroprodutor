'use client'

import Link from 'next/link'
import { BellIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface AlertBadgeProps {
  count: number
  className?: string
}

export function AlertBadge({ count, className }: AlertBadgeProps) {
  return (
    <Link
      href="/monitoring"
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-lg text-neutral-text-secondary transition-colors hover:bg-neutral-border/50',
        className
      )}
      aria-label={`${count} alerta${count === 1 ? '' : 's'} não lido${count === 1 ? '' : 's'}`}
    >
      <BellIcon className="h-5 w-5" />
      {count > 0 && (
        <>
          <span
            className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: 'var(--color-status-error-text)' }}
            aria-hidden
          />
          <span className="sr-only">{count} não lidos</span>
        </>
      )}
    </Link>
  )
}
