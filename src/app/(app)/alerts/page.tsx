import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AlertsList, type AlertWithProperty } from '@/components/alerts/alerts-list'
import { AlertsFilter } from '@/components/alerts/alerts-filter'
import { AlertSeverity } from '@prisma/client'

const VALID_SEVERITIES: AlertSeverity[] = ['INFO', 'WARNING', 'CRITICAL']

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ severity?: string; read?: string }>
}) {
  const { severity, read } = await searchParams
  const session = await auth()
  if (!session?.user) redirect('/login')
  const workspaceId = session.user.activeWorkspaceId
  if (!workspaceId) redirect('/login')

  const where: {
    property: { workspaceId: string }
    severity?: AlertSeverity
    read?: boolean
  } = {
    property: { workspaceId },
  }
  if (severity && VALID_SEVERITIES.includes(severity as AlertSeverity)) {
    where.severity = severity as AlertSeverity
  }
  if (read === 'true') where.read = true
  if (read === 'false') where.read = false

  const alerts = await prisma.alert.findMany({
    where,
    include: {
      property: { select: { name: true, carCode: true, id: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const unreadCount = await prisma.alert.count({
    where: { property: { workspaceId }, read: false },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-neutral-text-primary">
          Alertas
        </h1>
        <span className="text-sm text-neutral-text-secondary">
          {unreadCount} não lidos
        </span>
      </div>
      <AlertsFilter currentSeverity={severity} currentRead={read} />
      <AlertsList alerts={alerts as AlertWithProperty[]} />
    </div>
  )
}
