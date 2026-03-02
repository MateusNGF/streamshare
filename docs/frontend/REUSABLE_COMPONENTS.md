# Componentes Reutilizáveis - Design System

## 📦 Visão Geral

Componentes criados para eliminar duplicação de código e garantir consistência em todas as páginas da aplicação.

---

## 🔴 Regra Fundamental: Botões

> **É terminantemente proibido criar `<button>` com classes Tailwind soltas na aplicação.** Use exclusivamente o componente `Button` de `@/components/ui/Button`.

---

## 🖱️ Componente Button

**Localização**: `src/components/ui/Button.tsx`

**Propósito**: Componente padrão para todas as ações interativas da aplicação. Consolida estilos, micro-interações e acessibilidade em um único lugar.

### Interface

```typescript
import { Button } from "@/components/ui/Button";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
    size?:    "default" | "sm" | "lg" | "icon";
}
```

### Variantes (obrigatório usar uma delas)

| Variante | Uso | Aparência |
| :--- | :--- | :--- |
| `default` | Ação principal da tela | Fundo primário roxo + sombra roxa, elevação no hover |
| `secondary` | Ação secundária | Fundo cinza claro, elevação no hover |
| `outline` | Ação alternativa ou filtros | Borda sutil, fundo transparente, elevação no hover |
| `ghost` | Ação discreta (ex: fechar, ícone) | Sem borda/fundo, hover cinza suave |
| `destructive` | Exclusão ou ação irreversível | Fundo vermelho + sombra vermelha, elevação no hover |

```tsx
// ✅ Correto — Usar variantes do Design System
<Button variant="default">Salvar</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="outline">Filtrar</Button>
<Button variant="ghost">Fechar</Button>
<Button variant="destructive">Excluir Conta</Button>

// ❌ Errado — NUNCA criar botão com classes Tailwind avulsas
<button className="bg-primary text-white px-6 py-3 rounded-2xl">Salvar</button>
```

### Tamanhos

| Tamanho | Prop | Padding / Uso |
| :--- | :--- | :--- |
| Padrão | `size="default"` | `px-6 py-3` — Uso geral |
| Pequeno | `size="sm"` | `px-4 py-2 text-sm` — Tabelas, badges de ação |
| Grande | `size="lg"` | `px-8 py-4 text-lg` — CTAs em destaque |
| Ícone | `size="icon"` | `p-2` — Botões apenas com ícone (sem label) |

```tsx
<Button size="lg" variant="default">Criar Assinatura</Button>
<Button size="sm" variant="outline">Ver Detalhes</Button>
<Button size="icon" variant="ghost"><Trash2 size={16} /></Button>
```

### Micro-interações embutidas (não recriar)

O componente já inclui os seguintes comportamentos — **nunca tente replicá-los com CSS manual:**

- **Clique que "afunda"**: `active:scale-95` — O botão encolhe levemente ao ser pressionado.
- **Elevação no hover**: `hover:-translate-y-0.5` — Sobe suavemente ao passar o mouse (exceto `ghost`).
- **Desativação nativa**: `disabled:opacity-50 disabled:pointer-events-none` — Ao receber `disabled`, fica semi-transparente e bloqueia todos os eventos.
- **Transição suave**: `transition-all duration-200 ease-smooth` — Todas as animações usam a curva de easing padrão do Design System.

### Suporte a `ref` (forwardRef)

O componente encaminha `ref` nativamente. Isso o torna seguro para uso com:
- Bibliotecas de formulários (`react-hook-form`, `formik`)
- Bibliotecas de animação (`framer-motion`)
- Componentes de popover/tooltip que precisam de referência DOM

```tsx
const btnRef = useRef<HTMLButtonElement>(null);
<Button ref={btnRef} variant="default">Ancorado</Button>
```

### Loading State

```tsx
// Padrão para botões com ação assíncrona
<Button variant="default" disabled={isLoading}>
    {isLoading && <Spinner size="sm" color="white" />}
    {isLoading ? "Salvando..." : "Salvar"}
</Button>
```

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

### SectionHeader

**Localização**: `src/components/layout/SectionHeader.tsx`

**Propósito**: Header para seções dentro de uma página, com título, descrição opcional e elemento à direita. Ideal para encabeçar tabelas ou listas.

**Props**:
```typescript
interface SectionHeaderProps {
    title: string;           // Obrigatório
    description?: string;    // Opcional
    rightElement?: ReactNode; // Opcional (ex: toggle, botões)
}
```

**Uso**:
```tsx
<SectionHeader
    title="Histórico de Cobranças"
    description="Veja todos os pagamentos realizados"
    rightElement={<ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />}
/>
```

---

### KPIGrid & KPIGridItem

**Localização**: `src/components/dashboard/KPIGrid.tsx`

**Propósito**: Container para cards de métricas (KPIs) com scroll horizontal automático no mobile e grid responsivo no desktop. Ideal para visibilidade financeira sem poluir o scroll vertical no celular.

**Props (KPIGrid)**:
```typescript
interface KPIGridProps {
    children: ReactNode;
    cols?: 1 | 2 | 3 | 4; // Número de colunas no desktop (Padrão: 4)
    className?: string;
}
```

**Uso**:
```tsx
<KPIGrid cols={4}>
    <KPIGridItem>
        <KPIFinanceiroCard {...props} />
    </KPIGridItem>
    <KPIGridItem className="animate-scale-in" style={{ animationDelay: '150ms' }}>
        <KPICard {...props} />
    </KPIGridItem>
</KPIGrid>
```

**Características**:
- Scroll horizontal com `snap scrolling` no mobile.
- Padding vertical de segurança (`py-10`) para não cortar sombras dos cards.
- Suporte nativo a animações de entrada via `KPIGridItem`.

---

### ViewModeToggle

**Localização**: `src/components/ui/ViewModeToggle.tsx`

**Propósito**: Componente para alternar a visualização de uma lista entre modo Tabela e modo Grid (Cards).

**Props**:
```typescript
type ViewMode = "table" | "grid";

interface ViewModeToggleProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}
```

**Uso**:
```tsx
const [viewMode, setViewMode] = useState<ViewMode>("table");

return (
    <ViewModeToggle
        viewMode={viewMode}
        setViewMode={setViewMode}
    />
);
```

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

## 🔔 Sistema de Toasts e Notificações

### ToastProvider

**Localização**: `src/contexts/ToastContext.tsx`

**Propósito**: Context Provider para gerenciar estado global de notificações.

**Setup**: Já configurado em `app/layout.tsx` - não é necessário adicionar novamente.

---

### useToast Hook

**Localização**: `src/hooks/useToast.ts`

**Propósito**: Hook customizado para disparar notificações de sucesso, erro, aviso e informação.

**Interface**:
```typescript
const toast = useToast();

// Métodos disponíveis
toast.success(message: string, duration?: number);
toast.error(message: string, duration?: number);
toast.warning(message: string, duration?: number);
toast.info(message: string, duration?: number);
toast.hide(id: string);
toast.clearAll();
```

**Uso Básico**:
```tsx
"use client";

import { useToast } from "@/hooks/useToast";

export function MeuComponente() {
    const toast = useToast();

    const handleSave = async () => {
        try {
            // Operação...
            toast.success("Dados salvos com sucesso!");
        } catch (error) {
            toast.error("Erro ao salvar dados");
        }
    };

    return <button onClick={handleSave}>Salvar</button>;
}
```

**Exemplos por Tipo**:

```tsx
// Sucesso - Operações concluídas
toast.success("Participante criado com sucesso!");
toast.success("5 assinaturas criadas!");

// Erro - Falhas e validações
toast.error("CPF ou WhatsApp já estão em uso");
toast.error("Erro ao atualizar streaming");

// Warning - Avisos importantes
toast.warning("Atenção: Esta ação é irreversível");
toast.warning("Limite de vagas quase atingido");

// Info - Informações gerais
toast.info("Link do WhatsApp aberto! Envie a mensagem manualmente.");
toast.info("Dados sincronizados");
```

**Duração Customizada**:
```tsx
// Toast com duração customizada (em ms)
toast.success("Operação concluída", 3000); // 3 segundos
toast.error("Erro crítico", 10000); // 10 segundos
toast.info("Mensagem importante", 7500); // 7.5 segundos
```

---

### Componentes de Toast

#### ToastItem

**Localização**: `src/components/ui/ToastItem.tsx`

**Propósito**: Componente individual de toast com animações.

**Variantes**:
- **Success**: Ícone CheckCircle, fundo verde claro
- **Error**: Ícone XCircle, fundo vermelho claro
- **Warning**: Ícone AlertTriangle, fundo amarelo claro
- **Info**: Ícone Info, fundo azul claro

**Características**:
- Animação de entrada (slide from right)
- Animação de saída (fade out)
- Botão de fechar manual
- Auto-dismiss após duração configurada

#### ToastContainer

**Localização**: `src/components/ui/ToastContainer.tsx`

**Propósito**: Container fixo que renderiza todos os toasts ativos.

**Posicionamento**: Fixed, top-right (top-4 right-4)
**Z-Index**: 50 (acima de modais e overlays)

---

### Boas Práticas

#### ✅ Fazer

```tsx
// Mensagens claras e acionáveis
toast.success("Streaming criado com sucesso!");
toast.error("CPF inválido. Verifique o formato.");

// Usar o tipo correto
toast.success("Pagamento confirmado");    // ✅ Operação bem-sucedida
toast.error("Falha ao processar");        // ✅ Erro
toast.info("3 notificações enviadas");    // ✅ Informação
toast.warning("Dados serão perdidos");    // ✅ Aviso

// Mensagens contextuais
const count = 5;
toast.success(`${count} assinatura${count > 1 ? 's' : ''} criadas!`);
```

#### ❌ Evitar

```tsx
// Mensagens genéricas
toast.error("Erro");                       // ❌ Muito vaga
toast.success("OK");                       // ❌ Pouco informativa

// Tipo incorreto
toast.success("Erro ao salvar");           // ❌ Contradição
toast.error("Dados salvos");               // ❌ Tipo errado

// Mensagens técnicas para usuário
toast.error("NullPointerException");       // ❌ Jargão técnico
toast.error(JSON.stringify(error));        // ❌ Não é user-friendly
```

---

### Exemplos Reais do Projeto

#### CRUD de Participantes
```tsx
const handleAdd = async (data) => {
    try {
        await createParticipante(data);
        toast.success("Participante criado com sucesso!");
        setIsModalOpen(false);
    } catch (error) {
        toast.error("CPF ou WhatsApp já estão em uso");
    }
};

const handleEdit = async (data) => {
    try {
        await updateParticipante(id, data);
        toast.success("Participante atualizado com sucesso!");
    } catch (error) {
        toast.error("Erro ao atualizar participante");
    }
};

const handleDelete = async () => {
    try {
        await deleteParticipante(id);
        toast.success("Participante excluído com sucesso!");
    } catch (error) {
        toast.error("Erro ao excluir participante");
    }
};
```

#### Notificações de Cobrança
```tsx
const handleEnviarWhatsApp = async (cobrancaId) => {
    try {
        const result = await enviarNotificacaoCobranca(cobrancaId);
        
        if (result.manualLink) {
            window.open(result.manualLink, '_blank');
            toast.info("Link do WhatsApp aberto! Envie a mensagem manualmente.");
        } else {
            toast.success("Notificação WhatsApp enviada automaticamente!");
        }
    } catch (error) {
        toast.error(error.message || "Erro ao enviar notificação");
    }
};
```

#### Assinaturas Múltiplas
```tsx
const handleCreateMultiple = async (data) => {
    try {
        const result = await createMultipleAssinaturas(data);
        const message = `${result.created} assinatura${result.created > 1 ? 's' : ''} criadas!`;
        toast.success(message);
        setIsModalOpen(false);
    } catch (error) {
        toast.error(error.message || 'Falha ao criar assinaturas');
    }
};
```

#### Streaming com Validação
```tsx
const handleEdit = async (data) => {
    try {
        const result = await updateStreaming(id, data);
        
        if (result.updatedSubscriptions && result.updatedSubscriptions > 0) {
            toast.success(`Streaming atualizado! ${result.updatedSubscriptions} assinatura(s) atualizadas.`);
        } else {
            toast.success("Streaming atualizado com sucesso!");
        }
    } catch (error) {
        const errorMessage = error?.message || "Erro ao atualizar streaming";
        toast.error(errorMessage);
    }
};
```

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
