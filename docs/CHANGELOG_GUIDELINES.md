# Protocolo de Atualização: Changelog Público

Este documento estabelece o padrão obrigatório para a manutenção do histórico de alterações visível em `/status`. O objetivo é fornecer transparência técnica com segurança e clareza para o usuário final.

## 🚀 Fluxo de Trabalho Obrigatório

Toda atualização deve seguir estritamente estes três passos:

### 1. Diagnóstico Contextual (Obrigatório)
Antes de escrever uma única linha, você **deve** entender a história real do dia.
- **Ação**: Execute `git log --since="today" --patch` (ou use o hash específico).
- **Objetivo**: Não leia apenas o título do commit. Leia o *diff*. Entenda **por que** a alteração foi feita e qual o impacto real no sistema.
- **Análise**: Se houve 10 commits de "fix", entenda se foi uma falha de lógica, uma vulnerabilidade ou apenas um ajuste visual.

### 2. Higienização de Segurança (Página Pública)
O changelog é **PÚBLICO**. Informações internas são ativos de segurança.
- ❌ **PROIBIDO**: Nomes de bibliotecas (`Stripe`, `Radix`, `Prisma`), nomes de tabelas, nomes de funções internas, IPs, detalhes de infraestrutura ou segredos.
- ✅ **OBRIGATÓRIO**: Use terminologia de negócio. "Gateway de pagamento", "Banco de dados central", "Interface de usuário", "Motor de validação".

### 3. Redação Objetiva e Incisiva
Escreva para quem usa, não para quem programa.
- **O quê?**: Identifique a funcionalidade alterada.
- **Onde?**: Especifique o módulo ou área (ex: Módulo de Faturamento, Fluxo de Cadastro).
- **Por quê?**: Qual o benefício? (ex: "...garantindo maior precisão nos cálculos" ou "...eliminando lentidão no carregamento").

---

## 🛠️ Padrão de Escrita

### Categorias Permitidas
Mantenha a consistência. Use apenas estas categorias:
- **Faturamento** | **Interface** | **Precisão** | **Performance** | **Segurança** | **Mobile** | **Experiência** | **Integrações** | **Automação**

### Exemplos de Entrada Ideal

**Caso 1: Eficiência de Carregamento**
```typescript
{
    category: "Performance",
    description: "Implementação de carregamento seletivo de módulos na **Interface de Usuário**, reduzindo drasticamente o tempo de resposta inicial e otimizando a navegação em conexões instáveis."
}
```

**Caso 2: Regras Financeiras**
```typescript
{
    category: "Faturamento",
    description: "Refatoração do motor de processamento no **Módulo Financeiro**, garantindo precisão centesimal em renovações e eliminando riscos de cobranças duplicadas em transações simultâneas."
}
```

---

## 🛡️ Checklist Anti-Exposição

Antes de salvar no `StatusPageClient.tsx`, valide:
1. [ ] Consultei o histórico do Git para entender o contexto real?
2. [ ] O texto informa claramento **o que** e **onde** mudou?
3. [ ] Removi qualquer nome de tecnologia específica (Stack)?
4. [ ] Removi qualquer termo técnico interno (Nomes de funções/classes)?
5. [ ] A descrição é focada no benefício ou na correção do problema?

---

## ⌨️ Comandos Úteis para Análise

| Objetivo | Comando Git |
| :--- | :--- |
| **Resumo do Dia** | `git log --since="00:00:00" --oneline` |
| **Entender o Contexto** | `git show <hash>` |
| **Arquivos Afetados** | `git diff --name-only <hash>^ <hash>` |
| **Impacto na Lib** | `git log -p -- src/lib/` |

---

## 📍 Localização Técnica
As atualizações devem ser inseridas no topo do array `changelogData` em:
`src/components/status/StatusPageClient.tsx`
