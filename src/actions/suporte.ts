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

export async function createReport(data: SuporteInput) {
    // Rate limit: Max 5 tickets per user per day
    if (data.usuarioId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const count = await prisma.suporte.count({
            where: {
                usuarioId: data.usuarioId,
                createdAt: {
                    gte: today,
                },
            },
        });

        if (count >= 5) {
            return {
                success: false,
                error: "Você atingiu o limite de 5 chamados por dia. Tente novamente amanhã.",
            };
        }
    }

    try {
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

        // Revalidate admin page if it exists/cached
        revalidatePath('/admin/reports');

        return { success: true, da: report };
    } catch (error) {
        console.error('Error creating report:', error);
        return { success: false, error: 'Failed to create report' };
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
        });

        return { success: true, data: reports };
    } catch (error) {
        console.error('Error fetching reports:', error);
        return { success: false, error: 'Failed to fetch reports' };
    }
}

export async function updateReportStatus(id: number, status: StatusSuporte) {
    try {
        const report = await prisma.suporte.update({
            where: { id },
            data: { status },
        });

        // Notify user if exits
        if (report.usuarioId) {
            // Find user's account to notify
            const userAccount = await prisma.contaUsuario.findFirst({
                where: { usuarioId: report.usuarioId, isAtivo: true },
                select: { contaId: true }
            });

            if (userAccount) {
                await criarNotificacao({
                    tipo: 'suporte_atualizado' as any, // Cast to any temporarily to bypass outdated TS check or use Enum if imported
                    titulo: `Atualização no Chamado #${report.id}`,
                    descricao: `O status do seu chamado "${report.assunto}" foi atualizado para: ${status.replace('_', ' ')}.`,
                    usuarioId: report.usuarioId,
                    entidadeId: report.id,
                    metadata: { status }
                });
            }
        }

        revalidatePath('/admin/reports');
        return { success: true, data: report };
    } catch (error) {
        console.error('Error updating report status:', error);
        return { success: false, error: 'Failed to update report status' };
    }
}

export async function getUserReports() {
    const session = await getCurrentUser();
    if (!session) return { success: false, error: 'Not authenticated' };

    try {
        const reports = await prisma.suporte.findMany({
            where: { usuarioId: session.userId },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: reports };
    } catch (error) {
        console.error('Error fetching user reports:', error);
        return { success: false, error: 'Failed to fetch user reports' };
    }
}
