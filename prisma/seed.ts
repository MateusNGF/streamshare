import { PrismaClient, PlanoConta, ProviderAuth, NivelAcesso } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Catálogo de Streamings (Apenas Serviços que permitem divisão de conta/planos família)
const catalogos = [
    // --- VÍDEO ---
    {
        nome: "Netflix",
        categoria: "video",
        siteOficial: "https://www.netflix.com",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/netflix.svg",
        corPrimaria: "#E50914",
    },
    {
        nome: "Disney+",
        categoria: "video",
        siteOficial: "https://www.disneyplus.com",
        iconeUrl: "https://upload.wikimedia.org/wikipedia/commons/6/64/Disney%2B_2024.svg",
        corPrimaria: "#113CCF",
    },
    {
        nome: "Prime Video",
        categoria: "video",
        siteOficial: "https://www.primevideo.com",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/primevideo.svg",
        corPrimaria: "#00A8E1",
    },
    {
        nome: "Max",
        categoria: "video",
        siteOficial: "https://www.max.com",
        iconeUrl: "https://simpleicons.org/icons/max.svg",
        corPrimaria: "#0047FF",
    },
    {
        nome: "Globoplay",
        categoria: "video",
        siteOficial: "https://globoplay.globo.com",
        iconeUrl: "https://upload.wikimedia.org/wikipedia/commons/5/58/Globoplay_2018.svg",
        corPrimaria: "#FE1908",
    },
    {
        nome: "Paramount+",
        categoria: "video",
        siteOficial: "https://www.paramountplus.com",
        iconeUrl: "https://simpleicons.org/icons/paramountplus.svg",
        corPrimaria: "#0067E0",
    },
    {
        nome: "Apple TV+",
        categoria: "video",
        siteOficial: "https://tv.apple.com",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/appletv.svg",
        corPrimaria: "#000000",
    },
    {
        nome: "Crunchyroll",
        categoria: "video",
        siteOficial: "https://www.crunchyroll.com",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/crunchyroll.svg",
        corPrimaria: "#F47521",
    },
    {
        nome: "ViX",
        categoria: "video",
        siteOficial: "https://vix.com",
        iconeUrl: "https://simpleicons.org/icons/vix.svg",
        corPrimaria: "#FF5000",
    },
    {
        nome: "MUBI",
        categoria: "video",
        siteOficial: "https://mubi.com",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/mubi.svg",
        corPrimaria: "#000000",
    },

    // --- MÚSICA & ÁUDIO ---
    {
        nome: "Spotify",
        categoria: "musica",
        siteOficial: "https://www.spotify.com",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/spotify.svg",
        corPrimaria: "#1DB954",
    },
    {
        nome: "YouTube Premium",
        categoria: "musica",
        siteOficial: "https://www.youtube.com/premium",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/youtube.svg",
        corPrimaria: "#FF0000",
    },
    {
        nome: "Deezer",
        categoria: "musica",
        siteOficial: "https://www.deezer.com",
        iconeUrl: "https://simpleicons.org/icons/deezer.svg",
        corPrimaria: "#A238FF",
    },
    {
        nome: "Tidal",
        categoria: "musica",
        siteOficial: "https://tidal.com",
        iconeUrl: "https://simpleicons.org/icons/tidal.svg",
        corPrimaria: "#000000",
    },

    // --- GAMES ---
    {
        nome: "Xbox Game Pass",
        categoria: "games",
        siteOficial: "https://www.xbox.com/gamepass",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/xbox.svg",
        corPrimaria: "#107C10",
    },
    {
        nome: "PlayStation Plus",
        categoria: "games",
        siteOficial: "https://www.playstation.com/ps-plus",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/playstation.svg",
        corPrimaria: "#003087",
    },
    {
        nome: "Nintendo Switch Online",
        categoria: "games",
        siteOficial: "https://www.nintendo.com/switch/online-service",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/nintendo.svg",
        corPrimaria: "#E60012",
    },

    // --- PRODUTIVIDADE & IA ---
    {
        nome: "Microsoft 365 Família",
        categoria: "ia",
        siteOficial: "https://www.microsoft.com/microsoft-365",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/microsoftoffice.svg",
        corPrimaria: "#D83B01",
    },
    {
        nome: "Canva Pro (Equipes)",
        categoria: "design",
        siteOficial: "https://www.canva.com",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/canva.svg",
        corPrimaria: "#00C4CC",
    },

    {
        nome: "ChatGPT Plus (Team)",
        categoria: "ia",
        siteOficial: "https://chatgpt.com",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/openai.svg",
        corPrimaria: "#74AA9C",
    },
    {
        nome: "Claude Pro (Team)",
        categoria: "ia",
        siteOficial: "https://claude.ai",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/anthropic.svg",
        corPrimaria: "#D97757",
    },
    {
        nome: "Midjourney (Pro Plan)",
        categoria: "design",
        siteOficial: "https://www.midjourney.com",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/midjourney.svg",
        corPrimaria: "#000000",
    },

    // --- CONTEÚDO ADULTO (Com Perfis/Compartilháveis) ---
    {
        nome: "SexHot",
        categoria: "adulto",
        siteOficial: "https://www.sexhot.com.br",
        corPrimaria: "#FF0000",
        isConteudoAdulto: true,
    },
    {
        nome: "Playboy TV",
        categoria: "adulto",
        siteOficial: "https://www.playboytv.com",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/playboy.svg",
        corPrimaria: "#000000",
        isConteudoAdulto: true,
    },
    {
        nome: "Brasileirinhas",
        categoria: "adulto",
        siteOficial: "https://www.brasileirinhas.com.br",
        corPrimaria: "#FFD700",
        isConteudoAdulto: true,
    },
    // --- CANAIS, COMBOS & TV ---
    {
        nome: "Premiere",
        categoria: "tv",
        siteOficial: "https://ge.globo.com/premiere",
        corPrimaria: "#000000",
    },
    {
        nome: "Combate",
        categoria: "tv",
        siteOficial: "https://ge.globo.com/combate",
        corPrimaria: "#FF0000",
    },
    {
        nome: "Meli+ (Mercado Livre)",
        categoria: "combo",
        siteOficial: "https://www.mercadolivre.com.br/meli-plus",
        iconeUrl: "https://http2.mlstatic.com/frontend-assets/ml-guest-assets/favicon.svg",
        corPrimaria: "#FFE600",
    },
    {
        nome: "Claro tv+",
        categoria: "tv",
        siteOficial: "https://www.clarotvmais.com.br",
        corPrimaria: "#EE2E24",
    },
];

async function main() {
    console.log("🚀 Iniciando seed refinado do banco de dados...\n");

    // 1. Criar Catálogo de Streamings (Limpando os antigos que não estão na lista)
    console.log("\n📚 Atualizando catálogo de streamings...");

    // Opcional: Desativar itens que não estão na nova lista
    const nomesAtuais = catalogos.map(i => i.nome);
    await prisma.streamingCatalogo.updateMany({
        where: { nome: { notIn: nomesAtuais } },
        data: { isAtivo: false }
    });

    for (const item of catalogos) {
        await prisma.streamingCatalogo.upsert({
            where: { id: catalogos.indexOf(item) + 1 },
            update: {
                ...item,
                isAtivo: true,
            },
            create: {
                ...item,
                isAtivo: true,
            },
        });
        console.log(`  ✅ ${item.nome}`);
    }

    // 2. Criar Contas
    console.log("\n🏢 Criando contas...");

    const conta1 = await prisma.conta.upsert({
        where: { email: "atendimento@streamshare.com.br" },
        update: {
            nome: "StreamShare",
            plano: PlanoConta.pro,
            isAtivo: true,
        },
        create: {
            nome: "StreamShare",
            email: "atendimento@streamshare.com.br",
            plano: PlanoConta.pro,
            isAtivo: true,
        },
    });
    console.log(`  ✅ Conta Pro: ${conta1.nome}`);

    // 3. Criar Usuários
    console.log("\n👤 Criando usuários...");
    const senhaHash = await bcrypt.hash("ss@#$2026", 10);

    const usuario1 = await prisma.usuario.upsert({
        where: { email: "atendimento@streamshare.com.br" },
        update: {
            nome: "Admin StreamShare",
            senhaHash,
            provider: ProviderAuth.local,
            isAtivo: true,
        },
        create: {
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
    await prisma.contaUsuario.upsert({
        where: {
            contaId_usuarioId: {
                contaId: conta1.id,
                usuarioId: usuario1.id,
            }
        },
        update: {
            nivelAcesso: NivelAcesso.owner,
            isAtivo: true,
        },
        create: {
            contaId: conta1.id,
            usuarioId: usuario1.id,
            nivelAcesso: NivelAcesso.owner,
            isAtivo: true,
        },
    });
    console.log(`  ✅ ${usuario1.nome} → ${conta1.nome} (Owner)`);

    // 4.1. Criar Administrador do Sistema
    console.log("\n🔑 Criando administrador do sistema...");
    await prisma.usuarioAdmin.upsert({
        where: { usuarioId: usuario1.id },
        update: { isAtivo: true },
        create: {
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
