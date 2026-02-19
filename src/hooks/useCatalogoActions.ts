import { useState, useMemo } from "react";
import { useCatalogoStore, CatalogoItem } from "@/stores/useCatalogoStore";
import { createCatalogoItem, updateCatalogoItem, deleteCatalogoItem } from "@/actions/streamings";
import { useToast } from "@/hooks/useToast";

export function useCatalogoActions() {
    const toast = useToast();
    const { items, addItem, updateItem, removeItem } = useCatalogoStore();

    // UI States
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CatalogoItem | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        nome: "",
        categoria: "video",
        isConteudoAdulto: false,
        siteOficial: "",
        iconeUrl: "",
        corPrimaria: "#000000",
    });

    // Filtering
    const filteredData = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === "all" || item.categoria === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [items, searchTerm, selectedCategory]);

    const handleOpenCreate = () => {
        setSelectedItem(null);
        setFormData({
            nome: "",
            categoria: "video",
            isConteudoAdulto: false,
            siteOficial: "",
            iconeUrl: "",
            corPrimaria: "#000000"
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: CatalogoItem) => {
        setSelectedItem(item);
        setFormData({
            nome: item.nome,
            categoria: item.categoria,
            isConteudoAdulto: item.isConteudoAdulto,
            siteOficial: item.siteOficial || "",
            iconeUrl: item.iconeUrl || "",
            corPrimaria: item.corPrimaria,
        });
        setIsModalOpen(true);
    };

    const handleOpenDelete = (item: CatalogoItem) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            if (selectedItem) {
                const result = await updateCatalogoItem(selectedItem.id, formData);
                if (result.success && result.data) {
                    updateItem(result.data);
                    toast.success("Serviço atualizado com sucesso!");
                    setIsModalOpen(false);
                    setSelectedItem(null);
                } else if (result.error) {
                    toast.error(result.error);
                }
            } else {
                const result = await createCatalogoItem(formData);
                if (result.success && result.data) {
                    addItem(result.data);
                    toast.success("Serviço adicionado ao catálogo!");
                    setIsModalOpen(false);
                    setSelectedItem(null);
                } else if (result.error) {
                    toast.error(result.error);
                }
            }
        } catch (error) {
            toast.error("Erro ao salvar item do catálogo");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        setLoading(true);
        try {
            const result = await deleteCatalogoItem(selectedItem.id);
            if (result.success) {
                removeItem(selectedItem.id);
                toast.success("Serviço removido do catálogo");
                setIsDeleteModalOpen(false);
                setSelectedItem(null);
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao excluir item do catálogo");
        } finally {
            setLoading(false);
        }
    };

    return {
        items,
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
        actions: {
            handleOpenCreate,
            handleOpenEdit,
            handleOpenDelete,
            handleSave,
            handleDelete
        }
    };
}
