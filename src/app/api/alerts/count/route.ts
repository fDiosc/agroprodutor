import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/api-helpers'

export async function GET() {
  const { workspaceId, error } = await getAuthSession()
  if (error) return error

  const count = await prisma.alert.count({
    where: { property: { workspaceId }, read: false },
  })

  return NextResponse.json({ count })
}
