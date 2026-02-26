/**
 * Omnichannel Verification Service (OTP Engine)
 * Generates and validates 6-digit PINs for EMAIL and WHATSAPP channels.
 * OTP codes are NEVER returned to the caller — only stored in DB and dispatched.
 */

import { prisma as prismaClient } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { sendWhatsAppDirect } from "@/lib/whatsapp-meta";

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_COOLDOWN_SECONDS = 60;

type Canal = "EMAIL" | "WHATSAPP";

// Define a type for the Prisma client or transaction client
type PrismaTransactionalClient = Parameters<Parameters<typeof prismaClient.$transaction>[0]>[0];

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

function generatePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function checkCooldown(
    destino: string,
    canal: Canal,
    db: PrismaTransactionalClient = prismaClient
): Promise<boolean> {
    const recent = await db.verificacaoCodigo.findFirst({
        where: {
            destino,
            canal,
            createdAt: { gte: new Date(Date.now() - OTP_COOLDOWN_SECONDS * 1000) },
        },
        orderBy: { createdAt: "desc" },
    });
    return !!recent;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type SendOtpResult =
    | { success: true }
    | { success: false; error: string; cooldown?: true };

/**
 * Generate a new OTP and dispatch it via the selected channel.
 * Returns { success: true } on success — the PIN is never returned.
 */
export async function sendOTP(
    destino: string,
    canal: Canal,
    db: PrismaTransactionalClient = prismaClient
): Promise<SendOtpResult> {
    // 1. Cooldown guard — prevent spam
    const inCooldown = await checkCooldown(destino, canal, db);
    if (inCooldown) {
        return {
            success: false,
            error: `Aguarde ${OTP_COOLDOWN_SECONDS} segundos antes de solicitar outro código.`,
            cooldown: true,
        };
    }

    // 2. Prepare data
    const codigo = generatePin();
    const expiracao = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // 3. Invalidate previous codes (clean state)
    await db.verificacaoCodigo.updateMany({
        where: { destino, canal, verificado: false },
        data: { verificado: true }, // Logic: only 1 active code at a time
    });

    // 4. Persist the new OTP
    const record = await db.verificacaoCodigo.create({
        data: { destino, canal, codigo, expiracao },
    });

    // 5. Dispatch the code
    const dispatchResult = await dispatchOTP(canal, destino, codigo);

    if (!dispatchResult.success) {
        // ACID rollback: delete the OTP record so user isn't blocked by cooldown
        await db.verificacaoCodigo.delete({ where: { id: record.id } }).catch(() => { });
        return dispatchResult;
    }

    console.log(`[VerificationService] OTP enviado por ${canal} para ${destino}`);
    return { success: true };
}

/**
 * Dispatcher Strategy (SRP: Decoupled delivery from generation)
 */
async function dispatchOTP(canal: Canal, destino: string, codigo: string): Promise<SendOtpResult> {
    if (canal === "EMAIL") {
        const emailResult = await sendEmail({
            to: destino,
            subject: "Seu código de verificação — StreamShare",
            html: buildEmailHtml(codigo),
            text: `Seu código de verificação é: ${codigo}. Válido por ${OTP_EXPIRY_MINUTES} minutos.`,
        });

        if (!emailResult.success) {
            console.error(`[VerificationService] Falha Email para ${destino}:`, emailResult.error);
            return {
                success: false,
                error: "Falha ao enviar e-mail. Verifique o endereço ou tente novamente."
            };
        }
    } else {
        try {
            const msg = buildWhatsAppMessage(codigo);
            await sendWhatsAppDirect(destino, msg);
        } catch (err: any) {
            console.error(`[VerificationService] Falha WhatsApp para ${destino}:`, err.message);
            return {
                success: false,
                error: "Falha ao enviar WhatsApp. Tente novamente."
            };
        }
    }

    return { success: true };
}

export type ValidateOtpResult =
    | { success: true }
    | { success: false; error: string; locked?: true };

/**
 * Validate an OTP for a given destination/channel.
 * On success, marks the record as verified.
 */
export async function validateOTP(
    destino: string,
    canal: Canal,
    codigoInformado: string,
    db: PrismaTransactionalClient = prismaClient
): Promise<ValidateOtpResult> {
    const record = await db.verificacaoCodigo.findFirst({
        where: {
            destino,
            canal,
            verificado: false,
            expiracao: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
    });

    if (!record) {
        return { success: false, error: "Código inválido ou expirado." };
    }

    if (record.tentativas >= OTP_MAX_ATTEMPTS) {
        return {
            success: false,
            error: "Muitas tentativas. Solicite um novo código.",
            locked: true,
        };
    }

    if (record.codigo !== codigoInformado) {
        await db.verificacaoCodigo.update({
            where: { id: record.id },
            data: { tentativas: { increment: 1 } },
        });
        const remaining = OTP_MAX_ATTEMPTS - (record.tentativas + 1);
        return {
            success: false,
            error: `Código incorreto. ${remaining > 0 ? `${remaining} tentativa(s) restante(s).` : "Última tentativa."}`,
        };
    }

    // Valid — mark as verified
    await db.verificacaoCodigo.update({
        where: { id: record.id },
        data: { verificado: true },
    });

    return { success: true };
}

// ---------------------------------------------------------------------------
// Message Templates
// ---------------------------------------------------------------------------

function buildEmailHtml(codigo: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="background:#f4f4f5;font-family:sans-serif;padding:40px 0;margin:0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;">
        <tr>
          <td style="background:#ffffff;border-radius:24px;padding:48px 32px;text-align:center;box-shadow:0 12px 40px rgba(124,58,237,0.08);border:1px solid #e5e7eb;">
            <div style="margin-bottom:24px;">
              <span style="background:#f5f3ff;color:#7c3aed;padding:8px 16px;border-radius:12px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">🔒 Verificação de Segurança</span>
            </div>
            <h1 style="color:#111827;font-size:24px;font-weight:800;margin:0 0 12px;letter-spacing:-0.5px;">Seu código chegou!</h1>
            <p style="color:#6b7280;font-size:15px;line-height:1.5;margin:0 0 32px;">Use o código de 6 dígitos abaixo para concluir seu acesso no <strong>StreamShare</strong>.</p>
            
            <div style="background:#fafafa;border:2px solid #f3f4f6;border-radius:20px;padding:24px;margin-bottom:32px;">
              <div style="font-family:'Courier New', Courier, monospace;font-size:42px;font-weight:900;letter-spacing:10px;color:#7c3aed;user-select:all;-webkit-user-select:all;-moz-user-select:all;-ms-user-select:all;">
                ${codigo}
              </div>
              <p style="color:#9ca3af;font-size:11px;margin:12px 0 0;font-weight:600;text-transform:uppercase;">Dica: Clique duas vezes para selecionar e copiar</p>
            </div>

            <p style="color:#6b7280;font-size:13px;margin:0 0 24px;">Este código expira em <strong>${OTP_EXPIRY_MINUTES} minutos</strong> por segurança.</p>
            
            <div style="border-top:1px solid #f3f4f6;padding-top:24px;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">Se você não solicitou este código, pode ignorar este e-mail com segurança.</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;text-align:center;">
            <p style="color:#9ca3af;font-size:11px;margin:0;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">StreamShare &copy; 2026 • Advanced Security</p>
          </td>
        </tr>
      </table>
    </body>
    </html>`;
}

function buildWhatsAppMessage(codigo: string): string {
    return `🔐 *StreamShare — Código de Verificação*\n\nSeu código é: *${codigo}*\n\nVálido por ${OTP_EXPIRY_MINUTES} minutos. Não compartilhe com ninguém.`;
}
