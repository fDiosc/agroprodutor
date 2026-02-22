'use client'

import React, { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    })

    setIsLoading(false)

    if (result?.error) {
      setError('Email ou senha inválidos. Tente novamente.')
      return
    }

    if (result?.ok) {
      window.location.href = callbackUrl
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-semibold" style={{ color: 'var(--color-neutral-text-primary)' }}>
        Entrar
      </h1>
      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
          style={{ borderColor: 'var(--color-neutral-border)', color: 'var(--color-neutral-text-primary)' }}
          placeholder="seu@email.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Senha
        </label>
        <div className="relative mt-1">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full rounded-lg border px-3 py-2 pr-10 shadow-sm focus:outline-none focus:ring-1"
            style={{ borderColor: 'var(--color-neutral-border)', color: 'var(--color-neutral-text-primary)' }}
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
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: 'var(--color-brand-primary)' }}
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>
      <p className="text-center text-sm" style={{ color: 'var(--color-neutral-text-secondary)' }}>
        Não tem uma conta?{' '}
        <Link href="/register" className="font-medium hover:underline" style={{ color: 'var(--color-brand-primary)' }}>
          Criar conta
        </Link>
      </p>
    </form>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="space-y-4 animate-pulse"><div className="h-8 bg-gray-200 rounded w-24" /><div className="h-10 bg-gray-200 rounded" /><div className="h-10 bg-gray-200 rounded" /><div className="h-10 bg-gray-200 rounded" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
