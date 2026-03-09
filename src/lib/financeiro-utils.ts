import { FrequenciaPagamento, Prisma } from "@prisma/client";
import { addMonths, lastDayOfMonth, isAfter, isBefore, getDate, setDate, addDays, differenceInDays, getDaysInMonth, parseISO, startOfDay } from "date-fns";

/**
 * Safely parses a date string (YYYY-MM-DD) as a local Date object.
 * Prevents the common bug where '2023-01-01' is parsed as UTC and results 
 * in the previous day when converted back to local time in western timezones.
 */
export function parseLocalDate(dateInput: string | Date): Date {
    if (dateInput instanceof Date) return startOfDay(dateInput);

    // If it's a YYYY-MM-DD string, add local time component to force local parsing
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        const [year, month, day] = dateInput.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    return startOfDay(new Date(dateInput));
}

export const INTERVALOS_MESES: Record<FrequenciaPagamento, number> = {
    mensal: 1,
    trimestral: 3,
    semestral: 6,
    anual: 12
};

export const FREQUENCIA_MULTIPLICADORES: Record<FrequenciaPagamento, number> = {
    mensal: 1 / INTERVALOS_MESES.mensal,
    trimestral: 1 / INTERVALOS_MESES.trimestral,
    semestral: 1 / INTERVALOS_MESES.semestral,
    anual: 1 / INTERVALOS_MESES.anual,
};

export const PRAZO_VENCIMENTO_PADRAO_DIAS = 5;

/**
 * Calculates the next due date based on the payment frequency.
 * Uses an anchor date strategy to prevent date drift (e.g., maintaining 31st across months).
 * 
 * @param dataReferencia - The reference date (usually the last due date or start date)
 * @param frequencia - Payment frequency (monthly, quarterly, etc.)
 * @param dataInicioAnchor - The original start date of the subscription (optional but recommended for drift prevention)
 * @returns The next due date
 */
export function calcularProximoVencimento(
    dataReferencia: Date,
    frequencia: FrequenciaPagamento,
    dataInicioAnchor?: Date
): Date {
    const dataBase = addMonths(dataReferencia, INTERVALOS_MESES[frequencia]);

    if (dataInicioAnchor) {
        const diaOriginal = getDate(dataInicioAnchor);
        const ultimoDiaDoMes = getDate(lastDayOfMonth(dataBase));

        // If the original start day (e.g., 31) is valid in the target month (e.g. Mar has 31),
        // but addMonths snapped to Feb 28 and now we are in Mar 28, we snap back to 31.
        if (diaOriginal > getDate(dataBase) && diaOriginal <= ultimoDiaDoMes) {
            return setDate(dataBase, diaOriginal);
        }
    }

    return dataBase;
}

/**
 * Calculates the total charge value for a specific period based on frequency.
 * 
 * @param valorMensal - The monthly base value of the subscription (e.g., 9.00)
 * @param frequencia - Payment frequency (e.g., trimestral)
 * @returns The total value for the period (e.g., 27.00) as Prisma.Decimal
 */
export function calcularValorPeriodo(
    valorMensal: Prisma.Decimal | number,
    frequencia: FrequenciaPagamento
): Prisma.Decimal {
    const multiplier = INTERVALOS_MESES[frequencia];
    const valorDecimal = new Prisma.Decimal(valorMensal.toString());

    // Round to 2 decimal places to ensure financial consistency
    return valorDecimal.mul(multiplier).toDecimalPlaces(2);
}

/**
 * Checks if a charge is overdue.
 * 
 * @param dataVencimento - The due date (usually the start of the period for prepaid)
 * @returns true if the current date is strictly past the due date
 */
export function estaAtrasado(dataVencimento: Date): boolean {
    return isAfter(new Date(), dataVencimento);
}

/**
 * Rounds a value to exactly 2 decimal places using Prisma.Decimal.
 * Essential for monetary consistency between UI and Backend.
 */
export function arredondarMoeda(valor: Prisma.Decimal | number | string): Prisma.Decimal {
    return new Prisma.Decimal(valor.toString()).toDecimalPlaces(2);
}

/**
 * Calculates the base cost per participant for a streaming service.
 */
export function calcularCustoBase(valorIntegral: Prisma.Decimal | number | string, limiteParticipantes: number): Prisma.Decimal {
    if (limiteParticipantes <= 0) return new Prisma.Decimal(0);
    const valStr = valorIntegral?.toString() || "0";
    const total = new Prisma.Decimal(valStr === "" ? "0" : valStr);
    return arredondarMoeda(total.div(limiteParticipantes));
}

/**
 * Calculates the monthly profit based on current value and base cost.
 */
export function calcularLucroMensal(valorAtual: Prisma.Decimal | number | string, custoBase: Prisma.Decimal | number | string): Prisma.Decimal {
    const atualStr = valorAtual?.toString() || "0";
    const custoStr = custoBase?.toString() || "0";
    const atual = new Prisma.Decimal(atualStr === "" ? "0" : atualStr);
    const custo = new Prisma.Decimal(custoStr === "" ? "0" : custoStr);
    return arredondarMoeda(atual.minus(custo));
}

/**
 * Calculates the total value for a billing cycle (multiple months).
 */
export function calcularTotalCiclo(valorMensal: Prisma.Decimal | number | string, frequencia: FrequenciaPagamento): Prisma.Decimal {
    const valStr = valorMensal?.toString() || "0";
    const valor = new Prisma.Decimal(valStr === "" ? "0" : valStr);
    const multiplier = INTERVALOS_MESES[frequencia];
    return arredondarMoeda(valor.mul(multiplier));
}
/**
 * Calculates the standard due date for a new charge (5 days after emission).
 * 
 * @param dataEmissao - The charge creation date (defaults to now)
 * @returns The standard due date
 */
export function calcularDataVencimentoPadrao(dataEmissao: Date = new Date()): Date {
    return addDays(dataEmissao, PRAZO_VENCIMENTO_PADRAO_DIAS);
}

/**
 * Dado um array de dias de vencimento configurados (ex: [5, 10, 20])
 * e uma data de referência, retorna a data de vencimento mais próxima no futuro.
 * Se não houver nenhuma no mês corrente, avança para o primeiro dia configurado do próximo mês.
 */
export function escolherProximoDiaVencimento(diasVencimento: number[], dataReferencia: Date): Date {
    if (!diasVencimento || diasVencimento.length === 0) {
        return calcularDataVencimentoPadrao(dataReferencia);
    }

    const diaAtual = getDate(dataReferencia);
    const diasOrdenados = [...diasVencimento].sort((a, b) => a - b);

    // Tentar encontrar um dia no mês atual que seja maior ou igual ao dia atual
    const proximoDiaMesAtual = diasOrdenados.find(d => d >= diaAtual);

    if (proximoDiaMesAtual !== undefined) {
        return setDate(dataReferencia, proximoDiaMesAtual);
    }

    // Se todos os dias do mês atual já passaram, pega o primeiro dia configurado do próximo mês
    const proximoMes = addMonths(dataReferencia, 1);
    return setDate(proximoMes, diasOrdenados[0]);
}

/**
 * Calcula o valor proporcional (pro-rata) da primeira cobrança.
 * Cobre o período parcial de `dataInicio` até `dataVencimento`.
 * Fórmula: (valorMensal / diasNoMes) * diasCobertos
 */
export function calcularValorProRata(
    valorMensal: Prisma.Decimal | number,
    dataInicio: Date,
    dataVencimento: Date
): Prisma.Decimal {
    const valorDecimal = new Prisma.Decimal(valorMensal.toString());

    // Garantir ao menos 1 dia cobrado para evitar valores 0
    const diasCobertos = Math.max(1, differenceInDays(dataVencimento, dataInicio));

    const diasNoMes = getDaysInMonth(dataInicio);

    const valorDiario = valorDecimal.div(diasNoMes);

    return valorDiario.mul(diasCobertos).toDecimalPlaces(2);
}

/**
 * Formata um valor numérico para moeda.
 * 
 * @param valor - Valor a ser formatado
 * @param moeda - Código da moeda (ISO 4217)
 * @returns String formatada (ex: R$ 1.234,56)
 */
export function formatarMoeda(valor: number | string | Prisma.Decimal | any, moeda: string = 'BRL'): string {
    const amount = typeof valor === "number"
        ? valor
        : typeof valor?.toNumber === "function"
            ? valor.toNumber()
            : parseFloat(valor?.toString() || "0");

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: moeda,
    }).format(isNaN(amount) ? 0 : amount);
}

/**
 * Prioridade de status para ordenação de cobranças e faturas.
 * Segue a lógica: Atenção imediata (aguardando/rejeitado) > Aberto (pendente/atrasado) > Concluído (pago) > Histórico (cancelado).
 */
export const STATUS_PRIORITY: Record<string, number> = {
    'aguardando_aprovacao': 0,
    'pendente': 1,
    'atrasado': 2,
    'pago': 3,
    'cancelado': 4
};

/**
 * Ordena um array de objetos que possuam a propriedade 'status' baseado na prioridade definida.
 * 
 * @param items - Array de itens a serem ordenados
 * @returns Novo array ordenado
 */
export function sortByStatusPriority<T extends { status: string }>(items: T[]): T[] {
    return [...items].sort((a, b) => {
        const priorityA = STATUS_PRIORITY[a.status] ?? 99;
        const priorityB = STATUS_PRIORITY[b.status] ?? 99;
        return priorityA - priorityB;
    });
}

/**
 * Determina o nome do ator (Organizador ou Participante) a ser exibido para um lote.
 */
export function getLoteActorName(lote: any, isAdmin: boolean): string {
    if (isAdmin) {
        return lote.participante?.nome || 'N/A';
    }
    return lote.participante?.nome || 'N/A';
}

/**
 * Gera os ciclos de cobrança retroativos baseados em uma data de início passada.
 */
export function gerarCiclosRetroativos({
    dataInicio,
    frequencia,
    valorMensal,
    diasVencimento
}: {
    dataInicio: Date;
    frequencia: FrequenciaPagamento;
    valorMensal: number | Prisma.Decimal;
    diasVencimento: number[];
}) {
    const ciclos = [];
    let dataReferencia = dataInicio;
    const hoje = startOfDay(new Date());

    while (isBefore(dataReferencia, hoje)) {
        const proximoVencimento = escolherProximoDiaVencimento(diasVencimento, dataReferencia);
        const fimCiclo = addMonths(dataReferencia, INTERVALOS_MESES[frequencia]);

        ciclos.push({
            periodoInicio: dataReferencia,
            periodoFim: fimCiclo,
            dataVencimento: proximoVencimento,
            valor: calcularValorPeriodo(valorMensal, frequencia).toNumber()
        });

        dataReferencia = fimCiclo;
    }

    return ciclos;
}
