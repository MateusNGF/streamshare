
import jwt from "jsonwebtoken";

const SHARE_SECRET = process.env.SHARE_SECRET || process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface ShareTokenPayload {
    streamingId: number;
    type: 'share_link';
}

export function generateShareToken(streamingId: number, expiresIn: string | number): string {
    const options: jwt.SignOptions = {};

    if (expiresIn !== 'never') {
        // If it's a number, it's treated as seconds. If string, likely '1h', '2d' etc.
        options.expiresIn = expiresIn as any;
    }

    return jwt.sign({ streamingId, type: 'share_link' }, SHARE_SECRET, options);
}

export function verifyShareToken(token: string): ShareTokenPayload | null {
    try {
        const payload = jwt.verify(token, SHARE_SECRET, { clockTolerance: 120 }) as ShareTokenPayload;
        if (payload.type !== 'share_link') return null;
        return payload;
    } catch (error) {
        return null;
    }
}
