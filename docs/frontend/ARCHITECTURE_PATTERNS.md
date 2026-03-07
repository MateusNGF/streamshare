# Padrão de Codificação: SOLID e Clean Code

Este documento define as diretrizes de desenvolvimento para o projeto StreamShare, focando na aplicação de princípios SOLID e padrões de Clean Code para garantir a manutenibilidade e escalabilidade do sistema.

---

## 🏗️ Princípios de Arquitetura

### 1. SRP: Responsabilidade Única (Single Responsibility Principle)
Cada componente ou função deve ter apenas um motivo para existir e mudar.

*   **Server Actions**: Localizadas em `src/actions/`, devem lidar apenas com a lógica de orquestração de dados e interação com o Banco de Dados.
*   **Hooks**: Localizados em `src/hooks/`, devem gerenciar apenas o estado local e efeitos de um contexto específico.
*   **Componentes de UI**: Devem focar na apresentação. Lógica complexa de formatação deve ser extraída para utilitários ou hooks.
*   **Gestão de Tabelas Complexas**: Componentes como `CobrancasTable` devem ser decompostos em sub-diretórios (ex: `items/`, `shared/`, `batch/`) para isolar a responsabilidade de cabeçalhos de grupo, linhas selecionáveis e componentes de resumo.

### 2. DRY (Don't Repeat Yourself) & Componentização
A lógica comum deve ser centralizada.

*   **Padrão de Tabelas**: Toda tabela complexa deve utilizar as células compartilhadas em `src/components/cobrancas/shared/BillingTableCells.tsx`.
    *   `BillingValueCell`: Centraliza a exibição de valores (ciclo vs mensal).
    *   `BillingDueDateCell`: Centraliza a lógica de cores e contadores de vencimento.
    *   `BillingPeriodCell`: Centraliza a formatação de períodos de vigência.

---

## 🧹 Clean Code Guidelines

### 1. Nomenclatura Semântica
*   **Booleano**: Use prefixos como `is`, `has`, `should` (ex: `isPaid`, `hasWhatsapp`).
*   **Funções de Evento**: No Client Component, use o prefixo `handle` (ex: `handleViewDetails`).
*   **Server Actions**: Use verbos de ação claros (ex: `getFaturasUsuario`, `confirmarPagamento`).

### 2. Funções Pequenas e Puras
Funções de utilidade devem ser puras, facilitando testes e reutilização.
*   Mantenha utilitários financeiros em `src/lib/financeiro-utils.ts`.
*   Mantenha formatação em `src/lib/formatCurrency.ts`.

### 3. Early Returns (Cláusulas de Guarda)
Evite aninhamento profundo de `if/else`.
```tsx
// ✅ Recomendado
if (!user) throw new Error("Não autenticado");
if (faturas.length === 0) return <EmptyState />;
return <DataTable />;
```

---

## ⚡ Padrão de Implementação de Features (Checklist)

Para cada nova tela de listagem/dashboard:
1.  **Action**: Criar funções de busca em `src/actions/` com tratamento de erro e autenticação via `getContext()`.
2.  **Client Component**: Separar a lógica de visualização em um componente `*Client.tsx`.
3.  **Table/Grid Mode**: Oferecer alternância entre visão de Tabela e visão de Cards quando apropriado para a UX.
4.  **Loading**: Implementar `loading.tsx` utilizando `TableSkeleton` ou `LoadingCard`.
5.  **Feedback**: Utilizar o hook `useToast` para todas as interações do usuário.

---

## 🛠️ Padrões de Estilização (Tailwind)

*   **Bordas de Destaque**: Use `border-l-4` com cores semânticas para cards de status (verde para pago, vermelho para atrasado, etc).
*   **Animações**: Utilize as classes customizadas do projeto (`animate-fade-in`, `animate-slide-in-from-left`, etc.) para entradas suaves de linhas e cards. Consulte o `DESIGN_SYSTEM.md` para a lista completa.
*   **Shadows**: Use `shadow-sm` para cards normais e `shadow-lg shadow-primary/25` para botões principais.
*   **Transições**: Use **exclusivamente** `ease-smooth` ou a classe global `.transition-smooth`. Para efeito de rebote em modais/tooltips, use `ease-bounce-in`. **Nunca** use `ease-in-out` ou curvas genéricas.

---

## 🎭 Coreografia de UI (Staggering)

> [!IMPORTANT]
> Ao renderizar **listas** ou **grids de cards** (participantes, faturas, streamings), é **obrigatório** usar animação com revelação progressiva (stagger) para criar uma experiência visual fluida.

### Como Implementar

1. Aplique uma animação de entrada (`animate-fade-in` ou `animate-slide-in-from-bottom`) a cada item da lista.
2. Combine com a classe de atraso sequencial correspondente ao índice do item.

**Classes de Atraso Disponíveis** (definidas em `globals.css`):

| Classe | Delay |
|---|---|
| `stagger-1` | 100ms |
| `stagger-2` | 200ms |
| `stagger-3` | 300ms |
| `stagger-4` | 400ms |
| `stagger-5` | 500ms |

### Exemplo de Implementação

```tsx
// ✅ Correto — revelação progressiva em lista de cards
{items.map((item, index) => (
  <Card
    key={item.id}
    className={`animate-fade-in opacity-0 fill-mode-forwards stagger-${Math.min(index + 1, 5)}`}
  >
    {/* conteúdo */}
  </Card>
))}
```

> [!TIP]
> Para listas com mais de 5 itens, limite o stagger a `stagger-5` (500ms). Itens além do 5º recebem todos o mesmo delay final, evitando esperas longas demais.

> [!NOTE]
> As classes `stagger-*` definem apenas `animation-delay`. Elas devem ser **sempre** combinadas com uma classe de animação (`animate-fade-in`, `animate-slide-in-from-bottom`, etc.). Sem a animação, o stagger sozinho não tem efeito visual.

---

## 🖥️ Diretivas Client/Server e Prevenção de Erros de Hidratação (Next.js)

### Regra: `"use client"` é Obrigatório em Componentes Interativos

Qualquer componente que use state, efeitos, event handlers, ou acesse APIs do navegador **deve** declarar `"use client"` como primeira linha do arquivo.

**Componentes que obrigatoriamente precisam de `"use client"`**:
- Botões com `onClick` (`Button.tsx`)
- Modais e overlays (`Modal.tsx`)
- Formulários com estado controlado
- Qualquer componente que use `useState`, `useEffect`, `useRef`

```tsx
// ✅ Correto — directive no topo do arquivo
"use client";

import { useState } from "react";
export function MeuComponente() { ... }

// ❌ Errado — componente interativo sem a diretiva (quebra o SSR)
import { useState } from "react"; // ← Server component não suporta hooks
export function MeuComponente() { ... }
```

---

### Padrão de Prevenção de Erros de Hidratação

Componentes que acessam `window`, `document`, ou renderizam Portais **não podem executar essa lógica no servidor**. O Next.js renderiza o HTML no servidor antes de hidratar no cliente — qualquer divergência causa um erro de hidratação.

**Padrão obrigatório** (implementado em `Modal.tsx`, deve ser replicado em outros casos):

```tsx
"use client";

import { useState, useEffect } from "react";

export function MeuComponenteComPortal() {
    const [mounted, setMounted] = useState(false);

    // ✅ Confirma que estamos no cliente antes de acessar DOM ou renderizar Portal
    useEffect(() => {
        setMounted(true);
    }, []);

    // ✅ Retorna null no servidor — sem erro de hidratação
    if (!mounted) return null;

    return (
        // Agora é seguro acessar window, document.body, createPortal, etc.
        <div>Conteúdo seguro para SSR</div>
    );
}
```

**Quando aplicar este padrão**:
- Componentes que chamam `createPortal`
- Componentes que leem `window.innerWidth`, `window.location`, etc.
- Componentes que modificam `document.body` (scroll lock, class injection)
- Componentes que dependem de valores calculados apenas no browser (ex: `localStorage`)

> **Referência**: O componente `Modal.tsx` é a implementação canônica deste padrão no projeto. Consulte-o como modelo.

