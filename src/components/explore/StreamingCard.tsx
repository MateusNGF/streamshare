import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { Users, Globe, ExternalLink } from "lucide-react";
import { StreamingActionButton } from "@/components/explore/StreamingActionButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";

interface StreamingCardProps {
    streaming: {
        id: number;
        apelido: string | null;
        valorIntegral: number;
        limiteParticipantes: number;
        vagasDisponiveis: number;
        catalogo: {
            nome: string;
            iconeUrl: string | null;
            corPrimaria: string;
        };
        conta: {
            nome: string;
        };
        isOwner?: boolean;
        userStatus?: 'participando' | 'solicitado' | 'convidado' | 'recusado' | null;
    };
}

export function StreamingCard({ streaming }: StreamingCardProps) {
    const { format } = useCurrency();
    const valorPorVaga = streaming.valorIntegral / streaming.limiteParticipantes;
    const occupiedSlots = streaming.limiteParticipantes - streaming.vagasDisponiveis;
    const percentage = (occupiedSlots / streaming.limiteParticipantes) * 100;
    const name = streaming.apelido || streaming.catalogo.nome;

    return (
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-[32px] border border-white/20 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all group relative overflow-hidden flex flex-col h-full hover:-translate-y-1 duration-300">
            {/* Top Row: Logo & Host Info */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex w-full justify-between gap items-center gap-4">
                    <div className="relative">
                        <StreamingLogo
                            name={streaming.catalogo.nome}
                            color={streaming.catalogo.corPrimaria}
                            iconeUrl={streaming.catalogo.iconeUrl}
                            size="lg"
                            rounded="2xl"
                            className="w-16 h-16 text-2xl shadow-xl z-10 relative group-hover:scale-105 transition-transform"
                        />
                        <div
                            className="absolute inset-0 blur-2xl opacity-20 rounded-full -z-0"
                            style={{ backgroundColor: streaming.catalogo.corPrimaria }}
                        />
                    </div>
                    <div className="flex flex-col  justify-between w-full">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-lg md:text-xl line-clamp-1">{name}</h3>
                            <Tooltip content="Mural Público (Visível para todos)">
                                <div className="p-1 rounded-full bg-primary/5 text-primary border border-primary/20">
                                    <Globe size={12} />
                                </div>
                            </Tooltip>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                            HOST: {streaming.conta.nome}
                        </p>
                    </div>
                </div>
            </div>

            {/* Middle Section: Progress & Financial */}
            <div className="space-y-4 flex-1">
                <div className="space-y-3">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-sm text-gray-700">
                            <Users size={14} className="text-primary" />
                            <span>{occupiedSlots}/{streaming.limiteParticipantes} <span className="text-gray-400 font-medium text-xs">vagas</span></span>
                        </div>
                        <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider",
                            streaming.vagasDisponiveis === 0 ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                        )}>
                            {streaming.vagasDisponiveis > 0 ? `${streaming.vagasDisponiveis} LIVRES` : "LOTADO"}
                        </span>
                    </div>

                    <div className="w-full h-3 bg-gray-50 rounded-full border border-gray-100 p-0.5 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                            style={{
                                width: `${percentage}%`,
                                backgroundColor: streaming.catalogo.corPrimaria || 'var(--primary)',
                                backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)'
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between py-2 px-3 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="flex flex-row justify-between items-center w-full ">
                            <span className="text-[9px] text-primary/60 font-black uppercase tracking-tighter">Valor mensal p/ pessoa</span>
                            <span className="text-lg font-black text-primary tracking-tight">
                                {format(valorPorVaga)}
                            </span>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom Row: Actions */}
            <div className="mt-8">
                <StreamingActionButton
                    streamingId={streaming.id}
                    vagasDisponiveis={streaming.vagasDisponiveis}
                    isOwner={streaming.isOwner}
                    userStatus={streaming.userStatus}
                />
            </div>
        </div>
    );
}
