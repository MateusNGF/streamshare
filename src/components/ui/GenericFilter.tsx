import { useState, useEffect } from "react";
import { Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Switch } from "@/components/ui/switch";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterConfig {
    key: string;
    type: "text" | "select" | "switch";
    label?: string; // Placeholder for inputs, Label for selects
    placeholder?: string;
    options?: FilterOption[]; // For select
    className?: string; // Optional width class
}

interface GenericFilterProps {
    filters: FilterConfig[];
    values: Record<string, string>;
    onChange: (key: string, value: string) => void;
    onClear?: () => void;
    className?: string;
}

export function GenericFilter({ filters, values, onChange, onClear, className }: GenericFilterProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempValues, setTempValues] = useState<Record<string, string>>(values);

    // Sync temp values when modal opens or values change externally
    useEffect(() => {
        if (isModalOpen) {
            setTempValues({ ...values });
        }
    }, [isModalOpen, values]);

    // Count active filters
    const activeFiltersCount = Object.values(values).filter(v => v && v !== "all" && v !== "false").length;

    const handleApply = () => {
        // Apply all temp values
        Object.entries(tempValues).forEach(([key, value]) => {
            if (values[key] !== value) {
                onChange(key, value);
            }
        });
        setIsModalOpen(false);
    };

    const handleClearOps = () => {
        const cleared: Record<string, string> = {};
        filters.forEach(f => {
            cleared[f.key] = "";
        });
        setTempValues(cleared);
        if (onClear) onClear(); // Assuming onClear updates parent state directly
        // If onClear doesn't exist, we might need to manually reset standard keys?
        // But the parent usually handles onClear by resetting state.
        // We should also close if we clear? Or let user clear and then apply?
        // "Limpar e Aplicar" buttons usually imply independent actions.
        // If I click Clear, it should probably clear the FORM. User then clicks Apply to confirm?
        // OR Clear triggers instant reset?
        // Given buttons are side by side: "Limpar" usually clears current selection. "Aplicar" commits it.
        // So:
        // handleClear -> setTempValues(empty).
        // User must click Apply to commit the empty state to parent.
    };

    // Actually, usually "Clear" in a modal filter resets the search immediately or just resets the inputs?
    // Let's implement "Clear" as "Reset Inputs to default". Commit happens on Apply.
    // BUT the user said "dois botoes... limpar e aplicar".
    // If "Limpar" calls `onClear` (which resets parent state), it acts immediately.
    // If I want to defer, I should just clean tempValues.
    // However, the prop `onClear` exists.
    // Let's make "Limpar" reset tempValues. And if the user wants to apply, they hit Apply.
    // But `onClear` prop usually resets parent immediately.
    // Let's stick to: Limpar -> Reset Temp Values. Apply -> Commit Temp Values.
    // If the user meant "Limpar" (Reset everything and close), that's different.
    // Standard pattern: "Reset" wipes form. "Apply" saves.

    // REVISION: The onClear prop is used in Desktop view for instant clear.
    // In Modal:
    // "Limpar": Resets tempValues to empty strings/"all".
    // "Aplicar": Commits tempValues.

    const handleLocalClear = () => {
        const resetVals: Record<string, string> = {};
        filters.forEach(f => {
            if (f.type === "select") {
                resetVals[f.key] = "all";
            } else if (f.type === "switch") {
                resetVals[f.key] = "false";
            } else {
                resetVals[f.key] = "";
            }
        });
        setTempValues(resetVals);
    };

    const renderInput = (filter: FilterConfig, localValues: Record<string, string>, setLocalValues: (k: string, v: string) => void) => {
        if (filter.type === "text") {
            return (
                <div key={filter.key} className={cn("relative w-full", filter.className)}>
                    {filter.key.includes("search") || filter.key === "q" ? (
                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    ) : null}
                    <Input
                        placeholder={filter.placeholder || filter.label}
                        value={localValues[filter.key] || ""}
                        onChange={(e) => setLocalValues(filter.key, e.target.value)}
                        className={filter.key.includes("search") || filter.key === "q" ? "pl-9" : ""}
                    />
                </div>
            );
        }

        if (filter.type === "select") {
            return (
                <div key={filter.key} className={cn("w-full", filter.className)}>
                    <Select
                        value={localValues[filter.key] || "all"}
                        onValueChange={(val) => setLocalValues(filter.key, val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={filter.label || filter.placeholder || "Selecione"} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {filter.options?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            );
        }
        if (filter.type === "switch") {
            return (
                <div key={filter.key} className={cn("flex items-center space-x-2", filter.className)}>
                    <Switch
                        id={filter.key}
                        checked={localValues[filter.key] === "true"}
                        onCheckedChange={(checked) => setLocalValues(filter.key, String(checked))}
                    />
                    <label
                        htmlFor={filter.key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        {filter.label}
                    </label>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={cn("w-full", className)}>
            {/* Desktop View: Inline Grid/Flex - Modified to limit components */}
            <div className="hidden md:flex flex-wrap gap-4 items-center w-full">
                {/* Always render first filter inline */}
                {filters.length > 0 && renderInput(filters[0], values, onChange)}

                {/* If more than 1 filter, show button to open modal */}
                {filters.length > 1 && (
                    <Button
                        variant="outline"
                        className={cn(
                            "flex gap-2 items-center px-4",
                            activeFiltersCount > 0 && "border-primary text-primary bg-primary/5"
                        )}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Filter size={18} />
                        Filtros
                        {activeFiltersCount > 0 && (
                            <span className="bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                                {activeFiltersCount}
                            </span>
                        )}
                    </Button>
                )}

                {onClear && activeFiltersCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="text-gray-500 hover:text-red-500"
                    >
                        Limpar filtros
                    </Button>
                )}
            </div>

            {/* Mobile View: Search + Filter Button */}
            <div className="flex md:hidden gap-3 w-full">
                {/* Always show primary search if exists */}
                {filters.find(f => f.type === 'text') && (
                    <div className="flex-1">
                        {renderInput(filters.find(f => f.type === 'text')!, values, onChange)}
                    </div>
                )}

                <Button
                    variant="outline"
                    className={cn(
                        "flex gap-2 items-center px-4",
                        activeFiltersCount > 0 && "border-primary text-primary bg-primary/5"
                    )}
                    onClick={() => setIsModalOpen(true)}
                >
                    <Filter size={18} />
                    {activeFiltersCount > 0 && (
                        <span className="bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                            {activeFiltersCount}
                        </span>
                    )}
                </Button>
            </div>

            {/* Mobile Modal - Deferred Mode */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Filtrar Resultados"
                footer={
                    <div className="flex flex-col sm:flex-row w-full gap-3">
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={handleLocalClear}
                        >
                            Limpar
                        </Button>
                        <Button
                            className="w-full sm:w-auto"
                            onClick={handleApply}
                        >
                            Aplicar
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6 pt-2">
                    {filters.map((filter) => {
                        // Skip primary search if it is showing outside?
                        // User wants "Modal for filters". Usually primary search stays outside.
                        // Let's filter out 'search'/'q' from modal if they are already visible outside?
                        // Or show everything in modal for completeness?
                        // If I search "Ana", open modal, I expect to see "Ana" in the search box in modal.
                        // I will render ALL filters in modal, bound to tempValues.

                        // Skip duplicates if desired, but editable full state is better.
                        // However, having two search bars (one under button, one in modal) might be confusing if they desync (one is buffer).
                        // We will hide the one that is clearly the "main search" (first text input) to avoid confusion?
                        // Actually, the user asked to "use Componente de Modal para filtro".
                        // If I hide the main search from the modal, it's fine.

                        const isMainSearch = filter.type === 'text' && (filter.key === 'search' || filter.key === 'q' || filter.key === 'searchTerm');
                        // On desktop, we show filters[0] outside. If filters[0] is this search, we hide it here.
                        // If filters[0] is something else, we might duplicate it.
                        // Let's refine this: If this filter is the same key as filters[0], hide it?
                        // But on mobile, we hide main search too (line 165 shows it outside).
                        // So the rule "Hide main search in modal" stands for both.
                        if (isMainSearch) return null;

                        return (
                            <div key={filter.key} className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    {filter.label || filter.placeholder}
                                </label>
                                {renderInput(
                                    { ...filter, className: "w-full" },
                                    tempValues,
                                    (k, v) => setTempValues(prev => ({ ...prev, [k]: v }))
                                )}
                            </div>
                        );
                    })}
                </div>
            </Modal>
        </div>
    );
}
