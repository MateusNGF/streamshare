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
        streaming?: string;
        search?: string;
        organizador?: string;
        vencimento?: string;
        valor?: string;
    };
}

export default async function FaturasPage({ searchParams }: FaturasPageProps) {
    const session = await getCurrentUser();

    // Fetch streamings the user is subscribed to (with full catalog details for icons)
    const mySubscriptions = await prisma.assinatura.findMany({
        where: { participante: { userId: session?.userId }, deletedAt: null },
        select: {
            streaming: {
                select: {
                    id: true,
                    apelido: true,
                    catalogo: {
                        select: {
                            nome: true,
                            iconeUrl: true,
                            corPrimaria: true
                        }
                    },
                    conta: {
                        select: {
                            id: true,
                            nome: true
                        }
                    }
                }
            }
        }
    });

    const streamings = mySubscriptions.map(s => ({
        id: s.streaming.id,
        nome: s.streaming.apelido || s.streaming.catalogo.nome,
        iconeUrl: s.streaming.catalogo.iconeUrl,
        corPrimaria: s.streaming.catalogo.corPrimaria
    })).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i); // Deduplicate

    const [faturasData, resumo, lotes] = await Promise.all([
        getFaturasUsuario({
            status: searchParams.status,
            q: searchParams.search,
            streaming: searchParams.streaming,
            organizador: searchParams.organizador,
            vencimento: searchParams.vencimento,
            valor: searchParams.valor
        }),
        getResumoFaturas(),
        getLotesUsuario()
    ]);

    const faturas = faturasData.data || [];

    // Extract unique organizers the user has shared subscriptions with
    // We use mySubscriptions to get ALL possible organizers for the filter
    const organizers = mySubscriptions.map(s => ({
        id: s.streaming.conta?.id || 0,
        nome: s.streaming.conta?.nome || "Organizador"
    })).filter((v, i, a) => v.id !== 0 && a.findIndex(t => t.id === v.id) === i);

    const error = (!faturasData.success || !resumo.success || !lotes.success) ? "Falha ao carregar algumas informações de faturas." : undefined;

    return (
        <FaturasClient
            faturas={faturas}
            resumo={resumo.data || {}}
            lotes={lotes.data || []}
            streamings={streamings}
            organizers={organizers}
            error={error}
        />
    );
}
