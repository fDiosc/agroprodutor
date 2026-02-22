import Link from 'next/link'
import { SupplierCard } from './supplier-card'
import { PlusIcon } from '@heroicons/react/24/outline'

interface SupplierData {
  id: string
  name: string
  cpfCnpj: string
  esgStatus: string | null
  lastCheckAt: string | null
  carCount: number
  totalApontamentos: number
}

interface SupplierListProps {
  suppliers: SupplierData[]
}

export function SupplierList({ suppliers }: SupplierListProps) {
  if (suppliers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <PlusIcon className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-neutral-text-primary">
          Nenhum fornecedor cadastrado
        </h3>
        <p className="mt-1 text-sm text-neutral-text-secondary">
          Cadastre seus fornecedores para monitorar a conformidade de suas propriedades.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {suppliers.map((supplier) => (
        <SupplierCard
          key={supplier.id}
          id={supplier.id}
          name={supplier.name}
          cpfCnpj={supplier.cpfCnpj}
          esgStatus={supplier.esgStatus}
          lastCheckAt={supplier.lastCheckAt}
          carCount={supplier.carCount}
          totalApontamentos={supplier.totalApontamentos}
        />
      ))}
    </div>
  )
}
