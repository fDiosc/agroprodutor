import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { MeteorologiaClient } from '@/components/meteorologia/meteorologia-client'

export default async function MeteorologiaPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const workspaceId = session.user.activeWorkspaceId
  if (!workspaceId) redirect('/dashboard')

  const properties = await prisma.property.findMany({
    where: { workspaceId },
    select: {
      id: true,
      name: true,
      carCode: true,
      municipio: true,
      uf: true,
      geoPolygon: true,
    },
    orderBy: { name: 'asc' },
  })

  const serialized = properties.map((p) => ({
    id: p.id,
    name: p.name,
    carCode: p.carCode,
    municipio: p.municipio,
    uf: p.uf,
    geoPolygon: p.geoPolygon as GeoJSON.FeatureCollection | GeoJSON.Feature | null,
  }))

  return <MeteorologiaClient properties={serialized} />
}
