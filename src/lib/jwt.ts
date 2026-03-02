import { SignJWT, jwtVerify } from "jose";

export const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

// Convert the secret string to a Uint8Array which jose requires
export const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
    userId: number;
    email: string;
    sessionVersion: number;
    clientIp?: string;
    exp?: number;
    [key: string]: any; // To satisfy jose's JWTPayload type
}

export async function generateToken(payload: JWTPayload): Promise<string> {
    const iat = Math.floor(Date.now() / 1000);

    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt(iat)
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(encodedSecret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, encodedSecret, {
            algorithms: ["HS256"],
        });
        return payload as unknown as JWTPayload;
    } catch (error) {
        return null;
    }
}
