# Guia de Configuração do Sistema de Emails

Este guia explica como configurar o sistema de envio de emails do StreamShare usando Resend.

---

## 📋 Pré-requisitos

- Conta no [Resend](https://resend.com) (gratuita para começar)
- Domínio verificado (opcional para produção)

---

## 🚀 Configuração Rápida

### 1. Criar Conta no Resend

1. Acesse [resend.com](https://resend.com)
2. Crie uma conta gratuita
3. Verifique seu email

### 2. Obter API Key

1. No dashboard do Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. Dê um nome (ex: "StreamShare Development")
4. Copie a chave gerada (começa com `re_`)

### 3. Configurar Variáveis de Ambiente

Crie ou edite o arquivo `.env` na raiz do projeto:

```bash
# Email Configuration (Resend)
RESEND_API_KEY="re_sua_chave_aqui"

# Email Sender (use onboarding@resend.dev para testes)
EMAIL_FROM="StreamShare <onboarding@resend.dev>"
EMAIL_REPLY_TO="atendimento@streamshare.com.br"

# Application URL
NEXT_PUBLIC_URL="http://localhost:3000"
```

> ⚠️ **Importante**: Nunca commite o arquivo `.env` no Git!

### 4. Testar Envio

Execute o projeto e teste o fluxo de recuperação de senha:

```bash
npm run dev
```

1. Acesse `http://localhost:3000/esqueci-senha`
2. Digite um email válido cadastrado
3. Verifique sua caixa de entrada

---

## 🏭 Configuração para Produção

### 1. Verificar Domínio

Para usar seu próprio domínio em produção:

1. No Resend, vá em **Domains**
2. Clique em **Add Domain**
3. Digite seu domínio (ex: `streamshare.com`)
4. Adicione os registros DNS fornecidos:
   - **MX Record**
   - **TXT Record** (SPF)
   - **CNAME Record** (DKIM)

### 2. Aguardar Verificação

A verificação pode levar até 72 horas, mas geralmente é instantânea.

### 3. Atualizar Variáveis de Ambiente

Após verificação, atualize `.env`:

```bash
EMAIL_FROM="StreamShare <noreply@seudominio.com>"
EMAIL_REPLY_TO="suporte@seudominio.com"
NEXT_PUBLIC_URL="https://seudominio.com"
```

---

## 📧 Templates Disponíveis

### 1. Password Reset Email

**Função**: `sendPasswordResetEmail(email, token, userName?)`

**Uso**:
```typescript
import { sendPasswordResetEmail } from '@/lib/email';

await sendPasswordResetEmail(
  'usuario@example.com',
  'abc123token',
  'João Silva' // opcional
);
```

**Características**:
- Design responsivo
- Botão CTA destacado
- Link alternativo para copiar
- Aviso de expiração (1 hora)
- Instruções claras

### 2. Welcome Email

**Função**: `sendWelcomeEmail(email, userName)`

**Uso**:
```typescript
import { sendWelcomeEmail } from '@/lib/email';

await sendWelcomeEmail(
  'usuario@example.com',
  'João Silva'
);
```

**Características**:
- Boas-vindas personalizadas
- Lista de funcionalidades
- CTA para dashboard
- Design moderno

---

## 🎨 Personalizar Templates

Os templates estão em `apps/web/src/lib/email.ts`.

### Estrutura do Template

```typescript
function getPasswordResetTemplate(resetUrl: string, userName?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>...</head>
      <body>
        <!-- Header com gradiente -->
        <!-- Conteúdo principal -->
        <!-- CTA Button -->
        <!-- Footer -->
      </body>
    </html>
  `;
}
```

### Cores do Tema

```css
/* Gradiente Principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Cores de Texto */
--gray-900: #1f2937;
--gray-600: #4b5563;
--gray-400: #9ca3af;

/* Cores de Fundo */
--white: #ffffff;
--gray-50: #f9fafb;
```

---

## 🧪 Testes

### Testar Localmente

1. **Forgot Password Flow**:
   ```bash
   # 1. Cadastre um usuário
   # 2. Faça logout
   # 3. Clique em "Esqueci minha senha"
   # 4. Digite o email
   # 5. Verifique o email recebido
   ```

2. **Verificar Email no Resend**:
   - Dashboard > Emails
   - Veja todos os emails enviados
   - Clique para ver preview

### Testar em Diferentes Clientes

Os templates são testados em:
- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (Web, Desktop)
- ✅ Apple Mail (macOS, iOS)
- ✅ Thunderbird

---

## 🔍 Troubleshooting

### Email não está sendo enviado

1. **Verificar API Key**:
   ```bash
   echo $RESEND_API_KEY
   ```

2. **Verificar logs**:
   ```bash
   # No terminal onde o Next.js está rodando
   # Procure por erros de "Erro ao enviar email"
   ```

3. **Testar API Key**:
   ```bash
   curl -X POST 'https://api.resend.com/emails' \
     -H 'Authorization: Bearer re_sua_chave' \
     -H 'Content-Type: application/json' \
     -d '{
       "from": "onboarding@resend.dev",
       "to": "seu@email.com",
       "subject": "Teste",
       "html": "<p>Teste</p>"
     }'
   ```

### Email vai para spam

1. **Verificar SPF/DKIM**:
   - Certifique-se de que os registros DNS estão corretos
   - Use ferramentas como [MXToolbox](https://mxtoolbox.com)

2. **Melhorar conteúdo**:
   - Evite palavras como "grátis", "ganhe dinheiro"
   - Mantenha proporção texto/imagem balanceada
   - Inclua link de unsubscribe (futuro)

### Template não renderiza corretamente

1. **Testar em Email Tester**:
   - Use [Litmus](https://litmus.com) ou [Email on Acid](https://www.emailonacid.com)

2. **Validar HTML**:
   - Use inline styles (já implementado)
   - Evite CSS moderno não suportado
   - Teste em diferentes clientes

---

## 📊 Monitoramento

### Dashboard do Resend

Acesse [resend.com/emails](https://resend.com/emails) para ver:

- **Emails enviados**: Total e por período
- **Taxa de entrega**: Delivered, Bounced, Complained
- **Logs detalhados**: Por email individual
- **Webhooks**: Eventos em tempo real (futuro)

### Métricas Importantes

- **Delivery Rate**: Deve ser > 95%
- **Bounce Rate**: Deve ser < 5%
- **Complaint Rate**: Deve ser < 0.1%

---

## 🔐 Segurança

### Boas Práticas

1. **Nunca exponha a API Key**:
   - Use variáveis de ambiente
   - Não commite no Git
   - Rotacione periodicamente

2. **Rate Limiting**:
   - Implemente limite de tentativas
   - Use cache para prevenir spam

3. **Validação de Email**:
   - Sempre valide formato
   - Considere verificação de domínio

### Limites do Resend

**Plano Gratuito**:
- 100 emails/dia
- 3,000 emails/mês
- Domínio verificado necessário para produção

**Plano Pago**:
- A partir de $20/mês
- 50,000 emails/mês
- Suporte prioritário

---

## 🚀 Próximos Passos

### Melhorias Futuras

- [ ] **Email Verification**: Verificar email no cadastro
- [ ] **Email Templates**: Mais templates (cobrança, notificações)
- [ ] **Webhooks**: Rastrear eventos (opened, clicked)
- [ ] **Unsubscribe**: Link de descadastramento
- [ ] **Email Analytics**: Métricas personalizadas
- [ ] **A/B Testing**: Testar diferentes templates
- [ ] **Localization**: Suporte a múltiplos idiomas

### Integrações

- [ ] **SendGrid**: Alternativa ao Resend
- [ ] **Postmark**: Para emails transacionais
- [ ] **Mailgun**: Para alto volume

---

## 📚 Recursos

- [Resend Documentation](https://resend.com/docs)
- [Email Design Best Practices](https://www.campaignmonitor.com/resources/guides/email-design/)
- [HTML Email Templates](https://github.com/leemunroe/responsive-html-email-template)
- [Can I Email](https://www.caniemail.com/) - Compatibilidade de CSS

---

## 💡 Dicas

1. **Use onboarding@resend.dev para testes**: Não precisa verificar domínio
2. **Teste em diferentes clientes**: Gmail, Outlook, Apple Mail
3. **Mantenha templates simples**: Menos é mais em emails
4. **Use inline styles**: Melhor compatibilidade
5. **Inclua texto alternativo**: Para imagens e links

---

**Última atualização**: 2026-01-14  
**Versão**: 1.0.0
