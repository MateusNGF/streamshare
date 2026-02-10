# Sistema de Autenticação e Gerenciamento de Senhas

> Documentação completa do sistema de autenticação do StreamShare, incluindo login, cadastro, recuperação de senha e alteração de senha.

---

## 📑 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Fluxos de Autenticação](#fluxos-de-autenticação)
  - [Login](#1-login)
  - [Cadastro](#2-cadastro)
  - [Recuperação de Senha](#3-recuperação-de-senha)
  - [Alteração de Senha](#4-alteração-de-senha)
- [Componentes](#componentes)
- [API Routes](#api-routes)
- [Segurança](#segurança)
- [Validações](#validações)
- [Próximos Passos](#próximos-passos)

---

## Visão Geral

O sistema de autenticação do StreamShare é construído com Next.js 14 (App Router) e utiliza JWT (JSON Web Tokens) para gerenciamento de sessões. O sistema suporta:

- ✅ Autenticação local (email/senha)
- ✅ Cadastro de novos usuários
- ✅ Recuperação de senha via email
- ✅ Alteração de senha para usuários logados
- 🔄 OAuth com Google (planejado)
- 🔄 Autenticação 2FA (planejado)

---

## Arquitetura do Sistema

```mermaid
graph TB
    subgraph "Frontend - Next.js App Router"
        LoginPage["/login<br/>Login & Signup"]
        ForgotPage["/esqueci-senha<br/>Forgot Password"]
        ResetPage["/redefinir-senha/token<br/>Reset Password"]
        SettingsPage["/configuracoes<br/>Settings"]
        Dashboard["/dashboard<br/>Protected Routes"]
    end

    subgraph "Components"
        LoginForm["LoginForm"]
        SignupForm["SignupForm"]
        ForgotForm["ForgotPasswordForm"]
        ResetForm["ResetPasswordForm"]
        ChangeModal["ChangePasswordModal"]
    end

    subgraph "API Routes"
        LoginAPI["/api/auth/login"]
        SignupAPI["/api/auth/signup"]
        LogoutAPI["/api/auth/logout"]
        ForgotAPI["/api/auth/forgot-password"]
        ResetAPI["/api/auth/reset-password"]
        ChangeAPI["/api/auth/change-password"]
    end

    subgraph "Auth Library"
        AuthLib["lib/auth.ts<br/>JWT Utils"]
    end

    subgraph "Database - PostgreSQL"
        UserTable[("Usuario<br/>id, email, nome<br/>senhaHash, provider<br/>resetToken, resetTokenExpiry")]
        ContaTable[("Conta<br/>Multi-tenant")]
    end

    LoginPage --> LoginForm
    LoginPage --> SignupForm
    ForgotPage --> ForgotForm
    ResetPage --> ResetForm
    SettingsPage --> ChangeModal

    LoginForm --> LoginAPI
    SignupForm --> SignupAPI
    ForgotForm --> ForgotAPI
    ResetForm --> ResetAPI
    ChangeModal --> ChangeAPI

    LoginAPI --> AuthLib
    SignupAPI --> AuthLib
    ChangeAPI --> AuthLib

    LoginAPI --> UserTable
    SignupAPI --> UserTable
    ForgotAPI --> UserTable
    ResetAPI --> UserTable
    ChangeAPI --> UserTable

    AuthLib -.->|JWT Token| Dashboard

    style LoginPage fill:#e1f5ff
    style ForgotPage fill:#e1f5ff
    style ResetPage fill:#e1f5ff
    style SettingsPage fill:#e1f5ff
    style Dashboard fill:#fff4e1
    style UserTable fill:#ffe1e1
```

---

## Fluxos de Autenticação

### 1. Login

```mermaid
sequenceDiagram
    actor User
    participant LoginPage as /login
    participant LoginForm
    participant API as /api/auth/login
    participant DB as Database
    participant Auth as lib/auth
    participant Dashboard

    User->>LoginPage: Acessa página
    LoginPage->>LoginForm: Renderiza formulário
    User->>LoginForm: Digita email e senha
    User->>LoginForm: Clica "Entrar"
    
    LoginForm->>LoginForm: Validação client-side
    LoginForm->>API: POST {email, senha}
    
    API->>DB: Busca usuário por email
    alt Usuário não encontrado
        DB-->>API: null
        API-->>LoginForm: 401 "Credenciais inválidas"
        LoginForm-->>User: Exibe erro
    else Usuário encontrado
        DB-->>API: Usuario {senhaHash, ...}
        API->>API: bcrypt.compare(senha, senhaHash)
        
        alt Senha incorreta
            API-->>LoginForm: 401 "Credenciais inválidas"
            LoginForm-->>User: Exibe erro
        else Senha correta
            API->>Auth: generateToken({userId, email})
            Auth-->>API: JWT token
            API->>API: setAuthCookie(token)
            API-->>LoginForm: 200 {success: true}
            LoginForm->>Dashboard: router.push('/dashboard')
            Dashboard-->>User: Página protegida
        end
    end
```

**Arquivo**: [LoginForm.tsx](file:///w:/projetos/streamsharev2/apps/web/src/components/auth/LoginForm.tsx)

**Características**:
- Validação de email e senha
- Loading state durante autenticação
- Mensagens de erro contextuais
- Opção "Lembrar-me"
- Link para recuperação de senha
- Botão OAuth com Google

---

### 2. Cadastro

```mermaid
sequenceDiagram
    actor User
    participant SignupForm
    participant API as /api/auth/signup
    participant DB as Database
    participant Auth as lib/auth
    participant Dashboard

    User->>SignupForm: Preenche formulário
    User->>SignupForm: Nome, Email, Senha
    User->>SignupForm: Clica "Cadastrar"
    
    SignupForm->>SignupForm: Validação client-side
    SignupForm->>API: POST {nome, email, senha}
    
    API->>DB: Verifica se email existe
    alt Email já cadastrado
        DB-->>API: Usuario existente
        API-->>SignupForm: 400 "Email já cadastrado"
        SignupForm-->>User: Exibe erro
    else Email disponível
        API->>API: bcrypt.hash(senha, 10)
        API->>DB: Cria Usuario e Conta
        DB-->>API: Usuario criado
        API->>Auth: generateToken({userId, email})
        Auth-->>API: JWT token
        API->>API: setAuthCookie(token)
        API-->>SignupForm: 200 {success: true}
        SignupForm->>Dashboard: router.push('/dashboard')
        Dashboard-->>User: Página protegida
    end
```

**Arquivo**: [SignupForm.tsx](file:///w:/projetos/streamsharev2/apps/web/src/components/auth/SignupForm.tsx)

**Características**:
- Validação de nome, email e senha
- Verificação de email duplicado
- Criação automática de conta (multi-tenant)
- Login automático após cadastro
- Termos de uso e política de privacidade

---

### 3. Recuperação de Senha

```mermaid
sequenceDiagram
    actor User
    participant ForgotPage as /esqueci-senha
    participant ForgotAPI as /api/auth/forgot-password
    participant DB as Database
    participant Email as Email Service
    participant ResetPage as /redefinir-senha/[token]
    participant ResetAPI as /api/auth/reset-password

    User->>ForgotPage: Acessa página
    User->>ForgotPage: Digita email
    User->>ForgotPage: Clica "Enviar Instruções"
    
    ForgotPage->>ForgotAPI: POST {email}
    ForgotAPI->>DB: Busca usuário por email
    
    alt Email não existe
        DB-->>ForgotAPI: null
        Note over ForgotAPI: Por segurança, retorna<br/>mesma mensagem
    else Email existe
        DB-->>ForgotAPI: Usuario
        ForgotAPI->>ForgotAPI: crypto.randomBytes(32)
        ForgotAPI->>ForgotAPI: Expiry = now + 1 hour
        ForgotAPI->>DB: UPDATE resetToken, resetTokenExpiry
        ForgotAPI->>Email: Envia link de reset
    end
    
    ForgotAPI-->>ForgotPage: 200 "Verifique seu email"
    ForgotPage-->>User: Mensagem de sucesso
    
    Note over User,Email: Usuário recebe email
    User->>Email: Clica no link
    Email->>ResetPage: /redefinir-senha/abc123...
    
    ResetPage->>ResetPage: Valida formato do token
    alt Token inválido (< 10 chars)
        ResetPage-->>User: Erro "Token inválido"
    else Token válido
        ResetPage-->>User: Formulário de nova senha
        User->>ResetPage: Digita nova senha
        User->>ResetPage: Confirma senha
        User->>ResetPage: Clica "Redefinir Senha"
        
        ResetPage->>ResetAPI: POST {token, newPassword}
        ResetAPI->>DB: Busca por resetToken
        
        alt Token não encontrado ou expirado
            DB-->>ResetAPI: null
            ResetAPI-->>ResetPage: 400 "Token inválido"
            ResetPage-->>User: Erro
        else Token válido
            DB-->>ResetAPI: Usuario
            ResetAPI->>ResetAPI: bcrypt.hash(newPassword)
            ResetAPI->>DB: UPDATE senhaHash<br/>CLEAR resetToken
            ResetAPI-->>ResetPage: 200 "Senha redefinida"
            ResetPage-->>User: Sucesso + Redirect
            ResetPage->>LoginPage: router.push('/login')
        end
    end
```

**Arquivos**:
- [ForgotPasswordForm.tsx](file:///w:/projetos/streamsharev2/apps/web/src/components/auth/ForgotPasswordForm.tsx)
- [ResetPasswordForm.tsx](file:///w:/projetos/streamsharev2/apps/web/src/components/auth/ResetPasswordForm.tsx)
- [forgot-password/route.ts](file:///w:/projetos/streamsharev2/apps/web/src/app/api/auth/forgot-password/route.ts)
- [reset-password/route.ts](file:///w:/projetos/streamsharev2/apps/web/src/app/api/auth/reset-password/route.ts)

**Características**:
- Mensagem genérica (anti-enumeração)
- Token único e seguro
- Expiração de 1 hora
- Validação de requisitos de senha
- Redirecionamento automático

---

### 4. Alteração de Senha

```mermaid
sequenceDiagram
    actor User
    participant Settings as /configuracoes
    participant Modal as ChangePasswordModal
    participant API as /api/auth/change-password
    participant Auth as lib/auth
    participant DB as Database

    User->>Settings: Acessa configurações
    Settings-->>User: Página renderizada
    User->>Settings: Clica "Alterar Senha"
    Settings->>Modal: Abre modal
    
    Modal-->>User: Formulário
    User->>Modal: Senha atual
    User->>Modal: Nova senha
    User->>Modal: Confirma nova senha
    User->>Modal: Clica "Alterar Senha"
    
    Modal->>Modal: Validação client-side
    alt Validação falha
        Modal-->>User: Exibe erro
    else Validação OK
        Modal->>API: POST {currentPassword, newPassword}
        API->>Auth: getCurrentUser()
        
        alt Não autenticado
            Auth-->>API: null
            API-->>Modal: 401 "Não autenticado"
            Modal-->>User: Erro
        else Autenticado
            Auth-->>API: {userId, email}
            API->>DB: Busca Usuario completo
            DB-->>API: Usuario {senhaHash, ...}
            API->>API: bcrypt.compare(currentPassword, senhaHash)
            
            alt Senha atual incorreta
                API-->>Modal: 400 "Senha atual incorreta"
                Modal-->>User: Exibe erro
            else Senha atual correta
                API->>API: bcrypt.hash(newPassword)
                API->>DB: UPDATE senhaHash
                DB-->>API: Success
                API-->>Modal: 200 "Senha alterada"
                Modal->>Modal: Limpa formulário
                Modal->>Settings: onSuccess()
                Settings-->>User: Mensagem de sucesso
                Modal->>Modal: Fecha modal
            end
        end
    end
```

**Arquivos**:
- [ChangePasswordModal.tsx](file:///w:/projetos/streamsharev2/apps/web/src/components/modals/ChangePasswordModal.tsx)
- [change-password/route.ts](file:///w:/projetos/streamsharev2/apps/web/src/app/api/auth/change-password/route.ts)
- [SettingsClient.tsx](file:///w:/projetos/streamsharev2/apps/web/src/components/configuracoes/SettingsClient.tsx)

**Características**:
- Requer autenticação (JWT)
- Valida senha atual
- Toggle de visibilidade de senha
- Validação de requisitos
- Nova senha deve ser diferente
- Feedback de sucesso no header

---

## Componentes

### Estrutura de Componentes

```mermaid
graph TD
    subgraph "Páginas"
        LoginPage["/login<br/>AuthPage"]
        ForgotPage["/esqueci-senha"]
        ResetPage["/redefinir-senha/[token]"]
        SettingsPage["/configuracoes"]
    end

    subgraph "Componentes de Autenticação"
        LoginForm["LoginForm<br/>Email, Senha, OAuth"]
        SignupForm["SignupForm<br/>Nome, Email, Senha"]
        ForgotForm["ForgotPasswordForm<br/>Email"]
        ResetForm["ResetPasswordForm<br/>Nova Senha, Confirmar"]
    end

    subgraph "Componentes de Configuração"
        SettingsClient["SettingsClient"]
        ChangeModal["ChangePasswordModal<br/>Senha Atual, Nova, Confirmar"]
    end

    subgraph "UI Components"
        Input["Input<br/>Reutilizável"]
        PageContainer["PageContainer"]
        PageHeader["PageHeader"]
    end

    LoginPage --> LoginForm
    LoginPage --> SignupForm
    ForgotPage --> ForgotForm
    ResetPage --> ResetForm
    SettingsPage --> SettingsClient
    SettingsClient --> ChangeModal

    LoginForm --> Input
    SignupForm --> Input
    ForgotForm --> Input
    ResetForm --> Input
    ChangeModal --> Input
    SettingsClient --> PageContainer
    SettingsClient --> PageHeader

    style LoginPage fill:#e1f5ff
    style ForgotPage fill:#e1f5ff
    style ResetPage fill:#e1f5ff
    style SettingsPage fill:#e1f5ff
```

### Componentes Principais

| Componente | Localização | Responsabilidade |
|------------|-------------|------------------|
| **LoginForm** | `components/auth/LoginForm.tsx` | Formulário de login com validação |
| **SignupForm** | `components/auth/SignupForm.tsx` | Formulário de cadastro |
| **ForgotPasswordForm** | `components/auth/ForgotPasswordForm.tsx` | Solicitação de reset de senha |
| **ResetPasswordForm** | `components/auth/ResetPasswordForm.tsx` | Redefinição de senha com token |
| **ChangePasswordModal** | `components/modals/ChangePasswordModal.tsx` | Modal de alteração de senha |
| **Input** | `components/ui/Input.tsx` | Input reutilizável com label |

---

## API Routes

### Endpoints Disponíveis

```mermaid
graph LR
    subgraph "Authentication APIs"
        Login["/api/auth/login<br/>POST"]
        Signup["/api/auth/signup<br/>POST"]
        Logout["/api/auth/logout<br/>POST"]
        Forgot["/api/auth/forgot-password<br/>POST"]
        Reset["/api/auth/reset-password<br/>POST"]
        Change["/api/auth/change-password<br/>POST"]
    end

    subgraph "Status"
        Implemented["✅ Implementado<br/>(Mock)"]
        Planned["🔄 Planejado<br/>(Backend)"]
    end

    Login --> Implemented
    Signup --> Implemented
    Logout --> Implemented
    Forgot --> Planned
    Reset --> Planned
    Change --> Planned

    style Login fill:#c8e6c9
    style Signup fill:#c8e6c9
    style Logout fill:#c8e6c9
    style Forgot fill:#fff9c4
    style Reset fill:#fff9c4
    style Change fill:#fff9c4
```

### Detalhes dos Endpoints

#### POST /api/auth/login

**Request**:
```json
{
  "email": "usuario@example.com",
  "senha": "SenhaSegura123"
}
```

**Response** (200):
```json
{
  "success": true
}
```

**Cookies**: `auth-token` (HttpOnly, Secure)

---

#### POST /api/auth/signup

**Request**:
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "SenhaSegura123"
}
```

**Response** (200):
```json
{
  "success": true
}
```

---

#### POST /api/auth/forgot-password

**Request**:
```json
{
  "email": "usuario@example.com"
}
```

**Response** (200):
```json
{
  "message": "Se o email existir, você receberá instruções para redefinir sua senha."
}
```

> ⚠️ **Segurança**: Sempre retorna sucesso, mesmo se email não existir (previne enumeração de usuários)

---

#### POST /api/auth/reset-password

**Request**:
```json
{
  "token": "abc123def456...",
  "newPassword": "NovaSenhaSegura456"
}
```

**Response** (200):
```json
{
  "message": "Senha redefinida com sucesso!"
}
```

**Errors**:
- `400`: Token inválido ou expirado
- `400`: Senha não atende requisitos

---

#### POST /api/auth/change-password

**Request**:
```json
{
  "currentPassword": "SenhaAtual123",
  "newPassword": "NovaSenha456"
}
```

**Response** (200):
```json
{
  "message": "Senha alterada com sucesso!"
}
```

**Errors**:
- `401`: Não autenticado
- `400`: Senha atual incorreta
- `400`: Nova senha não atende requisitos

**Headers**: Requer `Cookie: auth-token=...`

---

## Segurança

### Medidas Implementadas

```mermaid
mindmap
  root((Segurança))
    Autenticação
      JWT Tokens
      HttpOnly Cookies
      Secure Flag Production
      Expiração 7 dias
    Senhas
      bcrypt Hash
      Salt Rounds 10
      Requisitos Fortes
      Validação Client Server
    Tokens Reset
      crypto randomBytes
      Expiração 1 hora
      Uso único
      Limpeza após uso
    Anti Enumeração
      Mensagens Genéricas
      Timing Consistente
      Sem Info Vazamento
    Validações
      Client Side
      Server Side
      Sanitização Input
      Rate Limiting Planejado
```

### Requisitos de Senha

Todas as senhas devem atender aos seguintes critérios:

- ✅ **Mínimo 8 caracteres**
- ✅ **Pelo menos 1 letra maiúscula** (A-Z)
- ✅ **Pelo menos 1 letra minúscula** (a-z)
- ✅ **Pelo menos 1 número** (0-9)

**Validação Client-Side**:
```typescript
function validatePassword(pwd: string): string | null {
    if (pwd.length < 8) return "Mínimo 8 caracteres";
    if (!/[A-Z]/.test(pwd)) return "Falta letra maiúscula";
    if (!/[a-z]/.test(pwd)) return "Falta letra minúscula";
    if (!/[0-9]/.test(pwd)) return "Falta número";
    return null;
}
```

### JWT Token

**Estrutura**:
```typescript
interface JWTPayload {
    userId: number;
    email: string;
    iat: number;  // Issued at
    exp: number;  // Expiration
}
```

**Configuração**:
- Secret: `process.env.JWT_SECRET`
- Expiração: 7 dias
- Algoritmo: HS256

**Armazenamento**:
- Cookie HttpOnly
- Secure em produção
- SameSite: Lax
- Path: /

---

## Validações

### Fluxo de Validação

```mermaid
flowchart TD
    Start([Input do Usuário]) --> ClientValidation{Validação<br/>Client-Side}
    
    ClientValidation -->|Erro| ShowClientError[Exibe erro<br/>imediatamente]
    ShowClientError --> End1([Fim])
    
    ClientValidation -->|OK| SendToServer[Envia para servidor]
    SendToServer --> ServerValidation{Validação<br/>Server-Side}
    
    ServerValidation -->|Erro| ShowServerError[Retorna erro<br/>400/401]
    ShowServerError --> End2([Fim])
    
    ServerValidation -->|OK| BusinessLogic[Lógica de negócio]
    BusinessLogic --> DBOperation[(Operação no BD)]
    DBOperation --> Success[Retorna sucesso<br/>200]
    Success --> End3([Fim])
    
    style ClientValidation fill:#fff9c4
    style ServerValidation fill:#ffccbc
    style Success fill:#c8e6c9
```

### Validações por Campo

| Campo | Client-Side | Server-Side |
|-------|-------------|-------------|
| **Email** | Formato válido | Formato + Existência no BD |
| **Senha** | Requisitos | Requisitos + Hash |
| **Nome** | Não vazio | Não vazio + Sanitização |
| **Token** | Formato | Formato + Validade + Expiração |

---

## Próximos Passos

### Backend Implementation

#### 1. Schema Updates

Adicionar campos ao model `Usuario`:

```prisma
model Usuario {
  // ... campos existentes
  resetToken        String?
  resetTokenExpiry  DateTime?
  // ...
}
```

**Migration**:
```bash
npx prisma migrate dev --name add_password_reset_fields
```

---

#### 2. Implementar forgot-password

```typescript
// app/api/auth/forgot-password/route.ts
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  
  // 1. Buscar usuário
  const user = await prisma.usuario.findUnique({ where: { email } });
  
  if (user) {
    // 2. Gerar token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora
    
    // 3. Salvar no banco
    await prisma.usuario.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry }
    });
    
    // 4. Enviar email
    await sendPasswordResetEmail(email, resetToken);
  }
  
  // Sempre retorna sucesso (segurança)
  return NextResponse.json({ 
    message: "Se o email existir, você receberá instruções." 
  });
}
```

---

#### 3. Implementar reset-password

```typescript
// app/api/auth/reset-password/route.ts
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  const { token, newPassword } = await request.json();
  
  // 1. Buscar usuário com token válido
  const user = await prisma.usuario.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() }
    }
  });
  
  if (!user) {
    return NextResponse.json(
      { error: "Token inválido ou expirado" },
      { status: 400 }
    );
  }
  
  // 2. Hash da nova senha
  const senhaHash = await bcrypt.hash(newPassword, 10);
  
  // 3. Atualizar senha e limpar token
  await prisma.usuario.update({
    where: { id: user.id },
    data: {
      senhaHash,
      resetToken: null,
      resetTokenExpiry: null
    }
  });
  
  return NextResponse.json({ 
    message: "Senha redefinida com sucesso!" 
  });
}
```

---

#### 4. Implementar change-password

```typescript
// app/api/auth/change-password/route.ts
import bcrypt from 'bcrypt';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // 1. Verificar autenticação
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }
  
  const { currentPassword, newPassword } = await request.json();
  
  // 2. Buscar usuário completo
  const user = await prisma.usuario.findUnique({
    where: { id: currentUser.userId }
  });
  
  // 3. Validar senha atual
  const isValid = await bcrypt.compare(currentPassword, user.senhaHash);
  if (!isValid) {
    return NextResponse.json(
      { error: "Senha atual incorreta" },
      { status: 400 }
    );
  }
  
  // 4. Hash e atualizar
  const senhaHash = await bcrypt.hash(newPassword, 10);
  await prisma.usuario.update({
    where: { id: user.id },
    data: { senhaHash }
  });
  
  return NextResponse.json({ 
    message: "Senha alterada com sucesso!" 
  });
}
```

---

#### 5. Integração de Email

**Opções de Serviço**:
- [Resend](https://resend.com) (Recomendado)
- SendGrid
- AWS SES
- Mailgun

**Template de Email**:
```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  email: string, 
  token: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_URL}/redefinir-senha/${token}`;
  
  await resend.emails.send({
    from: 'StreamShare <atendimento@streamshare.com.br>',
    to: email,
    subject: 'Redefinir sua senha - StreamShare',
    html: `
      <h1>Redefinir Senha</h1>
      <p>Clique no link abaixo para redefinir sua senha:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Este link expira em 1 hora.</p>
      <p>Se você não solicitou isso, ignore este email.</p>
    `
  });
}
```

---

### Melhorias Futuras

- [ ] **Rate Limiting**: Prevenir ataques de força bruta
- [ ] **OAuth Google**: Autenticação social
- [ ] **2FA**: Autenticação de dois fatores
- [ ] **Logs de Auditoria**: Rastrear tentativas de login
- [ ] **Sessões Múltiplas**: Gerenciar dispositivos
- [ ] **Email Verification**: Verificar email no cadastro
- [ ] **Password Strength Meter**: Indicador visual
- [ ] **Biometria**: Suporte para WebAuthn

---

## 📚 Referências

- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)

---

## 🤝 Contribuindo

Para contribuir com melhorias no sistema de autenticação:

1. Siga os padrões de código estabelecidos
2. Adicione testes para novas funcionalidades
3. Atualize esta documentação
4. Considere implicações de segurança

---

**Última atualização**: 2026-01-14  
**Versão**: 1.0.0  
**Status**: ✅ Frontend Completo | 🔄 Backend em Desenvolvimento
