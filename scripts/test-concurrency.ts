
import { PrismaClient } from "@prisma/client";
import { SubscriptionService } from "../src/services/subscription.service";

const prisma = new PrismaClient();

async function runTest() {
    console.log("--- INICIANDO TESTE DE CONCORRÊNCIA ---");

    // 1. Setup: Encontrar ou criar um streaming com 1 vaga disponível
    let streaming = await prisma.streaming.findFirst({
        where: { isAtivo: true },
        include: {
            _count: {
                select: {
                    assinaturas: {
                        where: { status: { in: ["ativa", "suspensa", "pendente"] } }
                    }
                }
            }
        }
    });

    if (!streaming) {
        console.error("Nenhum streaming encontrado para teste.");
        return;
    }

    // Set limit to current + 1 for exact test
    const currentOccupancy = streaming._count.assinaturas;
    await prisma.streaming.update({
        where: { id: streaming.id },
        data: { limiteParticipantes: currentOccupancy + 1 }
    });

    console.log(`Streaming ID: ${streaming.id}, Limite: ${currentOccupancy + 1}, Ocupação Atual: ${currentOccupancy}`);
    console.log(`Versão Inicial: ${streaming.version}`);

    // 2. Encontrar/Criar participantes para o teste
    const p1 = await prisma.participante.findFirst({ where: { contaId: streaming.contaId } });
    const p2 = await prisma.participante.findFirst({ where: { id: { not: p1?.id }, contaId: streaming.contaId } });

    if (!p1 || !p2) {
        console.error("Participantes insuficientes para o teste na mesma conta.");
        return;
    }

    console.log(`Participante 1: ${p1.nome}, Participante 2: ${p2.nome}`);

    // 3. Executar disparos simultâneos
    console.log("Disparando 2 criações simultâneas...");

    const attempt1 = prisma.$transaction(async (tx) => {
        return SubscriptionService.createFromStreaming(tx, p1.id, streaming!.id);
    });

    const attempt2 = prisma.$transaction(async (tx) => {
        return SubscriptionService.createFromStreaming(tx, p2.id, streaming!.id);
    });

    const results = await Promise.allSettled([attempt1, attempt2]);

    results.forEach((res, i) => {
        if (res.status === 'fulfilled') {
            console.log(`Tentativa ${i + 1}: SUCESSO`);
        } else {
            console.log(`Tentativa ${i + 1}: FALHOU - ${res.reason.message}`);
        }
    });

    // 4. Verificar estado final
    const finalStreaming = await prisma.streaming.findUnique({
        where: { id: streaming.id },
        include: {
            _count: {
                select: {
                    assinaturas: {
                        where: { status: { in: ["ativa", "suspensa", "pendente"] } }
                    }
                }
            }
        }
    });

    console.log(`--- ESTADO FINAL ---`);
    console.log(`Versão Final: ${finalStreaming?.version}`);
    console.log(`Ocupação Final: ${finalStreaming?._count.assinaturas}/${finalStreaming?.limiteParticipantes}`);

    if (finalStreaming?._count.assinaturas === currentOccupancy + 1) {
        console.log("✅ TESTE PASSOU: Apenas uma assinatura foi permitida.");
    } else {
        console.log("❌ TESTE FALHOU: Overfill detectado ou nenhuma assinatura criada.");
    }

    await prisma.$disconnect();
}

runTest().catch(console.error);
