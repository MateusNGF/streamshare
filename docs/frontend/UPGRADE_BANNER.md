# Componente UpgradeBanner

O `UpgradeBanner` é um componente premium projetado para incentivar o upgrade de planos, destacar funcionalidades exclusivas e melhorar a experiência de monetização do StreamShare. Ele utiliza uma estética moderna com gradientes, glassmorphism e micro-animações.

## Localização
`src/components/ui/UpgradeBanner.tsx`

## Propriedades (Props)

| Propriedade | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `title` | `string` | **Obrigatório** | Título principal do banner. |
| `description` | `string` | **Obrigatório** | Texto explicativo ou benefício da funcionalidade. |
| `icon` | `LucideIcon` | Varia por variante | Ícone a ser exibido (Lucide React). |
| `buttonText` | `string` | "Conhecer planos" | Texto do botão de ação. |
| `buttonHref` | `string` | "/planos" | Rota para onde o usuário será redirecionado. |
| `variant` | `string` | "primary" | Estilo visual (`primary`, `gold`, `warning`, `glass`, `info`, `minimal`). |
| `size` | `string` | "normal" | Dimensões do componente (`compact`, `normal`, `large`). |
| `onClick` | `function` | undefined | Handler customizado para o clique no botão. |
| `className` | `string` | "" | Classes CSS adicionais do Tailwind. |

## Variantes Disponíveis

### 1. `primary` (Padrão)
Ideal para avisos gerais de novas funcionalidades ou automações básicas.
- **Cores:** Índigo e Azul.
- **Ícone padrão:** `Sparkles`.

### 2. `gold` (Premium)
Dedicado a funcionalidades do plano Business/Enterprise.
- **Cores:** Dourado intenso com brilho.
- **Ícone padrão:** `Crown`.

### 3. `warning` (Alerta)
Usado para quando o usuário atinge limites de plano ou precisa de atenção imediata.
- **Cores:** Rose e Laranja.
- **Ícone padrão:** `ShieldAlert`.

### 4. `glass` (Efeito Vidro)
Design minimalista com fundo translúcido (backdrop-blur).
- **Cores:** Branco translúcido.
- **Ícone padrão:** `Zap`.

### 5. `info` (Suave)
Para sugestões educacionais ou informações secundárias sobre planos.
- **Cores:** Sky e Azul.
- **Ícone padrão:** `Info`.

### 6. `minimal` (Limpo)
Layout discreto sem gradientes pesados, focado em alta densidade de informação.
- **Cores:** Branco e Cinza.
- **Ícone padrão:** `Star`.

## Tamanhos

- **`compact`**: Reduz padding e fontes. Ideal para espaços confinados em dashboards.
- **`normal`**: Proporções padrão para o meio da página.
- **`large`**: Destaque total, fontes e ícones amplos. Ideal para CTAs principais.

## Exemplo de Uso

```tsx
import { UpgradeBanner } from "@/components/ui/UpgradeBanner";
import { Zap } from "lucide-react";

export function MeuComponente() {
  return (
    <UpgradeBanner 
      variant="gold"
      size="large"
      title="Domine sua gestão com o plano Business"
      description="Tenha acesso a relatórios automáticos e envio ilimitado via WhatsApp."
      buttonText="Assinar Agora"
      icon={Zap} // Opcional: sobrescreve o ícone da variante
    />
  );
}
```

## Diretrizes de Design
1. **Posicionamento:** Utilize preferencialmente no topo de listagens ou acima de tabelas onde funcionalidades estão limitadas.
2. **Responsividade:** O componente se adapta automaticamente. Em telas mobile, os elementos são empilhados e o botão ganha largura total para facilitar o toque.
3. **Animação:** Ícones (exceto na variante `minimal`) possuem uma animação de `pulse` suave para atrair o olhar sem ser intrusivo.
