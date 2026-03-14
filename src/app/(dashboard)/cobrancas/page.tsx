import { getKPIsFinanceiros, getCobrancas, getLotesGestor } from "@/actions/cobrancas";
import { getStreamings } from "@/actions/streamings";
import { getParticipantes } from "@/actions/participantes";
import { CobrancasClient } from "./CobrancasClient";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PlanoConta, StatusCobranca } from "@prisma/client";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cobranças | StreamShare",
    description: "Acompanhe e gerencie as cobranças dos participantes do seu grupo.",
};

interface CobrancasPageProps {
    searchParams: {
        status?: StatusCobranca;
        participante?: string;
        mes?: string;
        search?: string;
        vencimento?: string;
        pagamento?: string;
        valor?: string;
        hasWhatsapp?: string;
    };
}

export default async function CobrancasPage({ searchParams }: CobrancasPageProps) {
    const valorParam = searchParams.valor ? JSON.parse(searchParams.valor) : undefined;
    const mesParam = searchParams.mes ? searchParams.mes.split('-') : [undefined, undefined];
    const hasWhatsapp = searchParams.hasWhatsapp === "true" ? true : searchParams.hasWhatsapp === "false" ? false : undefined;

    const results = await Promise.all([
        getKPIsFinanceiros(),
        getCobrancas({
            status: searchParams.status,
            participanteId: searchParams.participante ? parseInt(searchParams.participante) : undefined,
            mes: mesParam[1] ? parseInt(mesParam[1]) : undefined,
            ano: mesParam[0] ? parseInt(mesParam[0]) : undefined,
            valorMin: valorParam?.min ? Number(valorParam.min) : undefined,
            valorMax: valorParam?.max ? Number(valorParam.max) : undefined,
            hasWhatsapp: hasWhatsapp
        }),
        getLotesGestor(),
        checkWhatsAppConfig(),
        getStreamings(),
        getAccountData(),
        getParticipantes()
    ]);

    const [kpisRes, cobrancasRes, lotesRes, whatsappConfig, streamingsRes, accountData, participantesRes] = results;

    const hasError = !kpisRes.success || !cobrancasRes.success || !streamingsRes.success || !participantesRes.success;
    const errorMsg = hasError ? "Algumas informações de cobranças não puderam ser carregadas." : undefined;

    return (
        <CobrancasClient
            kpis={kpisRes.data || { totalPendente: 0, receitaConfirmada: 0, emAtraso: 0, totalCobrancas: 0 }}
            cobrancasIniciais={cobrancasRes.data || []}
            lotes={lotesRes.data || []}
            whatsappConfigurado={whatsappConfig}
            streamings={streamingsRes.data || []}
            participantes={participantesRes.data || []}
            plano={accountData.plano as PlanoConta}
            error={errorMsg}
        />
    );
}

async function getAccountData() {
    const session = await getCurrentUser();
    if (!session) return { plano: "free" };

    const userAccount = await prisma.contaUsuario.findFirst({
        where: { usuarioId: session.userId, isAtivo: true },
        select: { conta: { select: { plano: true } } },
    });

    return userAccount?.conta || { plano: "free" };
}

async function checkWhatsAppConfig(): Promise<boolean> {
    try {
        const session = await getCurrentUser();
        if (!session) return false;

        const userAccount = await prisma.contaUsuario.findFirst({
            where: { usuarioId: session.userId, isAtivo: true },
            select: { contaId: true },
        });

        if (!userAccount) return false;

        const config = await prisma.whatsAppConfig.findUnique({
            where: { contaId: userAccount.contaId },
            select: { isAtivo: true },
        });

        return config?.isAtivo || false;
    } catch {
        return false;
    }
}
