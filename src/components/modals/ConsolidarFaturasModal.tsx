import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FileStack, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { consolidarFaturasMensaisAction } from "@/actions/cobrancas";
import { useToast } from "@/hooks/useToast";

interface ConsolidarFaturasModalProps {
    isOpen: boolean;
    onClose: () => void;
    mesReferencia?: string;
}

export function ConsolidarFaturasModal({ isOpen, onClose, mesReferencia }: ConsolidarFaturasModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [analysisData, setAnalysisData] = useState<{ countCobrancas: number, countParticipantes: number, totalPrevisto: number } | null>(null);
    const [result, setResult] = useState<{ consolidados: number; lotesCriados: number } | null>(null);
    const { success, error: toastError } = useToast();

    useEffect(() => {
        if (isOpen) {
            setIsAnalyzing(true);
            const loadAnalysis = async () => {
                try {
                    // Let's import the specific action right here to avoid circular dep issues inside components
                    const { analisarFaturasMensaisAction } = await import("@/actions/cobrancas");
                    const res = await analisarFaturasMensaisAction(mesReferencia);
                    if (res.success && res.data) {
                        setAnalysisData(res.data);
                    } else {
                        toastError(res.error || "Erro ao analisar dados");
                        onClose(); // Prevent users from staying on broken modal
                    }
                } catch (err) {
                    toastError("Erro ao calcular dados da consolidação");
                } finally {
                    setIsAnalyzing(false);
                }
            };
            loadAnalysis();
        } else {
            // Reset state
            setAnalysisData(null);
            setResult(null);
        }
    }, [isOpen, mesReferencia]);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            const res = await consolidarFaturasMensaisAction(mesReferencia);
            if (res.success) {
                setResult({
                    consolidados: res.data?.consolidados || 0,
                    lotesCriados: res.data?.lotes.length || 0
                });
                success("Consolidação concluída com sucesso!");
            } else {
                toastError(res.error || "Erro ao consolidar faturas.");
                onClose();
            }
        } catch (error) {
            toastError("Erro desconhecido ao consolidar faturas.");
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setResult(null);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={result ? "Consolidação Concluída" : "Criar Faturas do Mês"}
            footer={
                <div className="flex flex-col sm:flex-row gap-2 w-full justify-end">
                    {result ? (
                        <Button className="w-full sm:w-auto" onClick={handleClose}>
                            Concluir
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleClose} disabled={isLoading || isAnalyzing} className="w-full sm:w-auto flex-1 sm:flex-none">
                                Cancelar
                            </Button>
                            <Button onClick={handleConfirm} disabled={isLoading || isAnalyzing || !analysisData || analysisData.countParticipantes === 0} className="w-full sm:w-auto flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <FileStack size={16} className="mr-2" />}
                                Consolidar Agora
                            </Button>
                        </>
                    )}
                </div>
            }
        >
            <div className="py-4">
                {result ? (
                    <div className="flex flex-col items-center justify-center text-center space-y-4 py-6 animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                            <CheckCircle2 size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 leading-tight">Sucesso!</h3>
                            <p className="text-sm font-medium text-gray-500 mt-2 max-w-[280px]">
                                O agrupamento foi finalizado para o período selecionado.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full mt-6">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <span className="text-2xl font-black text-gray-900 block">{result.consolidados}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Participantes</span>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                <span className="text-2xl font-black text-blue-700 block">{result.lotesCriados}</span>
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Lotes Criados</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <p className="text-gray-600 mb-2">Resumo da automação das cobranças pendentes do ciclo:</p>
                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3 text-blue-700">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <div className="text-sm w-full">
                                <p className="font-bold mb-3 border-b border-blue-100 pb-2">Como funciona a consolidação?</p>

                                {isAnalyzing ? (
                                    <div className="h-20 flex flex-1 items-center justify-center w-full bg-blue-50/50 rounded-xl animate-pulse">
                                        <Loader2 className="animate-spin mr-2 h-4 w-4" /> Calculando volume de faturas...
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap lg:flex-nowrap gap-3 w-full">
                                        <div className="bg-white p-3 rounded-lg border border-blue-100 flex flex-col items-center flex-1 min-w-[30%]">
                                            <span className="text-xl font-black">{analysisData?.countCobrancas}</span>
                                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-400">Cobranças</span>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-blue-100 flex flex-col items-center flex-1 min-w-[30%]">
                                            <span className="text-xl font-black">{analysisData?.countParticipantes}</span>
                                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-400">Participantes</span>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-blue-100 flex flex-col items-center flex-grow text-center h-full justify-center w-full lg:w-auto">
                                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">Mês Selecionado</span>
                                            <span className="text-sm font-black">{mesReferencia === 'all' ? 'Todos' : (mesReferencia ? mesReferencia.split('-').reverse().join('/') : "Automático")}</span>
                                        </div>
                                    </div>
                                )}

                                <p className="opacity-90 leading-relaxed mt-4 bg-white p-3 border border-blue-100 rounded-xl">
                                    O sistema irá varrer e centralizar os pagamentos de todos os participantes retornados na pesquisa formando um <strong>Lote Único</strong>.
                                    {analysisData?.countParticipantes === 0 && <span className="block mt-2 font-bold text-red-500">Atenção: Nenhum participante elegível neste mês selecionado.</span>}
                                </p>
                            </div>
                        </div>

                        <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100 text-yellow-800 text-sm flex gap-3">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <p className="opacity-90">Ao confirmar, os e-mails/mensagens de WhatsApp serão disparados caso seu plano permita a automação.</p>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
