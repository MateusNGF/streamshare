# Guia: Configuração do Google OAuth 2.0

Para que o login via Google funcione, você precisa criar um **Client ID** no Google Cloud Console. Siga os passos abaixo:

## 1. Criar um Projeto no Google Cloud
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Clique no seletor de projetos no topo da página e selecione **"Novo Projeto"**.
3. Dê um nome ao projeto (ex: `StreamShare`) e clique em **Criar**.

## 2. Configurar a Tela de Consentimento OAuth
1. No menu lateral, vá em **APIs e Serviços** > **Tela de consentimento OAuth**.
2. Escolha o tipo de usuário **External** (Externo) e clique em **Criar**.
3. Preencha as informações obrigatórias:
   - **Nome do app**: StreamShare
   - **E-mail de suporte do usuário**: Seu e-mail.
   - **Dados de contato do desenvolvedor**: Seu e-mail.
4. Clique em **Salvar e Continuar** até o final.

## 3. Criar Credenciais (Client ID)
1. No menu lateral, vá em **APIs e Serviços** > **Credenciais**.
2. Clique em **+ Criar Credenciais** > **ID do cliente OAuth**.
3. Em **Tipo de aplicativo**, selecione **Aplicativo da Web**.
4. Dê um nome (ex: `StreamShare Web`).
5. **Origens JavaScript autorizadas**:
   - Clique em **+ Adicionar URI** e insira: `http://localhost:3000`
   - *(Adicione também sua URL de produção quando tiver uma)*.
6. **URIs de redirecionamento autorizados**:
   - Para o SDK que estamos usando (Google Identity Services), geralmente não é obrigatório para o fluxo de popup, mas você pode adicionar: `http://localhost:3000`
7. Clique em **Criar**.

## 4. Atualizar o Projeto
1. Copie o **ID do cliente** gerado.
2. Abra seu arquivo `.env` no projeto StreamShare.
3. Adicione ou atualize a linha:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID="SEU_CLIENT_ID_AQUI.apps.googleusercontent.com"
   ```
4. Reinicie o servidor de desenvolvimento (`npm run dev`).

> [!TIP]
> Não é necessário criar uma "Client Secret" para este fluxo de frontend (ID Token), apenas o "Client ID" é suficiente e deve ser público no ambiente Next.js.
