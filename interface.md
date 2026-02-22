# Interface — AgroProdutor

Documentação de referência do design system e componentes de interface do AgroProdutor.

## Design Tokens

```css
:root {
  /* Brand */
  --color-brand-primary: #00C287;
  --color-brand-gradient-start: #00C287;
  --color-brand-gradient-end: #008CFF;
  --color-brand-navy: #0B1B32;
  --color-brand-navy-light: #163A5F;

  /* Neutral */
  --color-neutral-background: #FFFFFF;
  --color-neutral-surface: #FFFFFF;
  --color-neutral-border: #E5E7EB;
  --color-neutral-text-primary: #111827;
  --color-neutral-text-secondary: #6B7280;

  /* Status */
  --color-status-success-text: #065F46;
  --color-status-success-bg: #D1FAE5;
  --color-status-warning-text: #92400E;
  --color-status-warning-bg: #FEF3C7;
  --color-status-error-text: #991B1B;
  --color-status-error-bg: #FEE2E2;

  /* Typography */
  --font-family-base: 'Inter', system-ui, -apple-system, sans-serif;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
```

## Navegação

### Sidebar (Desktop)

| Ordem | Item | Ícone | Rota |
|-------|------|-------|------|
| 1 | Dashboard | HomeIcon | `/dashboard` |
| 2 | Minhas Propriedades | MapPinIcon | `/properties` |
| 3 | Fornecedores | UserGroupIcon | `/suppliers` |
| 4 | Monitoramento | EyeIcon | `/monitoring` |
| 5 | Meteorologia | CloudIcon | `/meteorologia` |
| 6 | Relatórios (feature flag) | DocumentTextIcon | submenu |
| 6.1 | → ESG Completo | ChartBarIcon | `/reports/esg` |
| 6.2 | → EUDR | GlobeAmericasIcon | `/reports/eudr` |
| 6.3 | → Relatório Produtor | IdentificationIcon | `/reports/producer` |
| 7 | Configurações | Cog6ToothIcon | `/settings` |

### Mobile

- **Bottom Nav**: Dashboard, Propriedades, Fornecedores, Clima, Monitoramento
- **Hamburger Drawer**: Menu lateral com todos os itens e subitens (incluindo Relatórios se habilitado)

## Componentes

### PropertyCard

Card de propriedade própria com:
- Barra de acento colorida no topo (verde/vermelho/cinza conforme status)
- Nome da propriedade + Município/UF
- Área em hectares
- Código CAR completo (sem truncamento, `break-all`)
- Status ESG com ícone ShieldCheckIcon
- Status EUDR com ícone GlobeAmericasIcon
- Contador de apontamentos
- Data da última verificação
- Slot `weatherSlot` para componente WeatherMini
- Hover: sombra elevada + "Ver detalhes →"

### WeatherMini

Componente compacto de clima para dentro do card:
- Ícone de condição do tempo (emoji)
- "Previsão hoje" label em azul
- Temperatura máxima/mínima em °C
- Condição do tempo (ex: "Céu limpo", "Chuva leve")
- Badge de chuva acumulada em 3 dias (se > 0)

### PropertiesOverviewMap

Mapa interativo para o Dashboard:
- Polígonos GeoJSON de todas as propriedades
- Cor por status ESG: verde (conforme), vermelho (não conforme), cinza (pendente)
- Tooltip no hover com nome + status
- Clique redireciona para detalhe (`/properties/[id]`)
- Auto-zoom (`FitAllBounds`) para abranger todas as propriedades
- Legenda de cores abaixo do mapa

### MeteorologiaClient

Página completa de meteorologia:
- Dropdown seletor de propriedade
- Previsão 14 dias em cards verticais (ícone, data, temp, chuva, umidade, vento)
- 4 cards de resumo: chuva acumulada, janela de pulverização, dias secos, ET₀ média
- Tabela detalhada com todas as variáveis diárias
- Cálculo de janela de pulverização (umidade < 85%, vento < 15 km/h)

### FeatureFlagsSection

Painel de feature flags (somente super admin):
- Borda amber para destaque visual
- Toggle switch para `reportsEnabled`
- Chamada PATCH para `/api/settings/features`

### SupplierCard

Card resumo de fornecedor:
- Avatar com UserIcon
- Nome do fornecedor + CPF/CNPJ formatado
- Badge de status ESG
- Contagem de propriedades (CARs)
- Contagem de alertas ou badge "Tudo OK"
- Data da última verificação
- Link para página de detalhe

### SupplierPropertyCard

Card de propriedade do fornecedor:
- Barra de acento colorida (mesmo padrão de PropertyCard)
- Código CAR completo (sem truncamento, `break-all`)
- Status ESG e EUDR com badges
- Data da última verificação
- Ações: ver relatório (EyeIcon → `/reports/car?car=...`), remover (TrashIcon)

### ConformeBadge

Badge de conformidade reutilizável:
- **Conforme**: Fundo verde, texto verde escuro
- **Não Conforme**: Fundo vermelho, texto vermelho escuro
- **Pendente**: Fundo cinza, texto cinza (quando status é `null`)
- Variantes: `badge` (padrão), `status` (compacto)

### SeverityBadge

Badge de prioridade de alerta:
- **Informativo** (INFO): Fundo azul, texto azul
- **Atenção** (WARNING): Fundo amarelo, texto amarelo escuro
- **Urgente** (CRITICAL): Fundo vermelho, texto vermelho escuro

### CollapsibleSection

Seção colapsável (accordion):
- Título com ícone de seta (ChevronDownIcon)
- Conteúdo expansível/recolhível com animação
- Props: `title`, `defaultOpen`, `children`

### InfoTooltip

Tooltip educativo:
- Ícone InformationCircleIcon
- Popover com texto explicativo ao clicar/hover
- Usado nas camadas ESG para explicar apontamentos

## Tabelas

Padrão para tabelas de monitoramento (Visão Geral):

| Coluna | Responsividade | Descrição |
|--------|---------------|-----------|
| Nome / CAR | Sempre visível | Nome como link + CAR completo abaixo |
| Estado | `hidden sm:table-cell` | UF do imóvel |
| Cidade | `hidden sm:table-cell` | Município |
| ESG | Sempre visível | ConformeBadge |
| EUDR | Sempre visível | ConformeBadge |
| Apontamentos | `hidden md:table-cell` | Contador numérico |
| Última Verificação | `hidden lg:table-cell` | Data formatada |

Estilo:
- Header com `bg-gray-50`, texto `uppercase tracking-wider`
- Linhas alternadas com `bg-gray-50/50`
- Links em `var(--color-brand-primary)` com `hover:underline`

## Filtros de Alertas

### Prioridade (antigo "Severidade")
- Todos, Informativo, Atenção, Urgente

### Situação (antigo "Status")
- Todos, Pendentes, Resolvidos

Estilo: Botões `rounded-full` com estados ativo (navy) e inativo (borda cinza).

## Release Notes (In-App)

Modal "O que mudou?" exibido automaticamente quando a versão muda:
- **Trigger**: Compara versão atual com `localStorage` (`agroprodutor_last_seen_version`)
- **Header**: Badge "NOVIDADES" navy + versão + título "O que mudou?"
- **Tabs de Versão**: Botões `rounded-full` com scroll horizontal e setas
- **Cards de Funcionalidade**: Grid 2 colunas com ícone colorido, título uppercase bold e descrição
- **Footer**: Versão + data + botão "Entendi!" navy
- **Dismiss**: Salva versão no `localStorage` e fecha

Componente: `src/components/ui/release-notes.tsx`
Dados: Array `RELEASES` com versões, datas e features (ícone, cor, título, descrição)
Versão atual: `0.0.3`

## Formulários de Autenticação

### Registro
- Campos obrigatórios com asterisco vermelho (`*`): Nome, Email, Senha, Confirmar Senha
- Campos opcionais sem asterisco: CPF/CNPJ, Telefone
- Botão olhinho (EyeIcon/EyeSlashIcon) nos campos de senha

### Login
- Botão olhinho no campo de senha

## Mapa

- **Basemap**: Esri World Imagery (satélite)
- **Polígono CAR**: Borda branca tracejada (dashArray: "8, 4"), sem preenchimento
- **Polígonos de busca**: Borda verde, preenchimento verde 15%
- **Camadas de cultura**: Soja (verde), Milho (amarelo), toggle individual
- **Camadas IBGE**: Estados e municípios via WMS
- **Busca por endereço**: Input com geocodificação Nominatim
- **Dimensões**: 250px (mobile), 450px (desktop)
- **Mapa Overview (Dashboard)**: Polígonos GeoJSON coloridos por status ESG, tooltip, auto-zoom, legenda
