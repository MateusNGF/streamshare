"use client";

interface FaturamentoErrorProps {
    error?: string;
}

export function FaturamentoError({ error }: FaturamentoErrorProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] p-8">
            <div className="bg-red-50 p-6 rounded-[32px] border border-red-100 flex flex-col items-center text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h1 className="text-2xl font-black text-red-900 tracking-tight mb-2">Ops! Algo deu errado</h1>
                <p className="text-red-700/70 font-medium">{error || "Não conseguimos carregar os dados da sua carteira no momento."}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-8 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                    Tentar Novamente
                </button>
            </div>
        </div>
    );
}
