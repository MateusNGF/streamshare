'use client';

import { useMemo } from 'react';
import { FrequenciaPagamento } from '@prisma/client';
import { calcularCustoBase, calcularLucroMensal, calcularTotalCiclo } from '@/lib/financeiro-utils';

interface UseBillingCalculationsProps {
    valorIntegral: number;
    limiteParticipantes: number;
    valorAtual: string | number;
    frequencia: FrequenciaPagamento;
}

/**
 * Hook to encapsulate billing and profit calculations.
 * Centralizes logic used across different subscription modals.
 */
export function useBillingCalculations({
    valorIntegral,
    limiteParticipantes,
    valorAtual,
    frequencia
}: UseBillingCalculationsProps) {

    return useMemo(() => {
        const custoBase = calcularCustoBase(valorIntegral, limiteParticipantes);
        const valorNumerico = typeof valorAtual === 'string' ? parseFloat(valorAtual) || 0 : valorAtual;

        const lucroMensal = calcularLucroMensal(valorNumerico, custoBase);
        const totalCiclo = calcularTotalCiclo(valorNumerico, frequencia);

        return {
            custoBase,
            lucroMensal,
            totalCiclo,
            temLucro: lucroMensal > 0
        };
    }, [valorIntegral, limiteParticipantes, valorAtual, frequencia]);
}
