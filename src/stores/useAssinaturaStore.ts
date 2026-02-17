/**
 * Zustand store for managing Assinaturas (Subscriptions)
 * Syncs with StreamingStore to update slot availability
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { AssinaturaWithRelations } from "./types";
import { isStale } from "./utils";
import {
    getAssinaturas as fetchAssinaturasAction,
    createAssinatura as createAssinaturaAction,
} from "@/actions/assinaturas";
import type { FrequenciaPagamento } from "@prisma/client";

interface AssinaturaStore {
    // State
    assinaturas: AssinaturaWithRelations[];
    selectedAssinatura: AssinaturaWithRelations | null;
    loading: boolean;
    error: string | null;
    lastFetched: number | null;

    // Actions
    fetchAssinaturas: (force?: boolean) => Promise<void>;
    createAssinatura: (data: {
        participanteId: number;
        streamingId: number;
        frequencia: FrequenciaPagamento;
        valor: number;
        dataInicio: string;
        cobrancaAutomaticaPaga?: boolean;
    }) => Promise<AssinaturaWithRelations>;
    selectAssinatura: (assinatura: AssinaturaWithRelations | null) => void;

    // Selectors
    getByParticipante: (participanteId: number) => AssinaturaWithRelations[];
    getByStreaming: (streamingId: number) => AssinaturaWithRelations[];
    getActiveCount: () => number;

    // Utilities
    reset: () => void;
    clearError: () => void;
}

const initialState = {
    assinaturas: [],
    selectedAssinatura: null,
    loading: false,
    error: null,
    lastFetched: null,
};

export const useAssinaturaStore = create<AssinaturaStore>()(
    devtools(
        persist(
            (set, get) => ({
                ...initialState,

                // Fetch assinaturas from server
                fetchAssinaturas: async (force = false) => {
                    const state = get();

                    // Skip if data is fresh and not forced
                    if (!force && !isStale(state.lastFetched)) {
                        return;
                    }

                    set({ loading: true, error: null });

                    try {
                        const result = await fetchAssinaturasAction();
                        if (result.success && result.data) {
                            set({
                                assinaturas: result.data as AssinaturaWithRelations[],
                                loading: false,
                                lastFetched: Date.now(),
                            });
                        } else {
                            set({
                                error: result.error || "Erro ao carregar assinaturas",
                                loading: false,
                            });
                        }
                    } catch (error) {
                        set({
                            error: error instanceof Error ? error.message : "Erro ao carregar assinaturas",
                            loading: false,
                        });
                    }
                },

                // Create new assinatura with optimistic update
                createAssinatura: async (data) => {
                    set({ loading: true, error: null });

                    try {
                        const result = await createAssinaturaAction(data);

                        if (result.success && result.data) {
                            // Add to local state
                            set((state) => ({
                                assinaturas: [result.data as AssinaturaWithRelations, ...state.assinaturas],
                                loading: false,
                                lastFetched: Date.now(),
                            }));

                            return result.data as AssinaturaWithRelations;
                        } else {
                            const errorMsg = result.error || "Erro ao criar assinatura";
                            set({ error: errorMsg, loading: false });
                            throw new Error(errorMsg);
                        }
                    } catch (error) {
                        set({
                            error: error instanceof Error ? error.message : "Erro ao criar assinatura",
                            loading: false,
                        });
                        throw error;
                    }
                },

                // Select assinatura for details/editing
                selectAssinatura: (assinatura) => {
                    set({ selectedAssinatura: assinatura });
                },

                // Selectors
                getByParticipante: (participanteId) => {
                    return get().assinaturas.filter(
                        (a) => a.participanteId === participanteId
                    );
                },

                getByStreaming: (streamingId) => {
                    return get().assinaturas.filter(
                        (a) => a.streamingId === streamingId
                    );
                },

                getActiveCount: () => {
                    return get().assinaturas.filter(
                        (a) => a.status === "ativa"
                    ).length;
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
                name: "assinatura-storage",
                partialize: (state) => ({
                    assinaturas: state.assinaturas,
                    lastFetched: state.lastFetched,
                }),
            }
        ),
        { name: "AssinaturaStore" }
    )
);
