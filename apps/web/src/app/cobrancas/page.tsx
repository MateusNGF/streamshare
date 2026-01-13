import { Search, Filter, Download } from "lucide-react";
import { PaymentRow } from "@/components/cobrancas/PaymentRow";

export default function CobrancasPage() {
    return (
        <div className="p-8 pb-12">
            {/* Header */}
            <header className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Cobranças</h1>
                    <p className="text-gray-500 font-medium">Acompanhe os pagamentos e cobranças</p>
                </div>
                <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-2xl font-bold shadow-sm transition-all">
                    <Download size={20} />
                    Exportar
                </button>
            </header>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-8 flex items-center gap-4">
                <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                    <Search size={20} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por participante..."
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-primary text-white rounded-xl font-medium text-sm hover:bg-accent transition-all">
                        Todos
                    </button>
                    <button className="px-4 py-2 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all">
                        Pendentes
                    </button>
                    <button className="px-4 py-2 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all">
                        Atrasados
                    </button>
                    <button className="px-4 py-2 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all">
                        Pagos
                    </button>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                    <Filter size={20} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Total a Receber</p>
                    <p className="text-3xl font-bold text-gray-900">R$ 1.247,80</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Recebido</p>
                    <p className="text-3xl font-bold text-green-600">R$ 892,40</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Pendente</p>
                    <p className="text-3xl font-bold text-amber-600">R$ 285,20</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Atrasado</p>
                    <p className="text-3xl font-bold text-red-600">R$ 70,20</p>
                </div>
            </div>

            {/* Payments List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Cobranças do Mês</h2>
                </div>
                <div>
                    <PaymentRow
                        participant="Maria Silva"
                        streaming="Netflix"
                        value="13.97"
                        dueDate="15/01/2026"
                        status="pago"
                    />
                    <PaymentRow
                        participant="João Santos"
                        streaming="Spotify"
                        value="8.72"
                        dueDate="20/01/2026"
                        status="pago"
                    />
                    <PaymentRow
                        participant="Ana Costa"
                        streaming="Disney+"
                        value="11.30"
                        dueDate="18/01/2026"
                        status="atrasado"
                    />
                    <PaymentRow
                        participant="Pedro Oliveira"
                        streaming="HBO Max"
                        value="9.98"
                        dueDate="25/01/2026"
                        status="pendente"
                    />
                    <PaymentRow
                        participant="Lucas Ferreira"
                        streaming="Amazon Prime"
                        value="7.45"
                        dueDate="30/01/2026"
                        status="pendente"
                    />
                    <PaymentRow
                        participant="Carla Mendes"
                        streaming="YouTube Premium"
                        value="8.97"
                        dueDate="22/01/2026"
                        status="pago"
                    />
                </div>
            </div>
        </div>
    );
}
