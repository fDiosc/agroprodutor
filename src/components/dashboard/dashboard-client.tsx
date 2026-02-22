'use client'

import {
  MapPinIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline'
import { DynamicOverviewMap } from '@/components/maps/dynamic-overview-map'
import type { OverviewProperty } from '@/components/maps/dynamic-overview-map'
import { PropertyCard } from '@/components/dashboard/property-card'
import { WeatherMini } from '@/components/dashboard/weather-mini'
import { getPolygonCentroid } from '@/lib/utils'

const ICON_MAP: Record<string, React.ElementType> = {
  MapPinIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  BellAlertIcon,
}

interface StatItem {
  icon: string
  value: number
  label: string
}

interface DashboardProperty {
  id: string
  name: string | null
  carCode: string
  municipio: string | null
  uf: string | null
  areaImovel: number | null
  esgStatus: string | null
  eudrStatus: string | null
  totalApontamentos: number
  lastCheckAt: string | null
  geoPolygon: GeoJSON.FeatureCollection | GeoJSON.Feature | null
}

interface DashboardClientProps {
  userName: string
  statusColor: string
  statusLabel: string
  stats: StatItem[]
  properties: DashboardProperty[]
}

export function DashboardClient({
  userName,
  statusColor,
  statusLabel,
  stats,
  properties,
}: DashboardClientProps) {
  const mapProperties: OverviewProperty[] = properties.map((p) => ({
    id: p.id,
    name: p.name,
    carCode: p.carCode,
    municipio: p.municipio,
    uf: p.uf,
    esgStatus: p.esgStatus,
    geoPolygon: p.geoPolygon,
  }))

  return (
    <div className="space-y-6">
      {/* Header with greeting + status dot */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-text-primary">
              Bem-vindo, {userName}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: statusColor }}
              />
              <span className="text-sm text-neutral-text-secondary">
                {statusLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = ICON_MAP[stat.icon] ?? MapPinIcon
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-neutral-border bg-white px-4 py-3 shadow-sm"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'rgba(0, 194, 135, 0.1)' }}
              >
                <Icon className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
              </div>
              <div>
                <p className="text-xl font-bold text-neutral-text-primary">
                  {stat.value}
                </p>
                <p className="text-xs text-neutral-text-secondary">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main content: Map + Property list */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Map */}
        <div className="lg:col-span-3">
          <h2 className="mb-3 text-lg font-semibold text-neutral-text-primary">
            Visão Geral
          </h2>
          <DynamicOverviewMap properties={mapProperties} />
          {/* Legend */}
          <div className="mt-2 flex flex-wrap items-center gap-4 px-1">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: '#00C287' }} />
              <span className="text-xs text-neutral-text-secondary">Conforme</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: '#EF4444' }} />
              <span className="text-xs text-neutral-text-secondary">Não Conforme</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: '#9CA3AF' }} />
              <span className="text-xs text-neutral-text-secondary">Pendente</span>
            </div>
          </div>
        </div>

        {/* Property cards */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-neutral-text-primary">
            Propriedades
          </h2>
          <div className="space-y-3 lg:max-h-[560px] lg:overflow-y-auto lg:pr-1">
            {properties.map((property) => {
              const centroid = getPolygonCentroid(property.geoPolygon)
              return (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  name={property.name}
                  carCode={property.carCode}
                  municipio={property.municipio}
                  uf={property.uf}
                  areaImovel={property.areaImovel}
                  esgStatus={property.esgStatus}
                  eudrStatus={property.eudrStatus}
                  totalApontamentos={property.totalApontamentos}
                  lastCheckAt={property.lastCheckAt}
                  weatherSlot={
                    centroid ? (
                      <WeatherMini lat={centroid[0]} lng={centroid[1]} />
                    ) : undefined
                  }
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
