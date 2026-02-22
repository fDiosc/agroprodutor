'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Bars3Icon, ChevronDownIcon, BellAlertIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Início',
  '/properties': 'Minhas Propriedades',
  '/reports/esg': 'ESG Completo',
  '/reports/eudr': 'EUDR',
  '/suppliers': 'Fornecedores',
  '/monitoring': 'Monitoramento',
  '/settings': 'Configurações',
}

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (pathname.startsWith('/reports')) return 'Relatórios'
  if (pathname.startsWith('/properties')) return 'Minhas Propriedades'
  return 'AgroProdutor'
}

interface TopBarProps {
  onMenuClick?: () => void
  onDesktopMenuClick?: () => void
  alertCount?: number
}

export function TopBar({ onMenuClick, onDesktopMenuClick, alertCount = 0 }: TopBarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const userName = session?.user?.name ?? 'Usuário'
  const userInitials = userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const pageTitle = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-border bg-white px-4 md:h-16 md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile: hamburger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-text-primary transition-colors active:bg-neutral-border/50 md:hidden"
          aria-label="Abrir menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Mobile: logo centered */}
        <Link href="/dashboard" className="flex items-center md:hidden">
          <Image src="/logo.png" alt="MERX" width={28} height={28} />
          <span className="ml-2 text-base font-semibold text-neutral-text-primary">
            AgroProdutor
          </span>
        </Link>

        {/* Desktop: page title */}
        <h1 className="hidden text-lg font-semibold text-neutral-text-primary md:block">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/monitoring"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-text-secondary transition-colors hover:bg-neutral-border/50"
          aria-label="Monitoramento"
        >
          <BellAlertIcon className="h-5 w-5" />
          {alertCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
              {alertCount > 99 ? '99+' : alertCount}
            </span>
          )}
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-neutral-border/50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-navy,#0B1B32)] text-sm font-medium text-white">
              {userInitials}
            </div>
            <span className="hidden text-sm font-medium text-neutral-text-primary sm:inline">
              {userName}
            </span>
            <ChevronDownIcon
              className={cn(
                'hidden h-4 w-4 text-neutral-text-secondary transition-transform sm:block',
                dropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-neutral-border bg-white py-1 shadow-lg">
              <Link
                href="/settings"
                className="block px-4 py-2 text-sm text-neutral-text-primary hover:bg-neutral-border/50"
                onClick={() => setDropdownOpen(false)}
              >
                Configurações
              </Link>
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                onClick={() => {
                  setDropdownOpen(false)
                  signOut({ callbackUrl: '/login' })
                }}
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
