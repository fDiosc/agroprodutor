import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z, ZodError } from 'zod'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  cpfCnpj: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(data.password, 12)
    const slug =
      data.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          cpfCnpj: data.cpfCnpj || null,
          phone: data.phone || null,
          passwordHash,
        },
      })

      const workspace = await tx.workspace.create({
        data: {
          name: `Workspace de ${data.name}`,
          slug: `${slug}-${newUser.id.substring(0, 8)}`,
          type: 'FREE',
        },
      })

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: newUser.id,
          role: 'OWNER',
        },
      })

      await tx.reportConfig.create({
        data: {
          userId: newUser.id,
        },
      })

      return newUser
    })

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
