import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { geoServer } from '@/lib/geoserver'
import { getAuthSession, getPropertyForWorkspace } from '@/lib/api-helpers'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  const { workspaceId, error } = await getAuthSession()
  if (error) return error

  const { id } = await params
  const property = await getPropertyForWorkspace(id, workspaceId)

  if (!property) {
    return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 })
  }

  if (property.geoPolygon) {
    return NextResponse.json(property.geoPolygon, {
      headers: { 'Content-Type': 'application/geo+json' },
    })
  }

  try {
    const polygon = await geoServer.getPropertyPolygon(property.carCode)

    await prisma.property.update({
      where: { id },
      data: { geoPolygon: polygon as object },
    })

    return NextResponse.json(polygon, {
      headers: { 'Content-Type': 'application/geo+json' },
    })
  } catch (err) {
    console.error('Polygon fetch error:', err)
    return NextResponse.json(
      { error: 'Falha ao buscar polígono do GeoServer' },
      { status: 502 }
    )
  }
}
