export interface DashboardStats {
    financial: FinancialMetrics;
    membership: MembershipMetrics;
    occupancy: OccupancyMetrics;
    payments: PaymentMetrics;
    catalogs: CatalogRevenue[];
    currencyCode: string;
}

export interface FinancialMetrics {
    monthlyRevenue: number;
    revenueTrend: number;
    totalMarketCost: number;
    totalSavings: number;
    netBalance: number;
    averageTicket: number;
}

export interface MembershipMetrics {
    activeParticipantsCount: number;
    participantsTrend: number;
}

export interface OccupancyMetrics {
    occupationRate: number;
    totalSlots: number;
    occupiedSlots: number;
    activeStreamingsCount: number;
}

export interface PaymentMetrics {
    defaultRate: number;
    paymentStatusData: PaymentStatusItem[];
}

export interface PaymentStatusItem {
    name: string;
    value: number;
    color: string;
}

export interface CatalogRevenue {
    name: string;
    value: number;
    color: string;
}

export interface RevenueHistory {
    name: string;
    receita: number;
    participantes: number;
    novosMembros: number;
}

export interface ParticipantStats {
    activeSubscriptions: number;
    monthlySpending: number;
    totalSavings: number;
    nextPaymentDate: Date | null;
    currencyCode: string;
}

export interface ParticipantSubscription {
    id: number;
    streamingId: number;
    streamingName: string;
    streamingLogo: string | null;
    streamingColor: string;
    status: string;
    valor: number;
    valorIntegral: number;
    proximoVencimento: Date | null;
    credenciaisLogin?: string | null;
    credenciaisSenha?: string | null;
}
