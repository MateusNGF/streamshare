import { OAuth2Client, TokenPayload } from "google-auth-library";

export class GoogleAuthService {
    private client: OAuth2Client;
    private clientId: string;

    constructor() {
        this.clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
        this.client = new OAuth2Client(this.clientId);
    }

    /**
     * Verifies the Google ID Token and returns the payload.
     * Throws an error if the token is invalid.
     */
    async verifyIdToken(idToken: string): Promise<TokenPayload> {
        if (!idToken) {
            throw new Error("ID Token is required");
        }

        if (!this.clientId) {
            throw new Error("Google Client ID is not configured");
        }

        try {
            const ticket = await this.client.verifyIdToken({
                idToken,
                audience: this.clientId,
            });

            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                throw new Error("Invalid token payload");
            }

            // Security check: Verify issuer
            const issuer = payload.iss;
            if (!["accounts.google.com", "https://accounts.google.com"].includes(issuer)) {
                throw new Error("Invalid token issuer");
            }

            return payload;
        } catch (error: any) {
            console.error("[GOOGLE_AUTH_VERIFY_ERROR]", error.message);
            throw new Error("Falha na verificação do token Google");
        }
    }
}

// Export a singleton instance
export const googleAuthService = new GoogleAuthService();
