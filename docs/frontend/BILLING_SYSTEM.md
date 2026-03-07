# Sistema de Faturamento - Frontend

Este documento descreve a arquitetura e os componentes que compõem o sistema de faturamento no frontend da StreamShare.

## 🏗️ Arquitetura Financeira

A lógica de faturamento é centralizada para garantir que cálculos de arredondamento, lucros e totais de ciclo sejam consistentes em toda a aplicação.

### 1. Camada de Lógica (`src/lib/financeiro-utils.ts`)
Contém as funções puras de cálculo.
- `arredondarMoeda(valor)`: Garante precisão de 2 casas decimais usando `Math.round`.
- `calcularCustoBase(valorIntegral, limite)`: Calcula o custo por vaga.
- `calcularLucroMensal(valorAtual, custoBase)`: Define a margem de lucro por assinatura.
- `calcularTotalCiclo(valorMensal, frequencia)`: Calcula o valor total a ser cobrado baseada no intervalo.

---

## 🪝 Hooks Customizados

### `useBillingCalculations`
**Localização**: `src/hooks/useBillingCalculations.ts`

Este hook abstrai a complexidade dos cálculos financeiros para os componentes de UI.

**Inputs**:
- `valorIntegral`: Valor total do plano de streaming.
- `limiteParticipantes`: Capacidade total do streaming.
- `valorAtual`: O valor mensal que está sendo configurado para o usuário.
- `frequencia`: O intervalo de cobrança (`mensal`, `trimestral`, etc).

**Outputs**:
- `custoBase`: O custo unitário calculado.
- `lucroMensal`: A margem de lucro calculada.
- `totalCiclo`: O valor total que o sistema gerará na cobrança baseada na frequência.
- `temLucro`: Boolean indicando se a margem é positiva.

---

## 🖥️ Componentes de Interface

### `AssinaturaModal`
Modal para criação de assinatura individual. Utiliza o hook `useBillingCalculations` para exibir indicadores de transparência financeira (Lucro/Custo) enquanto o administrador digita o valor.

- **Validação de Capacidade**: Monitora em tempo real se a soma das vagas solicitadas ultrapassa o limite disponível em qualquer um dos streamings selecionados.

### `BatchActionBar`
**Localização**: `src/components/cobrancas/BatchActionBar.tsx`
Barra flutuante inteligente que orquestra a jornada de "Carrinho Financeiro".
- **Modos de Operação**: Alterna labels e ações entre Administrador ("Gerar Lote") e Participante ("Pagar Selecionadas").
- **Psicologia Financeira**: Exibe sub-textos de alívio ("Você está quitando X faturas") para aumentar a conversão.

### `BatchPreviewDrawer`
Painel lateral de revisão final. Permite conferir os itens do lote e visualizar a prévia da mensagem de WhatsApp antes do disparo definitivo.

### `LoteCompositionStrip`
Componente visual que utiliza as logos dos streamings (`StreamingLogo`) para resumir a composição de um lote em modais de pagamento.

### `CurrencyInput`
**Localização**: `src/components/ui/CurrencyInput.tsx`
Componente essencial que garante que as entradas de valor sigam o formato monetário correto, integrando-se nativamente com a reatividade do sistema de faturamento.

---

## 📋 Padrões de Implementação

Ao adicionar novas funcionalidades de faturamento, siga estes padrões:
1. **Sempre use o `CurrencyInput`** para campos de valor.
2. **Utilize o hook `useBillingCalculations`** em vez de fazer cálculos manuais no JSX.
3. **Exiba o ciclo de pagamento** sempre que a frequência não for mensal para evitar confusão do administrador.
4. **Mantenha a transparência financeira**: O administrador deve sempre ver o custo base e o lucro potencial.
