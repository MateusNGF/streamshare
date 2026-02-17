import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: 'linear-gradient(to bottom right, #7c3aed, #4c1d95)', // Gradiente Roxo
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: '8px', // Borda levemente arredondada (estilo moderno)
                    fontWeight: 800,
                }}
            >
                {/* S estilizado ou símbolo de Play/Share */}
                <div style={{ marginTop: '-2px' }}>S</div>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    )
}
