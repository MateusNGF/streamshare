# 🏦 Como Criar uma Conta no Mercado Pago e Liberar Credenciais de Produção

> Guia passo a passo para gestores do StreamShare configurarem o gateway de pagamentos do zero.

---

## Parte 1: Criar a Conta

### Passo 1 — Acesse o Mercado Pago

1. Acesse [mercadopago.com.br](https://www.mercadopago.com.br).
2. Clique em **"Criar conta"**.
3. Você pode criar usando **CPF** (pessoa física) ou **CNPJ** (pessoa jurídica).

> [!TIP]
> Mesmo que você seja pessoa física, prefira vincular um **CNPJ** (MEI, por exemplo) desde o início. Isso facilita emissão de nota fiscal, melhores taxas e maior credibilidade no gateway.

---

### Passo 2 — Validar a Conta

Após criar, o MP exigirá que você **valide sua identidade** para habilitar recebimentos:

1. Acesse o painel em [mercadopago.com.br](https://www.mercadopago.com.br) após o login.
2. No menu superior, clique em **"Sua conta"** → **"Dados pessoais"**.
3. Envie os documentos solicitados:
   - **CPF** (ou CNPJ) — validado automaticamente via Receita Federal.
   - **Selfie com documento** — reconhecimento facial via câmera.
4. Aguarde a aprovação (normalmente **instantânea** ou em até **24h úteis**).

> [!IMPORTANT]
> Sem validação completa, os saques/repasses ficam **bloqueados**. Não pule essa etapa.

---

## Parte 2: Criar a Aplicação de Desenvolvedor

### Passo 3 — Acessar o Painel de Desenvolvedores

1. Acesse: [mercadopago.com.br/developers/panel/app](https://www.mercadopago.com.br/developers/panel/app).
2. Clique em **"Criar aplicação"**.

### Passo 4 — Configurar a Aplicação

Preencha o formulário com as seguintes opções:

| Campo | Valor recomendado |
|---|---|
| Nome da aplicação | `StreamShare Financeiro` |
| Finalidade | Pagamentos online |
| Integração | Checkout Pro + Checkout API |
| Plataforma de e-commerce | Não |

3. Aceite os termos e clique em **"Criar aplicação"**.

---

## Parte 3: Obter as Credenciais de Produção

### Passo 5 — Ativar Credenciais de Produção

Dentro da aplicação criada:

1. No menu lateral, clique em **"Credenciais de produção"**.
2. Pode aparecer um formulário breve pedindo:
   - URL do seu site/aplicação (`https://seudominio.com.br`).
   - Descrição do negócio (ex: "Plataforma de gestão de assinaturas de streaming").
3. Após preencher, suas credenciais serão exibidas:

| Credencial | Formato | Onde usar |
|---|---|---|
| **Access Token** | `APP_USR-000...` | `MERCADOPAGO_ACCESS_TOKEN` no `.env` |
| **Public Key** | `APP_USR-000...` | Não utilizado no StreamShare (SDK server-side) |

> [!CAUTION]
> **Nunca compartilhe o Access Token.** Ele dá controle total sobre pagamentos da sua conta. Salve **somente** no `.env` do servidor, que está no `.gitignore`.

---

## Parte 4: Criar os Planos de Assinatura (SaaS)

### Passo 6 — Criar os Planos Pro e Business

O StreamShare usa o recurso de **Assinaturas** do MP (PreApproval Plans) para cobrar os planos da plataforma.

1. Acesse: [mercadopago.com.br/subscriptions/plans](https://www.mercadopago.com.br/subscriptions/plans).
2. Clique em **"Criar plano"** e configure:

**Plano Pro:**
| Campo | Valor |
|---|---|
| Nome | `StreamShare Pro` |
| Valor | `R$ 29,90` |
| Frequência | Mensal |
| Tipo de cobrança | Automática |

**Plano Business:**
| Campo | Valor |
|---|---|
| Nome | `StreamShare Business` |
| Valor | `R$ 99,90` |
| Frequência | Mensal |
| Tipo de cobrança | Automática |

3. Após criar cada plano, copie o **ID do Plano** (ex: `2c938084abc123`) da URL ou do painel.
4. Cole no seu `.env`:

```env
MERCADOPAGO_PLAN_PRO=2c938084abc123
MERCADOPAGO_PLAN_BUSINESS=2c938084xyz456
```

---

## Parte 5: Configurar o Webhook

### Passo 7 — Registrar o Endpoint de Notificação

1. Dentro da sua aplicação no painel de desenvolvedor, clique em **"Webhooks"** no menu lateral.
2. Selecione o modo **"Produção"**.
3. Configure:
   - **URL:** `https://seudominio.com.br/api/webhooks/mercado-pago`
   - **Eventos a monitorar:**
     - ✅ `Pagamentos` (type: `payment`)
     - ✅ `Planos e assinaturas` (type: `subscription_preapproval`)
4. Clique em **"Salvar"**.
5. O Mercado Pago irá gerar uma **Chave Secreta de Webhook**. Copie-a:

```env
MERCADOPAGO_WEBHOOK_SECRET=sua_chave_gerada_pelo_mp
MERCADOPAGO_WEBHOOK_URL=https://seudominio.com.br/api/webhooks/mercado-pago
```

> [!NOTE]
> Em desenvolvimento local, use **ngrok** para expor seu servidor:
> ```bash
> ngrok http 3000
> # Use a URL gerada: https://xxxx.ngrok-free.app/api/webhooks/mercado-pago
> ```

---

## Parte 6: Checklist Final de Configuração

Antes de colocar em produção, confirme:

- [ ] Conta do MP validada com CPF/CNPJ e selfie aprovados
- [ ] Aplicação criada no painel de desenvolvedores
- [ ] `MERCADOPAGO_ACCESS_TOKEN` configurado no `.env`
- [ ] Plano Pro criado e ID em `MERCADOPAGO_PLAN_PRO`
- [ ] Plano Business criado e ID em `MERCADOPAGO_PLAN_BUSINESS`
- [ ] Webhook registrado com a URL de produção
- [ ] `MERCADOPAGO_WEBHOOK_SECRET` configurado no `.env`
- [ ] `NEXT_PUBLIC_URL` apontando para o domínio real de produção
- [ ] `CRON_SECRET` definido com uma senha forte para proteger `/api/cron/billing`
- [ ] Teste realizado com cartão de teste aprovando um pagamento e verificando se o status da cobrança muda no dashboard

---

## Referências Úteis

| Recurso | Link |
|---|---|
| Painel de Desenvolvedores | [mercadopago.com.br/developers/panel/app](https://www.mercadopago.com.br/developers/panel/app) |
| Gestão de Assinaturas | [mercadopago.com.br/subscriptions](https://www.mercadopago.com.br/subscriptions) |
| Cartões de Teste (Sandbox) | [Documentação Oficial](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-cards) |
| SDK Node.js | [github.com/mercadopago/sdk-nodejs](https://github.com/mercadopago/sdk-nodejs) |
