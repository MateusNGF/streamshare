# 🗄️ Database Management - StreamShare

Este documento detalha como gerenciar o banco de dados PostgreSQL usando o Prisma no StreamShare.

---

## 🚀 Comandos Rápidos

Para facilitar o desenvolvimento, os comandos abaixo podem ser executados na raiz do projeto:

| Comando | Descrição |
| :--- | :--- |
| `npm run db:generate` | Gera o Prisma Client (tipagem TypeScript). |
| `npm run db:push` | Sincroniza o schema com o banco **sem criar migrations** (ideal para prototipagem). |
| `npm run db:deploy` | Aplica as migrations SQL existentes no banco (uso em produção).|
| `npm run db:seed` | Alimenta o banco com o catálogo padrão de streamings. |
| `npm run db:seed:demo` | Alimenta o banco com dados de exemplo (assinaturas, KPIs, cobranças) para demonstração. |
| `npm run db:studio` | Abre a interface visual do Prisma para navegar nos dados. |

---

## 🛠️ Push vs Migrations

### Quando usar `db:push`?
Use o `npm run db:push` durante a prototipagem rápida. Ele sincroniza o banco instantaneamente sem gerar arquivos SQL.
> [!WARNING]
> O `push` pode causar perda de dados se houver mudanças estruturais drásticas. Use apenas em desenvolvimento local.

### Quando usar Migrations oficiais?
Para mudanças oficiais que precisam ser replicadas em outros ambientes, utilize os comandos nativos do Prisma via npx:
```bash
npx prisma migrate dev --name nome_da_mudanca
```

---

## ⚡ Solução de Problemas

### Erro de Tipagem (TS) após mudar o Schema
Se você alterou o [`prisma/schema.prisma`](../../prisma/schema.prisma) e o TypeScript ainda reclama:
1. Rode `npm run db:generate`.
2. No VS Code, abra a paleta de comandos (`Ctrl+Shift+P`).
3. Execute **"TypeScript: Restart TS Server"**.

### Sincronização de Enums no Postgres
O Prisma às vezes não detecta mudanças automáticas em Enums no PostgreSQL via `push`. Se encontrar erros de "type already exists", prefira usar `migrate dev` para que ele trate a alteração via SQL.

### Reiniciar o Banco do Zero
Se o banco estiver inconsistente e você quiser limpá-lo (CUIDADO):
```bash
npx prisma migrate reset
```
*Isso apagará todos os dados, reaplicará as migrations e executará o seed.*

---

## 📦 Localização dos Arquivos
- **Schema**: [`prisma/schema.prisma`](../../prisma/schema.prisma)
- **Seed Principal**: [`prisma/seed.ts`](../../prisma/seed.ts)
- **Seed de Demo**: [`prisma/seed-demo.ts`](../../prisma/seed-demo.ts)
- **Migrations**: `prisma/migrations/`

