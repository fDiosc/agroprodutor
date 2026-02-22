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
  XMarkIcon,
  ChevronDownIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { label: 'Minhas Propriedades', href: '/properties', icon: MapPinIcon },
  { label: 'Fornecedores', href: '/suppliers', icon: UserGroupIcon },
  { label: 'Monitoramento', href: '/monitoring', icon: EyeIcon },
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

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  reportsEnabled?: boolean
}

export function MobileDrawer({ isOpen, onClose, reportsEnabled = false }: MobileDrawerProps) {
  const pathname = usePathname()
  const [reportsOpen, setReportsOpen] = useState(pathname.startsWith('/reports'))

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[#0B1B32] shadow-2xl">
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3">
            <Image src="/logo.png" alt="MERX" width={32} height={32} />
            <span className="text-lg font-semibold text-white">AgroProdutor</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors active:bg-white/10"
            aria-label="Fechar menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.filter((item) => !('children' in item) || reportsEnabled).map((item) => {
              if ('children' in item) {
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => setReportsOpen(!reportsOpen)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-white transition-colors active:bg-white/10',
                        pathname.startsWith('/reports') && 'bg-[#163A5F]'
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      <ChevronDownIcon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-transform',
                          reportsOpen && 'rotate-180'
                        )}
                      />
                    </button>
                    <ul
                      className={cn(
                        'overflow-hidden transition-all duration-200',
                        reportsOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                      )}
                    >
                      {item.children.map((child) => (
                        <li key={child.href} className="pl-4">
                          <Link
                            href={child.href}
                            onClick={onClose}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/90 transition-colors active:bg-white/10',
                              isActive(child.href) && 'bg-[#163A5F] text-white'
                            )}
                          >
                            <child.icon className="h-4 w-4 shrink-0" />
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              }
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-white transition-colors active:bg-white/10',
                      isActive(item.href) && 'bg-[#163A5F]'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-white/10 px-4 py-3">
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
        </div>
      </div>
    </>
  )
}
