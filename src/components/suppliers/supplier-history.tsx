import { ConformeBadge } from '@/components/shared/conforme-badge'
import { formatDateTime, formatCpfCnpj } from '@/lib/utils'

interface SupplierCheck {
  id: string
  supplierCpfCnpj: string | null
  supplierName: string | null
  supplierCar: string | null
  esgStatus: string | null
  eudrStatus: string | null
  checkedAt: Date
}

interface SupplierHistoryProps {
  checks: SupplierCheck[]
}

function getIdentifier(check: SupplierCheck): string {
  if (check.supplierCpfCnpj) {
    return formatCpfCnpj(check.supplierCpfCnpj)
  }
  return check.supplierCar ?? '—'
}

function getTypeLabel(check: SupplierCheck): string {
  return check.supplierCpfCnpj ? 'CPF/CNPJ' : 'CAR'
}

export function SupplierHistory({ checks }: SupplierHistoryProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-border bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0B1B32]">
              <th className="px-4 py-3 text-left text-sm font-medium text-white">
                Data
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white">
                Fornecedor
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white">
                Identificador
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white">
                Status ESG
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white">
                Status EUDR
              </th>
            </tr>
          </thead>
          <tbody>
            {checks.map((check) => (
              <tr
                key={check.id}
                className="border-t border-neutral-border"
              >
                <td className="px-4 py-3 text-sm text-neutral-text-primary">
                  {formatDateTime(check.checkedAt)}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-text-primary">
                  {check.supplierName ?? '—'}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-text-primary">
                  {getTypeLabel(check)}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-text-primary">
                  {getIdentifier(check)}
                </td>
                <td className="px-4 py-3">
                  <ConformeBadge status={check.esgStatus} variant="status" />
                </td>
                <td className="px-4 py-3">
                  {check.eudrStatus != null ? (
                    <ConformeBadge
                      status={check.eudrStatus}
                      variant="status"
                    />
                  ) : (
                    <span className="text-sm text-neutral-text-secondary">
                      —
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
