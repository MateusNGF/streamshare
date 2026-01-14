# Componentes Reutilizáveis - PageContainer e PageHeader

## 📦 Visão Geral

Componentes criados para eliminar duplicação de código e garantir consistência em todas as páginas da aplicação.

---

## 🎯 Componentes

### PageContainer

**Localização**: `src/components/layout/PageContainer.tsx`

**Propósito**: Container padrão para todas as páginas com padding responsivo consistente.

**Props**:
```typescript
interface PageContainerProps {
    children: ReactNode;
}
```

**Uso**:
```tsx
<PageContainer>
    {/* conteúdo da página */}
</PageContainer>
```

**Classes aplicadas**:
- `p-4 md:p-8` - Padding lateral responsivo
- `pb-8 md:pb-12` - Padding bottom responsivo
- `pt-20 lg:pt-8` - Padding top (espaço para menu mobile)

---

### PageHeader

**Localização**: `src/components/layout/PageHeader.tsx`

**Propósito**: Header padrão com título, descrição e ação opcional.

**Props**:
```typescript
interface PageHeaderProps {
    title: string;           // Obrigatório
    description?: string;    // Opcional
    action?: ReactNode;      // Opcional
}
```

**Uso Básico**:
```tsx
<PageHeader
    title="Minha Página"
    description="Descrição da página"
/>
```

**Uso com Ação**:
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

**Classes aplicadas**:
- Layout: `flex flex-col md:flex-row`
- Alinhamento: `items-start md:items-center`
- Espaçamento: `gap-4 mb-8 md:mb-10`
- Título: `text-2xl md:text-3xl font-bold`
- Descrição: `text-gray-500 font-medium`

---

## 📋 Páginas que Usam

1. **Dashboard** - Com múltiplas ações (notificação + botão)
2. **Cobranças** - Com botão de exportar
3. **Participantes** - Com botão de adicionar
4. **Streamings** - Com botão de adicionar
5. **Catálogo** - Com botão de adicionar
6. **Configurações** - Com mensagem de sucesso dinâmica

---

## ✅ Benefícios

### Consistência
- Todas as páginas têm o mesmo layout
- Mesmo comportamento responsivo
- Mesma experiência de usuário

### Manutenibilidade
- Mudanças em 1 lugar afetam todas as páginas
- Fácil adicionar novos recursos
- Menos código para revisar

### Produtividade
- Criar nova página: 3 linhas de código
- Não precisa lembrar classes Tailwind
- Padrão já estabelecido

---

## 🔧 Manutenção

### Alterar Padding Global
Editar `PageContainer.tsx`:
```tsx
// Exemplo: aumentar padding mobile
<div className="p-6 md:p-8 pb-8 md:pb-12 pt-20 lg:pt-8">
```

### Alterar Typography do Título
Editar `PageHeader.tsx`:
```tsx
// Exemplo: título maior
<h1 className="text-3xl md:text-4xl font-bold">
```

### Adicionar Novo Elemento ao Header
Editar `PageHeader.tsx` e adicionar nova prop:
```tsx
interface PageHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
    badge?: ReactNode;  // Nova prop
}
```

---

## 📖 Exemplos Completos

### Página Simples
```tsx
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default function MinhaPage() {
    return (
        <PageContainer>
            <PageHeader
                title="Minha Página"
                description="Descrição opcional"
            />
            
            {/* Seu conteúdo aqui */}
            <div>Conteúdo da página</div>
        </PageContainer>
    );
}
```

### Página com Client Component
```tsx
"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Plus } from "lucide-react";

export function MeuClient() {
    return (
        <PageContainer>
            <PageHeader
                title="Minha Lista"
                description="Gerencie seus itens"
                action={
                    <button
                        onClick={() => console.log("Adicionar")}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl"
                    >
                        <Plus size={20} />
                        Novo Item
                    </button>
                }
            />
            
            {/* Lista de itens */}
        </PageContainer>
    );
}
```

---

## 🎨 Customização

### Quando NÃO usar PageContainer

- Páginas de login/signup (layout diferente)
- Landing pages (design customizado)
- Páginas de erro (layout especial)

### Quando NÃO usar PageHeader

- Se precisar de layout completamente customizado
- Se tiver múltiplas seções de header
- Se o design for muito diferente do padrão

**Nesses casos**: Use os componentes como referência mas crie seu próprio layout.

---

## 🔄 Componentes de Loading

### Skeleton

**Localização**: `src/components/ui/Skeleton.tsx`

**Propósito**: Placeholder animado para conteúdo em carregamento.

**Props**:
```typescript
interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular";
    width?: string | number;
    height?: string | number;
    animation?: "pulse" | "wave" | "none";
}
```

**Uso**:
```tsx
<Skeleton variant="text" className="w-48 h-4" />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rectangular" className="w-full h-32" />
```

---

### Spinner

**Localização**: `src/components/ui/Spinner.tsx`

**Propósito**: Indicador de carregamento rotativo.

**Props**:
```typescript
interface SpinnerProps {
    size?: "sm" | "md" | "lg" | "xl";
    color?: "primary" | "white" | "gray";
    className?: string;
}
```

**Uso**:
```tsx
// Em botões
<button disabled={loading} className="flex items-center gap-2">
    {loading && <Spinner size="sm" color="white" />}
    {loading ? "Salvando..." : "Salvar"}
</button>

// Centralizado
<div className="flex justify-center">
    <Spinner size="lg" color="primary" />
</div>
```

---

### LoadingCard

**Localização**: `src/components/ui/LoadingCard.tsx`

**Propósito**: Skeleton pré-configurado para diferentes tipos de cards.

**Props**:
```typescript
interface LoadingCardProps {
    variant?: "default" | "compact" | "detailed";
}
```

**Uso**:
```tsx
// Para listas de participantes
<LoadingCard variant="default" />

// Para dashboard (listas compactas)
<LoadingCard variant="compact" />

// Para streamings (cards detalhados)
<LoadingCard variant="detailed" />
```

---

### TableSkeleton

**Localização**: `src/components/ui/TableSkeleton.tsx`

**Propósito**: Skeleton para tabelas de dados.

**Props**:
```typescript
interface TableSkeletonProps {
    rows?: number;    // Padrão: 5
    columns?: number; // Padrão: 4
}
```

**Uso**:
```tsx
<TableSkeleton rows={8} columns={5} />
```

---

### Next.js Loading Files (loading.tsx)

**Propósito**: Loading UI automático para rotas usando Suspense Boundaries.

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
import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { PageContainer } from "@/components/layout/PageContainer";

export default function ParticipantesLoading() {
    return (
        <PageContainer>
            <div className="mb-8">
                <Skeleton variant="text" className="w-48 h-8" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <LoadingCard key={i} />
                ))}
            </div>
        </PageContainer>
    );
}
```

**Quando criar**:
- ✅ Páginas com Server Components que fazem data fetching
- ✅ Rotas que podem demorar para carregar
- ❌ Páginas 100% estáticas

---

## 📚 Documentação Completa

Para guia detalhado sobre loading states, padrões de implementação e exemplos completos, consulte:

**[LOADING_STATES.md](./LOADING_STATES.md)** - Guia completo com:
- Todos os componentes de loading
- Padrões de implementação
- Exemplos reais do projeto
- Checklist de implementação
- Erros comuns e como evitar
