# Guia de Integração Stripe - StreamShare

Este documento detalha como configurar, testar e manter a integração de pagamentos com Stripe no StreamShare.

> Para detalhes sobre o ciclo de vida das assinaturas (Renovação, Cancelamento, Falhas), consulte: [Fluxos de Assinatura e Cancelamento](../features/ASSINATURAS_CANCELAMENTO.md)

---

## 📋 Pré-requisitos

- Conta no [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe CLI](https://stripe.com/docs/stripe-cli) instada (para testes locais)
- Node.js instalado

---

## 🚀 Configuração Inicial

### 1. Obter Chaves de API

No Dashboard do Stripe (Modo Teste):
1.  Vá em **Developers** > **API keys**.
2.  Copie a **Publishable key** (`pk_test_...`).
3.  Copie a **Secret key** (`sk_test_...`).

### 2. Configurar Variáveis de Ambiente

No arquivo `.env` (na raiz e/ou `apps/web/.env`):

```bash
# Stripe Public Key (Frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Stripe Secret Key (Backend)
STRIPE_SECRET_KEY="sk_test_..."

# Webhook Secret (Será gerado no passo 4)
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## 📦 Configuração de Produtos

O sistema depende de IDs de preços (`Price IDs`) para criar sessões de checkout.

### 1. Criar Produto "Pro"
1.  No Dashboard, vá em **Catálogo de produtos**.
2.  Clique em **+ Adicionar produto**.
3.  **Nome**: StreamShare Pro.
4.  **Preço**: 29,90 BRL / Mês (Recorrente).
5.  Salve e copie o **ID do Preço** (começa com `price_`... NÃO confunda com ID do Produto `prod_`).

### 2. Criar Produto "Business"
1.  Repita o processo para o produto Business.
2.  **Nome**: StreamShare Business.
3.  **Preço**: 99,90 BRL / Mês (Recorrente).
4.  Salve e copie o **ID do Preço**.

### 3. Atualizar Configuração
Adicione os IDs gerados ao seu `.env` e ao arquivo de configuração:

**Arquivo `.env`**:
```bash
NEXT_PUBLIC_STRIPE_PRICE_PRO="price_pro_id..."
NEXT_PUBLIC_STRIPE_PRICE_BUSINESS="price_business_id..."
```

**Arquivo `apps/web/src/config/plans.ts`**:
O código já lê automaticamente as variáveis de ambiente.

> **Nota**: O plano **Free** é gratuito e não requer ID.

---

## 🔄 Webhooks (Atualizações em Tempo Real)

O StreamShare usa webhooks para sincronizar o status da assinatura com o banco de dados.

### Eventos Escutados
| Evento | Ação no Banco de Dados |
|--------|------------------------|
| `checkout.session.completed` | Atualiza usuário com `stripeSubscriptionId` e muda plano. |
| `customer.subscription.updated` | Atualiza status (`active`, `past_due`, etc.) e `cancel_at_period_end` na tabela `Conta`. |
| `customer.subscription.deleted` | Reverte a conta para o plano `free`. |

### Testando Webhooks Localmente (Stripe CLI)

1.  **Login na CLI**:
    ```bash
    stripe login
    ```

2.  **Encaminhar eventos para localhost**:
    ```bash
    stripe listen --forward-to localhost:3000/api/webhooks/stripe
    ```

3.  **Copiar o Webhook Secret**:
    A CLI exibirá algo como: `Ready! Your webhook signing secret is whsec_...`
    Copie esse valor para a variável `STRIPE_WEBHOOK_SECRET` no seu `.env`.

4.  **Disparar eventos de teste**:
    Em outra aba do terminal:
    ```bash
    stripe trigger checkout.session.completed
    ```

---

## 🧪 Fluxo de Teste Manual

### Assinatura
1.  Certifique-se que o projeto está rodando (`pnpm dev`).
2.  Inicie o listener do Stripe (`stripe listen ...`).
3.  Acesse `http://localhost:3000/planos`.
4.  Selecione o plano **Profissional** ou **Business**.
5.  Confirme no modal.
6.  No Checkout do Stripe, use os cartões de teste:
    -   **Número**: `4242 4242 4242 4242`
    -   **Validade**: Qualquer data futura
    -   **CVC**: Qualquer 3 dígitos
7.  Após sucesso, verifique se você foi redirecionado e se o plano mudou no Dashboard.

### Cancelamento
1.  Acesse `http://localhost:3000/configuracoes` (aba Conta).
2.  Clique em **Cancelar Assinatura**.
3.  Confirme a ação no modal.
4.  Verifique:
    -   O botão muda para **Reativar Assinatura**.
    -   Aparece um badge "Cancelada (expira no fim do ciclo)".
    -   No banco de dados, `stripeCancelAtPeriodEnd` deve ser `true`.
5.  Para reativar, clique em **Reativar Assinatura** e verifique se o status volta ao normal.

---

## ⚠️ Produção

Quando for para produção (Live Mode):

1.  Crie os produtos novamente no Dashboard (modo Live).
2.  Atualize as variáveis de ambiente (`STRIPE_KEY`, `PRICE_ID`, ect) com os valores Live.
3.  Configure o Endpoint de Webhook no Dashboard do Stripe apontando para sua URL real (`https://sua-app.com/api/webhooks/stripe`).
4.  Selecione os eventos necessários (`checkout.session.completed`, `customer.subscription.*`).

---

- `apps/web/src/app/api/webhooks/stripe/route.ts`: Handler do Webhook.

---

## 🔧 Solução de Problemas (Troubleshooting)

### 1. Webhook não recebe eventos ("não cai no terminal")
Se o checkout funciona mas você não vê logs no terminal do `stripe listen` nem no Next.js:

*   **Causa provável**: A CLI do Stripe está logada em uma conta diferente daquela que gerou as chaves API (`pk_test`, `sk_test`).
*   **Diagnóstico**:
    1.  Pare o listener.
    2.  Rode `stripe config --list` e veja o `account_id`.
    3.  Compare com o ID da conta no Dashboard do Stripe.
*   **Solução**: Rode `stripe login` novamente e autorize a conta correta.

### 2. Erro "Webhook Error: No signatures found matching the expected signature"
*   **Causa**: O `STRIPE_WEBHOOK_SECRET` no arquivo `.env` está diferente do segredo que o `stripe listen` está usando.
*   **Solução**:
    1.  Copie o segredo que aparece no terminal quando você inicia o `stripe listen` (`whsec_...`).
    2.  Atualize o arquivo `.env`.
    3.  Reinicie o servidor Next.js (`pnpm dev`).

### 3. Erro 405 Method Not Allowed
*   **Causa**: Tentar acessar `http://localhost:3000/api/webhooks/stripe` pelo navegador.
*   **Solução**: Não abra esse link. Ele serve apenas para o comando `--forward-to`. Webhooks aceitam apenas POST.
