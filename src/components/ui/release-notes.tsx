'use client'

import { useState, useEffect, useRef } from 'react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import {
  ShieldCheckIcon,
  GlobeAltIcon,
  BellAlertIcon,
  UserGroupIcon,
  MapPinIcon,
  EyeIcon,
  DocumentTextIcon,
  LockClosedIcon,
  CloudIcon,
  HomeIcon,
  KeyIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface ReleaseFeature {
  icon: React.ElementType
  iconColor: string
  title: string
  description: string
}

interface ReleaseVersion {
  version: string
  date: string
  features: ReleaseFeature[]
}

const RELEASES: ReleaseVersion[] = [
  {
    version: '0.0.3',
    date: '22 de Fevereiro, 2026',
    features: [
      {
        icon: HomeIcon,
        iconColor: 'text-blue-500',
        title: 'Dashboard Redesenhado',
        description:
          'Nova tela inicial com mapa interativo mostrando os polígonos de todas as suas propriedades coloridos por status ESG.',
      },
      {
        icon: CloudIcon,
        iconColor: 'text-cyan-500',
        title: 'Meteorologia',
        description:
          'Previsão do tempo de 14 dias para cada propriedade com temperatura, chuva, janela de pulverização e evapotranspiração.',
      },
      {
        icon: MapPinIcon,
        iconColor: 'text-green-500',
        title: 'Clima no Card da Propriedade',
        description:
          'Cada card de propriedade agora mostra a previsão de hoje com temperatura, condição do tempo e chuva esperada.',
      },
      {
        icon: DocumentTextIcon,
        iconColor: 'text-amber-500',
        title: 'Landing Page',
        description:
          'Nova página inicial pública com apresentação do produto, funcionalidades e botões para registro e login.',
      },
      {
        icon: KeyIcon,
        iconColor: 'text-rose-500',
        title: 'Feature Flags e Super Admin',
        description:
          'Controle de funcionalidades por workspace. Apenas super admins podem habilitar ou desabilitar módulos como Relatórios.',
      },
      {
        icon: GlobeAltIcon,
        iconColor: 'text-purple-500',
        title: 'EUDR Desativado por Padrão',
        description:
          'O módulo EUDR agora vem desativado por padrão para evitar confusão. Pode ser ativado no Modo Avançado.',
      },
    ],
  },
  {
    version: '0.0.2',
    date: '22 de Fevereiro, 2026',
    features: [
      {
        icon: UserGroupIcon,
        iconColor: 'text-blue-500',
        title: 'Gestão de Fornecedores',
        description:
          'Cadastre fornecedores e suas propriedades. Página de detalhe com cards visuais, verificação completa e histórico.',
      },
      {
        icon: EyeIcon,
        iconColor: 'text-emerald-500',
        title: 'Monitoramento Centralizado',
        description:
          'Painel com visão geral de conformidade, tabelas de propriedades próprias e de fornecedores, e alertas integrados.',
      },
      {
        icon: BellAlertIcon,
        iconColor: 'text-amber-500',
        title: 'Alertas de Mudança de Status',
        description:
          'Ao atualizar um relatório, o sistema detecta mudanças de ESG/EUDR e cria alertas automáticos visíveis no sino.',
      },
      {
        icon: GlobeAltIcon,
        iconColor: 'text-purple-500',
        title: 'Relatório ESG por CAR',
        description:
          'Consulte ESG e EUDR de qualquer código CAR sem necessidade de cadastro prévio.',
      },
      {
        icon: ShieldCheckIcon,
        iconColor: 'text-green-500',
        title: 'Cards de Propriedade Redesenhados',
        description:
          'Barra de status colorida, indicadores ESG/EUDR com ícones, código CAR completo e badges contextuais.',
      },
      {
        icon: LockClosedIcon,
        iconColor: 'text-rose-500',
        title: 'Senha com Visibilidade',
        description:
          'Botão de olhinho nos campos de senha para visualizar o que está sendo digitado ao criar conta ou fazer login.',
      },
    ],
  },
  {
    version: '0.0.1',
    date: '20 de Fevereiro, 2026',
    features: [
      {
        icon: MapPinIcon,
        iconColor: 'text-green-500',
        title: 'Cadastro de Propriedades',
        description:
          'Cadastre propriedades via código CAR ou buscando no mapa interativo com satélite e camadas IBGE.',
      },
      {
        icon: ShieldCheckIcon,
        iconColor: 'text-blue-500',
        title: 'Relatório Socioambiental',
        description:
          'Relatório ESG completo com 15+ camadas ambientais, apontamentos do produtor, mapa, EUDR e produtividade.',
      },
      {
        icon: GlobeAltIcon,
        iconColor: 'text-purple-500',
        title: 'Análise EUDR',
        description:
          'Conformidade com a regulamentação europeia anti-desmatamento com camadas PRODES por bioma.',
      },
      {
        icon: DocumentTextIcon,
        iconColor: 'text-amber-500',
        title: 'Exportação PDF',
        description:
          'Gere um PDF completo do relatório socioambiental com todos os apontamentos e dados da propriedade.',
      },
    ],
  },
]

const CURRENT_VERSION = RELEASES[0].version
const STORAGE_KEY = 'agroprodutor_last_seen_version'

export function ReleaseNotes() {
  const [open, setOpen] = useState(false)
  const [activeVersion, setActiveVersion] = useState(CURRENT_VERSION)
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY)
    if (lastSeen !== CURRENT_VERSION) {
      setOpen(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION)
    setOpen(false)
  }

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: direction === 'left' ? -120 : 120, behavior: 'smooth' })
    }
  }

  const activeRelease = RELEASES.find((r) => r.version === activeVersion) ?? RELEASES[0]

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[var(--color-brand-navy)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Novidades
            </span>
            <span className="text-sm font-medium text-neutral-text-secondary">
              V {activeRelease.version}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-[#0B1B32]">O que mudou?</h2>

          <button
            type="button"
            onClick={handleDismiss}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-text-secondary transition-colors hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Version tabs */}
        <div className="relative mt-4 px-6">
          <button
            type="button"
            onClick={() => scrollTabs('left')}
            className="absolute -left-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md"
          >
            <ChevronLeftIcon className="h-4 w-4 text-neutral-text-secondary" />
          </button>
          <div
            ref={tabsRef}
            className="scrollbar-hide flex gap-2 overflow-x-auto px-4"
          >
            {RELEASES.map((r) => (
              <button
                key={r.version}
                type="button"
                onClick={() => setActiveVersion(r.version)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                  activeVersion === r.version
                    ? 'bg-[var(--color-brand-navy)] text-white'
                    : 'bg-gray-100 text-neutral-text-secondary hover:bg-gray-200'
                )}
              >
                V {r.version}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollTabs('right')}
            className="absolute -right-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md"
          >
            <ChevronRightIcon className="h-4 w-4 text-neutral-text-secondary" />
          </button>

          <div className="mt-3 h-px bg-gray-200" />
          <div
            className="absolute bottom-0 left-6 h-0.5 rounded-full bg-[var(--color-brand-navy)] transition-all duration-300"
            style={{
              width: `${100 / RELEASES.length}%`,
              transform: `translateX(${RELEASES.findIndex((r) => r.version === activeVersion) * 100}%)`,
            }}
          />
        </div>

        {/* Features grid */}
        <div className="max-h-[400px] overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {activeRelease.features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-gray-50"
                >
                  <Icon className={cn('h-7 w-7', feature.iconColor)} />
                  <h3 className="mt-3 text-sm font-bold uppercase text-[#0B1B32]">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-neutral-text-secondary">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <p className="text-xs text-neutral-text-secondary">
            <span className="mr-1">🚀</span>
            Versão V {activeRelease.version} • {activeRelease.date}
          </p>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg bg-[var(--color-brand-navy)] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-navy-light)]"
          >
            Entendi!
          </button>
        </div>
      </div>
    </div>
  )
}
