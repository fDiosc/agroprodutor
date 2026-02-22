import { NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-helpers'
import { merxApi, MerxApiError } from '@/lib/merx-api'

export async function GET(request: Request) {
  const { error } = await getAuthSession()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const car = searchParams.get('car')

  if (!car) {
    return NextResponse.json({ error: 'Parâmetro car é obrigatório' }, { status: 400 })
  }

  try {
    const [esgReport, eudrReport] = await Promise.allSettled([
      merxApi.getPropertyEsgReport(car),
      merxApi.getEudrReportResumed(car),
    ])

    const esg = esgReport.status === 'fulfilled' ? esgReport.value : null
    const eudr = eudrReport.status === 'fulfilled' ? eudrReport.value : null

    if (!esg) {
      return NextResponse.json({ error: 'Não foi possível obter relatório ESG para este CAR' }, { status: 404 })
    }

    const eudrStatus = eudr?.eu?.property_data_eu?.eu_status ?? eudr?.eu_status_summary ?? null

    return NextResponse.json({
      esg,
      eudrStatus,
      eudr,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar relatório'
    const statusCode = err instanceof MerxApiError ? err.statusCode : 500
    console.error('CAR report error:', message)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
