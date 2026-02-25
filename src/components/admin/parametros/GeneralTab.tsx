import { Input } from "@/components/ui/Input";
import { Settings, Globe, Clock, Coins } from "lucide-react";

interface GeneralTabProps {
    config: {
        appName: string;
        baseUrl: string;
        timezone: string;
        currency: string;
    };
    onChange: (config: any) => void;
}

export function GeneralTab({ config, onChange }: GeneralTabProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div className="bg-gradient-to-br from-white to-gray-50/30 backdrop-blur-xl border border-white rounded-[28px] p-6 lg:p-7 shadow-xl shadow-black/[0.02] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                    <Settings size={140} />
                </div>

                <div className="flex items-center gap-4 mb-7 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Settings size={22} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black tracking-tight">Configurações Base</h3>
                        <p className="text-xs text-muted-foreground font-medium">Identidade e regionalização da plataforma</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 relative z-10">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Nome da Marca</label>
                        <Input
                            icon={<Settings size={16} />}
                            value={config.appName}
                            onChange={(e) => onChange({ ...config, appName: e.target.value })}
                            placeholder="StreamShare"
                            className="bg-white/40 border-white/60 shadow-inner focus:bg-white transition-all h-11 rounded-xl text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">URL da Plataforma</label>
                        <Input
                            icon={<Globe size={16} />}
                            type="url"
                            value={config.baseUrl}
                            onChange={(e) => onChange({ ...config, baseUrl: e.target.value })}
                            placeholder="https://streamshare.com"
                            className="bg-white/40 border-white/60 shadow-inner focus:bg-white transition-all h-11 rounded-xl text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Fuso Horário</label>
                        <Input
                            icon={<Clock size={16} />}
                            value={config.timezone}
                            onChange={(e) => onChange({ ...config, timezone: e.target.value })}
                            placeholder="America/Sao_Paulo"
                            className="bg-white/40 border-white/60 shadow-inner focus:bg-white transition-all h-11 rounded-xl text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Moeda Local</label>
                        <Input
                            icon={<Coins size={16} />}
                            value={config.currency}
                            onChange={(e) => onChange({ ...config, currency: e.target.value })}
                            placeholder="BRL"
                            className="bg-white/40 border-white/60 shadow-inner focus:bg-white transition-all h-11 rounded-xl text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
