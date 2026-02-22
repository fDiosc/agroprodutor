import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/api-helpers'

type RouteParams = { params: Promise<{ id: string }> }

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const { workspaceId, error } = await getAuthSession()
  if (error) return error
  if (!workspaceId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supplier = await prisma.supplier.findFirst({
    where: { id, workspaceId },
  })

  if (!supplier) {
    return NextResponse.json({ error: 'Fornecedor não encontrado' }, { status: 404 })
  }

  await prisma.supplier.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
