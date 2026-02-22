# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

## [0.0.2] - 2026-02-22

### Funcionalidades

- **Gestão de Fornecedores**: Página de detalhe por fornecedor (`/suppliers/[id]`) com header, barra de estatísticas, grid de propriedades (CARs) e monitoramento
- **Propriedades de Fornecedor**: Cards visuais para cada CAR vinculado com status ESG/EUDR, link para relatório e ação de remoção
- **Adicionar CAR via Mapa (Fornecedor)**: Página `/suppliers/[id]/cars/new` com as mesmas opções de cadastro de propriedade (código CAR ou busca no mapa)
- **Monitoramento Centralizado**: Página `/monitoring` com resumo visual, visão geral de propriedades e fornecedores, alertas integrados
- **Alertas de Mudança de Status**: Criação automática de alertas ao detectar mudanças de ESG/EUDR durante atualização de relatório
- **Relatório ESG por CAR**: Página `/reports/car` para consultar ESG/EUDR de qualquer CAR sem cadastro prévio
- **Links ESG em Fornecedores**: CPF/CNPJ linka para relatório do produtor, código CAR linka para relatório ESG
- **Auto-busca no Relatório do Produtor**: Aceita parâmetro `?cpf=` para busca automática
- **Release Notes In-App**: Modal "O que mudou?" com abas de versão e cards de funcionalidades, exibido automaticamente ao atualizar

### Melhorias de UI

- **Property Card Redesenhado**: Barra de acento colorida, status ESG/EUDR com ícones, CAR completo sem truncamento, badge contextual (OK / ! / contagem)
- **Supplier Card Redesenhado**: Card com avatar, contagem de propriedades e alertas, link para detalhe
- **Tabelas Padronizadas**: Colunas uniformes (nome/CAR, estado, cidade, ESG, EUDR, apontamentos, última verificação)
- **Labels para Produtor**: Filtros com linguagem acessível (Informativo, Atenção, Urgente; Pendentes, Resolvidos)
- **Badge "Alterado"**: Destaque amarelo nas linhas do monitoramento para propriedades com mudanças recentes
- **Texto de Status**: "Não" substituído por "Sem apontamento" em todas as tabelas e PDF
- **Senha com Visibilidade**: Botão olhinho nos campos de senha (login e registro)
- **Campos Obrigatórios**: Asterisco vermelho nos campos enforced do registro

### Navegação

- **Sidebar Reordenada**: Minhas Propriedades → Fornecedores → Monitoramento → Relatórios → Configurações
- **"Alertas" → "Monitoramento"**: Foco em acompanhamento contínuo
- **Sino com Contagem Real**: Badge vermelho no sino com contagem de alertas pendentes, polling a cada 60s

### Infraestrutura

- **API `/api/car-report`**: Endpoint read-only para consultar ESG/EUDR de um CAR
- **API `/api/alerts/count`**: Endpoint para contagem de alertas não lidos
- **Alertas automáticos**: Criação de `Alert` ao detectar transição de status em propriedades e fornecedores

---

## [0.0.1] - 2026-02-20

### Funcionalidades

- **Autenticação**: Login/registro com NextAuth.js v5, JWT, Credentials provider
- **Dashboard**: Visão geral com cards de propriedades e resumo de status ESG
- **Propriedades**: Cadastro via código CAR ou busca no mapa interativo
- **Relatório Socioambiental (ESG)**: 15+ camadas ambientais com tooltips educativos
- **Relatório EUDR**: Conformidade europeia anti-desmatamento com PRODES por bioma
- **Relatório do Produtor**: Consulta ESG por CPF/CNPJ
- **Produtividade**: Dados de Soja e Milho com áreas e produção estimada
- **Mapa Interativo**: Leaflet com satélite, polígono CAR, camadas de cultura, busca por endereço, camadas IBGE
- **Exportação PDF**: Relatório ESG completo
- **Onboarding**: Fluxo guiado em 3 passos após registro
- **Multi-tenancy**: Workspaces (FREE/PARTNER) com roles (OWNER/ADMIN/MEMBER)
- **Mobile-first**: Bottom nav, hamburger drawer, layout responsivo
- **Seções Colapsáveis**: Accordion em todo o relatório
- **Tooltips Educativos**: Explicações acessíveis por camada ESG
- **Gráfico de Evolução**: Chart SVG no histórico de relatórios
- **ReportConfig**: Modo Avançado para controlar seções visíveis
- **Retry/Backoff**: API Merx com retry automático (3 tentativas, backoff exponencial)

### Integrações

- **Merx API** (`api.merx.tech`): ESG, EUDR, Produtividade, CAR
- **GeoServer WFS** (`geoserver.merx.tech`): Polígonos CAR
- **IBGE WMS**: Limites estaduais e municipais
- **OpenStreetMap Nominatim**: Geocodificação

### Stack Técnica

- Next.js 16 (App Router) + TypeScript 5.9
- Prisma v7 + PostgreSQL 16
- TailwindCSS 4 + Design System customizado
- Leaflet + react-leaflet
- @react-pdf/renderer
- Vitest + Playwright
- GitHub Actions CI
