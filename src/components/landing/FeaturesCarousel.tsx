"use client";

import { useRef, useState, useEffect } from "react";
import {
    HeartHandshake,
    Shield,
    TrendingUp,
    Lock,
    Zap,
    Bell,
    Smartphone,
    BarChart3,
    Award,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        icon: HeartHandshake,
        title: 'Cobrança sem "Climão"',
        desc: "O sistema cobra seus amigos automaticamente. Você não precisa mais ser o 'chato' que fica pedindo dinheiro no grupo.",
    },
    {
        icon: Shield,
        title: "Fim do Calote",
        desc: "Reduza a inadimplência a zero. Com lembretes programados, ninguém mais 'esquece' de pagar a parte dele.",
    },
    {
        icon: TrendingUp,
        title: "Lucro no Piloto Automático",
        desc: "Visualize sua economia crescendo enquanto o sistema gerencia tudo sozinho. O dinheiro cai na conta, sem esforço.",
    },
    {
        icon: Lock,
        title: "Blindagem de Dados",
        desc: "Segurança de nível bancário. Seus dados financeiros e de seus amigos são protegidos com criptografia de ponta.",
    },
    {
        icon: Zap,
        title: "Organização em 1 Clique",
        desc: "Painel intuitivo para gerenciar Netflix, Spotify e outros em um só lugar. Adeus planilhas confusas e anotações perdidas.",
    },
    {
        icon: Bell,
        title: "Notificações que Funcionam",
        desc: "Lembretes enviados onde as pessoas realmente vêem: no WhatsApp. Aumente a taxa de pagamento em até 90%.",
    },
    {
        icon: Smartphone,
        title: "Controle na Palma da Mão",
        desc: "Acesse de qualquer lugar. Seu painel de controle otimizado para celular, tablet ou computador.",
    },
    {
        icon: BarChart3,
        title: "Transparência Total",
        desc: "Histórico detalhado de quem pagou e quem deve. Acabe com as dúvidas e o 'disse-que-me-disse' nos grupos.",
    },
    {
        icon: Award,
        title: "Suporte Especializado",
        desc: "Dúvidas na configuração? Nosso time de especialistas te ajuda a começar em menos de 5 minutos.",
    },
];

export function FeaturesCarousel() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth } = scrollContainerRef.current;
            const index = Math.round(scrollLeft / clientWidth);
            setActiveIndex(index);
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
            return () => container.removeEventListener("scroll", handleScroll);
        }
    }, []);

    const scrollTo = (index: number) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const width = container.clientWidth;
            container.scrollTo({
                left: width * index,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="relative">
            {/* Carousel Container */}
            <div
                ref={scrollContainerRef}
                className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible gap-6 md:gap-8 pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-auto md:px-0"
            >
                {features.map((feature, idx) => (
                    <div
                        key={idx}
                        className="min-w-[85vw] md:min-w-0 snap-center bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 group flex flex-col h-full"
                    >
                        <div className="bg-primary/10 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                            <feature.icon className="text-primary" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            {feature.title}
                        </h3>
                        <p className="text-gray-600 flex-grow">{feature.desc}</p>
                    </div>
                ))}
            </div>

            {/* Pagination Dots (Mobile Only) */}
            <div className="flex justify-center gap-2 mt-6 md:hidden">
                {features.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => scrollTo(idx)}
                        className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            idx === activeIndex ? "w-8 bg-primary" : "w-2 bg-gray-300 hover:bg-gray-400"
                        )}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

            {/* Scroll Hint (Optional - fades out on scroll usually, keeping simple for now) */}
        </div>
    );
}
