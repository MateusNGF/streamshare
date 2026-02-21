import { Pix } from "faz-um-pix";

/**
 * Gera um payload (BR Code) válido para PIX Estático usando a biblioteca faz-um-pix.
 */
export async function generateStaticPix(
    pixKey: string,
    merchantName: string = "Titular",
    merchantCity: string = "Brasil",
    amount: number = 0,
    transactionId: string = "***"
): Promise<string> {
    const pixPayload = await Pix(
        pixKey,
        merchantName.substring(0, 25).trim(),
        merchantCity.substring(0, 15).trim(),
        amount,
        transactionId.substring(0, 25)
    );

    return pixPayload;
}
