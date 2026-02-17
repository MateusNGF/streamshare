"use client";
import { useEffect } from "react";
import { Plus, Search, Edit2, Trash2, ExternalLink } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { useCatalogoActions } from "@/hooks/useCatalogoActions";
import { useCatalogoStore, CatalogoItem } from "@/stores/useCatalogoStore";

interface CatalogoClientProps {
    initialData: CatalogoItem[];
}

export function CatalogoClient({ initialData }: CatalogoClientProps) {
    const { setItems } = useCatalogoStore();
    const {
        filteredData,
        searchTerm,
        setSearchTerm,
        isModalOpen,
        setIsModalOpen,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        selectedItem,
        formData,
        setFormData,
        loading,
        actions
    } = useCatalogoActions();

    // Initialize store with server data
    useEffect(() => {
        if (initialData) {
            setItems(initialData);
        }
    }, [initialData, setItems]);

    return (
        <PageContainer>
            <PageHeader
                title="Catálogo Global"
                description="Gerencie os serviços de streaming disponíveis no sistema"
                action={
                    <button
                        onClick={actions.handleOpenCreate}
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
                            <StreamingLogo
                                name={item.nome}
                                color={item.corPrimaria}
                                iconeUrl={item.iconeUrl}
                                size="lg"
                                rounded="2xl"
                                className="w-16 h-16 text-2xl shadow-inner"
                            />
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => actions.handleOpenEdit(item)}
                                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-primary transition-all"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => actions.handleOpenDelete(item)}
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
                            onClick={() => actions.handleSave()}
                            disabled={loading}
                            className="px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
                        >
                            {loading ? "Processando..." : selectedItem ? "Salvar" : "Criar"}
                        </button>
                    </>
                }
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        actions.handleSave();
                    }}
                    className="space-y-4"
                >
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
                        <StreamingLogo
                            name={formData.nome || "?"}
                            color={formData.corPrimaria}
                            iconeUrl={formData.iconeUrl || null}
                            size="lg"
                            rounded="2xl"
                            className="w-20 h-20 text-3xl shadow-lg"
                        />
                    </div>
                </form>
            </Modal>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={actions.handleDelete}
                loading={loading}
                title="Remover do Catálogo"
                message={`Tem certeza que deseja remover ${selectedItem?.nome}? Isso o tornará indisponível para novos streamings.`}
            />
        </PageContainer>
    );
}
