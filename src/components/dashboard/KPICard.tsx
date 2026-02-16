import { LucideIcon } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string;
    change: string;
    icon: LucideIcon;
    trend: "up" | "down";
}

export function KPICard({ title, value, change, icon: Icon, trend }: KPICardProps) {
    return (
        <div
            className={`bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 cursor-default
                ${trend === 'up' ? 'hover:shadow-lg hover:shadow-green-500/10' : 'hover:shadow-lg hover:shadow-red-500/10'}
            `}
            role="region"
            aria-label={`${title}: ${value}`}
        >
            <div className="flex items-center justify-between">
                <div className="p-3 bg-gray-50 rounded-2xl text-primary transition-transform group-hover:scale-110">
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
            <div>
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mt-1">{title}</p>
            </div>
        </div>
    );
}
