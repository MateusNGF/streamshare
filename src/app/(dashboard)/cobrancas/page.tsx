import { getKPIsFinanceiros, getCobrancas } from "@/actions/cobrancas";
import { getStreamings } from "@/actions/streamings";
import { CobrancasClient } from "./CobrancasClient";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export default async function CobrancasPage() {
    const [kpis, cobrancas, whatsappConfig, streamings] = await Promise.all([
        getKPIsFinanceiros(),
        getCobrancas(),
        checkWhatsAppConfig(),
        getStreamings()
    ]);

    return (
        <CobrancasClient
            kpis={kpis}
            cobrancasIniciais={cobrancas}
            whatsappConfigurado={whatsappConfig}
            streamings={streamings}
        />
    );
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
