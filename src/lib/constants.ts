export const CULTURES = ['SOY', 'CORN'] as const
export type Culture = typeof CULTURES[number]

export const CULTURE_LABELS: Record<Culture, string> = {
  SOY: 'Soja',
  CORN: 'Milho',
}

export const CAR_STATUS_LABELS: Record<string, string> = {
  AT: 'Ativo',
  PE: 'Pendente',
  CA: 'Cancelado',
  SU: 'Suspenso',
}

export const ESG_STATUS = {
  CONFORME: 'CONFORME',
  NAO_CONFORME: 'NAO_CONFORME',
} as const

export const ESG_LAYERS = [
  { key: 'qtd_apontamentos_assentamentos', label: 'INCRA - Assentamentos' },
  { key: 'qtd_apontamentos_embargos_ibama', label: 'IBAMA - Embargos' },
  { key: 'qtd_apontamentos_embargos_sema', label: 'SEMA-MT - Embargos' },
  { key: 'qtd_apontamentos_embargos_sema_pa', label: 'SEMAS-PA - Embargos' },
  { key: 'qtd_apontamentos_embargos_icmbio', label: 'ICMBio - Embargos' },
  { key: 'qtd_apontamentos_prodes', label: 'INPE - PRODES - Amazônia' },
  { key: 'qtd_apontamentos_prodes_cerrado', label: 'INPE - PRODES - Cerrado' },
  { key: 'qtd_apontamentos_prodes_caatinga', label: 'INPE - PRODES - Caatinga' },
  { key: 'qtd_apontamentos_prodes_mata_atlantica', label: 'INPE - PRODES - Mata Atlântica' },
  { key: 'qtd_apontamentos_prodes_pantanal', label: 'INPE - PRODES - Pantanal' },
  { key: 'qtd_apontamentos_prodes_pampa', label: 'INPE - PRODES - Pampa' },
  { key: 'qtd_apontamentos_terras_indigenas', label: 'FUNAI - Terras Indígenas' },
  { key: 'qtd_apontamentos_territorios_quilombolas', label: 'Territórios Quilombolas' },
  { key: 'qtd_apontamentos_unidades_conservacao', label: 'ICMBio - Unidades de Conservação' },
  { key: 'qtd_moratoria_soja', label: 'Moratória da Soja' },
] as const

export const ESG_LAYER_TOOLTIPS: Record<string, string> = {
  qtd_apontamentos_assentamentos: 'Sobreposição com áreas de assentamentos cadastrados no INCRA. Indica possível conflito fundiário.',
  qtd_apontamentos_embargos_ibama: 'Embargos aplicados pelo IBAMA por infrações ambientais como desmatamento ilegal.',
  qtd_apontamentos_embargos_sema: 'Embargos da Secretaria de Meio Ambiente do Mato Grosso por descumprimento da legislação ambiental estadual.',
  qtd_apontamentos_embargos_sema_pa: 'Embargos da Secretaria de Meio Ambiente do Pará.',
  qtd_apontamentos_embargos_icmbio: 'Embargos do Instituto Chico Mendes de Conservação da Biodiversidade por sobreposição com unidades de conservação.',
  qtd_apontamentos_prodes: 'Desmatamento detectado pelo sistema PRODES/INPE na Amazônia Legal.',
  qtd_apontamentos_prodes_cerrado: 'Desmatamento detectado pelo sistema PRODES/INPE no bioma Cerrado.',
  qtd_apontamentos_prodes_caatinga: 'Desmatamento detectado pelo sistema PRODES/INPE no bioma Caatinga.',
  qtd_apontamentos_prodes_mata_atlantica: 'Desmatamento detectado pelo sistema PRODES/INPE na Mata Atlântica.',
  qtd_apontamentos_prodes_pantanal: 'Desmatamento detectado pelo sistema PRODES/INPE no Pantanal.',
  qtd_apontamentos_prodes_pampa: 'Desmatamento detectado pelo sistema PRODES/INPE no bioma Pampa.',
  qtd_apontamentos_terras_indigenas: 'Sobreposição com Terras Indígenas demarcadas pela FUNAI.',
  qtd_apontamentos_territorios_quilombolas: 'Sobreposição com Territórios Quilombolas reconhecidos.',
  qtd_apontamentos_unidades_conservacao: 'Sobreposição com Unidades de Conservação federais geridas pelo ICMBio.',
  qtd_moratoria_soja: 'Produção de soja em áreas desmatadas após 2008 no bioma Amazônia, conforme o compromisso da Moratória da Soja.',
}

export const PRODUCER_ESG_LAYERS = [
  { key: 'qtd_apontamentos_ibama_tabular', label: 'Embargos do IBAMA' },
  { key: 'qtd_apontamentos_sema_mt', label: 'Embargos do SEMA-MT' },
  { key: 'qtd_apontamentos_moratoria_soja', label: 'Moratória da Soja' },
  { key: 'qtd_apontamentos_sema_pa', label: 'Embargos do SEMAS-PA' },
  { key: 'qtd_apontamentos_icmbio_produtor', label: 'Embargos do ICMBio' },
  { key: 'qtd_apontamentos_lista_suja', label: 'Lista Suja' },
] as const

export const PRODUCER_ESG_TOOLTIPS: Record<string, string> = {
  qtd_apontamentos_ibama_tabular: 'Embargos aplicados pelo IBAMA vinculados ao CPF/CNPJ do produtor.',
  qtd_apontamentos_sema_mt: 'Embargos da SEMA-MT vinculados ao produtor.',
  qtd_apontamentos_moratoria_soja: 'Infrações vinculadas ao produtor na Moratória da Soja.',
  qtd_apontamentos_sema_pa: 'Embargos da SEMAS-PA vinculados ao produtor.',
  qtd_apontamentos_icmbio_produtor: 'Embargos do ICMBio vinculados ao CPF/CNPJ do produtor.',
  qtd_apontamentos_lista_suja: 'Inclusão do produtor na Lista Suja do Trabalho Escravo (MTE).',
}

export const SIDEBAR_ITEMS = [
  { label: 'Minhas Propriedades', path: '/properties', icon: 'MapPinIcon' as const },
  { label: 'Fornecedores', path: '/suppliers', icon: 'UserGroupIcon' as const },
  { label: 'Monitoramento', path: '/monitoring', icon: 'EyeIcon' as const },
  {
    label: 'Relatórios',
    icon: 'DocumentTextIcon' as const,
    hasSubmenu: true,
    children: [
      { label: 'ESG Completo', path: '/reports/esg', icon: 'ShieldCheckIcon' as const },
      { label: 'EUDR', path: '/reports/eudr', icon: 'GlobeAltIcon' as const },
      { label: 'Relatório Produtor', path: '/reports/producer', icon: 'UserIcon' as const },
    ],
  },
  { label: 'Configurações', path: '/settings', icon: 'Cog6ToothIcon' as const },
] as const

export const MOBILE_NAV_ITEMS = [
  { label: 'Propriedades', path: '/properties', icon: 'MapPinIcon' as const },
  { label: 'Fornecedores', path: '/suppliers', icon: 'UserGroupIcon' as const },
  { label: 'Monitoramento', path: '/monitoring', icon: 'EyeIcon' as const },
  { label: 'Configurações', path: '/settings', icon: 'Cog6ToothIcon' as const },
] as const
