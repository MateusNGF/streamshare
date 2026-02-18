export interface Participante {
    id: number;
    nome: string;
    whatsappNumero: string | null;
    cpf: string | null;
    email?: string | null;
    userId?: number | null;
    status: string;
    _count: {
        assinaturas: number;
    };
}

export interface Streaming {
    id: number;
    apelido: string | null;
    catalogo: {
        nome: string;
        corPrimaria?: string | null;
        iconeUrl?: string | null;
    };
    vagasRestantes: number;
}

export interface PendingRequest {
    id: string; // Mudou para string (UUID do Convite)
    email: string | null;
    usuario?: {
        nome: string;
        email: string;
    } | null;
    streaming?: {
        id: number;
        apelido: string | null;
        catalogo: {
            nome: string;
            corPrimaria?: string | null;
            iconeUrl?: string | null;
        };
    } | null;
}

export interface PendingInvite {
    id: string;
    email: string;
    streamingId?: number | null;
    streaming?: {
        apelido: string | null;
        catalogo: {
            nome: string;
            corPrimaria?: string | null;
            iconeUrl?: string | null;
        };
    } | null;
}
