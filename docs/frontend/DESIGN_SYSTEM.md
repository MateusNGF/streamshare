# Design System StreamShare

Este documento define o sistema de design do projeto StreamShare, incluindo paleta de cores, tipografia, componentes, padrões de layout e diretrizes de UI/UX. Use este arquivo como referência e orientação para manter consistência visual em todo o projeto.

---

## 🎨 Paleta de Cores

### Cores Principais

| Nome | Hex | Uso |
|------|-----|-----|
| **Primary** | `#6d28d9` | Botões principais, estados ativos, links importantes |
| **Primary Hover (Accent)** | `#8b5cf6` | Hover em botões primários |
| **Background** | `#f9fafb` | Fundo geral da aplicação |
| **Foreground** | `#111827` | Texto principal |

### Cores de Sistema

| Nome | Hex | Uso |
|------|-----|-----|
| **White** | `#ffffff` | Cards, sidebar, containers |
| **Gray 50** | `#f9fafb` | Backgrounds secundários |
| **Gray 100** | `#f3f4f6` | Borders sutis |
| **Gray 500** | `#6b7280` | Texto secundário |
| **Gray 900** | `#111827` | Títulos, texto principal |

### Cores de Feedback

| Nome | Hex | Uso |
|------|-----|-----|
| **Green 50** | `#f0fdf4` | Background de status positivos |
| **Green 600** | `#16a34a` | Texto de status "Ativa" |
| **Red 50** | `#fef2f2` | Background de alertas |
| **Red 500** | `#ef4444` | Notificações, badges |
| **Amber 500** | `#f59e0b` | Avisos, "Em atraso" |
| **Violet 100** | `#ede9fe` | Avatares, destaques |

---

## 🔤 Tipografia

- **Fonte Principal**: `Inter` (Google Fonts)
- **Fallback**: `sans-serif`

### Hierarquia de Tamanhos

| Estilo | Tailwind Class | Uso |
|--------|---------------|-----|
| **Heading 1** | `text-3xl font-bold` | Títulos de página |
| **Heading 2** | `text-xl font-bold` | Títulos de seções |
| **Heading 3** | `text-3xl font-bold` | Valores de KPI |
| **Body Large** | `font-semibold` | Subtítulos, nomes |
| **Body** | `text-sm` | Texto padrão |
| **Small** | `text-xs` | Labels, badges |

---

## 📐 Espaçamento e Layout

### Border Radius

| Tamanho | Classe Tailwind | Pixels | Uso |
|---------|----------------|--------|-----|
| **Padrão** | `rounded-xl` | `12px` | Nav items |
| **Grande** | `rounded-2xl` | `16px` | Botões, cards pequenos |
| **Extra Grande** | `rounded-3xl` | `24px` | KPI Cards |
| **Mega** | `rounded-[32px]` | `32px` | Sections principais |

### Padding/Margin

- **Cards**: `p-6` (24px) ou `p-8` (32px)
- **Páginas**: `p-8` (32px)
- **Gaps em Grids**: `gap-6` (24px) ou `gap-10` (40px)

---

## 🧩 Componentes

### 1. Sidebar

**Arquivo**: `src/components/layout/Sidebar.tsx`

**Características**:
- Largura fixa: `w-64` (256px)
- Background: `bg-white`
- Border direita: `border-r`
- Altura total: `h-screen`

**Estados de Item de Menu**:
- **Ativo**: `bg-primary text-white shadow-lg shadow-primary/20`
- **Inativo**: `text-gray-500 hover:bg-gray-50 hover:text-gray-900`
- **Transição**: `transition-all`

**Estrutura**:
```tsx
<Sidebar>
  <Logo /> // bg-primary, rounded-lg, ícone Play
  <Nav>
    <MenuItem /> // rounded-xl, gap-3, px-4 py-3
  </Nav>
</Sidebar>
```

---

### 2. KPICard

**Arquivo**: `src/components/dashboard/KPICard.tsx`

**Características**:
- Background: `bg-white`
- Border: `border border-gray-100`
- Border Radius: `rounded-3xl`
- Padding: `p-6`
- Shadow: `shadow-sm`

**Props**:
```typescript
{
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: "up" | "down";
}
```

**Elementos**:
- **Ícone**: Container `bg-gray-50 rounded-2xl text-primary`
- **Badge de Trend**: 
  - Verde: `bg-green-50 text-green-600` (up)
  - Vermelho: `bg-red-50 text-red-600` (down)
- **Valor**: `text-3xl font-bold text-gray-900`
- **Título**: `text-gray-500 text-sm font-medium`

---

### 3. StreamingCard

**Arquivo**: `src/components/dashboard/StreamingCard.tsx`

**Características**:
- Hover: `hover:bg-gray-50`
- Border Radius: `rounded-2xl`
- Padding: `p-4`
- Transição: `transition-all`

**Elementos**:
- **Avatar**: `w-12 h-12 rounded-2xl text-white font-bold text-xl shadow-lg` (cor dinâmica)
- **Progress Bar**: `bg-gray-100`, fill `bg-primary`
- **Botão de Ações**: `hover:bg-white border border-transparent hover:border-gray-100`

**Props**:
```typescript
{
  name: string;
  slots: { occupied: number; total: number };
  value: string;
  color: string; // Cor da marca (Netflix=#E50914)
  initial: string;
}
```

---

### 4. RecentSubscription

**Arquivo**: `src/components/dashboard/RecentSubscription.tsx`

**Características**:
- Hover: `hover:bg-gray-50`
- Border Radius: `rounded-2xl`
- Padding: `p-4`

**Elementos**:
- **Avatar**: `w-10 h-10 rounded-full bg-violet-100 text-primary`
- **Status Badge**: 
  - Ativa: `text-green-500`
  - Em atraso: `text-amber-500`

**Props**:
```typescript
{
  name: string;
  streaming: string;
  value: string;
  status: "Ativa" | "Em atraso";
}
```

---

### 5. FaturaCard

**Arquivo**: `src/components/faturas/FaturaCard.tsx`

**Características**:
- Border Radius: `rounded-2xl`
- Border Destaque: `border-l-4` (cor semântica baseada no status)
- Padding: `p-6`
- Hover: `shadow-md`

**Elementos**:
- **StreamingLogo**: Versão `lg`, `rounded-2xl`
- **Ação Principal**: Botão Pix `bg-primary`, `shadow-primary/25`
- **Contador**: Badge de tempo restante para pagamento

---

### 6. Tabelas de Dados (DataTables)

**Características**:
- Background: `bg-white`
- Border Radius: `rounded-2xl`
- Cabeçalhos: `bg-gray-50/50`, uppercase, `text-[10px]`, `font-black`

**Células Padronizadas**:
- **Vencimento**: `BillingDueDateCell` com contador de dias
- **Período**: `BillingPeriodCell` com formato `MMM/yy | MMM/yy`
- **Valor**: `BillingValueCell` com valor total e mensal empilhados

---

### 7. Sessão de Filtros (Filter Session)

**Características**:
- **Wrapper**: `<div className="py-6">`
- **Componente**: `GenericFilter`
- **Posicionamento**: Entre os KPIs e o cabeçalho da listagem (`SectionHeader`).
- **Espaçamento Inferior**: O `mt-2` ou `mt-4` na `div` da listagem garante o respiro adequado.

**Exemplo de Estrutura**:
```tsx
<KPIGrid>...</KPIGrid>

<div className="py-6">
  <GenericFilter 
    filters={...}
    values={...}
    onChange={...}
  />
</div>

<div className="space-y-4 relative mt-2">
  <SectionHeader ... />
  ...
</div>
```

---

## 🎭 Padrões de Layout

### Dashboard Page

**Estrutura**:
```tsx
<Page padding="p-8">
  <Header> // flex justify-between mb-10
    <Title + Subtitle>
    <ActionButtons> // Notificações + CTA
  </Header>
  
  <KPIGrid> // grid md:grid-cols-2 lg:grid-cols-4 gap-6
    <KPICard × 4>
  </KPIGrid>
  
  <ContentGrid> // grid lg:grid-cols-2 gap-10
    <Section> // bg-white rounded-[32px]
      <SectionHeader> // flex justify-between mb-6
      <ItemList> // space-y-2
    </Section>
  </ContentGrid>
</Page>
```

### Responsividade

- **Mobile First**: Todos os grids começam com `grid-cols-1`
- **Breakpoints**:
  - `md:` (768px): 2 colunas para KPIs
  - `lg:` (1024px): 4 colunas para KPIs, 2 colunas para sections

---

## 🎬 Animações Customizadas

> [!IMPORTANT]
> Use **exclusivamente** as animações nomeadas abaixo para manter a consistência do projeto. Não crie animações ad-hoc em componentes individuais.

### Animações de Entrada e Saída

Usadas para montar/desmontar elementos na tela (modais, dropdowns, toasts).

| Classe Tailwind | Duração | Easing | Uso |
|---|---|---|---|
| `animate-fade-in` | 0.3s | ease-out | Entrada padrão de qualquer elemento |
| `animate-fade-out` | 0.2s | ease-in | Saída/desmontagem de elementos |
| `animate-scale-in` | 0.2s | ease-out | Entrada de modais, popovers, dropdowns |
| `animate-scale-out` | 0.2s | ease-in | Saída de modais, popovers, dropdowns |

### Animações de Deslize (Slide)

Usadas para menus laterais, notificações, sidebars e painéis.

| Classe Tailwind | Direção | Duração | Uso |
|---|---|---|---|
| `animate-slide-in-from-top` | ↓ De cima | 0.3s | Notificações, banners |
| `animate-slide-in-from-bottom` | ↑ De baixo | 0.3s | Sheets mobile, toasts |
| `animate-slide-in-from-left` | → Da esquerda | 0.3s | Sidebar, menus laterais |
| `animate-slide-in-from-right` | ← Da direita | 0.3s | Painéis de detalhes, drawers |
| `animate-slide-out-to-right` | → Para direita | 0.2s | Fechar painéis/drawers |

### Animações Contínuas (Atenção e Estado)

Animações em loop infinito para destaque visual ou indicação de estado.

| Classe Tailwind | Ciclo | Uso Recomendado |
|---|---|---|
| `animate-bounce-subtle` | 2s | **Elementos lúdicos ou de destaque** — CTAs, ícones de atenção, badges novos |
| `animate-float` | 3s | **Elementos lúdicos de destaque** — ilustrações, ícones decorativos, empty states |
| `animate-shimmer` | 2s | **Estados de carregamento** — skeletons de texto/imagem |
| `animate-pulse-subtle` | 2s | Indicadores de status online, elementos pulsantes sutis |
| `animate-gradient-shift` | 3s | Backgrounds gradiente animados, botões premium |

> [!CAUTION]
> **`animate-float`** e **`animate-bounce-subtle`** devem ser usados com parcimônia. Reserve-os para elementos que precisam **realmente** chamar atenção. Usar em excesso polui a interface.

> [!TIP]
> Para estados de carregamento (skeletons), prefira **`animate-shimmer`**. Para skeletons grandes que ocupam áreas extensas, use o efeito **Wave** (seção Efeitos Especiais).

---

## ⏱️ Transições e Timing Functions

> [!IMPORTANT]
> Use **exclusivamente** as curvas de aceleração customizadas definidas no projeto. Não utilize `ease`, `linear` ou curvas genéricas do Tailwind.

### Funções de Tempo Customizadas

Definidas em `tailwind.config.ts` → `transitionTimingFunction`:

| Classe Tailwind | Curva (cubic-bezier) | Uso |
|---|---|---|
| `ease-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | **Padrão do projeto** — hover em cards, abertura de menus, qualquer transição suave |
| `ease-bounce-in` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | **Efeito de rebote** — entrada de modais, tooltips, elementos que precisam de playfulness |

### Classe Utilitária Global de Transição

Definida em `globals.css`:

```css
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Regra**: Aplique `.transition-smooth` em **todos os elementos interativos** (botões, cards, links, inputs) como atalho. Isso garante transição suave e padronizada sem precisar compor manualmente `transition-all duration-300 ease-smooth`.

**Exemplos de Uso**:
```tsx
// ✅ Correto — classe utilitária global
<div className="transition-smooth hover:bg-gray-50">...</div>

// ✅ Correto — composição Tailwind quando precisar de bounce
<div className="transition-all duration-200 ease-bounce-in">...</div>

// ❌ Errado — curvas genéricas
<div className="transition-all duration-300 ease-in-out">...</div>
```

---

## 🛡️ Utilitários de Interface e Acessibilidade

> [!NOTE]
> As regras abaixo são aplicadas **globalmente** pelo `globals.css`. Os desenvolvedores devem conhecê-las para evitar duplicação ou conflito.

### Anel de Foco Padronizado (Focus Ring)

O sistema define um anel de foco global para navegação por teclado:

```css
*:focus-visible {
  outline: 2px solid #6d28d9; /* primary */
  outline-offset: 2px;
}
```

> [!CAUTION]
> **Não crie `outline` ou `ring` customizados nos componentes.** O sistema já provê um anel de foco roxo vibrante (`#6d28d9`) com offset de 2px em todos os elementos focáveis via teclado. Isso garante consistência e conformidade com WCAG.

### Ocultação de Scrollbar

Classe: **`.scrollbar-hide`**

```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

**Uso**: Esconde barras de rolagem mantendo a funcionalidade de scroll. Ideal para:
- Carrosséis horizontais
- Sidebars com conteúdo longo
- Listas horizontais de tags/chips

### Interação Mobile (Touch Manipulation)

Classe: **`.touch-manipulation`**

```css
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
```

**Uso**: Aplicar em **todos os elementos clicáveis no mobile** (botões, cards, links). Remove o fundo de destaque azul/cinza padrão dos navegadores mobile e melhora a responsividade ao toque.

### Redução de Movimento (Prefers Reduced Motion)

> [!IMPORTANT]
> O sistema **já respeita automaticamente** as preferências do sistema operacional do usuário para redução de movimento. **A equipe NÃO precisa tratar isso componente por componente.**

Quando o usuário ativa "reduzir movimento" no OS, o CSS global desabilita:
- Todas as `animation-duration` → `0.01ms`
- Todas as `transition-duration` → `0.01ms`
- `scroll-behavior` → `auto`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## ✨ Efeitos Especiais

### Glass Effect

Classe: `.glass`

```css
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

**Uso**: Modais, overlays, elementos flutuantes.

### Wave Effect (Carregamento Dinâmico)

Classe: **`.animate-wave`**

Efeito de onda deslizante criado via pseudo-elemento `::after` com gradiente linear translúcido.

```css
.animate-wave {
  position: relative;
  overflow: hidden;
}
.animate-wave::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
  animation: wave 1.5s infinite;
}
```

**Uso**: Skeletons de carregamento **grandes** — hero sections, cards de preview, áreas extensas que precisam de um destaque visual maior do que o `animate-pulse-subtle` ou `animate-shimmer`.

> [!TIP]
> **Shimmer vs Wave**: Use `animate-shimmer` para skeletons de texto/linhas individuais. Use `animate-wave` para blocos e áreas grandes onde o efeito de onda completa é mais impactante.

### Shadow Patterns

- **Sutil**: `shadow-sm` (cards)
- **Com Cor**: `shadow-lg shadow-primary/25` (botões principais)
- **Destaque**: `shadow-lg shadow-primary/20` (items ativos)

### Cores Semânticas (CSS Custom Properties)

> [!WARNING]
> **Não use cores fixas** (`text-gray-900`, `bg-gray-50`) em áreas que representam o fundo geral da aplicação ou o texto principal do corpo. Use as variáveis semânticas do CSS.

O sistema define variáveis de cor no `:root` que devem ser respeitadas:

| Variável CSS | Valor Atual | Uso |
|---|---|---|
| `var(--background)` | `#f9fafb` | Fundo geral da aplicação (`body`) |
| `var(--foreground)` | `#111827` | Cor de texto principal do corpo (`body`) |

**Regra**: Para o background geral e texto principal, use `bg-[var(--background)]` e `text-[var(--foreground)]` ou aplique diretamente no `body`. Isso garante compatibilidade futura com dark mode e temas customizados.

Cores fixas do Tailwind (`bg-white`, `text-gray-500`, etc.) são permitidas em **componentes internos** (cards, badges, ícones) onde a cor tem significado semântico independente do tema.

---

## 🎯 Diretrizes de UI/UX

### Interatividade

1. **Sempre use `transition-smooth`** ou `ease-smooth` em elementos interativos (ver seção Transições)
2. **Hover states claros**: Mudança de background ou borda
3. **Estados ativos visuais**: Background colorido + shadow colorido
4. **Feedback visual imediato**: Badges, badges de notificação
5. **Mobile**: Aplique `.touch-manipulation` em todos os elementos clicáveis no mobile

### Hierarquia Visual

1. **Títulos em destaque**: `font-bold`, tamanhos grandes
2. **Informações secundárias**: `text-gray-500`, tamanhos menores
3. **CTAs chamativas**: `bg-primary`, `shadow-lg`, cores vibrantes

### Acessibilidade

- **Contraste**: Sempre use cores com contraste adequado (primary vs white, gray-900 vs white)
- **Tamanhos de toque**: Botões e links com padding suficiente (`py-3 px-6`)
- **Estados de foco**: O sistema já provê um anel de foco global (`#6d28d9`). **Não crie outlines customizados** (ver seção Utilitários)
- **Redução de movimento**: Tratada globalmente. **Não implemente `prefers-reduced-motion` por componente** (ver seção Utilitários)

---

## 🚀 Expansão Futura

### Componentes a Implementar

- **Button**: Variantes primary, secondary, outline, ghost
- **Input**: Text, number, select, textarea
- **Modal**: Overlay + dialog
- **Toast**: Notificações temporárias
- **Table**: Lista de participantes, streamings
- **Avatar**: Componente reutilizável com initials ou imagem

### Themes

Preparado para dark mode:
- Variáveis CSS no `:root` permitem fácil troca de temas
- Considerar `dark:` prefixes do Tailwind

---

## 📚 Referências Rápidas

- **Ícones**: [Lucide React](https://lucide.dev/)
- **Tailwind CSS**: [Documentação](https://tailwindcss.com/docs)
- **Fontes**: [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)
