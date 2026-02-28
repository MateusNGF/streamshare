/**
 * WhatsApp Business Cloud API — Meta Official (v21.0)
 *
 * Architecture:
 *   - Free/Pro plans  → generates wa.me link for manual sending
 *   - Business plan   → triggers Meta Cloud API directly (automated)
 *
 * Env vars required (Business plan):
 *   WHATSAPP_ENABLED="true"
 *   WHATSAPP_ACCESS_TOKEN="EAAB..."
 *   WHATSAPP_PHONE_NUMBER_ID="123456789"
 *   WHATSAPP_API_VERSION="v21.0"         (optional, defaults to v21.0)
 */

const META_GRAPH_BASE = "https://graph.facebook.com";

export interface WhatsAppSendResult {
    success: boolean;
    messageId?: string;
    error?: string;
    /** For Free/Pro plans: the manual wa.me link the admin should send */
    manualLink?: string;
}

export interface WhatsAppTemplateParameter {
    type: "text";
    text: string;
}

export interface WhatsAppTemplateConfig {
    name: string;
    language: string;
    components: {
        type: "body" | "header" | "button";
        parameters: WhatsAppTemplateParameter[];
    }[];
}

// ---------------------------------------------------------------------------
// E.164 Normalisation
// ---------------------------------------------------------------------------

/**
 * Normalise a Brazilian phone number to E.164 format.
 * Examples:
 *   "11 99999-8888"   → "+5511999998888"
 *   "5511999998888"   → "+5511999998888"
 *   "+5511999998888"  → "+5511999998888"
 */
export function toE164(phone: string, defaultDDI = "55"): string {
    const digits = phone.replace(/\D/g, "");
    if (phone.startsWith("+")) return `+${digits}`;
    if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
    return `+${defaultDDI}${digits}`;
}

// ---------------------------------------------------------------------------
// wa.me link builder (manual — Free/Pro plans)
// ---------------------------------------------------------------------------

export function buildWaMeLink(phone: string, text: string): string {
    const e164 = toE164(phone).replace("+", "");
    const encoded = encodeURIComponent(text);
    return `https://wa.me/${e164}?text=${encoded}`;
}

// ---------------------------------------------------------------------------
// Meta Cloud API — send template message
// ---------------------------------------------------------------------------

async function sendMetaTemplateMessage(
    to: string,
    template: WhatsAppTemplateConfig
): Promise<WhatsAppSendResult> {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const apiVersion = process.env.WHATSAPP_API_VERSION ?? "v21.0";

    if (!accessToken || !phoneNumberId) {
        return {
            success: false,
            error: "WHATSAPP_ACCESS_TOKEN ou WHATSAPP_PHONE_NUMBER_ID não configurados.",
        };
    }

    const url = `${META_GRAPH_BASE}/${apiVersion}/${phoneNumberId}/messages`;

    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toE164(to),
        type: "template",
        template: {
            name: template.name,
            language: { code: template.language },
            components: template.components,
        },
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        const errMsg =
            data?.error?.message ?? `HTTP ${response.status}: ${response.statusText}`;
        console.error("[WhatsApp Meta API] Template Error:", JSON.stringify(data, null, 2));

        // Handling 429 Too Many Requests Rate Limiting would ideally happen at a Queue level,
        // but passing the exact Meta graph error message upstream for the service to handle if necessary.
        return { success: false, error: errMsg };
    }

    const messageId = data?.messages?.[0]?.id;
    return { success: true, messageId };
}


// ---------------------------------------------------------------------------
// Meta Cloud API — send text message
// ---------------------------------------------------------------------------

async function sendMetaTextMessage(
    to: string,
    body: string
): Promise<WhatsAppSendResult> {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const apiVersion = process.env.WHATSAPP_API_VERSION ?? "v21.0";

    if (!accessToken || !phoneNumberId) {
        return {
            success: false,
            error: "WHATSAPP_ACCESS_TOKEN ou WHATSAPP_PHONE_NUMBER_ID não configurados.",
        };
    }

    const url = `${META_GRAPH_BASE}/${apiVersion}/${phoneNumberId}/messages`;

    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toE164(to),
        type: "text",
        text: { preview_url: false, body },
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        const errMsg =
            data?.error?.message ?? `HTTP ${response.status}: ${response.statusText}`;
        console.error("[WhatsApp Meta API] Error:", JSON.stringify(data, null, 2));
        return { success: false, error: errMsg };
    }

    const messageId = data?.messages?.[0]?.id;
    return { success: true, messageId };
}

// ---------------------------------------------------------------------------
// Public façade — respects plan restrictions
// ---------------------------------------------------------------------------

/**
 * Send a WhatsApp message.
 *
 * @param to      - Phone number in any format (will be normalised to E.164)
 * @param body    - Message text (max 4096 chars)
 * @param automated - true for Business plan automated dispatch, false for link-only
 * @param templateConfig - Options required to send an approved Template via API
 *
 * When `automated` is false, returns { success: true, manualLink: "..." }
 */
export async function sendWhatsApp(
    to: string,
    body: string,
    automated: boolean,
    templateConfig?: WhatsAppTemplateConfig
): Promise<WhatsAppSendResult> {
    if (!automated) {
        // Free / Pro — return a pre-filled wa.me link for the admin to send manually
        const link = buildWaMeLink(to, body);
        return { success: true, manualLink: link };
    }

    const enabled = process.env.WHATSAPP_ENABLED === "true";
    if (!enabled) {
        console.warn("[WhatsApp] WHATSAPP_ENABLED is false — skipping automated send.");
        return { success: false, error: "WhatsApp automated sending is disabled." };
    }

    if (templateConfig) {
        return sendMetaTemplateMessage(to, templateConfig);
    }

    // Fallback or explicit text messages (like Replies within 24h Customer Service Window)
    return sendMetaTextMessage(to, body);
}

/**
 * Direct send — bypasses plan checks.
 * Used for OTP verification dispatches (always needs to be sent).
 */
export async function sendWhatsAppDirect(
    to: string,
    body: string,
    templateConfig?: WhatsAppTemplateConfig
): Promise<WhatsAppSendResult> {
    const enabled = process.env.WHATSAPP_ENABLED === "true";
    if (!enabled) {
        console.log(`[WhatsApp OTP - MOCK] To: ${to} | Body: ${body}`);
        return { success: true, messageId: "mock-otp-disabled" };
    }

    if (templateConfig) {
        return sendMetaTemplateMessage(to, templateConfig);
    }
    return sendMetaTextMessage(to, body);
}
