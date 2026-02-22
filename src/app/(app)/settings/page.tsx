import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ProfileSection } from '@/components/settings/profile-section'
import { AdvancedModeToggle } from '@/components/settings/advanced-mode-toggle'
import { ReportConfigSection } from '@/components/settings/report-config-section'
import { WorkspaceSection } from '@/components/settings/workspace-section'
import { FeatureFlagsSection } from '@/components/settings/feature-flags-section'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      reportConfig: true,
      memberships: {
        include: { workspace: true },
      },
    },
  })

  if (!user) redirect('/login')

  let reportsEnabled = false
  if (user.superAdmin && session.user.activeWorkspaceId) {
    const ws = await prisma.workspace.findUnique({
      where: { id: session.user.activeWorkspaceId },
      select: { settings: true },
    })
    const settings = (ws?.settings ?? {}) as Record<string, unknown>
    reportsEnabled = settings.reportsEnabled === true
  }

  const workspaces = user.memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
    type: m.workspace.type,
    role: m.role,
  }))

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-neutral-text-primary">
        Configurações
      </h1>
      <ProfileSection
        user={{
          name: user.name,
          email: user.email,
          cpfCnpj: user.cpfCnpj,
          phone: user.phone,
        }}
      />
      <WorkspaceSection
        workspaces={workspaces}
        activeWorkspaceId={session.user.activeWorkspaceId}
      />
      <AdvancedModeToggle initialValue={user.advancedMode} />
      {user.advancedMode && (
        <ReportConfigSection
          config={{
            esgEnabled: user.reportConfig?.esgEnabled ?? true,
            eudrEnabled: user.reportConfig?.eudrEnabled ?? true,
            productivityEnabled: user.reportConfig?.productivityEnabled ?? true,
            producerReportEnabled: user.reportConfig?.producerReportEnabled ?? true,
          }}
        />
      )}
      {user.superAdmin && (
        <FeatureFlagsSection reportsEnabled={reportsEnabled} />
      )}
    </div>
  )
}
