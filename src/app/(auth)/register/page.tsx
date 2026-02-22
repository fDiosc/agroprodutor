'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpfCnpj: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError(null)
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[e.target.name]
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: 'As senhas não coincidem' })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          cpfCnpj: formData.cpfCnpj || undefined,
          phone: formData.phone || undefined,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.details) {
          const errors: Record<string, string> = {}
          for (const issue of data.details) {
            const path = issue.path?.join('.') || 'form'
            errors[path] = issue.message || 'Campo inválido'
          }
          setFieldErrors(errors)
        }
        setError(data.error || 'Erro ao criar conta')
        setIsLoading(false)
        return
      }

      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: '/dashboard',
      })

      if (signInResult?.error) {
        setError('Conta criada, mas falha ao entrar. Tente fazer login.')
        setIsLoading(false)
        return
      }

      router.push('/onboarding')
      router.refresh()
    } catch {
      setError('Erro ao conectar com o servidor')
      setIsLoading(false)
    }
  }

  const inputClass = 'mt-1 block w-full rounded-lg border border-neutral-border px-3 py-2 text-neutral-text-primary shadow-sm focus:border-[#00C287] focus:outline-none focus:ring-1 focus:ring-[#00C287] aria-[invalid=true]:border-red-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-semibold text-neutral-text-primary">Criar conta</h1>
      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-text-primary">
          Nome <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          aria-invalid={!!fieldErrors.name}
          className={inputClass}
          placeholder="Seu nome completo"
        />
        {fieldErrors.name && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-text-primary">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          aria-invalid={!!fieldErrors.email}
          className={inputClass}
          placeholder="seu@email.com"
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="cpfCnpj" className="block text-sm font-medium text-neutral-text-primary">
          CPF/CNPJ
        </label>
        <input
          id="cpfCnpj"
          name="cpfCnpj"
          type="text"
          value={formData.cpfCnpj}
          onChange={handleChange}
          aria-invalid={!!fieldErrors.cpfCnpj}
          className={inputClass}
          placeholder="000.000.000-00 ou 00.000.000/0001-00"
        />
        {fieldErrors.cpfCnpj && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.cpfCnpj}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-neutral-text-primary">
          Telefone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          className={inputClass}
          placeholder="(00) 00000-0000"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-text-primary">
          Senha <span className="text-red-500">*</span>
        </label>
        <div className="relative mt-1">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required
            aria-invalid={!!fieldErrors.password}
            className="block w-full rounded-lg border border-neutral-border px-3 py-2 pr-10 text-neutral-text-primary shadow-sm focus:border-[#00C287] focus:outline-none focus:ring-1 focus:ring-[#00C287] aria-[invalid=true]:border-red-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-text-secondary hover:text-neutral-text-primary"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-text-primary">
          Confirmar Senha <span className="text-red-500">*</span>
        </label>
        <div className="relative mt-1">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            aria-invalid={!!fieldErrors.confirmPassword}
            className="block w-full rounded-lg border border-neutral-border px-3 py-2 pr-10 text-neutral-text-primary shadow-sm focus:border-[#00C287] focus:outline-none focus:ring-1 focus:ring-[#00C287] aria-[invalid=true]:border-red-500"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-text-secondary hover:text-neutral-text-primary"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: '#00C287' }}
      >
        {isLoading ? 'Criando conta...' : 'Criar Conta'}
      </button>

      <p className="text-center text-sm text-neutral-text-secondary">
        Já tem uma conta?{' '}
        <Link
          href="/login"
          className="font-medium text-[#00C287] hover:underline"
        >
          Entrar
        </Link>
      </p>
    </form>
  )
}
