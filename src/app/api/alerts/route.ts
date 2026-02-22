import { NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/api-helpers'

const patchBodySchema = z.object({
  alertIds: z.array(z.string().uuid()).min(1, 'Pelo menos um ID de alerta é necessário'),
})

export async function GET() {
  const { workspaceId, error } = await getAuthSession()
  if (error) return error

  const alerts = await prisma.alert.findMany({
    where: {
      property: {
        workspaceId,
      },
    },
    include: {
      property: {
        select: { name: true, carCode: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const result = alerts.map((a) => ({
    ...a,
    propertyName: a.property.name ?? a.property.carCode,
  }))

  return NextResponse.json(result)
}

export async function PATCH(request: Request) {
  const { workspaceId, error } = await getAuthSession()
  if (error) return error

  try {
    const body = await request.json()
    const data = patchBodySchema.parse(body)

    const updated = await prisma.alert.updateMany({
      where: {
        id: { in: data.alertIds },
        property: { workspaceId },
      },
      data: { read: true },
    })

    return NextResponse.json({ updated: updated.count })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.issues },
        { status: 400 }
      )
    }
    console.error('Mark alerts read error:', err)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
