import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const workspaceId = session.user.activeWorkspaceId
  if (!workspaceId) redirect('/dashboard')

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  const settings = (workspace?.settings ?? {}) as Record<string, unknown>

  if (settings.reportsEnabled !== true) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
