'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { SessionProvider } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { MobileDrawer } from '@/components/layout/mobile-drawer'
import { TopBar } from '@/components/layout/top-bar'
import { ReleaseNotes } from '@/components/ui/release-notes'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [alertCount, setAlertCount] = useState(0)
  const [reportsEnabled, setReportsEnabled] = useState(false)
  const pathname = usePathname()

  const fetchAlertCount = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts/count')
      if (res.ok) {
        const data = await res.json()
        setAlertCount(data.count ?? 0)
      }
    } catch {
      // silent
    }
  }, [])

  const fetchFeatures = useCallback(async () => {
    try {
      const res = await fetch('/api/features')
      if (res.ok) {
        const data = await res.json()
        setReportsEnabled(data.reportsEnabled === true)
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchAlertCount()
    fetchFeatures()
  }, [pathname, fetchAlertCount, fetchFeatures])

  useEffect(() => {
    const interval = setInterval(fetchAlertCount, 60_000)
    return () => clearInterval(interval)
  }, [fetchAlertCount])

  return (
    <SessionProvider>
    <div className="min-h-screen bg-neutral-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((p) => !p)} reportsEnabled={reportsEnabled} />
      </div>

      {/* Mobile drawer (hamburger menu) */}
      <div className="md:hidden">
        <MobileDrawer
          isOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          reportsEnabled={reportsEnabled}
        />
      </div>

      {/* Main content */}
      <div
        className={cn(
          'min-h-screen transition-all duration-300',
          sidebarOpen ? 'md:pl-[280px]' : 'md:pl-[72px]'
        )}
      >
        <TopBar
          onMenuClick={() => setMobileDrawerOpen((p) => !p)}
          onDesktopMenuClick={() => setSidebarOpen((p) => !p)}
          alertCount={alertCount}
        />

        <main className="mx-auto max-w-7xl px-4 py-6 pb-24 md:px-6 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Release notes modal */}
      <ReleaseNotes />
    </div>
    </SessionProvider>
  )
}
