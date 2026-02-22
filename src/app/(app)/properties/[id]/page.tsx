import type { FeatureCollection, Feature } from 'geojson'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { CULTURE_LABELS } from '@/lib/constants'
import { ReportHeader } from '@/components/reports/report-header'
import { ResumoSocioambiental } from '@/components/reports/resumo-socioambiental'
import { DadosProdutor } from '@/components/reports/dados-produtor'
import { DadosPropriedade } from '@/components/reports/dados-propriedade'
import { DynamicPropertyMap, type CropLayer } from '@/components/maps/dynamic-map'
import { DeclaracaoCar } from '@/components/reports/declaracao-car'
import { ApontamentosPropriedade } from '@/components/reports/apontamentos-propriedade'
import { ApontamentosProdutor } from '@/components/reports/apontamentos-produtor'
import { EudrPropertySection } from '@/components/reports/eudr-property-section'
import { RefreshReportButton } from '@/components/reports/refresh-report-button'
import { DownloadPdfButton } from '@/components/reports/download-pdf-button'
import { DeletePropertyButton } from '@/components/reports/delete-property-button'
import { ReportHistory } from '@/components/reports/report-history'
import { ProductivitySection } from '@/components/reports/productivity-section'
import type { EudrLayer } from '@/components/eudr/eudr-layers-table'

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')

  const workspaceId = session.user.activeWorkspaceId
  if (!workspaceId) redirect('/login')

  const [property, reportConfig] = await Promise.all([
    prisma.property.findFirst({
      where: { id, workspaceId },
      include: {
        esgReports: { orderBy: { checkedAt: 'desc' }, take: 10 },
        eudrReports: { orderBy: { checkedAt: 'desc' }, take: 1 },
        productivityReports: { orderBy: { checkedAt: 'desc' } },
        user: { select: { name: true, cpfCnpj: true } },
      },
    }),
    prisma.reportConfig.findUnique({
      where: { userId: session.user.id },
    }),
  ])

  if (!property) notFound()

  const config = {
    esgEnabled: reportConfig?.esgEnabled ?? true,
    eudrEnabled: reportConfig?.eudrEnabled ?? false,
    productivityEnabled: reportConfig?.productivityEnabled ?? true,
    producerReportEnabled: reportConfig?.producerReportEnabled ?? true,
  }

  const latestEsg = property.esgReports[0] ?? null
  const esgData = latestEsg?.fullData as Record<string, unknown> | null

  const latestEudr = property.eudrReports[0] ?? null

  const CROP_COLORS: Record<string, string> = {
    SOY: '#4ADE80',
    CORN: '#FACC15',
  }

  const cropLayers: CropLayer[] = property.productivityReports
    .filter((r) => r.geoJsonCrops != null)
    .map((r) => {
      const cultureLabel = CULTURE_LABELS[r.culture as keyof typeof CULTURE_LABELS] ?? r.culture
      const label = `${cultureLabel} ${r.harvest ?? ''}`
      return {
        id: r.id,
        label: label.trim(),
        geoJson: r.geoJsonCrops as unknown as FeatureCollection | Feature,
        color: CROP_COLORS[r.culture] ?? '#60A5FA',
      }
    })

  return (
    <div className="space-y-6">
      <ReportHeader
        propertyName={property.name || property.carCode}
        propertyId={property.id}
        checkedAt={latestEsg?.checkedAt ?? null}
      />
      <ResumoSocioambiental
        status={property.esgStatus}
        totalApontamentos={latestEsg?.totalApontamentos ?? 0}
      />
      <DadosProdutor
        name={property.user.name}
        cpfCnpj={property.user.cpfCnpj}
      />
      {config.producerReportEnabled && (
        <ApontamentosProdutor esgData={esgData} />
      )}
      <DadosPropriedade property={property} />
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-text-primary">
          Mapa da Propriedade
        </h2>
        <DynamicPropertyMap
          geoJson={
            property.geoPolygon
              ? (property.geoPolygon as unknown as FeatureCollection)
              : null
          }
          cropLayers={cropLayers}
        />
      </div>
      <DeclaracaoCar
        carStatus={property.carStatus}
        areaImovel={property.areaImovel}
        carStatusUpdatedAt={esgData?.car_status_updated_at as number | null}
      />
      {config.esgEnabled && (
        <ApontamentosPropriedade esgData={esgData} />
      )}
      {config.eudrEnabled && (
        <EudrPropertySection
          euStatus={latestEudr?.euStatus ?? null}
          forestLossArea={latestEudr?.forestLossArea ?? null}
          layerData={latestEudr?.layerData as unknown as EudrLayer[] | null}
          prodesLayerData={latestEudr?.prodesLayerData as unknown as EudrLayer[] | null}
          checkedAt={latestEudr?.checkedAt ?? null}
        />
      )}
      {config.productivityEnabled && property.productivityReports.length > 0 && (
        <ProductivitySection reports={property.productivityReports} />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <RefreshReportButton propertyId={property.id} />
        <DownloadPdfButton
          propertyId={property.id}
          propertyName={property.name || property.carCode}
        />
        <DeletePropertyButton
          propertyId={property.id}
          propertyName={property.name || property.carCode}
        />
      </div>
      <ReportHistory
        reports={property.esgReports.map((r) => ({
          id: r.id,
          esgStatus: r.esgStatus,
          totalApontamentos: r.totalApontamentos,
          checkedAt: r.checkedAt,
        }))}
      />
    </div>
  )
}
