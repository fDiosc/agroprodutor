'use client'

import dynamic from 'next/dynamic'
export type { CropLayer } from './property-map'

const PropertyMap = dynamic(
  () => import('./property-map').then((mod) => ({ default: mod.PropertyMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[250px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-gray-50 md:h-[400px]">
        <p className="text-sm text-gray-400">Carregando mapa...</p>
      </div>
    ),
  }
)

export { PropertyMap as DynamicPropertyMap }
