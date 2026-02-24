# Loading States - Guia Completo

Este documento ensina como usar os componentes de loading e implementar estados de carregamento na aplicação StreamShare.

---

## 📦 Componentes Disponíveis

### 1. Skeleton

**Localização**: `src/components/ui/Skeleton.tsx`

**Propósito**: Placeholder animado para conteúdo que está sendo carregado.

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

**Uso Básico**:
```tsx
import { Skeleton } from "@/components/ui/Skeleton";

// Texto
<Skeleton variant="text" className="w-48 h-4" />

// Avatar circular
<Skeleton variant="circular" width={40} height={40} />

// Card retangular
<Skeleton variant="rectangular" className="w-full h-32" />
```

**Variantes**:
- `text`: Para linhas de texto (altura padrão 16px)
- `circular`: Para avatares e ícones circulares
- `rectangular`: Para cards, imagens, botões (border-radius 16px)

**Animações**:
- `pulse`: Animação de fade in/out (padrão)
- `wave`: Efeito shimmer da esquerda para direita
- `none`: Sem animação

---

### 2. Spinner

**Localização**: `src/components/ui/Spinner.tsx`

**Propósito**: Indicador de carregamento rotativo para loading inline.

**Props**:
```typescript
interface SpinnerProps {
    size?: "sm" | "md" | "lg" | "xl";
    color?: "primary" | "white" | "gray";
    className?: string;
}
```

**Uso Básico**:
```tsx
import { Spinner } from "@/components/ui/Spinner";

// Spinner médio roxo
<Spinner size="md" color="primary" />

// Spinner pequeno branco (para botões)
<Spinner size="sm" color="white" />

// Spinner grande cinza
<Spinner size="lg" color="gray" />
```

**Tamanhos**:
- `sm`: 16px (para botões)
- `md`: 24px (padrão)
- `lg`: 32px (para cards)
- `xl`: 48px (para páginas inteiras)

**Quando usar**:
- ✅ Botões durante submit
- ✅ Loading inline em cards
- ✅ Feedback imediato de ações
- ❌ Loading de páginas inteiras (use loading.tsx)

---

### 3. LoadingCard

**Localização**: `src/components/ui/LoadingCard.tsx`

**Propósito**: Skeleton pré-configurado para diferentes tipos de cards.

**Props**:
```typescript
interface LoadingCardProps {
    variant?: "default" | "compact" | "detailed";
}
```

**Uso Básico**:
```tsx
import { LoadingCard } from "@/components/ui/LoadingCard";

// Card padrão (participantes)
<LoadingCard variant="default" />

// Card compacto (listas no dashboard)
<LoadingCard variant="compact" />

// Card detalhado (streamings)
<LoadingCard variant="detailed" />
```

**Variantes**:

**`compact`**: Para listas compactas
- Avatar 40px + 2 linhas de texto
- Usado em: Dashboard (streamings, assinaturas)

**`default`**: Para cards padrão
- Avatar 48px + 2 linhas + botão
- Usado em: Participantes

**`detailed`**: Para cards ricos
- Avatar 56px + 2 linhas + 3 linhas de descrição
- Usado em: Streamings

---

### 4. TableSkeleton

**Localização**: `src/components/ui/TableSkeleton.tsx`

**Propósito**: Skeleton para tabelas de dados.

**Props**:
```typescript
interface TableSkeletonProps {
    rows?: number;    // Padrão: 5
    columns?: number; // Padrão: 4
}
```

**Uso Básico**:
```tsx
import { TableSkeleton } from "@/components/ui/TableSkeleton";

// Tabela com 5 linhas e 4 colunas
<TableSkeleton />

// Tabela customizada
<TableSkeleton rows={10} columns={6} />
```

**Quando usar**:
- ✅ Listas de cobranças
- ✅ Tabelas de dados
- ✅ Relatórios

---

## 🎯 Next.js Loading Files (loading.tsx)

### O que é?

`loading.tsx` é um arquivo especial do Next.js 13+ que define o UI de loading para uma rota ou layout. Ele usa **Suspense Boundaries** automaticamente.

### Como funciona?

1. Next.js detecta o arquivo `loading.tsx` na pasta da rota
2. Durante navegação ou data fetching, mostra o loading UI
3. Quando os dados estão prontos, faz transição suave para o conteúdo real

### Estrutura de Arquivos

```
app/
├── loading.tsx                    # Loading raiz
├── dashboard/
│   ├── page.tsx
│   └── loading.tsx               # Loading do dashboard
├── participantes/
│   ├── page.tsx
│   └── loading.tsx               # Loading de participantes
└── streamings/
    ├── page.tsx
    └── loading.tsx               # Loading de streamings
```

### Exemplo Completo

**Arquivo**: `app/participantes/loading.tsx`

```tsx
import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { PageContainer } from "@/components/layout/PageContainer";

export default function ParticipantesLoading() {
    return (
        <PageContainer>
            {/* Header Skeleton */}
            <div className="flex items-start justify-between mb-8 md:mb-10">
                <div>
                    <Skeleton variant="text" className="w-48 h-8 mb-2" />
                    <Skeleton variant="text" className="w-64 h-4" />
                </div>
                <Skeleton variant="rectangular" className="w-40 h-12" />
            </div>

            {/* Grid de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <LoadingCard key={i} variant="default" />
                ))}
            </div>
        </PageContainer>
    );
}
```

### Quando criar loading.tsx?

✅ **Sempre que você tiver**:
- Server Components que fazem data fetching
- Páginas que carregam dados de API
- Rotas que podem demorar para renderizar

❌ **Não precisa quando**:
- Página é 100% estática
- Usa apenas Client Components com loading próprio
- Página carrega instantaneamente

---

## 🎨 Padrões de Implementação

### Pattern 1: Loading de Página Completa

**Cenário**: Página com header + grid de cards

```tsx
// app/minha-pagina/loading.tsx
import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { PageContainer } from "@/components/layout/PageContainer";

export default function MinhaPageLoading() {
    return (
        <PageContainer>
            {/* Header */}
            <div className="mb-8">
                <Skeleton variant="text" className="w-48 h-8 mb-2" />
                <Skeleton variant="text" className="w-64 h-4" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <LoadingCard key={i} />
                ))}
            </div>
        </PageContainer>
    );
}
```

---

### Pattern 2: Loading em Botões

**Cenário**: Botão de submit em formulário

```tsx
"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

export function MeuFormulario() {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await salvarDados();
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading && <Spinner size="sm" color="white" />}
            {loading ? "Salvando..." : "Salvar"}
        </button>
    );
}
```

**Pontos importantes**:
- ✅ Sempre desabilite o botão durante loading
- ✅ Mostre spinner + texto descritivo
- ✅ Use `disabled:cursor-not-allowed` para UX
- ✅ Adicione `flex items-center gap-2` para alinhar spinner

---

### Pattern 3: Loading em Modais

**Cenário**: Modal com formulário

```tsx
"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";

export function MeuModal({ isOpen, onClose, onSave }) {
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave();
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Meu Modal"
            footer={
                <>
                    <button onClick={onClose}>Cancelar</button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        {loading && <Spinner size="sm" color="white" />}
                        {loading ? "Processando..." : "Salvar"}
                    </button>
                </>
            }
        >
            {/* Conteúdo do modal */}
        </Modal>
    );
}
```

---

### Pattern 4: Loading em Listas

**Cenário**: Lista que carrega dados incrementalmente

```tsx
"use client";

import { LoadingCard } from "@/components/ui/LoadingCard";

export function MinhaLista({ items, loading }) {
    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <LoadingCard key={i} variant="compact" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map(item => (
                <ItemCard key={item.id} {...item} />
            ))}
        </div>
    );
}
```

---

## ⚡ Otimização e Code Splitting com `next/dynamic`

O uso de `next/dynamic` (ou `React.lazy`) é fundamental para manter o bundle inicial leve, carregando componentes pesados apenas quando necessário.

### 🔝 Regras de Ouro (Best Practices)

Para que o Next.js consiga realizar o pré-carregamento (preloading) e a análise estática corretamente, siga estas regras:

1.  **Caminhos Estáticos**: O caminho dentro do `import()` deve ser uma **string literal explícita**.
    *   ❌ `dynamic(() => import(pathVariable))`
    *   ❌ `dynamic(() => import(\`./components/\${name}\`))`
    *   ✅ `dynamic(() => import("./FaturasTable"))`

2.  **Definição no Nível Superior (Top-level)**: Nunca chame `dynamic()` dentro de um componente ou renderização. Ela deve ser definida no escopo global do módulo.
    *   Isso permite que o Next.js associe os IDs de módulo e faça o preloading antes mesmo do componente ser montado.

3.  **Carregamento com Skeletons**: Sempre utilize a propriedade `loading` para fornecer uma transição visual suave que corresponda ao layout final.

### Exemplo de Implementação Padrão

```tsx
import dynamic from "next/dynamic";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

// 1. Definido fora do componente (Top-level)
// 2. Caminho estático explícito
// 3. Loading state configurado com Skeleton apropriado
const FaturasTable = dynamic(
    () => import("@/components/faturas/FaturasTable").then(mod => mod.FaturasTable),
    { 
        loading: () => <TableSkeleton rows={10} />,
        ssr: false // Opcional: desativa SSR se o componente for 100% client-side
    }
);

export function FaturasClient() {
    return (
        <div>
            <FaturasTable />
        </div>
    );
}
```

### Por que seguir estas regras?
*   **Static Analysis**: O Webpack/Next.js precisa saber exatamente quais arquivos separar em chunks durante o build.
*   **Preloading**: Ao definir no nível superior, o Next.js consegue "marcar" esse recurso para ser pré-carregado assim que a página pai começa a carregar.
*   **Layout Stability**: O uso de skeletons impede que a página "salte" (CLS - Cumulative Layout Shift) quando o componente termina de carregar.

---

## ✅ Checklist de Implementação

Ao adicionar loading states em uma nova feature:

### Para Páginas (Server Components)
- [ ] Criar `loading.tsx` na pasta da rota
- [ ] Replicar estrutura da página real (header, grid, etc)
- [ ] Usar `LoadingCard` para cards
- [ ] Usar `TableSkeleton` para tabelas
- [ ] Usar `Skeleton` para elementos customizados
- [ ] Testar navegação entre páginas

### Para Formulários/Modais (Client Components)
- [ ] Adicionar estado `loading` com `useState`
- [ ] Importar `Spinner` component
- [ ] Adicionar spinner no botão de submit
- [ ] Desabilitar botão durante loading
- [ ] Adicionar texto descritivo ("Salvando...", "Processando...")
- [ ] Adicionar classes `disabled:opacity-50 disabled:cursor-not-allowed`
- [ ] Testar submit do formulário

### Para Listas/Cards
- [ ] Criar variante apropriada de `LoadingCard`
- [ ] Mostrar quantidade realista de skeletons (3-6 items)
- [ ] Manter grid/layout consistente com versão real
- [ ] Testar transição de loading para conteúdo

---

## 🎨 Design Guidelines

### Cores
- Skeleton background: `bg-gray-200`
- Spinner primary: `border-primary`
- Spinner white: `border-white`

### Animações
- Padrão: `pulse` (fade in/out)
- Premium: `wave` (shimmer effect)
- Respeita `prefers-reduced-motion`

### Timing
- Skeleton: animação contínua
- Spinner: rotação 1s linear
- Transição para conteúdo: automática (Next.js)

### Quantidade de Skeletons
- **Listas**: 3-6 items
- **Grids**: múltiplo do número de colunas (6 para 3 colunas)
- **Tabelas**: 5-10 linhas

---

## 🚫 Erros Comuns

### ❌ Não fazer isso:

**1. Skeleton sem dimensões**
```tsx
// Ruim - não tem altura definida
<Skeleton variant="text" />

// Bom - altura definida
<Skeleton variant="text" className="h-4" />
```

**2. Loading sem feedback**
```tsx
// Ruim - usuário não sabe que está processando
<button onClick={handleSave}>Salvar</button>

// Bom - feedback visual claro
<button disabled={loading}>
    {loading && <Spinner size="sm" color="white" />}
    {loading ? "Salvando..." : "Salvar"}
</button>
```

**3. Skeleton diferente do conteúdo real**
```tsx
// Ruim - estrutura diferente da página real
<div className="grid grid-cols-2">
    <LoadingCard />
</div>

// Bom - mesma estrutura da página real
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
        <LoadingCard key={i} />
    ))}
</div>
```

**4. Botão não desabilitado durante loading**
```tsx
// Ruim - usuário pode clicar múltiplas vezes
<button onClick={handleSave}>
    {loading ? "Salvando..." : "Salvar"}
</button>

// Bom - botão desabilitado
<button onClick={handleSave} disabled={loading}>
    {loading ? "Salvando..." : "Salvar"}
</button>
```

---

## 📚 Exemplos Reais do Projeto

### Dashboard Loading
- **Arquivo**: `app/dashboard/loading.tsx`
- **Componentes**: 4 KPI cards + 2 sections com LoadingCards
- **Padrão**: Grid responsivo (1/2/4 colunas)

### Participantes Loading
- **Arquivo**: `app/participantes/loading.tsx`
- **Componentes**: Header + search bar + 6 LoadingCards
- **Padrão**: Grid responsivo (1/2/3 colunas)

### Cobranças Loading
- **Arquivo**: `app/cobrancas/loading.tsx`
- **Componentes**: Header + stats + TableSkeleton
- **Padrão**: Stats em grid + tabela

### ParticipantModal
- **Arquivo**: `components/modals/ParticipantModal.tsx`
- **Loading**: Spinner no botão + disabled state
- **Padrão**: Loading inline em modal

---

## 🔧 Customização

### Criar nova variante de LoadingCard

```tsx
// Em LoadingCard.tsx, adicione:
if (variant === "minha-variante") {
    return (
        <div className="bg-white p-6 rounded-2xl">
            <Skeleton variant="circular" width={60} height={60} />
            <Skeleton variant="text" className="w-full h-5 mt-4" />
            <Skeleton variant="text" className="w-3/4 h-3 mt-2" />
        </div>
    );
}
```

### Criar skeleton customizado

```tsx
export function MeuSkeleton() {
    return (
        <div className="bg-white p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1">
                    <Skeleton variant="text" className="w-2/3 h-5" />
                    <Skeleton variant="text" className="w-1/2 h-3 mt-2" />
                </div>
            </div>
            <Skeleton variant="rectangular" className="w-full h-32" />
        </div>
    );
}
```

---

## 📊 Resumo Rápido

| Componente | Quando Usar | Exemplo |
|------------|-------------|---------|
| **Skeleton** | Placeholders customizados | Texto, avatares, cards |
| **Spinner** | Loading inline | Botões, badges |
| **LoadingCard** | Cards pré-configurados | Listas de participantes |
| **TableSkeleton** | Tabelas de dados | Cobranças, relatórios |
| **loading.tsx** | Páginas inteiras | Todas as rotas principais |

---

## 🎯 Próximos Passos

Depois de implementar loading states:

1. **Teste com conexão lenta**: Chrome DevTools > Network > Slow 3G
2. **Verifique acessibilidade**: Screen reader anuncia loading?
3. **Valide design**: Skeleton parece com conteúdo real?
4. **Otimize performance**: Loading aparece rápido o suficiente?

---

## 📖 Referências

- [Next.js Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [Skeleton Screens](https://www.nngroup.com/articles/skeleton-screens/)
