"use client";

import { StreamingLogo } from "@/components/ui/StreamingLogo";

interface LoteCompositionStripProps {
    cobrancas: any[];
    total: number;
    format: (val: number) => string;
}

export function LoteCompositionStrip({ cobrancas, total, format }: LoteCompositionStripProps) {
    if (!cobrancas || cobrancas.length === 0) return null;

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {cobrancas.map((c: any, i: number) => (
                <div
                    key={c.id}
                    className="flex items-center flex-shrink-0 animate-in fade-in zoom-in-75 fill-mode-both"
                    style={{ animationDelay: `${i * 100}ms` }}
                >
                    <StreamingLogo
                        name={c.assinatura.streaming.catalogo.nome}
                        iconeUrl={c.assinatura.streaming.catalogo.iconeUrl}
                        color={c.assinatura.streaming.catalogo.corPrimaria}
                        size="sm"
                        rounded="lg"
                        className="ring-2 ring-white shadow-sm"
                    />
                    {i < cobrancas.length - 1 && (
                        <span className="mx-1.5 text-zinc-300 font-black">+</span>
                    )}
                </div>
            ))}
        </div>
    );
}
