import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'StreamShare',
        short_name: 'StreamShare',
        description: 'Gestão colaborativa de assinaturas de streaming',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/assets/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    }
}
