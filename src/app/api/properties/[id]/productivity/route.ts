import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { merxApi } from '@/lib/merx-api'
import { getAuthSession, getPropertyForWorkspace } from '@/lib/api-helpers'

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: RouteParams) {
  const { workspaceId, error } = await getAuthSession()
  if (error) return error

  const { id } = await params
  const property = await getPropertyForWorkspace(id, workspaceId)

  if (!property) {
    return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 })
  }

  try {
    const [soyData, cornData] = await Promise.all([
      merxApi.getProductivity(property.carCode, 'SOY', { includeGeoJson: true }),
      merxApi.getProductivity(property.carCode, 'CORN', { includeGeoJson: true }),
    ])

    const reports: Array<{
      culture: string
      harvest: string | null
      plantedArea: number | null
      declaredArea: number | null
      countyProductivity: number | null
      estimatedProduction: number | null
      geoJsonCrops: object | null
    }> = []

    for (const item of soyData) {
      reports.push({
        culture: 'SOY',
        harvest: item.harvest ?? null,
        plantedArea: item.planted_area ?? null,
        declaredArea: item.declared_area ?? null,
        countyProductivity: item.county_productivity ?? null,
        estimatedProduction: item.estimated_total_annual_production ?? null,
        geoJsonCrops: item.geo_json
          ? (typeof item.geo_json === 'string' ? JSON.parse(item.geo_json) : item.geo_json) as object
          : null,
      })
    }

    for (const item of cornData) {
      reports.push({
        culture: 'CORN',
        harvest: item.harvest ?? null,
        plantedArea: item.planted_area ?? null,
        declaredArea: item.declared_area ?? null,
        countyProductivity: item.county_productivity ?? null,
        estimatedProduction: item.estimated_total_annual_production ?? null,
        geoJsonCrops: item.geo_json
          ? (typeof item.geo_json === 'string' ? JSON.parse(item.geo_json) : item.geo_json) as object
          : null,
      })
    }

    const created = await prisma.$transaction(
      reports.map((r) =>
        prisma.productivityReport.create({
          data: {
            propertyId: id,
            culture: r.culture,
            harvest: r.harvest,
            plantedArea: r.plantedArea,
            declaredArea: r.declaredArea,
            countyProductivity: r.countyProductivity,
            estimatedProduction: r.estimatedProduction,
            geoJsonCrops: r.geoJsonCrops ?? undefined,
          },
        })
      )
    )

    return NextResponse.json(created)
  } catch (err) {
    console.error('Productivity refresh error:', err)
    return NextResponse.json(
      { error: 'Falha ao buscar dados de produtividade da Merx API' },
      { status: 502 }
    )
  }
}
