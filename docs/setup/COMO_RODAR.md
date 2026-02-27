# Guia de Configuração e Execução

Este guia auxilia na configuração do ambiente de desenvolvimento local para o projeto StreamShare.

## Pré-requisitos

- **Node.js**: Versão 18 ou superior.
- **PNPM**: Gerenciador de pacotes (`npm i -g pnpm`).
- **Docker**: Para rodar o banco de dados localmente.

## Passos para Instalação

1. **Clone o repositório**.
    ```bash
    git clone https://github.com/MateusNGF/streamshare.git
    cd streamshare
    ```

2. **Instale as dependências**:
   ```bash
   pnpm install
   ```

3. **Configure as variáveis de ambiente**:
   Copie o arquivo de exemplo e ajuste as credenciais:
   ```bash
   cp .env.example .env
   ```

4. **Suba o Banco de Dados**:
   Utilize o Docker Compose para iniciar o PostgreSQL:
   ```bash
   docker-compose up -d
   ```

5. **Gere o Cliente do Banco de Dados**:
   Isso cria as tabelas e gera a tipagem do Prisma:
   ```bash
   pnpm db:push
   pnpm db:generate
   ```

## Executando o Projeto

Para iniciar o ambiente de desenvolvimento:

```bash
pnpm dev
```

Acesse a aplicação Web em: [http://localhost:3000](http://localhost:3000)

## Comandos Úteis

- **`pnpm build`**: Roda o build da aplicação.
- **`pnpm db:studio`**: Abre o Prisma Studio para visualizar os dados.
- **`pnpm db:seed`**: Alimenta o banco com dados padrão.

## Solução de Problemas Comuns

### Erro de Conexão com Banco
Verifique se o container docker está rodando:
```bash
docker ps
```
Se não estiver, verifique se a porta 5432 não está ocupada.

### Erro de Typos/Prisma no Web
Se o VSCode reclamar de tipos, tente reiniciar o TypeScript Server ou rodar `pnpm --filter @streamshare/database generate` novamente.
