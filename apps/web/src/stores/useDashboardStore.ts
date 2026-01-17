/**
 * Zustand store for Dashboard data
 * Manages stats, recent subscriptions, and streaming overview
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { DashboardStats, AssinaturaWithRelations, StreamingWithRelations } from "./types";
import { isStale } from "./utils";
import {
    getDashboardStats as fetchStatsAction,
    getRecentSubscriptions as fetchRecentSubscriptionsAction,
    getDashboardStreamings as fetchStreamingsAction,
} from "@/actions/dashboard";

interface DashboardStore {
    // State
    stats: DashboardStats | null;
    recentSubscriptions: AssinaturaWithRelations[];
    streamings: StreamingWithRelations[];
    loadingStats: boolean;
    loadingSubscriptions: boolean;
    loadingStreamings: boolean;
    error: string | null;
    lastFetchedStats: number | null;
    lastFetchedSubscriptions: number | null;
    lastFetchedStreamings: number | null;

    // Actions
    fetchStats: (force?: boolean) => Promise<void>;
    fetchRecentSubscriptions: (force?: boolean) => Promise<void>;
    fetchStreamings: (force?: boolean) => Promise<void>;
    refreshAll: () => Promise<void>;

    // Utilities
    reset: () => void;
    clearError: () => void;
}

const initialState = {
    stats: null,
    recentSubscriptions: [],
    streamings: [],
    loadingStats: false,
    loadingSubscriptions: false,
    loadingStreamings: false,
    error: null,
    lastFetchedStats: null,
    lastFetchedSubscriptions: null,
    lastFetchedStreamings: null,
};

export const useDashboardStore = create<DashboardStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // Fetch dashboard stats
            fetchStats: async (force = false) => {
                const state = get();

                // Dashboard stats are more dynamic, so use shorter cache (1 minute)
                if (!force && !isStale(state.lastFetchedStats, 1 * 60 * 1000)) {
                    return;
                }

                set({ loadingStats: true, error: null });

                try {
                    const stats = await fetchStatsAction();
                    set({
                        stats,
                        loadingStats: false,
                        lastFetchedStats: Date.now(),
                    });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : "Erro ao carregar estatísticas",
                        loadingStats: false,
                    });
                }
            },

            // Fetch recent subscriptions
            fetchRecentSubscriptions: async (force = false) => {
                const state = get();

                if (!force && !isStale(state.lastFetchedSubscriptions, 2 * 60 * 1000)) {
                    return;
                }

                set({ loadingSubscriptions: true, error: null });

                try {
                    const subscriptions = await fetchRecentSubscriptionsAction();
                    set({
                        recentSubscriptions: subscriptions as AssinaturaWithRelations[],
                        loadingSubscriptions: false,
                        lastFetchedSubscriptions: Date.now(),
                    });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : "Erro ao carregar assinaturas",
                        loadingSubscriptions: false,
                    });
                }
            },

            // Fetch dashboard streamings (top 3)
            fetchStreamings: async (force = false) => {
                const state = get();

                if (!force && !isStale(state.lastFetchedStreamings, 5 * 60 * 1000)) {
                    return;
                }

                set({ loadingStreamings: true, error: null });

                try {
                    const streamings = await fetchStreamingsAction();
                    set({
                        streamings: streamings as StreamingWithRelations[],
                        loadingStreamings: false,
                        lastFetchedStreamings: Date.now(),
                    });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : "Erro ao carregar streamings",
                        loadingStreamings: false,
                    });
                }
            },

            // Refresh all dashboard data
            refreshAll: async () => {
                const promises = [
                    get().fetchStats(true),
                    get().fetchRecentSubscriptions(true),
                    get().fetchStreamings(true),
                ];

                await Promise.allSettled(promises);
            },

            // Utilities
            reset: () => {
                set(initialState);
            },

            clearError: () => {
                set({ error: null });
            },
        }),
        { name: "DashboardStore" }
    )
);
