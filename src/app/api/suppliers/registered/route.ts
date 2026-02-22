import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/api-helpers'
import { merxApi } from '@/lib/merx-api'

const createSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpfCnpj: z.string().min(1, 'CPF/CNPJ é obrigatório'),
})

export async function GET() {
  const { workspaceId, error } = await getAuthSession()
  if (error) return error
  if (!workspaceId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const suppliers = await prisma.supplier.findMany({
    where: { workspaceId },
    include: {
      cars: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(suppliers)
}

export async function POST(request: Request) {
  const { userId, workspaceId, error } = await getAuthSession()
  if (error) return error
  if (!userId || !workspaceId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const data = createSchema.parse(body)
    const cleaned = data.cpfCnpj.replace(/\D/g, '')

    const existing = await prisma.supplier.findUnique({
      where: { workspaceId_cpfCnpj: { workspaceId, cpfCnpj: cleaned } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Fornecedor já cadastrado com este CPF/CNPJ' }, { status: 409 })
    }

    let esgStatus: string | null = null
    try {
      const report = await merxApi.getProducerEsgReport(cleaned)
      esgStatus = report.esg_status
    } catch {
      /* non-critical */
    }

    const supplier = await prisma.supplier.create({
      data: {
        workspaceId,
        userId,
        name: data.name,
        cpfCnpj: cleaned,
        esgStatus,
        lastCheckAt: esgStatus ? new Date() : null,
      },
      include: { cars: true },
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.issues }, { status: 400 })
    }
    console.error('Create supplier error:', err)
    return NextResponse.json({ error: 'Erro ao cadastrar fornecedor' }, { status: 500 })
  }
}
