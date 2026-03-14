"use client";

import { useRouter } from "next/navigation";
import { useFilterParams } from "@/hooks/useFilterParams";
import { useMemo, useCallback } from "react";

/**
 * Generic hook to standardize URL-based filtering logic.
 * SOLID (SRP): Decouples filter state management from specific feature logic.
 */
export function useBaseFilter(basePath: string) {
    const router = useRouter();
    const { filters, updateFilters } = useFilterParams();

    const handleFilterChange = useCallback((key: string, value: any) => {
        updateFilters({ [key]: value });
    }, [updateFilters]);

    const handleClearFilters = useCallback(() => {
        router.push(basePath);
    }, [router, basePath]);

    return {
        filters,
        handleFilterChange,
        handleClearFilters,
        updateFilters
    };
}
