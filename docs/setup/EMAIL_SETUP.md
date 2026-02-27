# Guia de Configuração do Sistema de Emails

Este guia explica como configurar o sistema de envio de emails do StreamShare usando **SMTP (Nodemailer)**. O sistema está otimizado para diversos provedores.

---

## 🚀 Configuração de Provedores

O sistema exige as seguintes variáveis no seu arquivo `.env`:

```bash
# Email Configuration (SMTP/Nodemailer)
SMTP_HOST="smtp.exemplo.com"
SMTP_PORT="465"
SMTP_SECURE="true"  # Use "true" para porta 465 (SSL), "false" para 587 (TLS)
SMTP_USER="seu-email@dominio.com"
SMTP_PASS="sua-senha-v3ry-s3cr3t"

# Email Sender (IMPORTANTE: O domínio do FROM deve bater com o USER smtp)
EMAIL_FROM="StreamShare <seu-email@dominio.com>"
EMAIL_REPLY_TO="atendimento@dominio.com"

# Application URL
NEXT_PUBLIC_URL="http://localhost:3000"
```

### Exemplos por Provedor:

#### 1. Hostinger (Recomendado)
- **Host**: `smtp.hostinger.com`
- **Porta**: `465` (Secure: `true`) ou `587` (Secure: `false`)

#### 2. Gmail
1. Ative a verificação em 2 etapas.
2. Crie uma **App Password** em [Security](https://myaccount.google.com/apppasswords).
- **Host**: `smtp.gmail.com`
- **Porta**: `587` (Secure: `false`)
- **Pass**: A senha de 16 caracteres gerada pelo Google.

#### 3. Outlook / Hotmail
- **Host**: `smtp-mail.outlook.com`
- **Porta**: `587` (Secure: `false`)

---

## 🛠️ Modos de Envio

O sistema detecta automaticamente o ambiente e escolhe o melhor transportador:

| Ambiente | Provedor | Observação |
|---|---|---|
| **Produção** | SMTP Real | Usa as configurações do `.env`. |
| **Desenvolvimento** | Ethereal Email | Se `SMTP_HOST` estiver vazio, usa o Ethereal para testes visuais. |
| **Build Time** | Stream Transport | Usado durante o build do Next.js. |

### Ethereal (Zero Config)
Se você **não configurar** `SMTP_HOST`, o sistema automaticamente criará uma conta de teste no **Ethereal Email** e mostrará as URLs de preview no terminal.

---

## 📧 Templates Disponíveis

### 1. Verificação OTP
Acionado durante o cadastro para validar a identidade do usuário.

### 2. Boas-vindas (Welcome Email)
Disparado após a confirmação da conta.

### 3. Redefinição de Senha
Disparado no fluxo de "Esqueci minha senha".

---

## 🔍 Diagnóstico e Segurança

### Testar Conexão
No painel administrativo, vá em **Configurações > Parâmetros** e clique em **Testar SMTP**.

### Problemas Comuns
1. **Erro 550 Sender Rejected**: Verifique se o `EMAIL_FROM` usa o mesmo domínio que o `SMTP_USER`.
2. **Timeout**: Verifique se a porta está correta no firewall do seu host.
3. **SPF/DKIM/DMARC**: Em produção, configure estes registros no seu DNS para evitar que emails caiam no spam.

---
**Última atualização**: 2026-02-26  
**Versão**: 2.1.0 (SMTP Consolidado)


