"use client";
import { Mail, MessageSquare, Play } from "lucide-react";

interface TestsTabProps {
    onTestSmtp: () => void;
    onTestWhatsApp: () => void;
    testing: boolean;
}

export function TestsTab({ onTestSmtp, onTestWhatsApp, testing }: TestsTabProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
            {/* SMTP Test Card */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-[32px] p-8 flex flex-col gap-6 hover:shadow-xl hover:shadow-primary/5 transition-all group">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Mail size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Teste de E-mail (SMTP)</h3>
                        <p className="text-sm text-muted-foreground">Verificar se as credenciais no .env estão funcionando</p>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border/50">
                    <button
                        onClick={onTestSmtp}
                        disabled={testing}
                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-accent text-white px-6 py-4 rounded-2xl font-bold transition-all disabled:opacity-50"
                    >
                        <Play size={20} className={testing ? "animate-pulse" : ""} />
                        {testing ? "Testando..." : "Testar Conexão SMTP"}
                    </button>
                </div>
            </div>

            {/* WhatsApp Test Card */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-[32px] p-8 flex flex-col gap-6 hover:shadow-xl hover:shadow-primary/5 transition-all group">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform">
                        <MessageSquare size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Teste de WhatsApp</h3>
                        <p className="text-sm text-muted-foreground">Verificar conexão com a API do Twilio via .env</p>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border/50">
                    <button
                        onClick={onTestWhatsApp}
                        disabled={testing}
                        className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-4 rounded-2xl font-bold transition-all disabled:opacity-50"
                    >
                        <Play size={20} className={testing ? "animate-pulse" : ""} />
                        {testing ? "Testando..." : "Testar Conexão WhatsApp"}
                    </button>
                </div>
            </div>
        </div>
    );
}
