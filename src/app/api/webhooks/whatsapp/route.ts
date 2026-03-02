import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Webhook validation for Meta App Dashboard
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // The verify token configured in the Meta App Dashboard
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === "subscribe" && token === verifyToken) {
        console.log("WEBHOOK_VERIFIED");
        // Must respond with the challenge string exactly as text (not JSON)
        return new NextResponse(challenge, { status: 200 });
    } else {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Verifies if it's a WhatsApp API event
        if (body.object !== "whatsapp_business_account") {
            return NextResponse.json({ success: false, error: "Invalid object" }, { status: 404 });
        }

        for (const entry of body.entry) {
            for (const change of entry.changes) {
                const value = change.value;

                // Message Status Updates (sent, delivered, read, failed)
                if (value.statuses && value.statuses.length > 0) {
                    for (const status of value.statuses) {
                        const { id: providerId, status: eventStatus, timestamp, errors } = status;

                        const eventDate = new Date(parseInt(timestamp) * 1000);

                        const updateData: any = {};
                        if (eventStatus === 'sent') {
                            updateData.statusEntrega = 'sent';
                        } else if (eventStatus === 'delivered') {
                            updateData.statusEntrega = 'delivered';
                            updateData.deliveredAt = eventDate;
                        } else if (eventStatus === 'read') {
                            updateData.statusEntrega = 'read';
                            updateData.readAt = eventDate;
                        } else if (eventStatus === 'failed') {
                            updateData.statusEntrega = 'failed';
                            updateData.erro = errors ? JSON.stringify(errors) : "Falha na entrega reportada pelo Webhook";
                        }

                        if (providerId) {
                            // Can be updateMany in case there's duplicates, but typically providerId is unique
                            await prisma.whatsAppLog.updateMany({
                                where: { providerId },
                                data: updateData
                            });
                            console.log(`[WHATSAPP WEBHOOK] Status atualizado: ${providerId} -> ${eventStatus}`);
                        }
                    }
                }

                // Inbound Messages (Opt-outs, Replies)
                if (value.messages && value.messages.length > 0) {
                    for (const message of value.messages) {
                        const from = message.from;
                        if (message.type === "text" && message.text) {
                            const bodyText = message.text.body.trim().toLowerCase();

                            // Here we could implement opt-out logic depending on business needs
                            // Like if bodyText === 'sair' update user config

                            console.log(`[WHATSAPP WEBHOOK] Nova mensagem recebida de: ${from} | Msg: ${bodyText}`);
                        }
                    }
                }
            }
        }

        // Must respond 200 OK relatively fast so Meta doesn't retry
        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error: any) {
        console.error("[WHATSAPP WEBHOOK ERROR]", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
