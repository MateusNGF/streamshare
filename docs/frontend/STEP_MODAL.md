# StepModal — Padrão de Modais em Múltiplas Etapas

> Documentação do padrão de componentes para a criação de modais com etapas sequenciais no StreamShare.

---

## Visão Geral

O padrão **StepModal** é o padrão oficial do projeto para criar fluxos guiados dentro de um modal. É composto por elementos estruturais reutilizáveis que garantem consistência visual e de comportamento.

**Exemplos de uso no projeto:**
| Componente | Etapas | Referência |
|---|---|---|
| `StreamingModal` | 2 — Catálogo → Configuração | [`src/components/modals/StreamingModal.tsx`](../../src/components/modals/StreamingModal.tsx) |
| `VerificationFlow` | 2 — Intro → OTP | [`src/components/auth/VerificationFlow.tsx`](../../src/components/auth/VerificationFlow.tsx) |
| `AssinaturaMultiplaModal` | 4 — Streamings → Valores → Participantes → Resumo | [`src/components/modals/AssinaturaMultiplaModal.tsx`](../../src/components/modals/AssinaturaMultiplaModal.tsx) |

---

## Anatomia do StepModal

```
┌─────────────────────────────────────────────┐
│  Header (título + botão fechar)       [Modal]│
├─────────────────────────────────────────────┤
│                                             │
│  ① ─────────────────── ②    [StepIndicator] │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [StepIcon]                          │   │
│  │ [StepTitle]                         │   │
│  │ [StepDescription]                   │   │ [StepBody]
│  │ [StepContent] (inputs, grids, etc.) │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│  [Voltar]              [Próximo / Finalizar] │ [StepFooter]
└─────────────────────────────────────────────┘
```

---

## Componentes Reutilizáveis

Todos os componentes estão localizados em `@/components/ui/step-modal`.

### 1. `StepIndicator`

Controla a barra de progresso no topo.

```tsx
import { StepIndicator } from "@/components/ui/step-modal";

<StepIndicator 
    currentStep={step} 
    totalSteps={2} 
/>
```

---

### 2. `StepContainer`

Wrapper que aplica as animações de entrada laterais.

```tsx
import { StepContainer } from "@/components/ui/step-modal";

<StepContainer step={step}>
    {/* Conteúdo da etapa */}
</StepContainer>
```

> [!TIP]
> Por padrão, a etapa 1 entra pela esquerda e a etapa 2+ pela direita. Você pode forçar a direção com a prop `direction="left" | "right"`.

---

### 3. `StepIcon`

Container padronizado para o ícone da etapa.

```tsx
import { StepIcon } from "@/components/ui/step-modal";
import { ShieldCheck } from "lucide-react";

<StepIcon 
    icon={ShieldCheck} 
    variant="primary" // primary | success | warning | danger
/>
```

---

### 4. `StepHeader`

Título e descrição centralizados.

```tsx
import { StepHeader } from "@/components/ui/step-modal";

<StepHeader 
    title="Verifique sua identidade"
    description="Para garantir a segurança dos seus dados, valide seu acesso."
/>
```

---

### 5. `StepNavigation` (Footer)

Gerencia os botões de navegação no rodapé.

```tsx
import { StepNavigation } from "@/components/ui/step-modal";

const footer = (
    <StepNavigation
        step={step}
        totalSteps={2}
        isLoading={isVerifying}
        onBack={() => setStep(1)}
        onNext={handleNext}
        onSkip={handleSkip} // Opcional (exibe no step 1)
        nextLabel={step === 2 ? "Verificar agora" : "Continuar"}
        canNext={isComplete} // Validação
    />
);
```

---

## Template Completo (Clean Code)

Usando os novos componentes, o código do modal torna-se declarativo e fácil de manter.

```tsx
"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { 
    StepIndicator, 
    StepContainer, 
    StepIcon, 
    StepHeader, 
    StepNavigation 
} from "@/components/ui/step-modal";
import { Lock, CheckCircle } from "lucide-react";

export function MyModal({ isOpen, onClose }) {
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);

    const footer = (
        <StepNavigation
            step={step}
            totalSteps={2}
            isLoading={loading}
            onBack={() => setStep(1)}
            onNext={step === 1 ? () => setStep(2) : handleSubmit}
        />
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Fluxo" footer={footer}>
            <StepIndicator currentStep={step} totalSteps={2} />

            <div className="py-2">
                {step === 1 ? (
                    <StepContainer step={1}>
                        <StepIcon icon={Lock} />
                        <StepHeader 
                            title="Segurança" 
                            description="Etapa inicial de configuração." 
                        />
                        {/* inputs customizados aqui */}
                    </StepContainer>
                ) : (
                    <StepContainer step={2}>
                        <StepIcon icon={CheckCircle} variant="success" />
                        <StepHeader 
                            title="Conclusão" 
                            description="Tudo pronto para finalizar." 
                        />
                    </StepContainer>
                )}
            </div>
        </Modal>
    );
}
```

---

## Regras e Boas Práticas

> [!IMPORTANT]
> **Sempre use a prop `footer` do `Modal`** para os botões de navegação. Nunca coloque botões dentro do corpo (`children`) do modal.

> [!IMPORTANT]
> **Reset de estado ao fechar.** Sempre que o modal fechar (seja por `onClose` ou sucesso), redefina o `step` para `1` e limpe os estados internos.

> [!TIP]
> **Para 2 etapas** → use indicadores circulares (`StreamingModal`/`VerificationFlow`).
> **Para 4+ etapas** → use barras horizontais (`AssinaturaMultiplaModal`).

> [!TIP]
> **Extraia etapas complexas** em componentes separados quando o `StepContent` tiver mais de ~50 linhas de JSX. O padrão do `AssinaturaMultiplaModal` (com `StepStreamings`, `StepConfiguration`, etc. em subpastas) é o modelo ideal para fluxos mais ricos.

> [!NOTE]
> A animação de troca de etapa usa `animate-in fade-in slide-in-from-left-4` e `slide-in-from-right-4` do Tailwind (plugin `tailwindcss-animate`). Certifique-se de limpar o `isLoading` ao avançar de etapa para evitar estados travados.

---

## Arquivos de Referência

| Arquivo | Tipo | Etapas |
|---|---|---|
| `StreamingModal.tsx` | Simples | 2 |
| `VerificationFlow.tsx` | Simples | 2 |
| `AssinaturaMultiplaModal.tsx` | Complexo (extraído) | 4 |
| `Modal.tsx` | Base | — |
| `Button.tsx` | UI | — |
