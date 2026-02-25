# Padrões de Layout para Modais

Este documento define as duas abordagens principais para manipulação de modais na aplicação StreamShare.

## 1. Modal Simplificado (`@/components/ui/Modal`)

Utilizamos um componente `Modal` customizado para casos de uso simples, como diálogos de confirmação, alertas ou formulários básicos. Este componente encapsula **toda a complexidade de acessibilidade, responsividade e renderização segura** — os desenvolvedores apenas fornecem conteúdo e callbacks.

### Arquitetura Detalhada

#### 🚀 Renderização via Portal (React Portal)

O `Modal` utiliza `createPortal` para **ejetar seu conteúdo diretamente para `document.body`**, fora da árvore DOM do componente pai.

**Por quê isso importa**: Containers pais com `overflow: hidden`, `transform`, ou `position: relative` podem cortar o `z-index` de filhos, tornando o modal invisível ou parcialmente oculto. O portal elimina esse problema por design.

> ⚠️ **Proibido**: Tentar controlar o `z-index` ou posicionamento do modal via CSS do componente pai. O modal sempre estará em `z-50` fora de qualquer container.

#### ♿ Acessibilidade com FocusTrap

O componente usa `focus-trap-react` que, quando o modal está aberto:
- **Prende a navegação por teclado** (`Tab` / `Shift+Tab`) dentro do modal.
- **Permite clique fora** (no backdrop) para fechar, sem soltar o trap.
- Atributos ARIA (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`) são aplicados automaticamente.

> ❌ **Terminantemente proibido** recriar lógicas de FocusTrap manualmente em outras páginas ou componentes.

#### ⌨️ Tecla ESC e Bloqueio de Scroll

Quando `isOpen = true`, o Modal:
1. Adiciona listener de `keydown` para fechar ao pressionar `Escape`.
2. Define `document.body.style.overflow = "hidden"` para bloquear o scroll do fundo.
3. Remove ambos ao fechar (`useEffect` cleanup).

> ❌ Nunca adicione `overflow: hidden` ao body ou outro listener de ESC manualmente em páginas que usam o Modal.

#### 📱 Comportamento Responsivo Híbrido

O Modal funciona como **dois componentes em um**, dependendo do breakpoint:

| Breakpoint | Comportamento | Animação |
| :--- | :--- | :--- |
| **Mobile** (`< sm`) | **Bottom Sheet** — cola na base da tela, bordas arredondadas no topo | `animate-slide-in-from-bottom` (400ms, spring curve) |
| **Desktop** (`≥ sm`) | **Dialog centralizado** — centralizado com padding lateral | `animate-scale-in` (300ms, ease-out) |

> ❌ **Proibido** tentar forçar a largura ou posição do modal via `className`. O `className` é reservado **apenas** para sobrescrever o `max-width` padrão em casos excepcionais (ex: modais de visualização de imagem). O padrão é `sm:max-w-2xl`.

#### 🔒 Prevenção de Erros de Hidratação (Segurança SSR)

O Modal usa um estado interno `mounted` para garantir segurança com Next.js:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);

if (!isOpen || !mounted) return null; // Não renderiza no servidor
```

**Regra geral** (aplicar em todo componente que acesse `window` ou `document.body`):
> Qualquer componente de UI que manipule `window`, `document.body` ou renderize via Portal **deve iniciar oculto** e só exibir seu conteúdo após confirmar a montagem no cliente com este padrão.

#### ✨ Detalhe: Botão de Fechar

O botão X no cabeçalho do modal possui a classe `hover:rotate-90 duration-300`, que o faz **girar 90° ao receber o hover** — uma micro-interação lúdica que melhora a percepção de interatividade.

---

### Interface

```typescript
interface ModalProps {
    isOpen: boolean;           // Controla visibilidade
    onClose: () => void;       // Callback de fechamento
    title: string;             // Título do header (obrigatório)
    children: React.ReactNode; // Conteúdo do body
    footer?: React.ReactNode;  // Rodapé (botões de ação)
    className?: string;        // Apenas para sobrescrever max-width
}
```

### Uso Correto

```tsx
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

function MyModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Título do Modal"
      footer={
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Button variant="outline" className="w-full sm:w-auto sm:mr-auto" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="default" className="w-full sm:w-auto" onClick={handleConfirm}>
            Confirmar
          </Button>
        </div>
      }
    >
      <p>Conteúdo do modal.</p>
    </Modal>
  );
}
```

### Quando usar
- Diálogos de confirmação simples (Excluir, Sair).
- Alertas informativos.
- Formulários simples que se encaixam no fluxo padrão Cabeçalho -> Conteúdo -> Rodapé.

---

## 2. Dialog Complexo (`@/components/ui/dialog`)

Para cenários mais complexos, utilizamos os primitivos `Dialog` (provavelmente baseados em Radix UI / Shadcn UI). Isso oferece maior flexibilidade e permite a composição de partes.

### Arquitetura
- **Implementação**: Wrappers em torno dos primitivos Radix UI Dialog.
- **Componentes**: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`.

### Uso

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

function MyComplexModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Conteúdo complexo do formulário */}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Quando usar
- Formulários complexos (ex: `AssinaturaModal`, veja [Sistema de Faturamento](./BILLING_SYSTEM.md)).
- Modais que exigem estilização ou layout customizado que foge do padrão do componente `Modal`.
- Quando é necessário controle granular sobre o comportamento e acessibilidade do diálogo.

## Resumo das Recomendações

| Recurso | `Modal` (Customizado) | `Dialog` (Radix/Shadcn) |
| :--- | :--- | :--- |
| **Simplicidade** | Alta (Interface tudo-em-um) | Média (Partes componíveis) |
| **Flexibilidade** | Baixa (Estrutura rígida) | Alta (Controle total) |
| **Melhor Para** | Confirmações, alertas simples | Formulários complexos, fluxos multi-passos |

---

## 3. Design Responsivo e Layout

Para garantir uma experiência fluida em todos os dispositivos, especialmente em mobile, siga estas regras específicas de layout para Modais.

### Padrão para Rodapé Mobile (Footer)

Em dispositivos móveis, os botões de ação devem seguir estas regras:
1.  **Posicionamento**: Sempre na parte inferior (bottom) do modal.
2.  **Largura**: Botões devem ocupar **100% da largura** (`w-full`) para facilitar a interação por toque.
3.  **Ordem de Empilhamento**:
    - **Ação Secundária (Ex: Voltar)**: Deve ficar no **TOPO**.
    - **Ação Primária (Ex: Confirmar/Próximo)**: Deve ficar na **BASE**.
4.  **Layout**: Utilize `flex-col` para empilhar.

### Guia de Implementação

#### Para Modal Simples (Componente `Modal`)
O container de rodapé deve controlar o layout responsivo.

**NÃO** passe um fragmento de botões diretamente se desejar empilhamento vertical no mobile.

```tsx
// ✅ Padrão CORRETO (Mobile: Voltar encima, Confirmar embaixo)
<Modal
  // ... props
  footer={
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
      <button className="w-full sm:w-auto sm:mr-auto px-4 py-2 ...">
        Voltar/Cancelar
      </button>
      <button className="w-full sm:w-auto px-4 py-2 bg-primary ...">
        Confirmar
      </button>
    </div>
  }
>
  {/* Conteúdo */}
</Modal>
```

```tsx
// ❌ Padrão INCORRETO (Ficará horizontal no mobile devido aos estilos do wrapper)
<Modal
  // ... props
  footer={
    <>
      <button>Cancelar</button>
      <button>Confirmar</button>
    </>
  }
>
  {/* Conteúdo */}
</Modal>
```

#### Para Dialog Complexo (Primitivos `Dialog`)
Ao construir rodapés customizados com `DialogFooter`, aplique as mesmas classes utilitárias ao container do seu rodapé.

```tsx
<DialogFooter className="flex-col-reverse sm:flex-row gap-3">
  <Button className="w-full sm:w-auto" variant="outline">
    Cancelar
  </Button>
  <Button className="w-full sm:w-auto">
    Salvar Alterações
  </Button>
</DialogFooter>
```
