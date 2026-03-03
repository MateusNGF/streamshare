# Arquitetura de Convites e Solicitações (Invites & Requests)

Este documento detalha as regras de negócio e o funcionamento da arquitetura de convites e solicitações implementada no StreamShare v2, focando em como o sistema garante a integridade dos dados, previne o overbooking e melhora a UX.

## 1. Visão Geral dos Fluxos

O sistema possui três formas principais de um usuário se juntar a uma conta/streaming:

### 1.1. Inscrição Pública (Public Subscription)
- **Origem:** O usuário clica em um link de convite público (Share Token).
- **Ação:** `publicSubscribe` (em `src/actions/public.ts`).
- **Validação:** Realizada diretamente no token público do Streaming. O sistema verifica se há vagas disponíveis através da `StreamingService.ensureCapacity`.

### 1.2. Convites Privados (Private Invites)
- **Origem:** O administrador convida um e-mail específico pelo painel. Envia um e-mail com um link único.
- **Estrutura:** Usa a tabela `Convite` com um token único.
- **Ação:** `acceptInvite` ou `publicSubscribe` com flag `isPrivateInvite` (dependendo de onde o usuário aceite).
- **Validação:** Feita através da `InviteService.validateInviteForAcceptance`. Verifica se o status é `pendente`, se a data de validade (`expiresAt`) não expirou (padrão de 7 dias), e se ainda existem vagas no grupo (caso atrelado a um streaming).

### 1.3. Solicitações via Explorer (Requests)
- **Origem:** O usuário encontra um grupo público no "Explorer" e clica em "Solicitar Vaga".
- **Estrutura:** Cria um registro na tabela `Convite` com status `solicitado`. Não gera `token`.
- **Validade:** A solicitação tem uma validade (SLA) de **48 horas**. Se o Host não responder dentro deste prazo, ela expira para o usuário e some do painel do Host.
- **Ações:** `requestParticipation`, `approveRequest`, `rejectRequest`.

## 2. Prevenção de Overbooking (Sincronização e Concorrência)

Para impedir o problema de concorrência onde múltiplos usuários aceitam convites no mesmo milésimo de segundo e ultrapassam o limite de participantes, o sistema adota regras rigorosas centralizadas em **Serviços** (`src/services/`):

### 2.1. Centralização da Regra Atômica
Toda vezção que resulta na entrada de um usuário em um grupo (aceite de convite, aprovação de solicitação, etc.) passa obrigatoriamente pela função `StreamingService.ensureCapacity(streamingId, quantity, tx)` **dentro de uma transação do Prisma (`tx`)**.

Isso garante que:
- O cálculo de `Participantes Atuais + Solicitação` ocorre simultaneamente à criação da assinatura.
- Se o limite for excedido, a transação falha e o banco realiza o *rollback*, lançando um erro amigável ao usuário.

### 2.2. Efeito Colateral: Lotação (Streaming Full)
Quando uma assinatura é efetuada com sucesso e as vagas do Streaming chegam a **zero**, o sistema toma uma atitude proativa por meio da `InviteService.handleStreamingFull(streamingId, tx)`.

- **Ação:** O serviço busca todas as solicitações (status `solicitado`) pendentes para aquele grupo.
- **Atualização:** Marca todas as encontradas em lote como `recusado`.
- **Notificação:** Dispara automaticamente notificações (e-mail/in-app) para esses usuários, com o título *"Vagas Esgotadas"*, avisando que as vagas acabaram antes da aprovação.

Este mecanismo resolve o problema da *"Black Box"*, onde o participante ficava esperando indefinidamente por uma resposta do Host.

## 3. Coleta de Dados Críticos (UX Baseada em Contexto)

O sistema exige formas de comunicação eficiente (WhatsApp) e documentos (CPF) em instâncias específicas para funcionar sem atritos operacionais.

### Lógica Mista Frontend/Backend (`ParticipantService` e Formulários)
Quando um usuário (logado ou não) acessa formulários de aceite (como `<JoinStreamingForm />` ou `<AcceptInviteButton />`), a UI checa os dados de perfil dele primeiro:

1. **WhatsApp Mínimo:** Se o usuário **não** possui WhatsApp em seu perfil, o formulário o obriga a preencher *antes* de finalizar o aceite. (Requisito mínimo para a comunicação do admin).
2. **CPF para Pagamentos:** Se trata-se de um streaming com `valorIntegral > 0` e o usuário não informou seu CPF previamente, a interface solicita o campo *antes* do *checkout*, impedindo a quebra de processos de faturamento (`billing`).

Ao submeter o formulário, além de atualizar o registro de `Participante` atrelado ao grupo/conta (`ParticipantService.findOrCreateParticipant`), o Service **sincroniza (upsert) os dados capturados** (Nome, WhatsApp) no perfil *global* do `Usuario` também. Ou seja, se preencher num grupo, não precisará preencher num futuro grupo.
