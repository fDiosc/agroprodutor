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
import { StatusSemaphore } from '@/components/dashboard/status-semaphore'
import { PropertyCard } from '@/components/dashboard/property-card'
import { StatsSummary } from '@/components/dashboard/stats-summary'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const workspaceId = session.user.activeWorkspaceId
  if (!workspaceId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-text-primary">
            Bem-vindo ao AgroProdutor
          </h1>
          <p className="mt-1 text-neutral-text-secondary">
            Sua plataforma de monitoramento socioambiental e rastreabilidade
            para produtores rurais.
          </p>
        </div>
        <div className="rounded-lg border border-neutral-border bg-white p-8 shadow-card">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-neutral-text-secondary">
              Nenhum workspace ativo. Entre em contato com o suporte.
            </p>
          </div>
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
            Bem-vindo ao AgroProdutor
          </h1>
          <p className="mt-1 text-neutral-text-secondary">
            Sua plataforma de monitoramento socioambiental e rastreabilidade
            para produtores rurais.
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

  const stats = [
    {
      icon: <MapPinIcon className="h-6 w-6" />,
      value: totalProperties,
      label: 'Total de propriedades',
    },
    {
      icon: <CheckCircleIcon className="h-6 w-6" />,
      value: conformeProperties,
      label: 'Propriedades conformes',
    },
    {
      icon: <ClipboardDocumentListIcon className="h-6 w-6" />,
      value: totalApontamentos,
      label: 'Total de apontamentos',
    },
    {
      icon: <BellAlertIcon className="h-6 w-6" />,
      value: unreadAlerts,
      label: 'Alertas não lidos',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-text-primary">
          Bem-vindo ao AgroProdutor
        </h1>
        <p className="mt-1 text-neutral-text-secondary">
          Sua plataforma de monitoramento socioambiental e rastreabilidade para
          produtores rurais.
        </p>
      </div>

      <StatusSemaphore
        status={semaphoreStatus}
        totalApontamentos={totalApontamentos}
        naoConformeCount={naoConformeCount}
      />

      <StatsSummary stats={stats} />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-neutral-text-primary">
          Minhas Propriedades
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              name={property.name}
              carCode={property.carCode}
              municipio={property.municipio}
              uf={property.uf}
              areaImovel={property.areaImovel}
              esgStatus={property.esgStatus}
              eudrStatus={property.eudrStatus}
              totalApontamentos={
                property.esgReports[0]?.totalApontamentos ?? 0
              }
              lastCheckAt={property.lastCheckAt?.toISOString() ?? null}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
