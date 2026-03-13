import { StatusCobranca, StatusAssinatura } from "@prisma/client";

export class FilterService {
    /**
     * Builds the where clause for Assinaturas based on common filters.
     */
    static buildAssinaturaWhere(contaId: number, filters?: {
        status?: string;
        streamingId?: string;
        participanteId?: string;
        searchTerm?: string;
        dataInicioRange?: string;
        dataVencimentoRange?: string;
        valorMin?: number;
        valorMax?: number;
        hasWhatsapp?: boolean;
    }) {
        const where: any = {
            participante: { contaId },
        };

        if (filters?.status && filters.status !== "all") {
            where.status = filters.status;
        } else {
            where.status = { not: StatusAssinatura.cancelada };
        }

        if (filters?.streamingId && filters.streamingId !== "all") {
            where.streamingId = parseInt(filters.streamingId);
        }

        if (filters?.participanteId && filters.participanteId !== "all") {
            where.participanteId = parseInt(filters.participanteId);
        }

        if (filters?.searchTerm && filters.searchTerm.trim() !== "") {
            where.participante = {
                ...where.participante,
                nome: {
                    contains: filters.searchTerm,
                    mode: 'insensitive'
                }
            };
        }

        if (filters?.valorMin !== undefined || filters?.valorMax !== undefined) {
            where.valor = {};
            if (filters.valorMin !== undefined) where.valor.gte = filters.valorMin;
            if (filters.valorMax !== undefined) where.valor.lte = filters.valorMax;
        }

        if (filters?.hasWhatsapp !== undefined) {
            where.participante = {
                ...where.participante,
                whatsappNumero: filters.hasWhatsapp ? { not: null } : null
            };
        }

        this.applyDateRange(where, "dataInicio", filters?.dataInicioRange);

        if (filters?.dataVencimentoRange) {
            try {
                const range = JSON.parse(filters.dataVencimentoRange);
                if (range.from || range.to) {
                    where.cobrancas = {
                        some: {
                            dataVencimento: {}
                        }
                    };
                    if (range.from) where.cobrancas.some.dataVencimento.gte = new Date(range.from);
                    if (range.to) where.cobrancas.some.dataVencimento.lte = new Date(range.to);
                }
            } catch (e) {
                console.error("Error parsing dataVencimentoRange", e);
            }
        }

        return where;
    }

    /**
     * Builds the where clause for Cobranças based on common filters.
     */
    static buildCobrancaWhere(contaId: number, filters?: {
        status?: StatusCobranca;
        participanteId?: number;
        mes?: number;
        ano?: number;
        valorMin?: number;
        valorMax?: number;
        hasWhatsapp?: boolean;
    }) {
        const where: any = {
            assinatura: {
                participante: { contaId }
            }
        };

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.participanteId) {
            where.assinatura = {
                ...where.assinatura,
                participanteId: filters.participanteId
            };
        }

        if (filters?.mes && filters?.ano) {
            const startDate = new Date(filters.ano, filters.mes - 1, 1);
            const endDate = new Date(filters.ano, filters.mes, 0, 23, 59, 59);
            where.periodoFim = { gte: startDate, lte: endDate };
        }

        if (filters?.valorMin !== undefined || filters?.valorMax !== undefined) {
            where.valor = {};
            if (filters.valorMin !== undefined) where.valor.gte = filters.valorMin;
            if (filters.valorMax !== undefined) where.valor.lte = filters.valorMax;
        }

        if (filters?.hasWhatsapp !== undefined) {
            where.assinatura = {
                ...where.assinatura,
                participante: {
                    ...where.assinatura?.participante,
                    whatsappNumero: filters.hasWhatsapp ? { not: null } : null
                }
            };
        }

        return where;
    }

    /**
     * Builds the where clause for User Invoices (Faturas).
     */
    static buildFaturaUserWhere(userId: number, filters?: {
        status?: StatusCobranca;
        participanteId?: string
    }) {
        return {
            assinatura: {
                participante: {
                    userId,
                    ...(filters?.participanteId && filters.participanteId !== "all" ? { id: parseInt(filters.participanteId) } : {})
                }
            },
            ...(filters?.status ? { status: filters.status } : {})
        };
    }

    /**
     * Helper to apply date range filters to a where clause.
     */
    private static applyDateRange(where: any, field: string, rangeJson?: string) {
        if (!rangeJson) return;
        try {
            const range = JSON.parse(rangeJson);
            if (range.from || range.to) {
                where[field] = {};
                if (range.from) where[field].gte = new Date(range.from);
                if (range.to) where[field].lte = new Date(range.to);
            }
        } catch (e) {
            console.error(`Error parsing ${field} range`, e);
        }
    }
}
