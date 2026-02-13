import { getReports, updateReportStatus } from "@/actions/suporte";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Clock, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { UpdateStatusButton } from "./components/UpdateStatusButton";
import { ViewReportButton } from "./components/ViewReportButton";

export default async function ReportsPage() {
    const { data: reports, success } = await getReports();

    if (!success || !reports) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-800 p-4 rounded-xl">
                    Erro ao carregar reports.
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Central de Suporte</h1>
                    <p className="text-gray-500">Gerencie os reports enviados pelos usuários</p>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assunto</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Nenhum report encontrado.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report: any) => (
                                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(report.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{report.nome}</span>
                                                <span className="text-xs text-gray-500">{report.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium text-gray-900">{report.assunto}</span>
                                                <p className="text-xs text-gray-500 line-clamp-2 max-w-xs" title={report.descricao}>
                                                    {report.descricao}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusInfo status={report.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <ViewReportButton report={report} />
                                                <UpdateStatusButton id={report.id} currentStatus={report.status} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusInfo({ status }: { status: string }) {
    const styles = {
        pendente: "bg-yellow-100 text-yellow-800",
        em_analise: "bg-blue-100 text-blue-800",
        resolvido: "bg-green-100 text-green-800",
        finalizado: "bg-gray-100 text-gray-800",
    };

    const labels = {
        pendente: "Pendente",
        em_analise: "Em Análise",
        resolvido: "Resolvido",
        finalizado: "Finalizado",
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}`}>
            {labels[status as keyof typeof labels] || status}
        </span>
    );
}
