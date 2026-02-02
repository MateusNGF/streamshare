"use client";

import { cn } from "@/lib/utils";

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
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                            style={{ backgroundColor: item.corPrimaria }}
                        >
                            {item.iconeUrl ? (
                                <img src={item.iconeUrl} alt={item.nome} className="w-8 h-8 object-contain brightness-0 invert" />
                            ) : (
                                item.nome.charAt(0).toUpperCase()
                            )}
                        </div>
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
