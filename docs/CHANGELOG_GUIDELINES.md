# Diretrizes para Changelog

Este documento define o padrão de escrita e manutenção do changelog público da plataforma StreamShare, exibido na página de Status.

## Localização

O changelog está implementado em:
- **Arquivo**: `src/components/status/StatusPageClient.tsx`
- **Estrutura**: Array `changelogData` (linhas 46-129)

## Estrutura de Dados

```typescript
const changelogData = [
    {
        id: "YYYY-MM-DD",           // ID único para deep linking
        date: "DD/MM/YYYY",         // Data formatada para exibição
        changes: [
            { 
                category: "Categoria", 
                description: "Descrição concisa da mudança." 
            },
            // ... mais mudanças
        ],
    },
    // ... mais datas
];
```

## Categorias Padrão

Use categorias consistentes e descritivas:

### Categorias Técnicas
- **Faturamento** - Sistema de cobranças e assinaturas
- **Precisão** - Melhorias em cálculos e validações
- **Integrações** - Comunicação com serviços externos
- **Automação** - Processos automáticos e agendados
- **Dashboard** - Painéis administrativos e métricas
- **Performance** - Otimizações de velocidade e recursos

### Categorias de Interface
- **Design** - Mudanças visuais e identidade
- **Interface** - Componentes e layouts
- **Mobile** - Otimizações para dispositivos móveis
- **Acessibilidade** - Melhorias A11y
- **Navegação** - Fluxos e rotas

### Categorias de Experiência
- **Experiência** - UX e usabilidade
- **Validação** - Regras de negócio e formulários
- **Comunicação** - Mensagens e notificações
- **Monitoramento** - Observabilidade e status

### Categorias Especiais
- **Globalização** - Internacionalização e multi-moeda
- **Auditoria** - Rastreamento e logs
- **Integridade** - Consistência de dados

## Princípios de Escrita

### 1. Segurança em Primeiro Lugar
❌ **NÃO exponha**:
- Nomes de bibliotecas específicas (ex: "Radix UI", "Matter.js", "Stripe")
- Nomes de componentes internos (ex: "InsectInteractive", "BillingBoard")
- Estrutura de banco de dados (ex: "@@unique([assinaturaId, periodoInicio])")
- Nomes de funções ou métodos (ex: "criarCobrancaInicial")
- Detalhes de APIs externas
- Tecnologias específicas do stack (ex: "Next/Link", "Framer Motion")

✅ **USE termos genéricos**:
- "Sistema de física avançado" ao invés de "Matter.js"
- "Gateway de pagamento" ao invés de "Stripe"
- "Componentes interativos" ao invés de nomes específicos
- "Validações de banco de dados" ao invés de constraints SQL

### 2. Consolidação Inteligente
Agrupe mudanças relacionadas em uma única entrada:

❌ **Evite**:
```typescript
{ category: "Precisão", description: "Cálculos monetários aprimorados." },
{ category: "Dados", description: "Validações de banco de dados." },
{ category: "Confiabilidade", description: "Proteção contra duplicação." },
```

✅ **Prefira**:
```typescript
{ category: "Precisão", description: "Aprimoramento dos cálculos monetários e validações de banco de dados para garantir precisão absoluta e prevenir cobranças duplicadas." },
```

### 3. Foco em Benefícios
Descreva o **valor** para o usuário, não a implementação técnica:

❌ **Evite**: "Refatoração do componente Tooltip para utilizar primitivas Radix UI"
✅ **Prefira**: "Melhorias significativas em tooltips com suporte total para leitores de tela e navegação por teclado"

### 4. Concisão e Clareza
- Máximo de **8-10 entradas por data**
- Descrições entre **60-120 caracteres**
- Linguagem profissional mas acessível
- Evite jargões técnicos desnecessários

### 5. Tom Profissional
- Use voz ativa e tempo presente
- Seja específico sobre melhorias
- Evite superlativos exagerados
- Mantenha consistência de estilo

## Exemplos Práticos

### ✅ Bom Exemplo
```typescript
{
    id: "2026-02-11",
    date: "11/02/2026",
    changes: [
        { category: "Faturamento", description: "Sistema completo de gerenciamento financeiro com indicadores de custo e lucro, badges de status visual e funcionalidades avançadas de cancelamento." },
        { category: "Precisão", description: "Aprimoramento dos cálculos monetários e validações de banco de dados para garantir precisão absoluta e prevenir cobranças duplicadas." },
        { category: "Integrações", description: "Melhorias na comunicação com gateway de pagamento incluindo desduplicação de eventos e sincronização perfeita de transações." },
        { category: "Automação", description: "Processos automáticos para transição de status (Ativo/Atrasado/Suspenso) e reativação imediata após confirmação de pagamento." },
    ],
}
```

### ❌ Exemplo Ruim
```typescript
{
    id: "2026-02-11",
    date: "11/02/2026",
    changes: [
        { category: "Backend", description: "Implementação de idempotência em criarCobrancaInicial." },
        { category: "Database", description: "Adição de @@unique([assinaturaId, periodoInicio])." },
        { category: "API", description: "Desduplicação de webhooks do Stripe via StripeEvent table." },
        { category: "Core", description: "Remoção do campo diasAtraso do schema Prisma." },
        // Muitas entradas técnicas e específicas
    ],
}
```

## Processo de Atualização

### 1. Coleta de Informações via Git

#### Listar Commits do Dia
```bash
# Formato básico: lista commits do dia
git log --since="2026-02-11 00:00:00" --until="2026-02-11 23:59:59" --oneline

# Com ordem cronológica reversa (mais antigo primeiro)
git log --since="2026-02-11 00:00:00" --until="2026-02-11 23:59:59" --pretty=format:"%h - %s" --reverse

# Com informações detalhadas
git log --since="2026-02-11 00:00:00" --until="2026-02-11 23:59:59" --pretty=format:"%h - %an, %ar : %s"
```

#### Analisar Mudanças Específicas
```bash
# Ver detalhes de um commit específico
git show <commit-hash>

# Ver apenas arquivos modificados
git show --name-only <commit-hash>

# Ver estatísticas de mudanças
git show --stat <commit-hash>

# Ver diff completo de um commit
git diff <commit-hash>^ <commit-hash>
```

#### Buscar Commits por Padrão
```bash
# Buscar commits que modificaram arquivos específicos
git log --since="2026-02-11 00:00:00" --oneline -- src/lib/billing/

# Buscar commits por mensagem
git log --since="2026-02-11 00:00:00" --oneline --grep="faturamento"

# Buscar commits por autor
git log --since="2026-02-11 00:00:00" --oneline --author="Nome"
```

#### Analisar Arquivos Modificados
```bash
# Listar todos os arquivos modificados no dia
git log --since="2026-02-11 00:00:00" --until="2026-02-11 23:59:59" --name-only --pretty=format: | sort -u

# Ver estatísticas de mudanças por arquivo
git log --since="2026-02-11 00:00:00" --until="2026-02-11 23:59:59" --stat

# Contar commits por diretório
git log --since="2026-02-11 00:00:00" --oneline --name-only | grep "^src/" | cut -d'/' -f1-2 | sort | uniq -c
```

### 2. Análise e Agrupamento

#### Identificar Temas Comuns
1. **Leia as mensagens de commit** para entender o contexto
2. **Agrupe por área funcional**:
   - Commits em `src/lib/billing/` → Categoria "Faturamento"
   - Commits em `src/components/` → Categoria "Interface"
   - Commits em `src/app/api/` → Categoria "Integrações"
3. **Identifique padrões**:
   - Múltiplos commits com "fix" → Consolidar em "Correções"
   - Commits relacionados a UI/UX → Agrupar em "Experiência"
   - Commits de otimização → Categoria "Performance"

#### Exemplo de Análise
```bash
# Saída do git log:
aa7156b - feat: Implement comprehensive subscription and billing management
1236d1d - fix: implementation of monetary rounding
67dbcbd - fix: idempotency check for criarCobrancaInicial
f416323 - fix: refactored the KPI logic
45da5c6 - fix: Contra Race Conditions no Billing Service
```

**Análise**:
- `aa7156b` → "Faturamento" (sistema completo)
- `1236d1d` + `67dbcbd` + `45da5c6` → "Precisão" (consolidar: cálculos + validações + proteção)
- `f416323` → "Dashboard" (KPIs)

#### Priorizar Impacto
- **Alto impacto**: Novas funcionalidades, mudanças visíveis ao usuário
- **Médio impacto**: Melhorias de performance, correções importantes
- **Baixo impacto**: Refatorações internas, ajustes menores

### 3. Redação
- Escreva descrições claras e concisas
- Aplique os princípios de segurança
- Revise para consistência de tom

### 4. Revisão
- Verifique se não há informações sensíveis
- Confirme que as categorias estão corretas
- Valide que o total de entradas está entre 3-10

## Checklist de Revisão

Antes de publicar uma nova entrada de changelog:

- [ ] Nenhum nome de biblioteca específica exposto
- [ ] Nenhum nome de componente interno revelado
- [ ] Nenhuma estrutura de banco de dados detalhada
- [ ] Nenhum nome de função ou método mencionado
- [ ] Categorias consistentes com o padrão
- [ ] Descrições focadas em benefícios
- [ ] Máximo de 10 entradas por data
- [ ] Tom profissional e acessível
- [ ] Linguagem clara e concisa
- [ ] Mudanças relacionadas consolidadas

## Manutenção

- **Frequência**: Atualizar ao final de cada dia de desenvolvimento significativo
- **Responsável**: Desenvolvedor que fez as mudanças + revisão do tech lead
- **Formato**: Sempre adicionar novas datas no **topo** do array
- **Histórico**: Manter no mínimo 30 dias de changelog visível

## Referências

- Arquivo de implementação: `src/components/status/StatusPageClient.tsx`
- Página pública: `/status`
- Deep linking: `/status#YYYY-MM-DD`
