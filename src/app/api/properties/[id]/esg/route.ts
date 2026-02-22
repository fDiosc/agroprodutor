import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { merxApi } from '@/lib/merx-api'
import { geoServer } from '@/lib/geoserver'
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
    const esgData = await merxApi.getPropertyEsgReport(property.carCode)

    const owner = await prisma.user.findUnique({
      where: { id: property.userId },
      select: { cpfCnpj: true },
    })

    // Parallel non-critical fetches
    const [producerResult, polygonResult, eudrResult, soyResult, cornResult] =
      await Promise.allSettled([
        owner?.cpfCnpj
          ? merxApi.getProducerEsgReport(owner.cpfCnpj)
          : Promise.reject('no cpf'),
        property.geoPolygon
          ? Promise.reject('already has polygon')
          : geoServer.getPropertyPolygon(property.carCode),
        merxApi.getEudrReportResumed(property.carCode),
        merxApi.getProductivity(property.carCode, 'SOY', { includeGeoJson: true }),
        merxApi.getProductivity(property.carCode, 'CORN', { includeGeoJson: true }),
      ])

    const producerData =
      producerResult.status === 'fulfilled'
        ? (producerResult.value as unknown as Record<string, unknown>)
        : {}

    const fullData = { ...esgData, ...producerData } as object

    const geoPolygon =
      polygonResult.status === 'fulfilled' &&
      polygonResult.value.features?.length > 0
        ? (polygonResult.value as object)
        : undefined

    // Save EUDR report (non-critical) - replace old ones
    if (eudrResult.status === 'fulfilled') {
      const eudr = eudrResult.value
      const euStatus =
        eudr.eu?.property_data_eu?.eu_status ?? eudr.eu_status_summary ?? 'UNKNOWN'
      try {
        await prisma.$transaction([
          prisma.eudrReport.deleteMany({ where: { propertyId: id } }),
          prisma.eudrReport.create({
            data: {
              propertyId: id,
              euStatus,
              layerData: eudr.eu?.layer_data
                ? (eudr.eu.layer_data as unknown as object)
                : undefined,
              prodesLayerData: eudr.eu?.prodes_layer_data
                ? (eudr.eu.prodes_layer_data as unknown as object)
                : undefined,
            },
          }),
          prisma.property.update({
            where: { id },
            data: { eudrStatus: euStatus },
          }),
        ])
      } catch {
        // EUDR save is non-critical
      }
    }

    // Save productivity reports (non-critical)
    const productivityItems: Array<{
      culture: string
      harvest: string | null
      plantedArea: number | null
      declaredArea: number | null
      countyProductivity: number | null
      estimatedProduction: number | null
      geoJsonCrops: object | null
    }> = []

    function pushProductivity(
      result: PromiseSettledResult<Awaited<ReturnType<typeof merxApi.getProductivity>>>,
      culture: string
    ) {
      if (result.status !== 'fulfilled') return
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

    pushProductivity(soyResult, 'SOY')
    pushProductivity(cornResult, 'CORN')

    if (productivityItems.length > 0) {
      try {
        await prisma.$transaction([
          prisma.productivityReport.deleteMany({ where: { propertyId: id } }),
          ...productivityItems.map((r) =>
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
          ),
        ])
      } catch {
        // Productivity save is non-critical
      }
    }

    // Detect status changes before saving
    const oldEsgStatus = property.esgStatus
    const newEsgStatus = esgData.esg_status
    const oldEudrStatus = property.eudrStatus
    const newEudrStatus = eudrResult.status === 'fulfilled'
      ? (eudrResult.value.eu?.property_data_eu?.eu_status ?? eudrResult.value.eu_status_summary ?? null)
      : null
    const propertyLabel = property.name ?? property.carCode

    const alertsToCreate: Array<{
      propertyId: string
      type: 'STATUS_CHANGE' | 'EUDR_CHANGE'
      severity: 'INFO' | 'WARNING' | 'CRITICAL'
      message: string
    }> = []

    if (oldEsgStatus && newEsgStatus && oldEsgStatus !== newEsgStatus) {
      const improved = newEsgStatus === 'CONFORME'
      alertsToCreate.push({
        propertyId: id,
        type: 'STATUS_CHANGE',
        severity: improved ? 'INFO' : 'CRITICAL',
        message: `${propertyLabel}: ESG mudou de ${oldEsgStatus === 'CONFORME' ? 'Conforme' : 'Não Conforme'} para ${newEsgStatus === 'CONFORME' ? 'Conforme' : 'Não Conforme'}`,
      })
    }

    if (oldEudrStatus && newEudrStatus && oldEudrStatus !== newEudrStatus) {
      const improved = newEudrStatus === 'CONFORME'
      alertsToCreate.push({
        propertyId: id,
        type: 'EUDR_CHANGE',
        severity: improved ? 'INFO' : 'WARNING',
        message: `${propertyLabel}: EUDR mudou de ${oldEudrStatus === 'CONFORME' ? 'Conforme' : 'Não Conforme'} para ${newEudrStatus === 'CONFORME' ? 'Conforme' : 'Não Conforme'}`,
      })
    }

    // Save ESG report + update property + create alerts (critical)
    const [report] = await prisma.$transaction([
      prisma.esgReport.create({
        data: {
          propertyId: id,
          esgStatus: esgData.esg_status,
          fullData,
          totalApontamentos: esgData.total_apontamentos,
        },
      }),
      prisma.property.update({
        where: { id },
        data: {
          esgStatus: esgData.esg_status,
          lastCheckAt: new Date(),
          municipio: esgData.municipio,
          uf: esgData.uf,
          areaImovel: esgData.area_imovel,
          carStatus: esgData.car_status,
          ...(geoPolygon ? { geoPolygon } : {}),
        },
      }),
      ...alertsToCreate.map((a) => prisma.alert.create({ data: a })),
    ])

    return NextResponse.json(report)
  } catch (err) {
    console.error('ESG refresh error:', err)
    return NextResponse.json(
      { error: 'Falha ao buscar dados ESG da Merx API' },
      { status: 502 }
    )
  }
}
