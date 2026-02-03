# Padrão de Filtros (GenericFilter)

Este documento descreve o padrão de interface e funcionamento do componente `GenericFilter` utilizado em todo o projeto StreamShare v2.

## Visão Geral

O componente `GenericFilter` centraliza a lógica de filtragem, garantindo consistência visual e comportamental entre as páginas (Streamings, Assinaturas, Cobranças, Usuários).

## Funcionalidades Principais

1.  **Tipos de Filtros Suportados**:
    *   `text`: Campos de busca textual (ex: Nome, Email).
    *   `select`: Dropdowns para seleção única (ex: Categorias).
    *   `switch`: Alternadores booleanos (ex: Apenas lotados).

2.  **Responsividade**:
    *   **Mobile**: Apresenta apenas o filtro principal (primeiro item) em linha. Demais filtros são acessíveis via botão "Filtros", que abre um Modal full-screen.
    *   **Desktop**: Apresenta apenas o filtro principal em linha para reduzir poluição visual. Filtros adicionais são acessíveis via botão "Filtros" que abre o mesmo Modal.

3.  **Lógica de "Limpar"**:
    *   Reseta os valores para seus padrões seguros:
        *   `text` -> `""` (string vazia)
        *   `select` -> `"all"` (garante que lógica de "Todos" funcione)
        *   `switch` -> `"false"` (string "false" para evitar contagem errada)

4.  **Internacionalização**:
    *   O valor interno `"all"` em `selects` é automaticamente renderizado como **"Todos"** na interface.

## Estrutura do Objeto de Configuração (`FilterConfig`)

```typescript
interface FilterConfig {
    key: string;              // Chave que será usada no estado (ex: "searchTerm")
    type: "text" | "select" | "switch";
    label?: string;           // Label visível ou Placeholder
    placeholder?: string;     // Placeholder específico para inputs de texto
    className?: string;       // Classes CSS adicionais
    options?: {               // Apenas para type: "select"
        label: string;
        value: string;
    }[];
}
```

## Diretrizes de Uso

### 1. Estado Inicial

Sempre inicialize os estados com valores seguros que correspondam aos defaults do componente.

```typescript
const [filters, setFilters] = useState({
    searchTerm: "",
    status: "all",      // Use "all" para selects
    onlyFull: false     // Use boolean para switches (convertido internamente)
});
```

### 2. Implementação do Componente

```tsx
<GenericFilter
    filters={[
        {
            key: "searchTerm",
            type: "text",
            placeholder: "Buscar..."
        },
        {
            key: "status",
            type: "select",
            label: "Status",
            options: [
                { label: "Ativo", value: "active" },
                { label: "Inativo", value: "inactive" }
            ]
        }
    ]}
    values={{
        searchTerm: filters.searchTerm,
        status: filters.status
    }}
    onChange={(key, value) => {
        // Lógica de atualização de estado
        setFilters(prev => ({ ...prev, [key]: value }));
    }}
    onClear={() => {
        // Reset manual do estado pai
        setFilters({ searchTerm: "", status: "all" });
    }}
/>
```

## Comportamentos Específicos

- **Contador de Filtros**: O botão de filtros exibe um badge com a quantidade de filtros ativos. A lógica ignora valores `""`, `"all"` e `"false"`.
- **Modal vs Inline**: 
    - No modo Desktop, o limite é rígido a **1 componente** visível fora do modal.
    - No modo Mobile, o comportamento é idêntico.
- **Tradução Automática**: Se o valor de um select for `"all"`, o componente `SelectValue` exibirá "Todos" automaticamente, evitando que o usuário veja o termo em inglês.
