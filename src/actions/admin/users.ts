"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
): Promise<GetUsersResponse> {
    const session = await getCurrentUser();
    if (!session) {
        throw new Error("Unauthorized");
    }

    // Verify if current user is admin
    const adminUser = await prisma.usuarioAdmin.findFirst({
        where: {
            usuarioId: session.userId,
            isAtivo: true,
        },
    });

    if (!adminUser) {
        throw new Error("Forbidden");
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
        data: formattedUsers,
        metadata: {
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        },
    };
}

export async function toggleAdminRole(userId: number): Promise<void> {
    const session = await getCurrentUser();
    if (!session) {
        throw new Error("Unauthorized");
    }

    // Verify if current user is admin
    const currentUserAdmin = await prisma.usuarioAdmin.findFirst({
        where: {
            usuarioId: session.userId,
            isAtivo: true,
        },
    });

    if (!currentUserAdmin) {
        throw new Error("Forbidden");
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
}
