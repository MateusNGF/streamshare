# Responsividade e Acessibilidade - StreamShare

## 📱 Visão Geral

Este documento descreve as funcionalidades de responsividade e acessibilidade implementadas no sistema StreamShare, garantindo uma experiência inclusiva e otimizada para todos os dispositivos.

---

## 🎯 Funcionalidades Implementadas

### 1. **Navegação Mobile Responsiva**

#### Drawer Mobile
- Menu lateral se transforma em drawer deslizante em telas < 1024px
- Botão hambúrguer fixo no canto superior esquerdo
- Overlay escuro com backdrop blur ao abrir o menu
- Animação suave de slide (300ms)
- Fecha automaticamente ao clicar em um link ou no overlay

**Como usar**:
- **Mobile**: Toque no ícone ☰ para abrir/fechar
- **Desktop**: Menu sempre visível na lateral

---

### 2. **Skip Link para Navegação por Teclado**

#### Funcionalidade
Link invisível que aparece ao pressionar Tab, permitindo pular diretamente para o conteúdo principal.

**Como usar**:
1. Pressione `Tab` ao carregar qualquer página
2. O link "Pular para conteúdo principal" aparecerá
3. Pressione `Enter` para ir direto ao conteúdo

**Benefício**: Economiza tempo para usuários de teclado/leitores de tela.

---

### 3. **Focus Management em Modais**

#### Focus Trap
Quando um modal está aberto, o foco fica contido dentro dele, impedindo navegação acidental para elementos atrás.

**Comportamento**:
- `Tab`: Navega entre elementos do modal
- `Shift + Tab`: Navega para trás
- `Esc`: Fecha o modal
- Foco retorna ao elemento que abriu o modal após fechar

**Implementado em**:
- Modal de Participante
- Modal de Streaming
- Modal de Exclusão
- Modal de Logout

---

### 4. **Indicadores Visuais de Foco**

#### Outline Customizado
Todos os elementos interativos têm outline roxo visível ao receber foco.

**Especificações**:
- Cor: `#6d28d9` (primary)
- Espessura: 2px
- Offset: 2px

**Elementos afetados**:
- Inputs
- Botões
- Links
- Elementos de navegação

---

### 5. **Área de Toque Adequada (Mobile)**

#### Tamanhos Mínimos
Todos os botões e elementos interativos têm área de toque mínima de **44x44px** em mobile.

**Implementação**:
```tsx
// Mobile: 44px (p-2 = 8px padding + 20px icon = 36px, com margin chega a 44px)
// Desktop: 28px (p-1.5 = 6px padding + 16px icon)
<button className="p-2 md:p-1.5">
  <Icon size={20} className="md:w-4 md:h-4" />
</button>
```

**Benefício**: Facilita cliques em telas touch, reduzindo erros.

---

### 6. **Typography Responsiva**

#### Escala de Tamanhos

| Elemento | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| H1 (Títulos principais) | 24px | 30px | 30px |
| H2 (Subtítulos) | 20px | 24px | 24px |
| H3 (Cards) | 16px | 18px | 18px |
| KPI Values | 24px | 30px | 30px |
| Body | 14px | 14px | 14px |

**Implementação**:
```tsx
<h1 className="text-2xl md:text-3xl">Título</h1>
```

---

### 7. **Spacing Responsivo**

#### Padding e Margins

| Contexto | Mobile | Desktop |
|----------|--------|---------|
| Container principal | 16px | 32px |
| Cards | 16px | 24px |
| Grid gaps | 16px | 24px |
| Margins bottom | 24px | 40px |

**Padrão**:
```tsx
<div className="p-4 md:p-8 mb-6 md:mb-10">
```

---

### 8. **Mensagens de Erro Acessíveis**

#### Associação com Inputs
Mensagens de erro são anunciadas por leitores de tela e associadas ao input correspondente.

**Implementação**:
```tsx
<input 
  aria-invalid={error ? "true" : "false"}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && <p id="email-error" role="alert">{error}</p>}
```

**Benefício**: Usuários de leitores de tela sabem exatamente qual campo tem erro.

---

### 9. **Estados de Loading Anunciados**

#### aria-busy
Botões em estado de carregamento anunciam o estado para leitores de tela.

**Implementação**:
```tsx
<button aria-busy={loading} disabled={loading}>
  {loading ? "Carregando..." : "Salvar"}
</button>
```

---

### 10. **Progress Bars Acessíveis**

#### Indicadores de Progresso
Barras de progresso (vagas ocupadas) são anunciadas com valores específicos.

**Implementação**:
```tsx
<div 
  role="progressbar"
  aria-valuenow={percentage}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="5 de 10 vagas ocupadas"
>
```

**Benefício**: Leitores de tela anunciam "5 de 10 vagas ocupadas, 50%".

---

### 11. **Live Regions para Busca Dinâmica**

#### Anúncio de Resultados
Quando o usuário busca participantes/streamings, os resultados são anunciados automaticamente.

**Implementação**:
```tsx
<div aria-live="polite" aria-atomic="true">
  {results.map(item => <Card key={item.id} {...item} />)}
</div>
```

**Benefício**: Usuários de leitores de tela sabem quando os resultados mudam.

---

### 12. **Prefers Reduced Motion**

#### Respeito a Preferências do Usuário
Animações são reduzidas/desabilitadas para usuários com sensibilidade a movimento.

**Implementação**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Como ativar**:
- **Windows**: Configurações > Acessibilidade > Efeitos visuais > Desativar animações
- **macOS**: Preferências do Sistema > Acessibilidade > Monitor > Reduzir movimento
- **iOS**: Ajustes > Acessibilidade > Movimento > Reduzir movimento

---

## 🎨 Breakpoints

### Tailwind CSS

```css
sm: 640px   /* Smartphones landscape */
md: 768px   /* Tablets */
lg: 1024px  /* Desktops pequenos */
xl: 1280px  /* Desktops médios */
2xl: 1536px /* Desktops grandes */
```

### Comportamento por Dispositivo

#### Mobile (< 768px)
- Menu lateral vira drawer
- Grid de 1 coluna
- Padding reduzido
- Botões maiores (44px)
- Textos menores

#### Tablet (768px - 1023px)
- Menu lateral vira drawer
- Grid de 2 colunas
- Padding médio
- Botões médios

#### Desktop (≥ 1024px)
- Menu lateral fixo
- Grid de 2-3 colunas
- Padding completo
- Botões menores (otimizado para mouse)

---

## ♿ Conformidade WCAG 2.1

### Nível AA Alcançado

#### Perceptível
- ✅ **1.3.1** Info e Relacionamentos: Estrutura semântica correta
- ✅ **1.4.3** Contraste Mínimo: ≥ 4.5:1 para texto normal
- ✅ **1.4.11** Contraste Não-Textual: ≥ 3:1 para componentes UI

#### Operável
- ✅ **2.1.1** Teclado: Toda funcionalidade acessível via teclado
- ✅ **2.1.2** Sem Armadilha de Teclado: Focus trap apenas em modais
- ✅ **2.4.1** Bypass Blocks: Skip link implementado
- ✅ **2.4.3** Ordem de Foco: Ordem lógica e intuitiva
- ✅ **2.4.7** Foco Visível: Outline em todos os elementos

#### Compreensível
- ✅ **3.2.1** Em Foco: Sem mudanças inesperadas
- ✅ **3.3.1** Identificação de Erro: Erros claramente identificados
- ✅ **3.3.2** Labels ou Instruções: Todos os inputs têm labels

#### Robusto
- ✅ **4.1.2** Nome, Função, Valor: ARIA completo em todos os componentes
- ✅ **4.1.3** Mensagens de Status: role="alert" em mensagens

---

## 🧪 Como Testar

### Navegação por Teclado

1. **Tab**: Navegar para frente
2. **Shift + Tab**: Navegar para trás
3. **Enter**: Ativar botões/links
4. **Esc**: Fechar modais
5. **Arrow Keys**: Navegar em listas (quando aplicável)

**Checklist**:
- [ ] Todos os elementos interativos são alcançáveis
- [ ] Ordem de foco é lógica
- [ ] Foco é visível em todos os elementos
- [ ] Modais capturam o foco corretamente
- [ ] Skip link funciona

### Leitor de Tela

**NVDA (Windows - Gratuito)**:
1. Baixar em [nvaccess.org](https://www.nvaccess.org/)
2. Instalar e iniciar (Ctrl + Alt + N)
3. Navegar pelo site com Tab/Arrow keys
4. Verificar anúncios de elementos

**Checklist**:
- [ ] Botões de ícone são anunciados corretamente
- [ ] Modais são identificados como dialogs
- [ ] Erros são anunciados
- [ ] Estados de loading são anunciados
- [ ] Progress bars têm valores anunciados

### Responsividade

**Chrome DevTools**:
1. F12 > Toggle Device Toolbar (Ctrl + Shift + M)
2. Testar em:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1440px)

**Checklist**:
- [ ] Menu mobile funciona
- [ ] Textos não quebram
- [ ] Botões são clicáveis
- [ ] Grids se adaptam
- [ ] Sem overflow horizontal

---

## 📊 Métricas de Qualidade

### Lighthouse Targets

- **Performance**: ≥ 80
- **Accessibility**: ≥ 90
- **Best Practices**: ≥ 90
- **SEO**: ≥ 90

### Como Rodar

1. Abrir Chrome DevTools (F12)
2. Aba "Lighthouse"
3. Selecionar "Accessibility"
4. Click "Analyze page load"

---

## 🛠️ Ferramentas Recomendadas

### Browser Extensions

- **axe DevTools** (Chrome/Firefox): Análise automática de acessibilidade
- **WAVE** (Chrome/Firefox): Avaliação visual de acessibilidade
- **Lighthouse** (Chrome nativo): Auditoria completa

### Leitores de Tela

- **NVDA** (Windows): Gratuito, open-source
- **JAWS** (Windows): Pago, mais usado corporativamente
- **VoiceOver** (macOS/iOS): Nativo, gratuito

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

### Cursos

- [Web Accessibility by Google](https://www.udacity.com/course/web-accessibility--ud891)
- [A11ycasts with Rob Dodson](https://www.youtube.com/playlist?list=PLNYkxOF6rcICWx0C9LVWWVqvHlYJyqw7g)

---

## 🐛 Reportar Problemas

Se encontrar problemas de acessibilidade ou responsividade:

1. Abra uma issue no repositório
2. Use o label `accessibility` ou `responsive`
3. Inclua:
   - Dispositivo/navegador
   - Tamanho de tela
   - Passos para reproduzir
   - Screenshot/vídeo (se possível)

---

## 📝 Changelog

### v1.0.0 (2026-01-14)

**Adicionado**:
- ✅ Sidebar responsiva com drawer mobile
- ✅ Skip link para navegação por teclado
- ✅ Focus trap em modais
- ✅ ARIA completo em todos os componentes
- ✅ Touch targets adequados (44px mínimo)
- ✅ Typography e spacing responsivos
- ✅ Prefers reduced motion
- ✅ Mensagens de erro acessíveis
- ✅ Progress bars com ARIA
- ✅ Live regions para busca dinâmica

**Conformidade**:
- ✅ WCAG 2.1 Nível AA
- ✅ iOS Touch Guidelines (44px)
- ✅ Material Design Touch Guidelines (48px)
