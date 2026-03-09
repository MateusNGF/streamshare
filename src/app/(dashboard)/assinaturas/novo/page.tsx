import { getParticipantes } from "@/actions/participantes";
import { getStreamings } from "@/actions/streamings";
import { AssinaturaWizard } from "@/components/assinaturas/AssinaturaWizard";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Nova Assinatura | StreamShare",
    description: "Crie novas assinaturas de forma simples e rápida.",
};

export default async function NovoAssinaturaPage() {
    const [participantesRes, streamingsRes] = await Promise.all([
        getParticipantes(),
        getStreamings(),
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
        />
    );
}
