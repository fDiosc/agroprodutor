import { NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { prisma } from '@/lib/prisma'
import { merxApi } from '@/lib/merx-api'
import { getAuthSession, getPropertyForWorkspace } from '@/lib/api-helpers'

const bodySchema = z.object({
  detailed: z.boolean().optional(),
})

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: RouteParams) {
  const { workspaceId, error } = await getAuthSession()
  if (error) return error

  const { id } = await params
  const property = await getPropertyForWorkspace(id, workspaceId)

  if (!property) {
    return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 })
  }

  let detailed = false
  try {
    const body = await request.json().catch(() => ({}))
    const parsed = bodySchema.parse(body)
    detailed = parsed.detailed ?? false
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.issues },
        { status: 400 }
      )
    }
  }

  try {
    const eudrData = detailed
      ? await merxApi.getEudrReportDetailed(property.carCode)
      : await merxApi.getEudrReportResumed(property.carCode)

    const euStatus =
      eudrData.eu?.property_data_eu?.eu_status ?? eudrData.eu_status_summary ?? 'UNKNOWN'
    const forestLossArea = 'forest_loss_data' in eudrData && eudrData.forest_loss_data
      ? (eudrData.forest_loss_data as { total_area?: number }).total_area ?? null
      : null
    const layerData = eudrData.eu?.layer_data ?? null
    const prodesLayerData = eudrData.eu?.prodes_layer_data ?? null

    const [report] = await prisma.$transaction([
      prisma.eudrReport.create({
        data: {
          propertyId: id,
          euStatus,
          forestLossArea,
          layerData: layerData ? (layerData as object) : undefined,
          prodesLayerData: prodesLayerData ? (prodesLayerData as object) : undefined,
        },
      }),
      prisma.property.update({
        where: { id },
        data: { eudrStatus: euStatus },
      }),
    ])

    return NextResponse.json(report)
  } catch (err) {
    console.error('EUDR refresh error:', err)
    return NextResponse.json(
      { error: 'Falha ao buscar dados EUDR da Merx API' },
      { status: 502 }
    )
  }
}
