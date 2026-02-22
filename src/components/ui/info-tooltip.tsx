'use client'

import { useState } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface InfoTooltipProps {
  text: string
  className?: string
}

export function InfoTooltip({ text, className }: InfoTooltipProps) {
  const [show, setShow] = useState(false)

  return (
    <span className={cn('relative inline-flex', className)}>
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onClick={() => setShow((p) => !p)}
        className="inline-flex items-center text-neutral-text-secondary hover:text-neutral-text-primary"
        aria-label="Informação"
      >
        <InformationCircleIcon className="h-4 w-4" />
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs leading-relaxed text-neutral-text-primary shadow-lg">
          {text}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white" />
        </span>
      )}
    </span>
  )
}
