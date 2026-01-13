interface RecentSubscriptionProps {
    name: string;
    streaming: string;
    value: string;
    status: "Ativa" | "Em atraso";
}

export function RecentSubscription({ name, streaming, value, status }: RecentSubscriptionProps) {
    const initial = name.charAt(0).toUpperCase();

    return (
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-violet-100 text-primary flex items-center justify-center font-semibold">
                    {initial}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900">{name}</h4>
                    <p className="text-sm text-gray-500">{streaming}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-semibold text-gray-900">R$ {value}</p>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${status === "Ativa" ? "text-green-500" : "text-amber-500"
                    }`}>
                    ● {status}
                </span>
            </div>
        </div>
    );
}
