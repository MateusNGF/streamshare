# Modelo de Domínio - StreamShare

Este documento consolida a visão técnica e de negócio do ecossistema StreamShare, alinhado estritamente ao schema Prisma.

---

## 1. Finalidade do Sistema

O sistema tem como finalidade **organizar, controlar e manter assinaturas de serviços de streaming compartilhados**, permitindo que uma entidade organizadora administre grupos, disponibilize streamings e acompanhe o ciclo de vida das assinaturas individuais de cada participante.

O foco central não é o streaming em si, mas a **assinatura recorrente**, que representa a obrigação financeira e o direito de uso de um participante sobre um serviço específico.

---

## 2. Estrutura Organizacional (Tenant)

### Conta

A **Conta** é o nível mais alto de organização do domínio e funciona como o *tenant* do sistema.

**Responsabilidades:**
* Define o **plano contratado** (`basico`, `pro`, `business`)
* Impõe **limites operacionais** (ex.: número máximo de grupos)
* Centraliza:
  * Usuários administradores
  * Grupos
  * Participantes

A Conta representa quem **opera** o sistema, não quem consome o streaming.

---

## 3. Administração e Controle de Acesso

### Usuário

O **Usuário** representa uma identidade autenticável no sistema.
Pode atuar como:
* Administrador de uma ou mais contas
* Ou estar vinculado a um participante (opcional)

### ContaUsuario

Entidade de junção que define o **papel do usuário dentro de uma conta específica**.

**Características:**
* Controle de acesso **por conta**
* Níveis de acesso limitados (`owner`, `admin`)
* Um mesmo usuário pode administrar múltiplas contas

Esse modelo separa claramente **identidade**, **permissão** e **contexto organizacional**.

---

## 4. Organização Social e Contextual

### Grupo

O **Grupo** representa um **contexto organizacional e social**, geralmente associado a um grupo real (ex.: WhatsApp).

**Funções:**
* Agrupa streamings disponíveis
* Define regras gerais de participação
* Serve como ponto de entrada via **link de convite**

> [!IMPORTANT]
> O grupo **não possui participantes diretamente**. A relação social se materializa apenas quando um participante assina um streaming.

---

## 5. Modelagem de Streaming (Três Camadas)

### 5.1 StreamingCatalogo
Representa o **tipo abstrato de serviço** (Netflix, Spotify, Disney+). É apenas referencial, sem regras financeiras ou operacionais.

### 5.2 Streaming
Representa a **assinatura concreta de um serviço**, com regras próprias:
* Valor integral
* Limite máximo de participantes
* Data de vencimento
* Credenciais compartilhadas
* Frequências de pagamento habilitadas
* Estado ativo/inativo

O Streaming é **independente de grupos** e pode ser reutilizado.

---

## 6. Participante

O **Participante** representa o **consumidor final**, ou seja, quem efetivamente paga e utiliza o serviço.

**Características:**
* Pertence diretamente a uma Conta
* Identificado por WhatsApp e CPF
* Pode ou não estar vinculado a um Usuário autenticado
* Não participa de grupos diretamente

O participante só “entra” no sistema quando cria uma **assinatura**.

---

## 7. Assinatura: Centro do Domínio

A **Assinatura** é a **entidade central do sistema**. Ela conecta um Participante a um Streaming específico.

**Concentra:**
* Frequência de pagamento
* Valor cobrado
* Datas de início e vencimento
* Status (ativa, suspensa, cancelada)
* Controle de atraso e suspensão

Tudo que diz respeito a cobrança, acesso, inadimplência e renovação é representado, direta ou indiretamente, pela Assinatura.

> [!NOTE]
> No domínio persistente, **não existe pagamento sem assinatura**.

---

## 8. Escopo do Domínio Persistente

O modelo implementado foca em:
✔ Estrutura organizacional
✔ Controle de acesso administrativo
✔ Modelagem correta de streaming compartilhado
✔ Ciclo de vida da assinatura
