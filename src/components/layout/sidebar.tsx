'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  EyeIcon,
  MapPinIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  UserIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  HomeIcon,
  CloudIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { label: 'Minhas Propriedades', href: '/properties', icon: MapPinIcon },
  { label: 'Fornecedores', href: '/suppliers', icon: UserGroupIcon },
  { label: 'Monitoramento', href: '/monitoring', icon: EyeIcon },
  { label: 'Meteorologia', href: '/meteorologia', icon: CloudIcon },
  {
    label: 'Relatórios',
    icon: DocumentTextIcon,
    children: [
      { label: 'ESG Completo', href: '/reports/esg', icon: ShieldCheckIcon },
      { label: 'EUDR', href: '/reports/eudr', icon: GlobeAltIcon },
      { label: 'Relatório Produtor', href: '/reports/producer', icon: UserIcon },
    ],
  },
  { label: 'Configurações', href: '/settings', icon: Cog6ToothIcon },
] as const

interface SidebarProps {
  isOpen: boolean
  onToggle?: () => void
  reportsEnabled?: boolean
}

export function Sidebar({ isOpen, onToggle, reportsEnabled = false }: SidebarProps) {
  const pathname = usePathname()
  const [reportsExpanded, setReportsExpanded] = useState(
    pathname.startsWith('/reports')
  )

  const isActive = (href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  const isReportsActive = pathname.startsWith('/reports')

  return (
    <aside
      data-testid="sidebar"
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col bg-[#0B1B32] transition-all duration-300',
        isOpen ? 'w-[280px]' : 'w-[72px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-4">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <Image
            src="/logo.png"
            alt="MERX"
            width={36}
            height={36}
            className="shrink-0"
          />
          {isOpen && (
            <span className="whitespace-nowrap text-lg font-semibold text-white">
              AgroProdutor
            </span>
          )}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-[#0B1B32] text-white shadow-md transition-colors hover:bg-[#163A5F]"
        aria-label={isOpen ? 'Recolher menu' : 'Expandir menu'}
      >
        {isOpen ? (
          <ChevronLeftIcon className="h-4 w-4" />
        ) : (
          <ChevronLeftIcon className="h-4 w-4 rotate-180" />
        )}
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.filter((item) => !('children' in item) || reportsEnabled).map((item) => {
            if ('children' in item) {
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => setReportsExpanded(!reportsExpanded)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white transition-colors',
                      isReportsActive
                        ? 'bg-[#163A5F]'
                        : 'hover:bg-white/10'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {isOpen && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        <ChevronDownIcon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-transform',
                            reportsExpanded && 'rotate-180'
                          )}
                        />
                      </>
                    )}
                  </button>
                  {isOpen && (
                    <ul
                      className={cn(
                        'overflow-hidden transition-all duration-200',
                        reportsExpanded ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                      )}
                    >
                      {item.children.map((child) => (
                        <li key={child.href} className="pl-4">
                          <Link
                            href={child.href}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/90 transition-colors hover:bg-white/10',
                              isActive(child.href) && 'bg-[#163A5F] text-white'
                            )}
                          >
                            <child.icon className="h-4 w-4 shrink-0" />
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            }
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition-colors',
                    isActive(item.href)
                      ? 'bg-[#163A5F]'
                      : 'hover:bg-white/10'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {isOpen && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Version footer */}
      <div className="shrink-0 border-t border-white/10 px-4 py-3">
        {isOpen ? (
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('agroprodutor_last_seen_version')
                window.location.reload()
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10"
            >
              V 0.0.2
              <span className="h-2.5 w-2.5 rounded-full bg-[#00C287]" />
            </button>
            <p className="text-[10px] text-white/40">Powered by Merx</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('agroprodutor_last_seen_version')
              window.location.reload()
            }}
            className="flex w-full justify-center"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#00C287]" />
          </button>
        )}
      </div>
    </aside>
  )
}
