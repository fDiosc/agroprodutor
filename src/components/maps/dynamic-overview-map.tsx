'use client'

import dynamic from 'next/dynamic'

const PropertiesOverviewMap = dynamic(
  () =>
    import('./properties-overview-map').then((mod) => ({
      default: mod.PropertiesOverviewMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-neutral-border bg-gray-50 lg:h-full lg:min-h-[500px]">
        <p className="text-sm text-gray-400">Carregando mapa...</p>
      </div>
    ),
  }
)

export { PropertiesOverviewMap as DynamicOverviewMap }
export type { OverviewProperty } from './properties-overview-map'
