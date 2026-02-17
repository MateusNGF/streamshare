/**
 * Zustand store for managing Streamings
 * Provides caching, optimistic updates, and reactive filtering
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { StreamingWithRelations, StreamingFilters } from "./types";
import { isStale } from "./utils";
import {
    getStreamings as fetchStreamingsAction,
    createStreaming as createStreamingAction,
    updateStreaming as updateStreamingAction,
    deleteStreaming as deleteStreamingAction,
} from "@/actions/streamings";

interface StreamingStore {
    // State
    streamings: StreamingWithRelations[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
    filters: StreamingFilters;

    // Actions
    fetchStreamings: (force?: boolean) => Promise<void>;
    createStreaming: (data: {
        catalogoId: number;
        apelido: string;
        valorIntegral: number;
        limiteParticipantes: number;
        isPublico?: boolean;
    }) => Promise<StreamingWithRelations>;
    updateStreaming: (
        id: number,
        data: {
            catalogoId: number;
            apelido: string;
            valorIntegral: number;
            limiteParticipantes: number;
            isPublico?: boolean;
            updateExistingSubscriptions?: boolean;
        }
    ) => Promise<{ streaming: StreamingWithRelations; updatedSubscriptions: number }>;
    deleteStreaming: (id: number) => Promise<void>;

    // Filters
    setFilters: (filters: Partial<StreamingFilters>) => void;
    clearFilters: () => void;

    // Selectors
    getFiltered: () => StreamingWithRelations[];
    getById: (id: number) => StreamingWithRelations | undefined;
    getAvailableSlots: (id: number) => number;

    // Utilities
    reset: () => void;
    clearError: () => void;
}

const initialState = {
    streamings: [],
    loading: false,
    error: null,
    lastFetched: null,
    filters: {
        searchTerm: "",
    },
};

export const useStreamingStore = create<StreamingStore>()(
    devtools(
        persist(
            (set, get) => ({
                ...initialState,

                // Fetch streamings from server
                fetchStreamings: async (force = false) => {
                    const state = get();

                    // Skip if data is fresh and not forced
                    if (!force && !isStale(state.lastFetched)) {
                        return;
                    }

                    set({ loading: true, error: null });

                    try {
                        const result = await fetchStreamingsAction();
                        if (result.success && result.data) {
                            set({
                                streamings: result.data as StreamingWithRelations[],
                                loading: false,
                                lastFetched: Date.now(),
                            });
                        } else {
                            set({
                                error: result.error || "Erro ao carregar streamings",
                                loading: false,
                            });
                        }
                    } catch (error) {
                        set({
                            error: error instanceof Error ? error.message : "Erro ao carregar streamings",
                            loading: false,
                        });
                    }
                },

                // Create new streaming with optimistic update
                createStreaming: async (data) => {
                    set({ loading: true, error: null });

                    try {
                        const result = await createStreamingAction(data);

                        if (result.success && result.data) {
                            // Add to local state
                            set((state) => ({
                                streamings: [...state.streamings, result.data as StreamingWithRelations],
                                loading: false,
                                lastFetched: Date.now(),
                            }));

                            return result.data as StreamingWithRelations;
                        } else {
                            const errorMsg = result.error || "Erro ao criar streaming";
                            set({ error: errorMsg, loading: false });
                            throw new Error(errorMsg);
                        }
                    } catch (error) {
                        set({
                            error: error instanceof Error ? error.message : "Erro ao criar streaming",
                            loading: false,
                        });
                        throw error;
                    }
                },

                // Update streaming with optimistic update
                updateStreaming: async (id, data) => {
                    const state = get();
                    const originalStreamings = state.streamings;

                    // Optimistic update
                    set((state) => ({
                        streamings: state.streamings.map((s) =>
                            s.id === id
                                ? {
                                    ...s,
                                    streamingCatalogoId: data.catalogoId,
                                    apelido: data.apelido,
                                    valorIntegral: data.valorIntegral,
                                    limiteParticipantes: data.limiteParticipantes,
                                    isPublico: data.isPublico ?? s.isPublico,
                                    // Preserve catalogo relation during optimistic update
                                    catalogo: s.catalogo,
                                }
                                : s
                        ),
                        loading: true,
                        error: null,
                    }));

                    try {
                        const result = await updateStreamingAction(id, data);

                        if (result.success && result.data) {
                            // Update with server response
                            set((state) => ({
                                streamings: state.streamings.map((s) =>
                                    s.id === id ? { ...s, ...result.data.streaming } : s
                                ),
                                loading: false,
                                lastFetched: Date.now(),
                            }));

                            return {
                                streaming: result.data.streaming as StreamingWithRelations,
                                updatedSubscriptions: result.data.updatedSubscriptions,
                            };
                        } else {
                            const errorMsg = result.error || "Erro ao atualizar streaming";
                            // Rollback on error
                            set({
                                streamings: originalStreamings,
                                error: errorMsg,
                                loading: false,
                            });
                            throw new Error(errorMsg);
                        }
                    } catch (error) {
                        // Rollback on error
                        set({
                            streamings: originalStreamings,
                            error: error instanceof Error ? error.message : "Erro ao atualizar streaming",
                            loading: false,
                        });
                        throw error;
                    }
                },

                // Delete streaming with optimistic update
                deleteStreaming: async (id) => {
                    const state = get();
                    const originalStreamings = state.streamings;

                    // Optimistic update
                    set((state) => ({
                        streamings: state.streamings.filter((s) => s.id !== id),
                        loading: true,
                        error: null,
                    }));

                    try {
                        const result = await deleteStreamingAction(id);

                        if (result.success) {
                            set({
                                loading: false,
                                lastFetched: Date.now(),
                            });
                        } else {
                            const errorMsg = result.error || "Erro ao deletar streaming";
                            set({
                                streamings: originalStreamings,
                                error: errorMsg,
                                loading: false,
                            });
                            throw new Error(errorMsg);
                        }
                    } catch (error) {
                        // Rollback on error
                        set({
                            streamings: originalStreamings,
                            error: error instanceof Error ? error.message : "Erro ao deletar streaming",
                            loading: false,
                        });
                        throw error;
                    }
                },

                // Filter management
                setFilters: (newFilters) => {
                    set((state) => ({
                        filters: { ...state.filters, ...newFilters },
                    }));
                },

                clearFilters: () => {
                    set({ filters: initialState.filters });
                },

                // Selectors
                getFiltered: () => {
                    const { streamings, filters } = get();

                    return streamings.filter((streaming) => {
                        // Search term filter - now searches apelido too
                        if (filters.searchTerm) {
                            const searchLower = filters.searchTerm.toLowerCase();
                            const matchesApelido = streaming.apelido
                                ?.toLowerCase()
                                .includes(searchLower);
                            const matchesCatalogo = streaming.catalogo?.nome
                                ?.toLowerCase()
                                .includes(searchLower);
                            if (!matchesApelido && !matchesCatalogo) return false;
                        }

                        // Catalogo filter
                        if (filters.catalogoId && streaming.streamingCatalogoId !== filters.catalogoId) {
                            return false;
                        }

                        // Only Full Groups filter
                        if (filters.onlyFull) {
                            const occupied = streaming._count?.assinaturas || 0;
                            if (occupied < streaming.limiteParticipantes) {
                                return false;
                            }
                        }

                        return true;
                    });
                },

                getById: (id) => {
                    return get().streamings.find((s) => s.id === id);
                },

                getAvailableSlots: (id) => {
                    const streaming = get().streamings.find((s) => s.id === id);
                    if (!streaming) return 0;

                    const occupied = streaming._count?.assinaturas || 0;
                    return streaming.limiteParticipantes - occupied;
                },

                // Utilities
                reset: () => {
                    set(initialState);
                },

                clearError: () => {
                    set({ error: null });
                },
            }),
            {
                name: "streaming-storage",
                partialize: (state) => ({
                    // Only persist streamings and filters, not loading/error states
                    streamings: state.streamings,
                    filters: state.filters,
                    lastFetched: state.lastFetched,
                }),
            }
        ),
        { name: "StreamingStore" }
    )
);
