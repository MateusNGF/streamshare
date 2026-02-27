# Tooltip Component

O componente `Tooltip` é utilizado para fornecer informações contextuais rápidas ao usuário quando um elemento está em um estado específico (como "copiado") ou sobre o qual o mouse está posicionado.

## Localização
[`src/components/ui/Tooltip.tsx`](../../src/components/ui/Tooltip.tsx)

## Propriedades (Props)

| Propriedade | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | **Obrigatório** | O elemento que disparará ou conterá o tooltip. |
| `content` | `string` | **Obrigatório** | O texto a ser exibido dentro do tooltip. |
| `isVisible` | `boolean` | **Obrigatório** | Controla se o tooltip deve estar visível no momento. |
| `position` | `"top" \| "bottom" \| "left" \| "right"` | `"right"` | A posição do tooltip em relação ao elemento filho. |

## Exemplo de Uso

```tsx
import { useState } from "react";
import { Tooltip } from "@/components/ui/Tooltip";

export function MyComponent() {
  const [isCopied, setIsCopied] = useState(false);

  const handleAction = () => {
    // Lógica de cópia...
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Tooltip content="Sucesso!" isVisible={isCopied} position="top">
      <button onClick={handleAction}>
        Clique aqui
      </button>
    </Tooltip>
  );
}
```

## Implementação (Interno)
O componente utiliza `@radix-ui/react-tooltip` para garantir:
- **Acessibilidade**: Suporte total a ARIA e teclado.
- **Posicionamento**: Motor de posicionamento robusto que evita que o tooltip saia da viewport.
- **Portals**: O conteúdo do tooltip é renderizado em um Portal para evitar problemas de `z-index` e `overflow: hidden`.

## Revestimento (Providers)
Certifique-se de que a aplicação esteja envolvida pelo `TooltipProvider` (já configurado no `src/app/layout.tsx`).
