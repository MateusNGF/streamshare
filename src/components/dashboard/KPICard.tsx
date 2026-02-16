import { LucideIcon } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string;
    change: string;
    icon: LucideIcon;
    trend: "up" | "down";
    index?: number;
}

export function KPICard({ title, value, change, icon: Icon, trend, index = 0 }: KPICardProps) {
    const shadowColor = trend === 'up' ? 'shadow-green-500/10' : 'shadow-red-500/10';
    const blobColor = trend === 'up' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div
            className={`relative overflow-hidden h-full bg-white/70 backdrop-blur-xs border border-white/20 rounded-[32px] p-7 shadow-sm hover:shadow-xl ${shadowColor} hover:-translate-y-1.5 transition-all duration-500 group animate-scale-in flex flex-col justify-between cursor-default`}
            style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
            role="region"
            aria-label={`${title}: ${value}`}
        >
            {/* Efeito decorativo de fundo */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700 ${blobColor}`} />

            <div className="relative flex items-center justify-between">
                <div className="p-4 bg-gray-50/50 rounded-2xl text-primary transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-primary/5 shadow-sm">
                    <Icon size={24} />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 transition-colors ${trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    }`}>
                    {trend === "up" ? (
                        <span className="animate-bounce-subtle">↑</span>
                    ) : (
                        <span>↓</span>
                    )}
                    {change}
                </div>
            </div>
            <div className="relative">
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-2">{value}</h3>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
            </div>
        </div>
    );
}
