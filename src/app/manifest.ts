import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'StreamShare - Economia Inteligente',
        short_name: 'StreamShare',
        description: 'Gerencie e compartilhe assinaturas de streaming. Economize até 80% automaticamente.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#7c3aed', // Roxo da marca
        orientation: 'portrait',
        categories: ['finance', 'utilities', 'productivity'],
        icons: [
            {
                src: '/icon', // Usa o ícone dinâmico
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
