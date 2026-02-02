/**
 * Utility functions for Zustand stores
 */

import { type StateCreator, type StoreApi } from "zustand";

/**
 * Creates typed selectors for a store
 * This allows using specific selectors to prevent unnecessary re-renders
 */
export function createSelectors<T extends object>(store: StoreApi<T>) {
    const useStore = store as StoreApi<T> & {
        use: {
            [K in keyof T]: () => T[K];
        };
    };

    useStore.use = {} as any;

    for (const k of Object.keys(store.getState())) {
        (useStore.use as any)[k] = () => store.getState()[k as keyof T];
    }

    return useStore;
}

/**
 * Calculates if cached data is stale
 * @param lastFetched - Timestamp of last fetch
 * @param maxAge - Maximum age in milliseconds (default: 5 minutes)
 */
export function isStale(lastFetched: number | null, maxAge = 5 * 60 * 1000): boolean {
    if (!lastFetched) return true;
    return Date.now() - lastFetched > maxAge;
}

/**
 * Helper to handle optimistic updates with rollback on error
 */
export async function withOptimisticUpdate<T, R>(
    optimisticUpdate: () => void,
    apiCall: () => Promise<R>,
    rollback: () => void
): Promise<R> {
    try {
        // Apply optimistic update immediately
        optimisticUpdate();

        // Execute API call
        const result = await apiCall();

        return result;
    } catch (error) {
        // Rollback on error
        rollback();
        throw error;
    }
}

/**
 * Debounce function for search and filters
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(numValue);
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json);
    } catch {
        return fallback;
    }
}
