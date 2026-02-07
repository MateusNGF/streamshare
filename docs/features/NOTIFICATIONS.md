# Notification System

> **Status**: ✅ Fully Implemented  
> **Last Updated**: 2026-02-07  
> **Version**: 1.0

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Best Practices](#best-practices)
- [Notification Types](#notification-types)
- [User Flows](#user-flows)
- [Use Cases](#use-cases)
- [API Reference](#api-reference)
- [Frontend Integration](#frontend-integration)
- [Performance Considerations](#performance-considerations)
- [Security](#security)

---

## Overview

The notification system provides real-time activity tracking across all CRUD operations in the StreamShare application. It follows a **push-based** architecture where actions automatically create notifications that appear in the user's notification center.

### Key Features

- **Comprehensive Coverage**: 17 notification types across 6 action domains
- **Real-time Badge**: Unread counter in navigation bar
- **Flexible Metadata**: JSON field for extensible data storage
- **Performance Optimized**: Database indexes and automatic cleanup
- **User Control**: Mark as read, mark all, and filtering capabilities

### Design Philosophy

1. **Non-intrusive**: Notifications inform without interrupting workflow
2. **Contextual**: Rich descriptions with relevant details
3. **Actionable**: Users can quickly understand what happened and why
4. **Scalable**: Designed to handle high-volume environments

---

## Architecture

### Database Schema

```prisma
enum TipoNotificacao {
  // Participantes
  participante_criado
  participante_editado
  participante_excluido
  
  // Streamings
  streaming_criado
  streaming_editado
  streaming_excluido
  
  // Assinaturas
  assinatura_criada
  assinatura_editada
  assinatura_suspensa
  assinatura_cancelada
  assinatura_renovada
  
  // Cobranças
  cobranca_gerada
  cobranca_confirmada
  cobranca_cancelada
  
  // Grupos
  grupo_criado
  grupo_editado
  grupo_excluido
  
  // Configurações
  configuracao_alterada
  
  // Sistema
  plano_alterado
}

model Notificacao {
  id          Int              @id @default(autoincrement())
  contaId     Int
  tipo        TipoNotificacao
  titulo      String
  descricao   String?
  entidadeId  Int?             // ID of related entity
  usuarioId   Int?             // Who performed the action
  metadata    Json?            // Flexible structured data
  lida        Boolean          @default(false)
  createdAt   DateTime         @default(now())
  
  conta   Conta    @relation(fields: [contaId], references: [id])
  usuario Usuario? @relation(fields: [usuarioId], references: [id])
  
  @@index([contaId, createdAt])
  @@index([contaId, lida])
  @@map("notificacao")
}
```

### Data Flow

```
┌─────────────┐
│ User Action │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Server Action  │ (e.g., createParticipante)
└──────┬──────────┘
       │
       ├──► Execute business logic
       │
       ├──► Create notification
       │    └──► criarNotificacao({
       │           tipo: "participante_criado",
       │           titulo: "...",
       │           descricao: "...",
       │           entidadeId: participante.id
       │         })
       │
       └──► Revalidate paths
            └──► Client UI updates
                 └──► Badge counter refreshes
```

---

## Best Practices

### 1. Notification Creation

#### ✅ DO

- **Create notifications AFTER successful operations**
- **Include descriptive titles and context**
- **Use metadata for extensible data**
- **Link to related entities via `entidadeId`**

```typescript
// ✅ Good: Clear, contextual, with metadata
await criarNotificacao({
  tipo: "grupo_criado",
  titulo: `Grupo criado`,
  descricao: `O grupo "${grupo.nome}" foi criado com ${streamingIds.length} streaming(s).`,
  entidadeId: grupo.id,
  metadata: {
    linkConvite: grupo.linkConvite,
    totalStreamings: streamingIds.length
  }
});
```

#### ❌ DON'T

- **Don't create notifications before validation**
- **Avoid vague descriptions**
- **Don't hardcode future data in descriptions**
- **Don't create duplicate notifications**

```typescript
// ❌ Bad: Vague, no context
await criarNotificacao({
  tipo: "grupo_criado",
  titulo: `Grupo criado`
});
```

### 2. Metadata Usage

Metadata should store **supplementary information** that might be useful for:
- Future features (e.g., deep linking)
- Analytics and reporting
- Custom filtering or grouping

```typescript
// Examples of good metadata usage
{
  // Invite links for grupos
  linkConvite: "abc123-def456"
  
  // Aggregation data for bulk operations
  totalAssinaturas: 15,
  totalParticipantes: 5
  
  // Contact information
  whatsapp: "+5511999999999",
  email: "user@example.com"
  
  // State tracking
  previousStatus: "ativa",
  newStatus: "suspensa"
}
```

### 3. User Experience

#### Notification Timing

- **Immediate**: Critical actions (payment confirmed, subscription canceled)
- **Batched**: Bulk operations (show 1 notification for multiple items)
- **Delayed**: Background processes (use cron jobs)

#### Notification Retention

- **Auto-cleanup**: Notifications older than 30 days are automatically removed
- **User control**: Users can mark individual or all notifications as read
- **No delete**: Users cannot delete notifications (audit trail)

---

## Notification Types

### Participant Management

| Type | Trigger | Description Example |
|------|---------|-------------------|
| `participante_criado` | User creates participant | "João Silva foi adicionado ao sistema." |
| `participante_editado` | User updates participant | "As informações de João Silva foram atualizadas." |
| `participante_excluido` | User deletes participant | "João Silva foi removido do sistema." |

**Metadata**: `whatsapp`, `email`

### Streaming Management

| Type | Trigger | Description Example |
|------|---------|-------------------|
| `streaming_criado` | User creates streaming | "Netflix (Família) foi adicionado ao sistema." |
| `streaming_editado` | User updates streaming | "As informações de Netflix (Família) foram atualizadas." |
| `streaming_excluido` | User deletes streaming | "Netflix (Família) foi removido do sistema." |

**Metadata**: `valorIntegral`, `limiteParticipantes`

### Subscription Management

| Type | Trigger | Description Example |
|------|---------|-------------------|
| `assinatura_criada` | User creates subscription | "Assinatura de Netflix para João Silva foi criada." |
| `assinatura_criada` | Bulk subscription creation | "15 assinatura(s) criada(s) para 5 participante(s)." |
| `assinatura_cancelada` | User cancels subscription | "Assinatura de Netflix para João Silva foi cancelada." |

**Metadata**: `totalAssinaturas`, `totalParticipantes` (bulk only)

### Billing Management

| Type | Trigger | Description Example |
|------|---------|-------------------|
| `cobranca_confirmada` | User confirms payment | "Pagamento de João Silva no valor de R$ 45,00 foi confirmado." |
| `cobranca_cancelada` | User cancels charge | "Cobrança de João Silva foi cancelada." |

**Metadata**: `valor`, `dataPagamento`

### Group Management

| Type | Trigger | Description Example |
|------|---------|-------------------|
| `grupo_criado` | User creates group | "O grupo \"Família Silva\" foi criado com 3 streaming(s)." |
| `grupo_editado` | User updates group | "O grupo \"Família Silva\" foi atualizado." |
| `grupo_excluido` | User deletes group | "O grupo \"Família Silva\" foi removido." |

**Metadata**: `linkConvite`, `totalStreamings`

### Settings Management

| Type | Trigger | Description Example |
|------|---------|-------------------|
| `configuracao_alterada` | User updates profile | "As informações do seu perfil foram atualizadas." |
| `configuracao_alterada` | User updates account | "As informações da conta foram atualizadas." |
| `configuracao_alterada` | User changes currency | "A moeda preferencial foi alterada para USD." |

**Metadata**: `field`, `oldValue`, `newValue`

---

## User Flows

### Flow 1: Creating a Participant

```
User Action
    ↓
Create Participant Form
    ↓
Submit → createParticipante()
    ↓
Validation & DB Insert
    ↓
✅ Success
    ↓
criarNotificacao({
  tipo: "participante_criado",
  titulo: "Participante adicionado",
  descricao: "João Silva foi adicionado ao sistema."
})
    ↓
Badge Counter: 0 → 1
    ↓
User Clicks Bell Icon
    ↓
Modal Shows: "João Silva foi adicionado ao sistema."
    ↓
User Clicks "Marcar como lida"
    ↓
Badge Counter: 1 → 0
```

### Flow 2: Bulk Operations

```
User Action: Create Multiple Subscriptions
    ↓
Bulk Form (5 participants × 3 streamings)
    ↓
Submit → createBulkAssinaturas()
    ↓
Transaction: Create 15 subscriptions
    ↓
✅ All Created
    ↓
criarNotificacao({
  tipo: "assinatura_criada",
  titulo: "Assinaturas criadas em lote",
  descricao: "15 assinatura(s) criada(s) para 5 participante(s).",
  metadata: {
    totalAssinaturas: 15,
    totalParticipantes: 5
  }
})
    ↓
Single notification instead of 15 individual ones
```

### Flow 3: Auto-refresh

```
Page Load
    ↓
getNotificacoes() → { naoLidas: 3 }
    ↓
Badge Shows: "3"
    ↓
⏱️ 30 seconds later (auto-refresh)
    ↓
getNotificacoes() → { naoLidas: 5 }
    ↓
Badge Updates: "3" → "5"
    ↓
(No page reload needed)
```

---

## Use Cases

### Use Case 1: Team Collaboration

**Scenario**: Multiple users managing a shared account

**Problem**: User A creates a participant, User B doesn't know about it

**Solution**: 
- User A creates participant "João Silva"
- Notification appears for all users in the account
- User B sees notification immediately (or within 30s)
- User B clicks to view details

**Benefits**:
- Real-time awareness
- Reduced duplicate work
- Better coordination

### Use Case 2: Audit Trail

**Scenario**: Need to track who changed what and when

**Problem**: No history of modifications

**Solution**:
- Every action creates a notification
- Notification includes `usuarioId` (who) and `createdAt` (when)
- Description includes what was changed

**Benefits**:
- Complete activity log
- Accountability
- Compliance and auditing

### Use Case 3: Error Recovery

**Scenario**: User accidentally deletes a streaming

**Problem**: User doesn't remember which streaming was deleted

**Solution**:
- Notification shows: "Netflix (Família) foi removido do sistema."
- User can see exact name and details
- User can recreate with correct information

**Benefits**:
- Quick error identification
- Easier recovery
- Transparency

### Use Case 4: Activity Monitoring

**Scenario**: Admin wants to monitor system usage

**Problem**: No visibility into daily operations

**Solution**:
- All notifications visible in modal
- Can see patterns (e.g., many subscriptions created on Mondays)
- Metadata provides additional insights

**Benefits**:
- Usage analytics
- Pattern recognition
- Business intelligence

---

## API Reference

### `getNotificacoes(params?)`

Fetch notifications for current account.

**Parameters**:
```typescript
{
  limite?: number;        // Default: 20, Max: 100
  offset?: number;        // Default: 0
  apenasNaoLidas?: boolean; // Default: false
}
```

**Returns**:
```typescript
{
  notificacoes: Notificacao[];
  total: number;
  naoLidas: number;
}
```

**Example**:
```typescript
const { notificacoes, naoLidas } = await getNotificacoes({ 
  limite: 50, 
  apenasNaoLidas: true 
});
```

### `criarNotificacao(data)`

Create a new notification.

**Parameters**:
```typescript
{
  tipo: TipoNotificacao;
  titulo: string;
  descricao?: string;
  entidadeId?: number;
  metadata?: Record<string, any>;
}
```

**Returns**: Created notification object

**Example**:
```typescript
await criarNotificacao({
  tipo: "participante_criado",
  titulo: "Participante adicionado",
  descricao: `${participante.nome} foi adicionado ao sistema.`,
  entidadeId: participante.id,
  metadata: { whatsapp: participante.whatsappNumero }
});
```

### `marcarComoLida(id)`

Mark a single notification as read.

**Parameters**: `id: number`

**Example**:
```typescript
await marcarComoLida(123);
```

### `marcarTodasComoLidas()`

Mark all unread notifications as read.

**Example**:
```typescript
await marcarTodasComoLidas();
```

### `limparNotificacoesAntigas()`

Delete notifications older than 30 days.

**Usage**: Call from cron job or admin panel

**Example**:
```typescript
// In cron job
await limparNotificacoesAntigas();
```

---

## Frontend Integration

### Sidebar Badge

```tsx
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  const loadUnreadCount = async () => {
    const { naoLidas } = await getNotificacoes({ limite: 1 });
    setUnreadCount(naoLidas);
  };

  loadUnreadCount();
  
  // Refresh every 30 seconds
  const interval = setInterval(loadUnreadCount, 30000);
  return () => clearInterval(interval);
}, []);

// In JSX
{unreadCount > 0 && (
  <span className="badge">
    {unreadCount > 99 ? '99+' : unreadCount}
  </span>
)}
```

### Notification Modal

```tsx
const [notificacoes, setNotificacoes] = useState([]);

const loadNotificacoes = async () => {
  const data = await getNotificacoes({ limite: 50 });
  setNotificacoes(data.notificacoes);
};

useEffect(() => {
  if (isOpen) {
    loadNotificacoes();
  }
}, [isOpen]);
```

### Mark as Read

```tsx
const handleMarkAsRead = async (id: number) => {
  await marcarComoLida(id);
  
  // Update local state
  setNotificacoes(prev =>
    prev.map(n => n.id === id ? { ...n, lida: true } : n)
  );
  
  // Update badge
  setUnreadCount(prev => Math.max(0, prev - 1));
};
```

---

## Performance Considerations

### Database Optimization

1. **Indexes**: Two composite indexes for fast queries
   - `[contaId, createdAt]` - For chronological listing
   - `[contaId, lida]` - For filtering unread

2. **Pagination**: Always use `limite` and `offset`
   ```typescript
   // ✅ Good
   getNotificacoes({ limite: 20, offset: 0 })
   
   // ❌ Bad (loads everything)
   getNotificacoes()
   ```

3. **Auto-cleanup**: Prevents table bloat
   ```typescript
   // Run daily via cron
   await limparNotificacoesAntigas();
   ```

### Frontend Optimization

1. **Polling Interval**: 30 seconds (balance between freshness and server load)
2. **Lazy Loading**: Load notifications only when modal opens
3. **Local State**: Cache and update locally to avoid re-fetches

### Scalability

| Metric | Current | Recommended Max |
|--------|---------|----------------|
| Notifications per account | ~1000/month | 10,000/month |
| Concurrent users | 1-10 | 100 |
| Badge refresh rate | Every 30s | Every 15s min |
| Notification retention | 30 days | 90 days max |

---

## Security

### Access Control

- **Scope**: Notifications are scoped to `contaId`
- **Isolation**: Users can only see notifications from their account
- **Authentication**: All actions require valid session

```typescript
// ✅ Automatic scoping in backend
const { contaId } = await getContext();
const notificacoes = await prisma.notificacao.findMany({
  where: { contaId } // User can't access other accounts
});
```

### Data Privacy

- **Sensitive Data**: Don't store passwords or tokens in metadata
- **PII**: WhatsApp and email in metadata should follow GDPR
- **Audit Trail**: Keep `usuarioId` for accountability

### SQL Injection

- **Prisma ORM**: Automatically protects against SQL injection
- **Type Safety**: TypeScript ensures type integrity

---

## Future Enhancements

### Phase 2 (Planned)

- [ ] **Push Notifications**: Browser push API integration
- [ ] **Email Digests**: Daily/weekly summaries
- [ ] **Notification Preferences**: User-level filtering
- [ ] **Deep Linking**: Click notification → relevant page
- [ ] **Rich Formatting**: Markdown support in descriptions

### Phase 3 (Nice-to-Have)

- [ ] **Notification Center**: Dedicated page with advanced filtering
- [ ] **Analytics Dashboard**: Notification metrics and insights
- [ ] **Custom Notification Types**: Allow plugins to register new types
- [ ] **Realtime**: WebSocket integration for instant updates
- [ ] **Mobile App**: React Native integration

---

## Troubleshooting

### Badge shows incorrect count

**Cause**: Cache outdated

**Solution**: 
```typescript
// Force refresh
handleCloseNotifications(); // Includes refresh logic
```

### Notifications not appearing

**Cause**: Missing `criarNotificacao` call in action

**Solution**: Check that action file imports and calls `criarNotificacao`
```typescript
import { criarNotificacao } from "@/actions/notificacoes";

// After successful operation
await criarNotificacao({...});
```

### Performance degradation

**Cause**: Too many notifications in database

**Solution**: Run cleanup job
```typescript
await limparNotificacoesAntigas();
```

---

## Maintenance

### Regular Tasks

- **Weekly**: Monitor notification count per account
- **Monthly**: Review and optimize slow queries
- **Quarterly**: Audit notification types and usefulness

### Monitoring

```sql
-- Check notification volume
SELECT COUNT(*) FROM notificacao WHERE "createdAt" > NOW() - INTERVAL '7 days';

-- Identify high-volume notification types
SELECT tipo, COUNT(*) as total 
FROM notificacao 
GROUP BY tipo 
ORDER BY total DESC;

-- Check unread ratio
SELECT 
  COUNT(*) FILTER (WHERE lida = false) as unread,
  COUNT(*) as total,
  ROUND(COUNT(*) FILTER (WHERE lida = false) * 100.0 / COUNT(*), 2) as unread_percentage
FROM notificacao;
```

---

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [Notification Design Patterns](https://www.nngroup.com/articles/notification-design/)
- [Real-time Notifications Best Practices](https://docs.pusher.com/channels/best_practices/)
