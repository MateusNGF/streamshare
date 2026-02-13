import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";

export const invitesService = {
    /**
     * Create a new invite for a user (email) to join a group (contaId).
     * Optional: streamingId to link to a specific subscription.
     */
    createInvite: async (email: string, contaId: number, convidadoPorId: number, streamingId?: number) => {
        // 1. Check if invite already exists
        const existing = await prisma.convite.findFirst({
            where: {
                email,
                contaId,
                status: "pendente",
                expiresAt: { gt: new Date() }
            }
        });

        if (existing) {
            return existing;
        }

        // 2. Check if user already exists
        const existingUser = await prisma.usuario.findUnique({
            where: { email }
        });

        // 3. Create Invite
        const token = randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        const invite = await prisma.convite.create({
            data: {
                email,
                contaId,
                streamingId,
                convidadoPorId,
                usuarioId: existingUser?.id, // Link if user exists
                token,
                expiresAt,
                status: "pendente"
            },
            include: {
                conta: { select: { nome: true } }
            }
        });

        // 4. Trigger Notification (System) if user exists
        if (existingUser) {
            await prisma.notificacao.create({
                data: {
                    contaId,
                    usuarioId: existingUser.id,
                    tipo: "convite_recebido",
                    titulo: "Novo Convite!",
                    descricao: `Você recebeu um convite para participar do grupo "${invite.conta.nome}".`,
                    lida: false,
                    metadata: { inviteId: invite.id }
                }
            });
        }

        return invite;
    },

    /**
     * Validate and retrieve invite by token
     */
    getInviteByToken: async (token: string) => {
        const invite = await prisma.convite.findUnique({
            where: { token },
            include: {
                conta: true,
                streaming: { include: { catalogo: true } },
                convidadoPor: { select: { nome: true } }
            }
        });

        if (!invite) return null;
        if (invite.status !== 'pendente') throw new Error("Convite já utilizado ou cancelado.");
        if (invite.expiresAt < new Date()) {
            await prisma.convite.update({ where: { id: invite.id }, data: { status: 'expirado' } });
            throw new Error("Convite expirado.");
        }

        return invite;
    },

    /**
     * Accept an invite: Link User, Create/Update Participant, Create Subscription
     */
    acceptInvite: async (token: string, userId: number, userEmail: string) => {
        const invite = await invitesService.getInviteByToken(token);
        if (!invite) throw new Error("Convite inválido ou expirado");

        return await prisma.$transaction(async (tx) => {
            // 1. Update Invite Status
            await tx.convite.update({
                where: { id: invite.id },
                data: { status: "aceito", usuarioId: userId }
            });

            // 2. Check existing participant
            const existingMember = await tx.participante.findFirst({
                where: { contaId: invite.contaId, userId }
            });

            let participanteId = existingMember?.id;

            if (!existingMember) {
                const user = await tx.usuario.findUnique({ where: { id: userId } });
                const newMember = await tx.participante.create({
                    data: {
                        contaId: invite.contaId,
                        userId,
                        nome: user?.nome || userEmail.split('@')[0],
                        email: userEmail,
                        status: "ativo"
                    }
                });
                participanteId = newMember.id;
            } else {
                if (existingMember.status !== "ativo") {
                    await tx.participante.update({
                        where: { id: existingMember.id },
                        data: { status: "ativo" }
                    });
                }
            }

            if (!participanteId) throw new Error("Falha ao criar participante");

            // 3. Handle Subscription linking
            if (invite.streamingId) {
                const streaming = await tx.streaming.findUnique({
                    where: { id: invite.streamingId },
                    include: { _count: { select: { assinaturas: true } } }
                });

                if (!streaming) throw new Error("Streaming não encontrado");

                if (streaming._count.assinaturas >= streaming.limiteParticipantes) {
                    throw new Error("Este streaming não possui mais vagas disponíveis.");
                }

                const valor = Number(streaming.valorIntegral) / streaming.limiteParticipantes;

                await tx.assinatura.create({
                    data: {
                        participanteId,
                        streamingId: invite.streamingId,
                        frequencia: 'mensal',
                        valor: valor,
                        dataInicio: new Date(),
                        status: 'ativa',
                        cobrancaAutomaticaPaga: false
                    }
                });
            }

            // 4. Notifications
            await tx.notificacao.create({
                data: {
                    contaId: invite.contaId,
                    tipo: "convite_aceito",
                    titulo: 'Convite Aceito',
                    descricao: `${userEmail} aceitou o convite e entrou no grupo.`,
                    lida: false
                }
            });

            return { success: true };
        });
    }
};
