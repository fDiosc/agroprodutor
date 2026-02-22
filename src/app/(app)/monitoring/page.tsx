import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'
import { ConformeBadge } from '@/components/shared/conforme-badge'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { AlertsFilter } from '@/components/alerts/alerts-filter'
import { AlertsList, type AlertWithProperty } from '@/components/alerts/alerts-list'
import { AlertSeverity } from '@prisma/client'
import {
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline'

const VALID_SEVERITIES: AlertSeverity[] = ['INFO', 'WARNING', 'CRITICAL']

export default async function MonitoringPage({
  searchParams,
}: {
  searchParams: Promise<{ severity?: string; read?: string }>
}) {
  const { severity, read } = await searchParams
  const session = await auth()
  if (!session?.user) redirect('/login')
  const workspaceId = session.user.activeWorkspaceId
  if (!workspaceId) redirect('/login')

  const [properties, alerts, unreadCount, suppliers, recentChangePropertyIds] = await Promise.all([
    prisma.property.findMany({
      where: { workspaceId },
      include: {
        esgReports: { orderBy: { checkedAt: 'desc' }, take: 2 },
      },
      orderBy: { name: 'asc' },
    }),
    (() => {
      const where: {
        property: { workspaceId: string }
        severity?: AlertSeverity
        read?: boolean
      } = { property: { workspaceId } }
      if (severity && VALID_SEVERITIES.includes(severity as AlertSeverity)) {
        where.severity = severity as AlertSeverity
      }
      if (read === 'true') where.read = true
      if (read === 'false') where.read = false
      return prisma.alert.findMany({
        where,
        include: {
          property: { select: { name: true, carCode: true, id: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    })(),
    prisma.alert.count({
      where: { property: { workspaceId }, read: false },
    }),
    prisma.supplier.findMany({
      where: { workspaceId },
      include: { cars: true },
      orderBy: { name: 'asc' },
    }),
    prisma.alert.findMany({
      where: {
        property: { workspaceId },
        type: { in: ['STATUS_CHANGE', 'EUDR_CHANGE'] },
        read: false,
      },
      select: { propertyId: true },
    }).then((rows) => new Set(rows.map((r) => r.propertyId))),
  ])

  const totalProperties = properties.length
  const nonConformeProperties = properties.filter((p) => p.esgStatus && p.esgStatus !== 'CONFORME').length
  const eudrAlertProperties = properties.filter((p) => p.eudrStatus && p.eudrStatus !== 'CONFORME').length
  const conformeProperties = properties.filter((p) => p.esgStatus === 'CONFORME').length

  const totalSupplierCars = suppliers.reduce((acc, s) => acc + s.cars.length, 0)
  const nonConformeSupplierCars = suppliers.reduce(
    (acc, s) => acc + s.cars.filter((c) => c.esgStatus && c.esgStatus !== 'CONFORME').length,
    0
  )


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-text-primary">
          Monitoramento
        </h1>
        <p className="mt-1 text-neutral-text-secondary">
          Acompanhe em tempo real a conformidade das suas propriedades e fornecedores.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <EyeIcon className="h-5 w-5 text-[var(--color-brand-primary)]" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-text-secondary">
              Monitoradas
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#0B1B32]">{totalProperties + totalSupplierCars}</p>
          <p className="text-[10px] text-neutral-text-secondary">
            {totalProperties} próprias + {totalSupplierCars} fornecedores
          </p>
        </div>

        <div className="rounded-xl border border-green-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-text-secondary">
              Conformes
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-700">{conformeProperties}</p>
          <p className="text-[10px] text-neutral-text-secondary">
            propriedades OK
          </p>
        </div>

        <div className="rounded-xl border border-red-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-text-secondary">
              ESG Alertas
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">{nonConformeProperties + nonConformeSupplierCars}</p>
          <p className="text-[10px] text-neutral-text-secondary">
            {nonConformeProperties} próprias + {nonConformeSupplierCars} fornecedores
          </p>
        </div>

        <div className="rounded-xl border border-amber-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <GlobeAltIcon className="h-5 w-5 text-amber-500" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-text-secondary">
              EUDR Alertas
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600">{eudrAlertProperties}</p>
          <p className="text-[10px] text-neutral-text-secondary">
            propriedades com alerta
          </p>
        </div>
      </div>

      {/* Properties overview */}
      <CollapsibleSection title="Visão Geral das Propriedades" defaultOpen={true}>
        {properties.length === 0 ? (
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 text-center">
            <p className="text-sm text-neutral-text-secondary">Nenhuma propriedade cadastrada.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                      Propriedade / CAR
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary sm:table-cell">
                      Estado
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary sm:table-cell">
                      Cidade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                      ESG
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                      EUDR
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary md:table-cell">
                      Apontamentos
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary lg:table-cell">
                      Última Verificação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p, idx) => {
                    const latestReport = p.esgReports[0]
                    const hasRecentChange = recentChangePropertyIds.has(p.id)
                    return (
                      <tr
                        key={p.id}
                        className={`${idx % 2 === 1 ? 'bg-gray-50/50' : ''} ${hasRecentChange ? 'ring-1 ring-inset ring-amber-300 bg-amber-50/30' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/properties/${p.id}`}
                                className="text-sm font-medium hover:underline"
                                style={{ color: 'var(--color-brand-primary)' }}
                              >
                                {p.name ?? '—'}
                              </Link>
                              <p className="break-all text-xs leading-4 text-neutral-text-secondary">
                                {p.carCode}
                              </p>
                            </div>
                            {hasRecentChange && (
                              <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                                <BellAlertIcon className="h-3 w-3" />
                                Alterado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-neutral-text-primary sm:table-cell">
                          {p.uf ?? '—'}
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-neutral-text-primary sm:table-cell">
                          {p.municipio ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <ConformeBadge status={p.esgStatus} variant="status" />
                        </td>
                        <td className="px-4 py-3">
                          <ConformeBadge status={p.eudrStatus} variant="status" />
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-neutral-text-primary md:table-cell">
                          {latestReport?.totalApontamentos ?? 0}
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-neutral-text-secondary lg:table-cell">
                          {p.lastCheckAt ? formatDateTime(p.lastCheckAt) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* Supplier properties overview */}
      {suppliers.length > 0 && (
        <CollapsibleSection title="Propriedades dos Fornecedores" defaultOpen={false}>
          <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                      Fornecedor / CAR
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary sm:table-cell">
                      Estado
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary sm:table-cell">
                      Cidade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                      ESG
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                      EUDR
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary md:table-cell">
                      Apontamentos
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary lg:table-cell">
                      Última Verificação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.flatMap((s, sIdx) =>
                    s.cars.map((car, cIdx) => {
                      const rowIdx = suppliers.slice(0, sIdx).reduce((a, x) => a + x.cars.length, 0) + cIdx
                      const uf = car.carCode.length >= 2 ? car.carCode.slice(0, 2) : '—'
                      return (
                        <tr key={car.id} className={rowIdx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                          <td className="px-4 py-3">
                            <Link
                              href={`/suppliers/${s.id}`}
                              className="text-sm font-medium hover:underline"
                              style={{ color: 'var(--color-brand-primary)' }}
                            >
                              {s.name}
                            </Link>
                            <p className="break-all text-xs leading-4 text-neutral-text-secondary">
                              {car.carCode}
                            </p>
                          </td>
                          <td className="hidden px-4 py-3 text-sm text-neutral-text-primary sm:table-cell">
                            {uf}
                          </td>
                          <td className="hidden px-4 py-3 text-sm text-neutral-text-primary sm:table-cell">
                            —
                          </td>
                          <td className="px-4 py-3">
                            <ConformeBadge status={car.esgStatus} variant="status" />
                          </td>
                          <td className="px-4 py-3">
                            <ConformeBadge status={car.eudrStatus} variant="status" />
                          </td>
                          <td className="hidden px-4 py-3 text-sm text-neutral-text-primary md:table-cell">
                            —
                          </td>
                          <td className="hidden px-4 py-3 text-sm text-neutral-text-secondary lg:table-cell">
                            {car.lastCheckAt ? formatDateTime(car.lastCheckAt) : '—'}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* System alerts */}
      <CollapsibleSection title={`Alertas (${unreadCount} pendentes)`} defaultOpen={unreadCount > 0}>
        <div className="space-y-4">
          <AlertsFilter currentSeverity={severity} currentRead={read} />
          <AlertsList alerts={alerts as AlertWithProperty[]} />
        </div>
      </CollapsibleSection>
    </div>
  )
}
