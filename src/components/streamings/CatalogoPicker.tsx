"use client";

import { cn } from "@/lib/utils";
import { StreamingLogo } from "@/components/ui/streaming-logo";

interface CatalogoItem {
    id: number;
    nome: string;
    iconeUrl: string | null;
    corPrimaria: string;
}

interface CatalogoPickerProps {
    items: CatalogoItem[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function CatalogoPicker({ items, value, onChange, disabled }: CatalogoPickerProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((item) => {
                const isActive = value === String(item.id);
                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => !disabled && onChange(String(item.id))}
                        className={cn(
                            "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                            isActive
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-gray-100 hover:border-gray-200 bg-white",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <StreamingLogo
                            name={item.nome}
                            color={item.corPrimaria}
                            iconeUrl={item.iconeUrl}
                            size="lg"
                            className="shadow-md"
                        />
                        <span className={cn(
                            "text-xs font-bold truncate w-full text-center",
                            isActive ? "text-primary" : "text-gray-600"
                        )}>
                            {item.nome}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
