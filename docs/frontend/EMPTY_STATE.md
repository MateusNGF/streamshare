# StreamShare - EmptyState Component
**Localização:** `src/components/ui/EmptyState.tsx`

O `EmptyState` é um componente visual fundamental no StreamShare, utilizado para fornecer feedback amigável e limpo ao usuário quando não há dados a serem exibidos (como listas vazias, procuras sem resultados ou seções sem conteúdo).

O design moderno do aplicativo StreamShare preza por **limpeza**, **objetividade** e **ausência de excessos visuais** (como bordas demarcadas extras), além de possuir comportamento 100% responsivo para mobile e desktop.

## 🎯 Princípios de Design

1.  **Sem Bordas / Clean UI:** O `EmptyState` não deve ser encapsulado por `div`s com fundos brancos (`bg-white`), bordas ou sombras (`shadow-sm`) independentes quando inserido em uma página ou aba cujo visual final ficaria com o aspecto de "caixa dupla". O próprio componente EmptyState tem "respiro" (`padding`) o suficiente.
2.  **Textos Curtos e Objetivos:** Os títulos e descrições do `EmptyState` devem ser altamente concisos. Evite descrições longas. Exemplo: *Em vez de* "Você não adicionou nenhum streaming ainda e por isso a lista está vazia", *utilize* "Nenhum streaming cadastrado."
3.  **Proposição de Ação:** Sempre que houver uma ação corretiva lógica, deve-se prover um `action` (como um botão) para engajar o usuário.
4.  **Uso Correto de Ícones:** O ícone deve referir-se ao contexto ou ação (`Search` para buscas, `UserPlus` para convites, `AlertCircle` genérico mas com cuidado).

## 🧩 Props da API

A interface `EmptyStateProps` expõe as seguintes propriedades:

| Propriedade               | Tipo                        | Descrição |
| :---                      | :---                        | :--- |
| `title` **(Obrigatório)** | `string`                    | Título principal do estado vazio (ex: "Nenhum participante"). |
| `icon`                    | `LucideIcon \| ElementType` | Ícone a ser exibido no topo do texto. Recomendado uso de componentes `lucide-react`. |
| `description`             | `ReactNode`                 | Breve explicação. Normalmente aceita texto, mas suporta tags customizadas. |
| `action`                  | `ReactNode`                 | Pode ser um `<Button>` ou componente de interação em caso de vazio. |
| `children`                | `ReactNode`                 | Aceita conteúdo aninhado se houver mais de uma ação ou visualização atípica. |
| `variant`                 | `EmptyStateVariant`         | Define o template de espaçamento e uso do ícone. Padrão: `'dashed'` (legado do nome, mas atualmente foca no `bg-transparent`). |
| `animate`                 | `boolean`                   | Se a animação de entrada com fade-in e zoom-in está ativa. Padrão: `true`. |
| `className`, `iconClassName` | `string`                 | Pass-through de estilizizações via Tailwind `cn()` utility para overrides. |

## 📐 Variantes

O componente possui variantes diferentes que ajustam espaçamentos/tamanhos (ex. icon e font-size) baseados no seu local de inserção. 

- `compact`: Uso em Pickers, Modais estreitos e pequenos Lists. (Paddings verticais baixos `py-4`, box icon menor).
- `default` / `dashed`: Uso em abas (`Tabs`), seções de página ou subpáginas normais. Exerce paddings fluidos (`py-8 sm:py-12`).
- `glass`: Variante de visual com ícone grande e descrições amplas, com container do fundo animado na cor primária leve (`bg-primary/5`). Uso comum nas páginas "Mestras" (como `/explore` onde nenhum filtro retornou e sugerimos upgrade).
- `card`: Variante alternativa também adaptativa aos contextos de Dashboard.

## 🚀 Exemplo de Uso

```tsx
import { Search } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function MinhaTabela({ itens }) {
    if (itens.length === 0) {
        // Correto: container cru com py-8 (evite bg-white e borders aqui)
        return (
            <div className="py-8">
                <EmptyState
                    icon={Search}
                    title="Nenhuma assinatura"
                    description="Ajuste os filtros ou crie uma nova para continuar."
                    variant="default"
                    action={
                        <Link href="/explore">
                            <Button>Explorar Vagas</Button>
                        </Link>
                    }
                />
            </div>
        );
    }
    
    // ... renderizacao da tabela
}
```

## 📱 Responsividade 

Na refatoração mais recente, os **Paddings (Espaçamentos internos)** foram fluidificados para funcionar bem sem esticar os designs no dispositivo móvel.
Da mesma forma, a **Tipografia** é adaptativa. Títulos e descrições tem tamanhos básicos no ambiente mobile e aumentam no desktop (ex: de `text-xs` para `text-sm`, `mx-auto` nas descrições longas para evitar toque na borda).
