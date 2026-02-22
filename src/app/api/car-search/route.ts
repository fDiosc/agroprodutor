import { NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-helpers'
import { merxApi, MerxApiError } from '@/lib/merx-api'
import { geoServer } from '@/lib/geoserver'

export async function GET(request: Request) {
  const { error } = await getAuthSession()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('latitude')
  const lng = searchParams.get('longitude')

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'latitude and longitude are required' },
      { status: 400 }
    )
  }

  try {
    const results = await merxApi.getCarsByLatLong(parseFloat(lat), parseFloat(lng))

    const enriched = await Promise.all(
      results.map(async (car) => {
        try {
          const polygon = await geoServer.getPropertyPolygon(car.cod_imovel)
          return { ...car, geoJson: polygon }
        } catch {
          return { ...car, geoJson: null }
        }
      })
    )

    return NextResponse.json(enriched)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to search CARs'
    const statusCode = err instanceof MerxApiError ? err.statusCode : 500
    console.error('CAR search error:', message)
    return NextResponse.json(
      { error: message },
      { status: statusCode }
    )
  }
}
