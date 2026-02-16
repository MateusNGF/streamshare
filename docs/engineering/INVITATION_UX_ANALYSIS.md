# Análise de Engenharia: Unificação de UX de Convites e Descoberta

## 1. Diagnóstico Atual

Atualmente, o sistema possui três fluxos de entrada que, embora tecnicamente distintos, atendem ao mesmo objetivo do usuário (Preencher uma vaga):
1.  **Dashboard:** O Admin vê o card, mas não tem ações rápidas (`StreamingCard.tsx` é estático).
2.  **Aba Streamings:** O Admin tem um botão "Link/Share" que abre um modal apenas para gerar links (`StreamingDetailCard.tsx`).
3.  **Aba Participantes:** O Admin tem um botão "Convidar" que abre um modal apenas para e-mail (`InviteModal.tsx`).

### Problemas Identificados
-   **Fragmentação de Ações:** O usuário precisa decidir *a priori* o método ("Vou por link" ou "Vou por e-mail") antes de clicar, navegando para telas diferentes.
-   **Dashboard Passivo:** A tela inicial (onde o usuário passa mais tempo) não permite ações rápidas como "Copiar Link" ou "Convidar", obrigando navegação desnecessária.
-   **Componentes Duplicados:** `StreamingCard` e `StreamingDetailCard` têm propósitos visuais similares mas implementações divergentes.

---

## 2. Propostas de Melhoria

### Proposta A: Modal de "Adicionar Membro" Unificado
Transformar o `ShareStreamingModal` e o `InviteModal` em um único componente poderoso: **`AddMemberModal`**.

-   **Contexto:** Pode ser aberto globalmente (selecionando o streaming) ou contextualmente (já com streaming selecionado).
-   **Tabs:**
    -   **[E-mail]:** Funcionalidade do atual `InviteModal`.
    -   **[Link]:** Funcionalidade do atual `ShareStreamingModal`.
    -   **[QR Code]:** (Futuro) Para acesso mobile rápido.
-   **Benefício:** Reduz a carga cognitiva. O Admin clica em "Adicionar" e depois escolhe o método.

### Proposta B: Ativar Dashboard Cards
Tornar o `StreamingCard` (Dashboard) funcional.

-   Implementar menu _Dropdown_ no botão de "três pontos" (atualmente decorativo).
-   **Ações:**
    -   "Copiar Link de Convite" (Ação rápida).
    -   "Enviar Convite por Email".
    -   "Ver Detalhes" (Navega para /streamings).

### Proposta C: Unificação de Feedback Visual
Melhorar a distinção visual na lista de participantes/explorar entre:
-   `Solicitado` (Requer ação do Admin).
-   `Convidado` (Aguarda ação do Usuário).
-   `Participando`.

---

## 3. Plano de Execução Sugerido

1.  **Fase 1 (Unificação UI):** Criar `AddMemberModal` combinando `InviteModal` e `ShareStreamingModal`.
2.  **Fase 2 (Dashboard):** Refatorar `StreamingCard` para aceitar `actions` (Slot pattern ou props de handlers) e conectar ao novo modal.
3.  **Fase 3 (Limpeza):** Remover os componentes antigos e redundantes.

## 4. Impacto Técnico
-   **Redução de Código:** Menos modais dispersos.
-   **Manutenibilidade:** Lógica de convite centralizada.
-   **UX:** Menos cliques para realizar a tarefa principal (preencher vagas).
