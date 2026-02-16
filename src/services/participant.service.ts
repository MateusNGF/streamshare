
import { prisma } from "@/lib/db";

export class ParticipantService {
    /**
     * Finds an existing participant or creates a new one based on available information.
     * Ensures consistent identification across different flows (public subscribe, email invite, etc).
     */
    static async findOrCreateParticipant(tx: any, data: {
        contaId: number;
        nome: string;
        email: string;
        whatsappNumero: string;
        userId?: number;
        cpf?: string;
    }) {
        const emailFormatted = data.email.toLowerCase().trim();

        // 1. Try to find existing participant
        // Priority: userId > CPF > E-mail > WhatsApp
        let participant = await tx.participante.findFirst({
            where: {
                contaId: data.contaId,
                OR: [
                    ...(data.userId ? [{ userId: data.userId }] : []),
                    ...(data.cpf ? [{ cpf: data.cpf }] : []),
                    { email: emailFormatted },
                    { whatsappNumero: data.whatsappNumero }
                ]
            }
        });

        if (participant) {
            // Update data if necessary and ensure userId is linked
            participant = await tx.participante.update({
                where: { id: participant.id },
                data: {
                    nome: data.nome,
                    whatsappNumero: data.whatsappNumero,
                    cpf: data.cpf || participant.cpf,
                    userId: data.userId || participant.userId,
                    status: "ativo" // Ensure participant is active if they are subscribing
                }
            });
        } else {
            // 2. Create new participant
            participant = await tx.participante.create({
                data: {
                    contaId: data.contaId,
                    nome: data.nome,
                    email: emailFormatted,
                    whatsappNumero: data.whatsappNumero,
                    cpf: data.cpf || "",
                    userId: data.userId,
                    status: "ativo"
                }
            });
        }

        return participant;
    }
}
