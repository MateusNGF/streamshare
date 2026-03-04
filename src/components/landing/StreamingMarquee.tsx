"use client";

import Marquee from "react-fast-marquee";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { cn } from "@/lib/utils";

interface MarqueeItem {
    nome: string;
    corPrimaria: string;
    iconeUrl?: string | null;
}

interface StreamingMarqueeProps {
    items?: MarqueeItem[];
    variant?: "compact" | "full";
    speed?: "slow" | "medium" | "fast";
    pauseOnHover?: boolean;
}

const POPULAR_STREAMINGS: MarqueeItem[] = [
    { nome: "Netflix", corPrimaria: "#E50914", iconeUrl: "https://cdn.simpleicons.org/netflix/white" },
    { nome: "Prime Video", corPrimaria: "#00A8E1", iconeUrl: "https://cdn.simpleicons.org/primevideo/white" },
    { nome: "Disney+", corPrimaria: "#113CCF", iconeUrl: "https://cdn.simpleicons.org/disneyplus/white" },
    { nome: "Max", corPrimaria: "#002BE7", iconeUrl: "https://cdn.simpleicons.org/max/white" },
    { nome: "Spotify", corPrimaria: "#1DB954", iconeUrl: "https://cdn.simpleicons.org/spotify/white" },
    { nome: "YouTube Premium", corPrimaria: "#FF0000", iconeUrl: "https://cdn.simpleicons.org/youtube/white" },
    { nome: "Apple TV+", corPrimaria: "#000000", iconeUrl: "https://cdn.simpleicons.org/appletv/white" },
    { nome: "Crunchyroll", corPrimaria: "#F47521", iconeUrl: "https://cdn.simpleicons.org/crunchyroll/white" },
    { nome: "Globoplay", corPrimaria: "#FF0220", iconeUrl: "https://cdn.simpleicons.org/globoplay/white" },
    { nome: "Paramount+", corPrimaria: "#0064FF", iconeUrl: "https://cdn.simpleicons.org/paramountplus/white" },
    { nome: "Canva Pro", corPrimaria: "#00C4CC", iconeUrl: "https://cdn.simpleicons.org/canva/white" },
    { nome: "Xbox Game Pass", corPrimaria: "#107C10", iconeUrl: "https://cdn.simpleicons.org/xbox/white" },
];

// O react-fast-marquee usa números (pixels por segundo) em vez de duração CSS
const speedMap = {
    slow: 20,
    medium: 40,
    fast: 65,
};

export function StreamingMarquee({
    items = POPULAR_STREAMINGS,
    variant = "full",
    speed = "medium",
    pauseOnHover = true,
}: StreamingMarqueeProps) {
    if (!items || items.length === 0) return null;

    return (
        <section
            aria-label="Plataformas e serviços compatíveis"
            className="w-full overflow-hidden bg-white/50 py-12 border-y border-gray-100/50"
        >
            <div className="container mx-auto px-6 mb-10 text-center">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em]">
                    Compatível com as tuas assinaturas favoritas
                </p>
            </div>

            {/* Máscara de gradiente CSS aplicada por fora do Marquee para o efeito fade-out */}
            <div className="w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <Marquee
                    speed={speedMap[speed]}
                    pauseOnHover={pauseOnHover}
                    gradient={false}
                    className="py-4 overflow-y-hidden"
                >
                    <div className="flex">
                        {items.map((service, idx) => (
                            <div
                                key={`${service.nome}-${idx}`}
                                className="group/item flex items-center gap-4 mx-6 md:mx-10 transition-all duration-500"
                            >
                                <div className="relative">
                                    <StreamingLogo
                                        name={service.nome}
                                        color={service.corPrimaria}
                                        iconeUrl={service.iconeUrl}
                                        size={variant === "compact" ? "md" : "lg"}
                                        className={cn(
                                            "shadow-lg grayscale opacity-60 group-hover/item:grayscale-0 group-hover/item:opacity-100 transition-all duration-500",
                                            variant === "compact" ? "w-10 h-10 md:w-12 md:h-12" : "w-12 h-12 md:w-16 md:h-16"
                                        )}
                                    />
                                    <div
                                        className="absolute inset-0 blur-2xl opacity-0 group-hover/item:opacity-30 rounded-full transition-opacity duration-500 pointer-events-none"
                                        style={{ backgroundColor: service.corPrimaria }}
                                    />
                                </div>

                                {variant === "full" && (
                                    <span className="text-xl md:text-3xl font-black text-gray-400 group-hover/item:text-gray-900 transition-colors duration-500 font-mono tracking-tighter cursor-default">
                                        {service.nome.toUpperCase()}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </Marquee>
            </div>
        </section>
    );
}
