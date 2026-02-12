# ✨ Dicas para uma UI Moderna e Eficiente

Este documento reúne conceitos de design moderno, grid e layout aplicados ao StreamShare v2, focando em visual premium e experiência fluida.

---

## 🏗️ 1. Layout & Grid Mastery

### Grid de Composição
Evite listas verticais infinitas. Use o sistema de grid do Tailwind para organizar informações de forma hierárquica.
- **KPIs**: Sempre em grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`.
- **Conteúdo Principal**: Use `grid-cols-1 lg:grid-cols-3` onde o conteúdo principal ocupa `lg:col-span-2` e informações secundárias/filtros ocupam `lg:col-span-1`.

### Densidade de Informação
- **Cards**: Use paddings generosos (`p-6` ou `p-8`).
- **Gap**: Mantenha consistência com `gap-6` (24px).
- **Alinhamento**: Itens em cards devem seguir uma linha de base invisível (Vertical Alignment).

---

## 🎨 2. Estética Premium

### Glassmorphism & Transparência
Use o efeito de "vidro" para elementos que se sobrepõem ao conteúdo ou para painéis laterais:
```tsx
const glassClass = "bg-white/70 backdrop-blur-md border border-white/20 shadow-xl";
```

### Sombras Progressivas
Em vez de uma sombra preta genérica, use sombras coloridas baseadas na cor primária para um visual mais vibrante:
- **Shadow Primary**: `shadow-lg shadow-primary/20`
- **Shadow Success**: `shadow-lg shadow-green-500/10`

### Gradients Estratégicos
Não use cores sólidas em heros ou áreas de destaque. Use gradientes sutis:
- `bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900`
- No texto: `bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400`

---

## ⚡ 3. Micro-interações (O diferencial)

### Feedback ao Hover
Sempre adicione um leve movimento ou mudança de escala em elementos clicáveis:
- `hover:-translate-y-1 transition-all duration-300`
- `hover:scale-[1.02] active:scale-[0.98]`

### Loading States (Skeleton)
Nunca mostre um "Loading..." de texto. Use Skeletons que mimetizam o layout final para evitar o "layout shift".

---

## 📊 4. Visualização Financeira

### Hierarquia de Valores
1. **Valor Principal**: Fonte `font-black`, tamanho grande (`text-3xl` ou `text-4xl`).
2. **Moeda**: Menor que o valor, cor `text-gray-400`.
3. **Contexto**: Sub-texto `/ mês` ou badge de ciclo sempre presente.

---

## 📱 5. Mobile-First Adaptativo
- Em telas pequenas, converta Grids em Carrosséis ou Pilhas Verticais.
- Use `hidden md:flex` para esconder detalhes não essenciais no mobile.
- **Toque**: Botões devem ter no mínimo `44px` de altura para acessibilidade.

---

## 💡 Checklist de Modernização
- [ ] O layout usa Grid ou Flexbox de forma inteligente?
- [ ] Existe feedback visual (hover/active) em todos os botões/cards?
- [ ] A hierarquia tipográfica está clara (Títulos vs Corpo)?
- [ ] O uso de cores e sombras segue o manual de marca?
- [ ] O sistema é legível e operável em dispositivos móveis?
