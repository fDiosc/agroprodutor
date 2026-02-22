import { renderToBuffer } from '@react-pdf/renderer'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { ESG_LAYERS, PRODUCER_ESG_LAYERS } from '@/lib/constants'
import { EsgReportPdf } from '@/components/pdf/esg-report-pdf'

export const runtime = 'nodejs'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.activeWorkspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const property = await prisma.property.findFirst({
    where: { id, workspaceId: session.user.activeWorkspaceId },
    include: {
      esgReports: { orderBy: { checkedAt: 'desc' }, take: 1 },
      user: { select: { name: true, cpfCnpj: true } },
    },
  })

  if (!property) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const latestEsg = property.esgReports[0]
  const esgData = (latestEsg?.fullData as Record<string, unknown>) ?? null

  const buffer = await renderToBuffer(
    EsgReportPdf({
      propertyName: property.name || property.carCode,
      carCode: property.carCode,
      municipio: property.municipio,
      uf: property.uf,
      areaImovel: property.areaImovel,
      carStatus: property.carStatus,
      esgStatus: property.esgStatus,
      totalApontamentos: latestEsg?.totalApontamentos ?? 0,
      userName: property.user.name,
      userCpfCnpj: property.user.cpfCnpj,
      checkedAt: latestEsg?.checkedAt ?? new Date(),
      esgData,
      layers: ESG_LAYERS.map((l) => ({ key: l.key, label: l.label })),
      producerLayers: PRODUCER_ESG_LAYERS.map((l) => ({ key: l.key, label: l.label })),
    })
  )

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="relatorio-esg-${property.carCode}.pdf"`,
    },
  })
}
