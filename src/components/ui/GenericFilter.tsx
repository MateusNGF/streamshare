import { useState, useEffect, useMemo, useId } from "react";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Modal } from "@/components/ui/Modal";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { DateRange } from "react-day-picker";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

export interface FilterOption {
    label: string;
    value: string;
    iconNode?: React.ReactNode;
}

export interface FilterConfig {
    key: string;
    type: "text" | "select" | "switch" | "dateRange" | "numberRange";
    label?: string; // Placeholder for inputs, Label for selects
    placeholder?: string;
    options?: FilterOption[]; // For select
    emptyLabel?: string; // Label for "All", empty by default
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

    // Stable reference for values
    const memoizedValues = useMemo(() => values, [JSON.stringify(values)]);
    const [tempValues, setTempValues] = useState<Record<string, string>>(memoizedValues);

    // Sync temp values when modal opens or values change externally
    useEffect(() => {
        if (isModalOpen) {
            setTempValues({ ...memoizedValues });
        }
    }, [isModalOpen, memoizedValues]);

    // Count active filters
    const activeFiltersCount = Object.values(memoizedValues).filter(v => v !== undefined && v !== null && v !== "" && v !== "all" && v !== "false").length;

    const handleApply = () => {
        // Apply all temp values
        Object.entries(tempValues).forEach(([key, value]) => {
            if (memoizedValues[key] !== value) {
                onChange(key, value);
            }
        });
        setIsModalOpen(false);
    };

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

        // Immediately apply
        Object.entries(resetVals).forEach(([key, value]) => {
            if (memoizedValues[key] !== value) {
                onChange(key, value);
            }
        });

        setIsModalOpen(false);
    };

    const rootId = useId();

    const renderInput = (filter: FilterConfig, localValues: Record<string, string>, setLocalValues: (k: string, v: string) => void, isDebounced = false, autoFocus = false, idSuffix = "") => {
        const inputId = `${rootId}-${filter.key}${idSuffix}`;

        if (filter.type === "text") {
            return (
                <DebouncedInput
                    key={filter.key}
                    filter={filter}
                    localValues={localValues}
                    setLocalValues={setLocalValues}
                    isDebounced={isDebounced}
                    autoFocus={autoFocus}
                    id={inputId}
                />
            );
        }

        if (filter.type === "select") {
            return (
                <div key={filter.key} className={cn("w-full", filter.className)}>
                    <Select
                        value={localValues[filter.key] || "all"}
                        onValueChange={(val) => setLocalValues(filter.key, val)}
                    >
                        <SelectTrigger id={inputId} aria-label={filter.label || filter.placeholder || "Selecione uma opção"} className="bg-gray-50/50 border-gray-100 rounded-xl hover:border-gray-200 transition-all h-auto py-2">
                            <SelectValue placeholder={filter.label || filter.placeholder || "Selecione"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-gray-100 shadow-xl max-h-80">
                            <SelectItem value="all">{filter.emptyLabel || "Todos"}</SelectItem>
                            {filter.options?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    <div className="flex items-center gap-3 w-full">
                                        {opt.iconNode ? (
                                            <div className="flex items-center justify-center shrink-0 w-5 h-5">
                                                {opt.iconNode}
                                            </div>
                                        ) : null}
                                        <span className="font-medium truncate">{opt.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            );
        }
        if (filter.type === "switch") {
            return (
                <div key={filter.key} className={cn("flex items-center space-x-3 bg-gray-50/50 px-3 py-2 rounded-xl border border-gray-100", filter.className)}>
                    <Switch
                        id={inputId}
                        checked={localValues[filter.key] === "true"}
                        onCheckedChange={(checked) => setLocalValues(filter.key, String(checked))}
                        aria-label={filter.label}
                    />
                    <label
                        htmlFor={inputId}
                        className="text-sm font-semibold text-gray-600 cursor-pointer select-none"
                    >
                        {filter.label}
                    </label>
                </div>
            );
        }
        if (filter.type === "dateRange") {
            let range: DateRange | undefined = undefined;
            try {
                if (localValues[filter.key]) {
                    const parsed = JSON.parse(localValues[filter.key]);
                    range = {
                        from: parsed.from ? new Date(parsed.from) : undefined,
                        to: parsed.to ? new Date(parsed.to) : undefined
                    };
                }
            } catch (e) {
                console.error("Error parsing date range", e);
            }

            return (
                <div key={filter.key} className={cn("w-full", filter.className)}>
                    <DateRangePicker
                        value={range}
                        onChange={(newRange) => {
                            setLocalValues(filter.key, newRange ? JSON.stringify(newRange) : "");
                        }}
                        placeholder={filter.label || filter.placeholder}
                    />
                </div>
            );
        }

        if (filter.type === "numberRange") {
            let minVal = 0;
            let maxVal = 200; // Safe default for values
            let currentVal: [number, number] = [0, 200];

            try {
                if (localValues[filter.key]) {
                    const parsed = JSON.parse(localValues[filter.key]);
                    currentVal = [
                        parsed.min !== undefined ? Number(parsed.min) : 0,
                        parsed.max !== undefined ? Number(parsed.max) : 200
                    ];
                }
            } catch (e) { }

            return (
                <div key={filter.key} className={cn("px-2 pt-2 pb-6", filter.className)}>
                    <RangeSlider
                        min={0}
                        max={500}
                        step={5}
                        value={currentVal}
                        onValueChange={(vals) => {
                            const newRange = { min: vals[0], max: vals[1] };
                            setLocalValues(filter.key, JSON.stringify(newRange));
                        }}
                        formatValue={(v) => `R$ ${v}`}
                    />
                </div>
            );
        }
        return null;
    };

    return (
        <div className={cn("w-full", className)}>
            {/* Desktop View: Inline Grid/Flex - Modified to limit components */}
            <div className="hidden md:flex flex-wrap gap-4 items-center w-full">
                {/* Always render first filter inline - text input debounced */}
                {filters.length > 0 && renderInput(filters[0], values, onChange, true)}

                {/* If more than 1 filter, show button to open modal */}
                {filters.length > 1 && (
                    <Button
                        variant="outline"
                        type="button"
                        aria-label={`Filtros adicionais${activeFiltersCount > 0 ? `, ${activeFiltersCount} ativos` : ''}`}
                        className={cn(
                            "flex gap-2 items-center px-4",
                            activeFiltersCount > 0 && "border-primary text-primary bg-primary/5"
                        )}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Filter size={18} aria-hidden="true" />
                        Filtros
                        {activeFiltersCount > 0 && (
                            <span className="bg-primary text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full" aria-hidden="true">
                                {activeFiltersCount}
                            </span>
                        )}
                    </Button>
                )}

                {onClear && activeFiltersCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={onClear}
                        className="text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Limpar todos os filtros"
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
                        {renderInput(filters.find(f => f.type === 'text')!, values, onChange, true)}
                    </div>
                )}

                <Button
                    variant="outline"
                    type="button"
                    aria-label={`Filtros adicionais${activeFiltersCount > 0 ? `, ${activeFiltersCount} ativos` : ''}`}
                    className={cn(
                        "flex gap-2 items-center px-4",
                        activeFiltersCount > 0 && "border-primary text-primary bg-primary/5"
                    )}
                    onClick={() => setIsModalOpen(true)}
                >
                    <Filter size={18} aria-hidden="true" />
                    {activeFiltersCount > 0 && (
                        <span className="bg-primary text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full" aria-hidden="true">
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
                    <div className="flex flex-col sm:flex-row-reverse w-full gap-3">
                        <Button
                            className="w-full sm:w-auto"
                            onClick={handleApply}
                        >
                            Aplicar
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            className="w-full sm:w-auto"
                            onClick={handleLocalClear}
                        >
                            Limpar
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6 pt-2">
                    {filters.map((filter, index) => {
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

                        const inputId = `${rootId}-${filter.key}-modal`;

                        return (
                            <div key={filter.key} className="space-y-2">
                                <label htmlFor={inputId} className="text-sm font-medium text-gray-700 cursor-pointer">
                                    {filter.label || filter.placeholder}
                                </label>
                                {renderInput(
                                    { ...filter, className: "w-full" },
                                    tempValues,
                                    (k, v) => setTempValues(prev => ({ ...prev, [k]: v })),
                                    false, // No debounce in modal since we use Apply manually
                                    index === 0, // AutoFocus no primeiro elemento viável
                                    "-modal"
                                )}
                            </div>
                        );
                    })}
                </div>
            </Modal>
        </div>
    );
}

// Helper para debouncer na interface
function DebouncedInput({
    filter,
    localValues,
    setLocalValues,
    isDebounced,
    autoFocus,
    id
}: {
    filter: FilterConfig;
    localValues: Record<string, string>;
    setLocalValues: (k: string, v: string) => void;
    isDebounced: boolean;
    autoFocus?: boolean;
    id?: string;
}) {
    const [innerValue, setInnerValue] = useState(localValues[filter.key] || "");
    const debouncedValue = useDebounce(innerValue, 400);

    // Sync from props
    useEffect(() => {
        setInnerValue(localValues[filter.key] || "");
    }, [localValues[filter.key]]);

    // Sync to parent if debounced
    useEffect(() => {
        if (isDebounced && debouncedValue !== localValues[filter.key]) {
            setLocalValues(filter.key, debouncedValue);
        }
    }, [debouncedValue, isDebounced]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInnerValue(e.target.value);
        if (!isDebounced) {
            setLocalValues(filter.key, e.target.value);
        }
    };

    return (
        <div className={cn("relative w-full group", filter.className)}>
            {filter.key.includes("search") || filter.key === "q" || filter.key === "searchTerm" ? (
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" aria-hidden="true" />
            ) : null}
            <Input
                id={id}
                autoFocus={autoFocus}
                placeholder={filter.placeholder || filter.label}
                value={innerValue}
                onChange={handleChange}
                aria-label={filter.placeholder || filter.label || "Campo de busca"}
                className={cn(
                    "bg-gray-50/50 border-gray-100 hover:border-gray-200 focus:bg-white transition-all rounded-xl",
                    (filter.key.includes("search") || filter.key === "q" || filter.key === "searchTerm") ? "pl-9" : ""
                )}
            />
        </div>
    );
}
