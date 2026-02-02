/**
 * Zustand store for managing Cobranças (Charges/Billings)
 * Handles filtering, KPIs, and payment confirmations
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { CobrancaWithRelations, CobrancaFilters, KPIsFinanceiros } from "./types";
import { isStale } from "./utils";
import {
    getCobrancas as fetchCobrancasAction,
    confirmarPagamento as confirmarPagamentoAction,
    getKPIsFinanceiros as fetchKPIsAction,
    enviarNotificacaoCobranca as enviarNotificacaoAction,
} from "@/actions/cobrancas";
import type { StatusCobranca } from "@prisma/client";

interface CobrancaStore {
    // State
    cobrancas: CobrancaWithRelations[];
    kpis: KPIsFinanceiros | null;
    loading: boolean;
    loadingKPIs: boolean;
    error: string | null;
    lastFetched: number | null;
    lastFetchedKPIs: number | null;
    filters: CobrancaFilters;

    // Actions
    fetchCobrancas: (force?: boolean) => Promise<void>;
    fetchKPIs: (force?: boolean) => Promise<void>;
    confirmarPagamento: (cobrancaId: number, comprovanteUrl?: string) => Promise<void>;
    enviarNotificacao: (cobrancaId: number) => Promise<{ success: boolean; manualLink?: string; message?: string }>;

    // Filters
    setFilters: (filters: Partial<CobrancaFilters>) => void;
    clearFilters: () => void;

    // Selectors
    getFiltered: () => CobrancaWithRelations[];
    getByStatus: (status: StatusCobranca) => CobrancaWithRelations[];
    getPendentes: () => CobrancaWithRelations[];
    getAtrasadas: () => CobrancaWithRelations[];

    // Utilities
    reset: () => void;
    clearError: () => void;
}

const initialState = {
    cobrancas: [],
    kpis: null,
    loading: false,
    loadingKPIs: false,
    error: null,
    lastFetched: null,
    lastFetchedKPIs: null,
    filters: {},
};

export const useCobrancaStore = create<CobrancaStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // Fetch cobrancas from server
            fetchCobrancas: async (force = false) => {
                const state = get();

                // Skip if data is fresh and not forced
                if (!force && !isStale(state.lastFetched, 2 * 60 * 1000)) {
                    // 2 minutes for billing data
                    return;
                }

                set({ loading: true, error: null });

                try {
                    const cobrancas = await fetchCobrancasAction(state.filters);
                    set({
                        cobrancas: cobrancas as CobrancaWithRelations[],
                        loading: false,
                        lastFetched: Date.now(),
                    });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : "Erro ao carregar cobranças",
                        loading: false,
                    });
                }
            },

            // Fetch KPIs
            fetchKPIs: async (force = false) => {
                const state = get();

                if (!force && !isStale(state.lastFetchedKPIs, 2 * 60 * 1000)) {
                    return;
                }

                set({ loadingKPIs: true });

                try {
                    const kpis = await fetchKPIsAction();
                    set({
                        kpis,
                        loadingKPIs: false,
                        lastFetchedKPIs: Date.now(),
                    });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : "Erro ao carregar KPIs",
                        loadingKPIs: false,
                    });
                }
            },

            // Confirm payment with optimistic update
            confirmarPagamento: async (cobrancaId, comprovanteUrl) => {
                const state = get();
                const originalCobrancas = state.cobrancas;

                // Optimistic update
                set((state) => ({
                    cobrancas: state.cobrancas.map((c) =>
                        c.id === cobrancaId
                            ? {
                                ...c,
                                status: "pago" as StatusCobranca,
                                dataPagamento: new Date(),
                                comprovanteUrl: comprovanteUrl || c.comprovanteUrl,
                            }
                            : c
                    ),
                    loading: true,
                    error: null,
                }));

                try {
                    await confirmarPagamentoAction(cobrancaId, comprovanteUrl);

                    set({
                        loading: false,
                        lastFetched: Date.now(),
                    });

                    // Refresh KPIs after payment confirmation
                    get().fetchKPIs(true);
                } catch (error) {
                    // Rollback on error
                    set({
                        cobrancas: originalCobrancas,
                        error: error instanceof Error ? error.message : "Erro ao confirmar pagamento",
                        loading: false,
                    });
                    throw error;
                }
            },

            // Send WhatsApp notification
            enviarNotificacao: async (cobrancaId) => {
                set({ loading: true, error: null });

                try {
                    const result = await enviarNotificacaoAction(cobrancaId);

                    set({
                        loading: false,
                    });

                    return result;
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : "Erro ao enviar notificação",
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

                // Automatically refetch with new filters
                get().fetchCobrancas(true);
            },

            clearFilters: () => {
                set({ filters: initialState.filters });
                get().fetchCobrancas(true);
            },

            // Selectors
            getFiltered: () => {
                const { cobrancas, filters } = get();

                return cobrancas.filter((cobranca) => {
                    // Status filter
                    if (filters.status && cobranca.status !== filters.status) {
                        return false;
                    }

                    // Participante filter
                    if (
                        filters.participanteId &&
                        cobranca.assinatura.participanteId !== filters.participanteId
                    ) {
                        return false;
                    }

                    // Month/Year filter
                    if (filters.mes && filters.ano) {
                        const cobrancaDate = new Date(cobranca.periodoFim);
                        if (
                            cobrancaDate.getMonth() + 1 !== filters.mes ||
                            cobrancaDate.getFullYear() !== filters.ano
                        ) {
                            return false;
                        }
                    }

                    return true;
                });
            },

            getByStatus: (status) => {
                return get().cobrancas.filter((c) => c.status === status);
            },

            getPendentes: () => {
                return get().cobrancas.filter((c) => c.status === "pendente");
            },

            getAtrasadas: () => {
                return get().cobrancas.filter((c) => c.status === "atrasado");
            },

            // Utilities
            reset: () => {
                set(initialState);
            },

            clearError: () => {
                set({ error: null });
            },
        }),
        { name: "CobrancaStore" }
    )
);
