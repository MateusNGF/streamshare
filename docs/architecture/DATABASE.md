# 🗄️ Database Management - StreamShare

Este documento detalha como gerenciar o banco de dados PostgreSQL usando o Prisma no monorepo StreamShare.

---

## 🚀 Comandos Rápidos (Root)

Para facilitar o desenvolvimento, os comandos abaixo podem ser executados diretamente na raiz do projeto:

| Comando | Descrição |
| :--- | :--- |
| `pnpm db:generate` | Gera o Prisma Client (tipagem TypeScript). |
| `pnpm db:push` | Sincroniza o schema com o banco **sem criar migrations** (ideal para prototipagem). |
| `pnpm db:migrate` | Cria e aplica uma nova migration SQL (uso em produção/oficial).|
| `pnpm db:seed` | Alimenta o banco com dados padrão (Ex: Catálogo de Streamings). |
| `pnpm db:studio` | Abre a interface visual do Prisma para navegar nos dados. |

---

## 🛠️ Migrations vs Push

### Quando usar `db:push`?
Use o `pnpm db:push` durante a prototipagem rápida. Ele sincroniza o banco instantaneamente sem gerar arquivos SQL na pasta `migrations`.
> [!WARNING]
> O `push` pode causar perda de dados se houver mudanças estruturais drásticas. Use apenas em desenvolvimento local.

### Quando usar `db:migrate`?
Use o `pnpm db:migrate` quando quiser "salvar" uma alteração oficial. Ele criará um arquivo SQL numerado, garantindo que outros desenvolvedores e o ambiente de produção recebam as mesmas alterações.

---

## ⚡ Solução de Problemas (Bypass & Troubleshooting)

### Erro de Tipagem (TS) mesmo após mudanças
Se você adicionou um campo no `schema.prisma` e o TypeScript ainda reclama que o campo não existe:
1. Rode `pnpm db:generate`.
2. No VS Code, abra a paleta de comandos (`Ctrl+Shift+P`).
3. Execute **"TypeScript: Restart TS Server"**.

### Sincronização de Enums
O Prisma às vezes não detecta mudanças automáticas em Enums no PostgreSQL via `push`. Se encontrar erros de "type already exists", prefira usar `migrate dev` para que ele trate a alteração via SQL.

### Reiniciar o Banco do Zero
Se o banco estiver em um estado inconsistente e você quiser limpá-lo:
```bash
pnpm --filter @streamshare/database exec prisma migrate reset
```
*Isso apagará todos os dados, reaplicará todas as migrations e executará o seed.*

---

## 📦 Localização dos Arquivos
- **Schema**: `packages/database/prisma/schema.prisma`
- **Seed**: `packages/database/prisma/seed.ts`
- **Migrations**: `packages/database/prisma/migrations/`
