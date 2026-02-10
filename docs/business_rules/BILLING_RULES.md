# Regras de Negócio: Cobranças e Assinaturas

Este documento detalha as regras de negócio implementadas para o ciclo de vida das assinaturas, geração de cobranças e cancelamento.

## 1. Fluxograma de Renovação (Billing Service)

O serviço de cobrança (`billing-service.ts`) executa a seguinte lógica para cada assinatura ativa:

```mermaid
flowchart TD
    Start[Início do Processo] --> Fetch[Buscar Assinaturas 'Ativas']
    Fetch --> Loop{Para cada Assinatura}
    
    Loop --> CheckCancel{Possui DataCancelamento?}
    
    %% Fluxo de Cancelamento Agendado
    CheckCancel -- SIM --> CheckPaid[Período Pago acabou?]
    CheckPaid -- SIM (Hj > Fim) --> Finalize[Mudar Status para 'Cancelada']
    Finalize --> NotifyEnd[Notificar Encerramento]
    CheckPaid -- NÃO --> Skip1[Ignorar (Ainda vigente)]
    
    %% Fluxo de Renovação Normal
    CheckCancel -- NÃO --> CheckDue[Está a <= 5 dias do vencimento?]
    
    CheckDue -- NÃO --> Skip2[Ignorar (Ainda não venceu)]
    CheckDue -- SIM --> CalcDate[Calcular Próximo Vencimento]
    
    subgraph "Lógica de Datas (Drift Prevention)"
        CalcDate --> Anchor{Tem Data Anchor?}
        Anchor -- SIM --> Snap[Ajustar dia p/ Data Original]
        Anchor -- NÃO --> AddMonth[AddMonths padrão]
    end
    
    Snap --> Idempotency{Já existe cobrança p/ esta data?}
    AddMonth --> Idempotency
    
    Idempotency -- SIM --> Skip3[Ignorar (Duplicidade)]
    Idempotency -- NÃO --> Create[Criar Cobrança 'Pendente']
    
    Create --> AutoPay{Cobrança Automática?}
    AutoPay -- SIM --> MarkPaid[Marcar como 'Paga']
    AutoPay -- NÃO --> EndLoop
    MarkPaid --> EndLoop
    
    Finalize --> EndLoop
    Skip1 --> EndLoop
    Skip2 --> EndLoop
    Skip3 --> EndLoop
    
    EndLoop --> Transaction[Commit Transação Unificada]
```

## 2. Lógica de Datas e "Drift" (Deriva)

Para evitar que a data de vencimento "ande" ao longo dos meses (ex: 31/01 -> 28/02 -> 28/03), implementamos uma lógica de **Data Âncora**.

### O Problema
Simplesmente adicionar 1 mês à data anterior causa deriva irreversível quando passamos por meses mais curtos.
- Jan 31 + 1 mês = Fev 28
- Fev 28 + 1 mês = Mar 28 (Perdeu-se 3 dias)

### A Solução (Anchor Date)
Toda renovação usa a `dataInicio` original da assinatura como âncora.
1. Calculamos o mês alvo (ex: Março).
2. Tentamos forçar o dia para o dia da `dataInicio` (ex: 31).
3. Se o mês alvo não tem esse dia (ex: Fev tem 28), usamos o último dia do mês.
4. Se o mês alvo TEM esse dia, usamos o dia original.

**Exemplo Prático (Assinatura iniciada em 31/01):**
- **Renovação de Fev**: Mês alvo Fev. Dia 31 não existe. Ajusta para **28/02** (ou 29).
- **Renovação de Mar**: Mês alvo Mar. Dia 31 existe. Ajusta para **31/03**. -> **Recuperou a data correta!**

## 3. Fluxo de Cancelamento (Churn)

```mermaid
sequenceDiagram
    participant User
    participant System
    participant DB
    
    User->>System: Solicita Cancelamento
    System->>DB: Busca Última Cobrança Paga
    
    alt Não tem período vigente (Inadimplente ou Nunca pagou)
        System->>DB: Update Status = 'cancelada'
        System-->>User: "Assinatura cancelada imediatamente"
        Note right of System: Acesso Revogado
    else Tem período vigente (Pago até dia X)
        System->>DB: Update dataCancelamento = Hoje
        System->>DB: Manter Status = 'ativa'
        System-->>User: "Cancelamento agendado até dia X"
        Note right of System: Acesso Mantido
    end
```

## 4. Idempotência e Concorrência

Para evitar cobranças duplicadas (ex: Cron rodando 2x, ou clique duplo no botão de renovar manual), utilizamos uma chave composta lógica.

- **Chave de Unicidade**: `assinaturaId` + `periodoInicio`.
- Antes de criar qualquer cobrança, o sistema faz uma consulta `findFirst` buscando exatamente essa combinação.
- Se encontrar, o processo é abortado silenciosamente (log de warning), garantindo que nunca haverá duas cobranças para o mesmo mês de referência.

- **Loop Único**: Em cada execução do processo de cobrança, ele gera **apenas uma** nova cobrança por assinatura.
- **Prevenção de Inadimplência**: Se uma assinatura possuir cobranças `pendentes` cujo `periodoFim` já passou, o sistema **não gerará** a próxima renovação até que a pendência seja resolvida. Isso evita o acúmulo de dívida infinita.
- **Suspensão Automática**: Se uma cobrança `pendente` estiver vencida há mais de **3 dias**, a assinatura é movida automaticamente para o status `suspensa`.
- **Catch-up**: Se uma assinatura estiver com status `ativa` mas atrasada (sem cobrança gerada para o período atual), o sistema gerará a cobrança retroativa na primeira oportunidade, desde que não haja impedimento por inadimplência.

- **Valor na Base**: O campo `valor` na tabela `Assinatura` deve ser interpretado sempre como o **VALOR MENSAL** base, independente da frequência.
- **Cálculo de Ciclo**: O valor final da cobrança é calculado como `valorMensal * multiplicadorFrequencia`. 
- **Transparência Financeira (Markup)**: A interface deve sempre exibir o "Custo Base" (Valor Integral / Limite de Vagas) para auxiliar o administrador na definição da margem de lucro.
- **Previsão de Ciclo**: Sempre que a frequência for diferente de 'mensal', a interface deve exibir explicitamente o valor total que será cobrado no ciclo (ex: Valor Mensal de R$ 27,00 em ciclo Trimestral = Cobrança de R$ 81,00).

## 7. Validação de UI e Reatividade

- **Inputs Monetários**: Utilizar o componente `CurrencyInput` para garantir máscaras de moeda consistentes.
- **Fallback de Valor**: O sistema deve permitir campos de valor vazios durante a edição (estado temporário) sem resetar automaticamente para zero, garantindo fluidez no uso do backspace.
- **Cálculo em Tempo Real**: Toda alteração no `valor` ou `frequencia` deve disparar o recálculo imediato dos indicadores de lucro e resumos de ciclo.

---

## Tabelas de Status

| Status | Descrição | Acesso | Gera Cobrança? |
| :--- | :--- | :--- | :--- |
| `ativa` | Assinatura regular vigente. | SIM | SIM |
| `ativa` (c/ dataCancelamento) | Cancelamento solicitado ("Cancelamento Agendado"). | SIM | NÃO |
| `suspensa` | Pagamento pendente/atrasado (> 3 dias). | NÃO | NÃO |
| `cancelada` | Vínculo encerrado definitivamente. | NÃO | NÃO |
