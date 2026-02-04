# Sistema de Moedas e Internacionalização

Este documento detalha a implementação do sistema financeiro multi-moeda do StreamShare, cobrindo desde a modelagem de dados até os componentes de interface.

## 📌 Visão Geral

O sistema permite que contas configurem uma **Moeda de Preferência** (BRL, USD, EUR). Esta configuração afeta:
1.  **Formatação Visual**: Como valores monetários são exibidos em toda a aplicação (R$, $, €).
2.  **Input de Dados**: O componente `CurrencyInput` se adapta automaticamente à moeda selecionada.
3.  **Persistência**: A preferência é salva no nível da `Conta` do usuário.

> **Nota**: O sistema atual trata a moeda como uma formatação. Não realizamos conversão cambial automática de valores já salvos no banco de dados. Um valor de `10.00` será exibido como `R$ 10,00` ou `$ 10.00` dependendo da preferência, mas o valor numérico absoluto é preservado.

---

## 🏗 Arquitetura

### Banco de Dados (Prisma)
- **Model `Conta`**: Novo campo `moedaPreferencia` (String, default: "BRL").
- **Tipos Decimais**: Campos monetários (`valor`, `valorIntegral`) utilizam `Decimal` no PostgreSQL para precisão financeira.

### Backend (Server Actions & Services)
- **Precisão Numérica**: Toda lógica de cálculo financeiro (cobranças, renovações) utiliza estritamente `Prisma.Decimal` para evitar erros de ponto flutuante típicos do JavaScript.
- **Casting Seguro**: Conversões para `number` (float) são feitas **apenas** na camada de apresentação ou agregação (ex: Dashboards), utilizando `.toNumber()`.

---

## 💻 Frontend

### 1. Hook `useCurrency`
Gerenciador de estado global (via Zustand) para a moeda da sessão atual.

```tsx
import { useCurrency } from "@/hooks/useCurrency";

export function MeuComponente() {
    const { 
        format,           // Função de formatação (ex: 10 => "R$ 10,00")
        currencyCode,     // Código atual (ex: "BRL")
        currencyInfo,     // Metadados (símbolo, locale)
        setCurrency       // Função para alterar moeda
    } = useCurrency();

    return <div>{format(150.50)}</div>;
}
```

### 2. Componente `CurrencyInput`
Input mascarado que respeita a moeda ativa. Baseado em `react-number-format`.

```tsx
import { CurrencyInput } from "@/components/ui/CurrencyInput";

<CurrencyInput
    value={valor}
    onValueChange={(values) => setValor(values.floatValue)}
    placeholder="0,00"
/>
```

### 3. Utilitário `formatCurrency`
Para uso fora de componentes React (ex: Server Components ou funções utilitárias).

```ts
import { formatCurrency } from "@/lib/formatCurrency";

// Uso em Server Component
const valorFormatado = formatCurrency(1234.56, 'USD'); // "$ 1,234.56"
```

---

## 🛠 Backend & Precisão (Decimal)

Para garantir integridade financeira, seguimos regras estritas no backend:

### Regra de Ouro
**NUNCA utilize `Number()` para cálculos de soma, subtração ou multiplicação de valores monetários.**

### Implementação Correta
Ao lidar com entradas de formulário ou dados do banco:

```ts
import { Prisma } from "@prisma/client";

// ✅ CORRETO: Instanciar Decimal
const valorDecimal = new Prisma.Decimal(data.valor.toString());
const total = valorDecimal.mul(2); // Multiplicação segura

// ❌ ERRADO: Casting inseguro
const valorNumber = Number(data.valor); // Risco de precisão float ex: 0.1 + 0.2 != 0.3
```

### Serviços Chave Refatorados
- `billing-service.ts`: Processamento de renovações.
- `assinaturas.ts`: Criação de assinaturas e validações.
- `streamings.ts`: Gestão de valores de serviços.

---

## 🔄 Fluxo de Desenvolvimento

Ao adicionar novas features financeiras:
1.  **Schema**: Use `Decimal` para novos campos de valor.
2.  **UI**: Use `CurrencyInput` para formulários e `useCurrency().format()` para exibição.
3.  **Actions**: Em Server Actions, converta inputs numéricos para `Prisma.Decimal` antes de qualquer cálculo.
