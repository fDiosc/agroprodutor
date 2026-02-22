import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PropertyCard } from '@/components/dashboard/property-card'
import { PlusIcon } from '@heroicons/react/24/outline'

export default async function PropertiesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const workspaceId = session.user.activeWorkspaceId
  if (!workspaceId) redirect('/login')

  const properties = await prisma.property.findMany({
    where: { workspaceId },
    include: {
      esgReports: { orderBy: { checkedAt: 'desc' }, take: 1 },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-neutral-text-primary">
          Minhas Propriedades
        </h1>
        <Link
          href="/properties/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--color-brand-primary)' }}
        >
          <PlusIcon className="h-5 w-5" />
          Nova Propriedade
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-lg border border-neutral-border bg-white p-8 shadow-card">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-neutral-text-secondary">
              Nenhuma propriedade cadastrada. Adicione sua primeira propriedade
              para começar.
            </p>
            <Link
              href="/properties/new"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brand-primary)' }}
            >
              <PlusIcon className="h-5 w-5" />
              Nova Propriedade
            </Link>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  )
}
