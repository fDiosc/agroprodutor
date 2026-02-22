import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { merxApi } from '@/lib/merx-api'

export async function POST(request: Request) {
  const token = await getToken({ req: request as any })
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { cpfCnpj } = body

    if (!cpfCnpj || typeof cpfCnpj !== 'string') {
      return NextResponse.json({ error: 'cpfCnpj is required' }, { status: 400 })
    }

    const report = await merxApi.getProducerEsgReport(cpfCnpj)
    return NextResponse.json(report)
  } catch (err: any) {
    console.error('Producer report error:', err.message)
    return NextResponse.json(
      { error: err.message || 'Failed to fetch producer report' },
      { status: err.statusCode || 500 }
    )
  }
}
