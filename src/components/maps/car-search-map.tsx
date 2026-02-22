'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  TileLayer,
  WMSTileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMapEvents,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { cn } from '@/lib/utils'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const LEAFLET_ICON_BASE = 'https://unpkg.com/leaflet@1.9.4/dist/images'
// @ts-expect-error - Leaflet Icon.Default prototype modification
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: `${LEAFLET_ICON_BASE}/marker-icon.png`,
  iconRetinaUrl: `${LEAFLET_ICON_BASE}/marker-icon-2x.png`,
  shadowUrl: `${LEAFLET_ICON_BASE}/marker-shadow.png`,
})

interface GeoJsonData {
  type: string
  features?: Array<{
    type: string
    geometry: { type: string; coordinates: unknown }
    properties: Record<string, unknown>
  }>
}

interface CarResult {
  cod_imovel: string
  status_car?: string
  declared_area_car?: number
  area?: number
  uf?: string
  city?: string
  latitude?: string
  longitude?: string
  geoJson?: GeoJsonData | null
}

interface CarSearchMapProps {
  onSelectCar: (carCode: string, name?: string) => void
  className?: string
}

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function FlyToPoint({ position }: { position: [number, number] | null }) {
  const map = useMap()
  const prevRef = useRef<string | null>(null)

  const key = position ? `${position[0]},${position[1]}` : null
  if (key && key !== prevRef.current) {
    prevRef.current = key
    map.flyTo(position!, 14, { duration: 1 })
  }

  return null
}

function FitPolygon({ geoJson }: { geoJson: GeoJsonData | null }) {
  const map = useMap()
  const prevRef = useRef<string | null>(null)

  if (geoJson) {
    const key = JSON.stringify(geoJson).slice(0, 100)
    if (key !== prevRef.current) {
      prevRef.current = key
      try {
        const layer = L.geoJSON(geoJson as GeoJSON.GeoJsonObject)
        const bounds = layer.getBounds()
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
        }
      } catch { /* ignore */ }
    }
  }

  return null
}

const carPolygonStyle: L.PathOptions = {
  color: '#00C287',
  fillColor: '#00C287',
  fillOpacity: 0.15,
  weight: 2.5,
}

export function CarSearchMap({ onSelectCar, className = '' }: CarSearchMapProps) {
  const [clickedPosition, setClickedPosition] = useState<[number, number] | null>(null)
  const [results, setResults] = useState<CarResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showStates, setShowStates] = useState(true)
  const [showMunicipios, setShowMunicipios] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [geocodePosition, setGeocodePosition] = useState<[number, number] | null>(null)

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setClickedPosition([lat, lng])
    setGeocodePosition(null)
    setError(null)
    setResults([])
    setLoading(true)

    try {
      const res = await fetch(`/api/car-search?latitude=${lat}&longitude=${lng}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao buscar CARs')
        return
      }

      if (Array.isArray(data) && data.length === 0) {
        setError('Nenhum CAR encontrado nesta localização')
        return
      }

      setResults(Array.isArray(data) ? data : [])
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleGeocode = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return

    setSearching(true)
    setError(null)

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=br&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { 'User-Agent': 'AgroProdutor/0.0.3' } }
      )
      const data = await res.json()

      if (!Array.isArray(data) || data.length === 0) {
        setError('Endereço não encontrado')
        return
      }

      const { lat, lon } = data[0]
      const pos: [number, number] = [parseFloat(lat), parseFloat(lon)]
      setGeocodePosition(pos)
      setClickedPosition(null)
      setResults([])
    } catch {
      setError('Erro ao buscar endereço')
    } finally {
      setSearching(false)
    }
  }, [searchQuery])

  const activePolygon = useMemo(() => {
    const withGeo = results.find((r) => r.geoJson)
    return withGeo?.geoJson ?? null
  }, [results])

  const formatArea = (ha?: number) =>
    ha != null ? `${ha.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ha` : '—'

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Address search */}
      <form onSubmit={handleGeocode} className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar endereço, cidade ou estado..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)]"
            disabled={searching}
          />
        </div>
        <button
          type="submit"
          disabled={searching || !searchQuery.trim()}
          className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: 'var(--color-brand-primary)' }}
        >
          {searching ? 'Buscando...' : 'Ir'}
        </button>
      </form>

      <p className="text-xs text-neutral-text-secondary">
        Clique no mapa para buscar propriedades rurais (CARs) na localização.
      </p>

      {/* Map */}
      <div className="h-[350px] overflow-hidden rounded-lg border border-[#E5E7EB] md:h-[450px]">
        <MapContainer
          center={[-15.77972, -47.92972]}
          zoom={4}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='Tiles &copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          {/* State boundaries - IBGE */}
          {showStates && (
            <WMSTileLayer
              url="https://geoservicos.ibge.gov.br/geoserver/CCAR/wms"
              layers="CCAR:BC250_Unidade_Federacao_A"
              format="image/png"
              transparent={true}
              opacity={0.5}
              styles="highlight_polygon"
            />
          )}

          {/* Municipality boundaries - IBGE */}
          {showMunicipios && (
            <WMSTileLayer
              url="https://geoservicos.ibge.gov.br/geoserver/CCAR/wms"
              layers="CCAR:BC250_Municipio_A"
              format="image/png"
              transparent={true}
              opacity={0.35}
              styles="highlight_polygon"
            />
          )}

          <ClickHandler onMapClick={handleMapClick} />

          {/* Fly to geocoded position */}
          <FlyToPoint position={geocodePosition} />

          {/* Fit to polygon if available */}
          <FitPolygon geoJson={activePolygon} />

          {clickedPosition && (
            <Marker position={clickedPosition}>
              <Popup>
                Lat: {clickedPosition[0].toFixed(6)}
                <br />
                Lng: {clickedPosition[1].toFixed(6)}
              </Popup>
            </Marker>
          )}

          {geocodePosition && (
            <Marker position={geocodePosition}>
              <Popup>{searchQuery}</Popup>
            </Marker>
          )}

          {/* CAR polygon */}
          {results.map((car) => {
            if (!car.geoJson) return null
            return (
              <GeoJSON
                key={car.cod_imovel}
                data={car.geoJson as GeoJSON.GeoJsonObject}
                pathOptions={carPolygonStyle}
              />
            )
          })}
        </MapContainer>
      </div>

      {/* Layer toggles */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2">
        <span className="text-xs font-medium text-neutral-text-secondary">Camadas:</span>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-neutral-text-primary">
          <input
            type="checkbox"
            checked={showStates}
            onChange={() => setShowStates((p) => !p)}
            className="h-3.5 w-3.5 rounded border-gray-300"
          />
          Estados
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-neutral-text-primary">
          <input
            type="checkbox"
            checked={showMunicipios}
            onChange={() => setShowMunicipios((p) => !p)}
            className="h-3.5 w-3.5 rounded border-gray-300"
          />
          Municípios
        </label>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white p-4">
          <svg className="h-5 w-5 animate-spin text-[var(--color-brand-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-neutral-text-secondary">Buscando CARs...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-[var(--color-status-warning-bg)] px-4 py-3 text-sm text-[var(--color-status-warning-text)]">
          {error}
        </p>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-text-primary">
            CARs encontrados ({results.length}):
          </h3>
          {results.map((car) => (
            <div
              key={car.cod_imovel}
              className={cn(
                'flex flex-col gap-2 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between',
                car.geoJson ? 'border-[var(--color-brand-primary)]' : 'border-[#E5E7EB]'
              )}
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-medium text-neutral-text-primary">
                  {car.cod_imovel}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-neutral-text-secondary">
                  {car.city && car.uf && (
                    <span>{car.city} - {car.uf}</span>
                  )}
                  <span>Área: {formatArea(car.area)}</span>
                  {car.status_car && <span>Status: {car.status_car}</span>}
                  {car.geoJson && (
                    <span className="text-[var(--color-brand-primary)]">Polígono disponível</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectCar(car.cod_imovel, car.city ? `Propriedade em ${car.city}` : undefined)}
                className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--color-brand-primary)' }}
              >
                Selecionar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
