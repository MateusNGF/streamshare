# Segurança e Autenticação

Este documento descreve as implementações de segurança e o fluxo de autenticação do StreamShare v2.

## 1. Visão Geral

O sistema utiliza autenticação baseada em tokens JWT (JSON Web Tokens) armazenados em cookies HTTP-only seguros. A arquitetura foi desenhada para mitigar riscos comuns como XSS, CSRF e sequestro de sessão.

## 2. Autenticação (JWT & Cookies)

- **Token**: O JWT contém o `userId`, `email`, `sessionVersion` e `clientIp` (hash ou raw para verificação).
- **Armazenamento**: Cookies `httpOnly`, `secure` (prod) e `sameSite=lax`.
- **Validade**: Tokens têm tempo de vida curto/médio, mas são invalidados logicamente via banco de dados.

## 3. Gestão de Sessão

### 3.1 Versionamento de Sessão (`sessionVersion`)
Para permitir revogação instantânea de tokens (logout remoto e alteração de senha), implementamos o conceito de `sessionVersion`.
- **No Banco**: O modelo `Usuario` possui um campo `sessionVersion` (Int).
- **No Token**: O payload do JWT inclui a `sessionVersion` do momento do login.
- **Validação**: A cada requisição autenticada (via `getCurrentUser` ou middleware), o sistema compara a versão do token com a do banco.
- **Invalidação**: Ao alterar a senha ou solicitar "Sair de todos os dispositivos", a `sessionVersion` no banco é incrementada, invalidando imediatamente todos os tokens antigos.

### 3.2 Rastreamento de IP e Dispositivo
Para auditoria e segurança:
- **Login**: O IP (`x-forwarded-for`) e o User-Agent são registrados no banco (`lastIp`, `lastUserAgent`) no momento do login.
- **Middleware Check**: O middleware verifica se o IP da requisição coincide com o IP gravado no token.
    - Se houver mudança drástica de IP, a sessão é encerrada preventivamente.
    - O usuário é redirecionado para login com um alerta de segurança (`?reason=ip_change`).

## 4. Funcionalidades de Segurança do Usuário

### 4.1 Logout Remoto
Localizado em **Configurações > Segurança**.
- Permite que o usuário desconecte todas as sessões ativas (web, mobile, outros navegadores) com um clique.
- Ação: Incrementa `sessionVersion` no banco.

### 4.2 Alteração de Senha
- Exige senha atual para confirmação.
- Ao alterar com sucesso, realiza automaticamente o Logout Remoto de outras sessões para garantir que ninguém com a senha antiga permaneça logado.

## 5. Middleware
O `middleware.ts` atua como primeira linha de defesa:
1. Verifica presença do cookie `auth-token`.
2. Decodifica o JWT (stateless) para verificação básica.
3. Valida consistência de IP (Prevenção de Session Hijacking).
4. Redireciona para login em caso de falha, com mensagens contextuais.

## 6. Auditoria (Logs)
- Tentativas de login falhas (futuro).
- Mudanças de IP suspeitas (logadas no middleware).
- Ações críticas (como alteração de senha) são registradas.
