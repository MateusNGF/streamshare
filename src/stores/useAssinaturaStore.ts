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
                        const assinaturas = await fetchAssinaturasAction();
                        set({
                            assinaturas: assinaturas as AssinaturaWithRelations[],
                            loading: false,
                            lastFetched: Date.now(),
                        });
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
                        const newAssinatura = await createAssinaturaAction(data);

                        // Add to local state
                        set((state) => ({
                            assinaturas: [newAssinatura as AssinaturaWithRelations, ...state.assinaturas],
                            loading: false,
                            lastFetched: Date.now(),
                        }));

                        // Sync with streaming store to update slot count
                        // This will be handled by the component triggering a streaming refresh

                        return newAssinatura as AssinaturaWithRelations;
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
