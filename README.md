# AgroProdutor

Plataforma digital para produtores rurais gerenciarem a conformidade socioambiental de suas propriedades e fornecedores. Integra relatórios ESG, análise EUDR, dados de produtividade e monitoramento contínuo em uma interface unificada e otimizada para mobile.

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│  Next.js 16 (App Router) + TailwindCSS 4 + Leaflet     │
├─────────────────────────────────────────────────────────┤
│                    API Routes                           │
│  /api/properties  /api/suppliers  /api/car-search       │
│  /api/car-report  /api/producer-report  /api/alerts     │
│  /api/weather  /api/features  /api/settings/features    │
├──────────────┬──────────────┬───────────────────────────┤
├──────────────┬──────────────┬───────────────────────────┤
│  Merx API    │  GeoServer   │  PostgreSQL (Prisma v7)   │
│  ESG/EUDR/   │  WFS         │  Usuários, Propriedades,  │
│  Produtivi-  │  Polígonos   │  Relatórios, Fornecedores │
│  dade/CAR    │  CAR         │  Alertas, Workspaces      │
├──────────────┴──────────────┴───────────────────────────┤
│          Open-Meteo API (Previsão meteorológica)        │
└─────────────────────────────────────────────────────────┘
```

### Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| Linguagem | TypeScript 5.9 |
| Banco de Dados | PostgreSQL 16 + Prisma v7 (adapter-pg) |
| Autenticação | NextAuth.js v5 (Credentials + JWT) |
| UI | TailwindCSS 4, Design System customizado, shadcn-style components |
| Mapas | Leaflet + react-leaflet + Esri World Imagery + IBGE WMS |
| PDF | @react-pdf/renderer |
| Validação | Zod v4 |
| Testes | Vitest (unit) + Playwright (E2E) |
| CI | GitHub Actions (lint, type-check, unit tests) |

### Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/              # Páginas de login e registro
│   │   ├── login/
│   │   └── register/
│   ├── (app)/               # Área autenticada
│   │   ├── dashboard/       # Dashboard com mapa de polígonos e cards com clima
│   │   ├── properties/      # Listagem, cadastro e detalhe de propriedades
│   │   │   ├── [id]/        # Relatório socioambiental completo
│   │   │   └── new/         # Cadastrar via CAR ou mapa
│   │   ├── suppliers/       # Gestão de fornecedores
│   │   │   └── [id]/        # Detalhe do fornecedor + propriedades
│   │   │       └── cars/new/ # Adicionar propriedade ao fornecedor (CAR ou mapa)
│   │   ├── monitoring/      # Monitoramento de conformidade
│   │   ├── meteorologia/    # Previsão meteorológica por propriedade (14 dias)
│   │   ├── reports/
│   │   │   ├── esg/         # Visão geral ESG de todas propriedades
│   │   │   ├── eudr/        # Relatório EUDR por propriedade
│   │   │   ├── car/         # Relatório ESG por código CAR
│   │   │   └── producer/    # Relatório do produtor por CPF/CNPJ
│   │   ├── settings/        # Configurações + Modo Avançado + Feature Flags (super admin)
│   │   └── onboarding/      # Fluxo de onboarding (3 passos)
│   └── api/                 # API Routes
│       ├── auth/            # NextAuth + registro
│       ├── properties/      # CRUD + refresh ESG/EUDR/Produtividade
│       ├── car-search/      # Busca de CARs por coordenada (mapa)
│       ├── car-report/      # Relatório ESG por CAR (read-only)
│       ├── producer-report/ # Relatório ESG do produtor
│       ├── alerts/          # Listagem e marcação de alertas
│       ├── suppliers/       # Consulta avulsa + CRUD de fornecedores registrados
│       ├── weather/         # Proxy Open-Meteo com cache (previsão 14 dias)
│       ├── features/        # Feature flags do workspace ativo
│       ├── settings/        # Configurações + toggle de features (super admin)
│       └── workspace/       # Troca de workspace
├── components/
│   ├── layout/              # Sidebar, TopBar, MobileDrawer, MobileNav
│   ├── dashboard/           # DashboardClient, PropertyCard, WeatherMini, stats
│   ├── reports/             # Seções do relatório socioambiental
│   │   ├── eudr-property-section.tsx  # EUDR integrado no detalhe
│   │   ├── detalhamento-apontamentos.tsx  # Expandível por camada
│   │   ├── evolution-chart.tsx  # Gráfico de evolução
│   │   └── ...
│   ├── maps/                # Mapa Leaflet, busca por clique, mapa de polígonos (overview)
│   ├── meteorologia/        # MeteorologiaClient (previsão 14 dias, tabela detalhada)
│   ├── pdf/                 # Geração de PDF
│   ├── eudr/                # Componentes EUDR
│   ├── alerts/              # Lista, filtros e badges de alertas
│   ├── suppliers/           # Cards, formulários, monitoramento, ações
│   ├── settings/            # Perfil, workspace, configurações
│   ├── ui/                  # CollapsibleSection, InfoTooltip
│   └── shared/              # Badges, skeletons, contadores
├── lib/
│   ├── prisma.ts            # Client singleton (adapter-pg + schema)
│   ├── auth.ts              # Configuração NextAuth
│   ├── merx-api.ts          # Client da API Merx com retry/backoff
│   ├── geoserver.ts         # Client WFS para polígonos
│   ├── api-helpers.ts       # Helpers de autenticação para API routes
│   ├── constants.ts         # Camadas ESG, culturas, tooltips, navegação
│   └── utils.ts             # Formatadores e utilitários
├── styles/
│   └── tokens.ts            # Design tokens (cores, espaçamentos, tipografia)
└── types/
    └── next-auth.d.ts       # Extensão de tipos NextAuth
```

## Funcionalidades

### Dashboard

Tela inicial com visão consolidada:
- **Saudação personalizada** com nome do usuário e dot de status
- **Stats compactos** em row horizontal: propriedades, conformes, alertas ESG, alertas EUDR
- **Mapa de polígonos**: Todas as propriedades renderizadas como polígonos GeoJSON coloridos por status ESG (verde/vermelho/cinza), com tooltip no hover e clique para detalhe
- **Cards de propriedade** com previsão do tempo integrada (temperatura, condição, chuva 3 dias)

### Meteorologia

Previsão meteorológica detalhada por propriedade (`/meteorologia`):
- Seletor de propriedade (dropdown)
- Previsão de 14 dias via Open-Meteo API (gratuita, sem chave)
- **Cards de resumo**: Chuva acumulada, janela de pulverização, dias secos, evapotranspiração média
- **Tabela diária**: Temperatura, chuva, umidade, vento, ET₀ e código de condição
- **Janela de pulverização**: Calculada automaticamente quando umidade < 85% e vento < 15 km/h

### Minhas Propriedades

Cards visuais com indicadores de status:
- Barra de acento colorida (verde = conforme, vermelha = não conforme, cinza = pendente)
- Nome, localização (município/UF), área em hectares
- Código CAR completo sem truncamento
- Status ESG e EUDR com ícones dedicados (ShieldCheck, Globe)
- Contador de apontamentos e data da última verificação
- Previsão do tempo do dia (WeatherMini)
- Hover com elevação e link "Ver detalhes"

Duas formas de cadastrar:
1. **Código CAR**: Digitar o código diretamente no formulário
2. **Buscar no Mapa**: Clicar no mapa para buscar CARs por coordenada, com busca por endereço, polígonos CAR, camadas de estados e municípios (IBGE WMS)

### Gestão de Fornecedores

Sistema completo de cadastro e monitoramento de fornecedores:

- **Lista de Fornecedores**: Cards com nome, CPF/CNPJ, status ESG, quantidade de propriedades e alertas
- **Página de Detalhe** (`/suppliers/[id]`):
  - Header com dados do fornecedor + link para relatório ESG do produtor
  - Barra de estatísticas (propriedades, não conformes, alertas EUDR, última verificação)
  - Grid de propriedades (CARs) com cards visuais incluindo ESG, EUDR e ações
  - Botão "Verificar Tudo" para rechecagem completa
  - Monitoramento de mudanças de status
  - Histórico de verificações
- **Adicionar Propriedade** (`/suppliers/[id]/cars/new`): Mesmo padrão do cadastro de propriedade própria (código CAR ou busca no mapa)
- **Links diretos**: CPF/CNPJ abre relatório do produtor, CAR abre relatório ESG da propriedade

### Monitoramento

Painel centralizado de acompanhamento da conformidade:

- **Resumo visual**: 4 cards com total monitorado, conformes, alertas ESG e alertas EUDR
- **Mudanças de Status**: Timeline de transições com setas visuais (melhora/piora)
- **Visão Geral das Propriedades**: Tabela com nome, CAR completo, estado, cidade, ESG, EUDR, apontamentos e última verificação
- **Propriedades dos Fornecedores**: Mesma estrutura para CARs de fornecedores
- **Alertas**: Filtragem por prioridade (Informativo, Atenção, Urgente) e situação (Pendentes, Resolvidos)

### Relatório Socioambiental (ESG)

Cada propriedade tem um relatório completo com seções colapsáveis:

- **Resumo** com badge de conformidade (Conforme / Não Conforme / Pendente)
- **Dados do fornecedor** (nome, CPF/CNPJ)
- **Apontamentos do produtor**: Embargos IBAMA, SEMA-MT, SEMAS-PA, ICMBio, Lista Suja, Moratória da Soja
- **Dados da propriedade**: Nome, CAR, UF, Município, Área
- **Mapa interativo**: Polígono CAR + camadas de cultura (Soja/Milho) com toggle
- **Declaração do CAR**: Situação, data de atualização, área declarada
- **Apontamentos da propriedade**: 15 camadas ambientais com tooltips educativos
- **EUDR**: Status EU, camadas de análise, PRODES, detalhamento por apontamento
- **Produtividade**: Tabela com Soja e Milho por safra
- **Exportação PDF** com todos os dados
- **Histórico de relatórios** com comparação temporal + gráfico de evolução

### Relatório ESG por CAR

Página dedicada (`/reports/car`) para consultar ESG e EUDR de qualquer código CAR sem necessidade de cadastro. Aceita parâmetro `?car=` para busca automática.

### Relatório do Produtor

Página dedicada (`/reports/producer`) para consulta ESG por CPF/CNPJ. Aceita parâmetro `?cpf=` para busca automática (usado nos links de fornecedores).

### Tooltips Educativos

Cada camada ESG e do produtor possui um ícone de informação que explica o significado do apontamento em linguagem acessível ao produtor rural.

### Análise EUDR

- Status de conformidade com a regulamentação europeia anti-desmatamento
- Camadas de análise com status individual e total de apontamentos
- Camadas PRODES: Amazônia, Cerrado, Caatinga, Mata Atlântica, Pantanal, Pampa
- Detalhamento expandível: issues_information por camada

### Mapa

- Basemap: Esri World Imagery (satélite)
- Polígono CAR: borda branca tracejada, sem preenchimento
- Polígonos de busca: verde com 15% opacidade
- Camadas de cultura: cores distintas (Soja = verde, Milho = amarelo), toggle individual
- Camadas IBGE: limites de estados e municípios (WMS)
- Auto-fit nos bounds do polígono
- Busca por endereço (OpenStreetMap Nominatim)
- Busca por clique: encontra CARs nas coordenadas clicadas
- **Mapa Overview (Dashboard)**: Polígonos GeoJSON de todas as propriedades, coloridos por status ESG, com tooltip e auto-zoom

### Onboarding

Fluxo guiado em 3 passos após o registro:
1. **Dados Pessoais**: Verificar nome e email
2. **Primeira Propriedade**: Cadastrar CAR
3. **Resultado**: Ver o relatório gerado

### Multi-tenancy

- **Workspace FREE**: Produtor individual
- **Workspace PARTNER**: Parceria com empresa/cooperativa
- Roles: OWNER, ADMIN, MEMBER
- Segregação completa de dados por workspace

### Feature Flags

Sistema de controle de funcionalidades por workspace:
- **Relatórios**: Seção oculta por padrão, habilitável por super admin
- **Super Admin**: Campo `superAdmin` no modelo User, painel exclusivo em Configurações
- **Proteção de rotas**: Layout de relatórios redireciona para `/dashboard` se feature desabilitada

### Navegação

Sidebar desktop e bottom nav mobile com a ordem:
1. **Dashboard** — Mapa de propriedades e resumo com clima
2. **Minhas Propriedades** — Cadastro e gestão de propriedades próprias
3. **Fornecedores** — Cadastro e monitoramento de fornecedores
4. **Monitoramento** — Painel de conformidade e alertas
5. **Meteorologia** — Previsão do tempo por propriedade
6. **Relatórios** (submenu, feature flag) — ESG Completo, EUDR, Relatório Produtor
7. **Configurações** — Perfil, workspace, modo avançado, feature flags (super admin)

### Release Notes In-App

Modal "O que mudou?" com abas de versão e cards de funcionalidades. Exibido automaticamente quando a versão da plataforma é atualizada (comparação via `localStorage`). O usuário clica "Entendi!" para dispensar.

### Mobile

- Layout 100% responsivo
- Sem sidebar no mobile: navegação por bottom nav + hamburger drawer
- Seções do relatório colapsáveis (accordion)
- Top bar compacta com logo e menu de usuário
- Tabelas com scroll horizontal e colunas responsivas
- Mapas responsivos (250px mobile / 450px desktop)

### Resiliência

- **Retry/Backoff**: API Merx com retry automático (3 tentativas, backoff exponencial) para erros 5xx e 429
- **Promise.allSettled**: Fetches paralelos não-críticos não bloqueiam o fluxo principal

## Integrações Externas

### Merx API (`api.merx.tech`)

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/v1/integration/esg/cars/{CAR}:resume` | Relatório ESG da propriedade |
| `GET /api/v1/integration/esg/social-identities/{CPF}:resume` | Relatório ESG do produtor |
| `GET /api/v1/integration/eudr/cars/{CAR}:resumed` | Análise EUDR resumida |
| `GET /api/v1/integration/eudr/cars/{CAR}` | Análise EUDR detalhada |
| `GET /api/v1/integration/productivity/{CAR}` | Dados de produtividade |
| `GET /api/v1/integration/car/getCarsByLatLong` | Busca CARs por coordenada |

**Autenticação**: Header `Authorization: {API_KEY}` + `x-coop-id: {COOP_ID}`

### GeoServer WFS (`geoserver.merx.tech`)

- `typeNames=merx:area_imovel` para polígonos de imóveis rurais
- Filtro CQL por `cod_imovel` (código CAR)
- Sem autenticação

### IBGE WMS (`geoservicos.ibge.gov.br`)

- Camada `BC250_Unidade_Federacao_A` para limites estaduais
- Camada `BC250_Municipio_A` para limites municipais

### OpenStreetMap Nominatim

- Geocodificação de endereços para busca no mapa

### Open-Meteo API (`api.open-meteo.com`)

| Endpoint | Descrição |
|----------|-----------|
| `GET /v1/forecast` | Previsão diária 14 dias (temp, chuva, umidade, vento, ET₀, weather code) |

**Autenticação**: Nenhuma (API gratuita e aberta)
**Cache**: Revalidação a cada 1 hora via `next.revalidate`

## Modelos de Dados

```
User ──< WorkspaceMember >── Workspace
  │                              │
  ├── ReportConfig               ├──< Property
  ├──< Supplier                         │
  │      └──< SupplierCar               ├──< EsgReport
  │      └──< SupplierCheck             ├──< EudrReport
  └──< SupplierCheck (avulso)           ├──< ProductivityReport
                                        └──< Alert
```

| Modelo | Campos principais |
|--------|-------------------|
| **User** | name, email, cpfCnpj, passwordHash, advancedMode, superAdmin |
| **Workspace** | name, slug, type (FREE/PARTNER), settings (JSON: reportsEnabled) |
| **Property** | carCode, name, municipio, uf, areaImovel, esgStatus, eudrStatus, geoPolygon, lastCheckAt |
| **EsgReport** | esgStatus, fullData (JSON), totalApontamentos |
| **EudrReport** | euStatus, layerData (JSON), prodesLayerData (JSON), forestLossArea |
| **ProductivityReport** | culture, harvest, plantedArea, declaredArea, estimatedProduction, geoJsonCrops |
| **Alert** | type (STATUS_CHANGE, NEW_EMBARGO, EUDR_CHANGE), severity (INFO, WARNING, CRITICAL), message, read |
| **Supplier** | name, cpfCnpj, esgStatus, lastCheckAt |
| **SupplierCar** | carCode, esgStatus, eudrStatus, lastCheckAt |
| **SupplierCheck** | supplierCpfCnpj, supplierCar, esgStatus, eudrStatus, reportData |
| **ReportConfig** | esgEnabled, eudrEnabled, productivityEnabled, producerReportEnabled |

## Setup

### Pré-requisitos

- Node.js 20+
- PostgreSQL 16 (ou acesso a um banco remoto)

### Instalação

```bash
npm install
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL="postgresql://user:pass@host:port/db?schema=agroprodutor-dev"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

MERX_API_URL="https://api.merx.tech"
MERX_API_KEY="your-api-key"
MERX_COOP_ID="your-coop-id"

GEOSERVER_URL="https://geoserver.merx.tech/geoserver/wfs"
```

### Banco de Dados

```bash
npx prisma generate   # Gera o client Prisma
npx prisma db push    # Sincroniza o schema com o banco
npm run db:seed       # Cria usuário de teste (jaqueline@teste.com / teste123)
```

### Desenvolvimento

```bash
npm run dev           # Inicia o servidor em http://localhost:3000
```

### Testes

```bash
npm test              # Testes unitários (Vitest)
npx playwright test   # Testes E2E (Playwright)
```

### Build

```bash
npm run build         # Build de produção
npm start             # Inicia em modo produção
```

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Servidor de produção |
| `npm test` | Testes unitários com Vitest |
| `npm run type-check` | Verificação de tipos TypeScript |
| `npm run lint` | Linting com ESLint |
| `npm run db:seed` | Seed do banco de dados |
| `npm run db:push` | Sincronizar schema Prisma |

## Design System

O projeto usa um design system customizado definido em CSS custom properties:

- **Brand**: `#00C287` (primary/green), `#0B1B32` (navy)
- **Status**: Verde (conforme), Vermelho (não conforme), Amarelo (atenção), Cinza (pendente)
- **Cards**: Barra de acento colorida no topo, bordas contextuais, hover com elevação
- **Tipografia**: Inter (headings), system font stack
- **Componentes**: Cards com shadow, badges de conformidade, tabelas padronizadas, seções colapsáveis, tooltips educativos, status indicators com ícones

## CI/CD

GitHub Actions executa automaticamente no push/PR para `main`:
1. Install dependencies
2. Generate Prisma Client
3. Lint
4. Type Check
5. Unit Tests
