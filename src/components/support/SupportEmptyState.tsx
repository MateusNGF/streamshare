"use client";

import { LayoutList } from "lucide-react";

export function SupportEmptyState() {
    return (
        <div className="h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-white/50 animate-in fade-in duration-700">
            <div className="bg-gray-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border border-gray-100 shadow-sm">
                <LayoutList size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Selecione ou Crie um Chamado</h3>
            <p className="text-gray-500 max-w-sm">
                Pode clicar no botão ao lado para abrir um novo pedido de suporte ou selecionar um da tabela para ver os detalhes da interação.
            </p>
        </div>
    );
}
