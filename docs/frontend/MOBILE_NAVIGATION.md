# Padrão de Navegação Mobile (Bottom Navigation)

Este guia documenta as decisões arquiteturais e de Interface do Usuário (UI/UX) implementadas para a navegação em dispositivos móveis no StreamShare, adotando uma abordagem moderna semelhante a aplicativos nativos (App-like experience).

## 1. Visão Geral
A navegação móvel tradicional via *Hamburger Menu no Header* foi substituída por um ecossistema de três peças:

1. **Header Minimalista:** Contém apenas a Logo (que atua como atalho para o Início) e a Campainha de Notificações. Fica fixo no topo (`fixed top-0`).
2. **Bottom Navigation Bar:** Uma barra fixa na base da tela (`fixed bottom-0`), contendo as ações cruciais e de uso diário (ex: Explorar, Faturas).
3. **Menu Gaveta (Bottom Sheet Drawer):** Um menu complementar acionado por um botão na barra inferior. Ele desliza de baixo para cima (`translate-y-0`) e concentra opções secundárias, substituições de assinatura, visão de plano e logout.

---

## 2. Componentes Principais

### 2.1 Floating Action Button (FAB) - Botão Início Centralizado
Implementamos o conceito de FAB flutuante na barra inferior para a ação principal do aplicativo, que é retornar ao Dashboard (Início).

**Características Visuais Premium:**
- O FAB utiliza um fundo com a cor de destaque do aplicativo (`bg-primary`).
- O botão é proeminente: redondo (`rounded-full`), maior que os ícones normais (`w-14 h-14`).
- Possui uma borda espessa e sólida em branco (`border-[4px] border-white`) com uma sombra (`shadow-lg`).
- O posicionamento utiliza `absolute -top-5` de forma a recortar visualmente a barra inferior, criando efeito 3D (flutuando *offset* sobre a barra de menus).
- O SVG (ícone `Home` - `lucide-react`) tem um preenchimento sutil quando ativo (`fill-white/80` se `pathname === homeHref`).

### 2.2 Bottom Sheet / Drawer de Menus Secundários
Para abrigar todo o extenso escopo do painel (como Streamings, Assinaturas, Participantes, Configurações), o clássico Menu Lateral (`Sidebar`) adapta-se para um *Bottom Sheet*.

- **Animação:** Transição suave da base `translate-y-full` para `translate-y-0` (em 300ms de duração).
- **Sombreamento (Backdrop):** O fundo exibe uma camada preta semi-transparente que intercepta os toques acidentais, configurada como `bg-black/60` juntamente com `backdrop-blur-sm` (desfoque do conteúdo de fundo) para manter imersão.
- **Top Bar (Handle):** O menu possui as pontas arredondadas e um botão para Fechar (`<X size={20} />`) no lado superior direito.
- **Filtro Inteligente:** Itens que já constam na Bottom Navigation Bar (ex: Explorar, Faturas) devem ser filtrados preventivamente via lógica do código (e.g. `!bottomNavHrefs.includes(item.href)`) para que não apareçam duplicados dentro do Drawer da Gaveta.

---

## 3. Diretrizes de CSS, Tailwind e Boas Práticas (Importante)

Para que essa barra fixa não sobreponha ou bloqueie o último item na rolagem da página, devemos estruturar rigorosamente as áreas de layout e de conteúdo principal (`<main>`).

### 3.1 Tratamento do Scroll Area (`padding` inferior)

A barra inferior (Bottom Navigation) mede tipicamente 64px (`h-16`). Portanto, o elemento que age como *wrapper* de rolagem das suas páginas **deve receber o equivalente a 64px (ou mais) de padding bottom**, aplicando-se isso estritamente à view mobile (retirando-a no desktop clássico).

Exemplo correto no componente `layout.tsx`:

```tsx
<main className="flex-1 overflow-y-auto h-screen pt-16 pb-16 lg:pt-0 lg:pb-0">
     <div className="p-4 md:p-8 max-w-7xl mx-auto">
         {children}
     </div>
</main>
```
* **Repare no controle responsivo**: O `pb-16` fornece folga para a bottom bar no mobile. O `lg:pb-0` o remove em telas grandes (onde a Sidebar lateral domina).*

### 3.2 Otimizações de UX iOS/Mobile (`pb-safe`)

A classe padrão do TailwindCSS não cobre a *Safe Area* de alguns iPhones modernos (aquele espaço sem *home button* sob a barra horizontal do sistema).
* Sempre devemos usar `pb-safe` e propriedades nativas do CSS como `padding-bottom: env(safe-area-inset-bottom);` quando lidamos com elementos `fixed bottom-0`.
* Isso impede que os ícones fiquem engolidos ou de difícil alcance no rodapé do dispositivo.  (Padrão utilizado na `<nav className="... pb-safe">`).

### 3.3 Touch-Feedback (Micro-Interações)
Em telas táteis, é crucial o usuário constatar que encostou no botão. A barra inferior deve prever:
- `active:scale-95` no FAB de Início ou botões afins, encolhendo rapidamente ao toque físico.
- Um suave anel protetor, ou um `bg-primary/10`, evidenciando qual aba está atualmente Ativa.

---

## 4. Exemplos de Implementações no Projeto

1. **Dashboard (Participantes/Provedores)**: `src/components/layout/Sidebar.tsx` (Contém o FAB renderizando dinamicamente a view de acordo com o `PlanoConta` - Free/Business).
2. **Dashboard de Sistema (SysAdmins)**: `src/components/admin/AdminSidebar.tsx` (Possui os atalhos adequados relativos ao painel de administração e FAB voltado a `/admin/parametros`).

Sempre que a estrutura de links do sistema mudar, atualize primeiramente o Array interno da *Sidebar*, assegurando-se de atualizar o filtro de exclusão (`bottomNavHrefs`) e o Array principal que renderiza estático o *Bottom Nav*.
