import { NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const patchSettingsSchema = z.object({
  advancedMode: z.boolean().optional(),
  reportConfig: z
    .object({
      esgEnabled: z.boolean().optional(),
      eudrEnabled: z.boolean().optional(),
      productivityEnabled: z.boolean().optional(),
      producerReportEnabled: z.boolean().optional(),
    })
    .optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      reportConfig: true,
      memberships: {
        include: { workspace: true },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  const workspaces = user.memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
    type: m.workspace.type,
    role: m.role,
  }))

  return NextResponse.json({
    user: {
      name: user.name,
      email: user.email,
      cpfCnpj: user.cpfCnpj,
      phone: user.phone,
      advancedMode: user.advancedMode,
    },
    reportConfig: user.reportConfig
      ? {
          esgEnabled: user.reportConfig.esgEnabled,
          eudrEnabled: user.reportConfig.eudrEnabled,
          productivityEnabled: user.reportConfig.productivityEnabled,
          producerReportEnabled: user.reportConfig.producerReportEnabled,
        }
      : null,
    workspaces,
  })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = patchSettingsSchema.parse(body)

    if (typeof data.advancedMode === 'boolean') {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { advancedMode: data.advancedMode },
      })
    }

    if (data.reportConfig) {
      const rc = data.reportConfig
      await prisma.reportConfig.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          esgEnabled: rc.esgEnabled ?? true,
          eudrEnabled: rc.eudrEnabled ?? false,
          productivityEnabled: rc.productivityEnabled ?? true,
          producerReportEnabled: rc.producerReportEnabled ?? true,
        },
        update: {
          ...(typeof rc.esgEnabled === 'boolean' && { esgEnabled: rc.esgEnabled }),
          ...(typeof rc.eudrEnabled === 'boolean' && { eudrEnabled: rc.eudrEnabled }),
          ...(typeof rc.productivityEnabled === 'boolean' && {
            productivityEnabled: rc.productivityEnabled,
          }),
          ...(typeof rc.producerReportEnabled === 'boolean' && {
            producerReportEnabled: rc.producerReportEnabled,
          }),
        },
      })
    }

    const updated = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { reportConfig: true },
    })

    if (!updated) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        name: updated.name,
        email: updated.email,
        cpfCnpj: updated.cpfCnpj,
        phone: updated.phone,
        advancedMode: updated.advancedMode,
      },
      reportConfig: updated.reportConfig
        ? {
            esgEnabled: updated.reportConfig.esgEnabled,
            eudrEnabled: updated.reportConfig.eudrEnabled,
            productivityEnabled: updated.reportConfig.productivityEnabled,
            producerReportEnabled: updated.reportConfig.producerReportEnabled,
          }
        : null,
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.issues },
        { status: 400 }
      )
    }
    console.error('PATCH settings error:', err)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
