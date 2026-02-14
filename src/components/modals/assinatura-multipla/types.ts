import { FrequenciaPagamento } from "@prisma/client";

export interface StreamingOption {
    id: number;
    nome: string;
    apelido?: string;
    catalogoNome?: string;
    valorIntegral: number;
    limiteParticipantes: number;
    ocupados: number;
    cor: string;
    iconeUrl?: string | null;
    frequenciasHabilitadas: string;
}

export interface ParticipanteOption {
    id: number;
    nome: string;
    whatsappNumero: string;
    quantidade?: number;
}

export interface SelectedStreaming {
    streamingId: number;
    frequencia: FrequenciaPagamento;
    valor: string;
}

export enum ModalStep {
    STREAMING = 1,
    VALUES = 2,
    PARTICIPANTS = 3,
    SUMMARY = 4
}
