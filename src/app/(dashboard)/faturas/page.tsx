import { getFaturasUsuario, getResumoFaturas } from "@/actions/faturas";
import { getLotesUsuario } from "@/actions/cobrancas";
import { getParticipantes } from "@/actions/participantes";
import { FaturasClient } from "./FaturasClient";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
    title: "Minhas Faturas | StreamShare",
    description: "Gerencie suas faturas e pagamentos.",
};

interface FaturasPageProps {
    searchParams: {
        status?: any;
        participante?: string;
    };
}

export default async function FaturasPage({ searchParams }: FaturasPageProps) {
    const session = await getCurrentUser();

    const [faturas, resumo, lotes, participantes] = await Promise.all([
        getFaturasUsuario({
            status: searchParams.status,
            participanteId: searchParams.participante
        }),
        getResumoFaturas(),
        getLotesUsuario(),
        prisma.participante.findMany({
            where: { userId: session?.userId, deletedAt: null },
            select: { id: true, nome: true }
        })
    ]);

    const error = (!faturas.success || !resumo.success || !lotes.success) ? "Falha ao carregar algumas informações de faturas." : undefined;

    return (
        <FaturasClient
            faturas={faturas.data || []}
            resumo={resumo.data || {}}
            lotes={lotes.data || []}
            participantes={participantes || []}
            error={error}
        />
    );
}
