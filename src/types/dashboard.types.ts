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
