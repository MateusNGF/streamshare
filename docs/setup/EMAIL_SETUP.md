# Guia de Configuração do Sistema de Emails

Este guia explica como configurar o sistema de envio de emails do StreamShare usando **SMTP (Nodemailer)**. O sistema está otimizado para provedores como **Hostinger**, Gmail e Outlook.

---

## 🚀 Configuração Rápida (Hostinger)

### 1. Obter Credenciais SMTP
1. Acesse o hPanel da Hostinger.
2. Vá em **Emails** > **Contas de Email**.
3. Crie uma conta (ex: `atendimento@streamshare.com.br`).
4. Clique em **Configurações de Dispositivos** para obter o Host, Porta e Segurança.

### 2. Configurar Variáveis de Ambiente
Edite o arquivo `.env` na raiz do projeto:

```bash
# Email Configuration (SMTP/Nodemailer)
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT="465"
SMTP_SECURE="true"  # Use "true" para porta 465 (SSL), "false" para 587 (TLS)
SMTP_USER="atendimento@streamshare.com.br"
SMTP_PASS="sua-senha-aqui"

# Email Sender (IMPORTANTE: O domínio do FROM deve bater com o USER smtp)
EMAIL_FROM="StreamShare <atendimento@streamshare.com.br>"
EMAIL_REPLY_TO="atendimento@streamshare.com.br"

# Application URL
NEXT_PUBLIC_URL="http://localhost:3000"
```

---

## 🛠️ Modos de Envio

O sistema detecta automaticamente o ambiente e escolhe o melhor transportador:

| Ambiente | Provedor | Observação |
|---|---|---|
| **Produção** | SMTP Real | Usa as configurações do `.env`. |
| **Desenvolvimento** | Ethereal Email | Se `SMTP_HOST` estiver vazio, cria uma conta de teste e loga o link de preview no console. |
| **Build Time** | Stream Transport | Usado durante o build do Next.js para evitar conexões externas. |

---

## 📧 Templates Disponíveis

### 1. Boas-vindas (Welcome Email)
**Função**: `sendWelcomeEmail(email, userName)`  
Disparado automaticamente no cadastro via Email ou Google Auth.

### 2. Redefinição de Senha
**Função**: `sendPasswordResetEmail(email, token, userName?)`  
Disparado no fluxo de "Esqueci minha senha".

---

## 🎨 Arquitetura do Sistema

O sistema segue princípios **SOLID** e **Clean Code**:

- `src/lib/email/transporter.ts`: Gerencia a conexão e transportadores.
- `src/lib/email/index.ts`: Serviço principal com as funções de envio.
- `src/lib/email/templates/`: HTML modularizado.
- `src/lib/email/utils/`: Utilitários como `escapeHtml`.

---

## 🔍 Diagnóstico

### Testar Conexão
No painel administrativo do StreamShare, vá em **Configurações > Parâmetros** e clique em **Testar SMTP**. O sistema validará se as credenciais do `.env` conseguem estabelecer conexão com o servidor.

### Problemas Comuns
1. **Rejeição de Sender (550 Sender Address Rejected)**: Verifique se o `EMAIL_FROM` está usando o mesmo domínio/conta que o `SMTP_USER`.
2. **Timeout na Conexão**: Verifique se a porta (465/587) está correta e se o firewall permite conexões de saída.
3. **Senhas com caracteres especiais**: Se o teste SMTP falhar, tente usar senhas sem `@` ou envolva o valor em aspas no `.env`.

---

## 🔐 Segurança
- Nunca exponha o arquivo `.env` no repositório.
- Use senhas exclusivas para o serviço de email (App Passwords se usar Gmail).
- Em produção, certifique-se de configurar registros **SPF, DKIM e DMARC** no seu DNS para evitar que os emails caiam na caixa de spam.

---
**Última atualização**: 2026-02-25  
**Versão**: 2.0.0 (Migração SMTP/Nodemailer)

