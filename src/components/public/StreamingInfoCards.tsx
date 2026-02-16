"use client";

import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { Badge } from "@/components/ui/Badge";
import { useCurrency } from "@/hooks/useCurrency";
import { ShieldCheck, Users, Zap, CheckCircle2, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreamingHeaderProps {
    streaming: any;
}

export function PublicStreamingHeader({ streaming }: StreamingHeaderProps) {
    return (
        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row items-center gap-6 md:gap-10 transition-all hover:shadow-2xl hover:shadow-primary/5">
            <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all scale-110" />
                <div className="relative transform group-hover:scale-105 transition-transform duration-500">
                    <StreamingLogo
                        name={streaming.catalogo?.nome || ""}
                        iconeUrl={streaming.catalogo?.iconeUrl}
                        color={streaming.catalogo?.corPrimaria}
                        size="lg"
                        className="w-16 h-16 md:w-24 md:h-24 [&>img]:w-10 md:[&>img]:w-14"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-primary text-white text-[10px] md:text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl ring-4 ring-white">
                        {streaming.catalogo?.nome}
                    </div>
                </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-3">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
                        {streaming.apelido || streaming.catalogo?.nome}
                    </h1>
                    {streaming.vagasRestantes > 0 ? (
                        <Badge variant="success" className="bg-emerald-50 text-emerald-600 border-emerald-100 px-4 py-1.5 rounded-full font-bold animate-pulse">
                            Vagas Abertas
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-100 px-4 py-1.5 rounded-full font-bold">
                            Vagas Esgotadas
                        </Badge>
                    )}
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-gray-500 font-medium md:text-lg">
                    <p className="flex items-center justify-center md:justify-start gap-2">
                        <Users size={20} className="text-primary" />
                        Grupo Gerenciado
                    </p>
                    <span className="hidden md:inline text-gray-300">•</span>
                    <p className="flex items-center justify-center md:justify-start gap-2 text-blue-600">
                        <Zap size={20} fill="currentColor" />
                        Ativação após Pagamento
                    </p>
                </div>
            </div>
        </div>
    );
}

interface StreamingDetailsCardProps {
    streaming: any;
    valorPorPessoa: number;
}

export function PublicStreamingDetails({ streaming, valorPorPessoa }: StreamingDetailsCardProps) {
    const { format } = useCurrency();
    const valorIntegral = Number(streaming.valorIntegral);
    const economia = ((valorIntegral - valorPorPessoa) / valorIntegral) * 100;

    return (
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl shadow-gray-200/40 border border-gray-100 space-y-8 h-full flex flex-col">
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <ShieldCheck size={20} />
                    </div>
                    Por que escolher este grupo?
                </h2>

                {/* Savings Badge */}
                <div className="relative overflow-hidden bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex items-center justify-between group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="space-y-1 relative z-10">
                        <p className="text-emerald-800 font-black text-2xl">Economize {Math.round(economia)}%</p>
                        <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest">Comparado à assinatura individual</p>
                    </div>
                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-emerald-100 relative z-10">
                        <TrendingDown className="text-emerald-500" size={24} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                        <div className="space-y-0.5">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Assinatura Individual</span>
                            <p className="text-gray-400 line-through font-medium">{format(valorIntegral)}</p>
                        </div>
                        <div className="text-right space-y-0.5">
                            <span className="text-xs font-black text-primary uppercase tracking-tighter">Sua Cota</span>
                            <p className="text-3xl font-black text-primary tracking-tight">
                                {format(valorPorPessoa)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <div className={cn(
                        "flex items-center gap-4 text-sm font-medium transition-all p-3 rounded-2xl border border-transparent",
                        streaming.vagasRestantes === 0 ? "bg-red-50/50 border-red-100 text-red-700" : "text-gray-700"
                    )}>
                        <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                            streaming.vagasRestantes === 0 ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600"
                        )}>
                            <Users size={20} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className={streaming.vagasRestantes === 0 ? "font-bold text-red-900" : ""}>
                                {streaming.vagasRestantes === 0 ? "Vagas Esgotadas" : "Vagas Limitadas"}
                            </span>
                            <span className={cn(
                                "text-xs font-medium",
                                streaming.vagasRestantes === 0 ? "text-red-500" : "text-gray-400"
                            )}>
                                {streaming.vagasRestantes} de {streaming.limiteParticipantes} restantes
                            </span>
                        </div>
                        {streaming.vagasRestantes === 0 && (
                            <div className="ml-auto">
                                <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">Lotado</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 size={20} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span>Segurança Garantida</span>
                            <span className="text-xs text-gray-400">Dados protegidos pela StreamShare</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-50">
                <div className="bg-gray-900 rounded-2xl p-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Setup Automático</span>
                    </div>
                    <span className="text-xs font-black">Pronto para Login</span>
                </div>
            </div>
        </div>
    );
}

export function PublicStreamingFooter({ contaNome }: { contaNome?: string }) {
    return (
        <div className="text-center transition-all duration-300 py-10">
            <div className="flex flex-col items-center gap-4 opacity-50 hover:opacity-100">
                <div className="h-px w-20 bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-2" />
                <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                    Este grupo é mantido de forma independente por <strong className="text-gray-900">{contaNome || "Membro StreamShare"}</strong> e monitorado para garantir qualidade.
                </p>
                <div className="flex items-center gap-2 mt-2">
                    <ShieldCheck size={16} className="text-primary" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Proteção StreamShare</span>
                </div>
            </div>
        </div>
    );
}
