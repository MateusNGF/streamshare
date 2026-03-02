import { getBaseTemplate } from "./base";

interface LoteAprovadoProps {
    participanteNome: string;
    loteId: number;
    quantidadeItens: number;
    valorTotal: string;
    replyTo: string;
}

export function getLoteAprovadoTemplate({
    participanteNome,
    loteId,
    quantidadeItens,
    valorTotal,
    replyTo,
}: LoteAprovadoProps): string {
    const content = `
        <p style="margin: 0 0 24px; font-size: 18px; line-height: 1.6; font-weight: 500;">
            Boas notícias, <strong>${participanteNome}</strong>! 🚀
        </p>
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
            Seu lote de pagamento <strong>#${loteId}</strong>, contendo <strong>${quantidadeItens}</strong> assinaturas, acaba de ser <strong>aprovado</strong>!
        </p>
        
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: center;">
            <p style="margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #166534; font-weight: 700;">VALOR TOTAL LIQUIDADO</p>
            <h2 style="margin: 0; font-size: 32px; color: #166534; font-weight: 900;">${valorTotal}</h2>
        </div>

        <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #475569;">
            Todos os seus acessos vinculados a este pagamento já foram liberados ou renovados. Você já pode aproveitar o melhor do streaming!
        </p>
        
        <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 18px 36px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 14px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);">Acessar Meu Painel</a>
        </div>
    `;

    return getBaseTemplate({
        title: "Pagamento Aprovado - StreamShare",
        headerEmoji: "✅",
        headerText: "Pagamento Confirmado!",
        content,
        replyTo,
    });
}

interface LoteRejeitadoProps {
    participanteNome: string;
    loteId: number;
    motivo: string;
    replyTo: string;
}

export function getLoteRejeitadoTemplate({
    participanteNome,
    loteId,
    motivo,
    replyTo,
}: LoteRejeitadoProps): string {
    const content = `
        <p style="margin: 0 0 24px; font-size: 18px; line-height: 1.6; font-weight: 500;">
            Atenção, <strong>${participanteNome}</strong>.
        </p>
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
            Lamentamos informar que o seu comprovante para o lote de pagamento <strong>#${loteId}</strong> não pôde ser validado e foi <strong>rejeitado</strong> pela administração.
        </p>
        
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
            <p style="margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #991b1b; font-weight: 700;">MOTIVO DA REJEIÇÃO</p>
            <p style="margin: 0; font-size: 16px; color: #991b1b; font-weight: 600; line-height: 1.5;">${motivo}</p>
        </div>

        <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #475569;">
            Fique tranquilo! Você pode enviar um novo comprovante (ou o arquivo corrigido) diretamente pelo seu painel para que possamos validar novamente.
        </p>
        
        <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 18px 36px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 14px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.4);">Reenviar Comprovante</a>
        </div>
    `;

    return getBaseTemplate({
        title: "Ação Necessária: Pagamento Rejeitado - StreamShare",
        headerEmoji: "⚠️",
        headerText: "Ops! Algo deu errado",
        content,
        replyTo,
    });
}
