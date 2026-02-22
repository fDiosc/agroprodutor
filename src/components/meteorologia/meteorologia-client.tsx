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

function isSprayWindow(humidity: number, wind: number): boolean {
  return humidity >= 55 && humidity <= 85 && wind < 10
}

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-neutral-text-primary">Meteorologia</h1>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1"
          style={{ maxWidth: 320 }}
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
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      )}

      {daily && !loading && (
        <>
          <p className="text-sm text-neutral-text-secondary">
            Próximos 14 dias — <span className="font-medium text-neutral-text-primary">{displayName}</span>
          </p>

          {/* Daily cards (scrollable on mobile) */}
          <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-7 sm:overflow-visible">
            {daily.time.map((date, i) => {
              const spray = isSprayWindow(
                daily.relative_humidity_2m_mean[i],
                daily.wind_speed_10m_max[i]
              )
              return (
                <div
                  key={date}
                  className="flex min-w-[100px] shrink-0 flex-col items-center rounded-xl border border-neutral-border bg-white p-3 shadow-sm sm:min-w-0"
                >
                  <p className="text-xs font-medium text-neutral-text-secondary">
                    {formatDay(date)}
                  </p>
                  <span className="my-1.5 text-2xl">
                    {getWeatherIcon(daily.weather_code[i])}
                  </span>
                  <p className="text-xs text-neutral-text-secondary">
                    {getWeatherLabel(daily.weather_code[i])}
                  </p>
                  <p className="mt-1 text-sm font-bold text-neutral-text-primary">
                    {Math.round(daily.temperature_2m_max[i])}/{Math.round(daily.temperature_2m_min[i])}°C
                  </p>
                  <p className={`mt-0.5 text-xs font-medium ${daily.precipitation_sum[i] > 0 ? 'text-blue-600' : 'text-neutral-text-secondary'}`}>
                    💧 {daily.precipitation_sum[i].toFixed(1)}mm
                  </p>
                  {spray && (
                    <span className="mt-1.5 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                      Pulverizar
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Chuva acumulada (14d)"
              value={`${totalPrecip.toFixed(0)}mm`}
              color={totalPrecip > 50 ? '#3B82F6' : totalPrecip > 20 ? '#00C287' : '#F59E0B'}
            />
            <SummaryCard
              title="Janela de pulverização"
              value={`${sprayDays.length} dia${sprayDays.length !== 1 ? 's' : ''}`}
              subtitle="Umidade 55-85% e vento < 10km/h"
              color="#00C287"
            />
            <SummaryCard
              title="Dias secos consecutivos"
              value={`${consecutiveDry} dia${consecutiveDry !== 1 ? 's' : ''}`}
              subtitle={consecutiveDry >= 7 ? 'Atenção: risco de seca' : 'Normal'}
              color={consecutiveDry >= 7 ? '#EF4444' : '#00C287'}
            />
            <SummaryCard
              title="ET₀ média"
              value={`${avgEt0.toFixed(1)}mm/dia`}
              subtitle="Evapotranspiração de referência"
              color="#8B5CF6"
            />
          </div>

          {/* Detailed table */}
          <div className="overflow-x-auto rounded-xl border border-neutral-border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-border bg-gray-50/80">
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">Dia</th>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">Tempo</th>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">Temp. Max</th>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">Temp. Min</th>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">Chuva</th>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">Umidade</th>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">Vento</th>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">ET₀</th>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-text-secondary">Pulverizar?</th>
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
                      <td className="px-4 py-2.5 text-red-500 font-medium">
                        {Math.round(daily.temperature_2m_max[i])}°C
                      </td>
                      <td className="px-4 py-2.5 text-blue-500 font-medium">
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
        </>
      )}
    </div>
  )
}

function SummaryCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string
  value: string
  subtitle?: string
  color: string
}) {
  return (
    <div className="rounded-xl border border-neutral-border bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-neutral-text-secondary">{title}</p>
      <p className="mt-1 text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      {subtitle && (
        <p className="mt-0.5 text-xs text-neutral-text-secondary">{subtitle}</p>
      )}
    </div>
  )
}
