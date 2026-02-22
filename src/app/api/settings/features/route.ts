import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { superAdmin: true },
  })

  if (!user?.superAdmin) {
    return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 })
  }

  const workspaceId = session.user.activeWorkspaceId
  if (!workspaceId) {
    return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 400 })
  }

  const body = await request.json()
  const reportsEnabled = body.reportsEnabled === true

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  })

  const currentSettings = (workspace?.settings ?? {}) as Record<string, unknown>

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: { ...currentSettings, reportsEnabled },
    },
  })

  return NextResponse.json({ reportsEnabled })
}
