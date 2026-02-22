'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SupplierResult } from './supplier-result'

type CheckType = 'cpf_cnpj' | 'car'

interface CheckResult {
  id: string
  supplierCpfCnpj: string | null
  supplierName: string | null
  supplierCar: string | null
  esgStatus: string | null
  eudrStatus: string | null
  reportData: unknown
  checkedAt: string
}

export function SupplierCheckForm() {
  const router = useRouter()
  const [type, setType] = useState<CheckType>('cpf_cnpj')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CheckResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Informe o CPF/CNPJ ou código CAR.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value: trimmed }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erro ao consultar fornecedor.')
        return
      }

      setResult(data)
      router.refresh()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const placeholder =
    type === 'cpf_cnpj'
      ? 'Digite o CPF ou CNPJ (apenas números)'
      : 'Digite o código CAR'

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-neutral-border bg-white p-4 shadow-card"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-text-primary">
              Tipo de consulta
            </label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="cpf_cnpj"
                  checked={type === 'cpf_cnpj'}
                  onChange={() => setType('cpf_cnpj')}
                  className="h-4 w-4"
                />
                <span className="text-sm text-neutral-text-primary">
                  CPF/CNPJ
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="car"
                  checked={type === 'car'}
                  onChange={() => setType('car')}
                  className="h-4 w-4"
                />
                <span className="text-sm text-neutral-text-primary">
                  Código CAR
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-text-primary">
              Identificador
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              disabled={loading}
              className="w-full rounded-lg border border-neutral-border px-3 py-2 text-sm text-neutral-text-primary placeholder:text-neutral-text-secondary focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] disabled:opacity-60"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--color-status-error-text)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-brand-primary)' }}
          >
            {loading ? 'Consultando...' : 'Consultar'}
          </button>
        </div>
      </form>

      {result && (
        <SupplierResult
          supplierCpfCnpj={result.supplierCpfCnpj}
          supplierName={result.supplierName}
          supplierCar={result.supplierCar}
          esgStatus={result.esgStatus}
          eudrStatus={result.eudrStatus}
          reportData={result.reportData}
          checkedAt={result.checkedAt}
        />
      )}
    </div>
  )
}
