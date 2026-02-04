# Padrões de Layout para Modais

Este documento define as duas abordagens principais para manipulação de modais na aplicação StreamShare.

## 1. Modal Simplificado (`@/components/ui/Modal`)

Utilizamos um componente `Modal` customizado para casos de uso simples, como diálogos de confirmação, alertas ou formulários básicos. Este componente oferece uma interface consistente com backdrop embutido, layout centralizado e seções padronizadas de cabeçalho e rodapé.

### Arquitetura
- **Implementação**: Implementação customizada utilizando `focus-trap-react` para acessibilidade.
- **Principais Recursos**:
  - Bloqueio automático de rolagem do corpo da página.
  - Fechamento com a tecla "ESC".
  - Fechamento ao clicar fora.
  - Design responsivo (bottom sheet em mobile, modal centralizado em desktop).

### Uso

```tsx
import { Modal } from "@/components/ui/Modal";

function MyModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Título do Modal"
      footer={
        <>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleConfirm}>Confirmar</button>
        </>
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
- Formulários complexos (ex: `AssinaturaModal`).
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
3.  **Layout**: Empilhar botões verticalmente usando `flex-col` (ou `flex-col-reverse` para colocar a ação primária no topo).

### Guia de Implementação

#### Para Modal Simples (Componente `Modal`)
O container de rodapé padrão do componente `Modal` força um layout horizontal (`flex-row`). Para atingir o layout vertical no mobile, você **deve envolver seus botões em uma `div` container** que gerencie a lógica responsiva e passar esse container para a prop `footer`.

**NÃO** passe um fragmento de botões diretamente se desejar empilhamento vertical no mobile.

```tsx
// ✅ Padrão CORRETO
<Modal
  // ... props
  footer={
    <div className="flex flex-col-reverse sm:flex-row w-full sm:justify-end gap-3">
      <button className="w-full sm:w-auto px-4 py-2 ...">
        Cancelar
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
