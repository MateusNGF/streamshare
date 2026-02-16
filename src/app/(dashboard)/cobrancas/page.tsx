import { getKPIsFinanceiros, getCobrancas } from "@/actions/cobrancas";
import { getStreamings } from "@/actions/streamings";
import { CobrancasClient } from "./CobrancasClient";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PlanoConta } from "@prisma/client";

export default async function CobrancasPage() {
    const [kpis, cobrancas, whatsappConfig, streamings, accountData] = await Promise.all([
        getKPIsFinanceiros(),
        getCobrancas(),
        checkWhatsAppConfig(),
        getStreamings(),
        getAccountData()
    ]);

    return (
        <CobrancasClient
            kpis={kpis}
            cobrancasIniciais={cobrancas}
            whatsappConfigurado={whatsappConfig}
            streamings={streamings}
            plano={accountData.plano as PlanoConta}
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
