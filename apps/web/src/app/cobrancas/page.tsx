import { Search, Filter, Download } from "lucide-react";
import { PaymentRow } from "@/components/cobrancas/PaymentRow";
import { getPaymentsData } from "@/actions/payments";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function CobrancasPage() {
    const { assinaturas, stats } = await getPaymentsData();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    };

    return (
        <PageContainer>
            <PageHeader
                title="Cobranças"
                description="Acompanhe os pagamentos e cobranças"
                action={
                    <button
                        aria-label="Exportar relatório de cobranças"
                        className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-2xl font-bold shadow-sm transition-all touch-manipulation"
                    >
                        <Download size={20} />
                        Exportar
                    </button>
                }
            />

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 md:mb-8">
                {/* Search */}
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl mb-3">
                    <Search size={20} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Buscar por participante..."
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-500 min-w-0"
                    />
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                    <button className="px-4 py-2 bg-primary text-white rounded-xl font-medium text-sm hover:bg-accent transition-all whitespace-nowrap touch-manipulation flex-shrink-0">
                        Todos
                    </button>
                    <button className="px-4 py-2 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all whitespace-nowrap touch-manipulation flex-shrink-0">
                        Pendentes
                    </button>
                    <button className="px-4 py-2 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all whitespace-nowrap touch-manipulation flex-shrink-0">
                        Atrasados
                    </button>
                    <button className="px-4 py-2 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all whitespace-nowrap touch-manipulation flex-shrink-0">
                        Pagos
                    </button>
                    <button
                        aria-label="Mais filtros"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all whitespace-nowrap touch-manipulation flex-shrink-0 ml-auto"
                    >
                        <Filter size={20} />
                        <span className="hidden sm:inline">Filtros</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Total a Receber</p>
                    <p className="text-xl md:text-3xl font-bold text-gray-900">{formatCurrency(stats.totalToReceive)}</p>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Recebido</p>
                    <p className="text-xl md:text-3xl font-bold text-green-600">{formatCurrency(stats.received)}</p>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Pendente</p>
                    <p className="text-xl md:text-3xl font-bold text-amber-600">{formatCurrency(stats.pending)}</p>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Atrasado</p>
                    <p className="text-xl md:text-3xl font-bold text-red-600">{formatCurrency(stats.overdue)}</p>
                </div>
            </div>

            {/* Payments List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-100">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Cobranças do Mês</h2>
                </div>
                <div className="overflow-x-auto">
                    {assinaturas.length > 0 ? (
                        assinaturas.map((sub) => (
                            <PaymentRow
                                key={sub.id}
                                participant={sub.participante.nome}
                                streaming={sub.streaming.catalogo.nome}
                                value={String(sub.valor)}
                                dueDate={formatDate(sub.dataVencimento)}
                                status={sub.diasAtraso > 0 ? "atrasado" : sub.status === "ativa" ? "pago" : "pendente"}
                            />
                        ))
                    ) : (
                        <div className="p-12 text-center">
                            <p className="text-gray-400">Nenhuma cobrança encontrada.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}
