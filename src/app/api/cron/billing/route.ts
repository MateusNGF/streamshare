import { NextRequest } from "next/server";
import { billingService } from "@/services/billing-service";
import { checkAndNotifyOverdueBillings, checkAndNotifyPendingBillings } from "@/cron/check-billing-notifications";

/**
 * Billing Cron Endpoint
 *
 * Protected by CRON_SECRET header.
 * Configure in Vercel Cron (vercel.json) to run daily:
 *
 * {
 *   "crons": [{ "path": "/api/cron/billing", "schedule": "0 8 * * *" }]
 * }
 *
 * Or call with: curl -H "Authorization: Bearer {CRON_SECRET}" https://yourapp.com/api/cron/billing
 */
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        console.error('[CRON_BILLING] CRON_SECRET not configured');
        return Response.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.info('[CRON_BILLING] Starting billing cycle...');

        // 1. Process renewals and update overdue statuses (Critical Step)
        console.info('[CRON_BILLING] Step 1: Processing renewals and overdue status updates...');
        const renewalResult = await billingService.processarRenovacoes();
        console.info(`[CRON_BILLING] Renewals completed: ${JSON.stringify(renewalResult)}`);

        // 2. Notify about upcoming expirations
        console.info('[CRON_BILLING] Step 2: Checking for pending billing notifications...');
        await checkAndNotifyPendingBillings();

        // 3. Notify about overdue billings
        console.info('[CRON_BILLING] Step 3: Checking for overdue billing notifications...');
        await checkAndNotifyOverdueBillings();

        console.info('[CRON_BILLING] Cycle completed successfully');
        return Response.json({
            success: true,
            data: {
                renewal: renewalResult,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('[CRON_BILLING] Error:', error);
        return Response.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
