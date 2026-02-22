'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { ESG_LAYERS, ESG_LAYER_TOOLTIPS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/ui/info-tooltip'

interface EsgData {
  car_imovel?: string
  esg_status?: string
  municipio?: string
  uf?: string
  total_apontamentos?: number
  [key: string]: unknown
}

export default function CarReportPage() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 w-48 rounded bg-gray-200" /><div className="h-24 rounded bg-gray-200" /></div>}>
      <CarReportContent />
    </Suspense>
  )
}

function CarReportContent() {
  const searchParams = useSearchParams()
  const [carCode, setCarCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [esg, setEsg] = useState<EsgData | null>(null)
  const [eudrStatus, setEudrStatus] = useState<string | null>(null)

  const doSearch = useCallback(async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Informe o código CAR')
      return
    }
    setError(null)
    setEsg(null)
    setEudrStatus(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/car-report?car=${encodeURIComponent(trimmed)}`)
      const result = await res.json()
      if (!res.ok) {
        setError(result.error ?? 'Erro ao buscar relatório')
        return
      }
      setEsg(result.esg)
      setEudrStatus(result.eudrStatus)
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const carParam = searchParams.get('car')
    if (carParam) {
      setCarCode(carParam)
      doSearch(carParam)
    }
  }, [searchParams, doSearch])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    doSearch(carCode)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-text-primary">
        Relatório ESG por CAR
      </h1>
      <p className="text-neutral-text-secondary">
        Consulte a situação socioambiental de uma propriedade pelo código CAR.
      </p>

      <form onSubmit={handleSearch} className="rounded-lg border border-neutral-border bg-white p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={carCode}
            onChange={(e) => setCarCode(e.target.value)}
            placeholder="Código CAR"
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

      {esg && (
        <div className="space-y-4">
          {/* Header info */}
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-text-primary">
                CAR: {esg.car_imovel ?? carCode}
              </p>
              {(esg.municipio || esg.uf) && (
                <p className="text-xs text-neutral-text-secondary">
                  {esg.municipio ?? ''}{esg.municipio && esg.uf ? '/' : ''}{esg.uf ?? ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-medium',
                  esg.esg_status === 'CONFORME'
                    ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
                    : 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]'
                )}
              >
                ESG: {esg.esg_status === 'CONFORME' ? 'Conforme' : 'Não Conforme'}
              </span>
              {eudrStatus && (
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-medium',
                    eudrStatus === 'CONFORME'
                      ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
                      : 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]'
                  )}
                >
                  EUDR: {eudrStatus === 'CONFORME' ? 'Conforme' : 'Não Conforme'}
                </span>
              )}
            </div>
          </div>

          {/* ESG Layers */}
          <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
            <div className="bg-[#0B1B32] px-4 py-3">
              <span className="font-medium text-white">Apontamentos da Propriedade</span>
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
                  {ESG_LAYERS.map((layer, idx) => {
                    const count = (esg[layer.key] as number) ?? 0
                    const tooltip = ESG_LAYER_TOOLTIPS[layer.key]
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
