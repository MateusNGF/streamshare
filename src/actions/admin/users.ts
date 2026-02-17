"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types/action-result";

export type AdminUser = {
    id: number;
    email: string;
    nome: string;
    isAdmin: boolean;
    createdAt: Date;
};

type GetUsersResponse = {
    data: AdminUser[];
    metadata: {
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    };
};

export async function getUsers(
    page: number = 1,
    perPage: number = 10,
    search?: string
): Promise<ActionResult<GetUsersResponse>> {
    try {
        const session = await getCurrentUser();
        if (!session) {
            return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
        }

        // Verify if current user is admin
        const adminUser = await prisma.usuarioAdmin.findFirst({
            where: {
                usuarioId: session.userId,
                isAtivo: true,
            },
        });

        if (!adminUser) {
            return { success: false, error: "Acesso negado", code: "FORBIDDEN" };
        }

        const skip = (page - 1) * perPage;

        const where = search
            ? {
                OR: [
                    { nome: { contains: search, mode: "insensitive" as const } },
                    { email: { contains: search, mode: "insensitive" as const } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            prisma.usuario.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    nome: true,
                    createdAt: true,
                    admin: {
                        select: {
                            isAtivo: true,
                        },
                    },
                },
                skip,
                take: perPage,
                orderBy: { createdAt: "desc" },
            }),
            prisma.usuario.count({ where }),
        ]);

        const formattedUsers: AdminUser[] = users.map((user) => ({
            id: user.id,
            email: user.email,
            nome: user.nome,
            createdAt: user.createdAt,
            isAdmin: user.admin?.isAtivo ?? false,
        }));

        return {
            success: true,
            data: {
                data: formattedUsers,
                metadata: {
                    total,
                    page,
                    perPage,
                    totalPages: Math.ceil(total / perPage),
                },
            }
        };
    } catch (error: any) {
        console.error("[GET_USERS_ERROR]", error);
        return { success: false, error: "Erro ao buscar usuários" };
    }
}

export async function toggleAdminRole(userId: number): Promise<ActionResult<void>> {
    try {
        const session = await getCurrentUser();
        if (!session) {
            return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
        }

        // Verify if current user is admin
        const currentUserAdmin = await prisma.usuarioAdmin.findFirst({
            where: {
                usuarioId: session.userId,
                isAtivo: true,
            },
        });

        if (!currentUserAdmin) {
            return { success: false, error: "Acesso negado", code: "FORBIDDEN" };
        }

        const targetUserAdmin = await prisma.usuarioAdmin.findUnique({
            where: { usuarioId: userId },
        });

        if (targetUserAdmin) {
            // Toggle existing record
            await prisma.usuarioAdmin.update({
                where: { usuarioId: userId },
                data: { isAtivo: !targetUserAdmin.isAtivo },
            });
        } else {
            // Create new record
            await prisma.usuarioAdmin.create({
                data: {
                    usuarioId: userId,
                    isAtivo: true,
                },
            });
        }

        revalidatePath("/admin/usuarios");
        return { success: true };
    } catch (error: any) {
        console.error("[TOGGLE_ADMIN_ROLE_ERROR]", error);
        return { success: false, error: "Erro ao alterar permissões de admin" };
    }
}
