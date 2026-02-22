'use client'

import { useState, useEffect, useCallback } from 'react'
import { getPolygonCentroid } from '@/lib/utils'
import {
  CloudIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface PropertyInfo {
  id: string
  name: string | null
  carCode: string
  municipio: string | null
  uf: string | null
  geoPolygon: GeoJSON.FeatureCollection | GeoJSON.Feature | null
}

interface DailyData {
  time: string[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  precipitation_sum: number[]
  relative_humidity_2m_mean: number[]
  wind_speed_10m_max: number[]
  et0_fao_evapotranspiration: number[]
  weather_code: number[]
}

interface WeatherResponse {
  daily?: DailyData
}

function getWeatherIcon(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '🌨️'
  if (code <= 82) return '🌧️'
  if (code <= 86) return '🌨️'
  return '⛈️'
}

function getWeatherLabel(code: number): string {
  if (code === 0) return 'Céu limpo'
  if (code <= 3) return 'Parcialmente nublado'
  if (code <= 48) return 'Nevoeiro'
  if (code <= 55) return 'Garoa'
  if (code <= 67) return 'Chuva'
  if (code <= 77) return 'Neve'
  if (code <= 82) return 'Pancadas'
  return 'Tempestade'
}

function formatDay(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const diff = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })
}

function formatDayShort(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const diff = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (diff === 0) return 'Hj'
  if (diff === 1) return 'Am'
  return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
}

function isSprayWindow(humidity: number, wind: number): boolean {
  return humidity >= 55 && humidity <= 85 && wind < 10
}

// ---------- SVG Chart ----------

function WeatherChart({ daily }: { daily: DailyData }) {
  const count = daily.time.length
  const W = 700
  const H = 220
  const PAD_L = 36
  const PAD_R = 12
  const PAD_T = 24
  const PAD_B = 32
  const chartW = W - PAD_L - PAD_R
  const chartH = H - PAD_T - PAD_B

  const maxPrecip = Math.max(1, ...daily.precipitation_sum)
  const allTemps = [...daily.temperature_2m_max, ...daily.temperature_2m_min]
  const minTemp = Math.min(...allTemps) - 2
  const maxTemp = Math.max(...allTemps) + 2
  const tempRange = maxTemp - minTemp || 1

  const barW = Math.min(chartW / count * 0.5, 22)
  const step = chartW / count

  const tempToY = (t: number) => PAD_T + chartH - ((t - minTemp) / tempRange) * chartH
  const precipToH = (p: number) => (p / maxPrecip) * chartH

  const maxLine = daily.temperature_2m_max
    .map((t, i) => `${i === 0 ? 'M' : 'L'}${PAD_L + step * i + step / 2},${tempToY(t)}`)
    .join(' ')

  const minLine = daily.temperature_2m_min
    .map((t, i) => `${i === 0 ? 'M' : 'L'}${PAD_L + step * i + step / 2},${tempToY(t)}`)
    .join(' ')

  return (
    <div className="rounded-xl border border-neutral-border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-text-primary">Chuva e Temperatura — 14 dias</h3>
        <div className="flex items-center gap-4 text-[11px] text-neutral-text-secondary">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-400" /> Chuva (mm)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 rounded bg-red-500" /> Máx °C
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 rounded bg-sky-500" /> Mín °C
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Y-axis temp labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const temp = minTemp + tempRange * pct
          const y = tempToY(temp)
          return (
            <g key={pct}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="#E5E7EB" strokeWidth={0.5} />
              <text x={PAD_L - 4} y={y + 3} textAnchor="end" className="fill-neutral-text-secondary" fontSize={9}>
                {Math.round(temp)}°
              </text>
            </g>
          )
        })}

        {/* Rain bars */}
        {daily.precipitation_sum.map((p, i) => {
          const x = PAD_L + step * i + step / 2 - barW / 2
          const h = precipToH(p)
          return (
            <rect
              key={`rain-${daily.time[i]}`}
              x={x}
              y={PAD_T + chartH - h}
              width={barW}
              height={h}
              rx={2}
              className="fill-blue-400/60"
            />
          )
        })}

        {/* Temp max line */}
        <path d={maxLine} fill="none" stroke="#EF4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {daily.temperature_2m_max.map((t, i) => (
          <circle key={`max-${i}`} cx={PAD_L + step * i + step / 2} cy={tempToY(t)} r={3} className="fill-red-500" />
        ))}

        {/* Temp min line */}
        <path d={minLine} fill="none" stroke="#0EA5E9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {daily.temperature_2m_min.map((t, i) => (
          <circle key={`min-${i}`} cx={PAD_L + step * i + step / 2} cy={tempToY(t)} r={3} className="fill-sky-500" />
        ))}

        {/* X-axis day labels */}
        {daily.time.map((date, i) => (
          <text
            key={`label-${date}`}
            x={PAD_L + step * i + step / 2}
            y={H - 6}
            textAnchor="middle"
            className="fill-neutral-text-secondary"
            fontSize={9}
          >
            {formatDayShort(date)}
          </text>
        ))}

        {/* Rain value labels on bars */}
        {daily.precipitation_sum.map((p, i) => {
          if (p < 1) return null
          const h = precipToH(p)
          return (
            <text
              key={`rain-label-${i}`}
              x={PAD_L + step * i + step / 2}
              y={PAD_T + chartH - h - 4}
              textAnchor="middle"
              className="fill-blue-600"
              fontSize={8}
              fontWeight={600}
            >
              {Math.round(p)}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// ---------- Mobile daily list ----------

function MobileDayRow({ daily, index }: { daily: DailyData; index: number }) {
  const spray = isSprayWindow(
    daily.relative_humidity_2m_mean[index],
    daily.wind_speed_10m_max[index]
  )
  const precip = daily.precipitation_sum[index]

  return (
    <div className="flex items-center gap-3 border-b border-neutral-border px-3 py-2.5 last:border-0">
      <div className="w-12 shrink-0">
        <p className="text-xs font-semibold text-neutral-text-primary">{formatDay(daily.time[index])}</p>
      </div>
      <span className="text-xl leading-none">{getWeatherIcon(daily.weather_code[index])}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-text-primary">
          <span className="text-red-500">{Math.round(daily.temperature_2m_max[index])}°</span>
          {' / '}
          <span className="text-sky-500">{Math.round(daily.temperature_2m_min[index])}°</span>
        </p>
        <p className="text-[11px] text-neutral-text-secondary">
          {getWeatherLabel(daily.weather_code[index])}
          {' · '}💧 {precip.toFixed(1)}mm
          {' · '}{Math.round(daily.relative_humidity_2m_mean[index])}%
        </p>
      </div>
      {spray && (
        <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
          Pulv.
        </span>
      )}
    </div>
  )
}

// ---------- Main component ----------

interface MeteorologiaClientProps {
  properties: PropertyInfo[]
}

export function MeteorologiaClient({ properties }: MeteorologiaClientProps) {
  const [selectedId, setSelectedId] = useState(properties[0]?.id ?? '')
  const [weather, setWeather] = useState<WeatherResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const selected = properties.find((p) => p.id === selectedId)
  const centroid = selected ? getPolygonCentroid(selected.geoPolygon) : null

  const fetchWeather = useCallback(async () => {
    if (!centroid) return
    setLoading(true)
    try {
      const res = await fetch(
        `/api/weather?lat=${centroid[0]}&lng=${centroid[1]}&days=14`
      )
      if (res.ok) {
        const data = await res.json()
        setWeather(data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centroid?.[0], centroid?.[1]])

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  const daily = weather?.daily
  const displayName = selected
    ? selected.name || selected.carCode
    : ''

  const totalPrecip = daily
    ? daily.precipitation_sum.reduce((a, b) => a + b, 0)
    : 0

  const sprayDays = daily
    ? daily.time.filter((_, i) =>
        isSprayWindow(
          daily.relative_humidity_2m_mean[i],
          daily.wind_speed_10m_max[i]
        )
      )
    : []

  const avgEt0 = daily
    ? daily.et0_fao_evapotranspiration.reduce((a, b) => a + b, 0) /
      daily.et0_fao_evapotranspiration.length
    : 0

  const consecutiveDry = daily
    ? (() => {
        let max = 0
        let cur = 0
        for (const p of daily.precipitation_sum) {
          if (p < 1) { cur++; if (cur > max) max = cur } else { cur = 0 }
        }
        return max
      })()
    : 0

  if (properties.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-text-primary">Meteorologia</h1>
        <div className="rounded-xl border border-neutral-border bg-white p-8 text-center">
          <CloudIcon className="mx-auto h-12 w-12 text-neutral-text-secondary" />
          <p className="mt-3 text-neutral-text-secondary">
            Adicione propriedades para ver a previsão do tempo
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-neutral-text-primary sm:text-2xl">Meteorologia</h1>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 sm:max-w-xs"
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name || p.carCode} — {[p.municipio, p.uf].filter(Boolean).join(', ')}
            </option>
          ))}
        </select>
      </div>

      {!centroid && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              Propriedade sem polígono cadastrado. Não é possível obter a previsão.
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          <div className="h-52 animate-pulse rounded-xl bg-gray-200" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        </div>
      )}

      {daily && !loading && (
        <>
          <p className="text-sm text-neutral-text-secondary">
            Próximos 14 dias — <span className="font-medium text-neutral-text-primary">{displayName}</span>
          </p>

          {/* Chart */}
          <WeatherChart daily={daily} />

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Chuva acumulada"
              period="14 dias"
              value={`${totalPrecip.toFixed(0)}mm`}
              color={totalPrecip > 50 ? '#3B82F6' : totalPrecip > 20 ? '#00C287' : '#F59E0B'}
            />
            <SummaryCard
              title="Pulverização"
              period="dias favoráveis"
              value={`${sprayDays.length} dia${sprayDays.length !== 1 ? 's' : ''}`}
              color="#00C287"
            />
            <SummaryCard
              title="Dias secos"
              period="consecutivos"
              value={`${consecutiveDry}`}
              color={consecutiveDry >= 7 ? '#EF4444' : '#00C287'}
            />
            <SummaryCard
              title="ET₀ média"
              period="evapotranspiração"
              value={`${avgEt0.toFixed(1)}mm`}
              color="#8B5CF6"
            />
          </div>

          {/* Mobile: simple day list */}
          <div className="block sm:hidden">
            <div className="rounded-xl border border-neutral-border bg-white shadow-sm">
              <div className="border-b border-neutral-border px-3 py-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-text-secondary">
                  Previsão diária
                </h3>
              </div>
              {daily.time.map((_, i) => (
                <MobileDayRow key={daily.time[i]} daily={daily} index={i} />
              ))}
            </div>
          </div>

          {/* Desktop: detailed table */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto rounded-xl border border-neutral-border bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-border bg-gray-50/80">
                    <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">Dia</th>
                    <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">Tempo</th>
                    <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">Máx</th>
                    <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">Mín</th>
                    <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">Chuva</th>
                    <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">Umid.</th>
                    <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">Vento</th>
                    <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">ET₀</th>
                    <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">Pulv.?</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.time.map((date, i) => {
                    const spray = isSprayWindow(
                      daily.relative_humidity_2m_mean[i],
                      daily.wind_speed_10m_max[i]
                    )
                    return (
                      <tr key={date} className="border-b border-neutral-border last:border-0">
                        <td className="whitespace-nowrap px-4 py-2.5 font-medium text-neutral-text-primary">
                          {formatDay(date)}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="mr-1">{getWeatherIcon(daily.weather_code[i])}</span>
                          {getWeatherLabel(daily.weather_code[i])}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-red-500">
                          {Math.round(daily.temperature_2m_max[i])}°C
                        </td>
                        <td className="px-4 py-2.5 font-medium text-sky-500">
                          {Math.round(daily.temperature_2m_min[i])}°C
                        </td>
                        <td className="px-4 py-2.5">
                          {daily.precipitation_sum[i].toFixed(1)}mm
                        </td>
                        <td className="px-4 py-2.5">
                          {Math.round(daily.relative_humidity_2m_mean[i])}%
                        </td>
                        <td className="px-4 py-2.5">
                          {Math.round(daily.wind_speed_10m_max[i])}km/h
                        </td>
                        <td className="px-4 py-2.5">
                          {daily.et0_fao_evapotranspiration[i].toFixed(1)}mm
                        </td>
                        <td className="px-4 py-2.5">
                          {spray ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                              Sim
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                              Não
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function SummaryCard({
  title,
  period,
  value,
  color,
}: {
  title: string
  value: string
  period?: string
  color: string
}) {
  return (
    <div className="rounded-xl border border-neutral-border bg-white p-3 shadow-sm sm:p-4">
      <p className="text-[11px] font-medium text-neutral-text-secondary sm:text-xs">{title}</p>
      {period && <p className="text-[10px] text-neutral-text-secondary">{period}</p>}
      <p className="mt-1 text-xl font-bold sm:text-2xl" style={{ color }}>
        {value}
      </p>
    </div>
  )
}
