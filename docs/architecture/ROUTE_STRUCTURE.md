# Estrutura de Rotas - StreamShare

## 📁 Organização do Diretório `app/`

```
app/
├── (auth)/                      # Route Group: Autenticação
│   ├── layout.tsx              # Layout com fundo gradiente centralizado
│   ├── login/
│   │   └── page.tsx            # → /login
│   ├── esqueci-senha/
│   │   └── page.tsx            # → /esqueci-senha
│   └── redefinir-senha/
│       └── [token]/
│           └── page.tsx        # → /redefinir-senha/[token]
│
├── (dashboard)/                 # Route Group: Área Protegida
│   ├── layout.tsx              # Layout com Sidebar + Main
│   ├── dashboard/
│   │   └── page.tsx            # → /dashboard
│   ├── participantes/
│   │   ├── page.tsx            # → /participantes
│   │   └── ParticipantesClient.tsx
│   ├── streamings/
│   │   ├── page.tsx            # → /streamings
│   │   └── StreamingsClient.tsx
│   ├── assinaturas/
│   │   ├── page.tsx            # → /assinaturas
│   │   └── AssinaturasClient.tsx
│   ├── cobrancas/
│   │   ├── page.tsx            # → /cobrancas
│   │   └── CobrancasClient.tsx
│   └── configuracoes/
│       └── page.tsx            # → /configuracoes
│
├── admin/                       # Área Administrativa
│   └── catalogo/
│       └── page.tsx            # → /admin/catalogo
│
├── api/                         # API Routes
│   └── auth/
│       ├── login/
│       ├── signup/
│       ├── logout/
│       ├── forgot-password/
│       ├── reset-password/
│       └── change-password/
│
├── layout.tsx                   # Root Layout (global)
├── page.tsx                     # → / (home/redirect)
├── loading.tsx                  # Loading UI global
└── globals.css                  # Estilos globais
```

---

## 🎯 Conceitos de Route Groups no Next.js 14

### O que são Route Groups?

Route Groups são pastas com nomes entre **parênteses** `(nome)` que:
- **NÃO aparecem na URL** (ex: `(dashboard)/streamings` vira apenas `/streamings`)
- Permitem **organizar rotas logicamente**
- Compartilham um **layout comum**
- Facilitam **aplicação de middleware**

### Vantagens da Nova Estrutura

#### 1️⃣ Separação Clara de Contextos

**`(auth)/`** - Rotas Públicas
- Layout: Fundo gradiente, centralizado
- Não requer autenticação
- Focado em formulários

**`(dashboard)/`** - Rotas Protegidas
- Layout: Sidebar + Main Content
- Requer autenticação
- Navegação consistente

#### 2️⃣ Layouts Compartilhados

Cada route group pode ter seu próprio `layout.tsx`:

```tsx
// (dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />        {/* Compartilhado por TODAS as páginas */}
      <main>{children}</main>
    </div>
  );
}
```

#### 3️⃣ URLs Limpas

Mesmo com organização em pastas, as URLs permanecem simples:

| Caminho do Arquivo | URL Resultante |
|-------------------|----------------|
| `(auth)/login/page.tsx` | `/login` |
| `(dashboard)/streamings/page.tsx` | `/streamings` |
| `admin/catalogo/page.tsx` | `/admin/catalogo` |

#### 4️⃣ Middleware Focado

É possível aplicar middleware específico para cada grupo:

```ts
// middleware.ts
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Proteger apenas rotas de (dashboard)
  if (path.startsWith('/dashboard') || 
      path.startsWith('/participantes') || 
      path.startsWith('/streamings') ||
      // ... outras rotas protegidas
     ) {
    return checkAuth(request);
  }
}
```

---

## 🚀 Fluxo de Navegação

### Usuário Não Autenticado
```
/ (home)
  └─→ Redirect para /login
      └─→ (auth)/login/page.tsx
          ├─→ Esqueceu senha? → /esqueci-senha
          └─→ Login bem-sucedido → /dashboard
```

### Usuário Autenticado
```
/dashboard
  ├─→ /participantes
  ├─→ /streamings
  ├─→ /assinaturas
  ├─→ /cobrancas
  ├─→ /configuracoes
  └─→ /admin/catalogo (se admin)
```

---

## 📝 Convenções de Nomenclatura

### Arquivos Especiais do Next.js 14

| Arquivo | Propósito |
|---------|-----------|
| `layout.tsx` | Layout compartilhado (preserva estado) |
| `page.tsx` | Conteúdo da página (rota acessível) |
| `loading.tsx` | UI de loading (Suspense automático) |
| `error.tsx` | UI de erro (Error Boundary) |
| `not-found.tsx` | Página 404 |

### Client Components vs Server Components

**Server Components (padrão)**
- `page.tsx` - Busca dados no servidor
- Usa `async/await` direto
- Menor bundle JavaScript

**Client Components**
- `*Client.tsx` - Componentes interativos
- Usa `"use client"` no topo
- Hooks (`useState`, `useEffect`)

#### Exemplo de Separação

```tsx
// page.tsx (Server Component)
export default async function StreamingsPage() {
  const streamings = await getStreamings(); // Server Action
  return <StreamingsClient streamings={streamings} />;
}

// StreamingsClient.tsx (Client Component)
"use client";
export function StreamingsClient({ streamings }) {
  const [isOpen, setIsOpen] = useState(false); // Hook
  // ... lógica de UI interativa
}
```

---

## ✅ Benefícios Alcançados

1. **Organização Clara**: Rotas agrupadas por contexto
2. **Reutilização**: Layouts compartilhados automaticamente
3. **Performance**: Server Components por padrão
4. **Manutenção**: Fácil adicionar novas páginas
5. **Escalabilidade**: Estrutura pronta para crescimento
6. **SEO**: Melhor controle de metadata por grupo

---

## 🔄 Migração Concluída

### Movimentações Realizadas

**Antes:**
```
app/
├── login/
├── dashboard/
├── participantes/
├── streamings/
└── ... (todas misturadas)
```

**Depois:**
```
app/
├── (auth)/
│   ├── login/
│   ├── esqueci-senha/
│   └── redefinir-senha/
└── (dashboard)/
    ├── dashboard/
    ├── participantes/
    ├── streamings/
    ├── assinaturas/
    ├── cobrancas/
    └── configuracoes/
```

### Compatibilidade

✅ **URLs não mudaram** - Todas as rotas continuam funcionando
✅ **Links internos preservados** - `href="/participantes"` funciona igual
✅ **Redirecionamentos mantidos** - Lógica de autenticação inalterada

---

## 📚 Referências

- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Layouts no App Router](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- [Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)
