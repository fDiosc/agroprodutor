import { NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const switchWorkspaceSchema = z.object({
  workspaceId: z.string().uuid('ID do workspace inválido'),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { workspaceId } = switchWorkspaceSchema.parse(body)

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.user.id,
        },
      },
      include: { workspace: true },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Você não tem acesso a este workspace' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      workspaceId,
      workspace: {
        id: membership.workspace.id,
        name: membership.workspace.name,
        slug: membership.workspace.slug,
        type: membership.workspace.type,
      },
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.issues },
        { status: 400 }
      )
    }
    console.error('Workspace switch error:', err)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
