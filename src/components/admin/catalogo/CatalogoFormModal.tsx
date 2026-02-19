import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { CatalogoItem } from "@/stores/useCatalogoStore";
import { Button } from "@/components/ui/Button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATALOGO_CATEGORIES } from "@/constants/catalogo";

interface CatalogoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    loading: boolean;
    selectedItem: CatalogoItem | null;
    formData: {
        nome: string;
        categoria: string;
        isConteudoAdulto: boolean;
        siteOficial: string;
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nome do Serviço"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            placeholder="Ex: Netflix, Disney+, etc."
                            required
                        />
                        <div className="space-y-2">
                            <Label className="block text-sm font-bold text-gray-700">Categoria</Label>
                            <Select
                                value={formData.categoria}
                                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATALOGO_CATEGORIES.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Input
                        label="Página Oficial (Link)"
                        value={formData.siteOficial}
                        onChange={(e) => setFormData({ ...formData, siteOficial: e.target.value })}
                        placeholder="Ex: https://www.netflix.com"
                    />

                    <Input
                        label="URL do Ícone (SVG recomendado)"
                        value={formData.iconeUrl}
                        onChange={(e) => setFormData({ ...formData, iconeUrl: e.target.value })}
                        placeholder="Ex: https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/netflix.svg"
                    />

                    <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-primary/20 transition-all duration-300 group cursor-pointer" onClick={() => setFormData({ ...formData, isConteudoAdulto: !formData.isConteudoAdulto })}>
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                formData.isConteudoAdulto ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                            )}>
                                <ShieldAlert size={20} />
                            </div>
                            <div className="space-y-0.5">
                                <Label className="font-bold text-gray-900 cursor-pointer">Conteúdo Adulto / Sensível</Label>
                                <p className="text-xs text-gray-500">Exibir alertas de restrição (+18) para este serviço</p>
                            </div>
                        </div>
                        <Switch
                            checked={formData.isConteudoAdulto}
                            onCheckedChange={(checked) => setFormData({ ...formData, isConteudoAdulto: checked })}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

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
