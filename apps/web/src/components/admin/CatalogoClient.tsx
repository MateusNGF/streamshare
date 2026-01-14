"use client";
import { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, ExternalLink } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { createCatalogoItem, updateCatalogoItem, deleteCatalogoItem } from "@/actions/streamings";

interface CatalogoItem {
    id: number;
    nome: string;
    iconeUrl: string | null;
    corPrimaria: string;
    isAtivo: boolean;
}

interface CatalogoClientProps {
    initialData: CatalogoItem[];
}

export function CatalogoClient({ initialData }: CatalogoClientProps) {
    const [data, setData] = useState(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CatalogoItem | null>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nome: "",
        iconeUrl: "",
        corPrimaria: "#000000",
    });

    const filteredData = useMemo(() => {
        return data.filter((item) =>
            item.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (selectedItem) {
                const updated = await updateCatalogoItem(selectedItem.id, formData);
                setData(prev => prev.map(item => item.id === updated.id ? updated : item));
            } else {
                const created = await createCatalogoItem(formData);
                setData(prev => [...prev, created]);
            }
            setIsModalOpen(false);
            setSelectedItem(null);
            setFormData({ nome: "", iconeUrl: "", corPrimaria: "#000000" });
        } catch (error) {
            console.error("Error saving catalog item:", error);
            alert("Erro ao salvar item do catálogo.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        setLoading(true);
        try {
            await deleteCatalogoItem(selectedItem.id);
            setData(prev => prev.filter(item => item.id !== selectedItem.id));
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
        } catch (error) {
            console.error("Error deleting catalog item:", error);
            alert("Erro ao excluir item do catálogo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Catálogo Global"
                description="Gerencie os serviços de streaming disponíveis no sistema"
                action={
                    <button
                        onClick={() => {
                            setSelectedItem(null);
                            setFormData({ nome: "", iconeUrl: "", corPrimaria: "#000000" });
                            setIsModalOpen(true);
                        }}
                        aria-label="Adicionar novo serviço ao catálogo"
                        className="flex items-center gap-2 bg-primary hover:bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all touch-manipulation"
                    >
                        <Plus size={20} />
                        Novo Serviço
                    </button>
                }
            />

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 md:mb-8">
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                    <Search size={20} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Buscar por serviço..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-500 min-w-0"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredData.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-inner"
                                style={{ backgroundColor: item.corPrimaria }}
                            >
                                {item.iconeUrl ? (
                                    <img src={item.iconeUrl} alt={item.nome} className="w-10 h-10 object-contain brightness-0 invert" />
                                ) : (
                                    item.nome.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        setSelectedItem(item);
                                        setFormData({
                                            nome: item.nome,
                                            iconeUrl: item.iconeUrl || "",
                                            corPrimaria: item.corPrimaria,
                                        });
                                        setIsModalOpen(true);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-primary transition-all"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedItem(item);
                                        setIsDeleteModalOpen(true);
                                    }}
                                    className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{item.nome}</h3>
                        <div className="mt-auto pt-4 flex items-center justify-between">
                            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                                {item.corPrimaria}
                            </span>
                            {item.iconeUrl && (
                                <a href={item.iconeUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary">
                                    <ExternalLink size={14} />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedItem ? "Editar Serviço" : "Novo Serviço"}
                footer={
                    <>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
                        >
                            {loading ? "Processando..." : selectedItem ? "Salvar" : "Criar"}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSave} className="space-y-4">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cor Primária</label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="color"
                                value={formData.corPrimaria}
                                onChange={(e) => setFormData({ ...formData, corPrimaria: e.target.value })}
                                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                            />
                            <Input
                                value={formData.corPrimaria}
                                onChange={(e) => setFormData({ ...formData, corPrimaria: e.target.value })}
                                placeholder="#000000"
                                className="flex-1"
                            />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center">
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg"
                            style={{ backgroundColor: formData.corPrimaria }}
                        >
                            {formData.iconeUrl ? (
                                <img src={formData.iconeUrl} alt="Preview" className="w-12 h-12 object-contain brightness-0 invert" />
                            ) : (
                                formData.nome ? formData.nome.charAt(0).toUpperCase() : "?"
                            )}
                        </div>
                    </div>
                </form>
            </Modal>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                loading={loading}
                title="Remover do Catálogo"
                message={`Tem certeza que deseja remover ${selectedItem?.nome}? Isso o tornará indisponível para novos streamings.`}
            />
        </PageContainer>
    );
}