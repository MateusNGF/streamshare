# Padrão de Codificação: SOLID e Clean Code

Este documento define as diretrizes de desenvolvimento para o projeto StreamShare, focando na aplicação de princípios SOLID e padrões de Clean Code para garantir a manutenibilidade e escalabilidade do sistema.

---

## 🏗️ Princípios de Arquitetura

### 1. SRP: Responsabilidade Única (Single Responsibility Principle)
Cada componente ou função deve ter apenas um motivo para existir e mudar.

*   **Server Actions**: Localizadas em `src/actions/`, devem lidar apenas com a lógica de orquestração de dados e interação com o Banco de Dados.
*   **Hooks**: Localizados em `src/hooks/`, devem gerenciar apenas o estado local e efeitos de um contexto específico.
*   **Componentes de UI**: Devem focar na apresentação. Lógica complexa de formatação deve ser extraída para utilitários ou hooks.

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
*   **Animações**: Utilize as classes de `animate-in fade-in slide-in-from-left-4` para entradas suaves de linhas e cards.
*   **Shadows**: Use `shadow-sm` para cards normais e `shadow-lg shadow-primary/25` para botões principais.
