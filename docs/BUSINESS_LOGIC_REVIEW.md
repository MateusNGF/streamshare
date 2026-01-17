# Revisão de Lógica de Negócio - StreamShare

## Resumo Executivo

Realizei uma revisão completa da lógica de negócio dos server actions. A maioria está bem implementada, mas identifiquei **8 pontos de melhoria** que aumentarão a robustez, segurança e consistência do sistema.

---

## ✅ Pontos Fortes Identificados

### 1. Validações de Segurança
- ✅ Todas as actions verificam autenticação via `getContext()`
- ✅ Verificação de `contaId` em todas as operações (multi-tenancy seguro)
- ✅ Uso correto de transactions para operações atômicas

### 2. Validações de Dados
- ✅ CPF, telefone e email validados nos participantes
- ✅ Verificação de assinaturas ativas antes de deletar streaming/participante
- ✅ Validação de vagas disponíveis ao criar assinaturas

### 3. Revalidação de Cache
- ✅ `revalidatePath()` chamado consistentemente após mutações
- ✅ Múltiplas páginas revalidadas quando necessário

---

## ⚠️ Problemas Identificados e Soluções

### 1. ❌ **Falta Validação de Valores Negativos**

**Arquivo**: `streamings.ts:148-169`

**Problema**:
```typescript
export async function createStreaming(data: {
    valorIntegral: number;  // ❌ Aceita valores negativos!
    limiteParticipantes: number;  // ❌ Aceita 0 ou negativos!
}) {
    // Sem validação...
}
```

**Impacto**: Streaming pode ser criado com R$ -10,00 ou 0 participantes.

**Solução**:
```typescript
export async function createStreaming(data: {
    catalogoId: number;
    valorIntegral: number;
    limiteParticipantes: number;
}) {
    const { contaId } = await getContext();

    // ✅ ADICIONAR VALIDAÇÕES
    if (data.valorIntegral <= 0) {
        throw new Error("Valor integral deve ser maior que zero");
    }

    if (data.limiteParticipantes < 1) {
        throw new Error("Limite de participantes deve ser no mínimo 1");
    }

    if (!Number.isFinite(data.valorIntegral) || !Number.isFinite(data.limiteParticipantes)) {
        throw new Error("Valores devem ser números válidos");
    }

    // Resto do código...
}
```

---

### 2. ❌ **Update de Streaming Não Valida Valores**

**Arquivo**: `streamings.ts:171-264`

**Problema**: Mesma falta de validação no `updateStreaming`.

**Solução**: Adicionar as mesmas validações acima.

---

### 3. ❌ **Cobrança Pode Ter Valores Negativos ou Zero**

**Arquivo**: `assinaturas.ts:46-145`

**Problema**:
```typescript
export async function createAssinatura(data: {
    valor: number;  // ❌ Sem validação!
    dataInicio: string;
}) {
    // ...
}
```

**Impacto**: Assinatura pode ter valor R$ 0,00 ou negativo.

**Solução**:
```typescript
// ADICIONAR no início da função:
if (data.valor <= 0) {
    throw new Error("Valor da assinatura deve ser maior que zero");
}

if (!Number.isFinite(data.valor)) {
    throw new Error("Valor deve ser um número válido");
}

// Validar data
const dataInicio = new Date(data.dataInicio);
if (isNaN(dataInicio.getTime())) {
    throw new Error("Data de início inválida");
}

// Validar que data não é muito no passado (ex: > 1 ano atrás)
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
if (dataInicio < oneYearAgo) {
    throw new Error("Data de início não pode ser superior a 1 ano no passado");
}
```

---

### 4. ⚠️ **Falta Verificação de Duplicação de CPF**

**Arquivo**: `participantes.ts:36-70`

**Problema**:
```typescript
export async function createParticipante(data: {
    cpf: string;  // ❌ Não verifica se já existe
}) {
    // ...
    await prisma.participante.create({ data });
}
```

**Impacto**: Dois participantes podem ter o mesmo CPF na mesma conta.

**Solução**:
```typescript
export async function createParticipante(data: {
    nome: string;
    whatsappNumero: string;
    cpf: string;
    email?: string;
}) {
    const { contaId } = await getContext();

    // Validações existentes...

    // ✅ ADICIONAR: Verificar duplicação de CPF
    const existingCPF = await prisma.participante.findFirst({
        where: {
            contaId,
            cpf: data.cpf
        }
    });

    if (existingCPF) {
        throw new Error("Já existe um participante com este CPF cadastrado");
    }

    // ✅ ADICIONAR: Verificar duplicação de WhatsApp (opcional, mas recomendado)
    const existingWhatsApp = await prisma.participante.findFirst({
        where: {
            contaId,
            whatsappNumero: data.whatsappNumero
        }
    });

    if (existingWhatsApp) {
        throw new Error("Já existe um participante com este número de WhatsApp");
    }

    // Resto do código...
}
```

---

### 5. ⚠️ **Update Participante Permite Mudança para CPF Duplicado**

**Arquivo**: `participantes.ts:72-107`

**Problema**: Ao editar, pode mudar para CPF  de outro participante.

**Solução**:
```typescript
export async function updateParticipante(id: number, data: {...}) {
    const { contaId } = await getContext();

    // Validações existentes...

    // ✅ ADICIONAR: Verificar se CPF já existe EM OUTRO participante
    const existingCPF = await prisma.participante.findFirst({
        where: {
            contaId,
            cpf: data.cpf,
            NOT: { id }  // Excluir o próprio participante
        }
    });

    if (existingCPF) {
        throw new Error("Já existe outro participante com este CPF");
    }

    // Similar para WhatsApp
    const existingWhatsApp = await prisma.participante.findFirst({
        where: {
            contaId,
            whatsappNumero: data.whatsappNumero,
            NOT: { id }
        }
    });

    if (existingWhatsApp) {
        throw new Error("Já existe outro participante com este número de WhatsApp");
    }

    // Resto do código...
}
```

---

### 6. ⚠️ **Streamings Sem Validação de Catálogo Inválido**

**Arquivo**: `streamings.ts:148`

**Problema**:
```typescript
export async function createStreaming(data: {
    catalogoId: number;  // ❌ Não verifica se existe
}) {
    // ...
}
```

**Impacto**: Pode tentar criar streaming com catálogo inexistente, gerando erro obscuro do Prisma.

**Solução**:
```typescript
export async function createStreaming(data: {
    catalogoId: number;
    valorIntegral: number;
    limiteParticipantes: number;
}) {
    const { contaId } = await getContext();

    // Validações de valores...

    // ✅  ADICIONAR: Verificar se catálogo existe e está ativo
    const catalogo = await prisma.streamingCatalogo.findUnique({
        where: { id: data.catalogoId }
    });

    if (!catalogo) {
        throw new Error("Catálogo de streaming não encontrado");
    }

    if (!catalogo.isAtivo) {
        throw new Error("Este catálogo de streaming não está mais disponível");
    }

    // ✅ ADICIONAR: Verificar duplicação (mesma conta + mesmo catálogo)
    const existing = await prisma.streaming.findFirst({
        where: {
            contaId,
            streamingCatalogoId: data.catalogoId,
            isAtivo: true
        }
    });

    if (existing) {
        throw new Error(`Você já possui um ${catalogo.nome} cadastrado`);
    }

    // Resto do código...
}
```

---

### 7. ⚠️ **Cobrança Manual Sem Validação de Ownership**

**Arquivo**: `cobrancas.ts:264-289`

**Problema Menor**: Validação está correta, mas poderia ser mais eficiente.

**Otimização**:
```typescript
// Buscar cobrança com todos os relacionamentos necessários
const cobranca = await prisma.cobranca.findFirst({
    where: {
        id: cobrancaId,
        assinatura: {
            participante: { contaId }  // ✅ Já valida ownership
        }
    },
    include: {
        assinatura: {
            include: {
                participante: true,
                streaming: { include: { catalogo: true } }
            }
        }
    }
});

if (!cobranca) {
    throw new Error("Cobrança não encontrada ou sem permissão");
}

// ❌ REMOVER validação duplicada (linhas 286-288)
// Já foi validada no findFirst acima
```

---

### 8. ✅ **Renovação de Cobranças - Lógica Correta Mas Pode Melhorar**

**Arquivo**: `cobrancas.ts:188-256`

**Observação**: Lógica está correta, mas pode adicionar logging para debug.

**Melhoria Sugerida**:
```typescript
export async function renovarCobrancas() {
    const { contaId } = await getContext();

    // ... código existente ...

    // ✅ ADICIONAR: Log para auditoria
    console.log(`[RenovarCobrancas] Conta: ${contaId}, Renovadas: ${renovadas} cobranças`);

    // ✅ ADICIONAR: Retornar mais informações
    return {
        renovadas,
        assinaturasProcessadas: assinaturasAtivas.length,
        timestamp: new Date().toISOString()
    };
}
```

---

## 📋 Resumo de Correções Necessárias

| #  | Arquivo | Função | Prioridade | Problema |
|----|---------|--------|------------|----------|
| 1 | streamings.ts | createStreaming | 🔴 Alta | Aceita valores negativos |
| 2 | streamings.ts | updateStreaming | 🔴 Alta | Aceita valores negativos |
| 3 | assinaturas.ts | createAssinatura | 🔴 Alta | Aceita valores negativos/zero |
| 4 | participantes.ts | createParticipante | 🟡 Média | CPF duplicado permitido |
| 5 | participantes.ts | updateParticipante | 🟡 Média | Pode mudar para CPF duplicado |
| 6 | streamings.ts | createStreaming | 🟡 Média | Não valida catálogo existe |
| 7 | cobrancas.ts | enviarNotificacao | 🟢 Baixa | Validação duplicada |
| 8 | cobrancas.ts | renovarCobrancas | 🟢 Baixa | Falta logging |

---

## 🔧 Implementação Recomendada

### Ordem de Prioridade:

1. **Fase 1 (Crítico)** - Correções Vermelhas
   - Validação de valores negativos em streamings e assinaturas
   - Tempo estimado: 30 minutos

2. **Fase 2 (Importante)** - Correções Amarelas
   - Validação de CPF duplicado
   - Validação de catálogo existente
   - Tempo estimado: 45 minutos

3. **Fase 3 (Otimizações)** - Correções Verdes
   - Remover validações duplicadas
   - Adicionar logging
   - Tempo estimado: 15 minutos

---

## ✨ Melhorias Adicionais Sugeridas

### 1. Criar Arquivo de Validações Centralizadas

```typescript
// lib/validators.ts
export const businessValidators = {
  validateMoney: (value: number, fieldName = "Valor") => {
    if (!Number.isFinite(value)) {
      throw new Error(`${fieldName} deve ser um número válido`);
    }
    if (value <= 0) {
      throw new Error(`${fieldName} deve ser maior que zero`);
    }
  },

  validateParticipantLimit: (limit: number) => {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error("Limite de participantes deve ser no mínimo 1");
    }
    if (limit > 100) {  // Exemplo de limite máximo
      throw new Error("Limite de participantes não pode exceder 100");
    }
  },

  validatePastDate: (date: Date, maxYearsAgo = 1) => {
    const threshold = new Date();
    threshold.setFullYear(threshold.getFullYear() - maxYearsAgo);
    if (date < threshold) {
      throw new Error(`Data não pode ser superior a ${maxYearsAgo} ano(s) no passado`);
    }
  }
};
```

### 2. Adicionar Testes Unitários

```typescript
// __tests__/validators.test.ts
describe('businessValidators', () => {
  it('should reject negative values', () => {
    expect(() => businessValidators.validateMoney(-10))
      .toThrow("Valor deve ser maior que zero");
  });

  it('should reject zero values', () => {
    expect(() => businessValidators.validateMoney(0))
      .toThrow("Valor deve ser maior que zero");
  });
});
```

---

## 📊 Impacto Estimado

**Antes das Correções**:
- ❌ Vulnerável a dados inválidos
- ❌ Possível corrupção de dados (valores negativos)
- ❌ Duplicação de CPF/WhatsApp
- ❌ Erros confusos do Prisma

**Depois das Correções**:
- ✅ Validações robustas em todas as camadas
- ✅ Mensagens de erro claras
- ✅ Integridade de dados garantida
- ✅ Melhor experiência do usuário

---

## 🎯 Conclusão

A base da lógica de negócio está **sólida**, com bom uso de transactions e autenticação. As correções sugeridas são principalmente **validações preventivas** que aumentarão significativamente a robustez do sistema.

**Prioridade**: Implementar as correções **Fase 1** (críticas) o quanto antes.
