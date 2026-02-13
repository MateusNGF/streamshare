'use server';

import { prisma } from '@/lib/db';
import { Prisma, StatusSuporte } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth';
import { criarNotificacao } from './notificacoes';

export async function getCurrentUserAction() {
    const session = await getCurrentUser();
    if (!session) return null;

    const user = await prisma.usuario.findUnique({
        where: { id: session.userId },
        select: { nome: true, email: true }
    });

    return user;
}

export interface SuporteInput {
    nome: string;
    email: string;
    assunto: string;
    descricao: string;
    usuarioId?: number;
}


/**
 * Checks if the user has reached the daily rate limit for support tickets.
 * @param usuarioId The ID of the user to check.
 * @returns True if the user can create a report, false otherwise.
 */
async function checkRateLimit(usuarioId: number): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await prisma.suporte.count({
        where: {
            usuarioId,
            createdAt: {
                gte: today,
            },
        },
    });

    return count < 5;
}

export async function createReport(data: SuporteInput) {
    // 1. Rate Limiting Check
    if (data.usuarioId) {
        const canCreate = await checkRateLimit(data.usuarioId);
        if (!canCreate) {
            return {
                success: false,
                error: "Limite diário de 5 chamados atingido. Tente novamente amanhã.",
            };
        }
    }

    try {
        // 2. Create the Report
        const report = await prisma.suporte.create({
            data: {
                nome: data.nome,
                email: data.email,
                assunto: data.assunto,
                descricao: data.descricao,
                status: 'pendente',
                usuarioId: data.usuarioId,
            },
        });

        // 3. Revalidate Cache
        revalidatePath('/admin/reports');

        return { success: true, data: report };
    } catch (error) {
        console.error('[createReport] Error:', error);
        return { success: false, error: 'Falha ao criar o chamado. Tente novamente.' };
    }
}

export async function getReports(filters?: { status?: StatusSuporte }) {
    try {
        const where: Prisma.SuporteWhereInput = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        const reports = await prisma.suporte.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                usuario: {
                    select: {
                        nome: true,
                        email: true,
                    }
                }
            }
        });

        return { success: true, data: reports };
    } catch (error) {
        console.error('[getReports] Error:', error);
        return { success: false, error: 'Erro ao buscar chamados.' };
    }
}

export async function updateReportStatus(id: number, status: StatusSuporte) {
    try {
        const report = await prisma.suporte.update({
            where: { id },
            data: { status },
            include: { usuario: true } // Include user to get ID and ensure existence
        });

        // Notify user if linked account exists
        if (report.usuarioId) {
            // Find user's active account to associate the notification with
            // We notify the most recently updated account where the user is active
            const userAccount = await prisma.contaUsuario.findFirst({
                where: {
                    usuarioId: report.usuarioId,
                    isAtivo: true
                },
                select: { contaId: true },
                orderBy: { id: 'desc' } // Get most recent association if multiplerAccount) {
            });

            if (userAccount) {
                await criarNotificacao({
                    tipo: 'suporte_atualizado' as any, // Cast until type is updated in generated client
                    titulo: `Atualização no Chamado #${report.id}`,
                    descricao: `Status atualizado para: ${status.replace(/_/g, ' ').toUpperCase()}.`,
                    usuarioId: report.usuarioId,
                    contaId: userAccount.contaId, // Explicitly target the user's account
                    entidadeId: report.id,
                    metadata: { status, previousStatus: report.status }
                });
            }
        }

        revalidatePath('/admin/reports');
        return { success: true, data: report };
    } catch (error) {
        console.error('[updateReportStatus] Error:', error);
        return { success: false, error: 'Falha ao atualizar status do chamado.' };
    }
}

export async function getUserReports() {
    const session = await getCurrentUser();
    if (!session) return { success: false, error: 'Sessão expirada ou inválida.' };

    try {
        const reports = await prisma.suporte.findMany({
            where: { usuarioId: session.userId },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: reports };
    } catch (error) {
        console.error('[getUserReports] Error:', error);
        return { success: false, error: 'Erro ao carregar seus chamados.' };
    }
}
