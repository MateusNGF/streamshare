import { prisma } from "@/lib/db";
import { StatusAssinatura, StatusCobranca } from "@prisma/client";

/**
 * Avalia se o participante deve ter seu acesso reativado após um pagamento aprovado.
 */
export async function evaluarAtivacaoAposPagamento(assinaturaId: number) {
    try {
        const assinatura = await prisma.assinatura.findUnique({
            where: { id: assinaturaId },
            include: {
                cobrancas: {
                    where: { status: StatusCobranca.pendente },
                    orderBy: { dataVencimento: 'asc' }
                }
            }
        });

        if (!assinatura) return;

        // Se não houver cobranças pendentes (ou seja, tudo pago), reativar a assinatura
        if (assinatura.cobrancas.length === 0) {
            await prisma.assinatura.update({
                where: { id: assinaturaId },
                data: {
                    status: StatusAssinatura.ativa,
                    dataSuspensao: null,
                    motivoSuspensao: null
                }
            });
        }
    } catch (error) {
        console.error('[EVALUAR_ATIVACAO_APOS_PAGAMENTO_ERROR]', error);
    }
}
