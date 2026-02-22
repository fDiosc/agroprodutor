'use client'

import { cn } from '@/lib/utils'

interface EvolutionPoint {
  date: string
  value: number
}

interface EvolutionChartProps {
  data: EvolutionPoint[]
  className?: string
}

export function EvolutionChart({ data, className }: EvolutionChartProps) {
  if (data.length < 2) return null

  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const chartHeight = 160
  const barWidth = Math.min(40, Math.floor(300 / data.length))
  const chartWidth = data.length * (barWidth + 12) + 40

  return (
    <div className={cn('overflow-hidden rounded-lg border border-[#E5E7EB] bg-white', className)}>
      <div className="bg-[#0B1B32] px-4 py-3">
        <span className="font-medium text-white">Evolução de Apontamentos</span>
      </div>
      <div className="overflow-x-auto p-4">
        <svg
          width={chartWidth}
          height={chartHeight + 40}
          viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
          className="mx-auto"
        >
          <line x1="30" y1="10" x2="30" y2={chartHeight + 10} stroke="#E5E7EB" strokeWidth="1" />
          <line x1="30" y1={chartHeight + 10} x2={chartWidth} y2={chartHeight + 10} stroke="#E5E7EB" strokeWidth="1" />

          {data.map((point, idx) => {
            const barHeight = (point.value / maxValue) * (chartHeight - 10)
            const x = 40 + idx * (barWidth + 12)
            const y = chartHeight + 10 - barHeight

            const hasIssues = point.value > 0
            const fill = hasIssues ? '#EF4444' : '#10B981'

            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={3}
                  fill={fill}
                  opacity={0.85}
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                  className="text-[10px] fill-neutral-text-primary"
                >
                  {point.value}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 26}
                  textAnchor="middle"
                  className="text-[9px] fill-neutral-text-secondary"
                >
                  {point.date}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
