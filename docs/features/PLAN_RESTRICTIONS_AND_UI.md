# Plan Restrictions & UI System Overview

This document explains the architecture and usage of the Plan Restrictions system, which includes feature guarding, premium overlays, and empty state handling.

## Architecture Components

### 1. Centralized Feature Guards (`src/lib/feature-guards.ts`)

The `FeatureGuards` utility is the single source of truth for feature availability and plan limits.

- **`FeatureKey`**: Union type defining all guardable features (e.g., `streaming_creation`, `whatsapp_integration`).
- **`isFeatureEnabled(plan, feature)`**: Synchronous check for feature availability. Returns `enabled`, `reason`, and `requiredPlan`.
- **`checkLimit(plan, feature, currentCount)`**: Asynchronous check for count-based limits (e.g., maximum streamings allowed).

**Usage Example (Server Action):**
```typescript
import { FeatureGuards } from "@/lib/feature-guards";
import { PlanoConta } from "@prisma/client";

// Inside a server action
const check = await FeatureGuards.checkLimit(plano, "max_streamings", totalCount);
if (!check.enabled) {
    throw new Error(check.reason);
}
```

---

### 2. Premium Feature Overlays (`src/components/ui/UpgradeFeatureOverlay.tsx`)

Instead of completely hiding features that a user doesn't have access to, we use overlays to provide clear feedback and an upgrade path.

- **Visual Style**: Glassmorphism effect with a lock icon.
- **Interactivity**: Includes a call-to-action button linking to the `/planos` page.
- **Implementation**: Should be placed in a `relative` container that wraps the restricted feature.

**Usage Example:**
```tsx
<div className="relative">
    <SectionHeader title="Automação WhatsApp" />
    <WhatsAppConfigForm />
    
    {!hasAccess && (
        <UpgradeFeatureOverlay 
            requiredPlan={PlanoConta.business} 
            featureName="Integração WhatsApp" 
        />
    )}
</div>
```

---

### 3. Graceful Empty States (`src/components/dashboard/EmptyChartState.tsx`)

When data is unavailable (especially for new accounts), we show a branded empty state instead of an empty or broken chart.

- **Components**: Icon, Title, Description, and an optional Button.
- **Contextual Actions**: Each chart provides a relevant action (e.g., `Criar Streaming` for the occupancy chart).

**Usage Example:**
```tsx
{!hasData ? (
    <EmptyChartState 
        icon={TrendingUp}
        title="Sem dados de receita"
        description="Seus dados aparecerão aqui após os primeiros pagamentos."
        actionLabel="Configurar Cobranças"
        onAction={() => router.push("/cobrancas")}
    />
) : (
    <ChartComponent data={data} />
)}
```

---

## Best Practices

1. **Verify on Server and Client**: Always perform a hard check in Server Actions even if the UI is already showing an overlay.
2. **Explain "Why"**: The `FeatureGuards` provides a `reason` field; use it to show helpful messages to the user.
3. **Interactive Placeholders**: Always provide a "Next Step" in empty states to prevent dead ends in the user's journey.
4. **Consistency**: Use the `UpgradeFeatureOverlay` for all plan-restricted features to maintain visual consistency.
