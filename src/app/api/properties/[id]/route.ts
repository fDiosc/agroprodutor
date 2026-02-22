import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, getPropertyForWorkspace } from '@/lib/api-helpers'
import { normalizeCarCode } from '@/lib/utils'
import { geoServer } from '@/lib/geoserver'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  const { workspaceId, error } = await getAuthSession()
  if (error) return error

  const { id } = await params
  const property = await getPropertyForWorkspace(id, workspaceId)

  if (!property) {
    return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 })
  }

  const [latestEsg, latestEudr, productivityReports] = await Promise.all([
    prisma.esgReport.findFirst({
      where: { propertyId: id },
      orderBy: { checkedAt: 'desc' },
    }),
    prisma.eudrReport.findFirst({
      where: { propertyId: id },
      orderBy: { checkedAt: 'desc' },
    }),
    prisma.productivityReport.findMany({
      where: { propertyId: id },
      orderBy: { checkedAt: 'desc' },
      take: 10,
    }),
  ])

  return NextResponse.json({
    property,
    latestEsgReport: latestEsg,
    latestEudrReport: latestEudr,
    productivityReports,
  })
}

export async function PATCH(_request: Request, { params }: RouteParams) {
  const { workspaceId, error } = await getAuthSession()
  if (error) return error

  const { id } = await params
  const property = await getPropertyForWorkspace(id, workspaceId)

  if (!property) {
    return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 })
  }

  const normalizedCar = normalizeCarCode(property.carCode)
  const needsCarFix = normalizedCar !== property.carCode

  try {
    const geoResult = await geoServer.getPropertyPolygon(normalizedCar).catch(() => null)
    const geoPolygon = geoResult ?? property.geoPolygon

    await prisma.property.update({
      where: { id },
      data: {
        ...(needsCarFix ? { carCode: normalizedCar } : {}),
        geoPolygon: (geoPolygon as unknown as Record<string, unknown>) ?? undefined,
      },
    })

    return NextResponse.json({ success: true, carCode: normalizedCar, carFixed: needsCarFix, hasPolygon: !!geoPolygon })
  } catch (err) {
    console.error('Property fix error:', err)
    return NextResponse.json({ error: 'Erro ao corrigir propriedade' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { workspaceId, error } = await getAuthSession()
  if (error) return error

  const { id } = await params
  const property = await getPropertyForWorkspace(id, workspaceId)

  if (!property) {
    return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 })
  }

  await prisma.property.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
