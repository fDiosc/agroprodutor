'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Property {
  id: string
  name: string | null
  carCode: string
}

interface EudrSelectorProps {
  properties: Property[]
  selectedPropertyId?: string
  className?: string
}

export function EudrSelector({
  properties,
  selectedPropertyId,
  className,
}: EudrSelectorProps) {
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value
    if (value) {
      router.push(`/reports/eudr?propertyId=${value}`)
    } else {
      router.push('/reports/eudr')
    }
  }

  return (
    <div className={cn('w-full max-w-md', className)}>
      <label htmlFor="eudr-property-select" className="mb-2 block text-sm font-medium text-neutral-text-primary">
        Propriedade
      </label>
      <select
        id="eudr-property-select"
        data-testid="property-selector"
        value={selectedPropertyId ?? ''}
        onChange={handleChange}
        className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-neutral-text-primary focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)]"
      >
        <option value="">Selecione uma propriedade</option>
        {properties.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name ? `${p.name} (${p.carCode})` : p.carCode}
          </option>
        ))}
      </select>
    </div>
  )
}
