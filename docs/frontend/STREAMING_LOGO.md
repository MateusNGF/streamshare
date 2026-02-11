# Componente StreamingLogo

Componente reutilizável que exibe o ícone/logo de um serviço de streaming com background colorido, renderizando a imagem SVG (filtro `brightness-0 invert`) ou a primeira letra do nome como fallback.

## Importação

```tsx
import { StreamingLogo } from "@/components/ui/StreamingLogo";
```

## Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `name` | `string` | — (obrigatório) | Nome do streaming (alt e fallback) |
| `color` | `string` | `'#6d28d9'` | Cor de fundo |
| `iconeUrl` | `string \| null` | `null` | URL do ícone SVG |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho |
| `rounded` | `'md' \| 'lg' \| 'xl' \| '2xl'` | `'xl'` | Border radius |
| `className` | `string` | — | Classes extras no container |

### Mapa de tamanhos

| Size | Container | Ícone | Texto |
|------|-----------|-------|-------|
| `xs` | `w-6 h-6` | `w-4 h-4` | `text-[10px]` |
| `sm` | `w-8 h-8` | `w-5 h-5` | `text-xs` |
| `md` | `w-10 h-10` | `w-6 h-6` | `text-sm` |
| `lg` | `w-12 h-12` | `w-8 h-8` | `text-lg` |

> [!TIP]
> Tamanhos maiores (ex: `w-16 h-16`) podem ser aplicados via `className` override.

## Uso

```tsx
{/* Tamanho padrão (md) */}
<StreamingLogo name="Netflix" color="#E50914" iconeUrl="/icons/netflix.svg" />

{/* Tamanho pequeno em tabelas */}
<StreamingLogo name="Disney+" color="#113CCF" iconeUrl={url} size="xs" rounded="md" />

{/* Tamanho grande com sombra customizada */}
<StreamingLogo name="HBO Max" color="#991EEB" iconeUrl={url} size="lg" rounded="2xl" className="shadow-lg" />

{/* Sem ícone → fallback para "H" */}
<StreamingLogo name="HBO Max" color="#991EEB" />
```

## Onde é utilizado

- `StreamingDetailCard` / `StreamingCard` — cards de streaming
- `CatalogoPicker` — seleção de catálogo
- `StreamingModal` / `AssinaturaModal` / `AssinaturaMultiplaModal` — modais
- `DetalhesAssinaturaModal` / `CancelarAssinaturaModal` / `GrupoFormModal` — modais de detalhes
- `CobrancasClient` / `AssinaturasClient` — tabelas
- `CatalogoClient` — admin
