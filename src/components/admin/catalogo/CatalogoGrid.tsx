import { Edit2, Trash2, ExternalLink, MoreVertical } from "lucide-react";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { CatalogoItem } from "@/stores/useCatalogoStore";
import { Dropdown } from "@/components/ui/Dropdown";

interface CatalogoGridProps {
    data: CatalogoItem[];
    onEdit: (item: CatalogoItem) => void;
    onDelete: (item: CatalogoItem) => void;
}

export function CatalogoGrid({ data, onEdit, onDelete }: CatalogoGridProps) {
    if (data.length === 0) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
            {data.map((item) => (
                <div
                    key={item.id}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col group relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                    <div className="flex flex-col items-center text-center gap-3">
                        <StreamingLogo
                            name={item.nome}
                            color={item.corPrimaria}
                            iconeUrl={item.iconeUrl}
                            size="lg"
                            rounded="xl"
                            className="w-14 h-14 text-xl shadow-inner mb-1"
                        />
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{item.nome}</h3>
                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                                {item.corPrimaria}
                            </span>
                        </div>
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Dropdown
                            options={[
                                {
                                    label: "Editar Registro",
                                    icon: <Edit2 size={16} />,
                                    onClick: () => onEdit(item)
                                },
                                ...(item.iconeUrl ? [{
                                    label: "Ver Ícone Original",
                                    icon: <ExternalLink size={16} />,
                                    onClick: () => window.open(item.iconeUrl!, "_blank")
                                }] : []),
                                { type: "separator" },
                                {
                                    label: "Excluir Serviço",
                                    icon: <Trash2 size={16} />,
                                    onClick: () => onDelete(item),
                                    variant: "danger"
                                }
                            ]}
                            trigger={
                                <div className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-primary transition-all">
                                    <MoreVertical size={16} />
                                </div>
                            }
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
