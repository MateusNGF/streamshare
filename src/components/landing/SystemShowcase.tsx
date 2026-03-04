"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShowcaseItem {
    id: number;
    src: string;
    title: string;
    desc: string;
}

interface SystemShowcaseProps {
    items: ShowcaseItem[];
    badge?: string;
    mainTitle?: ReactNode;
    browserUrl?: string;
}

export function SystemShowcase({
    items,
    badge = "✨ Por dentro do sistema",
    mainTitle,
    browserUrl = "app.streamshare.com.br"
}: SystemShowcaseProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    }, [items.length]);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    // Autoplay
    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000); // Troca a cada 5 segundos
        return () => clearInterval(timer);
    }, [nextSlide]);

    if (!items || items.length === 0) return null;

    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">

                {/* Lado Esquerdo: Textos e Controle */}
                <div className="w-full md:w-1/3 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium text-sm">
                        {badge}
                    </div>

                    {mainTitle || (
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                            Design focado na sua <span className="text-primary">economia de tempo</span>
                        </h2>
                    )}

                    <div className="min-h-[100px]">
                        <h3 className="text-xl font-semibold text-gray-800 transition-all">
                            {items[currentIndex].title}
                        </h3>
                        <p className="text-gray-600 mt-2 transition-all">
                            {items[currentIndex].desc}
                        </p>
                    </div>

                    {/* Controles Manuais */}
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            onClick={prevSlide}
                            className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 hover:text-primary transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 hover:text-primary transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>

                        {/* Dots */}
                        <div className="flex gap-2 ml-4">
                            {items.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={cn(
                                        "h-2 rounded-full transition-all duration-300",
                                        idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-gray-300 hover:bg-gray-400"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lado Direito: Mockup do Sistema (Browser Window) */}
                <div className="w-full md:w-2/3 relative">
                    <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-gray-200/50 bg-white">
                        {/* Topbar do Fake Browser */}
                        <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            <div className="mx-auto bg-white px-8 sm:px-32 py-1 rounded-md text-[10px] text-gray-400 font-mono shadow-sm hidden sm:block truncate max-w-[200px] sm:max-w-none">
                                {browserUrl}
                            </div>
                        </div>

                        {/* Imagem do Sistema */}
                        <div className="relative aspect-[16/10] w-full bg-gray-50 overflow-hidden">
                            {items.map((screen, idx) => (
                                <div
                                    key={screen.id}
                                    className={cn(
                                        "absolute inset-0 transition-opacity duration-700 ease-in-out",
                                        idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                                    )}
                                >
                                    <Image
                                        src={screen.src}
                                        alt={screen.title}
                                        fill
                                        className="object-cover object-top"
                                        priority={idx === 0} // Apenas a primeira carrega mais rápido
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Efeito de brilho de fundo para dar visual "tech" */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-purple-400/20 blur-3xl -z-10 rounded-3xl"></div>
                </div>

            </div>
        </div>
    );
}
