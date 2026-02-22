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
| 1 | Minhas Propriedades | MapPinIcon | `/properties` |
| 2 | Fornecedores | UserGroupIcon | `/suppliers` |
| 3 | Monitoramento | EyeIcon | `/monitoring` |
| 4 | Relatórios | DocumentTextIcon | submenu |
| 4.1 | → ESG Completo | ChartBarIcon | `/reports/esg` |
| 4.2 | → EUDR | GlobeAmericasIcon | `/reports/eudr` |
| 4.3 | → Relatório Produtor | IdentificationIcon | `/reports/producer` |
| 5 | Configurações | Cog6ToothIcon | `/settings` |

### Mobile

- **Bottom Nav**: Mesmos 5 itens da sidebar
- **Hamburger Drawer**: Menu lateral com todos os itens e subitens

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
- Hover: sombra elevada + "Ver detalhes →"

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
