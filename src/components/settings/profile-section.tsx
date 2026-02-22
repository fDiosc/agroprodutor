import { formatCpfCnpj } from '@/lib/utils'

interface ProfileSectionProps {
  user: {
    name: string
    email: string
    cpfCnpj: string | null
    phone: string | null
  }
}

export function ProfileSection({ user }: ProfileSectionProps) {
  return (
    <section className="rounded-lg border border-neutral-border bg-white shadow-sm">
      <div className="rounded-t-lg bg-[var(--color-brand-navy,#0B1B32)] px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Perfil</h2>
      </div>
      <div className="space-y-4 p-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-text-secondary">
            Nome
          </label>
          <input
            type="text"
            value={user.name}
            readOnly
            className="w-full rounded-lg border border-neutral-border bg-neutral-background px-3 py-2 text-sm text-neutral-text-primary read-only:cursor-default read-only:opacity-90"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-text-secondary">
            Email
          </label>
          <input
            type="email"
            value={user.email}
            readOnly
            className="w-full rounded-lg border border-neutral-border bg-neutral-background px-3 py-2 text-sm text-neutral-text-primary read-only:cursor-default read-only:opacity-90"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-text-secondary">
            CPF/CNPJ
          </label>
          <input
            type="text"
            value={user.cpfCnpj ? formatCpfCnpj(user.cpfCnpj) : '—'}
            readOnly
            className="w-full rounded-lg border border-neutral-border bg-neutral-background px-3 py-2 text-sm text-neutral-text-primary read-only:cursor-default read-only:opacity-90"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-text-secondary">
            Telefone
          </label>
          <input
            type="tel"
            value={user.phone ?? '—'}
            readOnly
            className="w-full rounded-lg border border-neutral-border bg-neutral-background px-3 py-2 text-sm text-neutral-text-primary read-only:cursor-default read-only:opacity-90"
          />
        </div>
      </div>
    </section>
  )
}
