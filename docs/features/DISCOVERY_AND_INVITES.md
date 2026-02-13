# 🗺️ Módulo de Descoberta, Convites e Solicitações

Este documento descreve a arquitetura e os fluxos do sistema de expansão de rede do StreamShare, permitindo que novos membros entrem em grupos via busca pública ou convites diretos.

## 📌 Visão Geral

O módulo resolve dois problemas principais:
1. **Descoberta:** Como usuários encontram vagas disponíveis em grupos públicos.
2. **Onboarding:** Como administradores trazem novos membros para seus grupos de forma segura e automatizada.

---

## 🏗️ Arquitetura e Clean Code

A implementação segue os princípios de separação de preocupações (SRP) e injeção de dependência implícita via services:

1. **Actions (Camada de Transporte):** Localizadas em `src/actions/`. Validam a sessão (`getCurrentUser`), o contexto do administrador (`getContext`) e tratam o retorno para a UI.
2. **Services (Camada de Negócio):** Localizadas em `src/services/`. Contêm a lógica pesada, transações de banco de dados e validações de regras de negócio (ex: verificar se ainda há vagas antes de aceitar um convite).
3. **UI Components:** Componentes "burros" em `src/components/ui/` e componentes de feature inteligentes que gerenciam estados de modal e transitions.

---

## 💾 Modelo de Dados (Prisma)

Novos elementos adicionados ao schema:

### Enums
- `StatusParticipante`: `ativo`, `pendente`, `recusado`, `bloqueado`, `saiu`.
- `StatusConvite`: `pendente`, `aceito`, `recusado`, `expirado`.

### Modelos
- **Convite:** Armazena e-mail, token único, validade e relação opcional com um `streamingId`.
- **Participante (Atualizado):** Agora possui o campo `status` para gerenciar o fluxo de aprovação.

---

## 🔄 Fluxos de Trabalho

### 1. Descoberta (Explore)
- **Local:** `/explore`
- **Lógica:** O `exploreService` busca `Streamings` de contas que possuem o atributo `isPublico: true` em seus grupos.
- **Filtro:** Apenas streamings com `isAtivo: true` e que possuam vagas disponíveis (`count(assinaturas) < limiteParticipantes`) são exibidos.

### 2. Solicitação de Participação (User ➡️ Admin)
1. Usuário clica em "Tenho Interesse" em um card no Explore.
2. Uma entrada em `Participante` é criada com `status: pendente`.
3. Os administradores/owners do grupo recebem uma `Notificacao` interna.
4. O Admin pode aceitar ou recusar via `/solicitacoes`.
5. Ao aprovar, o status do participante muda para `ativo` e o usuário é notificado.

### 3. Sistema de Convites (Admin ➡️ User)
1. Admin acessa `/participantes` e clica em "Convidar Membro".
2. Um `Convite` é gerado com um token único (UUID) e validade de 7 dias.
3. Se o convidado já for usuário do sistema, ele recebe uma notificação instantânea.
4. Ao clicar no link de convite (ou aceitar via `/convites`), o sistema executa uma **transação atômica**:
   - Marca o convite como `aceito`.
   - Cria/Reativa o registro de `Participante`.
   - Cria a `Assinatura` correspondente (se o convite foi para um streaming específico).
   - Notifica o Admin sobre o sucesso.

---

## 🛠️ Validações de Segurança

- **Isolamento Multi-tenant:** Administradores só podem gerenciar solicitações do seu próprio `contaId` obtido via contexto seguro.
- **Race Conditions:** A aceitação de convite verifica a disponibilidade de vagas *dentro* da transação SQL (Level: Serializable em potencial ou via lógica de lock) para evitar overbooking.
- **Re-solicitação:** Usuários que saíram do grupo no passado podem solicitar entrada novamente, atualizando o registro existente em vez de criar duplicatas.

---

## 📈 Próximos Passos
- Integração com serviço de e-mail (Resend/SendGrid) para envio dos links de convite.
- Landing page pública para aceitação de convites por usuários não logados.
