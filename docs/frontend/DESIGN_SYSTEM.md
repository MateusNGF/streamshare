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

### Shadow Patterns

- **Sutil**: `shadow-sm` (cards)
- **Com Cor**: `shadow-lg shadow-primary/25` (botões principais)
- **Destaque**: `shadow-lg shadow-primary/20` (items ativos)

---

## 🎯 Diretrizes de UI/UX

### Interatividade

1. **Sempre use transições**: `transition-all` em elementos interativos
2. **Hover states claros**: Mudança de background ou borda
3. **Estados ativos visuais**: Background colorido + shadow colorido
4. **Feedback visual imediato**: Badges, badges de notificação

### Hierarquia Visual

1. **Títulos em destaque**: `font-bold`, tamanhos grandes
2. **Informações secundárias**: `text-gray-500`, tamanhos menores
3. **CTAs chamativas**: `bg-primary`, `shadow-lg`, cores vibrantes

### Acessibilidade

- **Contraste**: Sempre use cores com contraste adequado (primary vs white, gray-900 vs white)
- **Tamanhos de toque**: Botões e links com padding suficiente (`py-3 px-6`)
- **Estados de foco**: Next.js adiciona automaticamente

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
