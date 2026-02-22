'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  badge?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}

export function CollapsibleSection({
  title,
  badge,
  defaultOpen = true,
  children,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn('space-y-3', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-neutral-text-primary">
            {title}
          </h2>
          {badge}
        </div>
        <ChevronDownIcon
          className={cn(
            'h-5 w-5 text-neutral-text-secondary transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
