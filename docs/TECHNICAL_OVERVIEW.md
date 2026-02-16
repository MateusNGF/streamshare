# Visão Técnica Geral - StreamShare v2

Este documento fornece uma visão técnica abrangente da arquitetura, padrões e tecnologias utilizadas no desenvolvimento do **StreamShare v2**. Ele serve como guia de referência para engenheiros de software, arquitetos e desenvolvedores que trabalham na manutenção e evolução da plataforma.

---

## 1. Stack Tecnológico

A aplicação é construída sobre uma stack moderna, tipada e focada em performance e DX (Developer Experience).

| Camada | Tecnologia | Descrição |
|:---|:---|:---|
| **Framework Fullstack** | **Next.js 14+** (App Router) | Renderização híbrida (SSR/RSC), Roteamento, Server Actions. |
| **Linguagem** | **TypeScript** | Tipagem estática rigorosa para segurança e manutenibilidade. |
| **Banco de Dados** | **PostgreSQL** | Banco relacional robusto. |
| **ORM** | **Prisma** | Acesso ao banco type-safe, migrações e modelagem de esquema. |
| **Estilização** | **Tailwind CSS** | Estilos utilitários, design system e responsividade. |
| **Componentes UI** | **Radix UI** / **Lucide React** | Primitivos acessíveis (headless) e ícones SVG otimizados. |
| **Validação** | **Zod** | Validação de esquemas (runtime) para formulários e APIs. |
| **Gerenciamento de Estado** | **Zustand** | Estado global leve (ex: preferências de usuário, carrinhos). |
| **Visualização de Dados** | **Recharts** | Gráficos compostos e responsivos baseados em React/SVG. |

---

## 2. Arquitetura do Sistema

O projeto adota uma arquitetura modular baseada em **Server Components** e **Server Actions**, minimizando a necessidade de APIs REST tradicionais para comunicação interna.

### 2.1. Padrão Arquitetural: ACDI
Para organizar o código e separar responsabilidades, utilizamos o padrão **ACDI**:

1.  **A - Actions (`src/actions`)**:
    -   Funções assíncronas que rodam exclusivamente no servidor.
    -   Responsáveis por orquestrar a busca de dados e mutações (Create, Update, Delete).
    -   Atuam como "Controllers" no modelo MVC tradicional.
2.  **C - Components (`src/components`)**:
    -   Blocos de construção da UI.
    -   Divididos em **Smart** (conectados a dados/estado) e **Dumb** (apenas visuais).
    -   Organizados por contexto (`dashboard`, `modals`, `ui`, `layout`).
3.  **D - Data/Domain (`src/lib`, `src/services`)**:
    -   Regras de negócio puras e acesso ao banco de dados.
    -   **Services**: Encapsulam lógica complexa (ex: `billing-service.ts` para cálculos de faturas).
    -   **Lib**: Utilitários agnósticos e configurações (ex: `db.ts`, `auth.ts`).
4.  **I - Interfaces (`src/types`)**:
    -   Contratos de dados compartilhados entre Frontend e Backend.
    -   Garante que o componente receba exatamente o que a Action retorna.

### 2.2. Fluxo de Dados (Unidirectional Data Flow)

#### Leitura (Read)
1.  **Page (Server Component)**: Inicia o request.
2.  **Action**: Executa queries paralelas (`Promise.all`) no banco via Prisma.
3.  **Page**: Recebe os dados e passa para os componentes clientes.
4.  **Component (Client)**: Renderiza a UI.
    *   *Vantagem*: SEO otimizado, zero waterfalls no cliente, segurança.

#### Escrita (Write)
1.  **Component (Client)**: Captura input do usuário (Form).
2.  **Action**: Recebe os dados, valida com **Zod**, executa a lógica de negócio/banco.
3.  **Revalidation**: A Action invalidada o cache da rota (`revalidatePath`).
4.  **UI Update**: O Next.js atualiza a UI automaticamente com os novos dados do servidor.

---

## 3. Estrutura de Diretórios

```bash
src/
├── actions/        # Server Actions (Busca e Mutação de dados)
├── app/            # Rotas e Páginas (File-system routing)
│   ├── (auth)/     # Rotas de autenticação (login, register)
│   ├── (dashboard)/# Área logada da aplicação
│   └── api/        # Endpoints REST (se necessário para Webhooks)
├── components/     # Biblioteca de componentes React
│   ├── dashboard/  # Específicos do painel
│   ├── ui/         # Design System (Botões, Inputs, Cards)
│   └── ...
├── lib/            # Configurações e Utilitários Globais (DB, Auth)
├── services/       # Lógica de Negócio Complexa (Domain Logic)
├── types/          # Definições de Tipos TypeScript (Interfaces)
└── hooks/          # Custom React Hooks (Lógica de UI reutilizável)
```

---

## 4. Padrões de Código e Boas Práticas

### 4.1. SOLID & Clean Code
-   **Single Responsibility**: Cada arquivo/função deve ter um único propósito claro.
    -   *Exemplo*: `formatCurrency.ts` trata apenas de formatação, não de cálculo.
-   **Dry (Don't Repeat Yourself)**: Lógicas repetidas são extraídas para `hooks` ou `utils`.
-   **Nomes Significativos**: Variáveis e funções descrevem *o que fazem* (ex: `calcularProximoVencimento` vs `calcDate`).

### 4.2. Segurança
-   **Sanitização**: Inputs validados com Zod antes de chegar ao banco.
-   **Autenticação**: Rotas protegidas via Middleware e verificação de sessão (`auth.ts`).
-   **Dados Sensíveis**: Senhas criptografadas (`bcryptjs`) e tokens seguros.

### 4.3. Performance
-   **Dynamic Imports**: Componentes pesados (gráficos, modais complexos) carregados sob demanda (`next/dynamic`).
-   **Server-Side Caching**: O Next.js cacheia requisições GET por padrão (quando apropriado).
-   **Otimização de Imagens**: Uso do componente `<Image />` para WebP/AVIF automáticos.

---

## 5. Módulos Principais

### 5.1. Gestão de Planos e Assinaturas
Core da aplicação. O sistema oferece três níveis de acesso (Planos):
- `free`: Participação ilimitada em grupos. Sem capacidade de criar streamings.
- `pro`: Gestão de até 20 streamings com grupos e participantes ilimitados.
- `business`: Gestão ilimitada de streamings com grupos e participantes ilimitados, automação via WhatsApp e API.

Permite criar grupos (Streamings), adicionar participantes e definir regras de cobrança (mensal, trimestral, etc).

### 5.2. Sistema Financeiro
Módulo responsável por gerar cobranças, calcular vencimentos e rastrear pagamentos. Utiliza uma máquina de estados para o ciclo de vida da fatura (Pendente -> Pago / Atrasado -> Expirado).

### 5.3. Analytics
Motor de inteligência que agrega dados operacionais para gerar métricas de receita, ocupação e inadimplência em tempo real.

---

Este documento deve ser mantido atualizado conforme a arquitetura evolui. Para detalhes específicos de implementação de features, consulte a pasta `docs/features/`.
