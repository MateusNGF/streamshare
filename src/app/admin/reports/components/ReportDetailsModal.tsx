"use client";

import { Modal } from "@/components/ui/Modal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Mail, Calendar, MessageSquare, AlertCircle } from "lucide-react";

interface SupportReport {
    id: number;
    nome: string;
    email: string;
    assunto: string;
    descricao: string;
    status: string;
    createdAt: Date | string;
}

interface ReportDetailsModalProps {
    report: SupportReport;
    isOpen: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

export function ReportDetailsModal({ report, isOpen, onClose, children }: ReportDetailsModalProps) {
    if (!report) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Report #${report.id}`}
            className="sm:max-w-lg"
            footer={children}
        >
            <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-gray-100">
                        <User size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{report.nome}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Mail size={14} />
                            {report.email}
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar size={14} />
                            Data de Envio
                        </span>
                        <p className="text-sm font-medium text-gray-900 ml-5">
                            {format(new Date(report.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertCircle size={14} />
                            Status Atual
                        </span>
                        <div className="ml-5">
                            <StatusBadge status={report.status} />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 my-4" />

                {/* Content */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <MessageSquare size={18} className="text-primary" />
                        {report.assunto}
                    </h4>
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed border border-gray-100 whitespace-pre-wrap">
                        {report.descricao}
                    </div>
                </div>
            </div>
        </Modal>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
        em_analise: "bg-blue-100 text-blue-800 border-blue-200",
        resolvido: "bg-green-100 text-green-800 border-green-200",
        finalizado: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const labels = {
        pendente: "Pendente",
        em_analise: "Em Análise",
        resolvido: "Resolvido",
        finalizado: "Finalizado",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}`}>
            {labels[status as keyof typeof labels] || status}
        </span>
    );
}
