import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SEPARATOR = ":";

function getEncryptionKey(): Buffer {
    const key = process.env.CREDENTIALS_ENCRYPTION_KEY;
    if (!key) {
        throw new Error(
            "[ENCRYPTION] CREDENTIALS_ENCRYPTION_KEY não configurada. " +
            "Defina uma chave hex de 64 caracteres no .env"
        );
    }
    if (key.length !== 64) {
        throw new Error(
            "[ENCRYPTION] CREDENTIALS_ENCRYPTION_KEY deve ter exatamente 64 caracteres hex (32 bytes)."
        );
    }
    return Buffer.from(key, "hex");
}

/**
 * Criptografa um texto plano usando AES-256-GCM.
 * Retorna string no formato: `iv:authTag:ciphertext` (tudo em hex).
 */
export function encrypt(plaintext: string): string {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return [
        iv.toString("hex"),
        authTag.toString("hex"),
        encrypted
    ].join(SEPARATOR);
}

/**
 * Descriptografa um texto criptografado com AES-256-GCM.
 * Espera string no formato: `iv:authTag:ciphertext` (tudo em hex).
 */
export function decrypt(encryptedText: string): string {
    const key = getEncryptionKey();
    const parts = encryptedText.split(SEPARATOR);

    if (parts.length !== 3) {
        throw new Error("[ENCRYPTION] Formato inválido de texto criptografado.");
    }

    const [ivHex, authTagHex, ciphertext] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

/**
 * Verifica se uma string parece estar no formato criptografado (iv:authTag:ciphertext em hex).
 * Usado para distinguir valores legados em texto plano de valores já criptografados.
 */
export function isEncrypted(value: string): boolean {
    const parts = value.split(SEPARATOR);
    if (parts.length !== 3) return false;

    const [ivHex, authTagHex, ciphertext] = parts;

    // IV = 16 bytes = 32 hex chars, AuthTag = 16 bytes = 32 hex chars
    if (ivHex.length !== IV_LENGTH * 2) return false;
    if (authTagHex.length !== AUTH_TAG_LENGTH * 2) return false;
    if (ciphertext.length === 0) return false;

    // Verify all parts are valid hex
    const hexRegex = /^[0-9a-f]+$/i;
    return hexRegex.test(ivHex) && hexRegex.test(authTagHex) && hexRegex.test(ciphertext);
}

/**
 * Descriptografa com segurança, retornando o valor original se não estiver criptografado.
 * Isso permite compatibilidade retroativa com valores legados em texto plano.
 */
export function safeDecrypt(value: string | null | undefined): string | null {
    if (!value) return null;

    if (!isEncrypted(value)) {
        // Valor legado em texto plano — retorna como está
        return value;
    }

    try {
        return decrypt(value);
    } catch {
        // Se a descriptografia falhar, retorna o valor original
        console.error("[ENCRYPTION] Falha ao descriptografar credencial. Retornando valor original.");
        return value;
    }
}
