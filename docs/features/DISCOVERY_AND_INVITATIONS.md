# Sistema de Descoberta e Convites (Discovery & Invitations)

Este documento detalha a implementação técnica e funcional do ecossistema de crescimento do StreamShare, composto por três pilares: **Explorer (Descoberta)**, **Solicitações de Entrada** e **Convites Diretos**.

## Visão Geral

O sistema permite duas formas de entrada em streamings:
1.  **Passiva (Convite):** O administrador convida um usuário via e-mail.
2.  **Ativa (Solicitação):** O usuário encontra um streaming público no Explorer e solicita entrada.

Ambos os fluxos convergem para a criação de um `Participante` ativo e uma `Assinatura` (com cobranças geradas automaticamente).

---

## Módulos e Arquivos Principais

| Módulo | Arquivos Principais | Responsabilidade |
| :--- | :--- | :--- |
| **Discovery** | [`src/actions/streamings.ts`](../../src/actions/streamings.ts) | Busca de streamings públicos, filtros e cálculo de vagas. |
| **Frontend** | [`src/app/(dashboard)/explore/page.tsx`](../../src/app/(dashboard)/explore/page.tsx) | Interface de busca (Explorer). |
| **Requests** | [`src/actions/requests.ts`](../../src/actions/requests.ts) | Backend para solicitar vaga, aprovar ou recusar solicitações. |
| **Invites** | [`src/actions/invites.ts`](../../src/actions/invites.ts) | Backend para enviar convites diretos, validar tokens e aceitar. |
| **UI** | [`src/components/participantes/InviteModal.tsx`](../../src/components/participantes/InviteModal.tsx) | Modal para envio de convites pelo admin. |
| **Token Page** | [`src/app/convite/[token]/page.tsx`](../../src/app/convite/[token]/page.tsx) | Landing page pública para aceitar convites. |

---

## 1. Explorer (Descoberta)

O módulo Explorer permite que usuários encontrem streamings públicos com vagas disponíveis.

### Funcionalidades
-   **Listagem Pública:** Exibe apenas streamings com `isPublico: true` e `isAtivo: true`.
-   **Filtros:**
    -   Por Nome ou Catálogo (Search).
    -   Por Categoria (CatalogoId).
    -   "Minha Conta" vs "Outras Contas".
-   **Status do Usuário:** Para cada card, o sistema calcula a relação do usuário logado:
    -   `participando`: Já possui assinatura ativa.
    -   `solicitado`: Já enviou solicitação (aguardando aprovação).
    -   `convidado`: Possui convite pendente.
    -   `recusado`: Solicitação anterior foi recusada.

### Regra de Vagas
A disponibilidade é calculada dinamicamente:
`vagasDisponiveis = limiteParticipantes - count(assinaturas_ativas_ou_suspensas)`

---

## 2. Fluxo de Solicitação (Request)

Quando um usuário deseja entrar em um streaming público.

1.  **Solicitar (`requestParticipation`):**
    -   Usuário clica em "Solicitar" no Explorer.
    -   **Validações:** Verifica se há vagas, se usuário já é participante e se já existe solicitação pendente.
    -   **Registro:** Cria um `Convite` com status `solicitado` (sem token de link público).
    -   **Notificação:** Envia `solicitacao_participacao_criada` para todos os admins da conta dona do streaming.

2.  **Aprovação do Admin (`approveRequest`):**
    -   Admin visualiza solicitação na aba "Participantes".
    -   Ao aprovar:
        -   Transação atômica cria `Participante` e `Assinatura`.
        -   Status do convite muda para `aceito`.
        -   Notifica o usuário (`solicitacao_participacao_aceita`).
        -   **Cobrança:** A primeira cobrança é gerada imediatamente (Pro Rata ou Integral, conforme configuração).

3.  **Recusa (`rejectRequest`):**
    -   Admin recusa a solicitação.
    -   Status muda para `recusado`.
    -   Notifica o usuário (`solicitacao_participacao_recusada`).

---

## 3. Fluxo de Convite Direto (Invite)

Quando um administrador convida ativamente uma pessoa.

1.  **Enviar Convite (`inviteUser`):**
    -   Admin informa e-mail e (opcionalmente) seleciona um streaming para vínculo automático.
    -   **Registro:** Cria `Convite` com status `pendente` e um `token` UUID único.
    -   **Validade:** O token expira em 7 dias.
    -   **Notificação:** Se o e-mail já for de um usuário cadastrado, ele recebe notificação interna.

2.  **Acesso ao Link (`/convite/[token]`):**
    -   Acesso público (sem login obrigatório inicial).
    -   Valida validade e status do token.
    -   Exibe detalhes da conta e do streaming (se houver).

3.  **Aceite (`acceptInvite`):**
    -   Requer login/cadastro.
    -   Ao aceitar:
        -   Vincula o usuário ao `Participante`.
        -   Se houver `streamingId` no convite, cria a `Assinatura`.
        -   Dispara notificações de boas-vindas.

---

## Modelo de Dados

O sistema utiliza a tabela `Convite` para unificar convites e solicitações, diferenciados pelo fluxo e status.

### Tabela `Convite`
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | UUID | Identificador único. |
| `email` | String | E-mail do alvo (convidado ou solicitante). |
| `status` | Enum | `pendente` (convite), `solicitado` (request), `aceito`, `recusado`. |
| `token` | UUID | Usado apenas em convites diretos para link externo. |
| `streamingId` | Int? | Vínculo opcional para assinatura automática. |
| `usuarioId` | Int? | FK para usuário (se já existir no sistema). |
| `convidadoPorId` | Int? | Admin que convidou (null em solicitações). |

---

## Regras de Negócio (Business Rules)

| ID | Regra | Implementação |
| :--- | :--- | :--- |
| **BR-01** | **Limite de Vagas** | Solicitações e Aprovações são bloqueadas se `vagasDisponiveis <= 0`. |
| **BR-02** | **Não-Duplicidade** | Usuário não pode solicitar se já participa ou já tem pedido pendente. |
| **BR-03** | **Expiração** | Convites diretos expiram em 7 dias. Solicitações não tem expiração automática definida no código atual (ficam como pendentes até ação do admin). |
| **BR-04** | **Auto-Cobrança** | Ao entrar em um streaming (via convite vinculado ou aprovação), a cobrança é gerada instantaneamente. |
| **BR-05** | **Isolamento** | Admin só pode gerenciar convites/solicitações da sua própria conta (`getContext`). |

## Estratégia de Notificações

| Evento | De -> Para | Tipo | Descrição |
| :--- | :--- | :--- | :--- |
| **Nova Solicitação** | Sistema -> Admins | `solicitacao_participacao_criada` | "Fulano quer entrar no streaming X" |
| **Solicitação Aprovada** | Admin -> Usuário | `solicitacao_participacao_aceita` | "Sua entrada no streaming X foi aprovada" |
| **Solicitação Recusada** | Admin -> Usuário | `solicitacao_participacao_recusada` | "Sua entrada foi recusada" |
| **Convite Recebido** | Admin -> Usuário | `convite_recebido` | "Você tem um convite para o streaming Y" |
| **Convite Aceito** | Usuário -> Admins | `convite_aceito` | "Fulano aceitou o convite" |

---

## 4. Link Público de Assinatura (Direct Share)

Permite que o administrador compartilhe um link direto para assinatura de um streaming específico, sem necessidade de convite por e-mail prévio.

### Fluxo de Compartilhamento
1.  **Geração (`generateStreamingShareLink`):**
    -   Admin clica em "Compartilhar" no card do streaming.
    -   Define validade (ex: 30min, 1 dia, Permanente).
    -   Sistema gera um **JWT** assinado contendo `{ streamingId, type: 'share_link' }`.
    -   URL gerada: `/assinar/[token-jwt]`.

2.  **Acesso Público (`/assinar/[token]`):**
    -   Qualquer pessoa com o link pode acessar.
    -   Página exibe detalhes do streaming (Nome, Valor, Vagas).
    -   **Checkout Seguro:** Usuário preenche dados (ou loga) e confirma assinatura.

3.  **Diferença para Convite e Explorer:**
    -   **Convite:** Focado em pessoa específica (e-mail).
    -   **Explorer:** Público geral (vitrine).
    -   **Link Direto:** Distribuição controlada (ex: Grupo de WhatsApp), ignorando a vitrine do Explorer mas sem restringir a um e-mail específico inicial.
