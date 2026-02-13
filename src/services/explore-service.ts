import { prisma } from "@/lib/db";

export const exploreService = {
    getAvailableSlots: async () => {
        // Fetch streamings from PUBLIC groups
        const streamings = await prisma.streaming.findMany({
            where: {
                isAtivo: true,
                conta: { // The Group Owner Account
                    grupos: {
                        some: {
                            isPublico: true,
                            isAtivo: true
                        }
                    }
                },
                // We need to filter by availability, but Prisma filtering on relation count is tricky in one go if we only want "not full".
                // Simplest: Fetch all public active streamings, then filter in JS or use detailed query.
                // Better: Query Streamings where count(assinaturas) < limite.
            },
            include: {
                catalogo: true,
                conta: { select: { nome: true, id: true } }, // Group Owner Name/ID
                _count: {
                    select: { assinaturas: true }
                }
            }
        });

        // Filter for availability
        const available = streamings.filter(s => s._count.assinaturas < s.limiteParticipantes);

        return available;
    }
};
