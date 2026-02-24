/**
 * Gera um payload (BR Code) válido para PIX Estático nativamente (EMV Specification).
 * Removida dependência do 'faz-um-pix' por incompatibilidade de ambiente.
 */
export async function generateStaticPix(
    pixKey: string,
    merchantName: string = "Titular",
    merchantCity: string = "Brasil",
    amount: number = 0,
    transactionId: string = "***"
): Promise<string> {
    const format = "000201";
    const gui = "0014br.gov.bcb.pix";

    // Chave PIX Formatada
    const chaveLen = pixKey.length.toString().padStart(2, '0');
    const chaveStr = `01${chaveLen}${pixKey}`;

    // Merchant Account Information
    const accountInfo = gui + chaveStr;
    const accountInfoLen = accountInfo.length.toString().padStart(2, '0');
    const accountStr = `26${accountInfoLen}${accountInfo}`;

    const category = "52040000";
    const currency = "5303986"; // BRL

    // Valor (Transaction Amount)
    let amountStr = "";
    if (amount > 0) {
        const amountVal = amount.toFixed(2);
        const amountLen = amountVal.length.toString().padStart(2, '0');
        amountStr = `54${amountLen}${amountVal}`;
    }

    const country = "5802BR";

    // Merchant Name
    let sanitizedName = merchantName.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 25).trim();
    if (!sanitizedName) sanitizedName = "Titular";
    const nameLen = sanitizedName.length.toString().padStart(2, '0');
    const nameStr = `59${nameLen}${sanitizedName}`;

    // Merchant City
    let sanitizedCity = merchantCity.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 15).trim();
    if (!sanitizedCity) sanitizedCity = "Brasil";
    const cityLen = sanitizedCity.length.toString().padStart(2, '0');
    const cityStr = `60${cityLen}${sanitizedCity}`;

    // Additional Data Field Template
    let sanitizedTxId = transactionId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25);
    if (!sanitizedTxId) sanitizedTxId = "***";
    const txIdLen = sanitizedTxId.length.toString().padStart(2, '0');
    const txIdStr = `05${txIdLen}${sanitizedTxId}`;
    const additionalLen = txIdStr.length.toString().padStart(2, '0');
    const additionalStr = `62${additionalLen}${txIdStr}`;

    const crc16Prefix = "6304";

    // Construção do Payload Parcial
    const payload = `${format}${accountStr}${category}${currency}${amountStr}${country}${nameStr}${cityStr}${additionalStr}${crc16Prefix}`;

    // Cálculo do CRC16-CCITT
    const crc = computeCRC16(payload);

    return `${payload}${crc}`;
}

/**
 * Calcula o algoritmo CRC16-CCITT polinomial 0x1021 usado pelo PIX
 */
function computeCRC16(payload: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
        crc ^= payload.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
        }
    }
    crc &= 0xFFFF;
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

