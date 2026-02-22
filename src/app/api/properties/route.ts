import { NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { prisma } from '@/lib/prisma'
import { merxApi } from '@/lib/merx-api'
import { geoServer } from '@/lib/geoserver'
import { getAuthSession } from '@/lib/api-helpers'
import { normalizeCarCode } from '@/lib/utils'

const createPropertySchema = z.object({
  carCode: z.string().min(1, 'Código CAR é obrigatório').transform(normalizeCarCode),
  name: z.string().optional(),
})

export async function GET() {
  const { workspaceId, error } = await getAuthSession()
  if (error) return error

  const properties = await prisma.property.findMany({
    where: { workspaceId },
    include: {
      esgReports: {
        orderBy: { checkedAt: 'desc' },
        take: 1,
      },
      alerts: {
        where: { read: false },
      },
    },
    orderBy: { name: 'asc' },
  })

  const result = properties.map((p) => ({
    ...p,
    latestEsgReport: p.esgReports[0] ?? null,
    unreadAlertsCount: p.alerts.length,
    esgReports: undefined,
    alerts: undefined,
  }))

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const { userId, workspaceId, error } = await getAuthSession()
  if (error) return error

  try {
    const body = await request.json()
    const data = createPropertySchema.parse(body)

    const existing = await prisma.property.findUnique({
      where: {
        workspaceId_carCode: {
          workspaceId,
          carCode: data.carCode,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Propriedade com este código CAR já existe no workspace' },
        { status: 409 }
      )
    }

    // Fetch all data in parallel
    const [esgResult, polygonResult, eudrResult, soyResult, cornResult] =
      await Promise.allSettled([
        merxApi.getPropertyEsgReport(data.carCode),
        geoServer.getPropertyPolygon(data.carCode),
        merxApi.getEudrReportResumed(data.carCode),
        merxApi.getProductivity(data.carCode, 'SOY', { includeGeoJson: true }),
        merxApi.getProductivity(data.carCode, 'CORN', { includeGeoJson: true }),
      ])

    let municipio: string | null = null
    let uf: string | null = null
    let areaImovel: number | null = null
    let carStatus: string | null = null
    let esgStatus: string | null = null
    let eudrStatus: string | null = null
    let geoPolygon: object | null = null
    let esgFullData: object | null = null
    let totalApontamentos = 0

    if (esgResult.status === 'fulfilled') {
      const esg = esgResult.value
      municipio = esg.municipio
      uf = esg.uf
      areaImovel = esg.area_imovel
      carStatus = esg.car_status
      esgStatus = esg.esg_status
      totalApontamentos = esg.total_apontamentos
      esgFullData = esg as unknown as object
    }

    if (polygonResult.status === 'fulfilled') {
      const poly = polygonResult.value
      if (poly.features?.length > 0) {
        geoPolygon = poly as object
      }
    }

    if (eudrResult.status === 'fulfilled') {
      eudrStatus =
        eudrResult.value.eu?.property_data_eu?.eu_status ??
        eudrResult.value.eu_status_summary ??
        null
    }

    const property = await prisma.property.create({
      data: {
        workspaceId,
        userId,
        carCode: data.carCode,
        name: data.name ?? null,
        municipio,
        uf,
        areaImovel,
        carStatus,
        esgStatus,
        eudrStatus,
        geoPolygon: geoPolygon ?? undefined,
        lastCheckAt: esgFullData ? new Date() : undefined,
      },
    })

    // Save ESG report
    if (esgFullData) {
      await prisma.esgReport.create({
        data: {
          propertyId: property.id,
          esgStatus: esgStatus ?? 'UNKNOWN',
          fullData: esgFullData,
          totalApontamentos,
        },
      })
    }

    // Save EUDR report
    if (eudrResult.status === 'fulfilled') {
      const eudr = eudrResult.value
      try {
        await prisma.eudrReport.create({
          data: {
            propertyId: property.id,
            euStatus:
              eudr.eu?.property_data_eu?.eu_status ??
              eudr.eu_status_summary ??
              'UNKNOWN',
            layerData: eudr.eu?.layer_data
              ? (eudr.eu.layer_data as unknown as object)
              : undefined,
            prodesLayerData: eudr.eu?.prodes_layer_data
              ? (eudr.eu.prodes_layer_data as unknown as object)
              : undefined,
          },
        })
      } catch {
        // Non-critical
      }
    }

    // Save productivity reports
    const productivityItems: Array<{
      culture: string
      harvest: string | null
      plantedArea: number | null
      declaredArea: number | null
      countyProductivity: number | null
      estimatedProduction: number | null
      geoJsonCrops: object | null
    }> = []

    for (const [result, culture] of [
      [soyResult, 'SOY'],
      [cornResult, 'CORN'],
    ] as const) {
      if (result.status === 'fulfilled') {
        for (const item of result.value) {
          productivityItems.push({
            culture,
            harvest: item.harvest ?? null,
            plantedArea: item.planted_area ?? null,
            declaredArea: item.declared_area ?? null,
            countyProductivity: item.county_productivity ?? null,
            estimatedProduction: item.estimated_total_annual_production ?? null,
            geoJsonCrops: item.geo_json
              ? ((typeof item.geo_json === 'string'
                  ? JSON.parse(item.geo_json)
                  : item.geo_json) as object)
              : null,
          })
        }
      }
    }

    if (productivityItems.length > 0) {
      try {
        await prisma.$transaction(
          productivityItems.map((r) =>
            prisma.productivityReport.create({
              data: {
                propertyId: property.id,
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
      } catch {
        // Non-critical
      }
    }

    return NextResponse.json(property, { status: 201 })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.issues },
        { status: 400 }
      )
    }
    console.error('Create property error:', err)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
