# Configuração de Email - Nodemailer

Este projeto usa **Nodemailer** para envio de emails via SMTP. Você pode usar Gmail, Outlook, ou qualquer servidor SMTP customizado.

## 📧 Configuração Rápida

### Opção 1: Gmail (Recomendado para Desenvolvimento)

1. **Ative a verificação em 2 etapas** na sua conta Google
2. **Crie uma App Password**:
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "Mail" e "Other (Custom name)"
   - Copie a senha gerada (16 caracteres)

3. **Configure o `.env`**:
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="xxxx xxxx xxxx xxxx"  # App Password gerada

EMAIL_FROM="StreamShare <seu-email@gmail.com>"
EMAIL_REPLY_TO="seu-email@gmail.com"
```

### Opção 2: Outlook/Hotmail

```bash
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="seu-email@outlook.com"
SMTP_PASS="sua-senha"

EMAIL_FROM="StreamShare <seu-email@outlook.com>"
EMAIL_REPLY_TO="seu-email@outlook.com"
```

### Opção 3: Servidor SMTP Customizado

```bash
SMTP_HOST="smtp.seudominio.com"
SMTP_PORT="587"  # ou 465 para SSL
SMTP_SECURE="false"  # true se porta 465
SMTP_USER="usuario@seudominio.com"
SMTP_PASS="sua-senha"

EMAIL_FROM="StreamShare <noreply@seudominio.com>"
EMAIL_REPLY_TO="suporte@seudominio.com"
```

### Opção 4: Modo Desenvolvimento com Ethereal (Padrão)

**✨ Configuração Automática!** Se você **não configurar** `SMTP_HOST`, o sistema automaticamente criará uma conta de teste no **Ethereal Email** e mostrará as URLs de preview no console.

```bash
# Não configure nada! Deixe as variáveis SMTP vazias ou comentadas
# SMTP_HOST=""
# SMTP_PORT=""
# SMTP_USER=""
# SMTP_PASS=""
```

**Console Output:**
```
🧪 SMTP não configurado. Usando Ethereal Email para testes...
✅ Conta Ethereal criada:
   📧 User: example.user@ethereal.email
   🔑 Pass: AbCdEfGhIjKl
   🌐 Preview: https://ethereal.email
✅ Email enviado: <1234567890@ethereal.email>
🔗 Preview URL: https://ethereal.email/message/WxYz...
```

**Como visualizar os emails:**
1. Copie a **Preview URL** do console
2. Cole no navegador
3. Veja o email renderizado exatamente como seria enviado!

**Vantagens do Ethereal:**
- ✅ **Zero configuração** - funciona automaticamente
- ✅ **Preview visual** - veja exatamente como o email ficará
- ✅ **Sem spam** - emails não são enviados de verdade
- ✅ **Teste completo** - testa templates, links, formatação
- ✅ **Compartilhável** - envie a URL para outros revisarem

## 🔧 Variáveis de Ambiente

| Variável | Obrigatória | Descrição | Exemplo |
|----------|-------------|-----------|---------|
| `SMTP_HOST` | ❌ | Servidor SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | ❌ | Porta SMTP | `587` (TLS) ou `465` (SSL) |
| `SMTP_SECURE` | ❌ | Usar SSL? | `false` para 587, `true` para 465 |
| `SMTP_USER` | ❌ | Usuário SMTP | `seu-email@gmail.com` |
| `SMTP_PASS` | ❌ | Senha SMTP | App Password ou senha |
| `EMAIL_FROM` | ✅ | Email remetente | `StreamShare <noreply@domain.com>` |
| `EMAIL_REPLY_TO` | ✅ | Email para respostas | `suporte@domain.com` |

## 🚀 Serviços SMTP Recomendados

### Para Produção:

1. **SendGrid** (100 emails/dia grátis)
   - https://sendgrid.com/
   - SMTP: `smtp.sendgrid.net:587`

2. **Mailgun** (5.000 emails/mês grátis)
   - https://www.mailgun.com/
   - SMTP: `smtp.mailgun.org:587`

3. **Amazon SES** (62.000 emails/mês grátis com EC2)
   - https://aws.amazon.com/ses/
   - SMTP: `email-smtp.us-east-1.amazonaws.com:587`

4. **Brevo (ex-Sendinblue)** (300 emails/dia grátis)
   - https://www.brevo.com/
   - SMTP: `smtp-relay.brevo.com:587`

### Para Desenvolvimento:

- **Gmail** com App Password (simples e rápido)
- **Mailtrap** (ambiente de teste, não envia emails reais)
  - https://mailtrap.io/
  - SMTP: `smtp.mailtrap.io:2525`

## 📝 Exemplo de Configuração Completa

```bash
# .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/streamshare?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
NEXT_PUBLIC_URL="http://localhost:3000"

# SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="streamshare.dev@gmail.com"
SMTP_PASS="abcd efgh ijkl mnop"

# Email Configuration
EMAIL_FROM="StreamShare <streamshare.dev@gmail.com>"
EMAIL_REPLY_TO="atendimento@streamshare.com.br"
```

## 🧪 Testando o Envio de Emails

1. **Inicie o servidor de desenvolvimento**:
```bash
pnpm run dev
```

2. **Teste a funcionalidade de "Esqueci minha senha"**:
   - Acesse: http://localhost:3000/esqueci-senha
   - Digite um email cadastrado
   - Verifique o console para logs
   - Verifique sua caixa de entrada

3. **Verifique os logs no terminal**:
```
✅ Email enviado: <1234567890@smtp.gmail.com>
```

## ⚠️ Troubleshooting

### Erro: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solução para Gmail:**
- Use App Password, não a senha normal da conta
- Ative verificação em 2 etapas primeiro

### Erro: "Connection timeout"

**Possíveis causas:**
- Firewall bloqueando porta 587/465
- SMTP_HOST incorreto
- Provedor de internet bloqueando SMTP

**Solução:**
- Tente porta alternativa (465 com SMTP_SECURE="true")
- Verifique firewall/antivírus
- Use VPN se necessário

### Emails não chegam (sem erro)

**Verifique:**
- Pasta de SPAM
- Email FROM está verificado no provedor
- Limites de envio não foram excedidos

## 🔒 Segurança

- ✅ **NUNCA** commite o arquivo `.env` com credenciais reais
- ✅ Use App Passwords em vez de senhas principais
- ✅ Em produção, use variáveis de ambiente do servidor
- ✅ Considere usar serviços dedicados (SendGrid, Mailgun) para produção
- ✅ Implemente rate limiting para prevenir spam

## 📚 Referências

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SMTP Port Guide](https://www.mailgun.com/blog/which-smtp-port-understanding-ports-25-465-587/)
