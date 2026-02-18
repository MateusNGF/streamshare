'use client';

import { useMemo } from 'react';
import { FrequenciaPagamento } from '@prisma/client';
import { calcularCustoBase, calcularLucroMensal, calcularTotalCiclo, INTERVALOS_MESES } from '@/lib/financeiro-utils';

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
        const custoBaseDecimal = calcularCustoBase(valorIntegral, limiteParticipantes);
        const valorNumerico = typeof valorAtual === 'string' ? parseFloat(valorAtual) || 0 : valorAtual;

        const lucroMensalDecimal = calcularLucroMensal(valorNumerico, custoBaseDecimal);
        const lucroCicloDecimal = lucroMensalDecimal.mul(INTERVALOS_MESES[frequencia]);
        const totalCicloDecimal = calcularTotalCiclo(valorNumerico, frequencia);

        return {
            custoBase: custoBaseDecimal.toNumber(),
            lucroMensal: lucroMensalDecimal.toNumber(),
            lucroCiclo: lucroCicloDecimal.toNumber(),
            totalCiclo: totalCicloDecimal.toNumber(),
            temLucro: lucroMensalDecimal.gt(0)
        };
    }, [valorIntegral, limiteParticipantes, valorAtual, frequencia]);
}
