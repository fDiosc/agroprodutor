'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { PRODUCER_ESG_LAYERS, PRODUCER_ESG_TOOLTIPS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/ui/info-tooltip'

interface ProducerData {
  cpf_cnpj: string
  esg_status: string
  [key: string]: unknown
}

export default function ProducerReportPage() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 w-48 rounded bg-gray-200" /><div className="h-24 rounded bg-gray-200" /></div>}>
      <ProducerReportContent />
    </Suspense>
  )
}

function ProducerReportContent() {
  const searchParams = useSearchParams()
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ProducerData | null>(null)

  const doSearch = useCallback(async (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (!cleaned) {
      setError('Informe o CPF ou CNPJ')
      return
    }
    setError(null)
    setData(null)
    setLoading(true)

    try {
      const res = await fetch('/api/producer-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpfCnpj: cleaned }),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error ?? 'Erro ao buscar relatório')
        return
      }
      setData(result)
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const cpfParam = searchParams.get('cpf')
    if (cpfParam) {
      setCpfCnpj(cpfParam)
      doSearch(cpfParam)
    }
  }, [searchParams, doSearch])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    doSearch(cpfCnpj)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-text-primary">
        Relatório do Produtor
      </h1>
      <p className="text-neutral-text-secondary">
        Consulte a situação socioambiental de um produtor pelo CPF ou CNPJ.
      </p>

      <form onSubmit={handleSearch} className="rounded-lg border border-neutral-border bg-white p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value)}
            placeholder="CPF ou CNPJ"
            disabled={loading}
            className="flex-1 rounded-lg border border-neutral-border px-3 py-2 text-sm focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-brand-primary)' }}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-[var(--color-status-error-text)]">{error}</p>
        )}
      </form>

      {data && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-text-primary">
              CPF/CNPJ: {data.cpf_cnpj}
            </span>
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                data.esg_status === 'CONFORME'
                  ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
                  : 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]'
              )}
            >
              {data.esg_status === 'CONFORME' ? 'Conforme' : 'Não Conforme'}
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
            <div className="bg-[#0B1B32] px-4 py-3">
              <span className="font-medium text-white">Apontamentos do Produtor</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">Camada</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">Apontamentos</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-text-primary">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {PRODUCER_ESG_LAYERS.map((layer, idx) => {
                    const count = (data[layer.key] as number) ?? 0
                    const tooltip = PRODUCER_ESG_TOOLTIPS[layer.key]
                    return (
                      <tr key={layer.key} className={cn('border-b border-[#E5E7EB]', idx % 2 === 1 && 'bg-gray-50/50')}>
                        <td className="px-4 py-3 text-sm text-neutral-text-primary">
                          <span className="inline-flex items-center gap-1.5">
                            {layer.label}
                            {tooltip && <InfoTooltip text={tooltip} />}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-text-primary">{count}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                            count > 0
                              ? 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]'
                              : 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
                          )}>
                            {count > 0 ? 'Sim' : 'Sem apontamento'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
