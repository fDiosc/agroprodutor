'use client'

import { cn } from '@/lib/utils'

interface StatItem {
  icon: React.ReactNode
  value: number
  label: string
}

interface StatsSummaryProps {
  stats: StatItem[]
  className?: string
}

export function StatsSummary({ stats, className }: StatsSummaryProps) {
  return (
    <div
      data-testid="stats-summary"
      className={cn(
        'grid grid-cols-2 gap-4 md:grid-cols-4',
        className
      )}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-lg border border-neutral-border bg-white p-4 shadow-card"
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ color: 'var(--color-brand-primary)' }}
          >
            {stat.icon}
          </div>
          <p className="text-2xl font-bold text-neutral-text-primary">
            {stat.value}
          </p>
          <p className="text-sm text-neutral-text-secondary">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
