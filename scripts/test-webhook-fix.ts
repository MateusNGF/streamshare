
import { prisma } from "../src/lib/db";
import { PLANS_LIST } from "../src/config/plans";
import { PlanoConta } from "@prisma/client";

// Mock Stripe event structure
interface MockStripeEvent {
    type: string;
    data: {
        object: {
            id: string;
            status: string;
            items: {
                data: Array<{
                    price: {
                        id: string;
                    };
                }>;
            };
        };
    };
}

// We need to access the logic inside the POST handler.
// Since we can't easily import the POST function and mock the request object in this simple script without running a server,
// we will replicate the *logic* we want to test to ensure it works as expected against the DB.

async function testWebhookLogic() {
    console.log("Starting Webhook Logic Verification...");

    // 1. Setup: Create a dummy account with Basic plan
    const testEmail = `test-webhook-${Date.now()}@example.com`;
    // Create account directly
    const conta = await prisma.conta.create({
        data: {
            plano: "basico",
            email: testEmail,
            limiteGrupos: 1,
            stripeSubscriptionId: "sub_test_123",
            stripeSubscriptionStatus: "active"
        }
    });

    console.log(`Created test account: ${conta.id} with plan ${conta.plano}`);

    try {
        // 2. Simulate the logic from the webhook
        const subscriptionId = "sub_test_123";
        const newStatus = "active";

        // Find the PRO plan price ID
        const proPlan = PLANS_LIST.find(p => p.id === "pro");
        if (!proPlan || !proPlan.stripePriceId) {
            throw new Error("Pro plan configuration or Stripe Price ID not found");
        }
        const newPriceId = proPlan.stripePriceId;

        console.log(`Simulating upgrade to PRO with price ID: ${newPriceId}`);

        // This is the EXACT logic we added to the webhook
        const account = await prisma.conta.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
        });

        if (account) {
            const priceId = newPriceId;
            const planConfig = PLANS_LIST.find(p => p.stripePriceId === priceId);

            await prisma.$transaction(async (tx) => {
                await tx.conta.update({
                    where: { id: account.id },
                    data: {
                        stripeSubscriptionStatus: newStatus,
                        ...(planConfig && {
                            plano: planConfig.id,
                            limiteGrupos: planConfig.maxGrupos
                        })
                    },
                });

                if (planConfig) {
                    await tx.notificacao.create({
                        data: {
                            contaId: account.id,
                            tipo: "plano_alterado",
                            titulo: "Plano Alterado",
                            descricao: `Seu plano foi alterado para ${planConfig.label}.`,
                            metadata: { plano: planConfig.id, subscriptionId: subscriptionId }
                        }
                    });
                }
            });
        }

        // 3. Verify: Check if account is now PRO
        const updatedAccount = await prisma.conta.findUnique({
            where: { id: conta.id }
        });

        if (updatedAccount?.plano === "pro" && updatedAccount.limiteGrupos === proPlan.maxGrupos) {
            console.log("SUCCESS: Account upgraded to PRO correctly.");
        } else {
            console.error("FAILURE: Account did not upgrade.", updatedAccount);
        }

        // 4. Verify: Check if notification was created
        const notification = await prisma.notificacao.findFirst({
            where: {
                contaId: conta.id,
                tipo: "plano_alterado"
            }
        });

        if (notification) {
            console.log("SUCCESS: Notification created correctly.", notification.descricao);
        } else {
            console.error("FAILURE: Notification not created.");
        }

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        // Cleanup
        // Delete notification first due to FK
        await prisma.notificacao.deleteMany({ where: { contaId: conta.id } });
        await prisma.conta.delete({ where: { id: conta.id } });
        console.log("Cleanup: Test account and notifications deleted.");
    }
}

testWebhookLogic();
