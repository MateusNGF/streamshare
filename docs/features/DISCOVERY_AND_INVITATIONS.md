# Implementation Plan - Discovery & Invitations (Explorer focused)

## Goal Description
Implement a Discovery module for public streamings, a Request/Invite system for new members, and ensure Admins can be members of other streamings (Hybrid Profile).
**Refinement:** The Explore module will focus on **Streamings (Available Slots)**, and Invitations can be linked directly to a **Subscription**.

## User Review Required
> [!IMPORTANT]
> **Schema Changes:** We are adding a `status` field to `Participante` and a new `Convite` model with an optional `streamingId`.
> **Explore Logic:** The Explore page will list "Vagas Disponíveis" (Streamings), aggregating data from Public Streamings.

## Proposed Changes

### Database Schema (Prisma)
#### [MODIFY] [schema.prisma](file:///w:/projetos/streamsharev2/prisma/schema.prisma)

```prisma
// 1. Add Status Enum
enum StatusParticipante {
  ativo
  pendente
  recusado
  bloqueado
}

enum StatusConvite {
  pendente
  aceito
  recusado
  expirado
}

// 2. Update Participante
model Participante {
  // ... existing fields ...
  status StatusParticipante @default(ativo)
}

// 3. New Model: Convite
model Convite {
  id             String        @id @default(uuid())
  email          String
  contaId        Int
  streamingId    Int?          // [NEW] Optional: Invite specifically for a subscription
  status         StatusConvite @default(pendente)
  token          String        @unique
  expiresAt      DateTime
  convidadoPorId Int
  usuarioId      Int?          // Optional: if the user already exists in the system
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  conta        Conta     @relation(fields: [contaId], references: [id])
  streaming    Streaming? @relation(fields: [streamingId], references: [id])
  convidadoPor Usuario   @relation("Convidou", fields: [convidadoPorId], references: [id])
  usuario      Usuario?  @relation("Convidado", fields: [usuarioId], references: [id])

  @@index([email])
  @@map("convite")
}

// 4. Update Notification Types
enum TipoNotificacao {
  // ... existing
  solicitacao_participacao_criada // User -> Admin
  solicitacao_participacao_aceita // Admin -> User
  solicitacao_participacao_recusada // Admin -> User
  convite_recebido // Admin -> User
  convite_aceito // User -> Admin
}

// 5. Update Usuario to include relations
model Usuario {
  // ... existing fields ...
  convitesFeitos    Convite[] @relation("Convidou")
  convitesRecebidos Convite[] @relation("Convidado")
}
```

### Server Actions
#### `requestParticipation` (Solicitar Vaga)
```typescript
'use server'
// ... imports

export async function solicitarVaga(streamingId: number) {
  // 1. Validate User
  // 2. Get Streaming & Group
  // 3. Create Participante (Status: Pending) in the Group
  // 4. Create Notification for Admin: "User solicits entry for [Streaming]"
}
```

#### `inviteUser` (Admin Invites to Subscription)
```typescript
export async function convidarUsuario(email: string, contaId: number, streamingId?: number) {
  // ... validation ...
  // Create Invite with streamingId
  // Send Email: "You have been invited to join [Streaming] to share costs"
}
```

#### `acceptInvite`
```typescript
export async function aceitarConvite(token: string) {
  // 1. Validate Token
  // 2. Create/Link User
  // 3. Create Participante (Active)
  // 4. IF invite.streamingId exists:
  //    Create Assinatura (Active) for that Streaming
}
```

### UI Structure (Explore Page)
#### `app/explore/page.tsx` (Mockup - Focused on Streamings)

```tsx
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function ExplorePage() {
  // const vagas = await getAvailableSlots() // Returns { streaming, group, price }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Encontre sua próxima assinatura</h1>
        <p className="text-muted-foreground">Vagas disponíveis em streamings compartilhados.</p>
        
        <div className="flex gap-4">
          <Input placeholder="Buscar por Netflix, Spotify, HBO..." className="max-w-md" />
          <Button>Buscar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Slot Card Mockup */}
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              {/* Streaming Logo */}
              <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold">N</div>
              <div>
                <h3 className="font-bold text-lg">Netflix 4K</h3>
                <p className="text-xs text-muted-foreground">Streaming "Família Silva"</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-bold text-primary">R$ 15,90</p>
                  <p className="text-xs text-muted-foreground">/mês</p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  2 vagas
                </Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Solicitar Entrada</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

## Public Streaming Use Cases (Explorer)

### 1. Detailed Interface (Explorer Page)
- **Visual Grid:** Cards displaying High-Resolution logos of the streaming services.
- **Contextual Badges:**
  - **"Dono Verificado":** Trust indicator for long-term Admins.
  - **"Vaga Imediata":** For streamings where approval is automated or fast.
- **Service Tags:** Filterable chips (Movie, Music, Productivity, Education).
- **Price Highlighting:** Clear contrast for the monthly price point.

### 2. Operational Flows
**A. Discovery & Request Flow:**
1. **Browse/Search:** User filters for "Spotify Family" on the Explorer.
2. **Consult Terms:** User clicks "Ver Detalhes" to check payment dates and shared rules.
3. **Identification:** User provides/confirms their info for the Admin's review.
4. **Finalization:** Request submitted (`PENDENTE` status).

**B. Moderation Flow (Admin):**
1. **Alert:** Dashboard shows "Nova solicitação para o Streaming [Nome]".
2. **Review:** Admin sees requester profile (History of payments, join date).
3. **Approval:** One-click approval triggers onboarding and automated billing.

### 3. Formal Use Cases (UC)
- **UC-ESP-01 (Smart Filtering):** The visitor can filter streamings by brand and price range.
- **UC-ESP-02 (Participation Request):** The user can request to join a specific streaming slot, providing a commitment to the price.
- **UC-ESP-03 (Admin Decision):** The Admin has the power to accept/reject external members based on their profile data.
- **UC-ESP-04 (Public Visibility):** The Admin can mark a specific Subscription as "Public" to attract unknown subscribers via Explorer.
- **UC-ESP-05 (Seamless Onboarding):** Once accepted, the user is automatically added to the billing cycle and receives access instructions.

## Questions & Answers
**Q: O que mostrar no Explorar: Grupos ou Streamings?**
**A:** **Streamings (Vagas).** O usuário final busca pelo *serviço* (ex: "Vaga no YouTube Premium"), não pelo nome da conta/grupo.
- **Proposta:** A tela "Explorar" deve listar **Vagas Disponíveis**.
- Cada card representa: "Netflix no Streaming Família Silva".
- Destaque: Logo do Streaming, Valor da Cota, Botão "Solicitar".
- Ao solicitar, o Admin recebe: "Fulano quer entrar no seu streaming para dividir o Netflix".

**Q: Como vincular o Convite à Assinatura?**
**A:** Campo `streamingId` no `Convite`. Ao aceitar, o sistema cria o membro E a assinatura automaticamente.

**Q: Como lidar com Rollbacks, Dados e Faturas?**
**A:**
1.  **Integridade Transacional:** Usaremos `prisma.$transaction`. A criação do Participante, da Assinatura e da Primeira Cobrança ocorre em uma única operação atômica.
2.  **Faturamento Imediato:** Assim que o convite é aceito, uma cobrança `PENDENTE` é gerada imediamente para o ciclo atual (ex: 30 dias).
3.  **Inadimplência:** Se o usuário entrar e não pagar, o `billing-service` detectará o atraso e suspenderá a assinatura automaticamente.

## UI/UX Strategy & Workflows

#### 1. Discovery Flow (Explore Page)
**Goal:** Convert visitors into participants by reducing friction.
- **Card Design:**
  - **Header:** Service Logo (Brand recognition) + Streaming Name (Trust).
  - **Body:** Price (Value proposition) + "X Spots Left" (Urgency).
  - **Footer:** "Solicitar" button.
- **Filters:**
  - *By Service:* "Show only Netflix".
  - *By Price Range:* "Under R$ 20,00".
- **Action:** Clicking "Solicitar" opens a modal summarizing terms.

#### 2. Invitation Flow (Admin Side)
**Goal:** Make it easy for admins to fill slots.
- **Location:** "Participantes" tab in Streaming Dashboard.
- **Action:** "Convidar Membro" button.
- **Modal:**
  - Input: Email address.
  - Option: "Vincular a Assinatura Existente?" (Select Service).
  - *Scenario A (Generic):* Invites to streaming account only.
  - *Scenario B (Specific):* Invites to streaming account + pre-selects subscription.
- **Feedback:** Toast notification "Convite enviado para [email]".

#### 3. Acceptance Flow (User Side)
**Goal:** Seamless onboarding.
- **Entry Point:** Email Link -> Landing Page.
- **Confirmation Screen:**
  - "Você foi convidado para o streaming [Nome]."
  - [If Linked] "Isso inclui uma assinatura de [Serviço] por [Valor]."
  - Button: "Aceitar e Entrar".

## Business Rules

| Rule ID | Description | Validation |
| :--- | :--- | :--- |
| **BR-01** | **Vaga Única** | A slot (vaga) in a subscription can only be filled if `current_subscribers < limit`. Explore page must filter out full streamings. |
| **BR-02** | **No Double Dipping** | User cannot request to join a subscription they already have active in *any* streaming account. |
| **BR-03** | **Admin Hybrid** | Admin of Streaming A *can* be a Member of Streaming B. |
| **BR-04** | **Auto-Billing** | If an invite links to a subscription, the first charge is generated immediately upon acceptance. |
| **BR-05** | **Request Expiry** | Pending requests should expire after 7 days if not approved by Admin. |

## Notification Strategy

| Event | Actor | Recipient | Channel | Description |
| :--- | :--- | :--- | :--- | :--- |
| **New Request** | Public User | **Streaming Admin(s)** | System + Email | "User X wants to join [Streaming] for [Service]." |
| **Invite Sent** | Admin | **Invited Email** | Email | "You have been invited to [Streaming]. Click to accept." |
| **Invite Sent** | Admin | **Invited User** (if exists) | System | "You have a pending invite from [Streaming]." |
| **Request Approved** | Admin | **Requester** | System + Email | "Your request to join [Streaming] was approved!" |
| **Request Rejected** | Admin | **Requester** | System | "Your request to join [Streaming] was declined." |
| **Invite Accepted** | User | **Streaming Admin(s)** | System | "User X accepted your invite and joined [Streaming]." |
