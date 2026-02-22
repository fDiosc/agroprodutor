'use client'

import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const LEAFLET_ICON_BASE = 'https://unpkg.com/leaflet@1.9.4/dist/images'
// @ts-expect-error - Leaflet Icon.Default prototype modification
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: `${LEAFLET_ICON_BASE}/marker-icon.png`,
  iconRetinaUrl: `${LEAFLET_ICON_BASE}/marker-icon-2x.png`,
  shadowUrl: `${LEAFLET_ICON_BASE}/marker-shadow.png`,
})

export interface CropLayer {
  id: string
  label: string
  geoJson: GeoJSON.FeatureCollection | GeoJSON.Feature
  color: string
}

export interface PropertyMapProps {
  geoJson: GeoJSON.FeatureCollection | GeoJSON.Feature | null
  center?: [number, number]
  zoom?: number
  className?: string
  cropLayers?: CropLayer[]
}

const DEFAULT_CENTER: [number, number] = [-15.77972, -47.92972]
const DEFAULT_ZOOM = 4

function getBoundsFromGeoJson(
  geo: GeoJSON.FeatureCollection | GeoJSON.Feature
): L.LatLngBounds | null {
  try {
    const layer = L.geoJSON(geo as GeoJSON.GeoJSON)
    const bounds = layer.getBounds()
    return bounds.isValid() ? bounds : null
  } catch {
    return null
  }
}

function FitBounds({
  geoJson,
  cropLayers,
  visibleLayers,
}: {
  geoJson: GeoJSON.FeatureCollection | GeoJSON.Feature | null
  cropLayers?: CropLayer[]
  visibleLayers: Set<string>
}) {
  const map = useMap()

  useEffect(() => {
    const boundsList: L.LatLngBounds[] = []
    if (geoJson) {
      const b = getBoundsFromGeoJson(geoJson)
      if (b) boundsList.push(b)
    }
    if (cropLayers) {
      for (const layer of cropLayers) {
        if (visibleLayers.has(layer.id)) {
          const b = getBoundsFromGeoJson(layer.geoJson)
          if (b) boundsList.push(b)
        }
      }
    }
    if (boundsList.length === 0) return
    let combined = boundsList[0]
    for (let i = 1; i < boundsList.length; i++) {
      combined = combined.extend(boundsList[i])
    }
    if (combined.isValid()) {
      map.fitBounds(combined, { padding: [20, 20], maxZoom: 16 })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, geoJson])

  return null
}

const propertyStyle: L.PathOptions = {
  color: '#FFFFFF',
  fillColor: 'transparent',
  fillOpacity: 0,
  weight: 2.5,
  dashArray: '6, 4',
}

export function PropertyMap({
  geoJson,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  className = '',
  cropLayers = [],
}: PropertyMapProps) {
  const hasGeoJson = geoJson != null
  const hasCropLayers = cropLayers.length > 0

  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(() => {
    return new Set(cropLayers.map((l) => l.id))
  })

  const toggleLayer = (id: string) => {
    setVisibleLayers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const normalizedGeoJson = useMemo(() => {
    if (!geoJson) return null
    if (geoJson.type === 'FeatureCollection') return geoJson
    return { type: 'FeatureCollection' as const, features: [geoJson] }
  }, [geoJson])

  if (!hasGeoJson) {
    return (
      <div
        className={`flex h-[250px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-gray-50 md:h-[400px] ${className}`}
      >
        <p className="text-sm text-gray-500">
          Mapa não disponível - polígono não encontrado
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="h-[250px] overflow-hidden rounded-lg border border-[#E5E7EB] md:h-[400px]">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          <FitBounds
            geoJson={geoJson}
            cropLayers={cropLayers}
            visibleLayers={visibleLayers}
          />
          {normalizedGeoJson && (
            <GeoJSON data={normalizedGeoJson} pathOptions={propertyStyle} />
          )}
          {cropLayers.map((layer) => {
            if (!visibleLayers.has(layer.id)) return null
            const normalized =
              layer.geoJson.type === 'FeatureCollection'
                ? layer.geoJson
                : { type: 'FeatureCollection' as const, features: [layer.geoJson] }
            return (
              <GeoJSON
                key={layer.id}
                data={normalized}
                pathOptions={{
                  color: layer.color,
                  fillColor: layer.color,
                  fillOpacity: 0.35,
                  weight: 2,
                }}
              />
            )
          })}
        </MapContainer>
      </div>

      {hasCropLayers && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2">
          <span className="text-xs font-medium text-neutral-text-secondary">Camadas:</span>
          <label className="flex items-center gap-1.5 text-xs text-neutral-text-primary">
            <span
              className="inline-block h-3 w-3 rounded-sm border-2"
              style={{ borderColor: '#FFFFFF', background: 'transparent' }}
            />
            Propriedade (CAR)
          </label>
          {cropLayers.map((layer) => (
            <label
              key={layer.id}
              className="flex cursor-pointer items-center gap-1.5 text-xs text-neutral-text-primary"
            >
              <input
                type="checkbox"
                checked={visibleLayers.has(layer.id)}
                onChange={() => toggleLayer(layer.id)}
                className="sr-only"
              />
              <span
                className="inline-block h-3 w-3 rounded-sm border"
                style={{
                  backgroundColor: visibleLayers.has(layer.id)
                    ? layer.color
                    : 'transparent',
                  borderColor: layer.color,
                  opacity: visibleLayers.has(layer.id) ? 1 : 0.4,
                }}
              />
              {layer.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
