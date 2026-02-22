import { NextResponse } from 'next/server'

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast'

const DAILY_VARS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'relative_humidity_2m_mean',
  'wind_speed_10m_max',
  'et0_fao_evapotranspiration',
  'weather_code',
].join(',')

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const days = searchParams.get('days') ?? '14'

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Parâmetros lat e lng são obrigatórios' },
      { status: 400 }
    )
  }

  try {
    const url = `${OPEN_METEO_BASE}?latitude=${lat}&longitude=${lng}&daily=${DAILY_VARS}&forecast_days=${days}&timezone=America%2FSao_Paulo`

    const res = await fetch(url, { next: { revalidate: 3600 } })

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Erro ao buscar dados meteorológicos' },
        { status: 502 }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Erro interno ao consultar clima' },
      { status: 500 }
    )
  }
}
