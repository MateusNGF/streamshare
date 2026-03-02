import { validateInviteToken } from "@/actions/invites";
import { getCurrentUser } from "@/lib/auth";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { CheckCircle, ShieldCheck } from "lucide-react";
import { redirect, notFound } from "next/navigation";
import { AcceptInviteButton } from "./AcceptInviteButton";
import { JoinStreamingForm } from "@/components/public/JoinStreamingForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Aceitar Convite | StreamShare",
    description: "Você foi convidado para participar de um streaming no StreamShare.",
};

export default async function ConvitePage({
    params
}: {
    params: { token: string }
}) {
    const response = await validateInviteToken(params.token);

    if (!response.success || !response.data) {
        notFound();
    }

    const invite = response.data;
    const user = await getCurrentUser();

    if (!user) {
        redirect(`/login?callbackUrl=/convite/${params.token}`);
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-8 md:p-10 text-center relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                    <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />

                    <div className="relative">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-primary shadow-inner">
                            <CheckCircle size={40} />
                        </div>

                        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Você foi convidado!</h1>
                        <p className="text-gray-500 mb-8 font-medium leading-relaxed">
                            <span className="font-bold text-gray-800">{invite.conta.nome}</span> convidou você para
                            {invite.streamingId ? " assinar o serviço de streaming a seguir:" : " participar da conta deles no StreamShare."}
                        </p>

                        {invite.streaming ? (
                            <div className="text-left mt-8">
                                <div className="bg-gray-50/50 rounded-3xl p-6 mb-6 border border-gray-100 flex items-center gap-4 group">
                                    <StreamingLogo
                                        name={invite.streaming.catalogo.nome}
                                        color={invite.streaming.catalogo.corPrimaria}
                                        iconeUrl={invite.streaming.catalogo.iconeUrl}
                                        size="lg"
                                        className="shadow-md"
                                    />
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 leading-tight">
                                            {invite.streaming.apelido || invite.streaming.catalogo.nome}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {Number(invite.streaming.valorIntegral) / invite.streaming.limiteParticipantes > 0 ? "Requer pagamento" : "Vaga pronta disponível"}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4">
                                    <JoinStreamingForm
                                        token={invite.streaming.publicToken} // Important: We pass the publicToken to reuse the form logic that expects a public token for now, or adapt it.
                                        streamingName={invite.streaming.apelido || invite.streaming.catalogo.nome}
                                        valorPorVaga={Number(invite.streaming.valorIntegral) / invite.streaming.limiteParticipantes}
                                        enabledFrequencies={invite.streaming.frequenciasHabilitadas}
                                        loggedUser={{
                                            userId: user.userId,
                                            nome: user.nome,
                                            email: user.email,
                                            whatsappNumero: "", // fetched separately if needed
                                            cpf: "" // Can't fetch from user directly, JoinStreamingForm will ask or get from Participante Table internally if adapted
                                        }}
                                        vagasRestantes={1} // Assuming 1 slot is guaranteed by the invite
                                        isPrivateInvite={true}
                                        privateInviteToken={params.token}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 text-center mt-8">
                                <AcceptInviteButton token={params.token} />

                                <p className="text-xs text-gray-400 font-medium px-4">
                                    Ao aceitar, você concorda com os <span className="text-primary hover:underline cursor-pointer">Termos de Uso</span> e que seus dados de perfil sejam compartilhados com o host.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
                    <ShieldCheck size={16} />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Powered by StreamShare Secure</span>
                </div>
            </div>
        </div>
    );
}
