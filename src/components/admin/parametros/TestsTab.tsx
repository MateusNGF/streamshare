import { Mail, MessageSquare, Play, Globe, User, Hash, CheckCircle2, XCircle, Activity, Shield, Mailbox } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";

interface TestsTabProps {
    onTestSmtp: () => void;
    onTestWhatsApp: () => void;
    testing: boolean;
    config?: {
        smtp: {
            host: string;
            port: string;
            user: string;
            secure: string;
            fromEmail: string;
        };
        whatsapp: {
            phoneNumberId: string;
            apiVersion: string;
            enabled: string;
        };
    } | null;
}

export function TestsTab({ onTestSmtp, onTestWhatsApp, testing, config }: TestsTabProps) {
    const renderDisabledInput = (icon: any, label: string, value: string) => (
        <div className="space-y-1 flex-1 min-w-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 px-1">{label}</span>
            <Input
                icon={icon}
                value={value}
                readOnly
                disabled
                className="bg-white/30 border-white/40 text-foreground cursor-not-allowed h-9 rounded-lg font-mono text-[11px] opacity-100 py-0"
            />
        </div>
    );

    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 gap-3 p-3 bg-white/20 rounded-2xl animate-pulse">
            <Skeleton className="h-9 w-full rounded-lg" />
            <div className="flex gap-3">
                <Skeleton className="h-9 w-1/2 rounded-lg" />
                <Skeleton className="h-9 w-1/2 rounded-lg" />
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-1">
            {/* SMTP Test Card */}
            <div className="relative group bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-xl border border-white rounded-[28px] p-6 lg:p-7 flex flex-col gap-6 shadow-xl shadow-black/[0.02] hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                    <Mail size={160} />
                </div>

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Mail size={22} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tight leading-none mb-1">E-mail (SMTP)</h3>
                            <p className="text-xs text-muted-foreground font-medium">Infraestrutura SMTP</p>
                        </div>
                    </div>
                    {config && (
                        <div className="animate-in fade-in zoom-in duration-500">
                            {config.smtp.secure === "true" ? (
                                <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black border border-emerald-100/50 uppercase tracking-wider">
                                    <CheckCircle2 size={10} strokeWidth={3} /> SSL Ativo
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black border border-amber-100/50 uppercase tracking-wider">
                                    <XCircle size={10} strokeWidth={3} /> S/ SSL
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="relative z-10 flex-1">
                    {!config ? <LoadingSkeleton /> : (
                        <div className="grid grid-cols-1 gap-4 bg-white/40 backdrop-blur-sm p-4 rounded-3xl border border-white shadow-inner h-full">
                            <div className="flex items-center gap-2 mb-0.5">
                                <Shield size={12} className="text-primary/40" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Dados da Conexão</span>
                            </div>

                            <div className="grid grid-cols-1 gap-2.5">
                                {renderDisabledInput(<Globe size={14} />, "Host Gateway", config.smtp.host)}
                                <div className="flex gap-3">
                                    {renderDisabledInput(<Hash size={14} />, "Porta", config.smtp.port)}
                                    {renderDisabledInput(<User size={14} />, "Usuário", config.smtp.user)}
                                </div>
                                {renderDisabledInput(<Mailbox size={14} />, "Remetente", config.smtp.fromEmail)}
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-2 relative z-10">
                    <Button
                        variant="default"
                        onClick={onTestSmtp}
                        disabled={testing || !config}
                        className="w-full group/btn overflow-hidden relative justify-center"
                        size="lg"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                        <Play size={20} className={testing ? "animate-pulse" : "group-hover/btn:translate-x-1 transition-transform"} />
                        {testing ? "EXECUTANDO..." : "TESTAR CONEXÃO SMTP"}
                    </Button>
                    <div className="flex items-center justify-between mt-3 px-1">
                        <span className="text-[8px] text-muted-foreground/40 font-black uppercase tracking-widest">
                            TLS: {config?.smtp.secure === 'true' ? 'ON' : 'OFF'}
                        </span>
                        <span className="text-[8px] text-muted-foreground/40 font-black uppercase tracking-widest">
                            {process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV'} ENV
                        </span>
                    </div>
                </div>
            </div>

            {/* WhatsApp Test Card */}
            <div className="relative group bg-gradient-to-br from-white to-[#25D366]/5 backdrop-blur-xl border border-white rounded-[28px] p-6 lg:p-7 flex flex-col gap-6 shadow-xl shadow-black/[0.02] hover:shadow-2xl hover:shadow-[#25D366]/5 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity text-[#25D366] pointer-events-none">
                    <MessageSquare size={160} />
                </div>

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] shadow-inner">
                            <MessageSquare size={22} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tight leading-none mb-1">WhatsApp (Meta Cloud)</h3>
                            <p className="text-xs text-muted-foreground font-medium">Gateway Meta Cloud API v{process.env.WHATSAPP_API_VERSION ?? "v21.0"}</p>
                        </div>
                    </div>
                    {config && (
                        <div className="animate-in fade-in zoom-in duration-500">
                            {config.whatsapp.enabled === "true" ? (
                                <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black border border-emerald-100/50 uppercase tracking-wider">
                                    <Activity size={10} className="animate-pulse" strokeWidth={3} /> Ativo
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black border border-rose-100/50 uppercase tracking-wider">
                                    <XCircle size={10} strokeWidth={3} /> Inativo
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="relative z-10 flex-1">
                    {!config ? <LoadingSkeleton /> : (
                        <div className="grid grid-cols-1 gap-4 bg-white/40 backdrop-blur-sm p-4 rounded-3xl border border-white shadow-inner h-full">
                            <div className="flex items-center gap-2 mb-0.5">
                                <Shield size={12} className="text-[#25D366]/40" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Credenciais API</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2.5">
                                {renderDisabledInput(<Hash size={14} />, "Phone Number ID", config.whatsapp.phoneNumberId)}
                                {renderDisabledInput(<Globe size={14} />, "API Version", config.whatsapp.apiVersion)}
                                <div className="mt-1 flex items-center gap-2 py-2 px-3 bg-[#25D366]/5 rounded-xl border border-[#25D366]/10">
                                    <Activity size={10} className="text-[#25D366]" />
                                    <span className="text-[9px] text-[#128C7E] font-bold">Status: Serviço Operacional</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-2 relative z-10">
                    <Button
                        variant="default"
                        onClick={onTestWhatsApp}
                        disabled={testing || !config}
                        className="w-full bg-[#25D366] hover:bg-[#128C7E] shadow-[#25D366]/20 group/btn overflow-hidden relative justify-center"
                        size="lg"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                        <Play size={20} className={testing ? "animate-pulse" : "group-hover/btn:translate-x-1 transition-transform"} />
                        {testing ? "DIAGNÓSTICO..." : "TESTAR CONEXÃO WHATSAPP"}
                    </Button>
                    <div className="flex items-center justify-between mt-3 px-1">
                        <span className="text-[8px] text-muted-foreground/40 font-black uppercase tracking-widest">
                            INTEGRAÇÃO: {config?.whatsapp.enabled === 'true' ? 'ON' : 'OFF'}
                        </span>
                        <span className="text-[8px] text-muted-foreground/40 font-black uppercase tracking-widest">
                            API Gateway v2.0
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
