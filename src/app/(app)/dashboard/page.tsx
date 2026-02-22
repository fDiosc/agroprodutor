import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  MapPinIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const workspaceId = session.user.activeWorkspaceId
  if (!workspaceId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-text-primary">
            Bem-vindo, {session.user.name?.split(' ')[0] ?? 'Produtor'}
          </h1>
          <p className="mt-1 text-neutral-text-secondary">
            Nenhum workspace ativo. Entre em contato com o suporte.
          </p>
        </div>
      </div>
    )
  }

  const properties = await prisma.property.findMany({
    where: { workspaceId },
    include: {
      esgReports: { orderBy: { checkedAt: 'desc' }, take: 1 },
    },
    orderBy: { name: 'asc' },
  })

  const unreadAlerts = await prisma.alert.count({
    where: {
      property: { workspaceId },
      read: false,
    },
  })

  const totalProperties = properties.length
  const conformeProperties = properties.filter(
    (p) => p.esgStatus === 'CONFORME'
  ).length
  const totalApontamentos = properties.reduce((acc, p) => {
    const latest = p.esgReports[0]
    return acc + (latest?.totalApontamentos ?? 0)
  }, 0)
  const naoConformeCount = properties.filter(
    (p) => p.esgStatus === 'NAO_CONFORME'
  ).length

  const hasNaoConforme = naoConformeCount > 0
  const hasApontamentos = totalApontamentos > 0
  const semaphoreStatus = hasNaoConforme
    ? 'red'
    : hasApontamentos
      ? 'yellow'
      : 'green'

  if (totalProperties === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-text-primary">
            Bem-vindo, {session.user.name?.split(' ')[0] ?? 'Produtor'}
          </h1>
          <p className="mt-1 text-neutral-text-secondary">
            Sua plataforma de monitoramento socioambiental
          </p>
        </div>
        <div className="rounded-lg border border-neutral-border bg-white p-8 shadow-card">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-neutral-text-secondary">
              Adicione sua primeira propriedade para começar
            </p>
            <Link
              href="/properties/new"
              className="mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brand-primary)' }}
            >
              Adicionar Propriedade
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusColor =
    semaphoreStatus === 'green'
      ? '#00C287'
      : semaphoreStatus === 'yellow'
        ? '#F59E0B'
        : '#EF4444'

  const statusLabel =
    semaphoreStatus === 'green'
      ? 'Tudo conforme'
      : semaphoreStatus === 'yellow'
        ? `${totalApontamentos} apontamento${totalApontamentos !== 1 ? 's' : ''}`
        : `${naoConformeCount} não conforme${naoConformeCount !== 1 ? 's' : ''}`

  const stats = [
    {
      icon: 'MapPinIcon',
      value: totalProperties,
      label: 'Propriedades',
    },
    {
      icon: 'CheckCircleIcon',
      value: conformeProperties,
      label: 'Conformes',
    },
    {
      icon: 'ClipboardDocumentListIcon',
      value: totalApontamentos,
      label: 'Apontamentos',
    },
    {
      icon: 'BellAlertIcon',
      value: unreadAlerts,
      label: 'Alertas',
    },
  ]

  const serializedProperties = properties.map((p) => ({
    id: p.id,
    name: p.name,
    carCode: p.carCode,
    municipio: p.municipio,
    uf: p.uf,
    areaImovel: p.areaImovel,
    esgStatus: p.esgStatus,
    eudrStatus: p.eudrStatus,
    totalApontamentos: p.esgReports[0]?.totalApontamentos ?? 0,
    lastCheckAt: p.lastCheckAt?.toISOString() ?? null,
    geoPolygon: p.geoPolygon as GeoJSON.FeatureCollection | GeoJSON.Feature | null,
  }))

  return (
    <DashboardClient
      userName={session.user.name?.split(' ')[0] ?? 'Produtor'}
      statusColor={statusColor}
      statusLabel={statusLabel}
      stats={stats}
      properties={serializedProperties}
    />
  )
}
