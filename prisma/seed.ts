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
    {
        nome: "Duolingo",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/duolingo.svg",
        corPrimaria: "#58CC02",
    },
];

async function main() {
    console.log("🚀 Iniciando seed completo do banco de dados...\n");

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

    const conta1 = await prisma.conta.create({
        data: {
            nome: "StreamShare",
            email: "atendimento@streamshare.com.br",
            plano: PlanoConta.pro,
            limiteGrupos: 20,
            isAtivo: true,
        },
    });
    console.log(`  ✅ Conta Pro: ${conta1.nome}`);

    // 3. Criar Usuários
    console.log("\n👤 Criando usuários...");
    const senhaHash = await bcrypt.hash("senha123", 10);

    const usuario1 = await prisma.usuario.create({
        data: {
            email: "atendimento@streamshare.com.br",
            nome: "Admin StreamShare",
            senhaHash,
            provider: ProviderAuth.local,
            isAtivo: true,
            ultimoLogin: new Date(),
        },
    });
    console.log(`  ✅ ${usuario1.nome} (${usuario1.email})`);



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


    // 4.1. Criar Administrador do Sistema
    console.log("\n🔑 Criando administrador do sistema...");
    await prisma.usuarioAdmin.create({
        data: {
            usuarioId: usuario1.id,
            isAtivo: true
        }
    });
    console.log(`  ✅ ${usuario1.nome} agora é Administrador do Sistema`);

}

main()
    .catch((e) => {
        console.error("❌ Erro ao executar seed:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
