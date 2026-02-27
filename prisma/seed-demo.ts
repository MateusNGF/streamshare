import { PrismaClient, PlanoConta, ProviderAuth, NivelAcesso, StatusAssinatura, StatusCobranca, StatusParticipante, FrequenciaPagamento, TipoNotificacao } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, subDays, startOfMonth, subMonths } from "date-fns";
const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Iniciando Seed de DEMONSTRAÇÃO...\n");
    const now = new Date();

    // 1. Verificar Catálogos Existentes
    console.log("🎬 Verificando Catálogos da Base de Dados...");
    const netflixExists = await prisma.streamingCatalogo.findFirst({ where: { nome: "Netflix" } });

    if (!netflixExists) {
        console.error("❌ ERRO: O catálogo oficial não foi encontrado.");
        console.error("👉 Por favor, rode o comando 'npm run db:seed' primeiro para popular o banco base.");
        process.exit(1);
    }
    console.log("  ✅ Catálogo Base encontrado.");
    // 2. Conta Demo
    console.log("🏢 Criando Conta Demo...");
    const emailDemo = "demo@streamshare.com.br";
    const senhaHash = await bcrypt.hash("demo123", 10);

    let contaDemo = await prisma.conta.upsert({
        where: { email: emailDemo },
        update: { nome: "StreamShare Demo", plano: PlanoConta.pro, isAtivo: true },
        create: { nome: "StreamShare Demo", email: emailDemo, plano: PlanoConta.pro, isAtivo: true },
    });

    let usuarioDemo = await prisma.usuario.upsert({
        where: { email: emailDemo },
        update: { nome: "Admin Demo", senhaHash, provider: ProviderAuth.local, isAtivo: true },
        create: { email: emailDemo, nome: "Admin Demo", senhaHash, provider: ProviderAuth.local, isAtivo: true, ultimoLogin: now },
    });

    await prisma.contaUsuario.upsert({
        where: { contaId_usuarioId: { contaId: contaDemo.id, usuarioId: usuarioDemo.id } },
        update: { nivelAcesso: NivelAcesso.owner, isAtivo: true },
        create: { contaId: contaDemo.id, usuarioId: usuarioDemo.id, nivelAcesso: NivelAcesso.owner, isAtivo: true },
    });

    // 3. Participantes Variados
    console.log("👥 Gerando Participantes...");
    const participantesFake = [
        { nome: "Ana Silva", status: StatusParticipante.ativo, whatsappNumero: "5511999991111" },
        { nome: "Carlos Mendes", status: StatusParticipante.ativo, whatsappNumero: "5511999992222" },
        { nome: "Beatriz Sousa", status: StatusParticipante.pendente, whatsappNumero: "5511999993333" },
        { nome: "Daniel Costa", status: StatusParticipante.bloqueado, whatsappNumero: "5511999994444" },
        { nome: "Eduardo Rocha", status: StatusParticipante.ativo, whatsappNumero: "5511999995555" }
    ];

    const participantesCriados = [];
    for (const p of participantesFake) {
        const criado = await prisma.participante.upsert({
            where: { contaId_whatsappNumero: { contaId: contaDemo.id, whatsappNumero: p.whatsappNumero } },
            update: { nome: p.nome, status: p.status },
            create: { contaId: contaDemo.id, nome: p.nome, status: p.status, whatsappNumero: p.whatsappNumero, whatsappVerificado: true },
        });
        participantesCriados.push(criado);
    }

    // 4. Streamings da Conta
    console.log("📺 Gerando Streamings Ativos...");
    const netflixCat = await prisma.streamingCatalogo.findFirst({ where: { nome: "Netflix" } });
    const spotifyCat = await prisma.streamingCatalogo.findFirst({ where: { nome: "Spotify" } });
    const xboxCat = await prisma.streamingCatalogo.findFirst({ where: { nome: "Xbox Game Pass" } });

    const strNetflix = await prisma.streaming.create({
        data: {
            contaId: contaDemo.id,
            streamingCatalogoId: netflixCat!.id,
            apelido: "Netflix Premium Family",
            valorIntegral: 59.90,
            limiteParticipantes: 4,
            isPublico: true,
        }
    });

    const strSpotify = await prisma.streaming.create({
        data: {
            contaId: contaDemo.id,
            streamingCatalogoId: spotifyCat!.id,
            apelido: "Spotify Familia Amigos",
            valorIntegral: 34.90,
            limiteParticipantes: 5,
            isPublico: false,
        }
    });

    // 5. Assinaturas e Histórico Financeiro
    console.log("💳 Gerando Assinaturas e Cobranças Realistas...");
    // Ana in Netflix (Active, perfectly paid)
    const assAnaNet = await prisma.assinatura.create({
        data: {
            participanteId: participantesCriados[0].id,
            streamingId: strNetflix.id,
            frequencia: FrequenciaPagamento.mensal,
            status: StatusAssinatura.ativa,
            dataInicio: subMonths(now, 2),
            valor: 14.90
        }
    });

    // Ana Billing History: M-2 (Paid), M-1 (Paid), M0 (Pending)
    await prisma.cobranca.createMany({
        data: [
            { assinaturaId: assAnaNet.id, valor: 14.90, periodoInicio: subMonths(now, 2), periodoFim: subMonths(now, 1), dataVencimento: subMonths(now, 2), status: StatusCobranca.pago, dataPagamento: subMonths(now, 2) },
            { assinaturaId: assAnaNet.id, valor: 14.90, periodoInicio: subMonths(now, 1), periodoFim: startOfMonth(now), dataVencimento: subMonths(now, 1), status: StatusCobranca.pago, dataPagamento: subMonths(now, 1) },
            { assinaturaId: assAnaNet.id, valor: 14.90, periodoInicio: startOfMonth(now), periodoFim: addDays(startOfMonth(now), 30), dataVencimento: addDays(now, 5), status: StatusCobranca.pendente }
        ]
    });

    // Carlos in Spotify (Active, Late Payment)
    const assCarlosSpo = await prisma.assinatura.create({
        data: {
            participanteId: participantesCriados[1].id,
            streamingId: strSpotify.id,
            frequencia: FrequenciaPagamento.mensal,
            status: StatusAssinatura.ativa,
            dataInicio: subMonths(now, 1),
            valor: 6.90
        }
    });

    await prisma.cobranca.createMany({
        data: [
            { assinaturaId: assCarlosSpo.id, valor: 6.90, periodoInicio: subMonths(now, 1), periodoFim: startOfMonth(now), dataVencimento: subMonths(now, 1), status: StatusCobranca.pago, dataPagamento: subMonths(now, 1) },
            { assinaturaId: assCarlosSpo.id, valor: 6.90, periodoInicio: startOfMonth(now), periodoFim: addDays(startOfMonth(now), 30), dataVencimento: subDays(now, 2), status: StatusCobranca.atrasado }
        ]
    });

    // Daniel in Netflix (Suspended due to non-payment)
    const assDanielNet = await prisma.assinatura.create({
        data: {
            participanteId: participantesCriados[3].id,
            streamingId: strNetflix.id,
            frequencia: FrequenciaPagamento.mensal,
            status: StatusAssinatura.suspensa,
            dataInicio: subMonths(now, 3),
            dataSuspensao: subDays(now, 5),
            motivoSuspensao: "Falta de pagamento contínuo",
            valor: 14.90
        }
    });

    await prisma.cobranca.create({
        data: { assinaturaId: assDanielNet.id, valor: 14.90, periodoInicio: subMonths(now, 1), periodoFim: startOfMonth(now), dataVencimento: subMonths(now, 1), status: StatusCobranca.atrasado }
    });

    // 6. Grupo Público
    console.log("🔗 Criando Grupo Público...");
    const grupo = await prisma.grupo.upsert({
        where: { linkConvite: "discord-squad" },
        update: {
            nome: "Amigos do Discord",
            descricao: "Grupo para rachar as contas da galera",
            isPublico: true,
            contaId: contaDemo.id
        },
        create: {
            contaId: contaDemo.id,
            nome: "Amigos do Discord",
            descricao: "Grupo para rachar as contas da galera",
            isPublico: true,
            linkConvite: "discord-squad"
        }
    });

    await prisma.grupoStreaming.createMany({
        data: [
            { grupoId: grupo.id, streamingId: strNetflix.id },
            { grupoId: grupo.id, streamingId: strSpotify.id }
        ]
    });

    // 7. Notificações e Suporte
    console.log("🔔 Gerando Notificações Falsas e Chamados de Suporte...");
    await prisma.notificacao.createMany({
        data: [
            { contaId: contaDemo.id, tipo: TipoNotificacao.cobranca_confirmada, titulo: "Pagamento Confirmado", descricao: "Ana Silva pagou a assinatura da Netflix", lida: false },
            { contaId: contaDemo.id, tipo: TipoNotificacao.assinatura_suspensa, titulo: "Assinatura Suspensa", descricao: "Daniel Costa foi suspenso automaticamente na Netflix", lida: false },
            { contaId: contaDemo.id, tipo: TipoNotificacao.solicitacao_participacao_criada, titulo: "Novo pedido de participação", descricao: "Beatriz Sousa quer entrar no Spotify", lida: true }
        ]
    });

    await prisma.suporte.create({
        data: {
            nome: "Admin Demo",
            email: emailDemo,
            assunto: "Dúvida sobre Gateway de Pagamento",
            descricao: "Gostaria de saber como integrar a Stripe na minha conta.",
            usuarioId: usuarioDemo.id
        }
    });

    console.log(`\n🎉 SEED DE DEMONSTRAÇÃO CONCLUÍDO!`);
    console.log(`Email de acesso: ${emailDemo}`);
    console.log(`Senha: demo123\n`);
}

main()
    .catch((e) => {
        console.error("❌ Erro ao executar seed de demonstração:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
