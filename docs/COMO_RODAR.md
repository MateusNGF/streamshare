# Guia de Configuração e Execução

Este guia auxilia na configuração do ambiente de desenvolvimento local para o projeto StreamShare.

## Pré-requisitos

- **Node.js**: Versão 18 ou superior.
- **PNPM**: Gerenciador de pacotes (`npm i -g pnpm`).
- **Docker**: Para rodar o banco de dados localmente.

## Passos para Instalação

1. **Clone o repositório** (se ainda não o fez).

2. **Instale as dependências**:
   Na raiz do projeto (`w:\projetos\streamsharev2`), execute:
   ```bash
   pnpm install
   ```

3. **Configure as variáveis de ambiente**:
   Um arquivo `.env` foi criado na raiz com a `DATABASE_URL`. Certifique-se de que ele aponta para o seu banco local.

4. **Suba o Banco de Dados**:
   Utilize o Docker Compose para iniciar o PostgreSQL:
   ```bash
   docker-compose up -d
   ```

4. **Gere o Cliente do Banco de Dados**:
   Isso cria as tabelas e gera a tipagem do Prisma:
   ```bash
   pnpm --filter @streamshare/database push
   pnpm --filter @streamshare/database generate
   ```

## Executando o Projeto

Para iniciar o ambiente de desenvolvimento (todas as aplicações):

```bash
pnpm dev
```

Acesse a aplicação Web em: [http://localhost:3000](http://localhost:3000)

## Comandos Úteis

- **`pnpm build`**: Roda o build de todas as aplicações e pacotes.
- **`pnpm db:studio`**: (Requer script no package.json ou acesso direto) Abre o Prisma Studio para visualizar os dados.
  - Alternativa: `cd packages/database && npx prisma studio`

## Solução de Problemas Comuns

### Erro de Conexão com Banco
Verifique se o container docker está rodando:
```bash
docker ps
```
Se não estiver, verifique se a porta 5432 não está ocupada.

### Erro de Typos/Prisma no Web
Se o VSCode reclamar de tipos, tente reiniciar o TypeScript Server ou rodar `pnpm --filter @streamshare/database generate` novamente.
