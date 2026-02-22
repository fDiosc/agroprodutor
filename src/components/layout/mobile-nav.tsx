'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  EyeIcon,
  MapPinIcon,
  UserGroupIcon,
  CloudIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'
import {
  EyeIcon as EyeIconSolid,
  MapPinIcon as MapPinIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  CloudIcon as CloudIconSolid,
  HomeIcon as HomeIconSolid,
} from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Início', href: '/dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
  { label: 'Propriedades', href: '/properties', icon: MapPinIcon, iconSolid: MapPinIconSolid },
  { label: 'Fornecedores', href: '/suppliers', icon: UserGroupIcon, iconSolid: UserGroupIconSolid },
  { label: 'Monitoramento', href: '/monitoring', icon: EyeIcon, iconSolid: EyeIconSolid },
  { label: 'Clima', href: '/meteorologia', icon: CloudIcon, iconSolid: CloudIconSolid },
] as const

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      data-testid="mobile-nav"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-border bg-white md:hidden"
    >
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const href = tab.href as string
          const isActive =
            href === pathname ||
            (href.length > 1 && pathname.startsWith(href))
          const Icon = isActive ? tab.iconSolid : tab.icon

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 transition-colors',
                isActive ? 'text-[#00C287]' : 'text-neutral-text-secondary'
              )}
            >
              <Icon className="h-5 w-5" style={{ width: 20, height: 20 }} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
