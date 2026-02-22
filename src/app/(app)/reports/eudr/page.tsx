import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { EudrSelector } from '@/components/eudr/eudr-selector'
import { EudrSummary } from '@/components/eudr/eudr-summary'
import {
  EudrLayersTable,
  type EudrLayer,
} from '@/components/eudr/eudr-layers-table'
import { EudrProdesTable } from '@/components/eudr/eudr-prodes-table'
import { RefreshEudrButton } from '@/components/eudr/refresh-eudr-button'

export default async function EUDRReportPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string }>
}) {
  const { propertyId } = await searchParams
  const session = await auth()
  if (!session?.user) redirect('/login')
  const workspaceId = session.user.activeWorkspaceId
  if (!workspaceId) redirect('/login')

  const properties = await prisma.property.findMany({
    where: { workspaceId },
    select: { id: true, name: true, carCode: true },
    orderBy: { name: 'asc' },
  })

  let selectedProperty: Awaited<
    ReturnType<
      typeof prisma.property.findFirst<{
        include: { eudrReports: true }
      }>
    >
  > = null

  if (propertyId) {
    selectedProperty = await prisma.property.findFirst({
      where: { id: propertyId, workspaceId },
      include: {
        eudrReports: {
          orderBy: { checkedAt: 'desc' },
          take: 1,
        },
      },
    })
  }

  const latestEudr = selectedProperty?.eudrReports[0] ?? null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-text-primary">Relatório EUDR</h1>
      <EudrSelector properties={properties} selectedPropertyId={propertyId ?? undefined} />

      {selectedProperty && (
        <>
          <EudrSummary
            euStatus={latestEudr?.euStatus ?? null}
            forestLossArea={latestEudr?.forestLossArea ?? null}
            checkedAt={latestEudr?.checkedAt ?? null}
          />
          {latestEudr?.layerData && (
            <EudrLayersTable layerData={latestEudr.layerData as unknown as EudrLayer[]} />
          )}
          {latestEudr?.prodesLayerData && (
            <EudrProdesTable prodesLayerData={latestEudr.prodesLayerData as unknown as EudrLayer[]} />
          )}
          {!latestEudr && (
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-8 text-center">
              <p className="text-neutral-text-secondary">
                Nenhum dado EUDR disponível. Clique em &quot;Atualizar EUDR&quot; para buscar os
                dados.
              </p>
            </div>
          )}
          <RefreshEudrButton propertyId={selectedProperty.id} />
        </>
      )}
    </div>
  )
}
