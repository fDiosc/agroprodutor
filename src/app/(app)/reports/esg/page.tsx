import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ConformeBadge } from '@/components/shared/conforme-badge'
import { ApontamentoCounter } from '@/components/shared/apontamento-counter'
import { formatDateTime } from '@/lib/utils'

export default async function ESGReportPage() {
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
      <h1 className="text-2xl font-bold text-neutral-text-primary">
        Relatórios ESG
      </h1>
      <p className="text-neutral-text-secondary">
        Visão geral do status socioambiental de todas as suas propriedades.
      </p>

      {properties.length === 0 ? (
        <div className="rounded-lg border border-neutral-border bg-white p-8 text-center shadow-card">
          <p className="text-neutral-text-secondary">
            Nenhuma propriedade cadastrada. Adicione uma propriedade para gerar
            relatórios ESG.
          </p>
          <Link
            href="/properties/new"
            className="mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
            style={{ backgroundColor: 'var(--color-brand-primary)' }}
          >
            Adicionar Propriedade
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
          <div className="bg-[#0B1B32] px-4 py-3">
            <span className="font-medium text-white">Propriedades</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Propriedade
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">CAR</th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium md:table-cell">
                  Município/UF
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Status ESG
                </th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium sm:table-cell">
                  Apontamentos
                </th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium md:table-cell">
                  Última Consulta
                </th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p, idx) => {
                const latest = p.esgReports[0]
                return (
                  <tr
                    key={p.id}
                    className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}
                  >
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/properties/${p.id}`}
                        className="font-medium hover:underline"
                        style={{ color: 'var(--color-brand-primary)' }}
                      >
                        {p.name ?? p.carCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-text-secondary">
                      {p.carCode.length > 20
                        ? `${p.carCode.slice(0, 20)}...`
                        : p.carCode}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-neutral-text-secondary md:table-cell">
                      {p.municipio ?? '-'}/{p.uf ?? '-'}
                    </td>
                    <td className="px-4 py-3">
                      <ConformeBadge status={p.esgStatus} />
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <ApontamentoCounter
                        count={latest?.totalApontamentos ?? 0}
                      />
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-neutral-text-secondary md:table-cell">
                      {latest ? formatDateTime(latest.checkedAt) : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
