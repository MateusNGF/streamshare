import { create } from "zustand";

export interface CatalogoItem {
    id: number;
    nome: string;
    categoria: string;
    isConteudoAdulto: boolean;
    siteOficial: string | null;
    iconeUrl: string | null;
    corPrimaria: string;
    isAtivo: boolean;
}

interface CatalogoStore {
    items: CatalogoItem[];
    setItems: (items: CatalogoItem[]) => void;
    addItem: (item: CatalogoItem) => void;
    updateItem: (item: CatalogoItem) => void;
    removeItem: (id: number) => void;
}

export const useCatalogoStore = create<CatalogoStore>((set) => ({
    items: [],
    setItems: (items) => set({ items }),
    addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    updateItem: (item) => set((state) => ({
        items: state.items.map((i) => (i.id === item.id ? item : i)),
    })),
    removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
    })),
}));
