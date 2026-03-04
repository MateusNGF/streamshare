"use client";

import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { cn } from "@/lib/utils";

interface MarqueeItem {
    nome: string;
    corPrimaria: string;
    iconeUrl?: string | null;
}

interface StreamingMarqueeProps {
    items: MarqueeItem[];
    variant?: "compact" | "full";
    speed?: "slow" | "medium" | "fast";
    pauseOnHover?: boolean;
}

const speedMap = {
    slow: "30s",
    medium: "18s",
    fast: "10s",
};

export function StreamingMarquee({
    items,
    variant = "full",
    speed = "medium",
    pauseOnHover = true,
}: StreamingMarqueeProps) {
    if (!items || items.length === 0) return null;

    const MarqueeSet = ({ prefix }: { prefix: string }) => (
        <div className="flex gap-12 md:gap-20 items-center px-6 md:px-10">
            {items.map((service, idx) => (
                <div
                    key={`${prefix}-${service.nome}-${idx}`}
                    className="group flex items-center gap-4 transition-all duration-500"
                >
                    <div className="relative">
                        <StreamingLogo
                            name={service.nome}
                            color={service.corPrimaria}
                            iconeUrl={service.iconeUrl}
                            size={variant === "compact" ? "md" : "lg"}
                            className={cn(
                                "shadow-lg grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500",
                                variant === "compact" ? "w-10 h-10 md:w-12 md:h-12" : "w-12 h-12 md:w-16 md:h-16"
                            )}
                        />
                        <div
                            className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-20 rounded-full transition-opacity duration-500"
                            style={{ backgroundColor: service.corPrimaria }}
                        />
                    </div>

                    {variant === "full" && (
                        <span className="text-xl md:text-3xl font-black text-gray-300 group-hover:text-gray-900 transition-colors duration-500 font-mono tracking-tighter">
                            {service.nome.toUpperCase()}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className={cn(
            "w-full overflow-hidden bg-white/50 py-10 border-y border-gray-100/50",
            pauseOnHover && "pause-on-hover"
        )}>
            <div className="container mx-auto px-6 mb-8 text-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">
                    Compatível com suas assinaturas favoritas
                </p>
            </div>

            <div className="relative flex overflow-hidden">
                <div
                    className="flex animate-marquee whitespace-nowrap"
                    style={{ animationDuration: speedMap[speed] }}
                >
                    <MarqueeSet prefix="set1" />
                    <MarqueeSet prefix="set2" />
                </div>
            </div>
        </div>
    );
}
