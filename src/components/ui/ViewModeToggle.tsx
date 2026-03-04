import { Table as TableIcon, LayoutGrid, BarChart3, List as ListIcon, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type ViewMode = "table" | "grid" | "chart" | "list" | (string & {});

export interface ViewModeOption {
    id: ViewMode;
    label: string;
    icon: LucideIcon;
}

interface ViewModeToggleProps {
    viewMode: ViewMode;
    setViewMode: (mode: any) => void;
    options?: ViewModeOption[];
}

export const viewModePresets = {
    tableGrid: [
        { id: "table", label: "Tabela", icon: TableIcon },
        { id: "grid", label: "Cards", icon: LayoutGrid },
    ] as ViewModeOption[],
    chartGrid: [
        { id: "grid", label: "Cards", icon: LayoutGrid },
        { id: "chart", label: "Gráficos", icon: BarChart3 },
    ] as ViewModeOption[],
    listGrid: [
        { id: "list", label: "Lista", icon: ListIcon },
        { id: "grid", label: "Cards", icon: LayoutGrid },
    ] as ViewModeOption[],
    tableChart: [
        { id: "table", label: "Tabela", icon: TableIcon },
        { id: "chart", label: "Gráficos", icon: BarChart3 },
    ] as ViewModeOption[],
};

export function ViewModeToggle({ viewMode, setViewMode, options = viewModePresets.tableGrid }: ViewModeToggleProps) {
    return (
        <div className="flex bg-gray-100 p-1 rounded-lg">
            {options.map((option) => {
                const Icon = option.icon;
                const isActive = viewMode === option.id;

                return (
                    <Button
                        key={option.id}
                        variant="ghost"
                        size="sm"
                        type="button"
                        className={cn(
                            "h-8 px-3 gap-2 rounded-md transition-all",
                            isActive ? "bg-white shadow-sm text-primary" : "text-gray-500 hover:text-gray-900"
                        )}
                        onClick={() => setViewMode(option.id)}
                    >
                        <Icon size={14} />
                        <span className="text-xs font-bold hidden md:block">{option.label}</span>
                    </Button>
                );
            })}
        </div>
    );
}
