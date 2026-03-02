import { prisma } from "@/lib/db";

export class LoteNotificationService {
    /**
     * Notifica o participante que seu lote foi aprovado.
     */
    static async notifyAprovado(loteId: number, contaId: number) {
        try {
            const lote = await prisma.lotePagamento.findUnique({
                where: { id: loteId },
                include: {
                    participante: { include: { usuario: true } },
                    cobrancas: true
                }
            });

            if (!lote) return;

            const pEmail = lote.participante.usuario?.email || lote.participante.email;
            const pConta = await prisma.conta.findUnique({ where: { id: contaId }, select: { moedaPreferencia: true } });
            const moeda = (pConta?.moedaPreferencia as any) || 'BRL';

            // E-mail
            if (pEmail) {
                try {
                    const { sendLoteAprovadoEmail } = await import("@/lib/email");
                    const { formatCurrency } = await import("@/lib/formatCurrency");
                    const valorMoeda = formatCurrency(lote.valorTotal.toNumber(), moeda);

                    await sendLoteAprovadoEmail({
                        to: pEmail,
                        participanteNome: lote.participante.nome,
                        loteId: lote.id,
                        quantidadeItens: lote.cobrancas.length,
                        valorTotal: valorMoeda
                    });
                } catch (err) {
                    console.error("[EMAIL_LOTE_APROVADO_ERROR]", err);
                }
            }

            // WhatsApp
            if (lote.participante.whatsappNumero) {
                try {
                    const { sendWhatsAppNotification, whatsappConfigIsValid, whatsappTemplates } = await import("@/lib/whatsapp-service");
                    const configId = await whatsappConfigIsValid(contaId);

                    if (configId) {
                        const { formatCurrency } = await import("@/lib/formatCurrency");
                        const valorMoeda = formatCurrency(lote.valorTotal.toNumber(), moeda);
                        const templateMsg = whatsappTemplates.loteAprovado(lote.participante.nome, lote.cobrancas.length.toString(), valorMoeda);

                        await sendWhatsAppNotification(contaId, "pagamento_confirmado" as any, lote.participanteId, templateMsg);
                    }
                } catch (err) {
                    console.error("[WHATSAPP_LOTE_ERROR]", err);
                }
            }
        } catch (error) {
            console.error("[LOTE_NOTIFICATION_APROVADO_CRITICAL_FAILURE]", error);
        }
    }

    /**
     * Notifica o participante que seu comprovante de lote foi rejeitado.
     */
    static async notifyRejeitado(loteId: number, contaId: number, motivo?: string) {
        try {
            const lote = await prisma.lotePagamento.findUnique({
                where: { id: loteId },
                include: { participante: { include: { usuario: true } } }
            });

            if (!lote) return;

            const pEmail = lote.participante.usuario?.email || lote.participante.email;
            const motivoFinal = motivo || "Comprovante inválido ou ilegível.";

            // E-mail
            if (pEmail) {
                try {
                    const { sendLoteRejeitadoEmail } = await import("@/lib/email");
                    await sendLoteRejeitadoEmail({
                        to: pEmail,
                        participanteNome: lote.participante.nome,
                        loteId: lote.id,
                        motivo: motivoFinal
                    });
                } catch (err) {
                    console.error("[EMAIL_LOTE_REJEITADO_ERROR]", err);
                }
            }

            // WhatsApp
            if (lote.participante.whatsappNumero) {
                try {
                    const { sendWhatsAppNotification, whatsappConfigIsValid } = await import("@/lib/whatsapp-service");
                    const configId = await whatsappConfigIsValid(contaId);
                    if (configId) {
                        const msg = `⚠️ Olá ${lote.participante.nome}, seu lote #${lote.id} foi rejeitado.\n\nMotivo: ${motivoFinal}\n\nPor favor, envie um novo comprovante pelo painel.`;
                        await sendWhatsAppNotification(contaId, "cobranca_atrasada" as any, lote.participanteId, {
                            texto: msg,
                            template: { name: "cobranca_atrasada", language: "pt_BR", components: [] } as any
                        });
                    }
                } catch (err) {
                    console.error("[WHATSAPP_LOTE_REJEITADO_ERROR]", err);
                }
            }
        } catch (error) {
            console.error("[LOTE_NOTIFICATION_REJEITADO_CRITICAL_FAILURE]", error);
        }
    }

    /**
     * Notifica o participante sobre o cancelamento do lote.
     */
    static async notifyCancelado(loteId: number, contaId: number, motivo: string, servicos: string, targetUserId?: number) {
        // Atualmente apenas notificação interna (push/in-app) é disparada no service principal para cancelamento administrativo.
        // Se houver necessidade de Email/WhatsApp para cancelamento futuro, o código viria aqui.
        // Por enquanto, esta função pode servir como ponto de extensão.
    }
}
