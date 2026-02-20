"use client";
import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCatalogoActions } from "@/hooks/useCatalogoActions";
import { useCatalogoStore, CatalogoItem } from "@/stores/useCatalogoStore";
import { useActionError } from "@/hooks/useActionError";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ViewModeToggle, ViewMode } from "@/components/ui/ViewModeToggle";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { CATALOGO_CATEGORIES } from "@/constants/catalogo";

// Sub-components
import { CatalogoGrid } from "./catalogo/CatalogoGrid";
import { CatalogoTable } from "./catalogo/CatalogoTable";
import { CatalogoFormModal } from "./catalogo/CatalogoFormModal";

interface CatalogoClientProps {
    initialData: CatalogoItem[];
    error?: string;
}

export function CatalogoClient({ initialData, error }: CatalogoClientProps) {
    useActionError(error);

    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const { setItems } = useCatalogoStore();

    const {
        filteredData,
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
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

    const categories = [
        { id: "all", label: "Tudo" },
        ...CATALOGO_CATEGORIES.map(c => ({ id: c.id, label: c.shortLabel }))
    ];

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
                    <Button
                        onClick={actions.handleOpenCreate}
                        aria-label="Adicionar novo serviço ao catálogo"
                        className="gap-2 shadow-lg shadow-primary/25"
                    >
                        <Plus size={20} />
                        Novo Serviço
                    </Button>
                }
            />

            {/* Filtros e Busca */}
            <div className="bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4 duration-500 space-y-5">
                <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50/50 rounded-2xl border border-gray-100 focus-within:border-primary/30 focus-within:bg-white focus-within:shadow-md focus-within:shadow-primary/5 transition-all duration-300">
                    <Search size={22} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Buscar por serviço ou plataforma..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 font-bold text-sm"
                    />
                </div>

                <div className="flex flex-wrap gap-2.5">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "px-5 py-2.5 rounded-2xl text-xs font-black transition-all border shrink-0",
                                selectedCategory === cat.id
                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                                    : "bg-white text-gray-500 border-gray-100 hover:border-primary/30 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cabeçalho da Seção com Alternância de Visão */}
            <SectionHeader
                title="Serviços Disponíveis"
                description={`${filteredData.length} serviços catalogados no sistema`}
                rightElement={
                    <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
                }
            />

            {/* Listagem (Grid ou Tabela) */}
            <div className="min-h-[400px]">
                {viewMode === "grid" ? (
                    <CatalogoGrid
                        data={filteredData}
                        onEdit={actions.handleOpenEdit}
                        onDelete={actions.handleOpenDelete}
                    />
                ) : (
                    <CatalogoTable
                        data={filteredData}
                        onEdit={actions.handleOpenEdit}
                        onDelete={actions.handleOpenDelete}
                    />
                )}

                {/* Empty State */}
                {filteredData.length === 0 && (
                    <EmptyState
                        icon={Search}
                        title="Nenhum serviço encontrado"
                        description={
                            searchTerm
                                ? `Não encontramos resultados para "${searchTerm}". Tente outro termo.`
                                : "Tente ajustar os termos da sua busca ou adicione um novo serviço ao catálogo."
                        }
                    />
                )}
            </div>

            {/* Modais de Gerenciamento */}
            <CatalogoFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={actions.handleSave}
                loading={loading}
                selectedItem={selectedItem}
                formData={formData}
                setFormData={setFormData}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={actions.handleDelete}
                loading={loading}
                title="Remover do Catálogo"
                message={`Esta ação removerá "${selectedItem?.nome}" permanentemente. Novos streamings não poderão utilizar este serviço.`}
            />
        </PageContainer>
    );
}
