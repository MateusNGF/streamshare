import { Modal } from "@/components/ui/Modal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Mail, Calendar, MessageSquare, AlertCircle, Hash, ClipboardList } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

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
            title={`Detalhes do Chamado`}
            className="sm:max-w-xl"
            footer={children}
        >
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* ID Badge */}
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider rounded-full border border-primary/20">
                        <Hash size={12} />
                        Protocolo #{report.id}
                    </span>
                    <StatusBadge status={report.status} className="scale-90 origin-left" />
                </div>

                {/* Header Info */}
                <div className="flex items-center gap-4 bg-gray-50/50 p-5 rounded-3xl border border-gray-100 shadow-sm shadow-gray-200/50">
                    <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-gray-100 shrink-0 transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                        <User size={28} />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <h3 className="font-black text-gray-900 text-lg leading-tight truncate">{report.nome}</h3>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors cursor-pointer truncate">
                            <Mail size={14} className="shrink-0" />
                            {report.email}
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 p-4 bg-gray-50/30 rounded-2xl border border-gray-100/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar size={14} className="text-gray-300" />
                            Data de Envio
                        </span>
                        <p className="text-xs font-bold text-gray-700">
                            {format(new Date(report.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                    </div>

                    <div className="flex flex-col gap-1.5 p-4 bg-gray-50/30 rounded-2xl border border-gray-100/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <ClipboardList size={14} className="text-gray-300" />
                            Assunto Principal
                        </span>
                        <p className="text-xs font-bold text-gray-700 truncate">
                            {report.assunto}
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">Descrição do Problema</h4>
                    </div>

                    <div className="bg-gray-50/80 rounded-3xl p-6 text-sm text-gray-600 leading-relaxed border border-gray-100 whitespace-pre-wrap break-words shadow-inner min-h-[120px]">
                        <MessageSquare size={20} className="text-gray-300 mb-3" />
                        <span className="font-medium text-gray-700">
                            {report.descricao}
                        </span>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
