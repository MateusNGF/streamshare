# Guia de Padrões: Informações Financeiras na UI

Este documento estabelece os padrões visuais e de terminologia para a exibição de valores financeiros no dashboard, garantindo clareza para o administrador e consistência com o backend.

## 1. Terminologia Padrão

Para evitar confusão entre valores proporcionais e valores de cobrança real, utilize sempre os termos abaixo:

| Termo em Português | Contexto | Descrição |
|:---|:---|:---|
| **Custo Mensal** | Cards e Listas | O valor equivalente a 30 dias de serviço, independente da frequência de pagamento. |
| **Valor do Ciclo** | Modais e Detalhes | O valor total que será cobrado no próximo vencimento (Mensal, Trimestral, etc). |
| **Receita Mensal Estimada** | Dashboards/Resumos | Soma de todos os "Custos Mensais" ativos. |
| **Total Próxima Cobrança** | Resumo de Criação | Soma de todos os "Valores do Ciclo" que serão gerados imediatamente. |

## 2. Padrões de Exibição Visual

### 2.1. Sufixos de Periodicidade
Sempre inclua o sufixo de tempo para dar contexto ao valor, especialmente em grids:
- **Correto:** `R$ 15,90 / mês`
- **Incorreto:** `R$ 15,90` (sem contexto)

### 2.2. Destaque de Ciclo (Frequências Não-Mensais)
Quando uma assinatura for Trimestral, Semestral ou Anual, a UI deve mostrar tanto o custo mensal (para comparação) quanto o valor real da cobrança.

**Exemplo em Listagem (AssinaturaCard):**
- Principal: `R$ 15,00 / mês`
- Sub-texto (ou badge): `Ciclo Trimestral: R$ 45,00`

**Exemplo em Detalhes (DetalhesCobranca):**
- Valor Principal: `R$ 45,00`
- Badge de Contexto: `[Ciclo Trimestral]`

## 3. Implementação Técnica

### 3.1. Utilitários de Cálculo
**NUNCA** realize cálculos financeiros diretamente com `number` ou `parseFloat` na UI para somas complexas. Utilize a biblioteca centralizada:

```typescript
import { calcularTotalCiclo, arredondarMoeda } from "@/lib/financeiro-utils";

// Para exibir o valor total de um ciclo trimestral
const valorCobranca = calcularTotalCiclo(valorMensal, "trimestral");
```

### 3.2. Formatação
Utilize o hook `useCurrency` para garantir que o símbolo da moeda e separadores decimais sigam o padrão local.

```tsx
const { format } = useCurrency();
return <span>{format(valor)} / mês</span>;
```

## 4. Padrões de Tabelas (Grids)

As tabelas de Assinaturas e Cobranças foram padronizadas para oferecer uma densidade de informação alta com clareza visual.

### 4.1. Cabeçalhos Iconizados
Cada coluna deve possuir um ícone representativo (`lucide-react`, size 12) ao lado do título para facilitar o escaneamento visual.
- **Tipografia**: `text-[10px]`, `font-black`, `uppercase`, `tracking-wider`.
- **Cores**: Texto `gray-500`, Ícones `gray-400`.

### 4.2. Estrutura de Colunas (Assinaturas)
1. **Participante**: Nome e e-mail.
2. **Status**: Badge logo após o participante para visibilidade imediata.
3. **Serviço**: Logo do streaming + Apelido/Nome.
4. **Frequência**: Badge estilizada.
5. **Vigência**: Período em linha (`MMM/yy | MMM/yy`) com `whitespace-nowrap`.
6. **Valores**: Valor do ciclo e valor mensal (sub-texto).

### 4.3. Estrutura de Colunas (Cobranças)
1. **Ações**: Início da tabela para acesso rápido.
2. **Participante**: Identificação.
3. **Emissão**: Data de criação do registro.
4. **Período**: Datas de início e fim da vigência.
5. **Vencimento**: Data limite.
6. **Status**: Situação do pagamento.
7. **Valor**: Valor total da cobrança.

## 5. Checklist de UI para Novos Componentes
- [ ] O valor principal tem o sufixo `/ mês`?
- [ ] Os cabeçalhos de tabela possuem ícones de 12px e tipografia uppercase?
- [ ] A coluna de Status está posicionada estrategicamente?
- [ ] Os cálculos foram validados com `financeiro-utils.ts`?
