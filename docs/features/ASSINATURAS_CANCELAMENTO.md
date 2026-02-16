# Fluxos de Assinatura e Cancelamento - StreamShare

Este documento detalha o ciclo de vida das assinaturas no StreamShare, cobrindo criação, renovação, cancelamento e falhas de pagamento. O objetivo é fornecer um guia claro do comportamento do sistema em cada cenário.

## 🔄 Visão Geral do Ciclo de Vida

O StreamShare utiliza o Stripe para gerenciar pagamentos recorrentes. O estado da assinatura é espelhado no banco de dados local da aplicação para garantir performance e permitir consultas offline (sem bater na API do Stripe a cada request).

### Estados Principais (Banco de Dados)
- **Ativa**: `plano != 'free'` E `stripeSubscriptionStatus = 'active'`.
- **Cancelada (Agendada)**: `stripeCancelAtPeriodEnd = true`. O acesso continua até o fim do período.
- **Expirada/Cancelada (Definitivo)**: `plano = 'free'`.

---

## 📚 Casos de Uso Detalhados

### 1. Assinatura Inicial (Checkout)
O usuário escolhe um plano e completa o pagamento no Stripe Checkout.

- **Ação do Usuário**: Seleciona plano -> Paga no Stripe.
- **Processamento**:
  1. O Stripe envia o evento `checkout.session.completed`.
  2. O sistema identifica a conta pelo `metadata.contaId`.
  3. **Atualização no Banco**:
     - `stripeSubscriptionId`: Salva o ID da nova assinatura.
     - `stripeCustomerId`: Salva o ID do cliente.
     - `plano`: Atualiza para o plano escolhido (ex: 'pro').
     - `stripeSubscriptionStatus`: Define como 'active'.
     - `stripeCancelAtPeriodEnd`: **Define como `false`** (Reset importante para re-assinaturas).
  4. O usuário ganha acesso imediato aos recursos Pro.

### 2. Cancelamento Voluntário (Pelo Usuário)
O usuário decide parar a renovação automática, mas mantém o acesso pelo tempo que já pagou.

- **Ação do Usuário**: Configurações -> Conta -> Botão "Cancelar Assinatura".
- **Processamento**:
  1. O frontend chama a Server Action `cancelSubscriptionAction`.
  2. A Action valida permissões (apenas Admin/Owner).
  3. Chama a API do Stripe: `stripe.subscriptions.update(id, { cancel_at_period_end: true })`.
  4. Atualiza o banco local: `stripeCancelAtPeriodEnd = true`.
- **Resultado na UI**:
  - O botão muda para "Reativar Assinatura".
  - Um badge "Cancelada (expira em...)" é exibido.
  - **O acesso Pro continua normal**.

### 3. Reativação de Assinatura
O usuário se arrepende do cancelamento antes do fim do período e decide continuar.

- **Ação do Usuário**: Configurações -> Conta -> Botão "Reativar Assinatura".
- **Processamento**:
  1. O frontend chama a Server Action `reactivateSubscriptionAction`.
  2. Chama a API do Stripe: `stripe.subscriptions.update(id, { cancel_at_period_end: false })`.
  3. Atualiza o banco local: `stripeCancelAtPeriodEnd = false`.
- **Resultado na UI**:
  - O status volta ao normal. A renovação ocorrerá normalmente na data prevista.

### 4. Término do Período (Finalização do Cancelamento)
Chega a data de renovação de uma assinatura cancelada. O Stripe encerra a assinatura.

- **Gatilho**: O tempo passa e a data de fim do período é atingida.
- **Processamento**:
  1. O Stripe envia o evento `customer.subscription.deleted`.
  2. O sistema busca a conta pelo `stripeSubscriptionId`.
  3. **Atualização no Banco**:
     - `plano`: Reverte para 'free'.
     - `stripeSubscriptionStatus`: Atualiza para 'canceled'.
  4. Uma notificação é gerada para o usuário informando o fim do acesso.

### 5. Falha no Pagamento (Inadimplência)
O Stripe tenta renovar, mas o cartão falha (sem limite, expirado, etc.).

- **Gatilho**: Tentativa de cobrança falha.
- **Comportamento do Stripe**:
  - Tenta cobrar novamente segundo as regras configuradas no Dashboard (Smart Retries).
  - O status da assinatura muda para `past_due` (vencida) ou `unpaid`.
- **Processamento**:
  1. O Stripe envia `customer.subscription.updated`.
  2. O sistema atualiza `stripeSubscriptionStatus` no banco (ex: para 'past_due').
  3. **Lógica de Bloqueio (Opcional/Futuro)**:
     - Atualmente, o sistema apenas atualiza o status. Se o status não for 'active', o frontend pode bloquear recursos ou mostrar um aviso de pagamento pendente.
     - *Recomendação*: Se `stripeSubscriptionStatus` for `past_due`, mostrar banner de "Pagamento Pendente" mas talvez manter acesso por alguns dias (grace period) ou bloquear imediatamente dependendo da regra de negócio.

---

## 🛠 Verificação de Implementação

Status da implementação atual vs. Documentação:

| Caso de Uso | Implementado? | Observações |
|-------------|---------------|-------------|
| Assinatura Inicial | ✅ Sim | Webhook `checkout.session.completed` configurado. |
| Cancelamento Voluntário | ✅ Sim | Action e UI implementadas. |
| Reativação | ✅ Sim | Action e UI implementadas. |
| Término (Downgrade) | ✅ Sim | Webhook `customer.subscription.deleted` reverte para free. |
| Sincronização de Status | ✅ Sim | Webhook `customer.subscription.updated` mantém status local. |

### Pontos de Atenção Verificados
- **Reset de Flag**: Foi verificado e corrigido um caso onde se o usuário cancelasse e depois assinasse novamente, a flag de cancelamento poderia ficar "presa". O webhook de checkout agora força `stripeCancelAtPeriodEnd = false`.
- **Segurança**: As ações de cancelamento exigem permissão de 'owner' ou 'admin' verificada no banco de dados.
