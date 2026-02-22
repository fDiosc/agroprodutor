import { formatCpfCnpj } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DadosProdutorProps {
  name: string | null
  cpfCnpj: string | null
  className?: string
}

export function DadosProdutor({ name, cpfCnpj, className }: DadosProdutorProps) {
  const formattedCpfCnpj = cpfCnpj ? formatCpfCnpj(cpfCnpj) : '—'

  return (
    <div className={cn('space-y-3', className)}>
      <h2 className="text-lg font-semibold text-neutral-text-primary">
        Dados fornecedor
      </h2>
      <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0B1B32]">
              <th className="px-4 py-3 text-left text-sm font-medium text-white">
                Nome/Razão Social
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white">
                CPF/CNPJ
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[#E5E7EB]">
              <td className="px-4 py-3 text-sm text-neutral-text-primary">
                {name ?? '—'}
              </td>
              <td className="px-4 py-3 text-sm text-neutral-text-primary">
                {formattedCpfCnpj}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
