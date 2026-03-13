import { PrismaClient } from "@prisma/client";
import { auditExtension } from "../prisma-audit-extension";

const baseClient = new PrismaClient();
const extendedClient = baseClient.$extends(auditExtension);

export const prisma = extendedClient;

// Extract the transaction client type from the extended client
export type PrismaTransactionClient = Omit<
    typeof extendedClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

declare global {
    var prisma: typeof extendedClient;
}

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
