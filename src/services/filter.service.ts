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

        if (filters?.status && filters.status !== "all" as any) {
            where.status = filters.status;
        }

        if (filters?.participanteId && filters.participanteId !== "all" as any) {
            where.assinatura = {
                ...where.assinatura,
                participanteId: Number(filters.participanteId)
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
        participanteId?: string;
        q?: string;
        streaming?: string;
        organizador?: string;
        vencimento?: string;
        valor?: string;
    }) {
        const where: any = {
            assinatura: {
                participante: {
                    userId
                }
            }
        };

        if (filters?.status && filters.status !== "all" as any) {
            where.status = filters.status;
        }

        if (filters?.q && filters.q.trim() !== "") {
            const search = filters.q.trim();
            where.OR = [
                {
                    assinatura: {
                        streaming: {
                            OR: [
                                { apelido: { contains: search, mode: 'insensitive' } },
                                { catalogo: { nome: { contains: search, mode: 'insensitive' } } }
                            ]
                        }
                    }
                },
                {
                    assinatura: {
                        participante: {
                            conta: {
                                nome: { contains: search, mode: 'insensitive' }
                            }
                        }
                    }
                }
            ];
        }

        if (filters?.streaming && filters.streaming !== "all") {
            where.assinatura.streamingId = parseInt(filters.streaming);
        }

        if (filters?.organizador && filters.organizador !== "all") {
            where.assinatura.participante = {
                ...where.assinatura.participante,
                contaId: parseInt(filters.organizador)
            };
        }

        if (filters?.vencimento) {
            try {
                const range = JSON.parse(filters.vencimento);
                if (range.from || range.to) {
                    where.dataVencimento = {};
                    if (range.from) where.dataVencimento.gte = new Date(range.from);
                    if (range.to) where.dataVencimento.lte = new Date(range.to);
                }
            } catch (e) { }
        }

        if (filters?.valor) {
            try {
                const range = JSON.parse(filters.valor);
                if (range.min !== undefined || range.max !== undefined) {
                    where.valor = {};
                    if (range.min !== undefined) where.valor.gte = Number(range.min);
                    if (range.max !== undefined) where.valor.lte = Number(range.max);
                }
            } catch (e) { }
        }

        return where;
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
