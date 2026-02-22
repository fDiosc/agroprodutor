import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatCpfCnpj, formatDateTime } from '@/lib/utils'
import { ConformeBadge } from '@/components/shared/conforme-badge'
import { SupplierPropertyCard } from '@/components/suppliers/supplier-property-card'
import { SupplierActions } from '@/components/suppliers/supplier-actions'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { SupplierMonitoring } from '@/components/suppliers/supplier-monitoring'
import {
  ArrowLeftIcon,
  PlusIcon,
  UserIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'

interface MonitoringEvent {
  supplierName: string
  cpfCnpj: string
  carCode: string | null
  previousStatus: string | null
  currentStatus: string | null
  field: 'ESG' | 'EUDR'
  checkedAt: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SupplierDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')

  const workspaceId = session.user.activeWorkspaceId
  if (!workspaceId) redirect('/login')

  const supplier = await prisma.supplier.findFirst({
    where: { id, workspaceId },
    include: {
      cars: { orderBy: { createdAt: 'asc' } },
      checks: { orderBy: { checkedAt: 'desc' }, take: 50 },
    },
  })

  if (!supplier) notFound()

  const isConforme = supplier.esgStatus === 'CONFORME'
  const isPending = !supplier.esgStatus

  const monitoringEvents: MonitoringEvent[] = []
  const checks = supplier.checks

  for (let i = 0; i < checks.length - 1; i++) {
    const current = checks[i]
    const previous = checks[i + 1]
    if (current.esgStatus !== previous.esgStatus) {
      monitoringEvents.push({
        supplierName: supplier.name,
        cpfCnpj: supplier.cpfCnpj,
        carCode: null,
        previousStatus: previous.esgStatus,
        currentStatus: current.esgStatus,
        field: 'ESG',
        checkedAt: current.checkedAt.toISOString(),
      })
    }
  }

  for (const car of supplier.cars) {
    const carChecks = checks.filter((c) => c.supplierCar === car.carCode)
    for (let i = 0; i < carChecks.length - 1; i++) {
      const current = carChecks[i]
      const previous = carChecks[i + 1]
      if (current.esgStatus !== previous.esgStatus) {
        monitoringEvents.push({
          supplierName: supplier.name,
          cpfCnpj: supplier.cpfCnpj,
          carCode: car.carCode,
          previousStatus: previous.esgStatus,
          currentStatus: current.esgStatus,
          field: 'ESG',
          checkedAt: current.checkedAt.toISOString(),
        })
      }
    }
  }

  monitoringEvents.sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime())

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/suppliers"
        className="inline-flex items-center gap-2 text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Voltar para Fornecedores
      </Link>

      {/* Supplier header */}
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="bg-[#0B1B32] px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{supplier.name}</h1>
                <Link
                  href={`/reports/producer?cpf=${encodeURIComponent(supplier.cpfCnpj)}`}
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {formatCpfCnpj(supplier.cpfCnpj)} — Ver relatório ESG
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ConformeBadge status={supplier.esgStatus} variant="status" />
              <SupplierActions supplierId={id} />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-px border-t border-[#E5E7EB] bg-[#E5E7EB] sm:grid-cols-4">
          <div className="bg-white px-4 py-3 text-center">
            <p className="text-lg font-bold text-[#0B1B32]">{supplier.cars.length}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-text-secondary">
              Propriedades
            </p>
          </div>
          <div className="bg-white px-4 py-3 text-center">
            <p className="text-lg font-bold text-[#0B1B32]">
              {supplier.cars.filter((c) => c.esgStatus !== 'CONFORME' && c.esgStatus).length}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-text-secondary">
              Não Conformes
            </p>
          </div>
          <div className="bg-white px-4 py-3 text-center">
            <p className="text-lg font-bold text-[#0B1B32]">
              {supplier.cars.filter((c) => c.eudrStatus && c.eudrStatus !== 'CONFORME').length}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-text-secondary">
              EUDR Alertas
            </p>
          </div>
          <div className="bg-white px-4 py-3 text-center">
            <p className="text-lg font-bold text-[#0B1B32]">
              {supplier.lastCheckAt
                ? new Date(supplier.lastCheckAt).toLocaleDateString('pt-BR')
                : '—'}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-text-secondary">
              Última Verificação
            </p>
          </div>
        </div>
      </div>

      {/* Properties section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-text-primary">
            Propriedades do Fornecedor
          </h2>
          <Link
            href={`/suppliers/${id}/cars/new`}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--color-brand-primary)' }}
          >
            <PlusIcon className="h-4 w-4" />
            Adicionar Propriedade
          </Link>
        </div>

        {supplier.cars.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <PlusIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-neutral-text-primary">
              Nenhuma propriedade vinculada
            </h3>
            <p className="mt-1 text-sm text-neutral-text-secondary">
              Adicione as propriedades (CARs) deste fornecedor para monitorar sua conformidade.
            </p>
            <Link
              href={`/suppliers/${id}/cars/new`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brand-primary)' }}
            >
              <PlusIcon className="h-4 w-4" />
              Adicionar Propriedade
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {supplier.cars.map((car) => (
              <SupplierPropertyCard
                key={car.id}
                supplierId={id}
                carId={car.id}
                carCode={car.carCode}
                esgStatus={car.esgStatus}
                eudrStatus={car.eudrStatus}
                lastCheckAt={car.lastCheckAt?.toISOString() ?? null}
              />
            ))}
          </div>
        )}
      </div>

      {/* Monitoring */}
      <CollapsibleSection title="Monitoramento de Status" defaultOpen={monitoringEvents.length > 0}>
        <SupplierMonitoring events={monitoringEvents} />
      </CollapsibleSection>

      {/* Check history */}
      {checks.length > 0 && (
        <CollapsibleSection title="Histórico de Verificações" defaultOpen={false}>
          <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">Identificador</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">ESG</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">EUDR</th>
                  </tr>
                </thead>
                <tbody>
                  {checks.slice(0, 10).map((check, idx) => (
                    <tr key={check.id} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                      <td className="px-4 py-3 text-sm text-neutral-text-primary">
                        {formatDateTime(check.checkedAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-text-secondary">
                        {check.supplierCar
                          ? (check.supplierCar.length > 25 ? `...${check.supplierCar.slice(-20)}` : check.supplierCar)
                          : formatCpfCnpj(check.supplierCpfCnpj ?? '')}
                      </td>
                      <td className="px-4 py-3">
                        <ConformeBadge status={check.esgStatus} variant="status" />
                      </td>
                      <td className="px-4 py-3">
                        {check.eudrStatus ? (
                          <ConformeBadge status={check.eudrStatus} variant="status" />
                        ) : (
                          <span className="text-xs text-neutral-text-secondary">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CollapsibleSection>
      )}
    </div>
  )
}
