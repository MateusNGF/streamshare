import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export class AuthenticationError extends Error {
    constructor(message = "Não autenticado") {
        super(message);
        this.name = "AuthenticationError";
    }
}

export class AccountNotFoundError extends Error {
    constructor(message = "Conta não encontrada") {
        super(message);
        this.name = "AccountNotFoundError";
    }
}

export async function getContext() {
    const session = await getCurrentUser();
    if (!session) throw new AuthenticationError();

    const userAccount = await prisma.contaUsuario.findFirst({
        where: { usuarioId: session.userId, isAtivo: true },
        select: { contaId: true, nivelAcesso: true },
    });

    if (!userAccount) throw new AccountNotFoundError();

    return {
        userId: session.userId,
        userEmail: session.email,
        contaId: userAccount.contaId,
        nivelAcesso: userAccount.nivelAcesso
    };
}
