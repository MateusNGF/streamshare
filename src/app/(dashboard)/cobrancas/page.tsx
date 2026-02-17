import { getKPIsFinanceiros, getCobrancas } from "@/actions/cobrancas";
import { getStreamings } from "@/actions/streamings";
import { CobrancasClient } from "./CobrancasClient";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PlanoConta } from "@prisma/client";

export default async function CobrancasPage() {
    const results = await Promise.all([
        getKPIsFinanceiros(),
        getCobrancas(),
        checkWhatsAppConfig(),
        getStreamings(),
        getAccountData()
    ]);

    const [kpisRes, cobrancasRes, whatsappConfig, streamingsRes, accountData] = results;

    const hasError = !kpisRes.success || !cobrancasRes.success || !streamingsRes.success;
    const errorMsg = hasError ? "Algumas informações de cobranças não puderam ser carregadas." : undefined;

    return (
        <CobrancasClient
            kpis={kpisRes.data || { totalPendente: 0, receitaConfirmada: 0, emAtraso: 0, totalCobrancas: 0 }}
            cobrancasIniciais={cobrancasRes.data || []}
            whatsappConfigurado={whatsappConfig}
            streamings={streamingsRes.data || []}
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
