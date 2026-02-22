import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheckIcon,
  GlobeAmericasIcon,
  ChartBarIcon,
  BellAlertIcon,
  DocumentChartBarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Conformidade ESG',
    description: 'Análise automática de 15+ camadas socioambientais com classificação de risco para cada propriedade.',
  },
  {
    icon: GlobeAmericasIcon,
    title: 'Análise EUDR',
    description: 'Verificação de desmatamento via PRODES por bioma, atendendo à regulamentação europeia de due diligence.',
  },
  {
    icon: BellAlertIcon,
    title: 'Monitoramento Contínuo',
    description: 'Alertas automáticos quando o status de uma propriedade muda, diretamente na sua tela.',
  },
  {
    icon: UserGroupIcon,
    title: 'Gestão de Fornecedores',
    description: 'Cadastre e monitore a cadeia de fornecimento com verificação ESG e EUDR por CPF/CNPJ.',
  },
  {
    icon: DocumentChartBarIcon,
    title: 'Relatórios Completos',
    description: 'Relatórios ESG por CAR ou por produtor, com exportação em PDF pronta para compartilhar.',
  },
  {
    icon: ChartBarIcon,
    title: 'Visão Consolidada',
    description: 'Dashboard com semáforo de conformidade, apontamentos e status de todas as suas propriedades.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="AgroProdutor" width={36} height={36} />
            <span className="text-lg font-bold" style={{ color: 'var(--color-brand-navy)' }}>
              AgroProdutor
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brand-primary)' }}
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-brand-navy) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium"
              style={{ borderColor: 'var(--color-brand-primary)', color: 'var(--color-brand-primary)' }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--color-brand-primary)' }} />
              Plataforma de conformidade para o produtor rural
            </div>
            <h1
              className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              Sua propriedade em{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, var(--color-brand-gradient-start), var(--color-brand-gradient-end))' }}
              >
                conformidade
              </span>
            </h1>
            <p
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl"
              style={{ color: 'var(--color-neutral-text-secondary)' }}
            >
              Monitore o status socioambiental das suas propriedades rurais com análise ESG, EUDR e
              alertas automáticos. Tudo em um só lugar, de forma simples.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="w-full rounded-xl px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90 sm:w-auto"
                style={{ backgroundColor: 'var(--color-brand-primary)' }}
              >
                Começar gratuitamente
              </Link>
              <Link
                href="/login"
                className="w-full rounded-xl border px-8 py-3.5 text-base font-semibold transition-colors hover:bg-gray-50 sm:w-auto"
                style={{ borderColor: 'var(--color-neutral-border)', color: 'var(--color-brand-navy)' }}
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-neutral-border bg-gray-50/50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              Tudo que você precisa para monitorar suas áreas
            </h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--color-neutral-text-secondary)' }}>
              Ferramentas pensadas para o dia a dia do produtor rural.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-neutral-border bg-white p-6 shadow-card transition-shadow hover:shadow-hover"
              >
                <div
                  className="mb-4 inline-flex rounded-xl p-3"
                  style={{ backgroundColor: 'rgba(0, 194, 135, 0.1)' }}
                >
                  <feature.icon className="h-6 w-6" style={{ color: 'var(--color-brand-primary)' }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-brand-navy)' }}>
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-neutral-text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div
            className="relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16"
            style={{ background: 'linear-gradient(135deg, var(--color-brand-navy), var(--color-brand-navy-light))' }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Comece a monitorar suas propriedades hoje
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
                Crie sua conta gratuita e tenha acesso imediato aos relatórios ESG e EUDR das suas áreas rurais.
              </p>
              <div className="mt-8">
                <Link
                  href="/register"
                  className="inline-block rounded-xl px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-brand-primary)' }}
                >
                  Criar conta gratuita
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="AgroProdutor" width={24} height={24} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-neutral-text-secondary)' }}>
              AgroProdutor v0.0.3
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-neutral-text-secondary)' }}>
            Powered by Merx
          </p>
        </div>
      </footer>
    </div>
  )
}
