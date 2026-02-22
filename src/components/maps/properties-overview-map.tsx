'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, GeoJSON, useMap, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export interface OverviewProperty {
  id: string
  name: string | null
  carCode: string
  municipio: string | null
  uf: string | null
  esgStatus: string | null
  geoPolygon: GeoJSON.FeatureCollection | GeoJSON.Feature | null
}

interface PropertiesOverviewMapProps {
  properties: OverviewProperty[]
  className?: string
}

const STATUS_COLORS: Record<string, { color: string; fill: string }> = {
  CONFORME: { color: '#00C287', fill: '#00C287' },
  NAO_CONFORME: { color: '#EF4444', fill: '#EF4444' },
}
const DEFAULT_STYLE = { color: '#9CA3AF', fill: '#9CA3AF' }

const DEFAULT_CENTER: L.LatLngExpression = [-15.78, -47.93]

function FitAllBounds({ properties }: { properties: OverviewProperty[] }) {
  const map = useMap()

  useEffect(() => {
    const allBounds: L.LatLngBounds[] = []
    for (const p of properties) {
      if (!p.geoPolygon) continue
      try {
        const layer = L.geoJSON(p.geoPolygon as GeoJSON.GeoJSON)
        const b = layer.getBounds()
        if (b.isValid()) allBounds.push(b)
      } catch {
        // skip invalid
      }
    }
    if (allBounds.length === 0) return
    let combined = allBounds[0]
    for (let i = 1; i < allBounds.length; i++) {
      combined = combined.extend(allBounds[i])
    }
    if (combined.isValid()) {
      map.fitBounds(combined, { padding: [40, 40], maxZoom: 14 })
    }
  }, [map, properties])

  return null
}

function normalizeGeoJson(
  geo: GeoJSON.FeatureCollection | GeoJSON.Feature
): GeoJSON.FeatureCollection {
  if (geo.type === 'FeatureCollection') return geo
  return { type: 'FeatureCollection', features: [geo] }
}

export function PropertiesOverviewMap({ properties, className = '' }: PropertiesOverviewMapProps) {
  const propertiesWithGeo = properties.filter((p) => p.geoPolygon != null)

  if (propertiesWithGeo.length === 0) {
    return (
      <div
        className={`flex h-[300px] items-center justify-center rounded-xl border border-neutral-border bg-gray-50 lg:h-full lg:min-h-[500px] ${className}`}
      >
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-text-secondary">
            Nenhum polígono disponível
          </p>
          <p className="mt-1 text-xs text-neutral-text-secondary">
            Adicione propriedades com CAR para visualizar no mapa
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-[300px] overflow-hidden rounded-xl border border-neutral-border lg:h-full lg:min-h-[500px] ${className}`}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={4}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='Tiles &copy; Esri'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <FitAllBounds properties={propertiesWithGeo} />
        {propertiesWithGeo.map((property) => {
          const statusStyle = STATUS_COLORS[property.esgStatus ?? ''] ?? DEFAULT_STYLE
          const normalized = normalizeGeoJson(
            property.geoPolygon as GeoJSON.FeatureCollection | GeoJSON.Feature
          )
          const displayName = property.name || property.carCode
          const location = [property.municipio, property.uf].filter(Boolean).join(', ')

          return (
            <GeoJSON
              key={property.id}
              data={normalized}
              pathOptions={{
                color: statusStyle.color,
                fillColor: statusStyle.fill,
                fillOpacity: 0.3,
                weight: 2.5,
              }}
              eventHandlers={{
                click: () => {
                  window.location.href = `/properties/${property.id}`
                },
                mouseover: (e) => {
                  const layer = e.target as L.Path
                  layer.setStyle({ fillOpacity: 0.5, weight: 3.5 })
                },
                mouseout: (e) => {
                  const layer = e.target as L.Path
                  layer.setStyle({ fillOpacity: 0.3, weight: 2.5 })
                },
              }}
            >
              <Tooltip direction="top" sticky>
                <div className="text-xs">
                  <p className="font-semibold">{displayName}</p>
                  {location && <p className="text-gray-600">{location}</p>}
                  <p className="mt-0.5 font-medium" style={{ color: statusStyle.color }}>
                    {property.esgStatus === 'CONFORME'
                      ? 'Conforme'
                      : property.esgStatus === 'NAO_CONFORME'
                        ? 'Não Conforme'
                        : 'Pendente'}
                  </p>
                </div>
              </Tooltip>
            </GeoJSON>
          )
        })}
      </MapContainer>
    </div>
  )
}
