import {
    PrismaClient,
    PlanoConta,
    ProviderAuth,
    NivelAcesso,
    StatusAssinatura,
    StatusCobranca,
    StatusParticipante,
    FrequenciaPagamento,
    TipoNotificacao,
    StatusLote,
    Streaming,
    Participante,
    StreamingCatalogo,
    Conta,
    Usuario
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, subDays, startOfMonth, subMonths } from "date-fns";

const prisma = new PrismaClient();

interface SeedContext {
    now: Date;
    emailDemo: string;
    catalogos: Record<string, StreamingCatalogo>;
    conta: Conta | null;
    usuario: Usuario | null;
    participantes: Record<string, Participante>;
    streamings: Record<string, Streaming>;
}

class Logger {
    static info(msg: string) { console.log(`\n🔹 ${msg}`); }
    static success(msg: string) { console.log(`   ✅ ${msg}`); }
    static warn(msg: string) { console.log(`   ⚠️  ${msg}`); }
    static error(msg: string) { console.error(`   ❌ ${msg}`); }
    static step(msg: string) { console.log(`      ➔ ${msg}`); }
}

class DemoCleanupService {
    constructor(private prisma: PrismaClient) { }

    async clearUserContext(email: string) {
        Logger.info(`Verificando e limpando contexto para: ${email}`);

        const conta = await this.prisma.conta.findUnique({ where: { email } });
        if (conta) {
            await this.deleteContaRecursively(conta.id);
            Logger.success("Conta Demo e relacionamentos apagados.");
        }

        const usuario = await this.prisma.usuario.findUnique({ where: { email } });
        if (usuario) {
            await this.deleteUsuarioRelatedData(usuario.id);
            await this.prisma.usuario.delete({ where: { id: usuario.id } });
            Logger.success("Usuário Demo apagado.");
        }
    }

    private async deleteContaRecursively(contaId: number) {
        Logger.step("Limpando dados financeiros e participantes...");
        const pIds = await this.prisma.participante.findMany({ where: { contaId }, select: { id: true } });
        const participanteIds = pIds.map(p => p.id);

        if (participanteIds.length > 0) {
            await this.prisma.cobranca.deleteMany({ where: { assinatura: { participanteId: { in: participanteIds } } } });
            await this.prisma.assinatura.deleteMany({ where: { participanteId: { in: participanteIds } } });
            await this.prisma.lotePagamento.deleteMany({ where: { participanteId: { in: participanteIds } } });
            await this.prisma.whatsAppLog.deleteMany({ where: { participanteId: { in: participanteIds } } });
            await this.prisma.participante.deleteMany({ where: { contaId } });
        }

        Logger.step("Limpando comunicação e grupos...");
        await this.prisma.notificacao.deleteMany({ where: { contaId } });
        await this.prisma.convite.deleteMany({ where: { contaId } });
        await this.prisma.grupoStreaming.deleteMany({ where: { grupo: { contaId } } });
        await this.prisma.grupo.deleteMany({ where: { contaId } });

        Logger.step("Limpando streamings e configurações...");
        await this.prisma.streamingCredenciais.deleteMany({ where: { streaming: { contaId } } });
        await this.prisma.streaming.deleteMany({ where: { contaId } });
        await this.prisma.whatsAppConfig.deleteMany({ where: { contaId } });
        await this.prisma.contaUsuario.deleteMany({ where: { contaId } });

        await this.prisma.conta.delete({ where: { id: contaId } });
    }

    private async deleteUsuarioRelatedData(usuarioId: number) {
        await this.prisma.suporte.deleteMany({ where: { usuarioId } });
        await this.prisma.convite.deleteMany({ where: { convidadoPorId: usuarioId } });
        await this.prisma.convite.deleteMany({ where: { usuarioId } });
    }
}

class DemoSeedRunner {
    private ctx: SeedContext;

    constructor(private prisma: PrismaClient) {
        this.ctx = {
            now: new Date(),
            emailDemo: "demo@streamshare.com.br",
            catalogos: {},
            conta: null,
            usuario: null,
            participantes: {},
            streamings: {},
        };
    }

    async run() {
        try {
            Logger.info("INICIANDO REBORN DA SEED DEMO");

            await new DemoCleanupService(this.prisma).clearUserContext(this.ctx.emailDemo);
            await this.setupBaseCatalogos();
            await this.setupAuthContext();
            await this.setupParticipantes();
            await this.setupStreamings();
            await this.setupFinancialScenarios();
            await this.setupSocialData();

            this.finish();
        } catch (error) {
            Logger.error("Falha crítica no processo de Seed.");
            throw error;
        }
    }

    private async setupBaseCatalogos() {
        Logger.info("Validando Catálogos...");
        const nomes = ["Netflix", "Spotify", "Xbox Game Pass"];

        for (const nome of nomes) {
            const cat = await this.prisma.streamingCatalogo.findFirst({ where: { nome } });
            if (!cat) throw new Error(`Catálogo '${nome}' não encontrado. Rode a seed base primeiro.`);
            this.ctx.catalogos[nome] = cat;
        }
        Logger.success("Catálogos validados.");
    }

    private async setupAuthContext() {
        Logger.info("Configurando Identidade...");
        const senhaHash = await bcrypt.hash("demo123", 10);

        this.ctx.conta = await this.prisma.conta.create({
            data: {
                nome: "StreamShare Demo",
                email: this.ctx.emailDemo,
                plano: PlanoConta.pro,
                isAtivo: true,
                chavePix: "11999999999"
            },
        });

        this.ctx.usuario = await this.prisma.usuario.create({
            data: {
                email: this.ctx.emailDemo,
                nome: "Admin Demo",
                senhaHash,
                provider: ProviderAuth.local,
                isAtivo: true,
                ultimoLogin: this.ctx.now
            },
        });

        await this.prisma.contaUsuario.create({
            data: {
                contaId: this.ctx.conta.id,
                usuarioId: this.ctx.usuario.id,
                nivelAcesso: NivelAcesso.owner
            },
        });
        Logger.success("Identidade Admin criada.");
    }

    private async setupParticipantes() {
        Logger.info("Criando Ecossistema de Participantes...");
        const fakes = [
            { nome: "Ana Silva", status: StatusParticipante.ativo, whatsapp: "5511999991111" },
            { nome: "Carlos Mendes", status: StatusParticipante.ativo, whatsapp: "5511999992222" },
            { nome: "Beatriz Sousa", status: StatusParticipante.pendente, whatsapp: "5511999993333" },
            { nome: "Daniel Costa", status: StatusParticipante.bloqueado, whatsapp: "5511999994444" },
            { nome: "Eduardo Rocha", status: StatusParticipante.ativo, whatsapp: "5511999995555" }
        ];

        for (const p of fakes) {
            this.ctx.participantes[p.nome] = await this.prisma.participante.create({
                data: {
                    contaId: this.ctx.conta!.id,
                    nome: p.nome,
                    status: p.status,
                    whatsappNumero: p.whatsapp,
                    whatsappVerificado: true
                },
            });
        }
    }

    private async setupStreamings() {
        Logger.info("Publicando Streamings...");

        this.ctx.streamings["Netflix"] = await this.prisma.streaming.create({
            data: {
                contaId: this.ctx.conta!.id,
                streamingCatalogoId: this.ctx.catalogos["Netflix"].id,
                apelido: "Netflix Premium Family",
                valorIntegral: 59.90,
                limiteParticipantes: 4,
                isPublico: true,
            }
        });

        this.ctx.streamings["Spotify"] = await this.prisma.streaming.create({
            data: {
                contaId: this.ctx.conta!.id,
                streamingCatalogoId: this.ctx.catalogos["Spotify"].id,
                apelido: "Spotify Familia Amigos",
                valorIntegral: 34.90,
                limiteParticipantes: 5,
            }
        });

        this.ctx.streamings["Xbox"] = await this.prisma.streaming.create({
            data: {
                contaId: this.ctx.conta!.id,
                streamingCatalogoId: this.ctx.catalogos["Xbox Game Pass"].id,
                apelido: "Xbox GamePass Ultimate",
                valorIntegral: 49.99,
                limiteParticipantes: 3,
                isPublico: true,
            }
        });
    }

    private async setupFinancialScenarios() {
        Logger.info("Simulando Cenários Financeiros (Lotes e Débitos)...");

        const { participantes, streamings, now } = this.ctx;

        // SCENARIO 1: Ana (Paid History + Current Batch/Lote Pending)
        const assAnaNet = await this.prisma.assinatura.create({
            data: { participanteId: participantes["Ana Silva"].id, streamingId: streamings["Netflix"].id, frequencia: FrequenciaPagamento.mensal, status: StatusAssinatura.ativa, dataInicio: subMonths(now, 2), valor: 14.90 }
        });
        const assAnaXbx = await this.prisma.assinatura.create({
            data: { participanteId: participantes["Ana Silva"].id, streamingId: streamings["Xbox"].id, frequencia: FrequenciaPagamento.mensal, status: StatusAssinatura.ativa, dataInicio: subMonths(now, 1), valor: 16.50 }
        });

        await this.prisma.cobranca.createMany({
            data: [
                { assinaturaId: assAnaNet.id, valor: 14.90, periodoInicio: subMonths(now, 2), periodoFim: subMonths(now, 1), dataVencimento: subMonths(now, 2), status: StatusCobranca.pago, dataPagamento: subMonths(now, 2) },
                { assinaturaId: assAnaNet.id, valor: 14.90, periodoInicio: subMonths(now, 1), periodoFim: startOfMonth(now), dataVencimento: subMonths(now, 1), status: StatusCobranca.pago, dataPagamento: subMonths(now, 1) },
            ]
        });

        const cobAnaNet = await this.prisma.cobranca.create({ data: { assinaturaId: assAnaNet.id, valor: 14.90, periodoInicio: startOfMonth(now), periodoFim: addDays(startOfMonth(now), 30), dataVencimento: addDays(now, 5), status: StatusCobranca.pendente } });
        const cobAnaXbx = await this.prisma.cobranca.create({ data: { assinaturaId: assAnaXbx.id, valor: 16.50, periodoInicio: startOfMonth(now), periodoFim: addDays(startOfMonth(now), 30), dataVencimento: addDays(now, 2), status: StatusCobranca.pendente } });

        const loteAna = await this.prisma.lotePagamento.create({
            data: { participanteId: participantes["Ana Silva"].id, valorTotal: 14.90 + 16.50, status: StatusLote.pendente }
        });
        await this.prisma.cobranca.updateMany({ where: { id: { in: [cobAnaNet.id, cobAnaXbx.id] } }, data: { lotePagamentoId: loteAna.id } });

        // SCENARIO 2: Carlos (Delinquent/Atrasado)
        const assCarlos = await this.prisma.assinatura.create({
            data: { participanteId: participantes["Carlos Mendes"].id, streamingId: streamings["Spotify"].id, frequencia: FrequenciaPagamento.mensal, status: StatusAssinatura.ativa, dataInicio: subMonths(now, 1), valor: 6.90 }
        });
        await this.prisma.cobranca.create({
            data: { assinaturaId: assCarlos.id, valor: 6.90, periodoInicio: startOfMonth(now), periodoFim: addDays(startOfMonth(now), 30), dataVencimento: subDays(now, 2), status: StatusCobranca.atrasado }
        });

        // SCENARIO 3: Eduardo (Waiting Approval Batch/Lote with Receipt)
        const assEduNet = await this.prisma.assinatura.create({ data: { participanteId: participantes["Eduardo Rocha"].id, streamingId: streamings["Netflix"].id, frequencia: FrequenciaPagamento.mensal, status: StatusAssinatura.ativa, dataInicio: startOfMonth(now), valor: 14.90 } });
        const assEduSpo = await this.prisma.assinatura.create({ data: { participanteId: participantes["Eduardo Rocha"].id, streamingId: streamings["Spotify"].id, frequencia: FrequenciaPagamento.mensal, status: StatusAssinatura.ativa, dataInicio: startOfMonth(now), valor: 6.90 } });

        const loteEdu = await this.prisma.lotePagamento.create({
            data: {
                participanteId: participantes["Eduardo Rocha"].id,
                valorTotal: 14.90 + 6.90,
                status: StatusLote.aguardando_aprovacao,
                comprovanteUrl: "https://images.unsplash.com/photo-1620054992576-9d8e7c10b27b?q=80&w=600&auto=format&fit=crop"
            }
        });

        await this.prisma.cobranca.create({ data: { assinaturaId: assEduNet.id, valor: 14.90, periodoInicio: startOfMonth(now), periodoFim: addDays(startOfMonth(now), 30), dataVencimento: now, status: StatusCobranca.aguardando_aprovacao, lotePagamentoId: loteEdu.id } });
        await this.prisma.cobranca.create({ data: { assinaturaId: assEduSpo.id, valor: 6.90, periodoInicio: startOfMonth(now), periodoFim: addDays(startOfMonth(now), 30), dataVencimento: now, status: StatusCobranca.aguardando_aprovacao, lotePagamentoId: loteEdu.id } });
    }

    private async setupSocialData() {
        Logger.info("Construindo Social e Notificações...");

        const grupo = await this.prisma.grupo.create({
            data: {
                contaId: this.ctx.conta!.id,
                nome: "Amigos do Discord",
                descricao: "Grupo para rachar as contas da galera",
                isPublico: true,
                linkConvite: "discord-squad"
            }
        });

        await this.prisma.grupoStreaming.createMany({
            data: [
                { grupoId: grupo.id, streamingId: this.ctx.streamings["Netflix"].id },
                { grupoId: grupo.id, streamingId: this.ctx.streamings["Spotify"].id }
            ]
        });

        await this.prisma.notificacao.createMany({
            data: [
                { contaId: this.ctx.conta!.id, tipo: TipoNotificacao.cobranca_confirmada, titulo: "Pagamento Confirmado", descricao: "Ana Silva pagou sua cota", lida: false },
                { contaId: this.ctx.conta!.id, tipo: TipoNotificacao.assinatura_suspensa, titulo: "Daniel Costa Bloqueado", descricao: "Acesso removido por inadimplência", lida: false }
            ]
        });

        await this.prisma.suporte.create({
            data: {
                nome: "Admin Demo",
                email: this.ctx.emailDemo,
                assunto: "Gateway Setup",
                descricao: "Como habilitar PIX automático no painel?",
                usuarioId: this.ctx.usuario!.id
            }
        });
    }

    private finish() {
        console.log(`\n🎉 SEED DE DEMONSTRAÇÃO CONCLUÍDO!`);
        console.log(`-----------------------------------`);
        console.log(`Email de acesso: ${this.ctx.emailDemo}`);
        console.log(`Senha: demo123`);
        console.log(`-----------------------------------\n`);
    }
}

async function start() {
    const runner = new DemoSeedRunner(prisma);
    await runner.run();
}

start()
    .catch((e) => {
        Logger.error(`Erro: ${e.message}`);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
