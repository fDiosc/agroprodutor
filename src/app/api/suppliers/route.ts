import { NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/api-helpers'
import { merxApi } from '@/lib/merx-api'
import { normalizeCarCode, normalizeCpfCnpj } from '@/lib/utils'

const postBodySchema = z.object({
  type: z.enum(['cpf_cnpj', 'car']),
  value: z.string().min(1, 'Valor é obrigatório'),
})

export async function POST(request: Request) {
  const { userId, workspaceId, error } = await getAuthSession()
  if (error) return error
  if (!userId || !workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = postBodySchema.parse(body)

    let supplierCpfCnpj: string | null = null
    let supplierCar: string | null = null
    let supplierName: string | null = null
    let esgStatus: string | null = null
    let eudrStatus: string | null = null
    let reportData: object | null = null

    if (data.type === 'cpf_cnpj') {
      const cleanCpf = normalizeCpfCnpj(data.value)
      const report = await merxApi.getProducerEsgReport(cleanCpf)
      supplierCpfCnpj = report.cpf_cnpj
      esgStatus = report.esg_status
      reportData = report
    } else {
      const normalizedCar = normalizeCarCode(data.value)
      const [esgReport, eudrReport] = await Promise.all([
        merxApi.getPropertyEsgReport(normalizedCar),
        merxApi.getEudrReportResumed(normalizedCar).catch(() => null),
      ])
      supplierCar = esgReport.car_imovel
      esgStatus = esgReport.esg_status
      reportData = esgReport
      if (eudrReport) {
        eudrStatus = eudrReport.eu?.property_data_eu?.eu_status ?? eudrReport.eu_status_summary ?? null
      }
    }

    const check = await prisma.supplierCheck.create({
      data: {
        userId,
        workspaceId,
        supplierCpfCnpj,
        supplierName,
        supplierCar,
        esgStatus,
        eudrStatus,
        reportData: reportData as object,
      },
    })

    return NextResponse.json({
      id: check.id,
      supplierCpfCnpj: check.supplierCpfCnpj,
      supplierName: check.supplierName,
      supplierCar: check.supplierCar,
      esgStatus: check.esgStatus,
      eudrStatus: check.eudrStatus,
      reportData: check.reportData,
      checkedAt: check.checkedAt,
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.issues },
        { status: 400 }
      )
    }
    console.error('Supplier check error:', err)
    return NextResponse.json(
      { error: 'Falha ao consultar fornecedor na Merx API' },
      { status: 502 }
    )
  }
}

export async function GET() {
  const { userId, error } = await getAuthSession()
  if (error) return error
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const checks = await prisma.supplierCheck.findMany({
    where: { userId },
    orderBy: { checkedAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(checks)
}
