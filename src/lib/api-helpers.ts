import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function getAuthSession() {
  const session = await auth()
  if (!session?.user?.id || !session?.user?.activeWorkspaceId) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  return {
    session,
    userId: session.user.id,
    workspaceId: session.user.activeWorkspaceId,
    error: null,
  }
}

export async function getPropertyForWorkspace(
  propertyId: string,
  workspaceId: string
) {
  return prisma.property.findFirst({
    where: { id: propertyId, workspaceId },
  })
}
