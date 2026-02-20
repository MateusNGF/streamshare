"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { aprovarSaque, rejeitarSaque } from "@/actions/admin/saques";
import { Toast, ToastVariant } from "@/components/ui/Toast";
import { CheckCircle2, XCircle, Search, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function SaquesAdminClient({ initialSaques }: { initialSaques: any[] }) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string, variant: ToastVariant } | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setToast({ message: "Chave copiadda para a área de transferência.", variant: "success" });
    };

    const handleAprovar = async (saque: any) => {
        const confirm = window.confirm(`Você já enviou o PIX de R$ ${Number(saque.valor).toFixed(2)} para a chave ${saque.chavePixDestino}?`);
        if (!confirm) return;

        const comprovante = window.prompt("Cole a URL do comprovante do PIX gerado (opcional):");

        setLoadingId(saque.id);
        const result = await aprovarSaque(saque.id, comprovante || "", undefined);
        setLoadingId(null);

        if (result.success) {
            setToast({ message: "Saque aprovado e com saldo deduzido!", variant: "success" });
            router.refresh();
        } else {
            setToast({ message: result.error || "Erro ao aprovar.", variant: "error" });
        }
    };

    const handleRejeitar = async (saque: any) => {
        const motivo = window.prompt("Qual o motivo da rejeição? (Isso será enviado p/ o usuário e o saldo estornado)");
        if (!motivo) return;

        setLoadingId(saque.id);
        const result = await rejeitarSaque(saque.id, motivo);
        setLoadingId(null);

        if (result.success) {
            setToast({ message: "Saque rejeitado e valor estornado à carteira.", variant: "success" });
            router.refresh();
        } else {
            setToast({ message: result.error || "Erro ao rejeitar.", variant: "error" });
        }
    };

    if (initialSaques.length === 0) {
        return (
            <div className="py-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Tudo em dia!</h3>
                <p className="text-gray-500 mt-2 max-w-sm">
                    Nenhum saque pendente no momento. Quando um provedor solicitar saque, ele aparecerá aqui.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Conta</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Chave PIX (Destino)</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Valor Solicitado</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {initialSaques.map((saque) => (
                        <tr key={saque.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-5">
                                <div className="text-sm font-bold text-gray-900">{saque.wallet.conta.nome}</div>
                                <div className="text-xs text-gray-500">{saque.wallet.conta.email}</div>
                                <div className="text-[10px] text-gray-400 mt-1 uppercase">
                                    {format(new Date(saque.createdAt), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase py-0.5 px-2 bg-gray-100 text-gray-600 rounded">
                                        {saque.tipoChaveDestino}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-800">{saque.chavePixDestino}</span>
                                    <button
                                        onClick={() => handleCopy(saque.chavePixDestino)}
                                        className="text-primary hover:text-primary-hover p-1 rounded hover:bg-primary/10 transition-colors"
                                        title="Copiar chave PIX"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <span className="text-lg font-black text-gray-900">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(saque.valor))}
                                </span>
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                    {loadingId === saque.id ? (
                                        <div className="flex items-center gap-2 text-primary font-medium px-4 py-2 border rounded-xl border-primary/20 bg-primary/5">
                                            <RefreshCw size={16} className="animate-spin" /> Processando...
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleAprovar(saque)}
                                                className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 flex items-center gap-2 shadow-sm shadow-green-500/20 active:scale-95 transition-all"
                                            >
                                                <CheckCircle2 size={16} /> Aprovar
                                            </button>
                                            <button
                                                onClick={() => handleRejeitar(saque)}
                                                className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 hover:bg-red-100 flex items-center gap-2 transition-colors"
                                            >
                                                <XCircle size={16} /> Rejeitar
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {toast && (
                <Toast
                    message={toast.message}
                    variant={toast.variant}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
