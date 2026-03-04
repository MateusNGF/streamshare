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
    Usuario,
    Grupo
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import bcrypt from "bcryptjs";
import { addDays, subDays, startOfMonth, subMonths, format } from "date-fns";

const prisma = new PrismaClient();

// --- Utilitários de Logger ---
class Logger {
    static info(msg: string) { console.log(`\n🔹 ${msg}`); }
    static success(msg: string) { console.log(`   ✅ ${msg}`); }
    static warn(msg: string) { console.log(`   ⚠️  ${msg}`); }
    static error(msg: string) { console.error(`   ❌ ${msg}`); }
    static step(msg: string) { console.log(`      ➔ ${msg}`); }
}

// --- Serviço de Limpeza Robusto ---
class DemoCleanupService {
    constructor(private prisma: PrismaClient) { }

    async clearUserContexts(emails: string[]) {
        Logger.info(`Limpando ambiente para ${emails.length} contas demo...`);

        for (const email of emails) {
            const conta = await this.prisma.conta.findUnique({ where: { email } });
            if (conta) {
                await this.deleteContaRecursively(conta.id);
                Logger.step(`Conta ${email} e dependências removidas.`);
            }

            const usuario = await this.prisma.usuario.findUnique({ where: { email } });
            if (usuario) {
                await this.deleteUsuarioRelatedData(usuario.id);
                await this.prisma.usuario.delete({ where: { id: usuario.id } });
                Logger.step(`Usuário ${email} removido.`);
            }
        }
    }

    private async deleteContaRecursively(contaId: number) {
        const pIds = await this.prisma.participante.findMany({ where: { contaId }, select: { id: true } });
        const participanteIds = pIds.map(p => p.id);

        if (participanteIds.length > 0) {
            await this.prisma.cobranca.deleteMany({ where: { assinatura: { participanteId: { in: participanteIds } } } });
            await this.prisma.assinatura.deleteMany({ where: { participanteId: { in: participanteIds } } });
            await this.prisma.lotePagamento.deleteMany({ where: { participanteId: { in: participanteIds } } });
            await this.prisma.whatsAppLog.deleteMany({ where: { participanteId: { in: participanteIds } } });
            await this.prisma.participante.deleteMany({ where: { contaId } });
        }

        await this.prisma.notificacao.deleteMany({ where: { contaId } });
        await this.prisma.convite.deleteMany({ where: { contaId } });
        await this.prisma.grupoStreaming.deleteMany({ where: { grupo: { contaId } } });
        await this.prisma.grupo.deleteMany({ where: { contaId } });
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

// --- Runner Principal ---
class DemoSeedRunner {
    private now = new Date();
    private catalogos: Record<string, StreamingCatalogo> = {};
    private senhaHash: string = "";

    constructor(private prisma: PrismaClient) { }

    async run() {
        try {
            Logger.info("🚀 INICIANDO MEGA SEED DEMO (3 CONTAS)");
            this.senhaHash = await bcrypt.hash("demo123", 10);

            const emails = [
                "organizador@streamshare.com.br", // O Principal (Massivo)
                "basico@streamshare.com.br",       // Iniciante
                "business@streamshare.com.br",    // Focado em Volume
                "ana@streamshare.com.br"           // Participante de Teste
            ];

            await new DemoCleanupService(this.prisma).clearUserContexts(emails);
            await this.cacheCatalogos();

            // 1. CONTA PRO (ORGANIZADOR PRINCIPAL - MASSIVO)
            await this.seedContaPro();

            // 1.1 PARTICIPANTE EXEMPLO (ACESSO PARA TESTE)
            await this.seedParticipanteExemplo();

            // 2. CONTA BÁSICA (INICIANTE)
            await this.seedContaBasica();

            // 3. CONTA BUSINESS (VOLUME)
            await this.seedContaBusiness();

            this.finish();
        } catch (error) {
            Logger.error("Falha na execução da Seed.");
            throw error;
        }
    }

    private async cacheCatalogos() {
        const cats = await this.prisma.streamingCatalogo.findMany();
        cats.forEach(c => this.catalogos[c.nome] = c);
        if (Object.keys(this.catalogos).length === 0) {
            throw new Error("Catálogos vazios. Execute 'npm run db:seed' primeiro para popular a base.");
        }
    }

    // ==========================================
    // CONTA PRO - O SHOWCASE (MUITOS DADOS)
    // ==========================================
    private async seedContaPro() {
        Logger.info("Construindo Conta PRO (Showcase)...");
        const email = "organizador@streamshare.com.br";

        const { conta, usuario } = await this.createIdentity(email, "Ricardo Organizador", PlanoConta.pro, "ricardo.pix@streamshare.com.br");

        // Grupos Temáticos
        const grupoAmigos = await this.createGrupo(conta.id, "Amigos da Faculdade", "Rachando streamings com a galera da antiga", "amigos-facul");
        const grupoTrabalho = await this.createGrupo(conta.id, "Squad Stream", "Streamings corporativos e de estudo", "squad-dev");

        // Streamings Diversos
        const netflix = await this.createStreaming(conta.id, "Netflix", "Netflix 4K Premium", 55.90, 4, true);
        const spotify = await this.createStreaming(conta.id, "Spotify", "Spotify Family", 34.90, 6, false);
        const youtube = await this.createStreaming(conta.id, "YouTube Premium", "YouTube Premium", 41.90, 5, true);
        const disney = await this.createStreaming(conta.id, "Disney+", "Combo Disney/Star", 52.90, 4, true);

        // Linkar Grupos e Streamings
        await this.prisma.grupoStreaming.createMany({
            data: [
                { grupoId: grupoAmigos.id, streamingId: netflix.id },
                { grupoId: grupoAmigos.id, streamingId: spotify.id },
                { grupoId: grupoTrabalho.id, streamingId: youtube.id },
                { grupoId: grupoTrabalho.id, streamingId: disney.id },
            ]
        });

        // MASSA DE PARTICIPANTES (25+)
        Logger.step("Gerando 25 participantes e cenários financeiros...");
        const nomesP = [
            "Ana Silva", "Bruno Silva", "Carla Oliveira", "Diego Santos", "Eliana Lima",
            "Felipe Rocha", "Gabriel Costa", "Helena Vieira", "Igor Gomes", "Julia Matos",
            "Kevin Duarte", "Larissa Paiva", "Marcos Vinicius", "Nathalia Cruz", "Otavio Neto",
            "Paula Souza", "Queiroz Filho", "Rafaela Mendes", "Samuel Leite", "Tiago Araujo",
            "Ursula Klein", "Victor Hugo", "Wagner Moura", "Xavier Junior", "Yara Amaral", "Zeca Pagodinho"
        ];

        for (let i = 0; i < nomesP.length; i++) {
            const nome = nomesP[i];
            const participante = await this.prisma.participante.create({
                data: {
                    contaId: conta.id,
                    nome,
                    whatsappNumero: `55119${80000000 + i}`,
                    whatsappVerificado: true,
                    status: i > 20 ? StatusParticipante.pendente : StatusParticipante.ativo
                }
            });

            // Distribuir assinaturas para criar volume
            if (i % 2 === 0) await this.simularAssinatura(participante, netflix, 13.90, i);
            if (i % 3 === 0) await this.simularAssinatura(participante, spotify, 5.80, i);
            if (i % 5 === 0) await this.simularAssinatura(participante, youtube, 8.40, i);
        }

        // Notificações para encher o painel
        await this.prisma.notificacao.createMany({
            data: [
                { contaId: conta.id, tipo: TipoNotificacao.cobranca_confirmada, titulo: "Pagamento Recebido", descricao: "Zeca Pagodinho enviou o comprovante da Netflix.", lida: false },
                { contaId: conta.id, tipo: TipoNotificacao.assinatura_suspensa, titulo: "Inadimplência Detectada", descricao: "Diego Santos está com 2 faturas atrasadas (Spotify).", lida: false },
                { contaId: conta.id, tipo: TipoNotificacao.solicitacao_participacao_criada, titulo: "Nova Solicitação", descricao: "Yara Amaral quer entrar no grupo 'Squad Stream'.", lida: false }
            ]
        });

        Logger.success("Conta PRO populada com 25+ participantes e fluxo financeiro variado.");
    }

    private async seedParticipanteExemplo() {
        Logger.info("Configurando Acesso do Participante (Ana Silva)...");
        const email = "ana@streamshare.com.br";

        // Buscar a conta PRO (Ricardo)
        const contaPro = await this.prisma.conta.findUnique({ where: { email: "organizador@streamshare.com.br" } });
        if (!contaPro) throw new Error("Conta PRO não encontrada para vincular participante.");

        // Upsert Usuário Ana
        const usuario = await this.prisma.usuario.upsert({
            where: { email },
            update: {
                nome: "Ana Silva",
                ultimoLogin: this.now
            },
            create: {
                email,
                nome: "Ana Silva",
                senhaHash: this.senhaHash,
                provider: ProviderAuth.local,
                isAtivo: true,
                ultimoLogin: this.now
            }
        });

        // Vincular ao Participante existente
        const participante = await this.prisma.participante.findFirst({
            where: { contaId: contaPro.id, nome: "Ana Silva" }
        });

        if (participante) {
            await this.prisma.participante.update({
                where: { id: participante.id },
                data: { userId: usuario.id }
            });
        }

        // Upsert ContaUsuario
        await this.prisma.contaUsuario.upsert({
            where: {
                contaId_usuarioId: {
                    contaId: contaPro.id,
                    usuarioId: usuario.id
                }
            },
            update: {
                nivelAcesso: NivelAcesso.admin,
                isAtivo: true
            },
            create: {
                contaId: contaPro.id,
                usuarioId: usuario.id,
                nivelAcesso: NivelAcesso.admin
            }
        });

        Logger.success("Acesso da participante Ana Silva configurado.");
    }

    // ==========================================
    // CONTA BÁSICA - O INICIANTE
    // ==========================================
    private async seedContaBasica() {
        Logger.info("Construindo Conta BÁSICA (Free)...");
        const email = "basico@streamshare.com.br";
        const { conta } = await this.createIdentity(email, "Thiago Iniciante", PlanoConta.free, "thiago@pix.com");

        const xbox = await this.createStreaming(conta.id, "Xbox Game Pass", "GamePass Ultimate", 49.90, 2, true);

        const p1 = await this.prisma.participante.create({
            data: { contaId: conta.id, nome: "João Amigo", whatsappNumero: "5511977776666", status: StatusParticipante.ativo }
        });

        await this.simularAssinatura(p1, xbox, 24.95, 0);
        Logger.success("Conta BÁSICA criada.");
    }

    // ==========================================
    // CONTA BUSINESS - ALTA DENSIDADE
    // ==========================================
    private async seedContaBusiness() {
        Logger.info("Construindo Conta BUSINESS (Volume)...");
        const email = "business@streamshare.com.br";
        const { conta } = await this.createIdentity(email, "Empresa XPTO", PlanoConta.business, "financeiro@xpto.com");

        // Focado em ferramentas de trabalho/software (se houver no catálogo, senão usaremos genéricos)
        const canva = await this.createStreaming(conta.id, "Canva Pro (Equipes)", "Canva Enterprise (Simulado)", 120.00, 10, true);

        for (let i = 0; i < 10; i++) {
            const p = await this.prisma.participante.create({
                data: { contaId: conta.id, nome: `Colaborador ${i + 1}`, status: StatusParticipante.ativo }
            });
            await this.simularAssinatura(p, canva, 12.00, i);
        }
        Logger.success("Conta BUSINESS criada.");
    }

    // ==========================================
    // HELPERS DE CRIAÇÃO
    // ==========================================

    private async createIdentity(email: string, nome: string, plano: PlanoConta, chavePix: string) {
        const conta = await this.prisma.conta.upsert({
            where: { email },
            update: { nome, plano, chavePix, isAtivo: true },
            create: { nome, email, plano, chavePix, isAtivo: true }
        });

        const usuario = await this.prisma.usuario.upsert({
            where: { email },
            update: {
                nome,
                ultimoLogin: this.now
            },
            create: {
                email,
                nome,
                senhaHash: this.senhaHash,
                provider: ProviderAuth.local,
                isAtivo: true,
                ultimoLogin: this.now
            }
        });

        await this.prisma.contaUsuario.upsert({
            where: {
                contaId_usuarioId: {
                    contaId: conta.id,
                    usuarioId: usuario.id
                }
            },
            update: {
                nivelAcesso: NivelAcesso.owner,
                isAtivo: true
            },
            create: {
                contaId: conta.id,
                usuarioId: usuario.id,
                nivelAcesso: NivelAcesso.owner
            }
        });

        return { conta, usuario };
    }

    private async createGrupo(contaId: number, nome: string, descricao: string, link: string) {
        return this.prisma.grupo.create({
            data: { contaId, nome, descricao, linkConvite: link, isPublico: true }
        });
    }

    private async createStreaming(contaId: number, nomeCat: string, apelido: string, valor: number, limite: number, publico: boolean) {
        const cat = this.catalogos[nomeCat];
        if (!cat) throw new Error(`Catálogo ${nomeCat} não encontrado.`);

        return this.prisma.streaming.create({
            data: {
                contaId,
                streamingCatalogoId: cat.id,
                apelido,
                valorIntegral: new Decimal(valor),
                limiteParticipantes: limite,
                isPublico: publico
            }
        });
    }

    private async simularAssinatura(p: Participante, s: Streaming, valor: number, seedIndex: number) {
        const status = seedIndex % 10 === 0 ? StatusAssinatura.suspensa : StatusAssinatura.ativa;

        const assinatura = await this.prisma.assinatura.create({
            data: {
                participanteId: p.id,
                streamingId: s.id,
                frequencia: FrequenciaPagamento.mensal,
                valor: new Decimal(valor),
                dataInicio: subMonths(this.now, 3),
                status
            }
        });

        // 1. Cobrança Antiga (Paga)
        await this.prisma.cobranca.create({
            data: {
                assinaturaId: assinatura.id,
                valor: new Decimal(valor),
                periodoInicio: subMonths(this.now, 2),
                periodoFim: subMonths(this.now, 1),
                dataVencimento: subMonths(this.now, 2),
                status: StatusCobranca.pago,
                dataPagamento: subMonths(this.now, 2)
            }
        });

        // 2. Cobrança do Mês Atual (Variada)
        let statusCob: StatusCobranca = StatusCobranca.pendente;
        if (seedIndex % 4 === 0) statusCob = StatusCobranca.atrasado;
        if (seedIndex % 7 === 0) statusCob = StatusCobranca.aguardando_aprovacao;

        const cobAtual = await this.prisma.cobranca.create({
            data: {
                assinaturaId: assinatura.id,
                valor: new Decimal(valor),
                periodoInicio: startOfMonth(this.now),
                periodoFim: addDays(startOfMonth(this.now), 30),
                dataVencimento: statusCob === StatusCobranca.atrasado ? subDays(this.now, 5) : addDays(this.now, 5),
                status: statusCob,
                comprovanteUrl: statusCob === StatusCobranca.aguardando_aprovacao ? "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=400" : null
            }
        });

        // Criar Lote para alguns
        if (statusCob !== StatusCobranca.pendente && seedIndex % 2 === 0) {
            let statusLote: StatusLote = statusCob === StatusCobranca.aguardando_aprovacao ? StatusLote.aguardando_aprovacao : StatusLote.pendente;
            const lote = await this.prisma.lotePagamento.create({
                data: {
                    participanteId: p.id,
                    valorTotal: new Decimal(valor),
                    status: statusLote,
                    comprovanteUrl: statusCob === StatusCobranca.aguardando_aprovacao ? "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=400" : null
                }
            });
            await this.prisma.cobranca.update({ where: { id: cobAtual.id }, data: { lotePagamentoId: lote.id } });
        }
    }

    private finish() {
        Logger.info("🎉 AMBIENTE DEMO PRONTO!");
        console.log(`--------------------------------------------------`);
        console.log(`1. PRO: organizador@streamshare.com.br (25+ participantes, massivo)`);
        console.log(`2. BÁSICO: basico@streamshare.com.br (Iniciante)`);
        console.log(`3. BUSINESS: business@streamshare.com.br (Alta Densidade)`);
        console.log(`Senha padrão: demo123`);
        console.log(`--------------------------------------------------\n`);
    }
}

async function start() {
    const runner = new DemoSeedRunner(prisma);
    await runner.run();
}

start()
    .catch((e) => {
        Logger.error(`Erro fatal na seed: ${e.message}`);
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

