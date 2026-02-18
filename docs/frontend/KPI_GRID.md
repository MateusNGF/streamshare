# Componente KPIGrid

O `KPIGrid` é um componente de layout premium projetado para exibir cartões de métricas (KPIs) de forma consistente em toda a aplicação. Ele resolve o desafio de exibir múltiplos dados importantes tanto em telas grandes quanto em dispositivos móveis.

## Motivação

Dados financeiros e operacionais precisam de visibilidade máxima. Em telas desktop, um grid é ideal, mas em dispositivos móveis, grids de múltiplas colunas tornam-se ilegíveis ou exigem muito scroll vertical. O `KPIGrid` implementa o padrão de **Carousel de Scroll Horizontal** no mobile, mantendo o grid no desktop.

## Funcionalidades

- **Mobile First**: Transforma-se automaticamente em um container de scroll horizontal.
- **Snap Scrolling**: Os cards "prendem" ao centro da tela durante o scroll manual no mobile, melhorando a experiência de toque.
- **Shadow Preservation**: Possui padding vertical (`py-10`) calculado para garantir que as sombras suaves (box-shadow) dos cards não sejam cortadas pelo container de overflow.
- **Configurabilidade**: Suporta layouts de 1 a 4 colunas no desktop.
- **Preservação de Animações**: Compatível com as animações de entrada (`animate-scale-in`) específicas de cada card.

## Como Usar

O componente é composto por dois elementos: o `KPIGrid` (o container) e o `KPIGridItem` (o wrapper de cada card).

```tsx
import { KPIGrid, KPIGridItem } from "@/components/dashboard/KPIGrid";
import { KPIFinanceiroCard } from "@/components/dashboard/KPIFinanceiroCard";

export function MeuComponente() {
    return (
        <KPIGrid cols={3}>
            <KPIGridItem>
                <KPIFinanceiroCard
                    titulo="Total"
                    valor={1000}
                    icone={DollarSign}
                    cor="primary"
                    index={0}
                />
            </KPIGridItem>
            {/* ... outros itens */}
        </KPIGrid>
    );
}
```

## Props

### KPIGrid
| Prop | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | - | Os `KPIGridItem` que compõem o grid. |
| `cols` | `1 \| 2 \| 3 \| 4` | `4` | Número de colunas no desktop (Large screens). |
| `className` | `string` | - | Classes Tailwind adicionais para o container externo. |

### KPIGridItem
| Prop | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | - | O card de métrica (ex: `KPICard` ou `KPIFinanceiroCard`). |
| `className` | `string` | - | Útil para aplicar classes de animação como `animate-scale-in`. |
| `style` | `CSSProperties` | - | Útil para aplicar `animation-delay` dinâmico baseado no index. |

## Melhores Práticas

1. **Margem Inferior**: Sempre utilize `className="mb-10"` (ou similar) no `KPIGrid` para separar a seção de métricas do conteúdo seguinte, já que o componente possui padding interno.
2. **Índices de Animação**: Ao usar múltiplos cards com animação de entrada, use a prop `style` do `KPIGridItem` para passar o delay, garantindo o efeito de "cascata".
3. **Consistência**: Utilize este componente sempre que estiver exibindo mais de 2 cards de métricas em uma linha.
