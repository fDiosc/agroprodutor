import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const workspaceId = session.user.activeWorkspaceId
  if (!workspaceId) {
    return NextResponse.json({ reportsEnabled: false, superAdmin: false })
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  const settings = (workspace?.settings ?? {}) as Record<string, unknown>

  return NextResponse.json({
    reportsEnabled: settings.reportsEnabled === true,
    superAdmin: session.user.superAdmin ?? false,
  })
}
