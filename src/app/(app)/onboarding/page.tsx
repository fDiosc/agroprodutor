'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  UserIcon,
  MapPinIcon,
  DocumentChartBarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

type Step = 1 | 2 | 3

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState<Step>(1)
  const [carCode, setCarCode] = useState('')
  const [propertyName, setPropertyName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null)

  const steps = [
    { number: 1, label: 'Dados Pessoais', icon: UserIcon },
    { number: 2, label: 'Primeira Propriedade', icon: MapPinIcon },
    { number: 3, label: 'Primeiro Relatório', icon: DocumentChartBarIcon },
  ]

  async function handleAddProperty() {
    if (!carCode.trim()) {
      setError('Informe o código CAR')
      return
    }
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carCode: carCode.trim(),
          name: propertyName.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erro ao cadastrar propriedade')
        return
      }
      setCreatedPropertyId(data.id)
      setStep(3)
    } catch {
      setError('Erro ao cadastrar propriedade')
    } finally {
      setIsLoading(false)
    }
  }

  function handleFinish() {
    if (createdPropertyId) {
      router.push(`/properties/${createdPropertyId}`)
    } else {
      router.push('/dashboard')
    }
  }

  function handleSkip() {
    router.push('/dashboard')
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-text-primary">
          Bem-vindo ao AgroProdutor
        </h1>
        <p className="mt-2 text-neutral-text-secondary">
          Vamos configurar sua conta em poucos passos
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        {steps.map((s, idx) => {
          const Icon = s.icon
          const isActive = step === s.number
          const isDone = step > s.number

          return (
            <div key={s.number} className="flex items-center">
              <div
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive && 'bg-[var(--color-brand-primary)] text-white',
                  isDone && 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]',
                  !isActive && !isDone && 'bg-gray-100 text-neutral-text-secondary'
                )}
              >
                {isDone ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={cn('mx-2 h-0.5 w-8', step > s.number ? 'bg-[var(--color-brand-primary)]' : 'bg-gray-200')} />
              )}
            </div>
          )
        })}
      </div>

      <div className="rounded-lg border border-neutral-border bg-white p-6 shadow-card">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-neutral-text-primary">
              Seus Dados
            </h2>
            <p className="text-sm text-neutral-text-secondary">
              Verifique seus dados pessoais. Você pode atualizá-los depois nas Configurações.
            </p>
            <div className="space-y-3">
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-xs text-neutral-text-secondary">Nome</p>
                <p className="font-medium text-neutral-text-primary">{session?.user?.name ?? '—'}</p>
              </div>
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-xs text-neutral-text-secondary">Email</p>
                <p className="font-medium text-neutral-text-primary">{session?.user?.email ?? '—'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brand-primary)' }}
            >
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-neutral-text-primary">
              Adicione sua Primeira Propriedade
            </h2>
            <p className="text-sm text-neutral-text-secondary">
              Informe o código CAR da sua propriedade para gerar o primeiro relatório socioambiental.
            </p>
            <div>
              <label htmlFor="onb-car" className="mb-1.5 block text-sm font-medium text-neutral-text-primary">
                Código CAR <span className="text-red-500">*</span>
              </label>
              <input
                id="onb-car"
                type="text"
                value={carCode}
                onChange={(e) => setCarCode(e.target.value)}
                placeholder="Ex: MT-5107925-7515B28AEE9240ACAB464D8DF624D470"
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="onb-name" className="mb-1.5 block text-sm font-medium text-neutral-text-primary">
                Nome da Propriedade
              </label>
              <input
                id="onb-name"
                type="text"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                placeholder="Ex: Fazenda Boa Vista"
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] disabled:opacity-60"
              />
            </div>
            {error && (
              <p className="rounded-lg bg-[var(--color-status-error-bg)] px-3 py-2 text-sm text-[var(--color-status-error-text)]">
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 rounded-lg border border-neutral-border px-4 py-2.5 text-sm font-medium text-neutral-text-primary transition-colors hover:bg-gray-50"
              >
                Pular
              </button>
              <button
                type="button"
                onClick={handleAddProperty}
                disabled={isLoading}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-brand-primary)' }}
              >
                {isLoading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-status-success-bg)]">
              <CheckCircleIcon className="h-8 w-8 text-[var(--color-status-success-text)]" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-text-primary">
              Tudo pronto!
            </h2>
            <p className="text-sm text-neutral-text-secondary">
              Sua propriedade foi cadastrada e o relatório socioambiental está sendo gerado.
              Clique abaixo para ver o resultado.
            </p>
            <button
              type="button"
              onClick={handleFinish}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brand-primary)' }}
            >
              Ver Relatório
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
