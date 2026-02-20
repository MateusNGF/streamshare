import { Table as TableIcon, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type ViewMode = "table" | "grid";

interface ViewModeToggleProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}

export function ViewModeToggle({ viewMode, setViewMode }: ViewModeToggleProps) {
    return (
        <div className="flex bg-gray-100 p-1 rounded-lg">
            <Button
                variant="ghost"
                size="sm"
                type="button"
                className={cn(
                    "h-8 px-3 gap-2 rounded-md transition-all",
                    viewMode === "table" ? "bg-white shadow-sm text-primary" : "text-gray-500 hover:text-gray-900"
                )}
                onClick={() => setViewMode("table")}
            >
                <TableIcon size={14} />
                <span className="text-xs font-bold hidden md:block">Tabela</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                type="button"
                className={cn(
                    "h-8 px-3 gap-2 rounded-md transition-all",
                    viewMode === "grid" ? "bg-white shadow-sm text-primary" : "text-gray-500 hover:text-gray-900"
                )}
                onClick={() => setViewMode("grid")}
            >
                <LayoutGrid size={14} />
                <span className="text-xs font-bold hidden md:block">Cards</span>
            </Button>
        </div>
    );
} 
