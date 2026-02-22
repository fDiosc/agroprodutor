'use client'

import dynamic from 'next/dynamic'

export const DynamicCarSearchMap = dynamic(
  () => import('./car-search-map').then((mod) => ({ default: mod.CarSearchMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-gray-50 md:h-[400px]">
        <p className="text-sm text-gray-500">Carregando mapa...</p>
      </div>
    ),
  }
)
