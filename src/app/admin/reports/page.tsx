import { getReports } from "@/actions/suporte";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, Calendar, User, AlignLeft, ShieldAlert } from "lucide-react";
import { UpdateStatusButton } from "./components/UpdateStatusButton";
import { ViewReportButton } from "./components/ViewReportButton";

export default async function ReportsPage() {
    const { data: reports, success } = await getReports();

    if (!success || !reports) {
        return (
            <PageContainer>
                <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-100">
                    Erro ao carregar reports.
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title="Central de Suporte"
                description="Gerencie os reports enviados pelos usuários"
            />

            <SectionHeader
                title="Chamados Ativos"
                description={`${reports.length} chamados registrados`}
            />

            {reports.length === 0 ? (
                <EmptyState
                    icon={MessageSquare}
                    title="Nenhum report encontrado"
                    description="Não há chamados de suporte pendentes no momento."
                />
            ) : (
                <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm mb-8">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow className="hover:bg-transparent border-b border-gray-100">
                                    <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-gray-400" />
                                            Data
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <User size={12} className="text-gray-400" />
                                            Usuário
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <AlignLeft size={12} className="text-gray-400" />
                                            Assunto
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <ShieldAlert size={12} className="text-gray-400" />
                                            Status
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[100px] text-right text-[10px] font-black text-gray-500 uppercase tracking-wider">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.map((report: any, index: number) => (
                                    <TableRow
                                        key={report.id}
                                        className="group animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <TableCell className="text-xs font-medium text-gray-500">
                                            {format(new Date(report.createdAt), "dd/MM HH:mm")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 leading-tight">
                                                    {report.nome}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {report.email}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-bold text-gray-900 leading-tight">
                                                    {report.assunto}
                                                </span>
                                                <p className="text-[10px] text-gray-400 font-medium line-clamp-1 max-w-xs" title={report.descricao}>
                                                    {report.descricao}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <StatusBadge status={report.status} className="scale-75" />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <ViewReportButton report={report} />
                                                <UpdateStatusButton id={report.id} currentStatus={report.status} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
