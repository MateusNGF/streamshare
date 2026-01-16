"use server";

import { prisma } from "@streamshare/database";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { StatusCobranca } from "@streamshare/database";
import {
    calcularProximoVencimento,
    calcularValorPeriodo,
    estaAtrasado
} from "@/lib/financeiro-utils";
import type { EnviarNotificacaoResult } from "@/types/whatsapp";

async function getContext() {
    const session = await getCurrentUser();
    if (!session) throw new Error("Não autenticado");

    const userAccount = await prisma.contaUsuario.findFirst({
        where: { usuarioId: session.userId, isAtivo: true },
        select: { contaId: true },
    });

    if (!userAccount) throw new Error("Conta não encontrada");
    return { userId: session.userId, contaId: userAccount.contaId };
}

/**
 * Get all charges for the current account with optional filters
 */
export async function getCobrancas(filters?: {
    status?: StatusCobranca;
    participanteId?: number;
    mes?: number;
    ano?: number;
}) {
    const { contaId } = await getContext();

    const where: any = {
        assinatura: {
            participante: { contaId }
        }
    };

    if (filters?.status) {
        where.status = filters.status;
    }

    if (filters?.participanteId) {
        where.assinatura = {
            ...where.assinatura,
            participanteId: filters.participanteId
        };
    }

    if (filters?.mes && filters?.ano) {
        const startDate = new Date(filters.ano, filters.mes - 1, 1);
        const endDate = new Date(filters.ano, filters.mes, 0, 23, 59, 59);
        where.periodoFim = { gte: startDate, lte: endDate };
    }

    const cobrancas = await prisma.cobranca.findMany({
        where,
        include: {
            assinatura: {
                include: {
                    participante: true,
                    streaming: {
                        include: { catalogo: true }
                    }
                }
            }
        },
        orderBy: { periodoFim: "desc" }
    });

    return cobrancas;
}

/**
 * Create initial charge when subscription is created
 */
export async function criarCobrancaInicial(assinaturaId: number) {
    await getContext(); // Validate auth

    const assinatura = await prisma.assinatura.findUnique({
        where: { id: assinaturaId }
    });

    if (!assinatura) {
        throw new Error("Assinatura não encontrada");
    }

    const periodoInicio = assinatura.dataInicio;
    const periodoFim = calcularProximoVencimento(periodoInicio, assinatura.frequencia);
    const valor = calcularValorPeriodo(assinatura.valor, assinatura.frequencia);

    const cobranca = await prisma.cobranca.create({
        data: {
            assinaturaId,
            valor,
            periodoInicio,
            periodoFim,
            status: StatusCobranca.pendente
        }
    });

    revalidatePath("/cobrancas");
    return cobranca;
}

/**
 * Confirm payment for a charge
 */
export async function confirmarPagamento(
    cobrancaId: number,
    comprovanteUrl?: string
) {
    const { contaId } = await getContext();

    // Verify ownership
    const cobranca = await prisma.cobranca.findFirst({
        where: {
            id: cobrancaId,
            assinatura: {
                participante: { contaId }
            }
        }
    });

    if (!cobranca) {
        throw new Error("Cobrança não encontrada");
    }

    if (cobranca.status === StatusCobranca.pago) {
        throw new Error("Cobrança já foi confirmada");
    }

    const updated = await prisma.cobranca.update({
        where: { id: cobrancaId },
        data: {
            status: StatusCobranca.pago,
            dataPagamento: new Date(),
            comprovanteUrl
        }
    });

    revalidatePath("/cobrancas");
    return updated;
}

/**
 * Get financial KPIs for dashboard
 */
export async function getKPIsFinanceiros() {
    const { contaId } = await getContext();

    const todasCobrancas = await prisma.cobranca.findMany({
        where: {
            assinatura: {
                participante: { contaId }
            }
        }
    });

    const totalPendente = todasCobrancas
        .filter(c => c.status === StatusCobranca.pendente)
        .reduce((sum, c) => sum + Number(c.valor), 0);

    const receitaConfirmada = todasCobrancas
        .filter(c => c.status === StatusCobranca.pago)
        .reduce((sum, c) => sum + Number(c.valor), 0);

    const emAtraso = todasCobrancas
        .filter(c => c.status === StatusCobranca.pendente && estaAtrasado(c.periodoFim))
        .reduce((sum, c) => sum + Number(c.valor), 0);

    return {
        totalPendente,
        receitaConfirmada,
        emAtraso,
        totalCobrancas: todasCobrancas.length
    };
}

/**
 * Renew charges for active subscriptions (CRON job or manual trigger)
 */
export async function renovarCobrancas() {
    const { contaId } = await getContext();

    // Find active subscriptions where the last charge is expiring soon
    const assinaturasAtivas = await prisma.assinatura.findMany({
        where: {
            status: "ativa",
            participante: { contaId }
        },
        include: {
            cobrancas: {
                orderBy: { periodoFim: "desc" },
                take: 1
            }
        }
    });

    const cobrancasParaCriar: Array<{
        assinaturaId: number;
        valor: number;
        periodoInicio: Date;
        periodoFim: Date;
    }> = [];

    // Prepare all charges to be created
    for (const assinatura of assinaturasAtivas) {
        const ultimaCobranca = assinatura.cobrancas[0];

        if (!ultimaCobranca) continue;

        // Generate new charge if last one expires in the next 5 days
        const diasParaVencimento = Math.ceil(
            (ultimaCobranca.periodoFim.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diasParaVencimento <= 5 && diasParaVencimento >= 0) {
            const periodoInicio = ultimaCobranca.periodoFim;
            const periodoFim = calcularProximoVencimento(periodoInicio, assinatura.frequencia);
            const valor = calcularValorPeriodo(assinatura.valor, assinatura.frequencia);

            cobrancasParaCriar.push({
                assinaturaId: assinatura.id,
                valor: Number(valor), // Convert Decimal to number for storage
                periodoInicio,
                periodoFim
            });
        }
    }

    // Create all charges in a single transaction (all or nothing)
    let renovadas = 0;
    if (cobrancasParaCriar.length > 0) {
        await prisma.$transaction(async (tx) => {
            for (const cobrancaData of cobrancasParaCriar) {
                await tx.cobranca.create({
                    data: {
                        ...cobrancaData,
                        status: "pendente"
                    }
                });
                renovadas++;
            }
        });
    }

    revalidatePath("/cobrancas");

    return { renovadas };
}

/**
 * Enviar notificação WhatsApp manual para uma cobrança
 * A mensagem é determinada automaticamente baseada no status da cobrança
 * @param cobrancaId - ID da cobrança
 * @returns Resultado com sucesso e link manual se aplicável
 */
export async function enviarNotificacaoCobranca(
    cobrancaId: number
): Promise<EnviarNotificacaoResult> {
    const { contaId } = await getContext();

    // Buscar cobrança com todos os relacionamentos necessários
    const cobranca = await prisma.cobranca.findUnique({
        where: { id: cobrancaId },
        include: {
            assinatura: {
                include: {
                    participante: true,
                    streaming: { include: { catalogo: true } },
                },
            },
        },
    });

    if (!cobranca) {
        throw new Error("Cobrança não encontrada");
    }

    if (cobranca.assinatura.participante.contaId !== contaId) {
        throw new Error("Sem permissão para acessar esta cobrança");
    }

    // Verificar se participante tem WhatsApp
    if (!cobranca.assinatura.participante.whatsappNumero) {
        throw new Error("Participante não possui número de WhatsApp cadastrado");
    }

    // Buscar configuração do WhatsApp
    const whatsappConfig = await prisma.whatsAppConfig.findUnique({
        where: { contaId },
        select: { id: true, isAtivo: true }
    });

    // Importar serviço WhatsApp
    const { sendWhatsAppNotification, whatsappTemplates } = await import("@/lib/whatsapp-service");
    const { TipoNotificacaoWhatsApp } = await import("@streamshare/database");
    const { differenceInDays } = await import("date-fns");

    // Determinar tipo de notificação e mensagem baseado no status
    let tipo: typeof TipoNotificacaoWhatsApp[keyof typeof TipoNotificacaoWhatsApp];
    let mensagem: string;

    const participante = cobranca.assinatura.participante.nome;
    const streaming = cobranca.assinatura.streaming.catalogo.nome;
    const valor = `R$ ${Number(cobranca.valor).toFixed(2)}`;

    switch (cobranca.status) {
        case 'pendente': {
            const diasRestantes = differenceInDays(new Date(cobranca.periodoFim), new Date());
            tipo = 'cobranca_vencendo' as any;
            mensagem = whatsappTemplates.cobrancaVencendo(participante, streaming, valor, diasRestantes);
            break;
        }

        case 'atrasado': {
            const diasAtraso = differenceInDays(new Date(), new Date(cobranca.periodoFim));
            tipo = 'cobranca_atrasada' as any;
            mensagem = whatsappTemplates.cobrancaAtrasada(participante, streaming, valor, diasAtraso);
            break;
        }

        case 'pago': {
            tipo = 'pagamento_confirmado' as any;
            mensagem = whatsappTemplates.pagamentoConfirmado(participante, streaming, valor);
            break;
        }

        default:
            throw new Error("Status da cobrança não permite envio de notificação");
    }

    // **SE NÃO CONFIGURADO: Retornar link wa.me para envio manual**
    if (!whatsappConfig || !whatsappConfig.isAtivo) {
        try {
            const { generateWhatsAppLink } = await import("@/lib/whatsapp-link-utils");
            const link = generateWhatsAppLink(
                cobranca.assinatura.participante.whatsappNumero,
                mensagem
            );

            // Criar log de tentativa manual (não bloqueia se falhar)
            try {
                if (whatsappConfig?.id) {
                    await prisma.whatsAppLog.create({
                        data: {
                            configId: whatsappConfig.id,
                            participanteId: cobranca.assinatura.participanteId,
                            tipo,
                            numeroDestino: cobranca.assinatura.participante.whatsappNumero,
                            mensagem,
                            enviado: false,
                            erro: "Envio manual via wa.me - WhatsApp não configurado"
                        }
                    });
                }
            } catch (logError) {
                console.error('[WhatsApp] Falha ao criar log de envio manual:', logError);
                // Não bloqueia o fluxo - log é secundário
            }

            return {
                success: true,
                manualLink: link,
                message: "Abra o link para enviar manualmente pelo WhatsApp"
            };
        } catch (linkError) {
            throw new Error(
                `Erro ao gerar link WhatsApp: ${(linkError as Error).message}`
            );
        }
    }

    // **VERIFICAR LOGS RECENTES (Anti-spam)**
    const { subHours, formatDistanceToNow } = await import("date-fns");
    const { ptBR } = await import("date-fns/locale");

    const ultimoLog = await prisma.whatsAppLog.findFirst({
        where: {
            configId: whatsappConfig.id,
            participanteId: cobranca.assinatura.participanteId,
            createdAt: { gte: subHours(new Date(), 24) },
            enviado: true
        },
        orderBy: { createdAt: 'desc' }
    });

    if (ultimoLog) {
        const tempoDecorrido = formatDistanceToNow(new Date(ultimoLog.createdAt), {
            addSuffix: true,
            locale: ptBR
        });
        throw new Error(`Já foi enviada uma notificação WhatsApp ${tempoDecorrido}. Aguarde 24 horas para enviar novamente.`);
    }

    // **SE CONFIGURADO: Enviar via Twilio API**
    const result = await sendWhatsAppNotification(
        contaId,
        tipo,
        cobranca.assinatura.participanteId,
        mensagem
    );

    if (!result.success) {
        const errorMsg = ('error' in result ? result.error : undefined) || ('reason' in result ? result.reason : undefined) || "Erro ao enviar notificação";
        throw new Error(errorMsg);
    }

    revalidatePath("/cobrancas");
    return { success: true };
}
