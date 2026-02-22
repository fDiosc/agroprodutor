import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SupplierRegisterForm } from '@/components/suppliers/supplier-register-form'
import { SupplierList } from '@/components/suppliers/supplier-list'
import { SupplierCheckForm } from '@/components/suppliers/supplier-check-form'
import { SupplierHistory } from '@/components/suppliers/supplier-history'
import { SupplierMonitoring } from '@/components/suppliers/supplier-monitoring'
import { CollapsibleSection } from '@/components/ui/collapsible-section'

interface MonitoringEvent {
  supplierName: string
  cpfCnpj: string
  carCode: string | null
  previousStatus: string | null
  currentStatus: string | null
  field: 'ESG' | 'EUDR'
  checkedAt: string
}

export default async function SuppliersPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const workspaceId = session.user.activeWorkspaceId
  if (!workspaceId) redirect('/login')

  const [suppliers, history] = await Promise.all([
    prisma.supplier.findMany({
      where: { workspaceId },
      include: {
        cars: { orderBy: { createdAt: 'asc' } },
        checks: { orderBy: { checkedAt: 'desc' }, take: 50 },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.supplierCheck.findMany({
      where: { userId: session.user.id },
      orderBy: { checkedAt: 'desc' },
      take: 20,
    }),
  ])

  const monitoringEvents: MonitoringEvent[] = []

  for (const supplier of suppliers) {
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
  }

  monitoringEvents.sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime())

  const supplierListData = suppliers.map((s) => {
    const nonConformeCars = s.cars.filter((c) => c.esgStatus && c.esgStatus !== 'CONFORME').length
    const eudrAlerts = s.cars.filter((c) => c.eudrStatus && c.eudrStatus !== 'CONFORME').length
    return {
      id: s.id,
      name: s.name,
      cpfCnpj: s.cpfCnpj,
      esgStatus: s.esgStatus,
      lastCheckAt: s.lastCheckAt?.toISOString() ?? null,
      carCount: s.cars.length,
      totalApontamentos: nonConformeCars + eudrAlerts,
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-text-primary">
            Fornecedores
          </h1>
          <p className="mt-1 text-neutral-text-secondary">
            Cadastre e monitore a conformidade socioambiental dos seus fornecedores.
          </p>
        </div>
        <SupplierRegisterForm />
      </div>

      <SupplierList suppliers={supplierListData} />

      {monitoringEvents.length > 0 && (
        <CollapsibleSection title="Monitoramento" defaultOpen={true}>
          <SupplierMonitoring events={monitoringEvents} />
        </CollapsibleSection>
      )}

      <CollapsibleSection title="Consulta Avulsa" defaultOpen={false}>
        <div className="space-y-4">
          <p className="text-sm text-neutral-text-secondary">
            Verifique a conformidade de um fornecedor sem cadastrá-lo, por CPF/CNPJ ou código CAR.
          </p>
          <SupplierCheckForm />
        </div>
      </CollapsibleSection>

      {history.length > 0 && (
        <CollapsibleSection title="Histórico de Consultas" defaultOpen={false}>
          <SupplierHistory checks={history} />
        </CollapsibleSection>
      )}
    </div>
  )
}
