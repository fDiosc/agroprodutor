'use client'

import { useEffect, useState } from 'react'

interface WeatherData {
  daily?: {
    time?: string[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
    precipitation_sum?: number[]
    weather_code?: number[]
  }
}

interface WeatherMiniProps {
  lat: number
  lng: number
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
  if (code <= 3) return 'Parc. nublado'
  if (code <= 48) return 'Nevoeiro'
  if (code <= 55) return 'Garoa'
  if (code <= 67) return 'Chuva'
  if (code <= 77) return 'Neve'
  if (code <= 82) return 'Pancadas'
  return 'Tempestade'
}

export function WeatherMini({ lat, lng }: WeatherMiniProps) {
  const [data, setData] = useState<WeatherData | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/weather?lat=${lat}&lng=${lng}&days=3`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d) setData(d) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [lat, lng])

  if (!data?.daily) {
    return (
      <div className="flex items-center gap-2">
        <span className="h-3 w-24 animate-pulse rounded bg-blue-200/50" />
      </div>
    )
  }

  const { temperature_2m_max, temperature_2m_min, precipitation_sum, weather_code } = data.daily
  const todayMax = temperature_2m_max?.[0]
  const todayMin = temperature_2m_min?.[0]
  const code = weather_code?.[0] ?? 0
  const icon = getWeatherIcon(code)
  const label = getWeatherLabel(code)

  const rain3d = (precipitation_sum ?? []).slice(0, 3).reduce((a, b) => a + b, 0)

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">{icon}</span>
        <div>
          <p className="text-[10px] font-medium text-blue-700">Previsão hoje</p>
          <p className="text-xs font-semibold text-neutral-text-primary">
            {todayMax != null && todayMin != null
              ? `${Math.round(todayMax)}/${Math.round(todayMin)}°C`
              : '—'}{' '}
            <span className="font-normal text-neutral-text-secondary">· {label}</span>
          </p>
        </div>
      </div>
      {rain3d > 0 && (
        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
          💧 {Math.round(rain3d)}mm em 3d
        </span>
      )}
    </div>
  )
}
