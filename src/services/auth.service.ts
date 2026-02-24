import { prisma } from "@/lib/db";
import { CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } from "@/config/legal";
import { ProviderAuth } from "@prisma/client";

export interface ExternalAuthPayload {
    email: string;
    nome: string;
    picture?: string;
    provider: ProviderAuth;
}

export class AuthService {
    /**
     * Handles authentication for external providers (Google, etc.)
     * Finds or creates a user and their associated account.
     */
    static async handleExternalAuth(payload: ExternalAuthPayload) {
        let user = await prisma.usuario.findUnique({
            where: { email: payload.email },
        });

        if (!user) {
            user = await this.createUserWithAccount(payload);
        } else if (user.provider !== payload.provider) {
            // Optional: Handle case where email exists but was signed up with a different provider
            // For now, we'll allow it but we might want to "link" or warn.
            // Let's update provider to allow future logins via this provider.
            user = await prisma.usuario.update({
                where: { id: user.id },
                data: { provider: payload.provider }
            });
        }

        return user;
    }

    /**
     * Updates user metadata after a successful login
     */
    static async updateLoginMetadata(userId: number, metadata: { ip: string; userAgent: string }) {
        return await prisma.usuario.update({
            where: { id: userId },
            data: {
                ultimoLogin: new Date(),
                lastIp: metadata.ip,
                lastUserAgent: metadata.userAgent,
            },
            select: {
                id: true,
                email: true,
                sessionVersion: true,
                nome: true,
            }
        });
    }

    /**
     * Orchestrates user and account creation in a transaction
     */
    private static async createUserWithAccount(payload: ExternalAuthPayload) {
        return await prisma.$transaction(async (tx) => {
            const newUser = await tx.usuario.create({
                data: {
                    nome: payload.nome,
                    email: payload.email,
                    provider: payload.provider,
                    isAtivo: true
                },
            });

            const newConta = await tx.conta.create({
                data: {
                    nome: `Conta de ${newUser.nome}`,
                    email: payload.email,
                    plano: "free",
                },
            });

            await tx.contaUsuario.create({
                data: {
                    contaId: newConta.id,
                    usuarioId: newUser.id,
                    nivelAcesso: "owner",
                },
            });

            return newUser;
        });
    }
}
