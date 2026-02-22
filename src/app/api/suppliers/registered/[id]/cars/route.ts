import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/api-helpers'
import { merxApi } from '@/lib/merx-api'

type RouteParams = { params: Promise<{ id: string }> }

const addCarSchema = z.object({
  carCode: z.string().min(1, 'Código CAR é obrigatório'),
})

export async function POST(request: Request, { params }: RouteParams) {
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

  try {
    const body = await request.json()
    const data = addCarSchema.parse(body)

    const existingCar = await prisma.supplierCar.findUnique({
      where: { supplierId_carCode: { supplierId: id, carCode: data.carCode } },
    })
    if (existingCar) {
      return NextResponse.json({ error: 'CAR já vinculado a este fornecedor' }, { status: 409 })
    }

    let esgStatus: string | null = null
    let eudrStatus: string | null = null

    try {
      const [esgReport, eudrReport] = await Promise.allSettled([
        merxApi.getPropertyEsgReport(data.carCode),
        merxApi.getEudrReportResumed(data.carCode),
      ])

      if (esgReport.status === 'fulfilled') {
        esgStatus = esgReport.value.esg_status
      }
      if (eudrReport.status === 'fulfilled') {
        eudrStatus = eudrReport.value.eu?.property_data_eu?.eu_status ?? eudrReport.value.eu_status_summary ?? null
      }
    } catch {
      /* non-critical */
    }

    const car = await prisma.supplierCar.create({
      data: {
        supplierId: id,
        carCode: data.carCode,
        esgStatus,
        eudrStatus,
        lastCheckAt: esgStatus ? new Date() : null,
      },
    })

    return NextResponse.json(car, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.issues }, { status: 400 })
    }
    console.error('Add supplier CAR error:', err)
    return NextResponse.json({ error: 'Erro ao vincular CAR' }, { status: 500 })
  }
}
