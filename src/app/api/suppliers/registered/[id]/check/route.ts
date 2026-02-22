import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/api-helpers'
import { merxApi } from '@/lib/merx-api'

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const { userId, workspaceId, error } = await getAuthSession()
  if (error) return error
  if (!userId || !workspaceId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supplier = await prisma.supplier.findFirst({
    where: { id, workspaceId },
    include: { cars: true },
  })
  if (!supplier) {
    return NextResponse.json({ error: 'Fornecedor não encontrado' }, { status: 404 })
  }

  // Find a property in this workspace to attach alerts to (use first one, or skip)
  const alertProperty = await prisma.property.findFirst({
    where: { workspaceId },
    select: { id: true },
  })

  let producerEsgStatus: string | null = supplier.esgStatus
  try {
    const report = await merxApi.getProducerEsgReport(supplier.cpfCnpj)
    producerEsgStatus = report.esg_status
  } catch {
    /* keep old status */
  }

  const alertsToCreate: Array<{
    propertyId: string
    type: 'STATUS_CHANGE' | 'EUDR_CHANGE'
    severity: 'INFO' | 'WARNING' | 'CRITICAL'
    message: string
  }> = []

  await Promise.allSettled(
    supplier.cars.map(async (car) => {
      const [esgResult, eudrResult] = await Promise.allSettled([
        merxApi.getPropertyEsgReport(car.carCode),
        merxApi.getEudrReportResumed(car.carCode),
      ])

      const newEsgStatus = esgResult.status === 'fulfilled' ? esgResult.value.esg_status : car.esgStatus
      const newEudrStatus = eudrResult.status === 'fulfilled'
        ? (eudrResult.value.eu?.property_data_eu?.eu_status ?? eudrResult.value.eu_status_summary ?? car.eudrStatus)
        : car.eudrStatus

      if (alertProperty && car.esgStatus && newEsgStatus && car.esgStatus !== newEsgStatus) {
        const improved = newEsgStatus === 'CONFORME'
        alertsToCreate.push({
          propertyId: alertProperty.id,
          type: 'STATUS_CHANGE',
          severity: improved ? 'INFO' : 'CRITICAL',
          message: `Fornecedor ${supplier.name} (${car.carCode.slice(0, 20)}...): ESG mudou de ${car.esgStatus === 'CONFORME' ? 'Conforme' : 'Não Conforme'} para ${newEsgStatus === 'CONFORME' ? 'Conforme' : 'Não Conforme'}`,
        })
      }

      if (alertProperty && car.eudrStatus && newEudrStatus && car.eudrStatus !== newEudrStatus) {
        const improved = newEudrStatus === 'CONFORME'
        alertsToCreate.push({
          propertyId: alertProperty.id,
          type: 'EUDR_CHANGE',
          severity: improved ? 'INFO' : 'WARNING',
          message: `Fornecedor ${supplier.name} (${car.carCode.slice(0, 20)}...): EUDR mudou de ${car.eudrStatus === 'CONFORME' ? 'Conforme' : 'Não Conforme'} para ${newEudrStatus === 'CONFORME' ? 'Conforme' : 'Não Conforme'}`,
        })
      }

      await prisma.supplierCar.update({
        where: { id: car.id },
        data: { esgStatus: newEsgStatus, eudrStatus: newEudrStatus, lastCheckAt: new Date() },
      })
    })
  )

  await prisma.supplier.update({
    where: { id },
    data: { esgStatus: producerEsgStatus, lastCheckAt: new Date() },
  })

  await prisma.supplierCheck.create({
    data: {
      userId,
      workspaceId,
      supplierId: id,
      supplierCpfCnpj: supplier.cpfCnpj,
      supplierName: supplier.name,
      esgStatus: producerEsgStatus,
    },
  })

  if (alertsToCreate.length > 0) {
    await prisma.$transaction(
      alertsToCreate.map((a) => prisma.alert.create({ data: a }))
    )
  }

  const updated = await prisma.supplier.findFirst({
    where: { id },
    include: { cars: true },
  })

  return NextResponse.json(updated)
}
