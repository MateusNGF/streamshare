import { getStreamingByPublicToken } from "@/actions/streamings";
import { JoinStreamingForm } from "@/components/public/JoinStreamingForm";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { PublicStreamingHeader, PublicStreamingDetails, PublicStreamingFooter } from "@/components/public/StreamingInfoCards";
import { Shield } from "lucide-react";

async function getLoggedUserStats(userId: number) {
    const fullUser = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { nome: true, email: true, whatsappNumero: true }
    });

    const stats = {
        userId,
        nome: fullUser?.nome || "",
        email: fullUser?.email || "",
        whatsappNumero: fullUser?.whatsappNumero || "",
        cpf: ""
    };

    const participante = await prisma.participante.findFirst({
        where: { userId },
        select: { cpf: true, whatsappNumero: true }
    });

    if (participante) {
        stats.cpf = participante.cpf || "";
        if (!stats.whatsappNumero) stats.whatsappNumero = participante.whatsappNumero || "";
    }

    return stats;
}

export default async function PublicJoinPage({ params }: { params: { token: string } }) {
    const user = await getCurrentUser();
    const response = await getStreamingByPublicToken(params.token);

    if (!response.success || !response.data) {
        notFound();
    }

    const streaming = response.data as any;

    if (!user) {
        return redirect(`/login?mode=signup&callbackUrl=/assinar/${params.token}`);
    }

    const userStats = await getLoggedUserStats(user.userId);
    const valorPorPessoa = Number(streaming.valorIntegral) / streaming.limiteParticipantes;

    return (
        <div className="min-h-screen bg-white md:bg-gray-50 flex flex-col items-center py-6 md:py-20 px-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 via-primary/2 to-transparent -z-10 blur-3xl" />

            <div className="max-w-4xl w-full space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <PublicStreamingHeader streaming={streaming} />

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                    <div className="md:col-span-3 h-full">
                        <PublicStreamingDetails
                            streaming={streaming}
                            valorPorPessoa={valorPorPessoa}
                        />
                    </div>

                    {/* Form Card */}
                    <div className="md:col-span-2 bg-white rounded-[2rem] p-6 md:p-8 shadow-2xl shadow-primary/5 border border-primary/10 ring-8 ring-primary/[0.02] relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-primary/20 text-primary text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-sm flex items-center gap-1.5">
                            <Shield size={10} fill="currentColor" className="opacity-20" />
                            Checkout Seguro
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            Finalizar Inscrição
                        </h2>
                        <JoinStreamingForm
                            token={params.token}
                            streamingName={streaming.apelido || streaming.catalogo?.nome}
                            valorPorVaga={valorPorPessoa}
                            enabledFrequencies={streaming.frequenciasHabilitadas}
                            loggedUser={userStats}
                            vagasRestantes={streaming.vagasRestantes}
                        />
                    </div>
                </div>

                <PublicStreamingFooter contaNome={streaming.conta?.nome} />
            </div>
        </div>
    );
}
