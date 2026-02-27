# StreamShare - Especificação Completa do Projeto

> Sistema de Gestão de Assinaturas Compartilhadas de Streaming  
> **Versão**: 2.0  
> **Última Atualização**: 2026-01-14

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura](#-arquitetura)
3. [Domínio de Negócio](#-domínio-de-negócio)
4. [Tecnologias](#-tecnologias)
5. [Banco de Dados](#-banco-de-dados)
6. [Sistema de Autenticação](#-sistema-de-autenticação)
7. [Design System](#-design-system)
8. [Componentes Reutilizáveis](#-componentes-reutilizáveis)
9. [Estados de Carregamento](#-estados-de-carregamento)
10. [Responsividade e Acessibilidade](#-responsividade-e-acessibilidade)
11. [Sistema de Emails](#-sistema-de-emails)
12. [Configuração e Execução](#-configuração-e-execução)

---

## 🎯 Visão Geral

### Propósito

O **StreamShare** é um sistema completo para **organizar, controlar e manter assinaturas de serviços de streaming compartilhados**, permitindo que uma entidade organizadora administre grupos, disponibilize streamings e acompanhe o ciclo de vida das assinaturas individuais de cada participante.

### Características Principais

- ✅ **Multi-tenant**: Suporte a múltiplas contas isoladas
- ✅ **Gestão de Grupos**: Organização social e contextual
- ✅ **Controle de Assinaturas**: Ciclo de vida completo
- ✅ **Sistema de Cobrança**: Acompanhamento financeiro
- ✅ **Autenticação Completa**: Login, cadastro, recuperação de senha
- ✅ **Design Responsivo**: Mobile-first com acessibilidade WCAG 2.1 AA
- ✅ **Sistema de Emails**: Notificações automatizadas

### Público-Alvo

- **Administradores**: Gerenciam contas, grupos e streamings
- **Participantes**: Consomem serviços de streaming compartilhados

---

## 🏗️ Arquitetura

### Estrutura do Monorepo

```
streamsharev2/
├── prisma/                    # Schema do banco, seeds e migrations
├── public/                    # Arquivos estáticos
├── src/                       # Código fonte da aplicação
│   ├── app/                   # App Router (Next.js 14)
│   ├── components/            # Componentes React
│   ├── lib/                   # Bibliotecas e utilitários
│   ├── actions/               # Server Actions
│   ├── services/              # Lógica de negócio complexa
│   └── styles/                # Estilos globais
└── docs/                      # Documentação completa
```

### Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Framework** | Next.js | 14+ (App Router) |
| **UI** | React | 18+ |
| **Styling** | Tailwind CSS | 3+ |
| **Linguagem** | TypeScript | 5+ |
| **Database** | PostgreSQL | 14+ |
| **ORM** | Prisma | 5+ |
| **Autenticação** | JWT + Cookies | - |
| **Email** | Nodemailer | - |

### Padrões Arquiteturais

#### App Router (Next.js 14)

- **Server Components**: Padrão para páginas e layouts.
- **Client Components**: Apenas quando necessário interatividade (`"use client"`).
- **Server Actions**: Para mutações de dados e busca otimizada.

#### Organização de Código

```
src/
├── app/                       # Rotas e páginas
├── components/                # Componentes React (dashboard, ui, layout, auth)
├── lib/                       # Utilitários (auth.ts, prisma.ts, email/)
├── actions/                   # Server Actions (participantes, streamings, etc)
├── services/                  # Lógica de Domínio (billing-service.ts)
└── types/                     # Interfaces TypeScript
```


---

## 💼 Domínio de Negócio

### Entidades Principais

```mermaid
erDiagram
    Conta ||--o{ Usuario : "possui"
    Conta ||--o{ Grupo : "possui"
    Conta ||--o{ Participante : "possui"
    Grupo ||--o{ GrupoStreaming : "disponibiliza"
    Streaming ||--o{ GrupoStreaming : "está em"
    Streaming ||--o{ Assinatura : "gera"
    Participante ||--o{ Assinatura : "possui"
    StreamingCatalogo ||--o{ Streaming : "tipo"
    
    Conta {
        int id PK
        string nome
        enum plano
        datetime criadoEm
    }
    
    Usuario {
        int id PK
        string email UK
        string nome
        string senhaHash
        string resetToken
        datetime resetTokenExpiry
    }
    
    Grupo {
        int id PK
        int contaId FK
        string nome
        string linkConvite UK
    }
    
    Participante {
        int id PK
        int contaId FK
        string nome
        string whatsapp UK
        string cpf UK
    }
    
    StreamingCatalogo {
        int id PK
        string nome UK
        string cor
    }
    
    Streaming {
        int id PK
        int contaId FK
        int catalogoId FK
        decimal valorIntegral
        int limiteParticipantes
        int diaVencimento
        boolean ativo
    }
    
    Assinatura {
        int id PK
        int participanteId FK
        int streamingId FK
        enum frequencia
        decimal valorCobrado
        enum status
        datetime inicioEm
        datetime vencimentoEm
    }
```

### Regras de Negócio

#### 1. Estrutura Organizacional (Multi-tenant)

**Conta**
- Representa o tenant do sistema
- Define plano contratado: `basico`, `pro`, `premium`
- Impõe limites operacionais (número de grupos, participantes)
- Centraliza usuários administradores, grupos e participantes

**ContaUsuario**
- Entidade de junção para controle de acesso
- Níveis: `owner`, `admin`
- Um usuário pode administrar múltiplas contas

#### 2. Organização Social

**Grupo**
- Contexto organizacional (ex: grupo de WhatsApp)
- Agrupa streamings disponíveis
- Possui link de convite único
- **Importante**: Grupo não possui participantes diretamente

**GrupoStreaming**
- Associação N:N entre Grupo e Streaming
- Permite reutilização de streamings em múltiplos grupos
- Desacopla regras sociais (grupo) de regras financeiras (streaming)

#### 3. Modelagem de Streaming (Três Camadas)

**StreamingCatalogo**
- Tipo abstrato de serviço (Netflix, Spotify, Disney+)
- Apenas referencial, sem regras operacionais
- Contém: nome, cor da marca

**Streaming**
- Assinatura concreta de um serviço
- Define: valor integral, limite de participantes, dia de vencimento
- Possui: credenciais compartilhadas, frequências habilitadas
- Estado: ativo/inativo
- **Independente de grupos**, pode ser reutilizado

**GrupoStreaming**
- Define quais streamings estão disponíveis em cada grupo
- Evita duplicação de dados

#### 4. Participante

- Consumidor final que paga e utiliza o serviço
- Pertence diretamente a uma Conta
- Identificado por: WhatsApp (único), CPF (único)
- Pode ou não estar vinculado a um Usuário autenticado
- Só "entra" no sistema quando cria uma **Assinatura**

#### 5. Assinatura (Centro do Domínio)

**A Assinatura é a entidade central do sistema**

Conecta:
- Um Participante
- A um Streaming específico

Concentra:
- Frequência de pagamento: `mensal`, `trimestral`, `semestral`, `anual`
- Valor cobrado (pode ser diferente do valor integral)
- Datas de início e vencimento
- Status: `ativa`, `suspensa`, `cancelada`
- Controle de atraso e suspensão

Regras:
- ✅ Assinatura única por participante e streaming
- ✅ Suspensão automática baseada em status e datas
- ✅ Controle de limites via streaming
- ✅ Gestão de ciclo recorrente via vencimento e frequência

> **Importante**: No domínio persistente, não existe pagamento sem assinatura.

---

## 🛠️ Tecnologias

### Frontend

#### Next.js 14 (App Router)

**Características**:
- Server Components por padrão
- Streaming de dados
- Suspense Boundaries automáticos
- Route Handlers para APIs

**Estrutura de Rotas**:
```
app/
├── (auth)/              # Grupo de rotas públicas
├── (dashboard)/         # Grupo de rotas protegidas
├── api/                 # API Routes
└── layout.tsx           # Layout compartilhado
```

#### React 18

**Recursos Utilizados**:
- Server Components
- Client Components (`"use client"`)
- Hooks: `useState`, `useEffect`, `useCallback`
- Context API (quando necessário)

#### Tailwind CSS

**Configuração**:
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6d28d9',
        accent: '#8b5cf6',
      },
    },
  },
}
```

**Padrões**:
- Mobile-first
- Utility classes
- Componentes reutilizáveis
- Design system consistente

### Backend

#### Prisma ORM

**Características**:
- Type-safe database client
- Migrations automáticas
- Seed para dados iniciais
- Studio para visualização

**Comandos Principais**:
```bash
pnpm db:generate    # Gera cliente TypeScript
pnpm db:push        # Sincroniza schema (dev)
pnpm db:migrate     # Cria migration (prod)
pnpm db:seed        # Popula dados iniciais
pnpm db:studio      # Abre interface visual
```

#### PostgreSQL

**Configuração**:
- Docker Compose para desenvolvimento
- Porta: 5432
- Database: `streamshare`
- Schema: `public`

---

## 🗄️ Banco de Dados

### Schema Prisma

```prisma
// Principais models

model Conta {
  id        Int      @id @default(autoincrement())
  nome      String
  plano     PlanoTipo @default(basico)
  criadoEm  DateTime @default(now())
  
  usuarios     ContaUsuario[]
  grupos       Grupo[]
  participantes Participante[]
  streamings   Streaming[]
}

model Usuario {
  id               Int       @id @default(autoincrement())
  email            String    @unique
  nome             String
  senhaHash        String?
  provider         String    @default("local")
  resetToken       String?
  resetTokenExpiry DateTime?
  
  constas ContaUsuario[]
}

model Grupo {
  id          Int    @id @default(autoincrement())
  contaId     Int
  nome        String
  linkConvite String @unique
  
  conta      Conta             @relation(fields: [contaId], references: [id])
  streamings GrupoStreaming[]
}

model Participante {
  id       Int    @id @default(autoincrement())
  contaId  Int
  nome     String
  whatsapp String @unique
  cpf      String @unique
  
  conta        Conta         @relation(fields: [contaId], references: [id])
  assinaturas  Assinatura[]
}

model StreamingCatalogo {
  id   Int    @id @default(autoincrement())
  nome String @unique
  cor  String
  
  streamings Streaming[]
}

model Streaming {
  id                   Int     @id @default(autoincrement())
  contaId              Int
  catalogoId           Int
  valorIntegral        Decimal
  limiteParticipantes  Int
  diaVencimento        Int
  ativo                Boolean @default(true)
  
  conta      Conta             @relation(fields: [contaId], references: [id])
  catalogo   StreamingCatalogo @relation(fields: [catalogoId], references: [id])
  grupos     GrupoStreaming[]
  assinaturas Assinatura[]
}

model Assinatura {
  id             Int       @id @default(autoincrement())
  participanteId Int
  streamingId    Int
  frequencia     FrequenciaPagamento
  valorCobrado   Decimal
  status         StatusAssinatura @default(ativa)
  inicioEm       DateTime
  vencimentoEm   DateTime
  
  participante Participante @relation(fields: [participanteId], references: [id])
  streaming    Streaming    @relation(fields: [streamingId], references: [id])
  
  @@unique([participanteId, streamingId])
}
```

### Enums

```prisma
enum PlanoTipo {
  basico
  pro
}

enum NivelAcesso {
  owner
  admin
}

enum FrequenciaPagamento {
  mensal
  trimestral
  semestral
  anual
}

enum StatusAssinatura {
  ativa
  suspensa
  cancelada
}
```

### Migrations

**Quando usar `db:push`**:
- Prototipagem rápida
- Desenvolvimento local
- ⚠️ Pode causar perda de dados

**Quando usar `db:migrate`**:
- Mudanças oficiais
- Ambiente de produção
- Histórico versionado

---

## 🔐 Sistema de Autenticação

### Arquitetura

```mermaid
graph TB
    subgraph "Frontend"
        LoginForm[LoginForm]
        SignupForm[SignupForm]
        ForgotForm[ForgotPasswordForm]
        ResetForm[ResetPasswordForm]
        ChangeModal[ChangePasswordModal]
    end
    
    subgraph "API Routes"
        LoginAPI[/api/auth/login]
        SignupAPI[/api/auth/signup]
        ForgotAPI[/api/auth/forgot-password]
        ResetAPI[/api/auth/reset-password]
        ChangeAPI[/api/auth/change-password]
    end
    
    subgraph "Auth Library"
        AuthLib[lib/auth.ts<br/>JWT Utils]
    end
    
    subgraph "Database"
        UserTable[(Usuario)]
    end
    
    LoginForm --> LoginAPI
    SignupForm --> SignupAPI
    ForgotForm --> ForgotAPI
    ResetForm --> ResetAPI
    ChangeModal --> ChangeAPI
    
    LoginAPI --> AuthLib
    SignupAPI --> AuthLib
    ChangeAPI --> AuthLib
    
    LoginAPI --> UserTable
    SignupAPI --> UserTable
    ForgotAPI --> UserTable
    ResetAPI --> UserTable
    ChangeAPI --> UserTable
```

### Fluxos Implementados

#### 1. Login

**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "email": "usuario@example.com",
  "senha": "SenhaSegura123"
}
```

**Response**:
```json
{
  "success": true
}
```

**Cookie**: `auth-token` (HttpOnly, Secure em produção)

**Processo**:
1. Validação client-side (email, senha)
2. Busca usuário por email
3. Verifica senha com bcrypt
4. Gera JWT token
5. Define cookie HttpOnly
6. Redireciona para `/dashboard`

#### 2. Cadastro

**Endpoint**: `POST /api/auth/signup`

**Request**:
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "SenhaSegura123"
}
```

**Processo**:
1. Validação de dados
2. Verifica email duplicado
3. Hash da senha (bcrypt, 10 rounds)
4. Cria Usuario e Conta
5. Login automático
6. Redireciona para `/dashboard`

#### 3. Recuperação de Senha

**Fluxo Completo**:

```mermaid
sequenceDiagram
    User->>ForgotPage: Digite email
    ForgotPage->>API: POST /forgot-password
    API->>DB: Busca usuário
    API->>DB: Salva resetToken
    API->>Email: Envia link
    API->>ForgotPage: "Verifique seu email"
    User->>Email: Clica no link
    Email->>ResetPage: /redefinir-senha/[token]
    User->>ResetPage: Nova senha
    ResetPage->>API: POST /reset-password
    API->>DB: Valida token
    API->>DB: Atualiza senha
    API->>ResetPage: "Senha redefinida"
    ResetPage->>LoginPage: Redirect
```

**Características**:
- Token único (crypto.randomBytes)
- Expiração: 1 hora
- Mensagem genérica (anti-enumeração)
- Token de uso único

#### 4. Alteração de Senha

**Endpoint**: `POST /api/auth/change-password`

**Request**:
```json
{
  "currentPassword": "SenhaAtual123",
  "newPassword": "NovaSenha456"
}
```

**Requer**: Cookie `auth-token`

**Processo**:
1. Verifica autenticação (JWT)
2. Valida senha atual
3. Hash da nova senha
4. Atualiza no banco
5. Retorna sucesso

### Segurança

#### JWT Token

**Estrutura**:
```typescript
interface JWTPayload {
  userId: number;
  email: string;
  iat: number;  // Issued at
  exp: number;  // Expiration (7 dias)
}
```

**Configuração**:
- Secret: `process.env.JWT_SECRET`
- Algoritmo: HS256
- Expiração: 7 dias

**Armazenamento**:
- Cookie HttpOnly
- Secure em produção
- SameSite: Lax
- Path: /

#### Requisitos de Senha

- ✅ Mínimo 8 caracteres
- ✅ Pelo menos 1 letra maiúscula (A-Z)
- ✅ Pelo menos 1 letra minúscula (a-z)
- ✅ Pelo menos 1 número (0-9)

**Validação**:
```typescript
function validatePassword(pwd: string): string | null {
  if (pwd.length < 8) return "Mínimo 8 caracteres";
  if (!/[A-Z]/.test(pwd)) return "Falta letra maiúscula";
  if (!/[a-z]/.test(pwd)) return "Falta letra minúscula";
  if (!/[0-9]/.test(pwd)) return "Falta número";
  return null;
}
```

#### Medidas de Segurança

- ✅ bcrypt para hash de senhas (10 rounds)
- ✅ JWT em cookies HttpOnly
- ✅ Tokens de reset únicos e temporários
- ✅ Validação client-side e server-side
- ✅ Mensagens genéricas (anti-enumeração)
- ✅ HTTPS em produção

---

## 🎨 Design System

### Paleta de Cores

#### Cores Principais

| Nome | Hex | Uso |
|------|-----|-----|
| **Primary** | `#6d28d9` | Botões principais, estados ativos |
| **Accent** | `#8b5cf6` | Hover em botões primários |
| **Background** | `#f9fafb` | Fundo geral da aplicação |
| **Foreground** | `#111827` | Texto principal |

#### Cores de Sistema

| Nome | Hex | Uso |
|------|-----|-----|
| **White** | `#ffffff` | Cards, sidebar |
| **Gray 50** | `#f9fafb` | Backgrounds secundários |
| **Gray 100** | `#f3f4f6` | Borders sutis |
| **Gray 500** | `#6b7280` | Texto secundário |
| **Gray 900** | `#111827` | Títulos, texto principal |

#### Cores de Feedback

| Nome | Hex | Uso |
|------|-----|-----|
| **Green 600** | `#16a34a` | Status "Ativa" |
| **Red 500** | `#ef4444` | Alertas, erros |
| **Amber 500** | `#f59e0b` | Avisos, "Em atraso" |

### Tipografia

**Fonte**: Inter (Google Fonts)

| Estilo | Classe Tailwind | Uso |
|--------|----------------|-----|
| **H1** | `text-2xl md:text-3xl font-bold` | Títulos de página |
| **H2** | `text-xl font-bold` | Títulos de seções |
| **Body** | `text-sm` | Texto padrão |
| **Small** | `text-xs` | Labels, badges |

### Espaçamento

#### Border Radius

| Tamanho | Classe | Pixels | Uso |
|---------|--------|--------|-----|
| **Padrão** | `rounded-xl` | 12px | Nav items |
| **Grande** | `rounded-2xl` | 16px | Botões, cards |
| **Extra Grande** | `rounded-3xl` | 24px | KPI Cards |
| **Mega** | `rounded-[32px]` | 32px | Sections |

#### Padding/Margin

- **Cards**: `p-6` (24px) ou `p-8` (32px)
- **Páginas**: `p-4 md:p-8`
- **Gaps em Grids**: `gap-6` (24px)

### Componentes Base

#### Sidebar

**Características**:
- Largura: `w-64` (256px)
- Background: `bg-white`
- Altura: `h-screen`

**Estados de Item**:
- **Ativo**: `bg-primary text-white shadow-lg`
- **Inativo**: `text-gray-500 hover:bg-gray-50`

#### KPICard

**Estrutura**:
```tsx
<div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
  <div className="bg-gray-50 rounded-2xl text-primary">
    {/* Ícone */}
  </div>
  <div className="text-3xl font-bold text-gray-900">
    {/* Valor */}
  </div>
  <div className="text-gray-500 text-sm">
    {/* Título */}
  </div>
</div>
```

#### Botões

**Primário**:
```tsx
<button className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-2xl shadow-lg shadow-primary/25 transition-all">
  Ação Principal
</button>
```

**Secundário**:
```tsx
<button className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-6 py-3 rounded-2xl transition-all">
  Ação Secundária
</button>
```

---

## 🧩 Componentes Reutilizáveis

### PageContainer

**Localização**: `src/components/layout/PageContainer.tsx`

**Propósito**: Container padrão com padding responsivo

**Uso**:
```tsx
<PageContainer>
  {/* conteúdo da página */}
</PageContainer>
```

**Classes**: `p-4 md:p-8 pb-8 md:pb-12 pt-20 lg:pt-8`

### PageHeader

**Localização**: `src/components/layout/PageHeader.tsx`

**Props**:
```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}
```

**Uso**:
```tsx
<PageHeader
  title="Participantes"
  description="Gerencie os participantes"
  action={
    <button onClick={handleAdd}>
      <Plus /> Novo Participante
    </button>
  }
/>
```

### Input

**Localização**: `src/components/ui/Input.tsx`

**Props**:
```typescript
interface InputProps {
  label: string;
  type?: string;
  error?: string;
  // ... HTMLInputElement props
}
```

**Características**:
- Label integrado
- Mensagens de erro
- Estados de validação
- Suporte a ícones

---

## ⏳ Estados de Carregamento

### Componentes Disponíveis

#### 1. Skeleton

**Localização**: `src/components/ui/Skeleton.tsx`

**Variantes**:
- `text`: Linhas de texto
- `circular`: Avatares
- `rectangular`: Cards, imagens

**Uso**:
```tsx
<Skeleton variant="text" className="w-48 h-4" />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rectangular" className="w-full h-32" />
```

#### 2. Spinner

**Localização**: `src/components/ui/Spinner.tsx`

**Tamanhos**: `sm`, `md`, `lg`, `xl`  
**Cores**: `primary`, `white`, `gray`

**Uso em Botões**:
```tsx
<button disabled={loading}>
  {loading && <Spinner size="sm" color="white" />}
  {loading ? "Salvando..." : "Salvar"}
</button>
```

#### 3. LoadingCard

**Localização**: `src/components/ui/LoadingCard.tsx`

**Variantes**:
- `compact`: Listas no dashboard
- `default`: Cards de participantes
- `detailed`: Cards de streamings

#### 4. TableSkeleton

**Localização**: `src/components/ui/TableSkeleton.tsx`

**Props**:
```typescript
interface TableSkeletonProps {
  rows?: number;    // Padrão: 5
  columns?: number; // Padrão: 4
}
```

### Next.js Loading Files

**Estrutura**:
```
app/
├── loading.tsx              # Loading raiz
├── dashboard/
│   └── loading.tsx         # Loading do dashboard
└── participantes/
    └── loading.tsx         # Loading de participantes
```

**Exemplo**:
```tsx
// app/participantes/loading.tsx
import { LoadingCard } from "@/components/ui/LoadingCard";
import { PageContainer } from "@/components/layout/PageContainer";

export default function ParticipantesLoading() {
  return (
    <PageContainer>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingCard key={i} variant="default" />
        ))}
      </div>
    </PageContainer>
  );
}
```

---

## ♿ Responsividade e Acessibilidade

### Breakpoints

```css
sm: 640px   /* Smartphones landscape */
md: 768px   /* Tablets */
lg: 1024px  /* Desktops pequenos */
xl: 1280px  /* Desktops médios */
2xl: 1536px /* Desktops grandes */
```

### Funcionalidades Implementadas

#### 1. Navegação Mobile Responsiva

- Menu lateral → Drawer deslizante em `< 1024px`
- Botão hambúrguer fixo
- Overlay com backdrop blur
- Animação suave (300ms)
- Fecha ao clicar em link ou overlay

#### 2. Skip Link

- Aparece ao pressionar `Tab`
- Pula para conteúdo principal
- Melhora navegação por teclado

#### 3. Focus Management

- Focus trap em modais
- Outline roxo visível (`#6d28d9`)
- Ordem lógica de foco
- `Esc` fecha modais

#### 4. Área de Toque

- Mínimo 44x44px em mobile
- Implementação: `p-2 md:p-1.5`

#### 5. Typography Responsiva

| Elemento | Mobile | Desktop |
|----------|--------|---------|
| H1 | 24px | 30px |
| H2 | 20px | 24px |
| Body | 14px | 14px |

#### 6. Mensagens de Erro Acessíveis

```tsx
<input 
  aria-invalid={error ? "true" : "false"}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && <p id="email-error" role="alert">{error}</p>}
```

#### 7. Progress Bars

```tsx
<div 
  role="progressbar"
  aria-valuenow={percentage}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="5 de 10 vagas ocupadas"
/>
```

#### 8. Prefers Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Conformidade WCAG 2.1 AA

#### Perceptível
- ✅ 1.3.1 Info e Relacionamentos
- ✅ 1.4.3 Contraste Mínimo (≥ 4.5:1)
- ✅ 1.4.11 Contraste Não-Textual (≥ 3:1)

#### Operável
- ✅ 2.1.1 Teclado
- ✅ 2.1.2 Sem Armadilha de Teclado
- ✅ 2.4.1 Bypass Blocks
- ✅ 2.4.7 Foco Visível

#### Compreensível
- ✅ 3.3.1 Identificação de Erro
- ✅ 3.3.2 Labels ou Instruções

#### Robusto
- ✅ 4.1.2 Nome, Função, Valor
- ✅ 4.1.3 Mensagens de Status

---

## 📧 Sistema de Emails

### Configuração

#### Opção 1: Resend (Recomendado)

**Variáveis de Ambiente**:
```bash
RESEND_API_KEY="re_sua_chave_aqui"
EMAIL_FROM="StreamShare <onboarding@resend.dev>"
EMAIL_REPLY_TO="atendimento@streamshare.com.br"
```

**Vantagens**:
- 100 emails/dia grátis
- Templates HTML
- Dashboard com métricas
- Fácil configuração

#### Opção 2: Nodemailer (SMTP)

**Gmail**:
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="xxxx xxxx xxxx xxxx"  # App Password
EMAIL_FROM="StreamShare <seu-email@gmail.com>"
```

**Outlook**:
```bash
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="seu-email@outlook.com"
SMTP_PASS="sua-senha"
```

#### Opção 3: Ethereal (Desenvolvimento)

**Configuração Automática**:
- Não configure variáveis SMTP
- Sistema cria conta automaticamente
- Preview URLs no console
- Zero configuração

### Templates Disponíveis

#### 1. Password Reset Email

**Função**: `sendPasswordResetEmail(email, token, userName?)`

**Características**:
- Design responsivo
- Botão CTA destacado
- Link alternativo
- Aviso de expiração (1 hora)

#### 2. Welcome Email

**Função**: `sendWelcomeEmail(email, userName)`

**Características**:
- Boas-vindas personalizadas
- Lista de funcionalidades
- CTA para dashboard

### Design dos Templates

**Cores**:
```css
/* Gradiente Principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Cores de Texto */
--gray-900: #1f2937;
--gray-600: #4b5563;
```

**Estrutura**:
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
  </head>
  <body>
    <!-- Header com gradiente -->
    <!-- Conteúdo principal -->
    <!-- CTA Button -->
    <!-- Footer -->
  </body>
</html>
```

---

## ⚙️ Configuração e Execução

### Pré-requisitos

- **Node.js**: 18 ou superior
- **PNPM**: `npm i -g pnpm`
- **Docker**: Para PostgreSQL local

### Instalação

```bash
# 1. Clone o repositório
git clone <repo-url>
cd streamsharev2

# 2. Instale dependências
pnpm install

# 3. Configure variáveis de ambiente
# Crie .env na raiz com:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/streamshare?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
NEXT_PUBLIC_URL="http://localhost:3000"

# 4. Suba o banco de dados
docker-compose up -d

# 5. Gere o cliente Prisma e sincronize schema
pnpm db:generate
pnpm db:push

# 6. (Opcional) Popule dados iniciais
pnpm db:seed
```

### Execução

```bash
# Desenvolvimento (todas as aplicações)
pnpm dev

# Acesse: http://localhost:3000
```

### Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia ambiente de desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm db:generate` | Gera cliente Prisma |
| `pnpm db:push` | Sincroniza schema (dev) |
| `pnpm db:migrate` | Cria migration (prod) |
| `pnpm db:seed` | Popula dados iniciais |
| `pnpm db:studio` | Abre Prisma Studio |

### Estrutura de Variáveis de Ambiente

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
JWT_SECRET="min-32-characters-secret"
NEXT_PUBLIC_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="StreamShare <onboarding@resend.dev>"
EMAIL_REPLY_TO="atendimento@streamshare.com.br"

# Email (SMTP - Opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="email@gmail.com"
SMTP_PASS="app-password"
```

### Solução de Problemas

#### Erro de Conexão com Banco

```bash
# Verifique se o container está rodando
docker ps

# Se não estiver, inicie
docker-compose up -d
```

#### Erro de Tipos do Prisma

```bash
# Regenere o cliente
pnpm db:generate

# Reinicie o TypeScript Server no VS Code
# Ctrl+Shift+P > "TypeScript: Restart TS Server"
```

#### Porta 5432 Ocupada

```bash
# Verifique processos usando a porta
netstat -ano | findstr :5432

# Pare o processo ou altere a porta no docker-compose.yml
```

---

## 📚 Documentação Adicional

### Arquivos de Referência

- [COMO_RODAR.md](./COMO_RODAR.md) - Guia de instalação e execução
- [DATABASE.md](./DATABASE.md) - Gerenciamento do banco de dados
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Sistema de design completo
- [AUTHENTICATION_SYSTEM.md](./AUTHENTICATION_SYSTEM.md) - Sistema de autenticação
- [LOADING_STATES.md](./LOADING_STATES.md) - Estados de carregamento
- [RESPONSIVENESS_ACCESSIBILITY.md](./RESPONSIVENESS_ACCESSIBILITY.md) - Responsividade e acessibilidade
- [REUSABLE_COMPONENTS.md](./REUSABLE_COMPONENTS.md) - Componentes reutilizáveis
- [EMAIL_CONFIGURATION.md](./EMAIL_CONFIGURATION.md) - Configuração de emails (Nodemailer)
- [EMAIL_SETUP.md](./EMAIL_SETUP.md) - Configuração de emails (Resend)

### Recursos Externos

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Resend Documentation](https://resend.com/docs)

---

## 🎯 Roadmap

### Implementado ✅

- [x] Arquitetura multi-tenant
- [x] Sistema de autenticação completo
- [x] CRUD de Participantes
- [x] CRUD de Streamings
- [x] CRUD de Assinaturas
- [x] Sistema de Cobranças
- [x] Design System
- [x] Componentes reutilizáveis
- [x] Loading states
- [x] Responsividade mobile
- [x] Acessibilidade WCAG 2.1 AA
- [x] Sistema de emails

### Planejado 🔄

- [ ] OAuth com Google
- [ ] Autenticação 2FA
- [ ] Webhooks de pagamento
- [ ] Notificações push
- [ ] Relatórios e analytics
- [ ] Exportação de dados
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Dark mode

---

## 📄 Licença

Este projeto é proprietário e confidencial.

---

**Última Atualização**: 2026-01-14  
**Versão do Documento**: 2.0  
**Mantido por**: Equipe StreamShare
