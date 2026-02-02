/**
 * Shared types and interfaces for Zustand stores
 */

import type { Streaming, Assinatura, Cobranca, Participante, StreamingCatalogo, StatusCobranca } from "@prisma/client";

// Base store state with loading and error handling
export interface StoreState<T> {
    data: T;
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
}

// Common store actions
export interface StoreActions {
    reset: () => void;
    clearError: () => void;
}

// Extended types with relations for client-side usage
// Note: valorIntegral comes as 'any' due to Prisma Decimal serialization
export type StreamingWithRelations = Omit<Streaming, 'valorIntegral'> & {
    valorIntegral: any;
    catalogo: StreamingCatalogo;
    _count?: {
        assinaturas: number;
    };
};

export type AssinaturaWithRelations = Omit<Assinatura, 'valor'> & {
    valor: any;
    participante: Participante;
    streaming: {
        id: number;
        valorIntegral: any;
        limiteParticipantes: number;
        catalogo: {
            nome: string;
            iconeUrl: string | null;
            corPrimaria: string;
        };
    };
};

export type CobrancaWithRelations = Omit<Cobranca, 'valor'> & {
    valor: any;
    assinatura: {
        id: number;
        valor: any;
        frequencia: string;
        participanteId: number;
        participante: {
            nome: string;
            whatsappNumero: string | null;
            contaId: number;
        };
        streaming: {
            id: number;
            catalogo: {
                nome: string;
            };
        };
    };
};

// Filters
export interface StreamingFilters {
    searchTerm: string;
    catalogoId?: number;
}

export interface CobrancaFilters {
    status?: StatusCobranca;
    participanteId?: number;
    mes?: number;
    ano?: number;
}

// Dashboard Stats
export interface DashboardStats {
    monthlyRevenue: number;
    activeParticipantsCount: number;
    occupationRate: number;
    defaultRate: number;
}

// KPIs Financeiros
export interface KPIsFinanceiros {
    totalPendente: number;
    receitaConfirmada: number;
    emAtraso: number;
    totalCobrancas: number;
}
