'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PlusIcon } from '@heroicons/react/24/outline'

export function SupplierRegisterForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !cpfCnpj.trim()) {
      setError('Nome e CPF/CNPJ são obrigatórios')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/suppliers/registered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), cpfCnpj: cpfCnpj.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erro ao cadastrar fornecedor')
        return
      }
      setName('')
      setCpfCnpj('')
      setShowForm(false)
      router.refresh()
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
        style={{ backgroundColor: 'var(--color-brand-primary)' }}
      >
        <PlusIcon className="h-4 w-4" />
        Cadastrar Fornecedor
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-border bg-white p-4 shadow-card">
      <h3 className="mb-3 text-base font-semibold text-neutral-text-primary">Novo Fornecedor</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="supplier-name" className="mb-1 block text-sm font-medium text-neutral-text-primary">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            id="supplier-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do fornecedor"
            disabled={loading}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] disabled:opacity-60"
          />
        </div>
        <div>
          <label htmlFor="supplier-cpf" className="mb-1 block text-sm font-medium text-neutral-text-primary">
            CPF/CNPJ <span className="text-red-500">*</span>
          </label>
          <input
            id="supplier-cpf"
            type="text"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value)}
            placeholder="000.000.000-00 ou 00.000.000/0001-00"
            disabled={loading}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] disabled:opacity-60"
          />
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-[var(--color-status-error-text)]">{error}</p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => { setShowForm(false); setError(null) }}
          className="rounded-lg border border-neutral-border px-4 py-2 text-sm font-medium text-neutral-text-primary hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: 'var(--color-brand-primary)' }}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </div>
    </form>
  )
}
