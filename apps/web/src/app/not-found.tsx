"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clapperboard, RefreshCw, Home, AlertCircle } from "lucide-react";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            {/* Film Grain/Noise Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://media.giphy.com/media/oEI9uWUicS3vA0Vv83/giphy.gif')]" />

            {/* Glitchy Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] animate-pulse delay-500" />

            <div className="relative z-10 text-center">
                {/* The "Broken" Element */}
                <div className="mb-12 relative inline-block group">
                    <div className="relative z-10 transition-transform duration-500 group-hover:rotate-12">
                        <Clapperboard size={120} className="text-primary group-hover:text-accent transition-colors" />
                    </div>

                    {/* Glitch text effect */}
                    <div className="absolute -top-8 -right-8 bg-primary/20 backdrop-blur-xl border border-primary/30 px-4 py-2 rounded-lg transform rotate-6 animate-pulse">
                        <span className="text-primary font-mono font-bold">ERROR_CODE: 404</span>
                    </div>

                    <div className="absolute -bottom-4 -left-4 w-24 h-24 border-2 border-white/10 rounded-full animate-ping" />
                </div>

                <h1 className="text-8xl font-black text-white mb-2 tracking-tighter italic">
                    POPCORN <span className="text-primary italic">STUCK</span>!
                </h1>

                <p className="text-2xl font-medium text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
                    Nossa claquete quebrou e o projetor pegou fogo. 🎬🔥
                    <br />
                    Essa página foi deletada da nossa "lista de reprodução".
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link
                        href="/"
                        className="w-full sm:w-auto px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 shadow-2xl"
                    >
                        <Home size={22} />
                        IR PARA O ÍNICIO
                    </Link>

                    <button
                        onClick={() => router.back()}
                        className="w-full sm:w-auto px-10 py-5 bg-transparent border-2 border-white/20 text-white font-black rounded-2xl hover:border-white hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                    >
                        <RefreshCw size={22} className="animate-spin-slow" />
                        TENTAR DE NOVO
                    </button>
                </div>

                {/* Footer Joke */}
                <div className="mt-16 flex items-center justify-center gap-2 text-gray-600">
                    <AlertCircle size={16} />
                    <span className="text-sm font-medium uppercase tracking-widest">
                        Alguém chama o técnico (ou traz mais refrigerante)
                    </span>
                </div>
            </div>

            <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
        </div>
    );
}
