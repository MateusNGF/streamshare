# Auditoria de Sistema e Documentação Técnica - StreamShare v2

**Data**: 07/02/2026
**Responsável**: Arquiteto de Software e Analista de Sistemas Sênior (IA)
**Versão do Sistema Analisada**: v2.0

---

## 1. DIRETRIZES DE ANÁLISE

### 1.1 Coerência de Fluxo
A aplicação apresenta um fluxo lógico sólido e bem estruturado, seguindo o padrão de arquitetura MVC (Model-View-Controller) adaptado para Next.js (Server Actions como Controllers).

*   **Entradas (Inputs)**: Os dados são recebidos via Server Actions com tipagem forte (TypeScript) e validação de schema (Zod) antes de tocar o banco de dados.
*   **Processamento**: Utilização correta de transações (`prisma.$transaction`) para garantir atomicidade em operações complexas (ex: Criar Assinatura + Gerar Cobrança + Notificar).
*   **Saídas (Outputs)**: Retorno padronizado de objetos atualizados e revalidação de cache (`revalidatePath`) garantindo que a UI reflita o estado atual do servidor imediatamente.

### 1.2 Consolidação de Informações
O modelo de dados (Schema Prisma) está bem normalizado:
*   **Centralização**: A entidade `Conta` atua como *root aggregate* para o multi-tenancy, garantindo isolamento de dados.
*   **Segregação**: `Participante` é separado de `Usuario`, permitindo que uma pessoa seja gerenciada sem necessariamente ter acesso de login ao sistema.
*   **Reuso**: `StreamingCatalogo` permite padronização visual (ícones, cores) enquanto `Streaming` guarda as regras de negócio específicas da conta (valores, limites).

### 1.3 Integridade e Regras de Negócio
As regras de negócio estão implementadas no nível da aplicação (Server Actions) e reforçadas no banco de dados (Constraints).

*   **Integridade Referencial**: Bloqueios lógicos impedem a exclusão de registros em uso (ex: `deleteStreaming` falha se houver assinaturas ativas).
*   **Limites do Plano**: Validação rigorosa de limites (número de streamings, participantes) baseada no plano da conta (`streamings.ts`).
*   **Unicidade**: Garantida por índices únicos compostos (ex: `@@unique([contaId, cpf])` em Participante), prevenindo duplicação de dados sensíveis dentro do mesmo tenant.

### 1.4 Identificação de Gargalos
Apesar da robustez, alguns pontos merecem atenção para escalabilidade:

1.  **Cálculo de Status em Tempo Real**:
    *   **Ponto**: O status "Em Atraso" das cobranças é calculado via JavaScript na leitura (`getKPIsFinanceiros`).
    *   **Risco**: Em dashboards com milhares de registros, isso pode impactar a performance de leitura.
    *   **Sugestão**: Implementar um *worker* diário que atualiza o status no banco para consultas diretas.

2.  **Operações em Lote (Bulk Actions)**:
    *   **Ponto**: A criação de múltiplas assinaturas (`createBulkAssinaturas`) itera dentro de uma transação.
    *   **Risco**: Transações longas podem causar *lock* no banco de dados em cenários de alta concorrência.
    *   **Sugestão**: Utilizar `createMany` onde possível ou processar em *chunks* menores.

---

## 2. ESTRUTURA DA DOCUMENTAÇÃO TÉCNICA

### 2.1 Visão Geral
O **StreamShare** é uma plataforma SaaS *multi-tenant* para gestão financeira de grupos de assinatura compartilhada. Sua arquitetura resolve o problema de **controle de micro-pagamentos recorrentes**, oferecendo automação de cobranças, notificações via WhatsApp e isolamento seguro de dados por conta.

**Proposta de Valor Técnica**:
*   Arquitetura *Serverless-ready* (Next.js App Router).
*   Segurança robusta com isolamento lógico de tenants.
*   Automação de ciclo de vida financeiro (Pendente -> Pago/Atrasado).

### 2.2 Mapeamento de Casos de Uso (UC)

#### UC-01: Gestão de Assinaturas
*   **ID**: UC-MANAGE-SUB
*   **Ator**: Administrador
*   **Fluxo Principal**:
    1.  Admin acessa detalhes do participante.
    2.  Seleciona "Nova Assinatura".
    3.  Escolhe o serviço (Streaming) e a frequência de pagamento.
    4.  Sistema valida vagas e cria a assinatura.
    5.  Sistema gera automaticamente a primeira cobrança pendente.
    6.  Sistema envia notificação de boas-vindas (WhatsApp/In-app).
*   **Fluxo de Exceção**:
    *   **Sem Vagas**: Sistema exibe erro informando limite atingido ([`streamings.ts`](../src/actions/streamings.ts)).
    *   **Duplicidade**: Sistema bloqueia se participante já assina o serviço.

#### UC-02: Processamento de Cobranças
*   **ID**: UC-PROCESS-BILLING
*   **Ator**: Sistema (Automático) ou Admin (Manual)
*   **Fluxo Principal**:
    1.  Rotina identifica assinatura ativa.
    2.  Calcula data de vencimento baseada na frequência.
    3.  Gera registro de `Cobranca`.
    4.  Admin confirma recebimento (upload de comprovante opcional).
    5.  Sistema marca como `PAGO` e atualiza KPIs.
*   **Fluxo de Exceção**:
    *   **Atraso**: Se não pago até vencimento, sistema sinaliza visualmente e permite envio de cobrança via WhatsApp.

#### UC-03: Notificações Inteligentes
*   **ID**: UC-NOTIFY
*   **Ator**: Sistema
*   **Fluxo Principal**:
    1.  Evento de negócio ocorre (ex: Cobrança gerada).
    2.  Sistema consulta configuração de WhatsApp da conta.
    3.  **WhatsApp Oficial (Meta)**: Envia mensagem template automaticamente via API Cloud.
    4.  **WhatsApp Link (wa.me)**: Gera link para envio manual se API não configurada.
    5.  Registra log para auditoria e prevenção de spam (bloqueio de 24h).

### 2.3 Dicionário de Regras de Negócio

| Regra | Descrição | Implementação |
| :--- | :--- | :--- |
| **RN-01: Isolamento Multi-tenant** | Todo acesso a dados deve filtrar obrigatoriamente pelo `contaId` do usuário autenticado. | [`getContext()`](../src/lib/action-context.ts) em todas as Actions. |
| **RN-02: Limite de Vagas** | Não é permitido criar assinatura se `total_assinaturas >= streaming.limite`. | [`assinaturas.ts`](../src/actions/assinaturas.ts) (linha 145) e [`streamings.ts`](../src/actions/streamings.ts). |
| **RN-03: Integridade de Exclusão** | Entidades (Participante, Streaming) não podem ser excluídas se possuírem vínculos ativos (Assinaturas). | `deleteParticipante` e `deleteStreaming`. |
| **RN-04: Anti-Spam WhatsApp** | Proibido enviar notificação automática para o mesmo participante/gatilho em intervalo < 24h. | [`cobrancas.ts`](../src/actions/cobrancas.ts) (verificação de `WhatsAppLog`). |
| **RN-05: Validação Financeira** | Valores de cobrança e assinatura devem ser sempre positivos. Datas não podem ser retroativas (> 1 ano). | [`assinaturas.ts`](../src/actions/assinaturas.ts) e validators. |

### 2.4 Parecer de Viabilidade

**Status**: ✅ **APROVADO PARA PRODUÇÃO**

A arquitetura do StreamShare v2 demonstra maturidade técnica elevada. O código é limpo, utiliza padrões modernos de React/Next.js e possui camadas de proteção contra erros comuns (transações de banco de dados, validação de schema).

**Recomendações de Evolução**:
1.  **Testes Automatizados**: A lógica de negócio é crítica; recomenda-se implementar testes unitários (Jest/Vitest) para as Server Actions, cobrindo especialmente os cálculos financeiros e validações de limite.
2.  **Job Queue**: Para o envio de notificações em massa (ex: renovação mensal de 1000 assinaturas), considerar mover o processamento para uma fila (ex: BullMQ/Redis) para não onerar o tempo de resposta da requisição web.
3.  **Webhook Strip**: Assegurar que o endpoint de Webhook do Stripe (`api/webhooks/stripe`) tenha verificação de assinatura robusta e idempotência para evitar processamento duplicado de pagamentos.
