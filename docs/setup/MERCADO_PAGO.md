# Guia de Configuração Mercado Pago - StreamShare v2

Este guia fornece os passos necessários para configurar e integrar sua conta do Mercado Pago à plataforma StreamShare v2, garantindo o funcionamento correto de cobranças recorrentes, planos SaaS e pagamentos via PIX.

---

## 1. 🔑 Obtenção das Credenciais

Para que o StreamShare possa processar pagamentos, você precisará de um **Access Token** de produção. Siga os passos abaixo:

### Passo 1: Conta Mercado Pago
- Certifique-se de possuir uma conta de **Vendedor** ou **Empresarial** (CNPJ ou CPF com perfil profissional).
- Verifique se sua conta está com o cadastro completo e validado no [Mercado Pago](https://www.mercadopago.com.br).

### Passo 2: Criar a Aplicação
1.  Acesse o [Painel do Desenvolvedor do Mercado Pago](https://www.mercadopago.com.br/developers/panel/app).
2.  Clique no botão **"Criar aplicação"**.
3.  Preencha os dados:
    - **Nome da aplicação**: `StreamShare-Financeiro` (ou o nome da sua marca).
    - **Tipo de solução**: Selecione **"Pagamentos online"**.
    - **Plataforma de e-commerce?**: Selecione **"Não"**.
    - **Qual solução você está integrando?**: Selecione **"Checkout Pro"** ou **"Checkout API"** (usamos ambos via SDK).
4.  Aceite os termos e clique em **"Criar aplicação"**.

### Passo 3: Ativar Credenciais
1.  Dentro da sua aplicação recém-criada, clique em **"Credenciais de produção"** no menu lateral.
2.  Poderá ser solicitado um breve formulário de ativação (indicação de site e ramo de atividade).
3.  Após a ativação, você verá o campo **Access Token**.
4.  Copie o código que inicia com `APP_USR-...`.

> [!CAUTION]
> **Segurança Crítica**: O Access Token dá controle total sobre as transações da sua conta. Nunca o salve no GitHub em arquivos públicos. Use sempre o arquivo `.env` ignorado pelo Git.

---

## 🏗️ 2. Configuração de Variáveis de Ambiente

No seu arquivo `.env` (ou no painel da Vercel/Hospedagem), configure todas as chaves abaixo:

```env
# ── Autenticação SDK (server-only) ──────────────────────────────
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxx

# ── Webhooks ─────────────────────────────────────────────────────
MERCADOPAGO_WEBHOOK_SECRET=seu_segredo_gerado_pelo_mp
MERCADOPAGO_WEBHOOK_URL=https://seudominio.com.br/api/webhooks/mercado-pago

# ── Planos SaaS — IDs do PreApproval ─────────────────────────────
# ⚠️  Use MERCADOPAGO_PLAN_* (server-only), nunca NEXT_PUBLIC_ para IDs de plano
MERCADOPAGO_PLAN_PRO=2c938084...
MERCADOPAGO_PLAN_BUSINESS=2c938084...

# ── URL pública do app — obrigatória nas back_urls do MP ─────────
NEXT_PUBLIC_URL=https://seudominio.com.br

# ── Cron Job — protege /api/cron/billing ─────────────────────────
CRON_SECRET=senha-forte-aqui
```

| Variável | Obrigatória | Para quê |
|----------|:-----------:|---------|
| `MERCADOPAGO_ACCESS_TOKEN` | ✅ | Autenticação de todas as chamadas ao SDK |
| `MERCADOPAGO_WEBHOOK_SECRET` | ✅ | Validação HMAC-SHA256 dos eventos recebidos |
| `MERCADOPAGO_WEBHOOK_URL` | ✅ | URL de notificação registrada no painel MP |
| `MERCADOPAGO_PLAN_PRO` | ✅ | ID do PreApproval Plan do Plano Pro |
| `MERCADOPAGO_PLAN_BUSINESS` | ⚠️ | ID do PreApproval Plan do Plano Business |
| `NEXT_PUBLIC_URL` | ✅ | `back_urls` de sucesso/erro/pendente |
| `CRON_SECRET` | ✅ | Autorização Bearer do endpoint de cron |

---

## 🛒 3. Configuração dos Planos SaaS (Sustentação da Plataforma)

Para vender os planos **Pro** e **Business** dentro do StreamShare, você precisa criar os planos de assinatura (*Pre-approvals*) no Mercado Pago.

1.  Acesse a [seção de Assinaturas](https://www.mercadopago.com.br/subscriptions/plans) no Mercado Pago.
2.  Crie dois planos com as seguintes recomendações:
    *   **Plano Pro**: Mensal - R$ 29,90.
MERCADOPAGO_PLAN_PRO=PLAN_ID_PRO
MERCADOPAGO_PLAN_BUSINESS=PLAN_ID_BUSINESS

O Webhook é o que permite ao StreamShare saber quando um pagamento foi aprovado instantaneamente.

1.  No Painel do Desenvolvedor, vá em **Webhooks**.
2.  Configure a URL de notificação para: `https://seu-dominio.com.br/api/webhooks/mercado-pago`.
3.  Selecione os seguintes eventos para monitoramento:
    *   `payment` (Pagamentos PIX e Cartão)
    *   `subscription_preapproval` (Assinaturas SaaS)
4.  Após salvar, o Mercado Pago fornecerá um **Segredo de Webhook**. Copie-o para a variável `MERCADOPAGO_WEBHOOK_SECRET` no seu `.env`.

---

## ⏰ 5. Configuração do Cron Job (Faturamento Automático)

Para que as cobranças de renovação sejam geradas automaticamente, você precisa configurar um disparador para o endpoint de cron:

1.  No seu `.env`, defina uma senha forte em `CRON_SECRET`.
2.  O endpoint é: `https://seu-dominio.com.br/api/cron/billing`.
3.  **Vercel Cron:** Adicione ao seu `vercel.json`:
    ```json
    {
      "crons": [{ "path": "/api/cron/billing", "schedule": "0 8 * * *" }]
    }
    ```
4.  **Manual/Outros:** Dispare uma requisição GET com o header: `Authorization: Bearer seu_cron_secret`.

---

## 🛠️ 6. Modo de Teste (Sandbox)

Antes de ir para produção, você pode usar as **Credenciais de Teste**:

1.  No painel do MP, mude para o modo **Sandbox/Teste**.
2.  Use o Access Token de teste no `.env`.
3.  Utilize os [cartões de teste oficiais do Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-cards) para simular pagamentos aprovados e recusados.

---

## 📋 Checklist de Validação

- [ ] O PIX aparece no modal ao assinar um streaming público?
- [ ] O status da cobrança muda para "Pago" no dashboard após a confirmação?
- [ ] O redirecionamento para o Plano Pro funciona e chega à tela de checkout do MP?
- [ ] O segredo do Webhook está correto (o sistema valida a assinatura HMAC)?

---

**Suporte**: Em caso de dúvidas técnicas sobre a integração, consulte a [Documentação Oficial do Mercado Pago SDK](https://github.com/mercadopago/sdk-nodejs).
