import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { CatalogoItem } from "@/stores/useCatalogoStore";
import { Button } from "@/components/ui/Button";

interface CatalogoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    loading: boolean;
    selectedItem: CatalogoItem | null;
    formData: {
        nome: string;
        iconeUrl: string;
        corPrimaria: string;
    };
    setFormData: (data: any) => void;
}

export function CatalogoFormModal({
    isOpen,
    onClose,
    onSave,
    loading,
    selectedItem,
    formData,
    setFormData
}: CatalogoFormModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={selectedItem ? "Editar Serviço" : "Novo Serviço"}
            footer={
                <div className="flex justify-end gap-3 w-full">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={onSave}
                        disabled={loading}
                    >
                        {loading ? "Processando..." : selectedItem ? "Salvar Alterações" : "Criar Serviço"}
                    </Button>
                </div>
            }
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSave();
                }}
                className="space-y-6"
            >
                <div className="space-y-4">
                    <Input
                        label="Nome do Serviço"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Ex: Netflix, Disney+, etc."
                        required
                    />
                    <Input
                        label="URL do Ícone (SVG recomendado)"
                        value={formData.iconeUrl}
                        onChange={(e) => setFormData({ ...formData, iconeUrl: e.target.value })}
                        placeholder="Ex: https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/netflix.svg"
                    />
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Cor Primária</label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="color"
                                value={formData.corPrimaria}
                                onChange={(e) => setFormData({ ...formData, corPrimaria: e.target.value })}
                                className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer shadow-sm"
                            />
                            <div className="flex-1">
                                <Input
                                    value={formData.corPrimaria}
                                    onChange={(e) => setFormData({ ...formData, corPrimaria: e.target.value })}
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pré-visualização</span>
                    <StreamingLogo
                        name={formData.nome || "?"}
                        color={formData.corPrimaria}
                        iconeUrl={formData.iconeUrl || null}
                        size="lg"
                        rounded="2xl"
                        className="w-20 h-20 text-3xl shadow-xl"
                    />
                    <span className="text-sm font-bold text-gray-900">{formData.nome || "Nome do Serviço"}</span>
                </div>
            </form>
        </Modal>
    );
}
