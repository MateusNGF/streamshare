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
            className="bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4"
            role="region"
            aria-label={`${title}: ${value}`}
        >
            <div className="flex items-center justify-between">
                <div className="p-3 bg-gray-50 rounded-2xl text-primary">
                    <Icon size={24} />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    }`}>
                    {trend === "up" ? "↑" : "↓"} {change}
                </div>
            </div>
            <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{value}</h3>
                <p className="text-gray-500 text-sm font-medium mt-1">{title}</p>
            </div>
        </div>
    );
}
