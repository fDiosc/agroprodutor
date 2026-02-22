'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CheckIcon } from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'

interface Workspace {
  id: string
  name: string
  slug: string
  type: 'FREE' | 'PARTNER'
  role: string
}

interface WorkspaceSectionProps {
  workspaces: Workspace[]
  activeWorkspaceId: string | undefined
}

export function WorkspaceSection({
  workspaces,
  activeWorkspaceId,
}: WorkspaceSectionProps) {
  const [switching, setSwitching] = useState<string | null>(null)
  const { update } = useSession()
  const router = useRouter()

  const currentWorkspace = workspaces.find((w) => w.id === activeWorkspaceId)
  const effectiveActiveId = activeWorkspaceId ?? workspaces[0]?.id ?? ''

  const handleSwitch = async (workspaceId: string) => {
    if (workspaceId === effectiveActiveId) return
    setSwitching(workspaceId)
    try {
      const res = await fetch('/api/workspace/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'Erro ao trocar workspace')
      }
      await update({ user: { activeWorkspaceId: workspaceId } })
      router.refresh()
    } catch (err) {
      console.error('Workspace switch error:', err)
    } finally {
      setSwitching(null)
    }
  }

  if (workspaces.length === 0) {
    return (
      <section className="rounded-lg border border-neutral-border bg-white shadow-sm">
        <div className="rounded-t-lg bg-[var(--color-brand-navy,#0B1B32)] px-4 py-3">
          <h2 className="text-sm font-semibold text-white">Workspace</h2>
        </div>
        <div className="p-4">
          <p className="text-sm text-neutral-text-secondary">
            Você não pertence a nenhum workspace.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-neutral-border bg-white shadow-sm">
      <div className="rounded-t-lg bg-[var(--color-brand-navy,#0B1B32)] px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Workspace</h2>
      </div>
      <div className="p-4">
        {currentWorkspace && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-text-primary">
              Workspace atual:
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-primary,#00C287)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand-primary,#00C287)]">
              {currentWorkspace.name}
              <span className="rounded bg-white/30 px-1.5 py-0.5 text-[10px]">
                {currentWorkspace.type}
              </span>
            </span>
          </div>
        )}
        <ul className="space-y-2">
          {workspaces.map((workspace) => {
            const isActive = workspace.id === effectiveActiveId
            const isLoading = switching === workspace.id
            return (
              <li key={workspace.id}>
                <button
                  type="button"
                  onClick={() => handleSwitch(workspace.id)}
                  disabled={isActive || isLoading}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
                    isActive
                      ? 'border-[var(--color-brand-primary,#00C287)] bg-[var(--color-brand-primary,#00C287)]/5'
                      : 'border-neutral-border hover:bg-neutral-background',
                    (isActive || isLoading) && 'cursor-default'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {isActive ? (
                      <CheckIcon className="h-5 w-5 text-[var(--color-brand-primary,#00C287)]" />
                    ) : (
                      <span className="w-5" />
                    )}
                    <div>
                      <span className="text-sm font-medium text-neutral-text-primary">
                        {workspace.name}
                      </span>
                      <span className="ml-2 rounded bg-neutral-border/80 px-1.5 py-0.5 text-xs text-neutral-text-secondary">
                        {workspace.type}
                      </span>
                      <span className="ml-1 text-xs text-neutral-text-secondary">
                        • {workspace.role}
                      </span>
                    </div>
                  </div>
                  {isLoading && (
                    <span className="text-xs text-neutral-text-secondary">
                      Troca...
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
