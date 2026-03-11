import { getParticipantes } from "@/actions/participantes";
import { getStreamings } from "@/actions/streamings";
import { getAccountDiasVencimento } from "@/actions/settings";
import { AssinaturaWizard } from "@/components/assinaturas/AssinaturaWizard";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Nova Assinatura | StreamShare",
    description: "Crie novas assinaturas de forma simples e rápida.",
};

export default async function NovoAssinaturaPage() {
    const [participantesRes, streamingsRes, diasVencimentoRes] = await Promise.all([
        getParticipantes(),
        getStreamings(),
        getAccountDiasVencimento(),
    ]);

    // Format data to match component expectations
    const participantes = (participantesRes.data || []).map((p: any) => ({
        ...p,
        whatsappNumero: p.whatsappNumero || "",
        _count: p._count || { assinaturas: 0 }
    }));

    const streamings = (streamingsRes.data || []).map((s: any) => ({
        ...s,
        nome: s.catalogo?.nome || "Streaming",
        cor: s.catalogo?.corPrimaria || "#000",
        ocupados: s._count?.assinaturas || 0,
        limiteParticipantes: s.limiteParticipantes || 1
    }));

    return (
        <AssinaturaWizard
            participantes={participantes as any}
            streamings={streamings as any}
            initialDiasVencimento={diasVencimentoRes.data || []}
        />
    );
}
