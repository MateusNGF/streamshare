import { Edit2, Trash2, ExternalLink, MoreVertical, ShieldAlert } from "lucide-react";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { CatalogoItem } from "@/stores/useCatalogoStore";
import { Dropdown } from "@/components/ui/Dropdown";
import { Badge } from "@/components/ui/Badge";
import { CATEGORY_LABELS } from "@/constants/catalogo";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";

interface CatalogoTableProps {
    data: CatalogoItem[];
    onEdit: (item: CatalogoItem) => void;
    onDelete: (item: CatalogoItem) => void;
}

export function CatalogoTable({ data, onEdit, onDelete }: CatalogoTableProps) {
    if (data.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-16">Logo</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Cor</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id} className="group">
                            <TableCell>
                                <StreamingLogo
                                    name={item.nome}
                                    color={item.corPrimaria}
                                    iconeUrl={item.iconeUrl}
                                    size="sm"
                                    rounded="lg"
                                    className="w-10 h-10 shadow-sm"
                                />
                            </TableCell>
                            <TableCell className="font-bold text-gray-900">
                                <div className="flex items-center gap-2">
                                    {item.nome}
                                    {item.isConteudoAdulto && (
                                        <Badge variant="danger" className="text-[10px] py-0 px-1.5 h-4 font-bold border-none">
                                            18+
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="bg-gray-100 text-gray-500 font-bold border-none">
                                    {CATEGORY_LABELS[item.categoria] || item.categoria}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 font-mono text-xs text-gray-500">
                                    <div
                                        className="w-4 h-4 rounded-full border border-gray-200"
                                        style={{ backgroundColor: item.corPrimaria }}
                                    />
                                    {item.corPrimaria}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
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
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
