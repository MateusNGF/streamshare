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
