'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, MapPinIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { DynamicCarSearchMap } from '@/components/maps/dynamic-car-search-map'

type RegistrationMethod = 'car' | 'map'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function AddSupplierCarPage({ params }: PageProps) {
  const { id: supplierId } = use(params)
  const router = useRouter()
  const [method, setMethod] = useState<RegistrationMethod>('car')
  const [carCode, setCarCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!carCode.trim()) {
      setError('Informe o código CAR')
      return
    }
    await addCar(carCode.trim())
  }

  async function addCar(car: string) {
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch(`/api/suppliers/registered/${supplierId}/cars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carCode: car }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erro ao vincular propriedade')
        return
      }

      router.push(`/suppliers/${supplierId}`)
      router.refresh()
    } catch {
      setError('Erro ao vincular propriedade')
    } finally {
      setIsLoading(false)
    }
  }

  function handleMapSelect(selectedCar: string) {
    setCarCode(selectedCar)
    setMethod('car')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/suppliers/${supplierId}`}
        className="inline-flex items-center gap-2 text-sm text-neutral-text-secondary hover:text-neutral-text-primary"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Voltar para Fornecedor
      </Link>

      <h1 className="text-2xl font-bold text-neutral-text-primary">
        Adicionar Propriedade ao Fornecedor
      </h1>
      <p className="text-neutral-text-secondary">
        Vincule uma propriedade (CAR) a este fornecedor para monitorar sua conformidade socioambiental.
      </p>

      {/* Method tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setMethod('car')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
            method === 'car'
              ? 'bg-white text-neutral-text-primary shadow-sm'
              : 'text-neutral-text-secondary hover:text-neutral-text-primary'
          )}
        >
          <DocumentTextIcon className="h-4 w-4" />
          Código CAR
        </button>
        <button
          type="button"
          onClick={() => setMethod('map')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
            method === 'map'
              ? 'bg-white text-neutral-text-primary shadow-sm'
              : 'text-neutral-text-secondary hover:text-neutral-text-primary'
          )}
        >
          <MapPinIcon className="h-4 w-4" />
          Buscar no Mapa
        </button>
      </div>

      {/* Map search */}
      {method === 'map' && (
        <div className="rounded-xl border border-neutral-border bg-white p-6 shadow-sm">
          <DynamicCarSearchMap onSelectCar={handleMapSelect} />
        </div>
      )}

      {/* CAR code form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-neutral-border bg-white p-6 shadow-sm"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="carCode"
              className="mb-1.5 block text-sm font-medium text-neutral-text-primary"
            >
              Código CAR <span className="text-red-500">*</span>
            </label>
            <input
              id="carCode"
              type="text"
              value={carCode}
              onChange={(e) => setCarCode(e.target.value)}
              placeholder="Ex: MT-5107925-7515B28AEE9240ACAB464D8DF624D470"
              required
              className={cn(
                'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm',
                'focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)]'
              )}
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-[var(--color-status-error-bg)] px-3 py-2 text-sm text-[var(--color-status-error-text)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !carCode.trim()}
            className={cn(
              'w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-70',
              'hover:opacity-90'
            )}
            style={{ backgroundColor: 'var(--color-brand-primary)' }}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Vinculando...
              </span>
            ) : (
              'Vincular Propriedade'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
