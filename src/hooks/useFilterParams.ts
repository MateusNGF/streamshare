"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function useFilterParams() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateFilters = (newFilters: Record<string, any>) => {
        const params = new URLSearchParams(searchParams.toString());

        // Reset pagination to 1 when filters change natively
        if (params.has("page")) {
            params.set("page", "1");
        }

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value === undefined || value === null || value === 'all' || value === '' || value === 'false') {
                params.delete(key);
            } else {
                // Serialização ACID: garante que o estado da URL seja uma string válida
                params.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
            }
        });

        router.push(`?${params.toString()}`, { scroll: false });
    };

    return {
        filters: Object.fromEntries(searchParams.entries()),
        updateFilters
    };
}
