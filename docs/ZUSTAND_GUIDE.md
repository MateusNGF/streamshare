# Guia Zustand - StreamShare

## Visão Geral

Este projeto utiliza **Zustand** para gerenciamento de estado client-side, proporcionando:
- ✅ Cache inteligente de dados do servidor
- ✅ Atualizações otimistas da UI
- ✅ Sincronização reativa entre componentes
- ✅ Persistência local para melhor UX offline
- ✅ DevTools para debugging

## Arquitetura

### Stores Disponíveis

#### 1. **useStreamingStore**
Gerencia a lista de streamings (serviços disponíveis).

**Estado**:
- `streamings`: Lista de todos os streamings
- `loading`: Estado de carregamento
- `error`: Mensagem de erro (se houver)
- `filters`: Filtros ativos (busca, categoria)
- `lastFetched`: Timestamp do última fetch

**Ações Principais**:
```typescript
const {
  fetch Streamings,         // Buscar do servidor (com cache inteligente)
  createStreaming,          // Criar novo streaming
  updateStreaming,          // Atualizar streaming existente
  deleteStreaming,          // Deletar streaming
  setFilters,               // Atualizar filtros
  getFiltered,              // Obter streamings filtrados
  getById,                  // Buscar por ID
  getAvailableSlots,        // Calcular vagas disponíveis
} = useStreamingStore();
```

#### 2. **useAssinaturaStore**
Gerencia assinaturas (subscriptions) de participantes.

**Estado**:
- `assinaturas`: Lista de todas as assinaturas
- `selectedAssinatura`: Assinatura selecionada para detalhes/edição
- `loading`, `error`, `lastFetched`

**Ações Principais**:
```typescript
const {
  fetchAssinaturas,
  createAssinatura,
  selectAssinatura,
  getByParticipante,        // Filtrar por participante
  getByStreaming,           // Filtrar por streaming
  getActiveCount,           // Contar assinaturas ativas
} = useAssinaturaStore();
```

#### 3. **useCobrancaStore**
Gerencia cobranças (billing/charges) e KPIs financeiros.

**Estado**:
- `cobrancas`: Lista de cobranças
- `kpis`: KPIs financeiros (receita, pendentes, atrasos)
- `filters`: Filtros (status, participante, mês/ano)
- `loading`, `loadingKPIs`, `error`

**Ações Principais**:
```typescript
const {
  fetchCobrancas,
  fetchKPIs,
  confirmarPagamento,       // Confirmar pagamento com atualização otimista
  enviarNotificacao,        // Enviar notificação WhatsApp
  setFilters,               // Filtrar por status, mês, etc
  getPendentes,             // Cobranças pendentes
  getAtrasadas,             // Cobranças atrasadas
} = useCobrancaStore();
```

#### 4. **useDashboardStore**
Gerencia dados do dashboard (estatísticas e resumos).

**Estado**:
- `stats`: Estatísticas principais (receita, participantes, ocupação)
- `recentSubscriptions`: Últimas 5 assinaturas
- `streamings`: Top 3 streamings
- `loadingStats`, `loadingSubscriptions`, `loadingStreamings`

**Ações Principais**:
```typescript
const {
  fetchStats,
  fetchRecentSubscriptions,
  fetchStreamings,
  refreshAll,               // Atualizar todos os dados
} = useDashboardStore();
```

---

## Como Usar nos Componentes

### Padrão Básico

```typescript
"use client";

import { useEffect } from "react";
import { useStreamingStore } from "@/stores";

export function MyComponent() {
  const { streamings, loading, fetchStreamings } = useStreamingStore();

  // Buscar dados ao montar o componente
  useEffect(() => {
    fetchStreamings();
  }, [fetchStreamings]);

  if (loading && streamings.length === 0) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      {streamings.map(s => (
        <div key={s.id}>{s.catalogo.nome}</div>
      ))}
    </div>
  );
}
```

### Usando Selectores (Otimização de Performance)

Para evitar re-renders desnecessários, selecione apenas o que precisa:

```typescript
// ❌ Ruim - Re-render quando QUALQUER coisa no store mudar
const store = useStreamingStore();

// ✅ Bom - Re-render APENAS quando 'streamings' mudar
const streamings = useStreamingStore(state => state.streamings);
const loading = useStreamingStore(state => state.loading);
```

### Atualizações Otimistas

As ações de criação, atualização e exclusão já implementam atualizações otimistas:

```typescript
const handleDelete = async (id: number) => {
  try {
    // A UI atualiza IMEDIATAMENTE, antes da confirmação do servidor
    await deleteStreaming(id);
    toast.success("Removido!");
  } catch (error) {
    // Em caso de erro, o estado é revertido automaticamente
    toast.error("Erro ao remover");
  }
};
```

### Filtros Reativos

```typescript
const { filters, setFilters, getFiltered } = useStreamingStore();

// Atualizar filtro (UI reage automaticamente)
<input
  value={filters.searchTerm}
  onChange={(e) => setFilters({ searchTerm: e.target.value })}
/>

// Obter dados filtrados
const filteredStreamings = getFiltered();
```

---

## Persistência e Cache

### Stores com Persistência (localStorage)
- `useStreamingStore` - Persiste streamings e filtros
- `useAssinaturaStore` - Persiste assinaturas

**Benefício**: Dados ficam disponíveis offline e entre sessões.

### Stores Apenas em Memória
- `useCobrancaStore` - Dados de cobrança são mais dinâmicos
- `useDashboardStore` - Stats precisam ser sempre frescos

### Estratégia de Cache (Stale-While-Revalidate)

Os stores implementam cache inteligente:

```typescript
// Primeira chamada: busca do servidor
await fetchStreamings(); // → Chamada HTTP

// Chamadas subsequentes (dentro de 5 minutos): usa cache
await fetchStreamings(); // → Cache local (sem HTTP)

// Forçar refresh
await fetchStreamings(true); // → Chamada HTTP (ignora cache)
```

**Tempos de Cache**:
- Streamings/Assinaturas: 5 minutos
- Cobranças/KPIs: 2 minutos
- Dashboard Stats: 1 minuto

---

## Sincronização Entre Stores

Quando uma ação afeta múltiplos stores, atualize todos:

```typescript
const handleCreateAssinatura = async (data) => {
  try {
    // Criar assinatura
    await assinaturaStore.createAssinatura(data);
    
    // Atualizar streaming (vagas ocupadas mudaram!)
    await streamingStore.fetchStreamings(true);
    
    toast.success("Assinatura criada!");
  } catch (error) {
    toast.error(error.message);
  }
};
```

---

## Debugging com DevTools

### Instalação (Chrome/Edge/Firefox)

1. Instale a extensão [Redux DevTools](https://github.com/reduxjs/redux-devtools)
2. Abra o DevTools (F12)
3. Aba "Redux" estará disponível

### Visualizar Estado dos Stores

- **State**: Veja o estado completo de cada store
- **Actions**: Histórico de todas as ações executadas
- **Diff**: Ver o que mudou em cada ação

### Time-Travel Debugging

Você pode "voltar no tempo" clicando em ações anteriores para ver como o estado estava naquele momento.

### Exemplo de Logs

```
Action: fetchStreamings @ 10:30:15
{
  streamings: [...],
  loading: false,
  lastFetched: 1234567890
}

Action: createStreaming @ 10:30:20
{
  streamings: [novo, ...antigos],
  loading: false
}
```

---

## Boas Práticas

### ✅ DO

1. **Use `useEffect` para fetch inicial**
   ```typescript
   useEffect(() => {
     fetchStreamings();
   }, [fetchStreamings]);
   ```

2. **Selecione apenas o necessário**
   ```typescript
   const streamings = useStreamingStore(s => s.streamings);
   ```

3. **Trate erros adequadamente**
   ```typescript
   try {
     await createStreaming(data);
   } catch (error) {
     toast.error(error.message);
   }
   ```

4. **Force refresh quando necessário**
   ```typescript
   // Após criar assinatura, atualizar streamings
   await streamingStore.fetchStreamings(true);
   ```

### ❌ DON'T

1. **Não chame ações em loops sem controle**
   ```typescript
   // ❌ Ruim
   streamings.forEach(() => fetchStreamings());
   ```

2. **Não modifique o estado diretamente**
   ```typescript
   // ❌ Ruim - Nunca faça isso!
   store.streamings.push(newItem);
   
   // ✅ Bom
   await createStreaming(newItem);
   ```

3. **Não ignore erros**
   ```typescript
   // ❌ Ruim
   await deleteStreaming(id); // Se falhar, usuário não sabe
   
   // ✅ Bom
   try {
     await deleteStreaming(id);
     toast.success("Removido!");
   } catch (error) {
     toast.error(error.message);
   }
   ```

---

## Exemplos Práticos

### Exemplo 1: Página de Listagem com Filtro

```typescript
"use client";

import { useEffect } from "react";
import { useStreamingStore } from "@/stores";

export function StreamingsPage() {
  const {
    streamings,
    loading,
    filters,
    fetchStreamings,
    setFilters,
    getFiltered,
  } = useStreamingStore();

  useEffect(() => {
    fetchStreamings();
  }, [fetchStreamings]);

  const filteredData = getFiltered();

  return (
    <div>
      <input
        value={filters.searchTerm}
        onChange={(e) => setFilters({ searchTerm: e.target.value })}
        placeholder="Buscar..."
      />
      
      {loading ? (
        <div>Carregando...</div>
      ) : (
        filteredData.map(s => <div key={s.id}>{s.catalogo.nome}</div>)
      )}
    </div>
  );
}
```

### Exemplo 2: Criar Streaming com Feedback

```typescript
const handleCreate = async (data) => {
  try {
    const newStreaming = await createStreaming({
      catalogoId: parseInt(data.catalogoId),
      valorIntegral: parseFloat(data.valorIntegral),
      limiteParticipantes: parseInt(data.limiteParticipantes),
    });
    
    toast.success(`${newStreaming.catalogo.nome} criado!`);
    closeModal();
  } catch (error) {
    toast.error(error.message || "Erro ao criar streaming");
  }
};
```

### Exemplo 3: Dashboard com Múltiplas Fontes

```typescript
export function Dashboard() {
  const { stats, loadingStats, fetchStats } = useDashboardStore();
  const { kpis, loadingKPIs, fetchKPIs } = useCobrancaStore();

  useEffect(() => {
    fetchStats();
    fetchKPIs();
  }, [fetchStats, fetchKPIs]);

  return (
    <div>
      {loadingStats ? (
        <Skeleton />
      ) : (
        <div>Receita: R$ {stats.monthlyRevenue}</div>
      )}
      
      {loadingKPIs ? (
        <Skeleton />
      ) : (
        <div>Pendente: R$ {kpis.totalPendente}</div>
      )}
    </div>
  );
}
```

---

## Troubleshooting

### Dados não atualizam após mudança

**Problema**: Criou um item mas a lista não atualizou.

**Solução**: Force refresh do store:
```typescript
await fetchStreamings(true);
```

### Store volta ao estado inicial após reload

**Problema**: Dados desaparecem ao recarregar a página.

**Solução**: Verifique se o store tem middleware `persist`:
```typescript
// Em useStreamingStore.ts - CORRETO
persist(
  (set, get) => ({ ... }),
  { name: "streaming-storage" }
)
```

### Performance ruim - muitos re-renders

**Problema**: Componente renderiza demais.

**Solução**: Use seletores específicos:
```typescript
// ❌ Renderiza sempre que qualquer coisa mudar
const store = useStreamingStore();

// ✅ Renderiza apenas quando 'streamings' mudar
const streamings = useStreamingStore(s => s.streamings);
```

---

## Referências

- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [React Performance](https://react.dev/learn/render-and-commit)
