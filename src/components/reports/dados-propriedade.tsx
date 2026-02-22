import { formatArea } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Property } from '@prisma/client'

interface DadosPropriedadeProps {
  property: Pick<
    Property,
    'name' | 'carCode' | 'uf' | 'municipio' | 'areaImovel'
  >
  className?: string
}

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-neutral-text-primary read-only:cursor-default read-only:border-gray-200'

export function DadosPropriedade({ property, className }: DadosPropriedadeProps) {
  const areaDisplay = property.areaImovel != null ? formatArea(property.areaImovel) : '—'

  return (
    <div className={cn('space-y-3', className)}>
      <h2 className="text-lg font-semibold text-neutral-text-primary">
        Dados da Propriedade
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-text-secondary">
            Nome da Fazenda
          </label>
          <input
            type="text"
            readOnly
            value={property.name ?? '—'}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-text-secondary">
            CAR da Fazenda
          </label>
          <input
            type="text"
            readOnly
            value={property.carCode}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-text-secondary">
            UF
          </label>
          <input
            type="text"
            readOnly
            value={property.uf ?? '—'}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-text-secondary">
            Município
          </label>
          <input
            type="text"
            readOnly
            value={property.municipio ?? '—'}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-text-secondary">
            Área do Imóvel (ha)
          </label>
          <input
            type="text"
            readOnly
            value={areaDisplay}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  )
}
