import { Edit2, Trash2, ExternalLink, MoreVertical, ShieldAlert } from "lucide-react";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { CatalogoItem } from "@/stores/useCatalogoStore";
import { Dropdown } from "@/components/ui/Dropdown";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

import { CATEGORY_LABELS } from "@/constants/catalogo";

interface CatalogoGridProps {
    data: CatalogoItem[];
    onEdit: (item: CatalogoItem) => void;
    onDelete: (item: CatalogoItem) => void;
}

export function CatalogoGrid({ data, onEdit, onDelete }: CatalogoGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((item) => (
                <div
                    key={item.id}
                    className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4"
                >
                    {/* Background Shine & Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/[0.01] to-primary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Main Content Container */}
                    <div className="relative p-5 flex items-center gap-5">
                        {/* Logo Section */}
                        <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-lg scale-0 group-hover:scale-110 transition-transform duration-700 opacity-50" />
                            <StreamingLogo
                                name={item.nome}
                                color={item.corPrimaria}
                                iconeUrl={item.iconeUrl}
                                size="lg"
                                rounded="2xl"
                                className="relative shadow-md group-hover:scale-105 transition-transform duration-500 bg-white"
                            />
                        </div>

                        {/* Info Section */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h3 className="text-base font-black text-gray-900 truncate tracking-tight mb-1 group-hover:text-primary transition-colors">
                                {item.nome}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="secondary"
                                    className="text-[10px] py-0.5 px-2 bg-gray-50 text-gray-400 font-bold border border-gray-100/50 uppercase tracking-wider h-5"
                                >
                                    {CATEGORY_LABELS[item.categoria] || item.categoria}
                                </Badge>
                                {item.isConteudoAdulto && (
                                    <div className="flex items-center gap-1 text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-tight h-5">
                                        <ShieldAlert size={10} className="fill-red-500/20" />
                                        <span>18+</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions Toggle */}
                        <div className="flex-shrink-0">
                            <SettingsMenu
                                item={item}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        </div>
                    </div>

                    {/* Quick Access Footer Branding */}
                    <div className="h-1 w-full bg-gray-50 relative overflow-hidden mt-auto">
                        <div
                            className="absolute inset-y-0 left-0 transition-all duration-700 w-0 group-hover:w-full"
                            style={{ backgroundColor: item.corPrimaria }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Helper to keep the main grid cleaner and easier to manage
function SettingsMenu({ item, onEdit, onDelete }: { item: CatalogoItem; onEdit: any; onDelete: any }) {
    return (
        <Dropdown
            options={[
                {
                    label: "Editar Registro",
                    icon: <Edit2 size={16} />,
                    onClick: () => onEdit(item)
                },
                ...(item.siteOficial ? [{
                    label: "Visitar Site Oficial",
                    icon: <ExternalLink size={16} />,
                    onClick: () => window.open(item.siteOficial!, "_blank")
                }] : []),
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
                <div className="p-2 bg-gray-50 hover:bg-white rounded-xl text-gray-400 hover:text-primary transition-all border border-transparent hover:border-gray-100 hover:shadow-sm cursor-pointer">
                    <MoreVertical size={18} />
                </div>
            }
        />
    );
}
