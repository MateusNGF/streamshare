import { PrismaClient, PlanoConta, ProviderAuth, NivelAcesso, FrequenciaPagamento, StatusAssinatura, StatusCobranca, TipoNotificacaoWhatsApp } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Catálogo de Streamings
const catalogos = [
    {
        nome: "Netflix",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/netflix.svg",
        corPrimaria: "#E50914",
    },
    {
        nome: "Disney+",
        iconeUrl: "https://upload.wikimedia.org/wikipedia/commons/6/64/Disney%2B_2024.svg",
        corPrimaria: "#113CCF",
    },
    {
        nome: "Prime Video",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/primevideo.svg",
        corPrimaria: "#00A8E1",
    },
    {
        nome: "HBO Max",
        iconeUrl: "https://simpleicons.org/icons/hbomax.svg",
        corPrimaria: "#7B2CBF",
    },
    {
        nome: "Spotify",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/spotify.svg",
        corPrimaria: "#1DB954",
    },
    {
        nome: "YouTube Premium",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/youtube.svg",
        corPrimaria: "#FF0000",
    },
    {
        nome: "Globoplay",
        iconeUrl: "https://upload.wikimedia.org/wikipedia/commons/5/58/Globoplay_2018.svg",
        corPrimaria: "#FE1908",
    },
    {
        nome: "Paramount+",
        iconeUrl: "https://simpleicons.org/icons/paramountplus.svg",
        corPrimaria: "#0067E0",
    },
    {
        nome: "Apple TV+",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/appletv.svg",
        corPrimaria: "#000000",
    },
    {
        nome: "Crunchyroll",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/crunchyroll.svg",
        corPrimaria: "#F47521",
    },
];

async function main() {
    console.log("🚀 Iniciando seed completo do banco de dados...\n");

    // Limpar dados existentes (em ordem reversa de dependências)
    console.log("🧹 Limpando dados existentes...");
    await prisma.whatsAppLog.deleteMany({});
    await prisma.whatsAppConfig.deleteMany({});
    await prisma.cobranca.deleteMany({});
    await prisma.assinatura.deleteMany({});
    await prisma.participante.deleteMany({});
    await prisma.grupoStreaming.deleteMany({});
    await prisma.streaming.deleteMany({});
    await prisma.grupo.deleteMany({});
    await prisma.contaUsuario.deleteMany({});
    await prisma.usuario.deleteMany({});
    await prisma.conta.deleteMany({});
    await prisma.streamingCatalogo.deleteMany({});

    // 1. Criar Catálogo de Streamings
    console.log("\n📚 Criando catálogo de streamings...");
    const catalogoMap = new Map();
    for (const item of catalogos) {
        const catalogo = await prisma.streamingCatalogo.create({
            data: {
                ...item,
                isAtivo: true,
            },
        });
        catalogoMap.set(item.nome, catalogo);
        console.log(`  ✅ ${item.nome}`);
    }

    // 2. Criar Contas
    console.log("\n🏢 Criando contas...");

    // NOTA: limiteGrupos aqui é temporário e será migrado para tabela PlanoConfig
    // Valores atuais estão alinhados com a recomendação conservadora:
    // - basico: 5 grupos (permitirá 1 streaming, 5 participantes após implementação)
    // - pro: 20 grupos (permitirá 10 streamings, 100 participantes após implementação)
    // - premium: 100 grupos (permitirá 50 streamings, 500 participantes após implementação)

    const conta1 = await prisma.conta.create({
        data: {
            nome: "StreamShare Master",
            email: "contato@streamshare.com.br",
            plano: PlanoConta.pro,
            limiteGrupos: 20, // Alinhado com PlanoConfig.pro
            isAtivo: true,
        },
    });
    console.log(`  ✅ Conta Pro: ${conta1.nome}`);

    const conta2 = await prisma.conta.create({
        data: {
            nome: "Grupo Familia Silva",
            email: "silva.streaming@gmail.com",
            plano: PlanoConta.basico,
            limiteGrupos: 2, // ✅ AJUSTADO: basico deve ter menos recursos
            isAtivo: true,
        },
    });
    console.log(`  ✅ Conta Básico: ${conta2.nome}`);

    const conta3 = await prisma.conta.create({
        data: {
            nome: "Revenda Premium Streams",
            email: "premium@revendastreaming.com",
            plano: PlanoConta.premium,
            limiteGrupos: 100, // Alinhado com PlanoConfig.premium
            isAtivo: true,
        },
    });
    console.log(`  ✅ Conta Premium: ${conta3.nome}`);

    // 3. Criar Usuários
    console.log("\n👤 Criando usuários...");
    const senhaHash = await bcrypt.hash("senha123", 10);

    const usuario1 = await prisma.usuario.create({
        data: {
            email: "admin@streamshare.com.br",
            nome: "Admin StreamShare",
            senhaHash,
            provider: ProviderAuth.local,
            isAtivo: true,
            ultimoLogin: new Date(),
        },
    });
    console.log(`  ✅ ${usuario1.nome} (${usuario1.email})`);

    const usuario2 = await prisma.usuario.create({
        data: {
            email: "joao.silva@gmail.com",
            nome: "João Silva",
            senhaHash,
            provider: ProviderAuth.google,
            isAtivo: true,
            ultimoLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        },
    });
    console.log(`  ✅ ${usuario2.nome} (${usuario2.email})`);

    const usuario3 = await prisma.usuario.create({
        data: {
            email: "maria.santos@hotmail.com",
            nome: "Maria Santos",
            senhaHash,
            provider: ProviderAuth.local,
            isAtivo: true,
            ultimoLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
        },
    });
    console.log(`  ✅ ${usuario3.nome} (${usuario3.email})`);

    const usuario4 = await prisma.usuario.create({
        data: {
            email: "carlos.oliveira@outlook.com",
            nome: "Carlos Oliveira",
            senhaHash,
            provider: ProviderAuth.google,
            isAtivo: true,
        },
    });
    console.log(`  ✅ ${usuario4.nome} (${usuario4.email})`);

    // 4. Vincular Usuários às Contas
    console.log("\n🔗 Vinculando usuários às contas...");
    await prisma.contaUsuario.create({
        data: {
            contaId: conta1.id,
            usuarioId: usuario1.id,
            nivelAcesso: NivelAcesso.owner,
            isAtivo: true,
        },
    });
    console.log(`  ✅ ${usuario1.nome} → ${conta1.nome} (Owner)`);

    await prisma.contaUsuario.create({
        data: {
            contaId: conta2.id,
            usuarioId: usuario2.id,
            nivelAcesso: NivelAcesso.owner,
            isAtivo: true,
        },
    });
    console.log(`  ✅ ${usuario2.nome} → ${conta2.nome} (Owner)`);

    await prisma.contaUsuario.create({
        data: {
            contaId: conta3.id,
            usuarioId: usuario3.id,
            nivelAcesso: NivelAcesso.owner,
            isAtivo: true,
        },
    });
    console.log(`  ✅ ${usuario3.nome} → ${conta3.nome} (Owner)`);

    // Usuario 4 como admin na conta 1
    await prisma.contaUsuario.create({
        data: {
            contaId: conta1.id,
            usuarioId: usuario4.id,
            nivelAcesso: NivelAcesso.admin,
            isAtivo: true,
        },
    });
    console.log(`  ✅ ${usuario4.nome} → ${conta1.nome} (Admin)`);

    // 5. Criar Participantes
    console.log("\n👥 Criando participantes...");
    const participante1 = await prisma.participante.create({
        data: {
            contaId: conta1.id,
            nome: "Ana Costa",
            whatsappNumero: "+5511987654321",
            cpf: "123.456.789-01",
            email: "ana.costa@email.com",
        },
    });
    console.log(`  ✅ ${participante1.nome}`);

    const participante2 = await prisma.participante.create({
        data: {
            contaId: conta1.id,
            nome: "Pedro Almeida",
            whatsappNumero: "+5511976543210",
            cpf: "234.567.890-12",
            email: "pedro.almeida@email.com",
        },
    });
    console.log(`  ✅ ${participante2.nome}`);

    const participante3 = await prisma.participante.create({
        data: {
            contaId: conta2.id,
            nome: "Fernanda Silva",
            whatsappNumero: "+5521998877665",
            cpf: "345.678.901-23",
            email: "fernanda.silva@email.com",
            userId: usuario2.id,
        },
    });
    console.log(`  ✅ ${participante3.nome} (vinculado ao usuário)`);

    const participante4 = await prisma.participante.create({
        data: {
            contaId: conta2.id,
            nome: "Roberto Silva",
            whatsappNumero: "+5521987766554",
            cpf: "456.789.012-34",
            email: "roberto.silva@email.com",
        },
    });
    console.log(`  ✅ ${participante4.nome}`);

    const participante5 = await prisma.participante.create({
        data: {
            contaId: conta3.id,
            nome: "Juliana Martins",
            whatsappNumero: "+5531999887766",
            cpf: "567.890.123-45",
            email: "juliana.martins@email.com",
        },
    });
    console.log(`  ✅ ${participante5.nome}`);

    const participante6 = await prisma.participante.create({
        data: {
            contaId: conta3.id,
            nome: "Ricardo Souza",
            whatsappNumero: "+5531988776655",
            cpf: "678.901.234-56",
        },
    });
    console.log(`  ✅ ${participante6.nome}`);

    // 6. Criar Streamings
    console.log("\n🎬 Criando streamings...");
    const streamingNetflix = await prisma.streaming.create({
        data: {
            contaId: conta1.id,
            streamingCatalogoId: catalogoMap.get("Netflix")!.id,
            valorIntegral: 55.90,
            limiteParticipantes: 4,
            credenciaisLogin: "netflix@conta1.com",
            credenciaisSenha: "senha123",
            frequenciasHabilitadas: "mensal,trimestral,anual",
            isAtivo: true,
        },
    });
    console.log(`  ✅ Netflix - Conta 1`);

    const streamingDisney = await prisma.streaming.create({
        data: {
            contaId: conta1.id,
            streamingCatalogoId: catalogoMap.get("Disney+")!.id,
            valorIntegral: 43.90,
            limiteParticipantes: 4,
            credenciaisLogin: "disney@conta1.com",
            credenciaisSenha: "disney123",
            frequenciasHabilitadas: "mensal,anual",
            isAtivo: true,
        },
    });
    console.log(`  ✅ Disney+ - Conta 1`);

    const streamingSpotify = await prisma.streaming.create({
        data: {
            contaId: conta2.id,
            streamingCatalogoId: catalogoMap.get("Spotify")!.id,
            valorIntegral: 34.90,
            limiteParticipantes: 6,
            credenciaisLogin: "spotify@familia.com",
            credenciaisSenha: "spotify123",
            frequenciasHabilitadas: "mensal",
            isAtivo: true,
        },
    });
    console.log(`  ✅ Spotify - Conta 2`);

    const streamingPrime = await prisma.streaming.create({
        data: {
            contaId: conta3.id,
            streamingCatalogoId: catalogoMap.get("Prime Video")!.id,
            valorIntegral: 14.90,
            limiteParticipantes: 3,
            credenciaisLogin: "prime@revenda.com",
            credenciaisSenha: "prime123",
            frequenciasHabilitadas: "mensal,anual",
            isAtivo: true,
        },
    });
    console.log(`  ✅ Prime Video - Conta 3`);

    const streamingHBO = await prisma.streaming.create({
        data: {
            contaId: conta3.id,
            streamingCatalogoId: catalogoMap.get("HBO Max")!.id,
            valorIntegral: 34.90,
            limiteParticipantes: 5,
            isAtivo: true,
        },
    });
    console.log(`  ✅ HBO Max - Conta 3`);

    // 7. Criar Grupos
    console.log("\n📦 Criando grupos...");
    const grupo1 = await prisma.grupo.create({
        data: {
            contaId: conta1.id,
            nome: "Grupo Premium",
            descricao: "Grupo com Netflix e Disney+",
            linkConvite: "premium-abc123",
            permitirEscolhaStreamings: true,
            isPublico: true,
            isAtivo: true,
        },
    });
    console.log(`  ✅ ${grupo1.nome}`);

    const grupo2 = await prisma.grupo.create({
        data: {
            contaId: conta2.id,
            nome: "Família Silva",
            descricao: "Grupo familiar com Spotify",
            linkConvite: "familia-silva-xyz789",
            permitirEscolhaStreamings: false,
            isPublico: false,
            isAtivo: true,
        },
    });
    console.log(`  ✅ ${grupo2.nome}`);

    const grupo3 = await prisma.grupo.create({
        data: {
            contaId: conta3.id,
            nome: "Revenda Mix",
            descricao: "Diversos streamings disponíveis",
            linkConvite: "revenda-mix-def456",
            permitirEscolhaStreamings: true,
            isPublico: true,
            isAtivo: true,
        },
    });
    console.log(`  ✅ ${grupo3.nome}`);

    // 8. Vincular Streamings aos Grupos
    console.log("\n🔗 Vinculando streamings aos grupos...");
    await prisma.grupoStreaming.create({
        data: {
            streamingId: streamingNetflix.id,
            grupoId: grupo1.id,
            isAtivo: true,
        },
    });
    console.log(`  ✅ Netflix → Grupo Premium`);

    await prisma.grupoStreaming.create({
        data: {
            streamingId: streamingDisney.id,
            grupoId: grupo1.id,
            isAtivo: true,
        },
    });
    console.log(`  ✅ Disney+ → Grupo Premium`);

    await prisma.grupoStreaming.create({
        data: {
            streamingId: streamingSpotify.id,
            grupoId: grupo2.id,
            isAtivo: true,
        },
    });
    console.log(`  ✅ Spotify → Família Silva`);

    await prisma.grupoStreaming.create({
        data: {
            streamingId: streamingPrime.id,
            grupoId: grupo3.id,
            isAtivo: true,
        },
    });
    console.log(`  ✅ Prime Video → Revenda Mix`);

    await prisma.grupoStreaming.create({
        data: {
            streamingId: streamingHBO.id,
            grupoId: grupo3.id,
            isAtivo: true,
        },
    });
    console.log(`  ✅ HBO Max → Revenda Mix`);

    // 9. Criar Assinaturas
    console.log("\n📝 Criando assinaturas...");
    const hoje = new Date();
    const umMesAtras = new Date(hoje);
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);
    const doisMesesAtras = new Date(hoje);
    doisMesesAtras.setMonth(doisMesesAtras.getMonth() - 2);

    // Assinatura ativa - Netflix
    const assinatura1 = await prisma.assinatura.create({
        data: {
            participanteId: participante1.id,
            streamingId: streamingNetflix.id,
            frequencia: FrequenciaPagamento.mensal,
            status: StatusAssinatura.ativa,
            dataInicio: umMesAtras,
            valor: 13.98, // 55.90 / 4 participantes
            diasAtraso: 0,
        },
    });
    console.log(`  ✅ ${participante1.nome} → Netflix (Ativa)`);

    // Assinatura ativa - Disney+
    const assinatura2 = await prisma.assinatura.create({
        data: {
            participanteId: participante2.id,
            streamingId: streamingDisney.id,
            frequencia: FrequenciaPagamento.mensal,
            status: StatusAssinatura.ativa,
            dataInicio: umMesAtras,
            valor: 10.98, // 43.90 / 4 participantes
            diasAtraso: 0,
        },
    });
    console.log(`  ✅ ${participante2.nome} → Disney+ (Ativa)`);

    // Assinatura com atraso - Spotify
    const assinatura3 = await prisma.assinatura.create({
        data: {
            participanteId: participante3.id,
            streamingId: streamingSpotify.id,
            frequencia: FrequenciaPagamento.mensal,
            status: StatusAssinatura.ativa,
            dataInicio: doisMesesAtras,
            valor: 5.82, // 34.90 / 6 participantes
            diasAtraso: 5,
        },
    });
    console.log(`  ✅ ${participante3.nome} → Spotify (Ativa - 5 dias de atraso)`);

    // Assinatura suspensa - Spotify
    const assinatura4 = await prisma.assinatura.create({
        data: {
            participanteId: participante4.id,
            streamingId: streamingSpotify.id,
            frequencia: FrequenciaPagamento.mensal,
            status: StatusAssinatura.suspensa,
            dataInicio: doisMesesAtras,
            valor: 5.82,
            diasAtraso: 15,
            dataSuspensao: new Date(),
            motivoSuspensao: "Pagamento em atraso há mais de 15 dias",
        },
    });
    console.log(`  ✅ ${participante4.nome} → Spotify (Suspensa)`);

    // Assinatura ativa - Prime Video
    const assinatura5 = await prisma.assinatura.create({
        data: {
            participanteId: participante5.id,
            streamingId: streamingPrime.id,
            frequencia: FrequenciaPagamento.trimestral,
            status: StatusAssinatura.ativa,
            dataInicio: umMesAtras,
            valor: 4.97, // 14.90 / 3 participantes
            diasAtraso: 0,
        },
    });
    console.log(`  ✅ ${participante5.nome} → Prime Video (Ativa - Trimestral)`);

    // Assinatura ativa - HBO Max
    const assinatura6 = await prisma.assinatura.create({
        data: {
            participanteId: participante6.id,
            streamingId: streamingHBO.id,
            frequencia: FrequenciaPagamento.anual,
            status: StatusAssinatura.ativa,
            dataInicio: umMesAtras,
            valor: 6.98, // 34.90 / 5 participantes
            diasAtraso: 0,
        },
    });
    console.log(`  ✅ ${participante6.nome} → HBO Max (Ativa - Anual)`);

    // 10. Criar Cobranças
    console.log("\n💰 Criando cobranças...");

    // Cobrança paga - Netflix
    await prisma.cobranca.create({
        data: {
            assinaturaId: assinatura1.id,
            valor: 13.98,
            periodoInicio: umMesAtras,
            periodoFim: hoje,
            dataPagamento: new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
            status: StatusCobranca.pago,
            comprovanteUrl: "https://exemplo.com/comprovante1.pdf",
        },
    });
    console.log(`  ✅ Netflix - Cobrança Paga (${participante1.nome})`);

    // Cobrança pendente - Netflix (nova)
    const proximoMes = new Date(hoje);
    proximoMes.setMonth(proximoMes.getMonth() + 1);
    await prisma.cobranca.create({
        data: {
            assinaturaId: assinatura1.id,
            valor: 13.98,
            periodoInicio: hoje,
            periodoFim: proximoMes,
            status: StatusCobranca.pendente,
        },
    });
    console.log(`  ✅ Netflix - Cobrança Pendente (${participante1.nome})`);

    // Cobrança paga - Disney+
    await prisma.cobranca.create({
        data: {
            assinaturaId: assinatura2.id,
            valor: 10.98,
            periodoInicio: umMesAtras,
            periodoFim: hoje,
            dataPagamento: new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
            status: StatusCobranca.pago,
            comprovanteUrl: "https://exemplo.com/comprovante2.pdf",
        },
    });
    console.log(`  ✅ Disney+ - Cobrança Paga (${participante2.nome})`);

    // Cobrança atrasada - Spotify
    const cincoDiasAtras = new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000);
    await prisma.cobranca.create({
        data: {
            assinaturaId: assinatura3.id,
            valor: 5.82,
            periodoInicio: doisMesesAtras,
            periodoFim: cincoDiasAtras,
            status: StatusCobranca.atrasado,
        },
    });
    console.log(`  ✅ Spotify - Cobrança Atrasada (${participante3.nome})`);

    // Cobrança cancelada - Spotify (suspensa)
    await prisma.cobranca.create({
        data: {
            assinaturaId: assinatura4.id,
            valor: 5.82,
            periodoInicio: doisMesesAtras,
            periodoFim: umMesAtras,
            status: StatusCobranca.cancelado,
        },
    });
    console.log(`  ✅ Spotify - Cobrança Cancelada (${participante4.nome})`);

    // Cobrança paga - Prime Video (trimestral)
    const tresProximosMeses = new Date(hoje);
    tresProximosMeses.setMonth(tresProximosMeses.getMonth() + 3);
    await prisma.cobranca.create({
        data: {
            assinaturaId: assinatura5.id,
            valor: 4.97,
            periodoInicio: hoje,
            periodoFim: tresProximosMeses,
            dataPagamento: hoje,
            status: StatusCobranca.pago,
            comprovanteUrl: "https://exemplo.com/comprovante3.pdf",
        },
    });
    console.log(`  ✅ Prime Video - Cobrança Paga Trimestral (${participante5.nome})`);

    // Cobrança paga - HBO Max (anual)
    const umAnoProximo = new Date(hoje);
    umAnoProximo.setFullYear(umAnoProximo.getFullYear() + 1);
    await prisma.cobranca.create({
        data: {
            assinaturaId: assinatura6.id,
            valor: 6.98,
            periodoInicio: hoje,
            periodoFim: umAnoProximo,
            dataPagamento: hoje,
            status: StatusCobranca.pago,
            comprovanteUrl: "https://exemplo.com/comprovante4.pdf",
        },
    });
    console.log(`  ✅ HBO Max - Cobrança Paga Anual (${participante6.nome})`);

    // 11. Criar Configurações do WhatsApp
    console.log("\n📱 Criando configurações do WhatsApp...");
    const whatsappConfig1 = await prisma.whatsAppConfig.create({
        data: {
            contaId: conta1.id,
            provider: "twilio",
            apiKey: "AC1234567890abcdef",
            apiSecret: "auth_token_secret_123",
            phoneNumber: "+5511999999999",
            notificarNovaAssinatura: true,
            notificarCobrancaGerada: true,
            notificarCobrancaVencendo: true,
            notificarCobrancaAtrasada: true,
            notificarAssinaturaSuspensa: true,
            notificarPagamentoConfirmado: true,
            diasAvisoVencimento: 3,
            isAtivo: true,
        },
    });
    console.log(`  ✅ WhatsApp Config - Conta 1`);

    const whatsappConfig2 = await prisma.whatsAppConfig.create({
        data: {
            contaId: conta2.id,
            provider: "twilio",
            apiKey: "AC0987654321fedcba",
            apiSecret: "auth_token_secret_456",
            phoneNumber: "+5521988888888",
            notificarNovaAssinatura: true,
            notificarCobrancaGerada: true,
            notificarCobrancaVencendo: false,
            notificarCobrancaAtrasada: true,
            notificarAssinaturaSuspensa: true,
            notificarPagamentoConfirmado: false,
            diasAvisoVencimento: 5,
            isAtivo: true,
        },
    });
    console.log(`  ✅ WhatsApp Config - Conta 2`);

    // 12. Criar Logs do WhatsApp
    console.log("\n📋 Criando logs do WhatsApp...");

    // Log de nova assinatura - enviado
    await prisma.whatsAppLog.create({
        data: {
            configId: whatsappConfig1.id,
            participanteId: participante1.id,
            tipo: TipoNotificacaoWhatsApp.nova_assinatura,
            numeroDestino: participante1.whatsappNumero,
            mensagem: `Olá ${participante1.nome}! Sua assinatura do Netflix foi criada com sucesso! 🎉`,
            enviado: true,
            providerId: "SM1234567890abcdef",
        },
    });
    console.log(`  ✅ Log: Nova assinatura (${participante1.nome})`);

    // Log de cobrança gerada - enviado
    await prisma.whatsAppLog.create({
        data: {
            configId: whatsappConfig1.id,
            participanteId: participante1.id,
            tipo: TipoNotificacaoWhatsApp.cobranca_gerada,
            numeroDestino: participante1.whatsappNumero,
            mensagem: `Olá ${participante1.nome}! Nova cobrança gerada: R$ 13,98 para Netflix.`,
            enviado: true,
            providerId: "SM0987654321fedcba",
        },
    });
    console.log(`  ✅ Log: Cobrança gerada (${participante1.nome})`);

    // Log de pagamento confirmado - enviado
    await prisma.whatsAppLog.create({
        data: {
            configId: whatsappConfig1.id,
            participanteId: participante1.id,
            tipo: TipoNotificacaoWhatsApp.pagamento_confirmado,
            numeroDestino: participante1.whatsappNumero,
            mensagem: `Olá ${participante1.nome}! Pagamento confirmado! 💚 Obrigado!`,
            enviado: true,
            providerId: "SM1122334455aabbcc",
        },
    });
    console.log(`  ✅ Log: Pagamento confirmado (${participante1.nome})`);

    // Log de cobrança atrasada - enviado
    await prisma.whatsAppLog.create({
        data: {
            configId: whatsappConfig2.id,
            participanteId: participante3.id,
            tipo: TipoNotificacaoWhatsApp.cobranca_atrasada,
            numeroDestino: participante3.whatsappNumero,
            mensagem: `Olá ${participante3.nome}! Sua cobrança do Spotify está atrasada há 5 dias. Por favor, realize o pagamento.`,
            enviado: true,
            providerId: "SM5566778899ddeeff",
        },
    });
    console.log(`  ✅ Log: Cobrança atrasada (${participante3.nome})`);

    // Log de assinatura suspensa - enviado
    await prisma.whatsAppLog.create({
        data: {
            configId: whatsappConfig2.id,
            participanteId: participante4.id,
            tipo: TipoNotificacaoWhatsApp.assinatura_suspensa,
            numeroDestino: participante4.whatsappNumero,
            mensagem: `Olá ${participante4.nome}! Sua assinatura do Spotify foi suspensa devido ao atraso no pagamento.`,
            enviado: true,
            providerId: "SM9988776655ccbbaa",
        },
    });
    console.log(`  ✅ Log: Assinatura suspensa (${participante4.nome})`);

    // Log de falha no envio
    await prisma.whatsAppLog.create({
        data: {
            configId: whatsappConfig1.id,
            participanteId: participante2.id,
            tipo: TipoNotificacaoWhatsApp.cobranca_vencendo,
            numeroDestino: participante2.whatsappNumero,
            mensagem: `Olá ${participante2.nome}! Sua cobrança vence em 3 dias.`,
            enviado: false,
            erro: "Erro ao enviar mensagem: número bloqueado ou inválido",
        },
    });
    console.log(`  ✅ Log: Tentativa de envio (falhou - ${participante2.nome})`);

    console.log("\n✨ Seed completo finalizado com sucesso!");
    console.log("\n📊 Resumo:");
    console.log(`   • ${await prisma.conta.count()} contas`);
    console.log(`   • ${await prisma.usuario.count()} usuários`);
    console.log(`   • ${await prisma.participante.count()} participantes`);
    console.log(`   • ${await prisma.streamingCatalogo.count()} streamings no catálogo`);
    console.log(`   • ${await prisma.streaming.count()} streamings configurados`);
    console.log(`   • ${await prisma.grupo.count()} grupos`);
    console.log(`   • ${await prisma.assinatura.count()} assinaturas`);
    console.log(`   • ${await prisma.cobranca.count()} cobranças`);
    console.log(`   • ${await prisma.whatsAppConfig.count()} configurações WhatsApp`);
    console.log(`   • ${await prisma.whatsAppLog.count()} logs WhatsApp\n`);
}

main()
    .catch((e) => {
        console.error("❌ Erro ao executar seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
