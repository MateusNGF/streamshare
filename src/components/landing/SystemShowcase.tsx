"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
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
    browserUrl = process.env.NEXT_PUBLIC_URL
}: SystemShowcaseProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    }, [items.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }, [items.length]);

    useEffect(() => {
        if (isZoomed) return;
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, [nextSlide, isZoomed]);

    // Keyboard support
    useEffect(() => {
        if (!isZoomed) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsZoomed(false);
            if (e.key === "ArrowRight") nextSlide();
            if (e.key === "ArrowLeft") prevSlide();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isZoomed, nextSlide, prevSlide]);

    // Bloquear scroll quando estiver com zoom
    useEffect(() => {
        if (isZoomed) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isZoomed]);

    if (!items || items.length === 0) return null;

    return (
        <div className="w-full max-w-7xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-16">

                {/* Lado Esquerdo: Textos e Controle */}
                <div className="w-full lg:w-[30%] space-y-6">
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
                <div className="w-full lg:w-[70%] relative">
                    <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-gray-200/50 bg-white">
                        {/* Topbar do Fake Browser */}
                        <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            <div className="mx-auto bg-white px-8 sm:px-32 py-1 rounded-md text-[10px] text-gray-400 font-mono shadow-sm hidden sm:block truncate max-w-[200px] sm:max-w-none">
                                {browserUrl}
                            </div>
                            <button
                                onClick={() => setIsZoomed(true)}
                                className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-500 hover:text-primary"
                                title="Ver em tela cheia"
                            >
                                <Maximize2 size={16} />
                            </button>
                        </div>

                        {/* Imagem do Sistema */}
                        <div
                            className="relative aspect-[8/4] w-full bg-white overflow-hidden cursor-pointer group/image"
                            onClick={() => setIsZoomed(true)}
                        >
                            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 transition-colors z-20 flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                                <div className="bg-white backdrop-blur-sm p-3 rounded-full shadow-xl transform scale-90 group-hover/image:scale-100 transition-all duration-300">
                                    <Maximize2 size={24} className="text-primary" />
                                </div>
                            </div>
                            {items.map((screen, idx) => (
                                <div
                                    key={screen.id}
                                    className={cn(
                                        "absolute w-full h-full inset-0 transition-opacity duration-700 ease-in-out",
                                        idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                                    )}
                                >
                                    <Image
                                        src={screen.src}
                                        alt={screen.title}
                                        fill
                                        className="object-contain"
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
            {/* Modal de Zoom/Tela Cheia - Padrão Premium */}
            {isZoomed && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/90 backdrop-blur-xl animate-in fade-in duration-300 p-4 md:p-8"
                    onClick={() => setIsZoomed(false)}
                >
                    {/* Botão Fechar - Top Right flutuante */}
                    <button
                        className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 hover:rotate-90 z-[110] backdrop-blur-md border border-white/10 group"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsZoomed(false);
                        }}
                    >
                        <X size={24} className="group-hover:text-red-400 transition-colors" />
                    </button>

                    {/* Conteúdo Centralizado */}
                    <div
                        className="relative w-full max-w-[95rem] flex flex-col items-center gap-6 md:gap-8 animate-in zoom-in-95 duration-500"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Título e Descrição (Acima da Imagem - Padrão do Componente) */}
                        <div className="w-full flex flex-col items-center text-center space-y-3 px-4">
                            <h3 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-none drop-shadow-lg">
                                {items[currentIndex].title}
                            </h3>
                            <p className="text-gray-300 text-sm md:text-xl max-w-3xl font-medium tracking-tight opacity-90">
                                {items[currentIndex].desc}
                            </p>
                        </div>

                        {/* Mockup do Navegador Redimensionado */}
                        <div className="w-full relative group/modal">
                            <div className="relative rounded-xl md:rounded-3xl overflow-hidden shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 bg-white">
                                {/* Topbar do Fake Browser */}
                                <div className="h-8 md:h-12 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400"></div>
                                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="mx-auto bg-white border border-gray-200 px-10 md:px-20 py-1 rounded-md text-[9px] md:text-xs text-gray-400 font-mono hidden sm:block truncate max-w-xs">
                                        {browserUrl}
                                    </div>
                                </div>

                                {/* Imagem em Alta Resolução */}
                                <div className="relative aspect-[16/10] lg:aspect-video w-full bg-white overflow-hidden">
                                    <Image
                                        src={items[currentIndex].src}
                                        alt={items[currentIndex].title}
                                        fill
                                        className="object-contain"
                                        quality={100}
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Navegação Flutuante Lateral (Sobre a Borda) */}
                            <button
                                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                                className="absolute -left-4 md:-left-8 top-1/2 -translate-y-1/2 p-4 md:p-6 bg-white shadow-2xl text-primary rounded-full hover:scale-110 active:scale-95 transition-all border border-gray-100 flex items-center justify-center z-[120] opacity-100 md:opacity-0 group-hover/modal:opacity-100 transform scale-90 md:scale-100 duration-300"
                            >
                                <ChevronLeft size={32} />
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                className="absolute -right-4 md:-right-8 top-1/2 -translate-y-1/2 p-4 md:p-6 bg-white shadow-2xl text-primary rounded-full hover:scale-110 active:scale-95 transition-all border border-gray-100 flex items-center justify-center z-[120] opacity-100 md:opacity-0 group-hover/modal:opacity-100 transform scale-90 md:scale-100 duration-300"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </div>

                        {/* Footer - Apenas Dots para navegação rápida */}
                        <div className="flex gap-3 pt-2">
                            {items.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                    className={cn(
                                        "h-2 rounded-full transition-all duration-300",
                                        idx === currentIndex
                                            ? "w-12 bg-primary drop-shadow-[0_0_8px_rgba(109,40,217,0.5)]"
                                            : "w-2 bg-white/20 hover:bg-white/40"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
