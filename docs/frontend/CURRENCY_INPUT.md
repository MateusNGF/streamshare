# Componentes Reutilizáveis - CurrencyInput

## 💰 CurrencyInput

**Localização**: `src/components/ui/CurrencyInput.tsx`

**Propósito**: Input especializado para valores monetários com formatação automática e suporte multi-moeda.

**Características**:
- Formatação automática com separadores de milhares
- Prefixo de moeda dinâmico (R$, $, €) baseado nas preferências do usuário
- 2 casas decimais fixas
- Compatível com `react-hook-form`
- Acessibilidade completa (A11y)
- Bibliotec: `react-number-format`
- Design System StreamShare

**Props**:
```typescript
interface CurrencyInputProps {
  label?: string;              // Label do campo
  error?: string;              // Mensagem de erro
  value?: number;              // Valor numérico
  onValueChange?: (value: number | undefined) => void;
  placeholder?: string;        // Placeholder (ex: "R$ 0,00")
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
  // ... outras props do NumericFormat
}
```

**Uso Básico**:
```tsx
import { CurrencyInput } from '@/components/ui/CurrencyInput';

function MyForm() {
  const [valor, setValor] = useState<number>();

  return (
    <CurrencyInput
      label="Valor Mensal"
      value={valor}
      onValueChange={setValor}
      required
    />
  );
}
```

**Com React Hook Form**:
```tsx
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { useForm, Controller } from 'react-hook-form';

function MyForm() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="valorIntegral"
        control={control}
        render={({ field, fieldState }) => (
          <CurrencyInput
            label="Valor Integral"
            value={field.value}
            onValueChange={field.onChange}
            error={fieldState.error?.message}
            required
          />
        )}
      />
    </form>
  );
}
```

**Exemplo Real - StreamingModal**:
```tsx
<CurrencyInput
  label="Valor Integral (Mensal)"
  value={typeof formData.valorIntegral === 'number' 
    ? formData.valorIntegral 
    : parseFloat(formData.valorIntegral) || 0}
  onValueChange={(val) => handleChange("valorIntegral", String(val || 0))}
  placeholder="R$ 0,00"
  error={errors.valorIntegral}
  required
/>
```

**Comportamento Multi-Moeda**:
O componente automaticamente ajusta:
- **Símbolo**: R$ (BRL), $ (USD), € (EUR)
- **Separador de milhares**: . (BRL), , (USD/EUR)
- **Separador decimal**: , (BRL), . (USD/EUR)

**Validação**:
- Aceita apenas números
- Não permite valores negativos
- Sempre mantém 2 casas decimais
- Validação automática de min/max se fornecidos

---

## 📖 Documentação Completa

Para informações detalhadas sobre o sistema de moeda, consulte:

**[CURRENCY_SYSTEM.md](./CURRENCY_SYSTEM.md)** - Documentação completa incluindo:
- Hook `useCurrency`
- Função `formatCurrency`
- Tipos e constantes
- Boas práticas
- Integração com banco de dados
