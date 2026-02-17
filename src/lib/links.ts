/**
 * Formats and manages links for the application.
 */
export const LinkUtils = {
    /**
     * Generates a public invite link from a token.
     */
    getInviteUrl(token: string): string {
        const baseUrl = process.env.NEXT_PUBLIC_URL;
        return `${baseUrl}/assinar/${token}`;
    },

    /**
     * Determines if a link is considered "Permanent" (expires in more than 5 years).
     */
    isPermanent(expiresAt: Date): boolean {
        return expiresAt.getFullYear() > new Date().getFullYear() + 5;
    },

    /**
     * Checks if a link is expired.
     */
    isExpired(expiresAt: Date): boolean {
        return expiresAt < new Date();
    }
};
