import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const catalogos = [
    {
        nome: "Netflix",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/netflix.svg",
        corPrimaria: "#E50914",
    },
    {
        nome: "Disney+",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/disneyplus.svg",
        corPrimaria: "#113CCF",
    },
    {
        nome: "Prime Video",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/primevideo.svg",
        corPrimaria: "#00A8E1",
    },
    {
        nome: "HBO Max",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/hbomax.svg",
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
        iconeUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Globoplay_logo.svg",
        corPrimaria: "#0099CC",
    },
    {
        nome: "Paramount+",
        iconeUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/paramountplus.svg",
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
    console.log("Iniciando seed do catálogo de streamings...");

    for (const item of catalogos) {
        // Find by name first to avoid duplicates
        const existing = await prisma.streamingCatalogo.findFirst({
            where: { nome: item.nome },
        });

        if (!existing) {
            await prisma.streamingCatalogo.create({
                data: {
                    ...item,
                    isAtivo: true,
                },
            });
            console.log(`✅ Criado: ${item.nome}`);
        } else {
            await prisma.streamingCatalogo.update({
                where: { id: existing.id },
                data: item,
            });
            console.log(`🔄 Atualizado: ${item.nome}`);
        }
    }

    console.log("Seed finalizado com sucesso!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
