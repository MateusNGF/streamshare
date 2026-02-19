"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { CATALOGO_CATEGORIES } from "@/constants/catalogo";
import { Search } from "lucide-react";

interface CatalogoItem {
    id: number;
    nome: string;
    categoria: string;
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
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesCategory = selectedCategory === "all" || item.categoria === selectedCategory;
            const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [items, selectedCategory, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar serviço..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                {/* Category Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-1 px-1">
                    <button
                        type="button"
                        onClick={() => setSelectedCategory("all")}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border-2",
                            selectedCategory === "all"
                                ? "bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105"
                                : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                        )}
                    >
                        Tudo
                    </button>
                    {CATALOGO_CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border-2",
                                selectedCategory === cat.id
                                    ? "bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105"
                                    : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                            )}
                        >
                            {cat.shortLabel}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1 custom-scrollbar">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                        const isActive = value === String(item.id);
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => !disabled && onChange(String(item.id))}
                                className={cn(
                                    "group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all relative overflow-hidden",
                                    isActive
                                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/10"
                                        : "border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50",
                                    disabled && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <StreamingLogo
                                    name={item.nome}
                                    color={item.corPrimaria}
                                    iconeUrl={item.iconeUrl}
                                    size="lg"
                                    className={cn(
                                        "shadow-md transition-transform duration-300",
                                        isActive ? "scale-110" : "group-hover:scale-105"
                                    )}
                                />
                                <span className={cn(
                                    "text-xs font-bold truncate w-full text-center tracking-tight",
                                    isActive ? "text-primary" : "text-gray-600"
                                )}>
                                    {item.nome}
                                </span>
                                {isActive && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                                )}
                            </button>
                        );
                    })
                ) : (
                    <div className="col-span-full py-12 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                        <p className="text-sm text-gray-400 font-medium">Nenhum serviço encontrado</p>
                    </div>
                )}
            </div>
        </div>
    );
}
